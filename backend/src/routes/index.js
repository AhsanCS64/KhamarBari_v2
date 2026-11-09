import { Router } from 'express'
import authRoutes from './authRoutes.js'
import branchRoutes from './branchRoutes.js'
import animalRoutes from './animalRoutes.js'
import expenseRoutes from './expenseRoutes.js'
import saleRoutes from './saleRoutes.js'
import productionRoutes from './productionRoutes.js'
import inventoryRoutes from './inventoryRoutes.js'
import utilityRoutes from './utilityRoutes.js'
import workerRoutes from './workerRoutes.js'
import farmRoutes from './farmRoutes.js'
import enclosureRoutes from './enclosureRoutes.js'

const router = Router()

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

router.use('/auth', authRoutes)
router.use('/farms', farmRoutes)
router.use('/enclosures', enclosureRoutes)
router.use('/branches', branchRoutes)
router.use('/animals', animalRoutes)
router.use('/expenses', expenseRoutes)
router.use('/sales', saleRoutes)
router.use('/production', productionRoutes)
router.use('/inventory', inventoryRoutes)
router.use('/utilities', utilityRoutes)
router.use('/workers', workerRoutes)

export default router