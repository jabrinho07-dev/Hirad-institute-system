export const errorMiddleware = (err, req, res, next) => {
  if (res.headersSent) {
    next(err)
    return
  }

  const statusCode = Number.isInteger(err.statusCode) ? err.statusCode : 500
  const isProduction = process.env.NODE_ENV === 'production'
  const message =
    statusCode >= 500 && isProduction
      ? 'Internal server error.'
      : err.message || 'Internal server error.'

  console.error(err.message || 'Internal server error.')

  const body = {
    success: false,
    message,
  }

  if (Array.isArray(err.errors) && err.errors.length > 0) {
    body.errors = err.errors
  }

  res.status(statusCode).json(body)
}
