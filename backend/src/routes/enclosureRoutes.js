import { Router } from 'express'
import { createEnclosure, deleteEnclosure, listEnclosures, updateEnclosure } from '../controllers/enclosureController.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)
router.get('/', listEnclosures)
router.post('/', requireRole('owner', 'admin', 'manager'), createEnclosure)
router.patch('/:id', requireRole('owner', 'admin', 'manager'), updateEnclosure)
router.delete('/:id', requireRole('owner', 'admin'), deleteEnclosure)
export default router
