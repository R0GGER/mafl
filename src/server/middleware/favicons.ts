import { createReadStream, statSync } from 'node:fs'
import { resolve } from 'node:path'
import { sendStream, setResponseHeader } from 'h3'
import { FAVICONS_PUBLIC_DIR, FAVICONS_RUNTIME_DIR, mimeForFile } from '~/server/utils/favicons'

// Middleware that serves favicons from two locations:
//   1. ./data/favicons/    — runtime uploads via /admin (highest priority)
//   2. ./server/favicons-defaults/ — bundled defaults from the Docker image
//
// We intentionally handle both here (instead of letting Nitro's public asset
// handler serve the defaults) because in production that handler pre-empts
// middlewares and routes for any filename present in /public/. The Dockerfile
// moves the bundled defaults out of /public/favicons/ for this reason, so we
// take full ownership of the /favicons/* URL space.

const FAVICONS_PREFIX = '/favicons/'
const SAFE_NAME = /^[a-zA-Z0-9._-]+$/

function locate(name: string): string | null {
  const runtime = resolve(FAVICONS_RUNTIME_DIR, name)
  try {
    if (statSync(runtime).isFile()) return runtime
  }
  catch {}

  const bundled = resolve(FAVICONS_PUBLIC_DIR, name)
  try {
    if (statSync(bundled).isFile()) return bundled
  }
  catch {}

  return null
}

export default defineEventHandler((event) => {
  const rawPath = event.path || event.node.req.url || ''
  const path = rawPath.split('?')[0].split('#')[0]

  if (!path.startsWith(FAVICONS_PREFIX)) return

  const name = path.slice(FAVICONS_PREFIX.length)
  if (!name || name.includes('/') || name.includes('..') || !SAFE_NAME.test(name)) return

  const filePath = locate(name)
  if (!filePath) return

  const stat = statSync(filePath)
  const isRuntime = filePath.startsWith(FAVICONS_RUNTIME_DIR)
  const etag = `W/"${stat.size.toString(16)}-${Math.round(stat.mtimeMs).toString(16)}"`

  if (getHeader(event, 'if-none-match') === etag) {
    setResponseStatus(event, 304)
    return ''
  }

  setResponseHeader(event, 'Content-Type', mimeForFile(name))
  setResponseHeader(event, 'Content-Length', stat.size)
  setResponseHeader(event, 'Cache-Control', 'public, max-age=300, must-revalidate')
  setResponseHeader(event, 'ETag', etag)
  setResponseHeader(event, 'X-Favicon-Source', isRuntime ? 'runtime' : 'bundled')

  return sendStream(event, createReadStream(filePath))
})
