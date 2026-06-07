import type { WebRadioService } from '~/types'
import { getStationByUuid } from '~/server/utils/radioBrowser'
import { getServiceWithDefaultData, returnServiceWithData } from '~/server/utils/services'

export default defineEventHandler(async (event) => {
  const service = await getServiceWithDefaultData<WebRadioService>(event)
  const stationUuid = service.config.options?.stationUuid

  if (!stationUuid) {
    throw createError({
      statusCode: 400,
      statusMessage: 'stationUuid is required for web-radio',
    })
  }

  const station = await getStationByUuid(stationUuid)

  if (!station) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Radio station not found',
    })
  }

  const meta = [station.codec, station.bitrate ? `${station.bitrate} kbps` : ''].filter(Boolean).join(' · ')

  return returnServiceWithData(service, {
    stationuuid: station.stationuuid,
    name: service.config.title || station.name,
    urlResolved: station.urlResolved,
    favicon: service.config.icon?.url || station.favicon,
    tags: station.tags,
    meta,
  })
})
