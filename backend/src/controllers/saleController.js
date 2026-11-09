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
    const stockError = await checkProductionStock({
      farmId: req.user.farmId,
      branchId: data.branchId,
      itemType: data.itemType,
      quantity: data.quantity,
    })
    if (stockError) return res.status(409).json({ error: stockError })
    if (data.itemType === 'animal' && data.animalId) {
      const animalFilter = scopeToManagerBranch({ _id: data.animalId, farmId: req.user.farmId, status: 'active' }, req.user)
      const animal = await Animal.findOne(animalFilter)
      if (!animal) return res.status(409).json({ error: 'Animal is not available for sale' })
    }
    const total = data.quantity * data.unitPrice
    const paidAmount = data.paymentStatus === 'paid' ? total : (data.paidAmount || 0)
    const outstanding = Math.max(0, total - paidAmount)
    
    const invoiceNo = `INV-${Date.now().toString().slice(-8)}`

    const sale = await Sale.create({
      farmId: req.user.farmId,
      invoiceNo,
      ...data,
      total,
      paidAmount,
      outstanding,
    })

    // Link animal sale
    if (data.itemType === 'animal' && data.animalId) {
      const animal = await Animal.findOneAndUpdate(
        scopeToManagerBranch({ _id: data.animalId, farmId: req.user.farmId, status: 'active' }, req.user),
        { status: 'sold' },
        { new: true }
      )
      if (!animal) {
        await sale.deleteOne()
        return res.status(409).json({ error: 'Animal is not available for sale' })
      }
      if (animal.enclosureId) {
        await Enclosure.updateOne(
          { _id: animal.enclosureId, farmId: req.user.farmId, occupied: { $gt: 0 } },
          { $inc: { occupied: -1 } }
        )
      }
    }

    res.status(201).json({ sale })
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
    
    // Revert animal status if applicable
    if (sale.itemType === 'animal' && sale.animalId) {
      const animal = await Animal.findOneAndUpdate(
        scopeToManagerBranch({ _id: sale.animalId, farmId: req.user.farmId, status: 'sold' }, req.user),
        { status: 'active' },
        { new: true }
      )
      if (animal?.enclosureId) {
        await Enclosure.updateOne(
          { _id: animal.enclosureId, farmId: req.user.farmId },
          { $inc: { occupied: 1 } }
        )
      }
    }
    res.json({ message: 'Sale deleted' })
  } catch (err) { next(err) }
}