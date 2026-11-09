
import mongoose from 'mongoose'
import { env } from './env.js'

<<<<<<< HEAD
let connectionPromise

=======
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

>>>>>>> c5748f7d053bc777c26c9b190e5663f302ab6186
mongoose.connection.on('disconnected', () => {
  console.warn('⚠ MongoDB disconnected')
})

<<<<<<< HEAD
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
=======
mongoose.connection.on('error', (err) => {
  console.error('✗ MongoDB error:', err)
})
>>>>>>> c5748f7d053bc777c26c9b190e5663f302ab6186
