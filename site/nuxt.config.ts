export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: false },
  css: ['~/assets/css/main.css'],
  nitro: {
    prerender: {
      // The service/about/contact routes aren't rebuilt yet, so don't let the
      // crawler chase those nav links and fail the build on their 404s.
      crawlLinks: false,
      failOnError: false,
      routes: ['/']
    }
  },
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
