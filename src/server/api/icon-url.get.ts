import { createHash } from 'node:crypto'
import { createReadStream, existsSync, mkdirSync, statSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { sendStream, setResponseHeader, createError, getQuery } from 'h3'

const CACHE_DIR = resolve('./data/.icon-url-cache')
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

function ensureCacheDir() {
  if (!existsSync(CACHE_DIR)) {
    mkdirSync(CACHE_DIR, { recursive: true })
  }
}

function cacheKey(url: string): string {
  return createHash('sha256').update(url).digest('hex').slice(0, 32)
}

function isCacheValid(filePath: string): boolean {
  if (!existsSync(filePath)) return false
  const { mtimeMs } = statSync(filePath)
  return Date.now() - mtimeMs < CACHE_TTL_MS
}

function parseRemoteUrl(rawUrl: string): URL | null {
  try {
    const parsed = new URL(rawUrl)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null
    }
    return parsed
  }
  catch {
    return null
  }
}

export default defineEventHandler(async (event) => {
  const { url } = getQuery(event)
  const rawUrl = typeof url === 'string' ? url : ''

  const remoteUrl = parseRemoteUrl(rawUrl)
  if (!remoteUrl) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid URL' })
  }

  ensureCacheDir()

  const fileName = cacheKey(remoteUrl.toString())
  const metaPath = join(CACHE_DIR, `${fileName}.json`)
  const dataPath = join(CACHE_DIR, `${fileName}.dat`)

  if (isCacheValid(dataPath) && existsSync(metaPath)) {
    const meta = JSON.parse(await (await import('node:fs/promises')).readFile(metaPath, 'utf-8'))
    const stat = statSync(dataPath)

    setResponseHeader(event, 'Content-Type', meta.contentType || 'image/png')
    setResponseHeader(event, 'Content-Length', stat.size)
    setResponseHeader(event, 'Cache-Control', 'public, max-age=604800')
    setResponseHeader(event, 'X-Icon-Url-Cache', 'HIT')

    return sendStream(event, createReadStream(dataPath))
  }

  let response: Response
  try {
    response = await fetch(remoteUrl.toString(), {
      signal: AbortSignal.timeout(10_000),
    })
  }
  catch {
    throw createError({ statusCode: 502, statusMessage: 'Icon URL unreachable' })
  }

  if (!response.ok) {
    throw createError({ statusCode: response.status, statusMessage: 'Icon URL fetch error' })
  }

  const contentType = response.headers.get('content-type') || 'image/png'
  const buffer = Buffer.from(await response.arrayBuffer())

  const { writeFile } = await import('node:fs/promises')
  await Promise.all([
    writeFile(dataPath, buffer),
    writeFile(metaPath, JSON.stringify({ contentType, fetchedAt: Date.now(), url: remoteUrl.toString() })),
  ])

  setResponseHeader(event, 'Content-Type', contentType)
  setResponseHeader(event, 'Content-Length', buffer.length)
  setResponseHeader(event, 'Cache-Control', 'public, max-age=604800')
  setResponseHeader(event, 'X-Icon-Url-Cache', 'MISS')

  return buffer
})
