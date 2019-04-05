FROM node:11

LABEL maintainer="Allen Lee <allen.lee@asu.edu>"

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    libjpeg-turbo-progs \
    nasm \
    realpath \
    && apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

EXPOSE 3000

WORKDIR /code

COPY package.json /code
RUN yarn install

COPY . /code

CMD ["yarn", "dev"]
