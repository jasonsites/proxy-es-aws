# Proxy server for AWS Elasticsearch Service

## Installing
Prerequisites:
- [Node](https://nodejs.org)
- [Docker](https://www.docker.com/community-edition#/download) (optional)

Install as an executable node module
```shell
$ npm i -g proxy-es-aws
```

Or clone the project for use with Docker
```shell
$ git clone git@github.com:jasonsites/proxy-es-aws.git
$ cd proxy-es-aws
$ npm i
```

## Usage
### Examples

Start the proxy using your configured [aws credentials profile](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html)
```shell
$ proxy-es-aws --port <proxy-port> --profile <aws-profile> --region <aws-region> --endpoint <aws-es-cluster-endpoint>
```

You can also `export` your aws accessKeyId and secretAccessKey as environment variables
```shell
$ export AWS_ACCESS_KEY_ID=<aws-access-key-id>
$ export AWS_SECRET_ACCESS_KEY=<aws-secret-access-key>

$ proxy-es-aws --port <proxy-port> --region <aws-region> --endpoint <aws-es-cluster-endpoint>
```

To run with Docker, in the root of the project directory
```shell
$ docker build -t proxy-es-aws .

$ docker run -it -p <proxy-port>:<proxy-port>\
  -e AWS_ACCESS_KEY_ID=<aws-access-key-id>\
  -e AWS_SECRET_ACCESS_KEY=<aws-secret-access-key>\
  -e PORT=<proxy-port>\
  -e REGION=<aws-region>\
  -e ENDPOINT=<aws-es-cluster-endpoint>\
  --rm proxy-es-aws

# Note: AWS credentials profiles are not currently supported while running in a container
```

To run via docker-compose, create a `.env` file in the project root, replacing the values for each environment variable
```
AWS_ACCESS_KEY_ID=<aws-access-key-id>
AWS_SECRET_ACCESS_KEY=<aws-secret-access-key>
DEBUG=<true || false>
PORT=<proxy-port>
REGION=<aws-region>
ENDPOINT=<aws-es-cluster-endpoint>
```
```shell
$ docker-compose up
```

## Contributing
1. Clone it (`git clone git@github.com:jasonsites/proxy-es-aws.git`)
1. Create your feature branch (`git checkout -b my-new-feature`)
1. Commit your changes using [conventional changelog standards](https://github.com/bcoe/conventional-changelog-standard/blob/master/convention.md) (`git commit -am 'feat(US1234): adds my new feature'`)
1. Push to the branch (`git push origin my-new-feature`)
1. Create new Pull Request

## LICENSE
Copyright (c) 2018 Jason Sites.

Licensed under the [MIT License](LICENSE.md)
