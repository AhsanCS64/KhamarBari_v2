import { Router } from 'express'
import {
  listBranches, getBranch, createBranch, updateBranch, archiveBranch
} from '../controllers/branchController.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = Router()

router.use(requireAuth) // All routes require auth

router.get('/', listBranches)
router.get('/:id', getBranch)

// Only owners and admins can modify branches
router.post('/', requireRole('owner', 'admin'), createBranch)
router.patch('/:id', requireRole('owner', 'admin'), updateBranch)
router.delete('/:id', requireRole('owner', 'admin'), archiveBranch)

export default router