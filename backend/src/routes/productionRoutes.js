import { Router } from 'express'
import { listProduction, createProduction, updateProduction, deleteProduction } from '../controllers/productionController.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)
router.get('/', listProduction)
router.post('/', requireRole('owner', 'admin', 'manager'), createProduction)
router.patch('/:id', requireRole('owner', 'admin', 'manager'), updateProduction)
router.delete('/:id', requireRole('owner', 'admin'), deleteProduction)
export default router