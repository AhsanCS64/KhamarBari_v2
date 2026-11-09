import app from './app.js'
import { connectDB } from './config/db.js'

export default async function vercelHandler(req, res) {
  try {
    await connectDB()
  } catch (error) {
    console.error('✗ MongoDB unavailable for request:', error)
    return res.status(503).json({ error: 'Database unavailable' })
  }

  return app(req, res)
}
