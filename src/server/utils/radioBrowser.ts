const SERVERS = [
  'https://de1.api.radio-browser.info',
  'https://nl1.api.radio-browser.info',
  'https://de2.api.radio-browser.info',
]

const USER_AGENT = 'MaflPlus/0.15.4'

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
    urlResolved: raw.url_resolved,
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
  return data.map(normalizeStation)
}

export async function getStationByUuid(uuid: string): Promise<RadioBrowserStation | null> {
  const response = await fetchRadioBrowser(`/json/stations/byuuid/${encodeURIComponent(uuid)}`)
  const data = await response.json() as RadioBrowserStationRaw[]
  if (!data.length) {
    return null
  }
  return normalizeStation(data[0])
}

export async function trackStationClick(uuid: string): Promise<void> {
  await fetchRadioBrowser(`/json/url/${encodeURIComponent(uuid)}`, { method: 'POST' })
}
