import { verifyToken } from '../utils/jwt.js'
import { User } from '../models/User.js'

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || ''
    if (!header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid Authorization header' })
    }
    const token = header.slice(7)
    const payload = verifyToken(token)

    const user = await User.findById(payload.userId)
    if (!user || user.status !== 'active') {
      return res.status(401).json({ error: 'User not found or inactive' })
    }

    req.user = user
    req.farmId = user.farmId
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Authentication failed', detail: err.message })
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' })
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: `Requires one of: ${roles.join(', ')}` })
    }
    next()
  }
}