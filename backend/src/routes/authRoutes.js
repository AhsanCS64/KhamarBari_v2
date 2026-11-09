import { Router } from 'express'
import { register, login, me, updateMe, changeMyPassword } from '../controllers/authController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.post('/register', register)
router.post('/login', login)
router.get('/me', requireAuth, me)
router.patch('/me', requireAuth, updateMe)
router.patch('/me/password', requireAuth, changeMyPassword)

export default router