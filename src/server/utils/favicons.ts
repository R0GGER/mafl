import { existsSync } from 'node:fs'
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import sharp from 'sharp'
import pngToIco from 'png-to-ico'

const logger = useLogger('favicons')

/**
 * Runtime favicons live in the writable data volume so a user can upload a custom
 * favicon via /admin without rebuilding the image or mounting extra volumes.
 */
export const FAVICONS_RUNTIME_DIR = resolve('./data/favicons')

/**
 * Bundled defaults live here in production. During the Docker build they are
 * moved out of `.output/public/favicons/` into `.output/server/favicons-defaults/`
 * so that Nitro's static asset handler doesn't pre-empt our /favicons/*
 * middleware. The middleware uses this folder as a fallback for users who
 * haven't uploaded a custom favicon yet.
 *
 * In dev mode this directory typically doesn't exist, which is fine: the
 * middleware then 404s and the browser shows its generic tab icon.
 */
export const FAVICONS_PUBLIC_DIR = resolve('./server/favicons-defaults')

export const FAVICONS_META_FILE = '.meta.json'
export const FAVICONS_SOURCE_PREFIX = 'source'

/** PNG variants generated from a single uploaded master image. */
export const FAVICON_PNG_VARIANTS = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'pwa-192x192.png', size: 192 },
  { name: 'pwa-512x512.png', size: 512 },
  { name: 'android-chrome-192x192.png', size: 192 },
  { name: 'android-chrome-512x512.png', size: 512 },
] as const

/** Sizes that make up the multi-resolution favicon.ico. */
export const FAVICON_ICO_SIZES = [16, 32, 48]

export const FAVICON_ICO_NAME = 'favicon.ico'

export interface FaviconMeta {
  version: number
  generatedAt: string
  source: {
    name: string
    mime: string
    size: number
  }
}

const MIME_BY_EXT: Record<string, string> = {
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
}

export function mimeForFile(name: string): string {
  return MIME_BY_EXT[extname(name).toLowerCase()] || 'application/octet-stream'
}

async function ensureRuntimeDir(): Promise<void> {
  if (!existsSync(FAVICONS_RUNTIME_DIR)) {
    await mkdir(FAVICONS_RUNTIME_DIR, { recursive: true })
  }
}

/**
 * Returns the metadata of the active custom favicon, or null when only bundled
 * defaults are in use.
 */
export async function getFaviconMeta(): Promise<FaviconMeta | null> {
  const metaPath = resolve(FAVICONS_RUNTIME_DIR, FAVICONS_META_FILE)
  if (!existsSync(metaPath)) return null

  try {
    const raw = await readFile(metaPath, 'utf-8')
    return JSON.parse(raw) as FaviconMeta
  }
  catch (e) {
    logger.warn('Failed to read favicon meta:', e)
    return null
  }
}

/**
 * Cache-bust version used to invalidate browser-side favicon caches after a
 * new upload. Returns 0 when no custom favicon is set.
 */
export async function getFaviconVersion(): Promise<number> {
  const meta = await getFaviconMeta()
  return meta?.version || 0
}

export interface GenerateInput {
  buffer: Buffer
  mime: 'image/png' | 'image/svg+xml'
  originalName: string
}

export interface GenerateResult {
  meta: FaviconMeta
  warnings: string[]
}

/**
 * Generate the full favicon set (PNGs + multi-resolution .ico) from a single
 * uploaded master image. All existing runtime variants are wiped first so that
 * one upload always produces a fresh, complete, atomic replacement set; this
 * prevents stale variants from sticking around if an earlier upload partially
 * failed.
 */
