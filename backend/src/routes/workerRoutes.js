import { Router } from 'express'
import { listWorkers, createWorker, updateWorker, deleteWorker } from '../controllers/workerController.js'
import { requireAuth, requireRole } from '../middleware/auth.js'
import {
  deletePayment, listAttendance, listPayments, markAttendance, recordPayment,
} from '../controllers/workerRecordController.js'

const router = Router()
router.use(requireAuth)
router.get('/', listWorkers)
router.get('/attendance', listAttendance)
router.post('/attendance', requireRole('owner', 'admin', 'manager'), markAttendance)
router.get('/payments', listPayments)
router.post('/payments', requireRole('owner', 'admin', 'manager'), recordPayment)
router.delete('/payments/:id', requireRole('owner', 'admin', 'manager'), deletePayment)
router.post('/', requireRole('owner', 'admin', 'manager'), createWorker)
router.patch('/:id', requireRole('owner', 'admin', 'manager'), updateWorker)
router.delete('/:id', requireRole('owner', 'admin'), deleteWorker)
export default router