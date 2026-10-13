import { z } from 'zod'
import { PRIVILEGED_ROLES, SELF_SERVICE_ROLES } from '../models/User.js'
import { HttpError } from '../utils/httpError.js'

const fullName = z.string().trim().min(2).max(120)
const email = z.string().trim().email().max(254)
const password = z.string().min(8).max(72)

const registerSchema = z
  .object({
    fullName,
    email,
    password,
    role: z.string().optional(),
  })
  .strict()

const loginSchema = z
  .object({
    email,
    password: z.string().min(1).max(72),
  })
  .strict()

const profileSchema = z
  .object({
    fullName: fullName.optional(),
    email: email.optional(),
  })
  .strict()
  .refine((value) => value.fullName !== undefined || value.email !== undefined, {
    message: 'Provide a name or email to update.',
  })

const forbiddenProfileFields = [
  'role',
  'accountStatus',
  'emailVerified',
  'password',
  'passwordHash',
  'lastLoginAt',
]

const parse = (schema, body) => {
  const result = schema.safeParse(body ?? {})
  if (result.success) return result.data

  throw new HttpError(
    400,
    'Invalid input.',
    result.error.issues.map((issue) => ({
      field: issue.path.join('.') || 'body',
      message: issue.message,
    })),
  )
}

export const parseRegisterInput = (body) => {
  const input = parse(registerSchema, body)

  if (input.role && PRIVILEGED_ROLES.includes(input.role)) {
    throw new HttpError(403, 'You cannot assign this role during registration.')
  }

  if (input.role && !SELF_SERVICE_ROLES.includes(input.role)) {
    throw new HttpError(400, 'Invalid input.', [
      { field: 'role', message: 'Role must be student or member.' },
    ])
  }

  return {
    fullName: input.fullName,
    email: input.email.toLowerCase(),
    password: input.password,
    role: input.role || 'student',
  }
}

export const parseLoginInput = (body) => {
  const input = parse(loginSchema, body)
  return {
    email: input.email.toLowerCase(),
    password: input.password,
  }
}

export const parseProfileInput = (body) => {
  if (body && typeof body === 'object') {
    const forbidden = forbiddenProfileFields.find((field) =>
      Object.prototype.hasOwnProperty.call(body, field),
    )
    if (forbidden) {
      throw new HttpError(403, 'You cannot change this account field.')
    }
  }

  const input = parse(profileSchema, body)
  if (input.email) input.email = input.email.toLowerCase()
  return input
}
