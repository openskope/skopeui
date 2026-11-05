# syntax=docker/dockerfile:1

FROM node:lts-bookworm AS dependencies

ENV NODE_OPTIONS="--openssl-legacy-provider"

WORKDIR /code

COPY package.json package-lock.json ./
RUN npm ci && npm cache clean --force

FROM dependencies AS development

ENV NODE_ENV=development

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]

FROM dependencies AS build

ENV NODE_ENV=production

COPY . .
RUN npm run build

FROM node:lts-bookworm-slim AS production

ENV HOST=0.0.0.0 \
    NODE_ENV=production \
    PORT=3000

LABEL maintainer="Allen Lee <allen.lee@asu.edu>"

WORKDIR /code

COPY --from=build --chown=node:node /code/.output ./.output

USER node

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
