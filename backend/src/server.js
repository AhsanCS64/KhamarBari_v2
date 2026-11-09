import { env } from './config/env.js'
import { connectDB } from './config/db.js'
import app from './app.js'

async function start() {
  await connectDB()

  const server = app.listen(env.port, () => {
    console.log(`✓ Server running on http://localhost:${env.port}`)
    console.log(`✓ Environment: ${env.nodeEnv}`)
    console.log(`✓ CORS allowed: ${env.corsOrigins.join(', ')}`)
  })

  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down...')
    server.close(() => process.exit(0))
  })
}

start().catch((err) => {
  console.error('✗ Fatal startup error:', err)
  process.exit(1)
})