export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: false },
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'Aventura Dental Arts — Premium Esthetic Dentistry',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Premium esthetic dentistry in Aventura, Bay Harbor and Coral Gables. Advanced science with an artist’s touch.' }
      ],
      link: [{ rel: 'icon', href: '/images/favicon.ico' }]
    }
  }
})
