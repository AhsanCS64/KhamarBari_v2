import { Router } from 'express'
import { updateCurrentFarm } from '../controllers/farmController.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = Router()
router.patch('/current', requireAuth, requireRole('owner', 'admin'), updateCurrentFarm)
export default router
