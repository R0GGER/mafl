export function toCachedIconUrl(url: string | undefined | null): string {
  if (!url) {
    return ''
  }

  if (url.startsWith('data:') || url.startsWith('/')) {
    return url
  }

  if (/^https?:\/\//i.test(url)) {
    return `/api/icon-url?url=${encodeURIComponent(url)}`
  }

  return url
}
