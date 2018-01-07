const AWS = require('aws-sdk')

module.exports = {
  getCredentials,
  getEndpoint,
  sendRequest,
  setCredentialProviderChain,
}

function buildRequest(params) {
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

  const signed = signRequest({ credentials, request })
  return mergeAllowedClientHeaders({ headers, request: signed })
}

function getCredentials() {
  return new AWS.CredentialProviderChain().resolvePromise()
}

function getEndpoint({ host }) {
  return new AWS.Endpoint(host)
}

/**
 * Add user agent headers, stripping out:
 *  - transport encoding
 *  - connection control
 *  - original unsigned host
 *  - origin
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

function sendRequest(params) {
  return new Promise((resolve, reject) => {
    const req = buildRequest(params)
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

function setCredentialProviderChain({ profile }) {
  AWS.CredentialProviderChain.defaultProviders = [
    () => new AWS.EnvironmentCredentials('AWS'),
    () => new AWS.EnvironmentCredentials('AMAZON'),
    () => new AWS.SharedIniFileCredentials({ profile }),
    () => new AWS.EC2MetadataCredentials(),
  ]
}

function signRequest({ credentials, request }) {
  const signer = new AWS.Signers.V4(request, 'es')
  signer.addAuthorization(credentials, new Date())
  return request
}
