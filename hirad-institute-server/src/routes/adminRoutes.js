import { Router } from 'express'
import {
  getStatistics,
  getUser,
  getUsers,
  patchUser,
  patchUserRole,
  patchUserStatus,
  removeUser,
} from '../controllers/adminController.js'
import {
  requireActiveAccount,
  requireAuth,
  requireBrowserRequestHeader,
  requireCsrf,
} from '../middleware/authMiddleware.js'
import { requireRole } from '../middleware/roleMiddleware.js'

export const createAdminRouter = () => {
  const router = Router()

  router.use(requireBrowserRequestHeader)
  router.use(requireAuth, requireActiveAccount, requireRole('super_admin', 'admin'))

  router.get('/stats', getStatistics)
  router.get('/users', getUsers)
  router.get('/users/:id', getUser)
  router.patch('/users/:id/status', requireCsrf, patchUserStatus)
  router.patch('/users/:id/role', requireCsrf, patchUserRole)
  router.patch('/users/:id', requireCsrf, patchUser)
  router.delete('/users/:id', requireCsrf, removeUser)

  return router
}
