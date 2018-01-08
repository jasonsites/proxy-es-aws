const { boomify } = require('boom')

/**
 * Error handling middleware for all requests
 * @param {Object} ctx    - request/response context
 * @param {Function} next - middleware function
 * @return {Promise}
 */
module.exports = async function errorHandler(ctx, next) {
  try {
    await next()
  } catch (err) {
    const { log } = ctx.request
    if (log) log.error(err)
    else console.error(err)
    if (!err.isBoom) boomify(err, { statusCode: 500 })
    const { payload } = err.output
    ctx.body = {
      errors: [{
        title: payload.error,
        detail: payload.message,
        status: payload.statusCode.toString(),
        meta: err.data,
      }],
    }
    ctx.status = payload.statusCode
    ctx.state.error = err
  }
}
