import mongoose from 'mongoose'
import { env } from './env.js'

export async function connectDB() {
  try {
    mongoose.set('strictQuery', true)
    await mongoose.connect(env.mongodbUri, {
      serverSelectionTimeoutMS: 10000,
    })
    const { host, name } = mongoose.connection
    console.log(`✓ MongoDB connected: ${host}/${name}`)
  } catch (err) {
    console.error('✗ MongoDB connection failed:', err.message)
    process.exit(1)
  }

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠ MongoDB disconnected')
  })
  mongoose.connection.on('reconnected', () => {
    console.log('✓ MongoDB reconnected')
  })
}