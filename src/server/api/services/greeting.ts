import type { GreetingService } from '~/types'
import { getServiceWithDefaultData, returnServiceWithData } from '~/server/utils/services'

export default defineEventHandler(async (event) => {
  const service = await getServiceWithDefaultData<GreetingService>(event)
  const { options } = service.config

  return returnServiceWithData(service, {
    text: options.text || '',
    subtitle: options.subtitle || '',
  })
})
