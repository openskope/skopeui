const { Server } = require('@hapi/hapi')
const ApiRoutes = require('../api')
const consola = require('consola')
const HapiNuxt = require('@nuxtjs/hapi')
const Bell = require('@hapi/bell')
let config = require('../nuxt.config.js')

const server = new Server({
  host: process.env.HOST || '0.0.0.0',
  port: process.env.PORT || 3000,
})

server
  .register([
    {
      plugin: Bell,
    },
    {
      plugin: HapiNuxt,
    },
  ])
  //  .then(() => {
  //    server.auth.strategy('github', 'bell', {
  //      provider: 'github',
  //      password: config.auth.COOKIE_ENCRYPTION_PASSWORD,
  //      clientId: config.auth.keys.GITHUB_CLIENT_ID,
  //      clientSecret: config.auth.keys.GITHUB_CLIENT_SECRET,
  //      isSecure: !config.dev,
  //      location: 'https://skope.comses.net',
  //    })
  //    server.auth.strategy('google', 'bell', {
  //      provider: 'google',
  //      password: config.auth.COOKIE_ENCRYPTION_PASSWORD,
  //      clientId: config.auth.keys.GOOGLE_CLIENT_ID,
  //      clientSecret: config.auth.keys.GOOGLE_CLIENT_SECRET,
  //      isSecure: !config.dev
  //    })
  //  })
  .then(() => server.route(ApiRoutes))
  .then(() => server.start())
  .then(() =>
    consola.ready({
      message: `Server running at: ${server.info.uri}`,
      badge: true,
    })
  )
  .catch((err) => {
    consola.error(err)
    throw err
  })
