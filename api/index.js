import { connectDB } from './backend/src/config/db.js'
import app from './backend/src/app.js'

export default async function handler(req, res) {
  try {
    await connectDB()
  } catch (err) {
    console.error('Database connection error in serverless handler:', err)
    return res.status(503).json({
      error: 'Database connection failed. Please verify MONGODB_URI and MongoDB Atlas Network Access (allow 0.0.0.0/0).',
      details: err.message,
    })
  }
  return app(req, res)
}