export async function generateFavicons(input: GenerateInput): Promise<GenerateResult> {
  await ensureRuntimeDir()

  const warnings: string[] = []

  const master = sharp(input.buffer, { density: 384 })
  const metadata = await master.metadata()

  if (metadata.width && metadata.height) {
    if (metadata.width !== metadata.height) {
      warnings.push(`Source is ${metadata.width}x${metadata.height} (not square) — output will be letterboxed onto a transparent canvas.`)
    }
    const minSide = Math.min(metadata.width, metadata.height)
    if (minSide < 512 && input.mime === 'image/png') {
      warnings.push(`Source is only ${minSide}px on the shortest side — larger sizes will be upscaled.`)
    }
  }

  // Render every output to a buffer first; only touch disk once we know all
  // sharp/png-to-ico steps succeeded, so we never leave the directory in a
  // half-updated state.
  const masterPng = await sharp(input.buffer, { density: 384 })
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer()

  const pngBuffers: Array<{ name: string; data: Buffer }> = []
  for (const variant of FAVICON_PNG_VARIANTS) {
    const out = await sharp(masterPng)
      .resize(variant.size, variant.size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer()
    pngBuffers.push({ name: variant.name, data: out })
  }

  const icoSources = await Promise.all(
    FAVICON_ICO_SIZES.map(size =>
      sharp(masterPng)
        .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer(),
    ),
  )
  const icoBuffer = await pngToIco(icoSources)

  // All renders succeeded — wipe the directory and write the fresh set.
  await clearRuntimeDir()

  for (const { name, data } of pngBuffers) {
    await writeFile(resolve(FAVICONS_RUNTIME_DIR, name), data)
  }
  await writeFile(resolve(FAVICONS_RUNTIME_DIR, FAVICON_ICO_NAME), icoBuffer)

  const sourceExt = input.mime === 'image/svg+xml' ? '.svg' : '.png'
  const sourceName = `${FAVICONS_SOURCE_PREFIX}${sourceExt}`
  await writeFile(resolve(FAVICONS_RUNTIME_DIR, sourceName), input.buffer)

  const meta: FaviconMeta = {
    version: Date.now(),
    generatedAt: new Date().toISOString(),
    source: {
      name: input.originalName,
      mime: input.mime,
      size: input.buffer.length,
    },
  }
  await writeFile(
    resolve(FAVICONS_RUNTIME_DIR, FAVICONS_META_FILE),
    JSON.stringify(meta, null, 2),
  )

  logger.success(`Generated ${FAVICON_PNG_VARIANTS.length} PNG variants + favicon.ico from "${input.originalName}"`)
  return { meta, warnings }
}

/**
 * Remove every file inside the runtime favicons directory (but keep the
 * directory itself). Used both for a full reset and as the first step of a
 * fresh generation pass.
 */
async function clearRuntimeDir(): Promise<void> {
  if (!existsSync(FAVICONS_RUNTIME_DIR)) return
  const entries = await readdir(FAVICONS_RUNTIME_DIR)
  await Promise.all(
    entries.map(name => rm(resolve(FAVICONS_RUNTIME_DIR, name), { force: true })),
  )
}

/**
 * Remove the runtime favicon set, reverting to bundled defaults.
 */
export async function removeFavicons(): Promise<void> {
  await clearRuntimeDir()
  logger.info('Removed custom favicons, reverted to bundled defaults')
}

/**
 * Returns the list of known favicon files (PNG variants + .ico) that the
 * runtime may serve. Useful for previews.
 */
export function listFaviconNames(): string[] {
  return [FAVICON_ICO_NAME, ...FAVICON_PNG_VARIANTS.map(v => v.name)]
}

/**
 * Locate the original uploaded source image (PNG or SVG) and return its path
 * relative to the `./data/` root, e.g. `favicons/source.png`. This is the same
 * shape the `logo` / `background` config fields expect and what the
 * `/api/assets/[...path]` route can serve. Returns null when no custom favicon
 * has been uploaded yet.
 */
export function findFaviconSourceAsset(): string | null {
  for (const ext of ['.png', '.svg'] as const) {
    const name = `${FAVICONS_SOURCE_PREFIX}${ext}`
    if (existsSync(resolve(FAVICONS_RUNTIME_DIR, name))) {
      return `favicons/${name}`
    }
  }
  return null
}
