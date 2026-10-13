import mongoose from 'mongoose'

export const USER_ROLES = [
  'super_admin',
  'admin',
  'staff',
  'instructor',
  'researcher',
  'consultant',
  'student',
  'member',
]

export const SELF_SERVICE_ROLES = ['student', 'member']

export const PRIVILEGED_ROLES = USER_ROLES.filter((role) => !SELF_SERVICE_ROLES.includes(role))

export const ACCOUNT_STATUSES = ['active', 'disabled']

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: USER_ROLES,
      required: true,
    },
    accountStatus: {
      type: String,
      enum: ACCOUNT_STATUSES,
      default: 'active',
      required: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
      required: true,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
)

userSchema.set('toJSON', {
  transform(doc, ret) {
    delete ret.passwordHash
    return ret
  },
})

export const User = mongoose.model('User', userSchema)
