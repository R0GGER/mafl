import type { Meta } from '~/types'

const DEFAULT_META_ROBOTS = 'noindex, nofollow'

export function buildHeadMeta(meta: Meta | undefined, title: string) {
  const tags: Array<{ name?: string, property?: string, content: string }> = []

  if (meta?.description) {
    tags.push({ name: 'description', content: meta.description })
  }
  if (meta?.keywords) {
    tags.push({ name: 'keywords', content: meta.keywords })
  }
  if (meta?.author) {
    tags.push({ name: 'author', content: meta.author })
  }

  tags.push({ name: 'robots', content: meta?.robots ?? DEFAULT_META_ROBOTS })

  const ogTitle = meta?.og?.title || title
  const ogDescription = meta?.og?.description || meta?.description

  if (ogTitle) {
    tags.push({ property: 'og:title', content: ogTitle })
  }
  if (ogDescription) {
    tags.push({ property: 'og:description', content: ogDescription })
  }
  if (meta?.og?.image) {
    tags.push({ property: 'og:image', content: meta.og.image })
  }
  if (meta?.og?.type) {
    tags.push({ property: 'og:type', content: meta.og.type })
  }

  return tags
}
