import {
  deleteUser,
  getDashboardStatistics,
  getUserById,
  listUsers,
  updateUserProfile,
  updateUserRole,
  updateUserStatus,
} from '../services/adminService.js'
import {
  parseAdminProfileUpdate,
  parseRoleUpdate,
  parseStatusUpdate,
  parseUserId,
  parseUserListQuery,
} from '../validators/adminValidators.js'

export const getStatistics = async (req, res, next) => {
  try {
    const statistics = await getDashboardStatistics()
    res.status(200).json({
      success: true,
      message: 'Statistics retrieved.',
      statistics,
    })
  } catch (error) {
    next(error)
  }
}

export const getUsers = async (req, res, next) => {
  try {
    const query = parseUserListQuery(req.query)
    const result = await listUsers(query)
    res.status(200).json({
      success: true,
      message: 'Users retrieved.',
      ...result,
    })
  } catch (error) {
    next(error)
  }
}

export const getUser = async (req, res, next) => {
  try {
    const user = await getUserById(parseUserId(req.params.id))
    res.status(200).json({
      success: true,
      message: 'User retrieved.',
      user,
    })
  } catch (error) {
    next(error)
  }
}

export const patchUserStatus = async (req, res, next) => {
  try {
    const user = await updateUserStatus(
      req.user,
      parseUserId(req.params.id),
      parseStatusUpdate(req.body).accountStatus,
    )
    res.status(200).json({
      success: true,
      message: 'User status updated.',
      user,
    })
  } catch (error) {
    next(error)
  }
}

export const patchUserRole = async (req, res, next) => {
  try {
    const user = await updateUserRole(
      req.user,
      parseUserId(req.params.id),
      parseRoleUpdate(req.body).role,
    )
    res.status(200).json({
      success: true,
      message: 'User role updated.',
      user,
    })
  } catch (error) {
    next(error)
  }
}

export const patchUser = async (req, res, next) => {
  try {
    const user = await updateUserProfile(
      req.user,
      parseUserId(req.params.id),
      parseAdminProfileUpdate(req.body),
    )
    res.status(200).json({
      success: true,
      message: 'User updated.',
      user,
    })
  } catch (error) {
    next(error)
  }
}

export const removeUser = async (req, res, next) => {
  try {
    await deleteUser(req.user, parseUserId(req.params.id))
    res.status(200).json({
      success: true,
      message: 'User deleted.',
    })
  } catch (error) {
    next(error)
  }
}
