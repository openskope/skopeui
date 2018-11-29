FROM node:11

LABEL maintainer="Allen Lee <allen.lee@asu.edu>"

RUN apt-get update && apt-get upgrade -y -o Dpkg::Options::="--force-confold" && \
    apt-get install -y realpath nasm libjpeg-turbo-progs

WORKDIR /code
COPY app /code
RUN yarn install

CMD ["yarn", "dev"]
