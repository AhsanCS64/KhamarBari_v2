import { Router } from 'express'
import {
  listAnimals, createAnimal, updateAnimal, deleteAnimal
} from '../controllers/animalController.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = Router()

router.use(requireAuth)

router.get('/', listAnimals)
router.post('/', requireRole('owner', 'admin', 'manager'), createAnimal)
router.patch('/:id', requireRole('owner', 'admin', 'manager'), updateAnimal)
router.delete('/:id', requireRole('owner', 'admin'), deleteAnimal)

export default router