FROM node:lts-buster

LABEL maintainer="Allen Lee <allen.lee@asu.edu>"

EXPOSE 3000

WORKDIR /code

COPY package.json yarn.lock /code/
RUN yarn install

COPY . /code

CMD ["yarn", "dev"]
