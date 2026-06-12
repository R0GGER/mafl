import process from 'node:process'

export default defineNuxtConfig({
  srcDir: 'src',
  app: {
    head: {
      link: [
        // Favicon links are injected at runtime via src/plugins/favicons.ts so
        // they can include a cache-busting ?v=<version> derived from the
        // currently uploaded custom favicon (managed via /admin).
        {
          rel: 'manifest',
          href: '/manifest.webmanifest',
        },
      ],
    },
  },
  pwa: {
    registerType: 'autoUpdate',
    scope: '/',
    base: '/',
    manifest: false,
    workbox: {
      globPatterns: ['**/*.{js,css,html,txt,png,ico,svg}'],
      navigateFallbackDenylist: [/^\/api\//, /^\/admin/],
      cleanupOutdatedCaches: true,
      skipWaiting: true,
      clientsClaim: true,
      runtimeCaching: [
        {
          urlPattern: /^\/api\/favicon\/.+/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'favicon-cache',
            expiration: {
              maxEntries: 200,
              maxAgeSeconds: 7 * 24 * 60 * 60,
            },
          },
        },
        {
          urlPattern: /^\/api\/icon-url/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'icon-url-cache',
            expiration: {
              maxEntries: 200,
              maxAgeSeconds: 7 * 24 * 60 * 60,
            },
          },
        },
      ],
    },
    writePlugin: true,
    devOptions: {
      enabled: process.env.VITE_PLUGIN_PWA === 'true',
    },
  },
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode',
    '@nuxtjs/i18n',
    '@vueuse/nuxt',
    '@vite-pwa/nuxt',
    'nuxt-icon',
  ],
  i18n: {
    locales: [
      {
        code: 'en',
        iso: 'en-US',
        name: 'English',
        file: 'en-US.json',
      },
      {
        code: 'ru',
        iso: 'ru-RU',
        name: 'Русский',
        file: 'ru-RU.json',
      },
      {
        code: 'zh',
        iso: 'zh-CN',
        name: '中文',
        file: 'zh-CN.json',
      },
      {
        code: 'hi',
        iso: 'hi-IN',
        name: 'हिंदी',
        file: 'hi-IN.json',
      },
      {
        code: 'es',
        iso: 'es-ES',
        name: 'Español',
        file: 'es-ES.json',
      },
      {
        code: 'ar',
        iso: 'ar-SA',
        name: 'اللغة السعودية',
        file: 'ar-SA.json',
      },
      {
        code: 'pl',
        iso: 'pl-PL',
        name: 'Polski',
        file: 'pl-PL.json',
      },
      {
        code: 'fr',
        iso: 'fr-FR',
        name: 'Français',
        file: 'fr-FR.json',
      },
      {
        code: 'de',
        iso: 'de-DE',
        name: 'Deutsch',
        file: 'de-DE.json',
      },
      {
        code: 'gr',
        iso: 'gr-GR',
        name: 'Ελληνικά',
        file: 'gr-GR.json',
      },
      {
        code: 'nl',
        iso: 'nl-NL',
        name: 'Nederlands',
        file: 'nl-NL.json',
      },
    ],
    strategy: 'no_prefix',
    langDir: 'locales',
    defaultLocale: 'en',
  },
  tailwindcss: {
    cssPath: '~/assets/style/tailwind.css',
  },
  colorMode: {
    classSuffix: '',
  },
  runtimeConfig: {
    adminPasswordHash: '',
    sessionPassword: '',
  },
  nitro: {
    storage: {
      data: {
        driver: 'fs',
        base: './data',
      },
    },
    experimental: {
      websocket: true,
      tasks: true,
    },
  },
})
