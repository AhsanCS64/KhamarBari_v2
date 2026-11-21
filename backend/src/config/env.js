import dotenv from 'dotenv'
dotenv.config()

const required = ['MONGODB_URI', 'JWT_SECRET']
const missing = required.filter((k) => !process.env[k])

if (missing.length > 0) {
  console.warn(`⚠ Missing required env vars: ${missing.join(', ')}`)
  console.warn('  Ensure MONGODB_URI and JWT_SECRET are set in environment settings.')
  if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    console.warn('  Copy .env.example → .env and fill in the values for local standalone dev.')
  }
}

export const env = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || '',
  jwtSecret: process.env.JWT_SECRET || 'khamarbari_dev_secret_fallback',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  isProd: process.env.NODE_ENV === 'production',
}
