const pkg = require("./package");

module.exports = {
  /*
   ** Headers of the page
   */
  head: {
    title: pkg.name,
    meta: [
      { hid: "charset", charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { hid: "description", name: "description", content: pkg.description },
    ],
    link: [
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css?family=Material+Icons",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css?family=Roboto:300,400,500,700",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css?family=Bitter:400,700",
      },
      {
        rel: "stylesheet",
        href: "https://use.fontawesome.com/releases/v5.11.2/css/all.css",
      },
    ],
  },

  /*
   ** Customize the progress-bar color
   */
  loading: { color: "#fff" },

  /*
   ** Global CSS
   */

  /*
   ** Plugins to load before mounting the App
   */
  plugins: [
    { src: "~/plugins/vue-gtag.js", ssr: true },
    { src: "~/plugins/nuxt-leaflet.js", ssr: false },
    { src: "~/plugins/axios.js", ssr: false },
    { src: "~/plugins/store.js", ssr: true },
    { src: "~/plugins/download.js", mode: "client" },
  ],

  /*
   ** Nuxt.js modules
   */
  modules: [
    // Doc: https://axios.nuxtjs.org/usage
    "@nuxtjs/axios",
    // https://www.npmjs.com/package/@nuxtjs/markdownit
    "@nuxtjs/markdownit",
    [
      "vue-warehouse/nuxt",
      {
        vuex: true,
        plugins: ["store/plugins/expire", "store/plugins/defaults"],
        storages: [
          "store/storages/localStorage",
          "store/storages/cookieStorage",
        ],
      },
    ],
  ],
  // [optional] markdownit options
  // See https://github.com/markdown-it/markdown-it
  markdownit: {
    injected: true,
    preset: "default",
    linkify: true,
    breaks: true,
    use: ["markdown-it-div", "markdown-it-attrs"],
  },
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
      GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID || "",
      GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET || "",
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
    },
    COOKIE_ENCRYPTION_PASSWORD: process.env.SECRET_KEY,
    strategies: {
      github: {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
      },
      google: {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
      },
    },
  },

  /*
   ** process environment variables
   */
  env: {},

  vue: {
    config: {
      devtools: true,
    },
  },

  dev: process.env.NODE_ENV !== "production",

  buildModules: ["@nuxtjs/vuetify", "@nuxtjs/pwa"],
  pwa: {
    manifest: {
      short_name: "skope",
      name: "SKOPE: Synthesizing Knowledge of Past Environments",
      prefer_related_applications: false,
      display: "fullscreen",
    },
  },

  vuetify: {
    optionsPath: "./assets/style/vuetify.js",
    customVariables: ["./assets/style/variables.scss"],
    treeShake: true,
    defaultAssets: {
      icons: "fa",
    },
  },

  /*
   ** Build configuration
   */
  build: {
    babel: {
      presets({ isServer }) {
        return [
          ["@nuxt/babel-preset-app", { loose: true, corejs: { version: 3 } }],
        ];
      },
    },
    transpile: ["vuetify/lib"],

    /*
     ** You can extend webpack config here
     */
    extend(config, { isDev, isClient }) {
      config.node = { fs: "empty" };
      // Run ESLint on save
      config.module.rules.push({
        enforce: "pre",
        test: /\.(js|vue)$/,
        loader: "eslint-loader",
        exclude: /(node_modules)/,
      });
      if (isClient) {
        config.devtool = "source-map";
      }
    },
  },
};
