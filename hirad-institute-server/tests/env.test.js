import assert from 'node:assert/strict'
import { afterEach, describe, it } from 'node:test'
import { readConfig } from '../src/config/env.js'

const keys = [
  'PORT',
  'CLIENT_URL',
  'NODE_ENV',
  'MONGODB_URI',
  'JWT_ACCESS_SECRET',
  'JWT_ACCESS_EXPIRES_IN',
  'AUTH_COOKIE_NAME',
  'AUTH_COOKIE_SECURE',
]

const original = Object.fromEntries(keys.map((key) => [key, process.env[key]]))

const applyEnv = (values) => {
  for (const key of keys) delete process.env[key]
  Object.assign(process.env, values)
}

describe('environment configuration', () => {
  afterEach(() => {
    for (const key of keys) {
      if (original[key] === undefined) delete process.env[key]
      else process.env[key] = original[key]
    }
  })

  it('requires a unique access-token secret', () => {
    applyEnv({
      CLIENT_URL: 'http://localhost:5173',
      NODE_ENV: 'development',
      JWT_ACCESS_SECRET: 'replace-with-a-random-string-at-least-32-characters',
    })

    assert.throws(() => readConfig(), /JWT_ACCESS_SECRET/)
  })

  it('rejects insecure production cookies', () => {
    applyEnv({
      CLIENT_URL: 'https://hirad.example',
      NODE_ENV: 'production',
      AUTH_COOKIE_SECURE: 'false',
      JWT_ACCESS_SECRET: 'production-secret-that-is-at-least-32-characters',
    })

    assert.throws(() => readConfig(), /AUTH_COOKIE_SECURE/)
  })
})
