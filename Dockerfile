FROM node:11

LABEL maintainer="Allen Lee <allen.lee@asu.edu>"

ARG BUILD_ARG_HOST="0.0.0.0"

RUN apt-get update && apt-get upgrade -y -o Dpkg::Options::="--force-confold" && \
    apt-get install -y realpath nasm libjpeg-turbo-progs

EXPOSE 3000

WORKDIR /code
COPY app /code
RUN yarn install

ENV HOST=${BUILD_ARG_HOST}

CMD ["yarn", "dev"]
