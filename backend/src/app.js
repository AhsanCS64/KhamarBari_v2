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
    origin: env.corsOrigins,
    credentials: true,
  })
)

app.use('/api', routes)

app.use(notFound)
app.use(errorHandler)

export default app