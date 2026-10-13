import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { AuthSession } from '../models/AuthSession.js'
import { User } from '../models/User.js'
import { HttpError } from '../utils/httpError.js'

export const TOKEN_ISSUER = 'hirad-institute'
export const TOKEN_AUDIENCE = 'hirad-institute-client'
const INVALID_LOGIN_MESSAGE = 'Invalid email or password.'

let dummyPasswordHash

const getDummyPasswordHash = async (rounds) => {
  if (!dummyPasswordHash) {
    dummyPasswordHash = await bcrypt.hash('hirad-invalid-login-placeholder', rounds)
  }
  return dummyPasswordHash
}

export const toPublicUser = (user) => ({
  id: user._id.toString(),
  fullName: user.fullName,
  email: user.email,
  role: user.role,
  accountStatus: user.accountStatus,
  emailVerified: user.emailVerified,
  lastLoginAt: user.lastLoginAt,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
})

const createCsrfToken = () => randomBytes(32).toString('base64url')

const hashCsrfToken = (token) => createHash('sha256').update(token).digest('hex')

export const csrfTokensMatch = (providedToken, expectedHash) => {
  if (!providedToken || !expectedHash) return false

  const actual = createHash('sha256').update(providedToken).digest()
  const expected = Buffer.from(expectedHash, 'hex')
  if (actual.length !== expected.length) return false
  return timingSafeEqual(actual, expected)
}

const signAccessToken = (user, session, config) =>
  jwt.sign({ sub: user._id.toString(), sid: session._id.toString() }, config.jwtAccessSecret, {
    expiresIn: config.jwtAccessExpiresIn,
    issuer: TOKEN_ISSUER,
    audience: TOKEN_AUDIENCE,
  })

const createSession = async (user, config) => {
  const csrfToken = createCsrfToken()
  const session = await AuthSession.create({
    userId: user._id,
    csrfTokenHash: hashCsrfToken(csrfToken),
    expiresAt: new Date(Date.now() + config.jwtAccessExpiresMs),
  })

  return {
    token: signAccessToken(user, session, config),
    csrfToken,
    session,
  }
}

export const registerUser = async (input, config) => {
  const existing = await User.findOne({ email: input.email }).select('_id')
  if (existing) {
    throw new HttpError(409, 'An account with this email already exists.')
  }

  const passwordHash = await bcrypt.hash(input.password, config.bcryptRounds)

  let user
  try {
    user = await User.create({
      fullName: input.fullName,
      email: input.email,
      passwordHash,
      role: input.role,
      accountStatus: 'active',
      emailVerified: false,
    })
  } catch (error) {
    if (error?.code === 11000) {
      throw new HttpError(409, 'An account with this email already exists.')
    }
    throw error
  }

  const session = await createSession(user, config)
  return { user: toPublicUser(user), ...session }
}

export const loginUser = async (input, config) => {
  const user = await User.findOne({ email: input.email }).select('+passwordHash')
  const hash = user?.passwordHash || (await getDummyPasswordHash(config.bcryptRounds))
  const passwordMatches = await bcrypt.compare(input.password, hash)

  if (!user || !passwordMatches) {
    throw new HttpError(401, INVALID_LOGIN_MESSAGE)
  }

  if (user.accountStatus !== 'active') {
    throw new HttpError(403, 'This account is disabled.')
  }

  user.lastLoginAt = new Date()
  await user.save()

  const session = await createSession(user, config)
  return { user: toPublicUser(user), ...session }
}

export const updateProfile = async (user, input) => {
  if (input.fullName) user.fullName = input.fullName
  if (input.email) user.email = input.email

  try {
    await user.save()
  } catch (error) {
    if (error?.code === 11000) {
      throw new HttpError(409, 'An account with this email already exists.')
    }
    throw error
  }

  return toPublicUser(user)
}

export const verifyAccessToken = (token, config, { ignoreExpiration = false } = {}) => {
  try {
    return jwt.verify(token, config.jwtAccessSecret, {
      issuer: TOKEN_ISSUER,
      audience: TOKEN_AUDIENCE,
      ignoreExpiration,
    })
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new HttpError(401, 'Authentication token has expired.')
    }
    throw new HttpError(401, 'Authentication token is invalid.')
  }
}

export const authenticateToken = async (token, config) => {
  if (!token) {
    throw new HttpError(401, 'Authentication is required.')
  }

  const payload = verifyAccessToken(token, config)
  const session = await AuthSession.findById(payload.sid)

  if (
    !session ||
    session.revokedAt ||
    session.expiresAt.getTime() <= Date.now() ||
    session.userId.toString() !== payload.sub
  ) {
    throw new HttpError(401, 'Authentication session is no longer valid.')
  }

  const user = await User.findById(payload.sub)
  if (!user) {
    throw new HttpError(401, 'Authentication session is no longer valid.')
  }

  if (user.accountStatus !== 'active') {
    throw new HttpError(403, 'This account is disabled.')
  }

  return { user, session }
}

export const revokeSessionFromToken = async (token, csrfToken, config) => {
  if (!token) {
    throw new HttpError(401, 'Authentication is required.')
  }

  const payload = verifyAccessToken(token, config, { ignoreExpiration: true })
  const session = await AuthSession.findById(payload.sid)

  if (!session || session.userId.toString() !== payload.sub) {
    throw new HttpError(401, 'Authentication session is no longer valid.')
  }

  if (!csrfTokensMatch(csrfToken, session.csrfTokenHash)) {
    throw new HttpError(403, 'CSRF token is missing or invalid.')
  }

  if (!session.revokedAt) {
    session.revokedAt = new Date()
    await session.save()
  }
}
