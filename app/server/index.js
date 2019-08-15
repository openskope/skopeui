const { Server } = require('@hapi/hapi')
const Routes = require('../api')
const consola = require('consola')
const HapiNuxt = require('@nuxtjs/hapi')
const Bell = require('@hapi/bell')

const server = new Server({
  host: process.env.HOST || '0.0.0.0',
  port: process.env.PORT || 3000
})

server
  .register([
    {
      plugin: Bell
    },
    {
      plugin: HapiNuxt
    }
  ])
  .then(() =>
    server.auth.strategy('github', 'bell', {
      provider: 'github',
      password: 'cookie_encryption_password_secure',
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      location: 'https://skope.comses.net',
      scope: []
    })
  )
  .then(() => server.route(Routes))
  .then(() => server.start())
  .then(() =>
    consola.ready({
      message: `Server running at: ${server.info.uri}`,
      badge: true
    })
  )
  .catch(err => {
    consola.error(err)
    throw err
  })
