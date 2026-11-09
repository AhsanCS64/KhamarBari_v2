import mongoose from 'mongoose'
import { env } from './env.js'

let connectionPromise

mongoose.connection.on('disconnected', () => {
  console.warn('⚠ MongoDB disconnected')
})

mongoose.connection.on('reconnected', () => {
  console.log('✓ MongoDB reconnected')
})

export function connectDB() {
  if (mongoose.connection.readyState === 1) return Promise.resolve()
  if (connectionPromise) return connectionPromise

  mongoose.set('strictQuery', true)
  connectionPromise = mongoose
    .connect(env.mongodbUri, {
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 10,
    })
    .then(() => {
      const { host, name } = mongoose.connection
      console.log(`✓ MongoDB connected: ${host}/${name}`)
    })
    .catch((error) => {
      console.error('✗ MongoDB connection failed:', error.message)
      throw error
    })
    .finally(() => {
      connectionPromise = undefined
    })

  return connectionPromise
}