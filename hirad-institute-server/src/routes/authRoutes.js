import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { adminCheck, getMe, login, logout, register, updateMe } from '../controllers/authController.js'
import {
  requireActiveAccount,
  requireAuth,
  requireBrowserRequestHeader,
  requireCsrf,
} from '../middleware/authMiddleware.js'
import { requireRole } from '../middleware/roleMiddleware.js'

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many attempts. Please try again later.',
  },
})

export const createAuthRouter = (config) => {
  const router = Router()
  const limiters = config.nodeEnv === 'test' ? [] : [authLimiter]

  router.use(requireBrowserRequestHeader)
  router.post('/register', ...limiters, register)
  router.post('/login', ...limiters, login)
  router.post('/logout', logout)
  router.get('/me', requireAuth, requireActiveAccount, getMe)
  router.patch('/me', requireAuth, requireActiveAccount, requireCsrf, updateMe)
  router.get(
    '/admin-check',
    requireAuth,
    requireActiveAccount,
    requireRole('super_admin', 'admin'),
    adminCheck,
  )

  return router
}
