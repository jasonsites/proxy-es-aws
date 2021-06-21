FROM node:16

LABEL maintainer="email@jasonsites.com"

ENV APP /home/app
ENV NODE_ENV production

RUN apt-get update && \
  apt-get upgrade -y && \
  wget https://github.com/Yelp/dumb-init/releases/download/v1.2.1/dumb-init_1.2.1_amd64.deb && \
  dpkg -i dumb-init_*.deb && \
  useradd --user-group --create-home --shell /bin/false app

WORKDIR $APP
COPY package-lock.json package.json ./
RUN chown -R app:app $APP/*
USER app
RUN npm i --production

USER root
COPY bin bin/
RUN chmod +x bin/proxy-es-aws
COPY src src/
RUN chown -R app:app $APP/*
USER app

EXPOSE 9210

ENTRYPOINT ["/usr/bin/dumb-init", "--"]

CMD ["node", "."]
