import { generateFavicons } from '~/server/utils/favicons'

const MAX_BYTES = 5 * 1024 * 1024 // 5MB
const ALLOWED_MIME = new Set(['image/png', 'image/svg+xml'])

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])

function looksLikePng(buf: Buffer): boolean {
  return buf.length >= 8 && buf.slice(0, 8).equals(PNG_MAGIC)
}

function looksLikeSvg(buf: Buffer): boolean {
  // SVG is XML; allow leading whitespace / BOM / XML declaration before <svg>.
  const head = buf.slice(0, Math.min(buf.length, 1024)).toString('utf-8').trimStart()
  return head.startsWith('<?xml') || head.startsWith('<svg') || head.includes('<svg')
}

export default defineEventHandler(async (event) => {
  await requireAdminSession(event)

  const parts = await readMultipartFormData(event)
  const filePart = parts?.find(p => p.name === 'file' && p.data)

  if (!filePart || !filePart.data) {
    throw createError({ statusCode: 400, statusMessage: 'No file uploaded (expected field "file")' })
  }

  const mime = (filePart.type || '').toLowerCase()
  if (!ALLOWED_MIME.has(mime)) {
    throw createError({ statusCode: 415, statusMessage: 'Only PNG or SVG images are accepted' })
  }

  if (filePart.data.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Uploaded file is empty' })
  }

  if (filePart.data.length > MAX_BYTES) {
    throw createError({ statusCode: 413, statusMessage: `File too large (max ${MAX_BYTES / 1024 / 1024}MB)` })
  }

  if (mime === 'image/png' && !looksLikePng(filePart.data)) {
    throw createError({ statusCode: 400, statusMessage: 'File is not a valid PNG (magic bytes mismatch)' })
  }
  if (mime === 'image/svg+xml' && !looksLikeSvg(filePart.data)) {
    throw createError({ statusCode: 400, statusMessage: 'File is not a valid SVG' })
  }

  try {
    const { meta, warnings } = await generateFavicons({
      buffer: filePart.data,
      mime: mime as 'image/png' | 'image/svg+xml',
      originalName: filePart.filename || (mime === 'image/png' ? 'favicon.png' : 'favicon.svg'),
    })

    return {
      ok: true,
      version: meta.version,
      generatedAt: meta.generatedAt,
      warnings,
    }
  }
  catch (e: any) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Failed to process image',
      data: { error: e?.message || String(e) },
    })
  }
})
