import { Router } from 'express'
import {
  listExpenses, createExpense, updateExpense, deleteExpense
} from '../controllers/expenseController.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = Router()

router.use(requireAuth)

router.get('/', listExpenses)
router.post('/', requireRole('owner', 'admin', 'manager'), createExpense)
router.patch('/:id', requireRole('owner', 'admin', 'manager'), updateExpense)
router.delete('/:id', requireRole('owner', 'admin'), deleteExpense)

export default router