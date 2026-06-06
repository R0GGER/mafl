import type { TomtomTrafficMapService } from '~/types'
import { getServiceWithDefaultData, returnServiceWithData } from '~/server/utils/services'

interface TomTomGeoResult {
  results: {
    position: { lat: number, lon: number }
  }[]
}

const cachedGeocode = defineCachedFunction(async (address: string, apiKey: string) => {
  const response = await $fetch<TomTomGeoResult>(
    `https://api.tomtom.com/search/2/geocode/${encodeURIComponent(address)}.json?key=${apiKey}&limit=1`,
  )
  if (!response.results?.length) {
    throw createError({ statusCode: 400, statusMessage: `Could not geocode address: ${address}` })
  }
  return response.results[0].position
}, { maxAge: 60 * 60 * 24, getKey: (address: string) => address })

export default defineEventHandler(async (event) => {
  const service = await getServiceWithDefaultData<TomtomTrafficMapService>(event)
  const { options, secrets } = service.config
  const apiKey = secrets.apiKey

  let lat = options.lat
  let lon = options.lon

  if (lat == null || lon == null) {
    if (options.address) {
      const pos = await cachedGeocode(options.address, apiKey)
      lat = pos.lat
      lon = pos.lon
    }
    else {
      throw createError({ statusCode: 400, statusMessage: 'Either coordinates or address must be provided' })
    }
  }

  return returnServiceWithData(service, {
    lat,
    lon,
    zoom: options.zoom || 12,
    apiKey,
  })
})
