export default defineEventHandler(async (event) => {
  const config = await getConfig()
  const title = config?.title || 'Mafl'

  setResponseHeader(event, 'content-type', 'application/manifest+json')

  return {
    id: '/',
    scope: '/',
    start_url: '/',
    display: 'standalone',
    name: title,
    short_name: title,
    description: title,
    theme_color: '#609966',
    background_color: '#1a1a2e',
    icons: [
      {
        sizes: '192x192',
        src: '/favicons/pwa-192x192.png',
        type: 'image/png',
      },
      {
        sizes: '512x512',
        src: '/favicons/pwa-512x512.png',
        type: 'image/png',
      },
    ],
  }
})
