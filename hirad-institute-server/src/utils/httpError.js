export class HttpError extends Error {
  constructor(statusCode, message, errors) {
    super(message)
    this.name = 'HttpError'
    this.statusCode = statusCode
    if (errors) this.errors = errors
  }
}
