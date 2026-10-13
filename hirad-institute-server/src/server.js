import dotenv from 'dotenv'
import { createApp } from './app.js'
import { connectDatabase, disconnectDatabase, getDatabaseStatus } from './config/database.js'
import { readConfig } from './config/env.js'

dotenv.config()

const shutdown = async (server, signal) => {
  console.log(`${signal} received. Shutting down.`)

  await new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) reject(error)
      else resolve()
    })
  })

  await disconnectDatabase()
  console.log('HTTP server and database connection closed.')
}

const start = async () => {
  let config

  try {
    config = readConfig()
  } catch (error) {
    console.error(`Configuration error: ${error.message}`)
    process.exit(1)
  }

  const app = createApp(config)
  const server = app.listen(config.port)

  try {
    await new Promise((resolve, reject) => {
      server.once('listening', resolve)
      server.once('error', reject)
    })
  } catch (error) {
    console.error(`Server failed to start: ${error.message}`)
    process.exit(1)
  }

  console.log(`Server listening on port ${config.port} (${config.nodeEnv}).`)

  const connected = await connectDatabase(config.mongoUri)
  if (!connected) {
    console.error(`Database status: ${getDatabaseStatus()}.`)
  }

  const close = async (signal) => {
    try {
      await shutdown(server, signal)
      process.exit(0)
    } catch (error) {
      console.error(`Shutdown failed: ${error.message}`)
      process.exit(1)
    }
  }

  process.once('SIGINT', () => {
    close('SIGINT')
  })
  process.once('SIGTERM', () => {
    close('SIGTERM')
  })
}

start()
