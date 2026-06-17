import { getFaviconVersion } from '~/server/utils/favicons'

export default defineEventHandler(async (event) => {
  const config = await getConfig()
  const title = config?.title || 'Mafl'
  const description = config?.meta?.description || title

  const version = await getFaviconVersion()
  const q = version > 0 ? `?v=${version}` : ''

  setResponseHeader(event, 'content-type', 'application/manifest+json')
  // The manifest itself references favicon URLs with a ?v=<version> query.
  // If browsers cache this manifest aggressively they keep using the old
  // icon URLs even after a regenerate. no-cache forces a revalidation on
  // every navigation so the icon URLs always reflect the latest version.
  setResponseHeader(event, 'Cache-Control', 'no-cache, must-revalidate')

  return {
    id: '/',
    scope: '/',
    start_url: '/',
    display: 'standalone',
    name: title,
    short_name: title,
    description,
    theme_color: '#609966',
    background_color: '#1a1a2e',
    icons: [
      {
        sizes: '192x192',
        src: `/favicons/pwa-192x192.png${q}`,
        type: 'image/png',
      },
      {
        sizes: '512x512',
        src: `/favicons/pwa-512x512.png${q}`,
        type: 'image/png',
      },
    ],
  }
})
