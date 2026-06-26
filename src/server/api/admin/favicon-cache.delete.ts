import { existsSync, unlinkSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { readBody, createError } from 'h3'

const CACHE_DIR = resolve('./data/.favicon-cache')

function safeName(domain: string): string {
  return domain.replace(/[^a-zA-Z0-9.-]/g, '_')
}

/**
 * Normalize whatever is stored in `iconFavicon` to the same domain key the
 * favicon proxy (`/api/favicon/[...domain]`) caches under: strip protocol and
 * any trailing path so "https://example.com/foo" → "example.com".
 */
function normalizeDomain(input: string): string {
  return input
    .trim()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '')
}

export default defineEventHandler(async (event) => {
  await requireAdminSession(event)

  const body = await readBody<{ domain?: string }>(event)
  const raw = body?.domain

  if (!raw || typeof raw !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'Missing domain' })
  }

  const domain = normalizeDomain(raw)

  if (!domain || domain.includes('..') || domain.includes('/')) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid domain' })
  }

  const fileName = safeName(domain)
  const dataPath = join(CACHE_DIR, `${fileName}.dat`)
  const metaPath = join(CACHE_DIR, `${fileName}.json`)

  let removed = false
  for (const filePath of [dataPath, metaPath]) {
    if (existsSync(filePath)) {
      unlinkSync(filePath)
      removed = true
    }
  }

  return { ok: true, domain, removed }
})
