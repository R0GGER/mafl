import { ensureBundledDefaults } from '~/server/utils/favicons'

/**
 * Admin endpoint that forces a full rebuild of the bundled default favicon set
 * (favicon.ico, favicon-16x16, favicon-32x32, android-chrome-*, ...) from the
 * largest available master image. Useful when on-disk variants got corrupted,
 * the startup hook couldn't write (read-only fs, then unmounted), or after an
 * upstream MAFL update changed the bundled master image.
 *
 * Has no effect on user uploads in ./data/favicons/ — those are served first
 * by the favicon middleware regardless of what lives in favicons-defaults.
 */
export default defineEventHandler(async (event) => {
  await requireAdminSession(event)

  const result = await ensureBundledDefaults({ force: true })

  if (result.skipped) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Bundled defaults directory not available (likely dev mode)',
    })
  }

  if (!result.master) {
    throw createError({
      statusCode: 500,
      statusMessage: 'No master favicon image found to regenerate from',
    })
  }

  return {
    ok: true,
    // Cache-bust hint for the admin UI; bundled defaults don't have their own
    // meta.json, but the on-disk mtime changes anyway so the middleware ETag
    // will update on next request.
    version: Date.now(),
    generated: result.generated,
    failed: result.failed,
    master: result.master,
  }
})
