/**
 * Injects favicon <link> tags with a cache-busting `?v=` query so that browsers
 * pick up newly uploaded favicons (uploaded via /admin) without manual reloads.
 *
 * The version is sourced from `/api/favicon-version`, which reads .meta.json
 * from the runtime favicons directory.
 */
export default defineNuxtPlugin(async () => {
  const { data } = await useFetch<{ version: number }>('/api/favicon-version', {
    key: 'favicon-version',
    default: () => ({ version: 0 }),
  })

  const v = data.value?.version || 0
  const q = v > 0 ? `?v=${v}` : ''

  useHead({
    link: [
      {
        rel: 'icon',
        type: 'image/x-icon',
        href: `/favicons/favicon.ico${q}`,
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        href: `/favicons/favicon-16x16.png${q}`,
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: `/favicons/favicon-32x32.png${q}`,
      },
      {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: `/favicons/apple-touch-icon.png${q}`,
      },
    ],
  })
})
