import { readCookie } from '../middleware/authMiddleware.js'
import {
  loginUser,
  registerUser,
  revokeSessionFromToken,
  toPublicUser,
  updateProfile,
} from '../services/authService.js'
import { parseLoginInput, parseProfileInput, parseRegisterInput } from '../validators/authValidators.js'

const csrfCookieName = (config) => `${config.cookieName}_csrf`

const cookieBase = (config) => ({
  secure: config.cookieSecure,
  sameSite: 'lax',
  path: '/',
})

export const setAuthCookies = (res, config, token, csrfToken) => {
  const base = cookieBase(config)
  res.cookie(config.cookieName, token, {
    ...base,
    httpOnly: true,
    maxAge: config.jwtAccessExpiresMs,
  })
  res.cookie(csrfCookieName(config), csrfToken, {
    ...base,
    httpOnly: false,
    maxAge: config.jwtAccessExpiresMs,
  })
}

export const clearAuthCookies = (res, config) => {
  const base = cookieBase(config)
  res.clearCookie(config.cookieName, { ...base, httpOnly: true })
  res.clearCookie(csrfCookieName(config), { ...base, httpOnly: false })
}

const authBody = (message, user, csrfToken) => ({
  success: true,
  message,
  user,
  csrfToken,
})

export const register = async (req, res, next) => {
  try {
    const config = req.app.get('authConfig')
    const input = parseRegisterInput(req.body)
    const result = await registerUser(input, config)
    setAuthCookies(res, config, result.token, result.csrfToken)
    res.status(201).json(authBody('Registered successfully.', result.user, result.csrfToken))
  } catch (error) {
    next(error)
  }
}

export const login = async (req, res, next) => {
  try {
    const config = req.app.get('authConfig')
    const input = parseLoginInput(req.body)
    const result = await loginUser(input, config)
    setAuthCookies(res, config, result.token, result.csrfToken)
    res.status(200).json(authBody('Logged in successfully.', result.user, result.csrfToken))
  } catch (error) {
    next(error)
  }
}

export const logout = async (req, res, next) => {
  try {
    const config = req.app.get('authConfig')
    const token = readCookie(req, config.cookieName)
    await revokeSessionFromToken(token, req.get('X-CSRF-Token'), config)
    clearAuthCookies(res, config)
    res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
    })
  } catch (error) {
    next(error)
  }
}

export const getMe = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Profile retrieved.',
    user: toPublicUser(req.user),
  })
}

export const updateMe = async (req, res, next) => {
  try {
    const input = parseProfileInput(req.body)
    const user = await updateProfile(req.user, input)
    res.status(200).json({
      success: true,
      message: 'Profile updated.',
      user,
    })
  } catch (error) {
    next(error)
  }
}

export const adminCheck = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Administrator access confirmed.',
    role: req.user.role,
  })
}
