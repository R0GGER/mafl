import { createError, getRequestHeader } from 'h3'
import { getStationByUuid } from '~/server/utils/radioBrowser'
import { STREAM_USER_AGENT } from '~/server/utils/resolveStreamUrl'

function guessContentType(codec: string): string {
  const upper = codec.toUpperCase()
  if (upper.includes('AAC')) {
    return 'audio/aac'
  }
  if (upper.includes('OGG')) {
    return 'audio/ogg'
  }
  return 'audio/mpeg'
}

export default defineEventHandler(async (event) => {
  const uuid = getRouterParam(event, 'uuid')

  if (!uuid) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Station UUID is required',
    })
  }

  const station = await getStationByUuid(uuid)

  if (!station?.urlResolved) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Station not found',
    })
  }

  const res = event.node.res
  const controller = new AbortController()

  event.node.req.on('close', () => {
    controller.abort()
  })

  const range = getRequestHeader(event, 'range')
  const headers: Record<string, string> = {
    'User-Agent': STREAM_USER_AGENT,
    'Icy-MetaData': '0',
    'Accept': 'audio/mpeg,audio/aacp,audio/aac,*/*',
  }

  if (range) {
    headers.Range = range
  }

  let upstream: globalThis.Response | null = null

  try {
    upstream = await fetch(station.urlResolved, {
      headers,
      signal: controller.signal,
    })
  }
  catch {
    upstream = null
  }

  if (!upstream?.ok || !upstream.body) {
    throw createError({
      statusCode: 502,
      statusMessage: 'Stream unavailable',
    })
  }

  const contentType = upstream.headers.get('content-type')
    || guessContentType(station.codec)
  const icyName = upstream.headers.get('icy-name') || station.name

  const reader = upstream.body.getReader()

  // Buffer initial audio data before sending response headers so the browser
  // receives actual decodable bytes together with the Content-Type. Without
  // this, slow upstreams cause the browser to fire MEDIA_ERR_DECODE on the
  // empty response body before the first chunk arrives.
  const initialChunks: Uint8Array[] = []
  let initialBytes = 0
  const MIN_INITIAL_BYTES = 8192

  try {
    while (initialBytes < MIN_INITIAL_BYTES) {
      const { done, value } = await reader.read()
      if (done || !value?.length) {
        break
      }
      initialChunks.push(value)
      initialBytes += value.length
    }
  }
  catch {
    reader.releaseLock()
    controller.abort()
    throw createError({ statusCode: 502, statusMessage: 'Stream produced no data' })
  }

  if (initialBytes === 0) {
    reader.releaseLock()
    controller.abort()
    throw createError({ statusCode: 502, statusMessage: 'Stream produced no data' })
  }

  // Disable chunked encoding — Firefox's audio pipeline expects a raw byte
  // stream like Icecast serves (HTTP/1.0-style, connection-close).
  res.chunkedEncoding = false
  ;(res as any).useChunkedEncodingByDefault = false

  res.writeHead(200, {
    'Content-Type': contentType,
    'Cache-Control': 'no-cache, no-store',
    'Connection': 'close',
    'Accept-Ranges': 'none',
    'Access-Control-Allow-Origin': '*',
    'icy-name': icyName,
  })

  for (const chunk of initialChunks) {
    res.write(chunk)
  }

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done || res.destroyed) {
        break
      }
      const ok = res.write(value)
      if (!ok) {
        await new Promise<void>(resolve => res.once('drain', resolve))
      }
    }
  }
  catch {
    // client disconnected or upstream closed
  }
  finally {
    reader.releaseLock()
    controller.abort()
    if (!res.destroyed) {
      res.end()
    }
  }

  return null
})
