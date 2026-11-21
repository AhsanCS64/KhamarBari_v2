import mongoose from 'mongoose'
import { env } from './env.js'

let cached = global.mongoose
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

mongoose.connection.on('disconnected', () => {
  if (cached) {
    cached.conn = null
    cached.promise = null
  }
  console.warn('⚠ MongoDB disconnected')
})

mongoose.connection.on('reconnected', () => {
  console.log('✓ MongoDB reconnected')
})

export async function connectDB() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    if (!env.mongodbUri) {
      throw new Error('MONGODB_URI is not defined in environment variables')
    }

    mongoose.set('strictQuery', true)
    cached.promise = mongoose
      .connect(env.mongodbUri, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 10000,
        maxPoolSize: 10,
      })
      .then((m) => {
        const { host, name } = m.connection
        console.log(`✓ MongoDB connected: ${host}/${name}`)
        return m
      })
      .catch((err) => {
        cached.promise = null
        console.error('✗ MongoDB connection failed:', err.message)
        throw err
      })
  }

  cached.conn = await cached.promise
  return cached.conn
}
