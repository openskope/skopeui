# syntax=docker/dockerfile:1

FROM node:lts-buster

LABEL maintainer="Allen Lee <allen.lee@asu.edu>"

EXPOSE 3000

WORKDIR /code

COPY package.json yarn.lock /code/
RUN set -ex; \
    if [ "$NODE_ENV" = "production" ]; then \
        yarn install --no-cache --frozen-lockfile --production; \
    elif [ "$NODE_ENV" = "test" ]; then \
        yarn install --no-cache --frozen-lockfile; \
    else \
        yarn install; \
    fi; \
    yarn cache clean;

COPY . /code

CMD ["yarn", "dev"]
