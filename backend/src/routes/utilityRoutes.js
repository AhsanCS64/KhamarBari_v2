import { Router } from 'express'
import { listUtilities, createUtility, updateUtility, deleteUtility } from '../controllers/utilityController.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)
router.get('/', listUtilities)
router.post('/', requireRole('owner', 'admin', 'manager'), createUtility)
router.patch('/:id', requireRole('owner', 'admin', 'manager'), updateUtility)
router.delete('/:id', requireRole('owner', 'admin'), deleteUtility)
export default router