import type { TimezoneService } from '~/types'
import { getServiceWithDefaultData, returnServiceWithData } from '~/server/utils/services'

export default defineEventHandler(async (event) => {
  const service = await getServiceWithDefaultData<TimezoneService>(event)
  const { options } = service.config

  return returnServiceWithData(service, {
    timezone: options.timezone,
    locationName: options.locationName || options.timezone,
    country: options.country || '',
  })
})
