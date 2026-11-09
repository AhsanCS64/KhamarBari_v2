import mongoose from 'mongoose'
import { env } from './env.js'

<<<<<<< HEAD
export async function connectDB() {
  try {
    mongoose.set('strictQuery', true)
    await mongoose.connect(env.mongodbUri, {
=======
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
>>>>>>> parent of 6d150e6 (Vercel)
      serverSelectionTimeoutMS: 10000,
    })
    const { host, name } = mongoose.connection
    console.log(`✓ MongoDB connected: ${host}/${name}`)
  } catch (err) {
    console.error('✗ MongoDB connection failed:', err.message)
    process.exit(1)
  }

<<<<<<< HEAD
  mongoose.connection.on('disconnected', () => {
    console.warn('⚠ MongoDB disconnected')
  })
  mongoose.connection.on('reconnected', () => {
    console.log('✓ MongoDB reconnected')
  })
=======
  return connectionPromise
>>>>>>> parent of 6d150e6 (Vercel)
}