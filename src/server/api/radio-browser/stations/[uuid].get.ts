import { getStationByUuid } from '~/server/utils/radioBrowser'

export default defineEventHandler(async (event) => {
  const uuid = getRouterParam(event, 'uuid')

  if (!uuid) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Station UUID is required',
    })
  }

  const station = await getStationByUuid(uuid)

  if (!station) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Station not found',
    })
  }

  return station
})
