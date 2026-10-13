import { HttpError } from '../utils/httpError.js'

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    next(new HttpError(403, 'You do not have permission to perform this action.'))
    return
  }

  next()
}
