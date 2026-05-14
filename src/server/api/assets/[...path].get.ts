import { createReadStream, existsSync, statSync } from 'node:fs'
import { resolve, extname } from 'node:path'
import { sendStream, setResponseHeader, createError } from 'h3'

const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.avif': 'image/avif',
}

export default defineEventHandler(async (event) => {
  const path = getRouterParam(event, 'path')

  if (!path) {
    throw createError({ statusCode: 400, statusMessage: 'Missing path' })
  }

  if (path.includes('..')) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  const ext = extname(path).toLowerCase()
  const mime = MIME_TYPES[ext]

  if (!mime) {
    throw createError({ statusCode: 415, statusMessage: 'Unsupported file type' })
  }

  const filePath = resolve('./data', path)

  if (!existsSync(filePath)) {
    throw createError({ statusCode: 404, statusMessage: 'File not found' })
  }

  const stat = statSync(filePath)
  setResponseHeader(event, 'Content-Type', mime)
  setResponseHeader(event, 'Content-Length', stat.size)
  setResponseHeader(event, 'Cache-Control', 'public, max-age=3600')

  return sendStream(event, createReadStream(filePath))
})
