import { existsSync } from 'node:fs'
import { extname, resolve } from 'node:path'

const ASSET_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
  '.svg',
  '.avif',
])

export function dataAssetExists(relativePath: string): boolean {
  if (!relativePath || relativePath.includes('..')) {
    return false
  }

  const ext = extname(relativePath).toLowerCase()
  if (!ASSET_EXTENSIONS.has(ext)) {
    return false
  }

  return existsSync(resolve('./data', relativePath))
}
