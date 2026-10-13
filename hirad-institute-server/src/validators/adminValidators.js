import { z } from 'zod'
import mongoose from 'mongoose'
import { ACCOUNT_STATUSES, USER_ROLES } from '../models/User.js'
import { HttpError } from '../utils/httpError.js'

const parse = (schema, value) => {
  const result = schema.safeParse(value ?? {})
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

const listQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
    search: z.string().trim().max(120).optional(),
    role: z.enum(USER_ROLES).optional(),
    status: z.enum(ACCOUNT_STATUSES).optional(),
  })
  .strict()

const statusSchema = z
  .object({
    accountStatus: z.enum(ACCOUNT_STATUSES),
  })
  .strict()

const roleSchema = z
  .object({
    role: z.enum(USER_ROLES),
  })
  .strict()

const profileSchema = z
  .object({
    fullName: z.string().trim().min(2).max(120).optional(),
    email: z.string().trim().email().max(254).optional(),
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

export const parseUserId = (id) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new HttpError(400, 'Invalid user id.')
  }
  return id
}

export const parseUserListQuery = (query) => {
  const parsed = parse(listQuerySchema, query)
  if (parsed.search === '') delete parsed.search
  return parsed
}

export const parseStatusUpdate = (body) => parse(statusSchema, body)

export const parseRoleUpdate = (body) => parse(roleSchema, body)

export const parseAdminProfileUpdate = (body) => {
  if (body && typeof body === 'object') {
    const forbidden = forbiddenProfileFields.find((field) =>
      Object.prototype.hasOwnProperty.call(body, field),
    )
    if (forbidden) {
      throw new HttpError(403, 'You cannot change this account field.')
    }
  }

  const parsed = parse(profileSchema, body)
  if (parsed.email) parsed.email = parsed.email.toLowerCase()
  return parsed
}
