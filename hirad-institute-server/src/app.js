import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import morgan from 'morgan'
import { errorMiddleware } from './middleware/errorMiddleware.js'
import { notFoundMiddleware } from './middleware/notFoundMiddleware.js'
import { createAdminRouter } from './routes/adminRoutes.js'
import { createAuthRouter } from './routes/authRoutes.js'
import healthRoutes from './routes/healthRoutes.js'

export const createApp = (config) => {
  const { clientUrl, nodeEnv } = config
  const app = express()

  app.disable('x-powered-by')
  app.set('authConfig', config)
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  )
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || origin === clientUrl) {
          callback(null, true)
          return
        }

        callback(null, false)
      },
      credentials: true,
      allowedHeaders: ['Content-Type', 'X-CSRF-Token', 'X-Hirad-Request'],
    }),
  )
  app.use(express.json({ limit: '1mb' }))
  app.use(cookieParser())

  if (nodeEnv === 'development') {
    app.use(morgan('dev'))
  }

  if (nodeEnv !== 'test') {
    app.use(
      rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
        standardHeaders: true,
        legacyHeaders: false,
        message: {
          success: false,
          message: 'Too many requests. Please try again later.',
        },
      }),
    )
  }

  app.use('/api/v1/health', healthRoutes)
  app.use('/api/v1/auth', createAuthRouter(config))
  app.use('/api/v1/admin', createAdminRouter())
  app.use(notFoundMiddleware)
  app.use(errorMiddleware)

  return app
}
