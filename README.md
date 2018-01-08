# Proxy server for AWS Elasticsearch Service

## Installing
Prerequisites:
- [Node 8+](https://nodejs.org)
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
$ proxy-es-aws --port {proxy-port} --profile {aws-profile} --region {aws-region} --endpoint {aws-es-cluster-endpoint}
```

You can also `export` your AWS Access Key Id and Secret Access Key as environment variables
```shell
# credentials set using environment variables will take precedence over an AWS profile
$ export AWS_ACCESS_KEY_ID={aws-access-key-id}
$ export AWS_SECRET_ACCESS_KEY={aws-secret-access-key}

$ proxy-es-aws --port {proxy-port} --region {aws-region} --endpoint {aws-es-cluster-endpoint}
```

To run with Docker, in the root of the project directory
```shell
$ docker build -t proxy-es-aws .

$ docker run -it -p {proxy-port}:{proxy-port}\
  -e AWS_ACCESS_KEY_ID={aws-access-key-id}\
  -e AWS_SECRET_ACCESS_KEY={aws-secret-access-key}\
  -e PORT={proxy-port}\
  -e REGION={aws-region}\
  -e ENDPOINT={aws-es-cluster-endpoint}\
  --rm proxy-es-aws

# Note: AWS credential profiles are not currently supported while running in a container
```

To run via docker-compose, create a `.env` file in the project root, replacing the values for each variable
```
AWS_ACCESS_KEY_ID={aws-access-key-id}
AWS_SECRET_ACCESS_KEY={aws-secret-access-key}
DEBUG={true || false}
PORT={proxy-port}
REGION={aws-region}
ENDPOINT={aws-es-cluster-endpoint}
```
```shell
$ docker-compose up
```

## LICENSE
Copyright (c) 2018 Jason Sites.

Licensed under the [MIT License](LICENSE.md)
