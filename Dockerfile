FROM node:carbon

ENV HOME /home/app
ENV NODE_ENV production

RUN apt-get update &&\
  wget https://github.com/Yelp/dumb-init/releases/download/v1.2.1/dumb-init_1.2.1_amd64.deb &&\
  dpkg -i dumb-init_*.deb &&\
  apt-get install -y python-dev &&\
  apt-get install -y python-pip &&\
  pip install --upgrade pip awscli &&\
  pip install --upgrade pip awscli &&\
  useradd --user-group --create-home --shell /bin/false app

WORKDIR $HOME
COPY package-lock.json package.json ./
RUN chown -R app:app $HOME/* && chown -R app:app /usr/local/*
USER app
RUN npm i --production

USER root
COPY bin bin/
RUN chmod +x bin/proxy-es-aws
COPY src src/
RUN chown -R app:app $HOME/*
USER app

EXPOSE 9210

ENTRYPOINT ["/usr/bin/dumb-init", "--"]

CMD ["node", "."]
