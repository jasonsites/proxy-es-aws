const AWS = require('aws-sdk')

module.exports = {
  createSignedAWSRequest,
  getAWSCredentials,
  getAWSEndpoint,
  sendAWSRequest,
  setAWSCredentialProviderChain,
}

/**
 * Compose the request data to be sent to the AWS Node HTTP Client
 * @param {String} params.body        - raw client request body
 * @param {Object} params.credentials - aws credentials
 * @param {String} params.endpoint    - aws elasticsearch endpoint
 * @param {Object} params.headers     - client request headers
 * @param {String} params.method      - client request method
 * @param {String} params.path        - client request path (url)
 * @param {String} params.region      - aws region
 * @return {Object}
 */
function createSignedAWSRequest(params) {
  const { body, credentials, endpoint, headers, method = 'GET', path, region } = params

  const request = new AWS.HttpRequest(endpoint)
  Object.assign(request, {
    body,
    headers: {
      Host: endpoint.host,
      'presigned-expires': false,
    },
    method,
    path,
    region,
  })

  const signed = signAWSRequest({ credentials, request })
  return mergeAllowedClientHeaders({ headers, request: signed })
}

/**
 * Construct an AWS Credentials object based on data set
 * in the AWS Credential Provider Chain
 * @return {Promise}
 */
function getAWSCredentials() {
  return new AWS.CredentialProviderChain().resolvePromise()
}

/**
 * Construct an AWS endpoint object based on ES cluster endpoint
 * @param {String} params.endpoint -
 * @return {Object}
 */
function getAWSEndpoint({ endpoint }) {
  return new AWS.Endpoint(endpoint)
}

/**
 * Add client headers, stripping out:
 *  - transport encoding
 *  - connection control
 *  - original unsigned host
 *  - origin
 * @param {Object} params.headers - client headers
 * @param {Object} params.request - signed AWS request object
 *
 */
function mergeAllowedClientHeaders({ headers, request }) {
  const prohibited = ['accept-encoding', 'connection', 'host', 'origin']
  request.headers = Object.entries(headers).reduce((memo, header) => {
    const [key, val] = header
    if (prohibited.indexOf(key) === -1) memo[key] = val // eslint-disable-line
    return memo
  }, request.headers)
  return request
}

/**
 * AWS HTTP request handler
 * @param {String} req - signed aws request
 * @return {Promise}
 */
function sendAWSRequest(req) {
  return new Promise((resolve, reject) => {
    const send = new AWS.NodeHttpClient()
    send.handleRequest(req, null, (res) => {
      let body = ''
      res.on('data', (chunk) => {
        body += chunk
      })
      res.on('end', () => {
        const { headers, statusCode } = res
        resolve({ body, headers, statusCode })
      })
      res.on('error', (err) => {
        console.log(`Error: ${err}`)
        reject(err)
      })
    }, (err) => {
      console.log(`Error: ${err}`)
      reject(err)
    })
  })
}

/**
 * Sets the default credential providers in order of precedence:
 *   1. Environment variables with prefix 'AWS'
 *   2. Environment variables with prefix 'AMAZON'
 *   3. AWS profile (from file system config)
 *   4. EC2 instance metadata service
 * @param {String} param.profile - aws profile name
 * @return {undefined}
 */
function setAWSCredentialProviderChain({ profile }) {
  AWS.CredentialProviderChain.defaultProviders = [
    () => new AWS.EnvironmentCredentials('AWS'),
    () => new AWS.EnvironmentCredentials('AMAZON'),
    () => new AWS.SharedIniFileCredentials({ profile }),
    () => new AWS.EC2MetadataCredentials(),
  ]
}

/**
 * Signs an AWS HTTP Request object with the provided AWS Credentials object
 * @param {Object} param.credentials - aws credentials object
 * @param {Object} param.request     - aws http request object
 * @return {Object} signed request
 */
function signAWSRequest({ credentials, request }) {
  const signer = new AWS.Signers.V4(request, 'es')
  signer.addAuthorization(credentials, new Date())
  return request
}
