const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const compress = require('koa-compress')
const chalk = require('chalk')

const {
  createSignedAWSRequest,
  getAWSCredentials,
  getAWSEndpoint,
  sendAWSRequest,
  setAWSCredentialProviderChain,
} = require('../aws')
const { getArguments } = require('../cli')
const errorHandler = require('./middleware/error-handler')

const app = new Koa()

module.exports = app

/**
 * Initialize application and start server
 * @return {Promise}
 */
app.initialize = async function initialize() {
  try {
    const args = await getArguments()
    const { debug } = args
    if (debug) console.log(chalk.cyan('Command line arguments:'), args)
    setAWSCredentialProviderChain(args)
    const options = await getInitOptions(args)
    if (debug) console.log(chalk.cyan('Server options:'), options)

    app.use(errorHandler)
    app.use(bodyParser())
    app.use(createHandler(options))
    app.use(compress())

    const { port } = options
    app.server = app.listen(port)
    registerListeners()
    console.log(chalk.magenta(`AWS Elasticsearch Proxy listening on port ${port}`))
  } catch (err) {
    console.error(chalk.red('Error starting application'), err)
    process.exit(1)
  }
}

/**
 * Creates request handler middleware
 * @param {Object} options.credentials  - aws credentials object
 * @param {Object} options.endpoint     - aws elasticsearch endpoint
 * @param {Object} options.region       - aws region
 */
function createHandler(options) {
  /**
   * Client request handler
   * Data from the incoming request (plus options) is forwarded to the AWS module
   */
  return async (ctx) => {
    const { credentials, endpoint, region } = options
    const { rawBody: body, header: headers, method, url: path } = ctx.request

    console.log(chalk.cyan(method, path))

    const params = { body, credentials, endpoint, headers, method, path, region }
    const req = createSignedAWSRequest(params)
    const res = await sendAWSRequest(req)

    ctx.status = 200
    ctx.type = 'application/json'
    ctx.response.header = stripProxyResHeaders(res)
    ctx.body = res.body
  }
}

/**
 * Composes server initialization options from CLI arguments
 * @param {Boolean} args.debug    - debug flag
 * @param {String}  args.endpoint - aws elasticsearch endpoint
 * @param {String}  args.host     - proxy host
 * @param {Number}  args.port     - proxy port
 * @param {String}  args.profile  - aws credentials profile
 * @param {String}  args.region   - aws region
 * @return {Promise}
 */
async function getInitOptions(args) {
  const { debug, endpoint, host, port, profile, region } = args
  const options = { debug, host, port, profile, region }
  options.endpoint = getAWSEndpoint({ endpoint })
  options.credentials = await getAWSCredentials()
  return options
}

/**
 * Register process signal listeners
 * @return {undefined}
 */
function registerListeners() {
  const exit = function exit(signal) {
    console.log(chalk.bgBlack.yellow(`Received ${signal} => Exiting`))
    process.exit()
  }
  const SIGABRT = 'SIGABRT'
  const SIGHUP = 'SIGHUP'
  const SIGINT = 'SIGINT'
  const SIGQUIT = 'SIGQUIT'
  const SIGTERM = 'SIGTERM'

  process.on(SIGABRT, () => exit(SIGABRT))
  process.on(SIGHUP, () => exit(SIGHUP))
  process.on(SIGINT, () => exit(SIGINT))
  process.on(SIGQUIT, () => exit(SIGQUIT))
  process.on(SIGTERM, () => exit(SIGTERM))
}

/**
 * Strip connection control and transport encoding headers from the proxy response
 * @param {Object} res - proxy response
 * @return {Object}
 */
function stripProxyResHeaders(res) {
  return Object.entries(res.headers).reduce((memo, header) => {
    const [key, val] = header
    const invalid = [undefined, 'connection', 'content-encoding']
    if (invalid.indexOf(key) === -1) {
      memo[key] = val // eslint-disable-line
    }
    return memo
  }, {})
}
