import type { CustomHtmlService } from '~/types'
import { getServiceWithDefaultData, returnServiceWithData } from '~/server/utils/services'

export default defineEventHandler(async (event) => {
  const service = await getServiceWithDefaultData<CustomHtmlService>(event)
  const { options } = service.config

  return returnServiceWithData(service, {
    html: options.html || '',
  })
})
