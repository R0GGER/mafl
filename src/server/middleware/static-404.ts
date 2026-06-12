// Short-circuits requests that look like missing static assets with a plain
// 404 response, so they never reach Nuxt's SSR renderer.
//
// Bot and vulnerability scanners constantly probe paths like /sitemap.xml,
// /bot-connect.js, /assets/js/auth.js, /static/style/protect/index.js, etc.
// Without this middleware every such request triggers a full SSR cycle and
// emits `[Vue Router warn]: No match found for location with path "..."`.
//
// Anything under a Nuxt/Nitro-served prefix (`/api/`, `/_nuxt/`, `/_ipx/`,
// `/favicons/`, the PWA manifest, the service worker, ...) is left alone so
// the regular handlers can serve it.

const STATIC_ASSET_EXT = /\.(?:js|mjs|cjs|css|map|xml|json|svg|png|jpe?g|gif|webp|avif|ico|bmp|woff2?|ttf|eot|otf|mp[34]|webm|ogg|wav|flac|pdf|txt|wasm|zip|tar|gz|7z|rar|env|sql|bak|asp|aspx|jsp|php)$/i

const ALLOWED_PREFIXES = [
  '/_nuxt/',
  '/_ipx/',
  '/__nuxt',
  '/_payload',
  '/api/',
  '/favicons/',
  '/favicon.ico',
  '/manifest.webmanifest',
  '/robots.txt',
  '/sw.js',
  '/workbox-',
  '/registerSW.js',
]

export default defineEventHandler((event) => {
  const rawPath = event.path || event.node.req.url || ''
  const path = rawPath.split('?')[0].split('#')[0]

  if (!STATIC_ASSET_EXT.test(path))
    return

  if (ALLOWED_PREFIXES.some(prefix => path === prefix || path.startsWith(prefix)))
    return

  setResponseStatus(event, 404)
  setResponseHeader(event, 'content-type', 'text/plain; charset=utf-8')
  return 'Not Found'
})
