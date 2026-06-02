import type { IpApiService } from '~/types'
import { getServiceWithDefaultData, returnServiceWithData } from '~/server/utils/services'

interface IpApiFetchResponse {
  status: string
  country: string
  countryCode: string
  region: string
  regionName: string
  city: string
  zip: string
  lat: number
  lon: number
  timezone: string
  isp: string
  org: string
  as: string
  query: string
}

const cachedIpApiData = defineCachedFunction(async (lang: string = 'en') => {
  const response = await $fetch<IpApiFetchResponse>(`http://ip-api.com/json/?lang=${lang}`)

  const place = response.city === response.regionName
    ? response.city
    : `${response.city}, ${response.regionName}`

  return {
    ip: response.query,
    place,
    country: response.countryCode.toLowerCase(),
  }
}, { maxAge: 60 * 24, getKey: ({ ip }) => ip })

export default defineEventHandler(async (event) => {
  const service = await getServiceWithDefaultData<IpApiService>(event)
  const config = await getConfig()
  const ip = await cachedIpApiData(config?.lang)

  const data = {
    ...ip,
    place: service.config.options?.locationName || ip.place,
  }

  return returnServiceWithData(service, data)
})
