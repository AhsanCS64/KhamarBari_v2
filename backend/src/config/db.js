
import mongoose from 'mongoose'
import { env } from './env.js'

let connectionPromise = null

export async function connectDB() {
  mongoose.set('strictQuery', true)

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(env.mongodbUri, {
      serverSelectionTimeoutMS: 15000,
      maxPoolSize: 10,
    })
  }

  try {
    await connectionPromise
    console.log(
      `✓ MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`
    )
    return mongoose.connection
  } catch (err) {
    connectionPromise = null
    console.error('✗ MongoDB connection failed:', err)
    throw err
  }
}

mongoose.connection.on('disconnected', () => {
  console.warn('⚠ MongoDB disconnected')
})

mongoose.connection.on('error', (err) => {
  console.error('✗ MongoDB error:', err)
})
