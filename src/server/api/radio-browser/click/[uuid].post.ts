import { trackStationClick } from '~/server/utils/radioBrowser'

export default defineEventHandler(async (event) => {
  const uuid = getRouterParam(event, 'uuid')

  if (!uuid) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Station UUID is required',
    })
  }

  await trackStationClick(uuid)
  return { ok: true }
})
