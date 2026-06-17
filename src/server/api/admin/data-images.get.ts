import { existsSync } from 'node:fs'
import { readdir, stat } from 'node:fs/promises'
import { extname, posix, resolve } from 'node:path'

const IMAGE_EXTS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.svg',
  '.avif',
  '.ico',
])

const DATA_ROOT = resolve('./data')

// Cap recursion so we never enumerate the giant favicon / icon-url caches that
// MAFL maintains in `./data/.favicon-cache` and `./data/.icon-url-cache`. The
// admin only needs to pick a hand-uploaded logo / background, which lives at
// the root (or one level deep in something like `favicons/`).
const MAX_DEPTH = 2
const MAX_ENTRIES = 500

export interface DataImage {
  /** File name only, e.g. `logo.png`. */
  name: string
  /** Path relative to `./data/`, e.g. `favicons/source.png`. Suitable as-is
   *  for the `logo` / `background` YAML fields and for `/api/assets/`. */
  path: string
  size: number
  mtime: number
}

async function walk(
  dir: string,
  relPrefix: string,
  depth: number,
  out: DataImage[],
): Promise<void> {
  if (out.length >= MAX_ENTRIES) return
  if (depth > MAX_DEPTH) return

  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  }
  catch {
    return
  }

  for (const entry of entries) {
    if (out.length >= MAX_ENTRIES) break

    // Skip hidden files / folders (`.favicon-cache`, `.icon-url-cache`, dotfiles
    // like `.meta.json`, ...) - they're internal caches, not user content.
    if (entry.name.startsWith('.')) continue

    const childAbs = resolve(dir, entry.name)
    const childRel = relPrefix ? posix.join(relPrefix, entry.name) : entry.name

    if (entry.isDirectory()) {
      await walk(childAbs, childRel, depth + 1, out)
      continue
    }

    if (!entry.isFile()) continue

    const ext = extname(entry.name).toLowerCase()
    if (!IMAGE_EXTS.has(ext)) continue

    try {
      const st = await stat(childAbs)
      out.push({
        name: entry.name,
        path: childRel,
        size: st.size,
        mtime: Math.round(st.mtimeMs),
      })
    }
    catch {}
  }
}

export default defineEventHandler(async (event) => {
  await requireAdminSession(event)

  if (!existsSync(DATA_ROOT)) {
    return { images: [] as DataImage[] }
  }

  const images: DataImage[] = []
  await walk(DATA_ROOT, '', 0, images)

  // Root files first (shorter path -> fewer slashes), then alphabetical so the
  // dropdown is predictable across reloads.
  images.sort((a, b) => {
    const da = a.path.split('/').length
    const db = b.path.split('/').length
    if (da !== db) return da - db
    return a.path.localeCompare(b.path)
  })

  return { images }
})
