import { removeFavicons } from '~/server/utils/favicons'

export default defineEventHandler(async (event) => {
  await requireAdminSession(event)

  await removeFavicons()

  return { ok: true }
})
