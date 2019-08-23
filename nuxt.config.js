module.exports = {
  /*
  ** Headers of the page
  */
  head: {
    title: 'Wedding',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'Wedding wishlist' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Thasadith' }
    ]
  },
  plugins: [
    { src: './plugins/stripeCheckOut', ssr: false },
    { src: './plugins/vue-js-modal', ssr: false }
  ],
  /*
  ** Global CSS
  */
  css: ['./assets/css/tailwind.css'],
  /*
  ** Add axios globally
  */
  build: {
    vendor: ['axios'],
    /*
    ** Run ESLINT on save
    */
    extend (config, ctx) {
      /* if (ctx.isDev && ctx.isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      } */
    }
  },
  server: {
    host: '0.0.0.0' // default: localhost
  },
  serverMiddleware: [
    // API middleware
    '~/api/index.js'
  ]
}
