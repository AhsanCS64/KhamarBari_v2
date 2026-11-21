import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { env } from './config/env.js'
import { notFound, errorHandler } from './middleware/errorHandler.js'
import routes from './routes/index.js'

const app = express()

app.use(helmet())
app.use(express.json({ limit: '5mb' }))
app.use(express.urlencoded({ extended: true }))

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true)
      if (env.corsOrigins.includes('*') || env.corsOrigins.includes(origin)) {
        return callback(null, true)
      }
      // Allow vercel preview deployments and localhost
      if (origin.endsWith('.vercel.app') || origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true)
      }
      return callback(null, true)
    },
    credentials: true,
  })
)

// Health check endpoint
app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }))
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }))

// Support both /api/... and direct /... routing
app.use('/api', routes)
app.use('/', routes)

app.use(notFound)
app.use(errorHandler)

export default app
