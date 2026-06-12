import { compareStationPlayability, normalizeStreamUrl } from '~/utils/radioStream'
import { resolveFinalStreamUrl } from './resolveStreamUrl'

const SERVERS = [
  'https://de1.api.radio-browser.info',
  'https://nl1.api.radio-browser.info',
  'https://de2.api.radio-browser.info',
]

const USER_AGENT = 'MaflPlus/0.15.4'

const CACHE_TTL_MS = 15 * 60 * 1000
const resolvedUrlCache = new Map<string, { url: string, expiresAt: number }>()
const stationCache = new Map<string, { station: RadioBrowserStation, expiresAt: number }>()

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

  for (const server of SERVERS) {
    try {
      const response = await fetch(`${server}${path}`, {
        ...options,
        headers: {
          'User-Agent': USER_AGENT,
          ...options.headers,
        },
        signal: AbortSignal.timeout(10000),
      })

      if (response.ok) {
        return response
      }
    }
    catch (e) {
      lastError = e
    }
  }

  logger.error('Radio Browser request failed', lastError)
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
  const cached = stationCache.get(uuid)
  if (cached && cached.expiresAt > Date.now()) {
    return cached.station
  }

  const response = await fetchRadioBrowser(`/json/stations/byuuid/${encodeURIComponent(uuid)}`)
  const data = await response.json() as RadioBrowserStationRaw[]
  if (!data.length) {
    return null
  }

  const station = normalizeStation(data[0])
  station.urlResolved = await resolveStationPlaybackUrl(station.stationuuid, station.urlResolved)

  stationCache.set(uuid, {
    station,
    expiresAt: Date.now() + CACHE_TTL_MS,
  })

  return station
}

export async function trackStationClick(uuid: string): Promise<void> {
  await fetchRadioBrowser(`/json/url/${encodeURIComponent(uuid)}`, { method: 'POST' })
}
