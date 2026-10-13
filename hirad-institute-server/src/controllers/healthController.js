import { getDatabaseStatus } from '../config/database.js'

export const getHealth = (req, res) => {
  const database = getDatabaseStatus()

  res.status(200).json({
    success: true,
    message: 'Hirad Institute API is running.',
    server: 'up',
    database,
    timestamp: new Date().toISOString(),
  })
}
