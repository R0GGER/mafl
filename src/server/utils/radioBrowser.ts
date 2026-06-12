import { compareStationPlayability, normalizeStreamUrl } from '~/utils/radioStream'
import { resolveFinalStreamUrl } from './resolveStreamUrl'

const SERVERS = [
  'https://de1.api.radio-browser.info',
  'https://nl1.api.radio-browser.info',
  'https://de2.api.radio-browser.info',
  'https://all.api.radio-browser.info',
]

const USER_AGENT = 'MaflPlus/0.15.4'

const CACHE_TTL_MS = 15 * 60 * 1000
const STALE_FALLBACK_TTL_MS = 24 * 60 * 60 * 1000
const ERROR_LOG_INTERVAL_MS = 60 * 1000

interface StationCacheEntry {
  station: RadioBrowserStation
  expiresAt: number
  staleUntil: number
}

const resolvedUrlCache = new Map<string, { url: string, expiresAt: number }>()
const stationCache = new Map<string, StationCacheEntry>()

let lastErrorLogAt = 0

function shouldLogError(): boolean {
  const now = Date.now()
  if (now - lastErrorLogAt < ERROR_LOG_INTERVAL_MS) {
    return false
  }
  lastErrorLogAt = now
  return true
}

function summarizeError(e: unknown): string {
  if (!e) return 'unknown error'
  const err = e as { code?: string, cause?: { code?: string }, message?: string, name?: string }
  return err.cause?.code || err.code || err.name || err.message || 'unknown error'
}

async function resolveStationPlaybackUrl(uuid: string, url: string): Promise<string> {
  const cached = resolvedUrlCache.get(uuid)
  if (cached && cached.expiresAt > Date.now()) {
    return cached.url
  }

  const resolved = await resolveFinalStreamUrl(url)
  resolvedUrlCache.set(uuid, {
    url: resolved,
    expiresAt: Date.now() + CACHE_TTL_MS,
  })

  return resolved
}

export interface RadioBrowserStationRaw {
  stationuuid: string
  name: string
  url: string
  url_resolved: string
  favicon: string
  tags: string
  bitrate: number
  codec: string
  country: string
  countrycode: string
}

export interface RadioBrowserStation {
  stationuuid: string
  name: string
  urlResolved: string
  favicon: string
  tags: string
  bitrate: number
  codec: string
  country: string
  countrycode: string
}

export function normalizeStation(raw: RadioBrowserStationRaw): RadioBrowserStation {
  return {
    stationuuid: raw.stationuuid,
    name: raw.name,
    urlResolved: normalizeStreamUrl(raw.url_resolved),
    favicon: raw.favicon || '',
    tags: raw.tags || '',
    bitrate: raw.bitrate || 0,
    codec: raw.codec || '',
    country: raw.country || '',
    countrycode: raw.countrycode || '',
  }
}

async function fetchRadioBrowser(path: string, options: RequestInit = {}): Promise<Response> {
  let lastError: unknown

  for (let i = 0; i < SERVERS.length; i++) {
    const server = SERVERS[i]
    try {
      const response = await fetch(`${server}${path}`, {
        ...options,
        headers: {
          'User-Agent': USER_AGENT,
          ...options.headers,
        },
        signal: AbortSignal.timeout(8000),
      })

      if (response.ok) {
        return response
      }
      lastError = new Error(`HTTP ${response.status}`)
    }
    catch (e) {
      lastError = e
    }

    // Brief jittered backoff between server attempts to avoid hammering during outages
    if (i < SERVERS.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200))
    }
  }

  if (shouldLogError()) {
    logger.warn(`Radio Browser API unavailable: ${summarizeError(lastError)}`)
  }

  throw createError({
    statusCode: 502,
    statusMessage: 'Radio Browser unavailable',
  })
}

export async function searchStations(params: {
  name?: string
  countrycode?: string
  limit?: number
}): Promise<RadioBrowserStation[]> {
  const search = new URLSearchParams()
  if (params.name) {
    search.set('name', params.name)
  }
  search.set('countrycode', params.countrycode || 'NL')
  search.set('limit', String(params.limit ?? 10))
  search.set('order', 'clickcount')
  search.set('reverse', 'true')

  const response = await fetchRadioBrowser(`/json/stations/search?${search}`)
  const data = await response.json() as RadioBrowserStationRaw[]
  return data
    .map(normalizeStation)
    .sort(compareStationPlayability)
}

export async function getStationByUuid(uuid: string): Promise<RadioBrowserStation | null> {
  const now = Date.now()
  const cached = stationCache.get(uuid)

  if (cached && cached.expiresAt > now) {
    return cached.station
  }

  try {
    const response = await fetchRadioBrowser(`/json/stations/byuuid/${encodeURIComponent(uuid)}`)
    const data = await response.json() as RadioBrowserStationRaw[]
    if (!data.length) {
      return null
    }

    const station = normalizeStation(data[0])
    station.urlResolved = await resolveStationPlaybackUrl(station.stationuuid, station.urlResolved)

    stationCache.set(uuid, {
      station,
      expiresAt: now + CACHE_TTL_MS,
      staleUntil: now + STALE_FALLBACK_TTL_MS,
    })

    return station
  }
  catch (e) {
    // Serve stale data when the API is down so playback keeps working
    if (cached && cached.staleUntil > now) {
      return cached.station
    }
    throw e
  }
}

export async function trackStationClick(uuid: string): Promise<void> {
  try {
    await fetchRadioBrowser(`/json/url/${encodeURIComponent(uuid)}`, { method: 'POST' })
  }
  catch {
    // Click tracking is best-effort; failures should not surface to the user
  }
}
