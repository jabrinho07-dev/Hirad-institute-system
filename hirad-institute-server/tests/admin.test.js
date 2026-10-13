import assert from 'node:assert/strict'
import { after, before, beforeEach, describe, it } from 'node:test'
import bcrypt from 'bcryptjs'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import request from 'supertest'
import { createApp } from '../src/app.js'
import { AuthSession } from '../src/models/AuthSession.js'
import { User } from '../src/models/User.js'

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

const requestHeaders = { 'X-Hirad-Request': '1' }
const password = 'ValidPass123'
let passwordHash

const createAccount = (fields) =>
  User.create({
    fullName: 'Test User',
    emailVerified: false,
    accountStatus: 'active',
    passwordHash,
    ...fields,
  })

describe('administration', { timeout: 60_000 }, () => {
  let mongo
  let app

  before(async () => {
    passwordHash = await bcrypt.hash(password, config.bcryptRounds)
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

  const login = async (email) => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .set(requestHeaders)
      .send({ email, password })
    assert.equal(response.status, 200)
    return {
      cookies: response.headers['set-cookie'],
      csrf: response.body.csrfToken,
      user: response.body.user,
    }
  }

  const authed = (auth) => ({
    get: (path) => request(app).get(path).set('Cookie', auth.cookies),
    patch: (path) =>
      request(app)
        .patch(path)
        .set('Cookie', auth.cookies)
        .set(requestHeaders)
        .set('X-CSRF-Token', auth.csrf),
    delete: (path) =>
      request(app)
        .delete(path)
        .set('Cookie', auth.cookies)
        .set(requestHeaders)
        .set('X-CSRF-Token', auth.csrf),
  })

  it('rejects admin statistics without authentication and for a student', async () => {
    const missing = await request(app).get('/api/v1/admin/stats')
    assert.equal(missing.status, 401)

    await createAccount({ fullName: 'Student User', email: 'student@example.com', role: 'student' })
    const student = await login('student@example.com')
    const forbidden = await authed(student).get('/api/v1/admin/stats')
    assert.equal(forbidden.status, 403)
  })

  it('returns dashboard counts for an administrator', async () => {
    await createAccount({ fullName: 'Admin User', email: 'admin@example.com', role: 'admin' })
    await createAccount({ fullName: 'Student User', email: 'student@example.com', role: 'student' })
    await createAccount({
      fullName: 'Member User',
      email: 'member@example.com',
      role: 'member',
      accountStatus: 'disabled',
    })
    const admin = await login('admin@example.com')

    const response = await authed(admin).get('/api/v1/admin/stats')

    assert.equal(response.status, 200)
    assert.equal(response.body.statistics.totalUsers, 3)
    assert.equal(response.body.statistics.activeUsers, 2)
    assert.equal(response.body.statistics.inactiveUsers, 1)
    assert.equal(response.body.statistics.students, 1)
    assert.equal(response.body.statistics.members, 1)
    assert.equal(response.body.statistics.usersByRole.admin, 1)
    assert.equal(response.body.statistics.recentlyRegistered.length, 3)
    assert.equal(response.text.includes('passwordHash'), false)
  })

  it('paginates and filters the user list', async () => {
    await createAccount({ fullName: 'Admin User', email: 'admin@example.com', role: 'admin' })
    await createAccount({ fullName: 'Nora Member', email: 'nora@example.com', role: 'member' })
    await createAccount({ fullName: 'Omar Member', email: 'omar@example.com', role: 'member' })
    await createAccount({
      fullName: 'Laila Member',
      email: 'laila@example.com',
      role: 'member',
      accountStatus: 'disabled',
    })
    const admin = await login('admin@example.com')

    const page = await authed(admin).get('/api/v1/admin/users?role=member&page=1&limit=2')
    assert.equal(page.status, 200)
    assert.equal(page.body.users.length, 2)
    assert.equal(page.body.pagination.total, 3)
    assert.equal(page.body.pagination.totalPages, 2)
    assert.equal(page.text.includes('passwordHash'), false)

    const search = await authed(admin).get('/api/v1/admin/users?search=nora@example.com')
    assert.equal(search.body.users.length, 1)
    assert.equal(search.body.users[0].email, 'nora@example.com')

    const disabled = await authed(admin).get('/api/v1/admin/users?status=disabled')
    assert.equal(disabled.body.users.length, 1)
    assert.equal(disabled.body.users[0].accountStatus, 'disabled')
  })

  it('updates a student status and blocks privilege changes', async () => {
    const adminAccount = await createAccount({
      fullName: 'Admin User',
      email: 'admin@example.com',
      role: 'admin',
    })
    const student = await createAccount({
      fullName: 'Student User',
      email: 'student@example.com',
      role: 'student',
    })
    await createAccount({
      fullName: 'Super User',
      email: 'super@example.com',
      role: 'super_admin',
    })
    const admin = await login('admin@example.com')
    const client = authed(admin)

    const disabled = await client
      .patch(`/api/v1/admin/users/${student._id}/status`)
      .send({ accountStatus: 'disabled' })
    assert.equal(disabled.status, 200)
    assert.equal(disabled.body.user.accountStatus, 'disabled')

    const elevated = await client
      .patch(`/api/v1/admin/users/${student._id}/role`)
      .send({ role: 'super_admin' })
    assert.equal(elevated.status, 403)

    const selfRole = await client
      .patch(`/api/v1/admin/users/${adminAccount._id}/role`)
      .send({ role: 'super_admin' })
    assert.equal(selfRole.status, 403)
    assert.equal((await User.findById(adminAccount._id)).role, 'admin')

    const managed = await client
      .patch('/api/v1/admin/users/507f1f77bcf86cd799439011/status')
      .send({ accountStatus: 'active' })
    assert.equal(managed.status, 404)

    const invalid = await client.get('/api/v1/admin/users/not-an-id')
    assert.equal(invalid.status, 400)
  })

  it('lets a super administrator change a role but not remove the last active super administrator', async () => {
    const first = await createAccount({
      fullName: 'First Super',
      email: 'first@example.com',
      role: 'super_admin',
    })
    const student = await createAccount({
      fullName: 'Student User',
      email: 'student@example.com',
      role: 'student',
    })
    const actor = await login('first@example.com')
    const client = authed(actor)

    const promoted = await client
      .patch(`/api/v1/admin/users/${student._id}/role`)
      .send({ role: 'instructor' })
    assert.equal(promoted.status, 200)
    assert.equal(promoted.body.user.role, 'instructor')

    const demoted = await client
      .patch(`/api/v1/admin/users/${first._id}/role`)
      .send({ role: 'admin' })
    assert.equal(demoted.status, 409)

    const removed = await client.delete(`/api/v1/admin/users/${first._id}`)
    assert.equal(removed.status, 409)
    assert.equal(await User.countDocuments({ role: 'super_admin', accountStatus: 'active' }), 1)
  })

  it('deletes a student and revokes that student session', async () => {
    await createAccount({ fullName: 'Admin User', email: 'admin@example.com', role: 'admin' })
    const studentAccount = await createAccount({
      fullName: 'Student User',
      email: 'student@example.com',
      role: 'student',
    })
    const admin = await login('admin@example.com')
    const student = await login('student@example.com')

    const removed = await authed(admin).delete(`/api/v1/admin/users/${studentAccount._id}`)
    assert.equal(removed.status, 200)

    const profile = await request(app).get('/api/v1/auth/me').set('Cookie', student.cookies)
    assert.equal(profile.status, 401)
    assert.equal(await User.exists({ _id: studentAccount._id }), null)
  })
})