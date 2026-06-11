const MUSICRADIO_SSL_HOSTS = new Set([
  'media-the.musicradio.com',
  'media-ice.musicradio.com',
  'ice-sov.musicradio.com',
])

/** Upgrade Global/Heart (musicradio.com) HTTP streams to their HTTPS endpoint. */
export function normalizeStreamUrl(url: string): string {
  if (!url) {
    return url
  }

  try {
    const parsed = new URL(url)

    if (parsed.protocol === 'http:' && MUSICRADIO_SSL_HOSTS.has(parsed.hostname.toLowerCase())) {
      parsed.hostname = 'media-ssl.musicradio.com'
      parsed.protocol = 'https:'
      return parsed.href
    }

    return url
  }
  catch {
    return url
  }
}

/** Original URL first; musicradio HTTPS variant as fallback only. */
export function streamUrlFallbacks(url: string): string[] {
  const normalized = normalizeStreamUrl(url)
  if (normalized !== url) {
    return [url, normalized]
  }
  return [url]
}

export function compareStationPlayability(
  a: { codec?: string, urlResolved?: string },
  b: { codec?: string, urlResolved?: string },
): number {
  const aMp3 = a.codec?.toUpperCase().includes('MP3') ? 1 : 0
  const bMp3 = b.codec?.toUpperCase().includes('MP3') ? 1 : 0
  if (aMp3 !== bMp3) {
    return bMp3 - aMp3
  }

  const aHttps = a.urlResolved?.startsWith('https:') ? 1 : 0
  const bHttps = b.urlResolved?.startsWith('https:') ? 1 : 0
  return bHttps - aHttps
}
