// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@nuxthq/ui'],
  ui: {
    icons: ['tabler', 'carbon'],
    safelistColors: ['amber', 'orange']
  },
  css: [
    '~/assets/css/normalize.css',
    '~/assets/css/style.css',
  ],
  colorMode: {
    preference: 'light'
  }
})
