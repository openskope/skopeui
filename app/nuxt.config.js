const VuetifyLoaderPlugin = require('vuetify-loader/lib/plugin')
const pkg = require('./package')

module.exports = {
  mode: 'universal',

  /*
   ** Headers of the page
   */
  head: {
    title: pkg.name,
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: pkg.description }
    ],
    link: [
      { rel: 'icon', type: 'image/png', href: '/favicon-32x32.png' },
      { rel: 'icon', type: 'image/png', href: '/favicon-16x16.png' },
      {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/apple-touch-icon.png'
      },
      { rel: 'manifest', href: '/site.webmanifest' },
      {
        rel: 'stylesheet',
        href:
          'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons'
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css?family=Bitter:400,700'
      },
      {
        rel: 'stylesheet',
        href: 'https://use.fontawesome.com/releases/v5.11.2/css/all.css'
      }
    ]
  },

  /*
   ** Customize the progress-bar color
   */
  loading: { color: '#fff' },

  /*
   ** Global CSS
   */

  /*
   ** Plugins to load before mounting the App
   */
  plugins: [{ src: '~/plugins/nuxt-leaflet.js', ssr: false }],

  /*
   ** Nuxt.js modules
   */
  modules: [
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios',
    '@nuxtjs/pwa'
  ],
  /*
   ** Axios module configuration
   */
  axios: {
    // See https://github.com/nuxt-community/axios-module#options
  },

  /*
   ** use bell auth configuration instead: https://github.com/hapijs/bell
   */
  auth: {
    keys: {
      GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID || '',
      GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET || '',
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || ''
    },
    COOKIE_ENCRYPTION_PASSWORD: process.env.SECRET_KEY,
    strategies: {
      github: {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET
      },
      google: {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET
      }
    }
  },

  /*
   ** process environment variables
   */
  env: {},

  vue: {
    config: {
      devtools: true
    }
  },

  dev: process.env.NODE_ENV !== 'production',

  buildModules: ['@nuxtjs/vuetify'],

  vuetify: {
    optionsPath: './assets/style/vuetify.js',
    defaultAssets: {
      font: {
        family: 'Roboto'
      },
      icons: 'fa'
    }
  },

  /*
   ** Build configuration
   */
  build: {
    babel: {
      plugins: [
        ['@babel/plugin-proposal-decorators', { legacy: true }],
        ['@babel/plugin-proposal-class-properties', { loose: true }]
      ]
    },
    transpile: ['vuetify/lib'],
    plugins: [new VuetifyLoaderPlugin()],

    /*
     ** You can extend webpack config here
     */
    extend(config, ctx) {
      // Run ESLint on save
      if (ctx.isDev && ctx.isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }
      if (ctx.isClient) {
        config.devtool = 'source-map'
      }
    }
  }
}
