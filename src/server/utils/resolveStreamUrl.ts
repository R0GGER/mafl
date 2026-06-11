import { normalizeStreamUrl } from '~/utils/radioStream'

const USER_AGENT = 'MaflPlus/0.15.4'
export const STREAM_USER_AGENT = USER_AGENT

const HTTPS_HOST_SUFFIXES = [
  '.streamtheworld.com',
  '.triple-it.nl',
  'audio-streaming.qmusic.nl',
  'stream.bnr.nl',
]

function preferHttps(url: URL): void {
  if (url.protocol !== 'http:') {
    return
  }

  const host = url.hostname.toLowerCase()
  if (HTTPS_HOST_SUFFIXES.some(suffix => host === suffix || host.endsWith(suffix))) {
    url.protocol = 'https:'
  }
}

export function cleanStreamUrl(url: string): string {
  try {
    const parsed = new URL(url)

    preferHttps(parsed)

    if (parsed.protocol === 'https:' && parsed.port === '443') {
      parsed.port = ''
    }
    else if (parsed.protocol === 'http:' && parsed.port === '80') {
      parsed.port = ''
    }

    return parsed.href
  }
  catch {
    return url
  }
}

/**
 * Follow HTTP redirects server-side so the browser receives a direct stream URL.
 * Firefox often fails on multi-hop redirects (e.g. StreamTheWorld) in HTML5 audio.
 */
export async function resolveFinalStreamUrl(url: string): Promise<string> {
  const startUrl = cleanStreamUrl(normalizeStreamUrl(url))

  if (!startUrl) {
    return startUrl
  }

  try {
    const response = await fetch(startUrl, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'User-Agent': USER_AGENT,
        'Icy-MetaData': '1',
        'Accept': 'audio/mpeg,audio/aacp,*/*',
        'Range': 'bytes=0-0',
      },
      signal: AbortSignal.timeout(12000),
    })

    return cleanStreamUrl(response.url || startUrl)
  }
  catch {
    return startUrl
  }
}
