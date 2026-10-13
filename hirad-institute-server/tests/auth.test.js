import assert from 'node:assert/strict'
import { after, before, beforeEach, describe, it } from 'node:test'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import request from 'supertest'
import { createApp } from '../src/app.js'
import { AuthSession } from '../src/models/AuthSession.js'
import { PRIVILEGED_ROLES, User } from '../src/models/User.js'
import { TOKEN_AUDIENCE, TOKEN_ISSUER } from '../src/services/authService.js'

const config = {
  clientUrl: 'http://localhost:5173',
  nodeEnv: 'test',
  cookieName: 'hirad_access',
  cookieSecure: false,
  jwtAccessSecret: 'test-only-secret-with-at-least-32-chars',
  jwtAccessExpiresIn: '15m',
  jwtAccessExpiresMs: 15 * 60 * 1000,
  bcryptRounds: 4,
}

const requestHeaders = {
  'X-Hirad-Request': '1',
}

const registerBody = {
  fullName: 'Amina Yusuf',
  email: 'amina@example.com',
  password: 'ValidPass123',
}

describe('authentication', { timeout: 60_000 }, () => {
  let mongo
  let app

  before(async () => {
    mongo = await MongoMemoryServer.create()
    await mongoose.connect(mongo.getUri())
    app = createApp(config)
  })

  beforeEach(async () => {
    await Promise.all([User.deleteMany({}), AuthSession.deleteMany({})])
  })

  after(async () => {
    await mongoose.disconnect()
    await mongo.stop()
  })

  const postAuth = (path) => request(app).post(path).set(requestHeaders)

  it('registers a student and does not return the password hash', async () => {
    const response = await postAuth('/api/v1/auth/register').send(registerBody)

    assert.equal(response.status, 201)
    assert.equal(response.body.success, true)
    assert.equal(response.body.user.role, 'student')
    assert.equal(response.body.user.email, 'amina@example.com')
    assert.equal(response.body.user.emailVerified, false)
    assert.equal(Object.hasOwn(response.body.user, 'passwordHash'), false)
    assert.equal(response.text.includes('passwordHash'), false)
    assert.ok(response.body.csrfToken)
    assert.match(response.headers['set-cookie'].join(';'), /hirad_access=/)
    assert.match(response.headers['set-cookie'].join(';'), /HttpOnly/i)

    const stored = await User.findOne({ email: 'amina@example.com' }).select('+passwordHash')
    assert.notEqual(stored.passwordHash, registerBody.password)
    assert.equal(await bcrypt.compare(registerBody.password, stored.passwordHash), true)
  })

  it('rejects a duplicate email without creating another account', async () => {
    await postAuth('/api/v1/auth/register').send(registerBody)
    const response = await postAuth('/api/v1/auth/register').send({
      ...registerBody,
      email: 'Amina@Example.com',
    })

    assert.equal(response.status, 409)
    assert.equal(response.body.message, 'An account with this email already exists.')
    assert.equal(await User.countDocuments(), 1)
  })

  it('logs in with a valid password and records lastLoginAt', async () => {
    await postAuth('/api/v1/auth/register').send(registerBody)
    const response = await postAuth('/api/v1/auth/login').send({
      email: 'amina@example.com',
      password: 'ValidPass123',
    })

    assert.equal(response.status, 200)
    assert.equal(response.body.user.email, 'amina@example.com')
    assert.ok(response.body.user.lastLoginAt)
    assert.equal(Object.hasOwn(response.body.user, 'passwordHash'), false)
  })

  it('returns the same message for an unknown email and a wrong password', async () => {
    await postAuth('/api/v1/auth/register').send(registerBody)

    const unknown = await postAuth('/api/v1/auth/login').send({
      email: 'missing@example.com',
      password: 'ValidPass123',
    })
    const wrong = await postAuth('/api/v1/auth/login').send({
      email: 'amina@example.com',
      password: 'WrongPass123',
    })

    assert.equal(unknown.status, 401)
    assert.equal(wrong.status, 401)
    assert.equal(unknown.body.message, 'Invalid email or password.')
    assert.equal(wrong.body.message, unknown.body.message)
  })

  it('rejects login and registration when credentials are missing', async () => {
    const loginResponse = await postAuth('/api/v1/auth/login').send({})
    const registerResponse = await postAuth('/api/v1/auth/register').send({ email: 'amina@example.com' })

    assert.equal(loginResponse.status, 400)
    assert.equal(loginResponse.body.message, 'Invalid input.')
    assert.equal(registerResponse.status, 400)
  })

  it('does not allow public registration to assign a privileged role', async () => {
    for (const role of PRIVILEGED_ROLES) {
      const response = await postAuth('/api/v1/auth/register').send({ ...registerBody, role })
      assert.equal(response.status, 403, role)
      assert.equal(response.body.message, 'You cannot assign this role during registration.')
    }

    assert.equal(await User.countDocuments(), 0)
  })

  it('requires authentication for the current profile', async () => {
    const response = await request(app).get('/api/v1/auth/me')
    assert.equal(response.status, 401)
    assert.equal(response.body.message, 'Authentication is required.')
  })

  it('allows an admin through the role check and rejects a student', async () => {
    const passwordHash = await bcrypt.hash('ValidPass123', config.bcryptRounds)
    await User.create({
      fullName: 'Admin User',
      email: 'admin@example.com',
      passwordHash,
      role: 'admin',
      accountStatus: 'active',
    })

    const adminLogin = await postAuth('/api/v1/auth/login').send({
      email: 'admin@example.com',
      password: 'ValidPass123',
    })
    const student = await postAuth('/api/v1/auth/register').send({
      ...registerBody,
      email: 'student@example.com',
      role: 'student',
    })

    const adminResponse = await request(app)
      .get('/api/v1/auth/admin-check')
      .set('Cookie', adminLogin.headers['set-cookie'])
    const studentResponse = await request(app)
      .get('/api/v1/auth/admin-check')
      .set('Cookie', student.headers['set-cookie'])

    assert.equal(adminResponse.status, 200)
    assert.equal(adminResponse.body.role, 'admin')
    assert.equal(studentResponse.status, 403)
    assert.equal(studentResponse.body.message, 'You do not have permission to perform this action.')
  })

  it('revokes the server session on logout so the old token cannot be reused', async () => {
    const registered = await postAuth('/api/v1/auth/register').send(registerBody)
    const cookies = registered.headers['set-cookie']

    const profile = await request(app).get('/api/v1/auth/me').set('Cookie', cookies)
    assert.equal(profile.status, 200)

    const loggedOut = await request(app)
      .post('/api/v1/auth/logout')
      .set(requestHeaders)
      .set('Cookie', cookies)
      .set('X-CSRF-Token', registered.body.csrfToken)

    assert.equal(loggedOut.status, 200)
    const session = await AuthSession.findOne()
    assert.ok(session.revokedAt)

    const reused = await request(app).get('/api/v1/auth/me').set('Cookie', cookies)
    assert.equal(reused.status, 401)
    assert.equal(reused.body.message, 'Authentication session is no longer valid.')
  })

  it('rejects an expired access token and still revokes that session on logout', async () => {
    const registered = await postAuth('/api/v1/auth/register').send(registerBody)
    const session = await AuthSession.findOne()
    const expiredToken = jwt.sign(
      {
        sub: registered.body.user.id,
        sid: session._id.toString(),
        exp: Math.floor(Date.now() / 1000) - 10,
      },
      config.jwtAccessSecret,
      { issuer: TOKEN_ISSUER, audience: TOKEN_AUDIENCE },
    )

    const expired = await request(app)
      .get('/api/v1/auth/me')
      .set('Cookie', [`${config.cookieName}=${expiredToken}`])
    assert.equal(expired.status, 401)
    assert.equal(expired.body.message, 'Authentication token has expired.')

    const loggedOut = await request(app)
      .post('/api/v1/auth/logout')
      .set(requestHeaders)
      .set('Cookie', [`${config.cookieName}=${expiredToken}`])
      .set('X-CSRF-Token', registered.body.csrfToken)

    assert.equal(loggedOut.status, 200)
    const stored = await AuthSession.findById(session._id)
    assert.ok(stored.revokedAt)
  })

  it('does not revoke a session when the CSRF token is wrong', async () => {
    const registered = await postAuth('/api/v1/auth/register').send(registerBody)
    const response = await request(app)
      .post('/api/v1/auth/logout')
      .set(requestHeaders)
      .set('Cookie', registered.headers['set-cookie'])
      .set('X-CSRF-Token', 'not-the-session-token')

    assert.equal(response.status, 403)
    assert.equal(response.body.message, 'CSRF token is missing or invalid.')
    const session = await AuthSession.findOne()
    assert.equal(session.revokedAt, null)

    const profile = await request(app)
      .get('/api/v1/auth/me')
      .set('Cookie', registered.headers['set-cookie'])
    assert.equal(profile.status, 200)
  })

  it('rejects a disabled account without treating it as a bad password', async () => {
    await postAuth('/api/v1/auth/register').send(registerBody)
    await User.updateOne({ email: 'amina@example.com' }, { accountStatus: 'disabled' })

    const response = await postAuth('/api/v1/auth/login').send({
      email: 'amina@example.com',
      password: 'ValidPass123',
    })

    assert.equal(response.status, 403)
    assert.equal(response.body.message, 'This account is disabled.')
  })
})
