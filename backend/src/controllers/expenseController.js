import { z } from 'zod'
import { Expense } from '../models/Expense.js'

const createSchema = z.object({
  title: z.string().min(2),
  category: z.string().min(1),
  amount: z.coerce.number().positive(),
  date: z.string().min(1),
  paymentMethod: z.string().optional(),
  paidBy: z.string().optional(),
  supplier: z.string().optional(),
  description: z.string().optional(),
  receipt: z.string().optional().nullable(),
  branchId: z.string().optional().nullable(),
})

const updateSchema = createSchema.partial()

// GET /api/expenses
export async function listExpenses(req, res, next) {
  try {
    const { branchId, category, dateFrom, dateTo, search } = req.query
    const filter = { farmId: req.user.farmId }

    if (req.user.role === 'manager' && req.user.branchId) {
      filter.branchId = req.user.branchId
    } else if (branchId) {
      filter.branchId = branchId
    }

    if (category) filter.category = category
    if (dateFrom || dateTo) {
      filter.date = {}
      if (dateFrom) filter.date.$gte = dateFrom
      if (dateTo) filter.date.$lte = dateTo
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { supplier: { $regex: search, $options: 'i' } },
        { paidBy: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ]
    }

    const expenses = await Expense.find(filter).sort({ date: -1 })
    res.json({ expenses })
  } catch (err) {
    next(err)
  }
}

// POST /api/expenses
export async function createExpense(req, res, next) {
  try {
    const data = createSchema.parse(req.body)
    const expense = await Expense.create({
      farmId: req.user.farmId,
      ...data,
    })
    res.status(201).json({ expense })
  } catch (err) {
    next(err)
  }
}

// PATCH /api/expenses/:id
export async function updateExpense(req, res, next) {
  try {
    const data = updateSchema.parse(req.body)
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, farmId: req.user.farmId },
      data,
      { new: true, runValidators: true }
    )
    if (!expense) return res.status(404).json({ error: 'Expense not found' })
    res.json({ expense })
  } catch (err) {
    next(err)
  }
}

// DELETE /api/expenses/:id
export async function deleteExpense(req, res, next) {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id, farmId: req.user.farmId,
    })
    if (!expense) return res.status(404).json({ error: 'Expense not found' })
    res.json({ message: 'Expense deleted' })
  } catch (err) {
    next(err)
  }
}