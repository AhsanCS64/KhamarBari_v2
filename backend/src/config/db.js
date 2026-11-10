import mongoose from 'mongoose'
import { env } from './env.js'

let connectionPromise

mongoose.connection.on('disconnected', () => {
  connectionPromise = undefined
  console.warn('⚠ MongoDB disconnected')
})

mongoose.connection.on('reconnected', () => {
  console.log('✓ MongoDB reconnected')
})

export async function connectDB() {
  if (mongoose.connection.readyState === 1) return

  if (!connectionPromise) {
    mongoose.set('strictQuery', true)
    connectionPromise = mongoose
      .connect(env.mongodbUri, {
        serverSelectionTimeoutMS: 10000,
      })
      .then(() => {
        const { host, name } = mongoose.connection
        console.log(`✓ MongoDB connected: ${host}/${name}`)
      })
      .catch((err) => {
        connectionPromise = undefined
        console.error('✗ MongoDB connection failed:', err.message)
        throw err
      })
  }


  await connectionPromise
}