import { Router } from 'express'
import { listSales, createSale, updateSale, deleteSale } from '../controllers/saleController.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)
router.get('/', listSales)
router.post('/', requireRole('owner', 'admin', 'manager'), createSale)
router.patch('/:id', requireRole('owner', 'admin', 'manager'), updateSale)
router.delete('/:id', requireRole('owner', 'admin'), deleteSale)
export default router