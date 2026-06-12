import { existsSync } from 'node:fs'
import { configFileName } from '~/server/utils/config'
import {
  FAVICONS_PUBLIC_DIR,
  findFaviconSourceAsset,
  getFaviconMeta,
  listFaviconNames,
} from '~/server/utils/favicons'

function extractLogoImage(logo: unknown): string | null {
  if (typeof logo === 'string') return logo
  if (logo && typeof logo === 'object') {
    const obj = logo as { type?: string; image?: string }
    if ((obj.type === 'image' || obj.type === 'both') && typeof obj.image === 'string') {
      return obj.image
    }
  }
  return null
}

export default defineEventHandler(async (event) => {
  await requireAdminSession(event)

  const meta = await getFaviconMeta()
  const hasBundled = listFaviconNames().some(name =>
    existsSync(`${FAVICONS_PUBLIC_DIR}/${name}`),
  )

  const sourceAsset = findFaviconSourceAsset()

  // Cheap peek at the current logo so the UI can show whether the favicon is
  // already wired up as the site logo. We don't fail the whole status call if
  // reading the YAML hiccups - just leave it false.
  let usedAsLogo = false
  try {
    const storage = useStorage('data')
    const raw = await storage.getItem<string>(configFileName)
    if (typeof raw === 'string') {
      const { parse } = await import('yaml')
      const cfg = parse(raw) || {}
      const current = extractLogoImage(cfg.logo)
      if (sourceAsset && current === sourceAsset) usedAsLogo = true
    }
  }
  catch {}

  return {
    custom: !!meta,
    bundled: hasBundled,
    version: meta?.version || 0,
    source: meta?.source || null,
    generatedAt: meta?.generatedAt || null,
    variants: listFaviconNames(),
    sourceAsset,
    usedAsLogo,
  }
})
