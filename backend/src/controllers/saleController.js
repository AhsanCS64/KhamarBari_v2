import { z } from 'zod'
import { Sale } from '../models/Sale.js'
import { Animal } from '../models/Animal.js'
import { Enclosure } from '../models/Enclosure.js'
import { Production } from '../models/Production.js'

const PRODUCTION_BACKED_ITEMS = new Set([
  'beef', 'mutton', 'chicken_meat', 'fish', 'milk', 'egg', 'harvest', 'meat',
])

function scopeToManagerBranch(filter, user) {
  if (user.role === 'manager' && user.branchId) filter.branchId = user.branchId
  return filter
}

async function checkProductionStock({ farmId, branchId, itemType, quantity, ignoreSaleId }) {
  if (!PRODUCTION_BACKED_ITEMS.has(itemType)) return null

  const productionFilter = { farmId }
  const salesFilter = { farmId, itemType }
  if (branchId) {
    productionFilter.branchId = branchId
    salesFilter.branchId = branchId
  }

  let productionQuery
  if (itemType === 'milk' || itemType === 'egg') {
    productionQuery = { ...productionFilter, type: itemType }
  } else if (itemType === 'fish') {
    productionQuery = {
      ...productionFilter,
      $or: [
        { type: 'slaughter', meatType: itemType },
        { type: 'harvest', meatType: itemType },
      ],
    }
  } else if (itemType === 'harvest') {
    productionQuery = {
      ...productionFilter,
      type: 'harvest',
      $or: [{ meatType: null }, { meatType: '' }],
    }
  } else {
    productionQuery = { ...productionFilter, type: 'slaughter', meatType: itemType }
  }

  if (ignoreSaleId) salesFilter._id = { $ne: ignoreSaleId }
  const [production, sales] = await Promise.all([
    Production.find(productionQuery).select('quantity meatYieldKg meatType type'),
    Sale.find(salesFilter).select('quantity'),
  ])
  const produced = production.reduce((sum, record) => {
    const quantityProduced = record.type === 'slaughter'
      ? Number(record.meatYieldKg || 0)
      : Number(record.quantity || 0)
    return sum + quantityProduced
  }, 0)
  const sold = sales.reduce((sum, sale) => sum + Number(sale.quantity || 0), 0)
  const available = Math.max(0, produced - sold)
  return Number(quantity) <= available
    ? null
    : `Only ${available} units are available from recorded production`
}

const createSchema = z.object({
  itemType: z.string().min(1),
  animalId: z.string().optional().nullable(),
  enclosureId: z.string().optional().nullable(),
  description: z.string().optional(),
  date: z.string().min(1),
  quantity: z.coerce.number().positive(),
  unit: z.string().min(1),
  unitPrice: z.coerce.number().nonnegative(),
  paidAmount: z.coerce.number().nonnegative().optional(),
  buyer: z.string().min(2),
  buyerContact: z.string().optional(),
  paymentStatus: z.enum(['paid', 'partial', 'unpaid']).optional(),
  paymentMethod: z.string().optional(),
  notes: z.string().optional(),
  branchId: z.string().optional().nullable(),
})

async function adjustEnclosureOccupancy(enclosureId, delta, user, branchId) {
  if (!enclosureId || !delta) return true

  const filter = scopeToManagerBranch({ _id: enclosureId, farmId: user.farmId }, user)
  if (branchId) filter.branchId = branchId
  if (delta < 0) filter.occupied = { $gte: Math.abs(delta) }

  const result = await Enclosure.updateOne(filter, { $inc: { occupied: delta } })
  return result.modifiedCount === 1
}

