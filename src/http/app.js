const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const compress = require('koa-compress')
const chalk = require('chalk')

const {
  getCredentials,
  getEndpoint,
  sendRequest,
  setCredentialProviderChain,
} = require('../aws')
const { getArguments } = require('../cli')
const errorHandler = require('./middleware/error-handler')

const app = new Koa()

module.exports = app

app.initialize = async function initialize() {
  try {
    const args = await getArguments()
    const { debug } = args
    if (debug) console.log(chalk.cyan('Command line arguments:'), args)
    setCredentialProviderChain(args)
    const options = await getInitOptions(args)
    if (debug) console.log(chalk.cyan('Server options:'), options)

    app.use(errorHandler)
    app.use(bodyParser())
    app.use(createHandler(options))
    app.use(compress())

    const { port } = options
    app.server = app.listen(port)
    registerListeners(app)
    console.log(chalk.magenta(`AWS Elasticsearch Proxy listening on port ${port}`))
  } catch (err) {
    console.error(chalk.red('Error starting application'), err)
    process.exit(1)
  }
}

function createHandler(options) {
  return async (ctx) => {
    const { credentials, endpoint, region } = options
    const { rawBody: body, header: headers, method, url: path } = ctx.request

    console.log(chalk.cyan(method, path))

    const params = { body, credentials, endpoint, headers, method, path, region }
    const res = await sendRequest(params)

    ctx.status = 200
    ctx.type = 'application/json'
    ctx.response.header = stripProxyResHeaders(res)
    ctx.body = res.body
  }
}

async function getInitOptions(args) {
  const { debug, endpoint, host, port, profile, region } = args
  const options = { debug, host, port, profile, region }
  options.endpoint = getEndpoint({ host: endpoint.replace(/(https?:\/\/)/gi, '') })
  options.credentials = await getCredentials()
  return options
}

function registerListeners({ server }) {
  const serverClose = () => {
    server.close((err) => {
      if (err) {
        console.error(err)
        process.exit(1)
      }
      process.exit(0)
    })
  }
  process.on('SIGINT', () => {
    console.log(chalk.bgBlack.yellow('Received SIGINT >>> Shutting down...'))
    serverClose()
  })
  process.on('SIGTERM', () => {
    console.log(chalk.bgBlack.yellow('Received SIGTERM >>> Shutting down...'))
    serverClose()
  })
}

function stripProxyResHeaders(res) {
  return Object.entries(res.headers).reduce((memo, header) => {
    const [key, val] = header
    if (key !== undefined && key !== 'connection' && key !== 'content-encoding') {
      memo[key] = val // eslint-disable-line
    }
    return memo
  }, {})
}
