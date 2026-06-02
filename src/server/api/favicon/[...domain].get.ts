import { createReadStream, existsSync, mkdirSync, statSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { sendStream, setResponseHeader, createError } from 'h3'
import { getConfig, getDefaultConfig } from '~/server/utils/config'

const CACHE_DIR = resolve('./data/.favicon-cache')
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

function ensureCacheDir() {
  if (!existsSync(CACHE_DIR)) {
    mkdirSync(CACHE_DIR, { recursive: true })
  }
}

function safeName(domain: string): string {
  return domain.replace(/[^a-zA-Z0-9.-]/g, '_')
}

function isCacheValid(filePath: string): boolean {
  if (!existsSync(filePath)) return false
  const { mtimeMs } = statSync(filePath)
  return Date.now() - mtimeMs < CACHE_TTL_MS
}

export default defineEventHandler(async (event) => {
  const domain = getRouterParam(event, 'domain')

  if (!domain || domain.includes('..') || domain.includes('/')) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid domain' })
  }

  ensureCacheDir()

  const fileName = safeName(domain)
  const metaPath = join(CACHE_DIR, `${fileName}.json`)
  const dataPath = join(CACHE_DIR, `${fileName}.dat`)

  if (isCacheValid(dataPath) && existsSync(metaPath)) {
    const meta = JSON.parse(await (await import('node:fs/promises')).readFile(metaPath, 'utf-8'))
    const stat = statSync(dataPath)

    setResponseHeader(event, 'Content-Type', meta.contentType || 'image/png')
    setResponseHeader(event, 'Content-Length', stat.size)
    setResponseHeader(event, 'Cache-Control', 'public, max-age=604800')
    setResponseHeader(event, 'X-Favicon-Cache', 'HIT')

    return sendStream(event, createReadStream(dataPath))
  }

  const config = await getConfig()
  const faviconApi = (config?.faviconApi || getDefaultConfig().faviconApi).replace(/\/$/, '')
  const upstreamUrl = `${faviconApi}/${domain}`

  let response: Response
  try {
    response = await fetch(upstreamUrl, {
      signal: AbortSignal.timeout(10_000),
    })
  } catch {
    throw createError({ statusCode: 502, statusMessage: 'Favicon API unreachable' })
  }

  if (!response.ok) {
    throw createError({ statusCode: response.status, statusMessage: 'Favicon API error' })
  }

  const contentType = response.headers.get('content-type') || 'image/png'
  const buffer = Buffer.from(await response.arrayBuffer())

  const { writeFile } = await import('node:fs/promises')
  await Promise.all([
    writeFile(dataPath, buffer),
    writeFile(metaPath, JSON.stringify({ contentType, fetchedAt: Date.now() })),
  ])

  setResponseHeader(event, 'Content-Type', contentType)
  setResponseHeader(event, 'Content-Length', buffer.length)
  setResponseHeader(event, 'Cache-Control', 'public, max-age=604800')
  setResponseHeader(event, 'X-Favicon-Cache', 'MISS')

  return buffer
})
