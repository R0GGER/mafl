import { ensureBundledDefaults } from '~/server/utils/favicons'

/**
 * Server-startup hook that fills in any bundled default favicon variants
 * missing from `./server/favicons-defaults/`. See `ensureBundledDefaults()`
 * for the full rationale.
 *
 * The admin "Regenerate defaults" button calls the same utility with
 * `force: true` to rebuild every variant on demand.
 */

const logger = useLogger('favicons:defaults')

export default defineNitroPlugin(async () => {
  const result = await ensureBundledDefaults({ force: false })

  if (result.skipped) return

  if (result.generated.length > 0) {
    logger.success(
      `Generated ${result.generated.length} missing bundled default favicon(s) `
      + `from ${result.master}: ${result.generated.join(', ')}`,
    )
  }
  if (result.failed.length > 0) {
    logger.warn(
      `Could not generate ${result.failed.length} default favicon(s): ${result.failed.join(', ')}`,
    )
  }
})
