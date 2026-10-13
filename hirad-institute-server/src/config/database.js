import mongoose from 'mongoose'

const readyStateLabels = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
}

const redactCredentials = (message = '') =>
  String(message).replace(/\/\/([^/\s@]+)@/g, '//[redacted]@')

export const getDatabaseStatus = () =>
  readyStateLabels[mongoose.connection.readyState] ?? 'unknown'

export const connectDatabase = async (uri) => {
  if (!uri) {
    console.error('MongoDB is not connected: MONGODB_URI is not set.')
    return false
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    })
    console.log('MongoDB connected.')
    return mongoose.connection.readyState === 1
  } catch (error) {
    console.error(`MongoDB connection failed: ${redactCredentials(error.message)}`)
    return false
  }
}

export const disconnectDatabase = async () => {
  if (mongoose.connection.readyState === 0) return
  await mongoose.disconnect()
}
