import { parseDocument } from 'yaml'
import { ZodError } from 'zod'
import { configFileName } from '~/server/utils/config'
import { findFaviconSourceAsset } from '~/server/utils/favicons'
import { configSchema } from '~/server/validations'

interface ExistingLogo {
  type?: string
  text?: string
  image?: string
  fontSize?: string
  fontWeight?: string | number
  fontFamily?: string
  color?: string
  backgroundColor?: string
  borderRadius?: string
  padding?: string
}

// Build the new `logo` config based on what's already there. If the user has a
// text-only or both-logo, keep the existing text + styling and just point the
// image at the favicon source. Otherwise default to a plain image-only logo.
function buildLogo(image: string, existing: unknown): Record<string, unknown> | string {
  if (existing && typeof existing === 'object' && !Array.isArray(existing)) {
    const e = existing as ExistingLogo
    if ((e.type === 'text' || e.type === 'both') && typeof e.text === 'string' && e.text.length > 0) {
      const next: Record<string, unknown> = { type: 'both', image, text: e.text }
      for (const k of ['fontSize', 'fontWeight', 'fontFamily', 'color', 'backgroundColor', 'borderRadius', 'padding'] as const) {
        if (e[k] !== undefined) next[k] = e[k]
      }
      return next
    }
  }
  return { type: 'image', image }
}

export default defineEventHandler(async (event) => {
  await requireAdminSession(event)

  const sourceAsset = findFaviconSourceAsset()
  if (!sourceAsset) {
    throw createError({
      statusCode: 409,
      statusMessage: 'No custom favicon uploaded — upload one first',
    })
  }

  const storage = useStorage('data')
  const raw = await storage.getItem<string>(configFileName)
  if (typeof raw !== 'string') {
    throw createError({ statusCode: 500, statusMessage: 'config.yml is missing' })
  }

  // parseDocument keeps comments & whitespace so the user's hand-edited
  // config.yml stays readable after the patch.
  let doc
  try {
    doc = parseDocument(raw)
  }
  catch (e: any) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Cannot parse current config.yml',
      data: { error: e.message },
    })
  }

  const existing = doc.toJSON()?.logo
  const newLogo = buildLogo(sourceAsset, existing)
  doc.set('logo', newLogo)

  const newRaw = String(doc)

  let parsed: unknown
  try {
    parsed = doc.toJSON()
  }
  catch (e: any) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to serialise patched config' })
  }

  try {
    configSchema.parse(parsed)
  }
  catch (e) {
    if (e instanceof ZodError) {
      throw createError({
        statusCode: 422,
        statusMessage: 'Patched config failed validation',
        data: {
          error: JSON.stringify(
            e.format(),
            (key, val) => (key === '_errors' && !val.length) ? undefined : val,
            2,
          ),
        },
      })
    }
    throw e
  }

  await storage.setItem(configFileName, newRaw)

  return {
    ok: true,
    logo: newLogo,
    image: sourceAsset,
  }
})
