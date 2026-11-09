import { Router } from 'express'
import {
  listInventory, createInventory, updateInventory, deleteInventory, listMovements, recordMovement,
} from '../controllers/inventoryController.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)
router.get('/', listInventory)
router.get('/movements', listMovements)
router.post('/movements', requireRole('owner', 'admin', 'manager'), recordMovement)
router.post('/', requireRole('owner', 'admin', 'manager'), createInventory)
router.patch('/:id', requireRole('owner', 'admin', 'manager'), updateInventory)
router.delete('/:id', requireRole('owner', 'admin'), deleteInventory)
export default router