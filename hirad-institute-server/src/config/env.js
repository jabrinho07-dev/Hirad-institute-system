const allowedEnvironments = new Set(['development', 'production', 'test'])
const durationPattern = /^(\d+)([smhd])$/
const durationUnitMs = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }
const minAccessTtlMs = 60_000
const maxAccessTtlMs = 60 * 60_000

const parseAccessTtl = (value) => {
  const match = durationPattern.exec(value)
  if (!match) {
    throw new Error('JWT_ACCESS_EXPIRES_IN must use a value such as 15m.')
  }

  const ttlMs = Number(match[1]) * durationUnitMs[match[2]]
  if (ttlMs < minAccessTtlMs || ttlMs > maxAccessTtlMs) {
    throw new Error('JWT_ACCESS_EXPIRES_IN must be between 1m and 60m.')
  }

  return { jwtAccessExpiresIn: value, jwtAccessExpiresMs: ttlMs }
}

export const readConfig = () => {
  const port = Number(process.env.PORT || 5000)
  const nodeEnv = process.env.NODE_ENV || 'development'
  const clientUrl = process.env.CLIENT_URL
  const mongoUri = process.env.MONGODB_URI
  const jwtAccessSecret = process.env.JWT_ACCESS_SECRET
  const cookieName = process.env.AUTH_COOKIE_NAME || 'hirad_access'
  const expiresIn = process.env.JWT_ACCESS_EXPIRES_IN || '15m'

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535.')
  }

  if (!allowedEnvironments.has(nodeEnv)) {
    throw new Error('NODE_ENV must be development, production, or test.')
  }

  if (!clientUrl) {
    throw new Error('CLIENT_URL is required.')
  }

  let parsedClientUrl
  try {
    parsedClientUrl = new URL(clientUrl)
  } catch {
    throw new Error('CLIENT_URL must be a valid http or https URL.')
  }

  if (!['http:', 'https:'].includes(parsedClientUrl.protocol)) {
    throw new Error('CLIENT_URL must be a valid http or https URL.')
  }

  if (!jwtAccessSecret || jwtAccessSecret.length < 32 || jwtAccessSecret.includes('replace-with')) {
    throw new Error('JWT_ACCESS_SECRET must be a unique random string of at least 32 characters.')
  }

  if (!/^[A-Za-z0-9_]{3,32}$/.test(cookieName)) {
    throw new Error('AUTH_COOKIE_NAME must be 3 to 32 letters, numbers, or underscores.')
  }

  const secureSetting = process.env.AUTH_COOKIE_SECURE
  let cookieSecure
  if (secureSetting === undefined || secureSetting === '') {
    cookieSecure = nodeEnv === 'production'
  } else if (secureSetting !== 'true' && secureSetting !== 'false') {
    throw new Error('AUTH_COOKIE_SECURE must be true or false.')
  } else {
    cookieSecure = secureSetting === 'true'
  }

  if (nodeEnv === 'production' && !cookieSecure) {
    throw new Error('AUTH_COOKIE_SECURE must be true in production.')
  }

  return {
    port,
    nodeEnv,
    clientUrl,
    mongoUri,
    jwtAccessSecret,
    cookieName,
    cookieSecure,
    bcryptRounds: 12,
    ...parseAccessTtl(expiresIn),
  }
}
