import { authenticateToken, csrfTokensMatch } from '../services/authService.js'
import { HttpError } from '../utils/httpError.js'

export const readCookie = (req, name) => req.cookies?.[name] || ''

export const requireBrowserRequestHeader = (req, res, next) => {
  if (!['POST', 'PATCH', 'PUT', 'DELETE'].includes(req.method)) {
    next()
    return
  }

  if (req.get('X-Hirad-Request') !== '1') {
    next(new HttpError(403, 'This request was rejected.'))
    return
  }

  next()
}

export const requireAuth = async (req, res, next) => {
  try {
    const config = req.app.get('authConfig')
    const token = readCookie(req, config.cookieName)
    const { user, session } = await authenticateToken(token, config)
    req.user = user
    req.authSession = session
    next()
  } catch (error) {
    next(error)
  }
}

export const requireActiveAccount = (req, res, next) => {
  if (!req.user || req.user.accountStatus !== 'active') {
    next(new HttpError(403, 'This account is disabled.'))
    return
  }

  next()
}

export const requireCsrf = (req, res, next) => {
  const provided = req.get('X-CSRF-Token')
  if (!csrfTokensMatch(provided, req.authSession?.csrfTokenHash)) {
    next(new HttpError(403, 'CSRF token is missing or invalid.'))
    return
  }

  next()
}