export async function listSales(req, res, next) {
  try {
    const { branchId, itemType, paymentStatus, dateFrom, dateTo, search } = req.query
    const filter = { farmId: req.user.farmId }
    if (req.user.role === 'manager' && req.user.branchId) filter.branchId = req.user.branchId
    else if (branchId) filter.branchId = branchId

    if (itemType) filter.itemType = itemType
    if (paymentStatus) filter.paymentStatus = paymentStatus
    if (dateFrom || dateTo) {
      filter.date = {}
      if (dateFrom) filter.date.$gte = dateFrom
      if (dateTo) filter.date.$lte = dateTo
    }
    if (search) {
      filter.$or = [
        { buyer: { $regex: search, $options: 'i' } },
        { buyerContact: { $regex: search, $options: 'i' } },
        { invoiceNo: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
      ]
    }

    const sales = await Sale.find(filter).sort({ date: -1 })
    res.json({ sales })
  } catch (err) { next(err) }
}

export async function createSale(req, res, next) {
  try {
    const data = createSchema.parse(req.body)
    if (req.user.role === 'manager' && req.user.branchId) {
      if (data.branchId && data.branchId !== req.user.branchId.toString()) {
        return res.status(403).json({ error: 'You can only record sales for your assigned branch' })
      }
      data.branchId = req.user.branchId.toString()
    }
    data.branchId = data.branchId || null
    data.animalId = data.animalId || null
    data.enclosureId = data.enclosureId || null
    let animal = null
    let enclosure = null
    let occupancyEnclosureId = null

    if (data.itemType === 'animal') {
      if (!Number.isInteger(data.quantity)) {
        return res.status(400).json({ error: 'Live animal quantity must be a whole number' })
      }

      if (data.enclosureId) {
        const enclosureFilter = scopeToManagerBranch({
          _id: data.enclosureId,
          farmId: req.user.farmId,
        }, req.user)
        if (data.branchId) enclosureFilter.branchId = data.branchId
        enclosure = await Enclosure.findOne(enclosureFilter)
        if (!enclosure) return res.status(404).json({ error: 'Enclosure not found' })
        if (!data.branchId && enclosure.branchId) data.branchId = enclosure.branchId.toString()
      }

      if (data.animalId) {
        if (data.quantity !== 1) {
          return res.status(400).json({ error: 'A sale linked to an individual animal must have quantity 1' })
        }
        animal = await Animal.findOne(scopeToManagerBranch({
          _id: data.animalId,
          farmId: req.user.farmId,
          status: 'active',
        }, req.user))
        if (!animal) return res.status(409).json({ error: 'Animal is not available for sale' })
        if (data.enclosureId && animal.enclosureId?.toString() !== data.enclosureId) {
          return res.status(409).json({ error: 'Selected animal does not belong to this enclosure' })
        }
        occupancyEnclosureId = animal.enclosureId?.toString() || null
        data.enclosureId = occupancyEnclosureId
      } else {
        occupancyEnclosureId = data.enclosureId || null
      }
    } else {
      data.animalId = null
      data.enclosureId = null
    }

    const stockError = await checkProductionStock({
      farmId: req.user.farmId,
      branchId: data.branchId,
      itemType: data.itemType,
      quantity: data.quantity,
    })
    if (stockError) return res.status(409).json({ error: stockError })

    if (occupancyEnclosureId) {
      const adjusted = await adjustEnclosureOccupancy(
        occupancyEnclosureId,
        -(data.animalId ? 1 : data.quantity),
        req.user,
        data.branchId
      )
      if (!adjusted) {
        return res.status(409).json({ error: 'The enclosure does not have enough occupied animals for this sale' })
      }
    }
    const total = data.quantity * data.unitPrice
    const paidAmount = data.paymentStatus === 'paid' ? total : (data.paidAmount || 0)
    const outstanding = Math.max(0, total - paidAmount)
    
    const invoiceNo = `INV-${Date.now().toString().slice(-8)}`

    let animalMarkedSold = false
    try {
      if (animal) {
        const updatedAnimal = await Animal.findOneAndUpdate(
          scopeToManagerBranch({ _id: animal._id, farmId: req.user.farmId, status: 'active' }, req.user),
          { status: 'sold' },
          { new: true }
        )
        if (!updatedAnimal) {
          if (occupancyEnclosureId) {
            await adjustEnclosureOccupancy(occupancyEnclosureId, 1, req.user, data.branchId)
          }
          return res.status(409).json({ error: 'Animal is not available for sale' })
        }
        animalMarkedSold = true
      }

      const sale = await Sale.create({
        farmId: req.user.farmId,
        invoiceNo,
        ...data,
        total,
        paidAmount,
        outstanding,
      })

      res.status(201).json({ sale })
    } catch (error) {
      if (animalMarkedSold) {
        await Animal.updateOne({ _id: animal._id, farmId: req.user.farmId }, { status: 'active' })
      }
      if (occupancyEnclosureId) {
        await adjustEnclosureOccupancy(
          occupancyEnclosureId,
          data.animalId ? 1 : data.quantity,
          req.user,
          data.branchId
        )
      }
      throw error
    }
  } catch (err) { next(err) }
}

export async function updateSale(req, res, next) {
  try {
    const data = createSchema.partial().parse(req.body)
    
    const filter = scopeToManagerBranch({ _id: req.params.id, farmId: req.user.farmId }, req.user)
    if (req.user.role === 'manager' && req.user.branchId) {
      if (data.branchId && data.branchId.toString() !== req.user.branchId.toString()) {
        return res.status(403).json({ error: 'You can only update sales for your assigned branch' })
      }
      data.branchId = req.user.branchId.toString()
    }
    const existing = await Sale.findOne(filter)
    if (!existing) return res.status(404).json({ error: 'Sale not found' })

    const quantity = data.quantity ?? existing.quantity
    const itemType = data.itemType ?? existing.itemType
    const unitPrice = data.unitPrice ?? existing.unitPrice
    const total = quantity * unitPrice
    const paidAmount = data.paidAmount ?? existing.paidAmount
    const outstanding = Math.max(0, total - paidAmount)
    const stockError = await checkProductionStock({
      farmId: req.user.farmId,
      branchId: data.branchId ?? existing.branchId,
      itemType,
      quantity,
      ignoreSaleId: existing._id,
    })
    if (stockError) return res.status(409).json({ error: stockError })

    const sale = await Sale.findOneAndUpdate(
      filter,
      { ...data, total, paidAmount, outstanding },
      { new: true, runValidators: true }
    )
    res.json({ sale })
  } catch (err) { next(err) }
}

export async function deleteSale(req, res, next) {
  try {
    const filter = scopeToManagerBranch({ _id: req.params.id, farmId: req.user.farmId }, req.user)
    const sale = await Sale.findOneAndDelete(filter)
    if (!sale) return res.status(404).json({ error: 'Sale not found' })
    
    if (sale.itemType === 'animal') {
      let animal = null
      if (sale.animalId) {
        animal = await Animal.findOneAndUpdate(
          scopeToManagerBranch({ _id: sale.animalId, farmId: req.user.farmId, status: 'sold' }, req.user),
          { status: 'active' },
          { new: true }
        )
      }
      const enclosureId = sale.enclosureId || animal?.enclosureId
      const quantityToRestore = sale.animalId ? 1 : sale.quantity
      if (enclosureId) {
        await adjustEnclosureOccupancy(enclosureId, quantityToRestore, req.user, sale.branchId)
      }
    }
    res.json({ message: 'Sale deleted' })
  } catch (err) { next(err) }
}