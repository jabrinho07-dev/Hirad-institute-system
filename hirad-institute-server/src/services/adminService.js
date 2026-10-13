import { AuthSession } from '../models/AuthSession.js'
import { USER_ROLES, User } from '../models/User.js'
import { toPublicUser } from './authService.js'
import { HttpError } from '../utils/httpError.js'

const RECENT_USER_LIMIT = 5

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const rolesAnAdminMayAssign = USER_ROLES.filter((role) => role !== 'super_admin' && role !== 'admin')

const revokeUserSessions = async (userId) => {
  await AuthSession.updateMany(
    { userId, revokedAt: null },
    { $set: { revokedAt: new Date() } },
  )
}

const countActiveSuperAdmins = () =>
  User.countDocuments({ role: 'super_admin', accountStatus: 'active' })

const assertCanManage = (actor, target) => {
  if (actor.role === 'super_admin') return

  if (target.role === 'super_admin' || target.role === 'admin') {
    throw new HttpError(403, 'You cannot manage this account.')
  }
}

const assertNotLastActiveSuperAdmin = async (target) => {
  if (target.role !== 'super_admin' || target.accountStatus !== 'active') return

  const activeSuperAdmins = await countActiveSuperAdmins()
  if (activeSuperAdmins <= 1) {
    throw new HttpError(409, 'The last active super administrator cannot be changed or removed.')
  }
}

const findUserOrThrow = async (id) => {
  const user = await User.findById(id)
  if (!user) throw new HttpError(404, 'User not found.')
  return user
}

const saveUser = async (user) => {
  try {
    await user.save()
  } catch (error) {
    if (error?.code === 11000) {
      throw new HttpError(409, 'An account with this email already exists.')
    }
    throw error
  }
}

export const getDashboardStatistics = async () => {
  const [summary] = await User.aggregate([
    {
      $facet: {
        total: [{ $count: 'count' }],
        byStatus: [{ $group: { _id: '$accountStatus', count: { $sum: 1 } } }],
        byRole: [{ $group: { _id: '$role', count: { $sum: 1 } } }],
        recent: [
          { $sort: { createdAt: -1 } },
          { $limit: RECENT_USER_LIMIT },
          { $project: { passwordHash: 0 } },
        ],
      },
    },
  ])

  const statusCounts = Object.fromEntries(
    (summary?.byStatus ?? []).map((entry) => [entry._id, entry.count]),
  )
  const roleCounts = Object.fromEntries(USER_ROLES.map((role) => [role, 0]))
  for (const entry of summary?.byRole ?? []) {
    if (entry._id in roleCounts) roleCounts[entry._id] = entry.count
  }

  return {
    totalUsers: summary?.total?.[0]?.count ?? 0,
    activeUsers: statusCounts.active ?? 0,
    inactiveUsers: statusCounts.disabled ?? 0,
    usersByRole: roleCounts,
    students: roleCounts.student,
    members: roleCounts.member,
    recentlyRegistered: (summary?.recent ?? []).map(toPublicUser),
  }
}

export const listUsers = async (query) => {
  const filter = {}

  if (query.role) filter.role = query.role
  if (query.status) filter.accountStatus = query.status
  if (query.search) {
    const pattern = new RegExp(escapeRegex(query.search), 'i')
    filter.$or = [{ fullName: pattern }, { email: pattern }]
  }

  const skip = (query.page - 1) * query.limit
  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(query.limit),
    User.countDocuments(filter),
  ])

  return {
    users: users.map(toPublicUser),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / query.limit),
    },
  }
}

export const getUserById = async (id) => toPublicUser(await findUserOrThrow(id))

export const updateUserStatus = async (actor, id, accountStatus) => {
  const user = await findUserOrThrow(id)

  assertCanManage(actor, user)

  if (accountStatus === 'disabled') {
    await assertNotLastActiveSuperAdmin(user)
  }

  if (actor._id.equals(user._id)) {
    throw new HttpError(403, 'You cannot change your own account status.')
  }

  user.accountStatus = accountStatus
  await saveUser(user)
  await revokeUserSessions(user._id)
  return toPublicUser(user)
}

export const updateUserRole = async (actor, id, role) => {
  const user = await findUserOrThrow(id)

  assertCanManage(actor, user)

  if (actor.role === 'admin' && !rolesAnAdminMayAssign.includes(role)) {
    throw new HttpError(403, 'You cannot assign this role.')
  }

  if (!USER_ROLES.includes(role)) {
    throw new HttpError(400, 'Invalid input.')
  }

  if (user.role === 'super_admin' && role !== 'super_admin') {
    await assertNotLastActiveSuperAdmin(user)
  }

  if (actor._id.equals(user._id)) {
    throw new HttpError(403, 'You cannot change your own role.')
  }

  user.role = role
  await saveUser(user)
  await revokeUserSessions(user._id)
  return toPublicUser(user)
}

export const updateUserProfile = async (actor, id, input) => {
  const user = await findUserOrThrow(id)
  assertCanManage(actor, user)

  if (input.fullName) user.fullName = input.fullName
  if (input.email) user.email = input.email

  await saveUser(user)
  return toPublicUser(user)
}

export const deleteUser = async (actor, id) => {
  const user = await findUserOrThrow(id)

  assertCanManage(actor, user)
  await assertNotLastActiveSuperAdmin(user)

  if (user.role === 'super_admin') {
    const remaining = await User.countDocuments({
      _id: { $ne: user._id },
      role: 'super_admin',
    })
    if (remaining === 0) {
      throw new HttpError(409, 'The last active super administrator cannot be changed or removed.')
    }
  }

  if (actor._id.equals(user._id)) {
    throw new HttpError(403, 'You cannot delete your own account.')
  }

  await revokeUserSessions(user._id)
  await user.deleteOne()
}
