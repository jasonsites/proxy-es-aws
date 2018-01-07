const yargs = require('yargs')

const {
  // AWS_ACCESS_KEY_ID,
  AWS_PROFILE,
  // AWS_SECRET_ACCESS_KEY,
  DEBUG,
  ENDPOINT,
  HOST,
  PORT,
  REGION,
} = process.env

module.exports = { getArguments }

function getArguments() {
  return setCliConfiguration().argv
}

function setCliConfiguration() {
  return yargs
    .usage('usage: $0 [options] <aws-elasticsearch-cluster-endpoint>')
    .option('h', {
      alias: 'host',
      default: HOST || '127.0.0.1',
      demand: false,
      describe: 'Host IP Address',
      type: 'string',
    })
    .option('p', {
      alias: 'port',
      default: PORT || 9200,
      demand: false,
      describe: 'Host Port',
      type: 'number',
    })
    .option('e', {
      alias: 'endpoint',
      default: ENDPOINT,
      demand: true,
      describe: 'AWS Elasticsearch Endpoint',
      type: 'string',
    })
    .option('r', {
      alias: 'region',
      default: REGION || 'us-west-2',
      demand: false,
      describe: 'AWS region',
      type: 'string',
    })
    .option('c', {
      alias: 'profile',
      default: AWS_PROFILE || 'default',
      demand: false,
      describe: 'AWS Credentials Profile',
      type: 'string',
    })
    // .option('k', {
    //   alias: 'keyId',
    //   default: AWS_ACCESS_KEY_ID,
    //   demand: false,
    //   describe: 'AWS Access Key ID',
    // })
    // .option('a', {
    //   alias: 'accessKey',
    //   default: AWS_SECRET_ACCESS_KEY,
    //   demand: false,
    //   describe: 'AWS Secret Access Key',
    // })
    .option('d', {
      alias: 'debug',
      default: DEBUG || false,
      demand: false,
      describe: 'Provides debug logging',
      type: 'boolean',
    })
    .help()
    .version()
    .strict()
}
