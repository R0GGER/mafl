import type { TomtomEtaService } from '~/types'
import { getServiceWithDefaultData, returnServiceWithData } from '~/server/utils/services'

interface TomTomGeoResult {
  results: {
    position: { lat: number, lon: number }
  }[]
}

interface TomTomRouteResponse {
  routes: {
    summary: {
      lengthInMeters: number
      travelTimeInSeconds: number
      trafficDelayInSeconds: number
      departureTime: string
      arrivalTime: string
    }
  }[]
}

const cachedGeocode = defineCachedFunction(async (address: string, apiKey: string) => {
  const response = await $fetch<TomTomGeoResult>(
    `https://api.tomtom.com/search/2/search/${encodeURIComponent(address)}.json?key=${apiKey}&limit=1&typeahead=false`,
  )
  if (!response.results?.length) {
    throw createError({ statusCode: 400, statusMessage: `Could not geocode address: ${address}` })
  }
  return response.results[0].position
}, { maxAge: 60 * 60 * 24, getKey: (address: string) => address })

async function resolveCoords(
  lat: number | undefined,
  lon: number | undefined,
  address: string | undefined,
  apiKey: string,
): Promise<{ lat: number, lon: number }> {
  if (lat != null && lon != null) {
    return { lat, lon }
  }
  if (address) {
    return cachedGeocode(address, apiKey)
  }
  throw createError({ statusCode: 400, statusMessage: 'Either coordinates or address must be provided' })
}

const cachedRoute = defineCachedFunction(async (
  originLat: number,
  originLon: number,
  destLat: number,
  destLon: number,
  travelMode: string,
  apiKey: string,
) => {
  const response = await $fetch<TomTomRouteResponse>(
    `https://api.tomtom.com/routing/1/calculateRoute/${originLat},${originLon}:${destLat},${destLon}/json`
    + `?key=${apiKey}&traffic=true&computeTravelTimeFor=all&travelMode=${travelMode}`,
  )
  if (!response.routes?.length) {
    throw createError({ statusCode: 502, statusMessage: 'No route found' })
  }
  const summary = response.routes[0].summary
  return {
    arrivalTime: summary.arrivalTime,
    travelTimeInSeconds: summary.travelTimeInSeconds,
    trafficDelayInSeconds: summary.trafficDelayInSeconds,
    lengthInMeters: summary.lengthInMeters,
  }
}, { maxAge: 60 * 2, getKey: (oLat: number, oLon: number, dLat: number, dLon: number, mode: string) => `${oLat},${oLon}:${dLat},${dLon}:${mode}` })

export default defineEventHandler(async (event) => {
  const service = await getServiceWithDefaultData<TomtomEtaService>(event)
  const { options, secrets } = service.config
  const apiKey = secrets.apiKey

  const origin = await resolveCoords(options.originLat, options.originLon, options.originAddress, apiKey)
  const dest = await resolveCoords(options.destLat, options.destLon, options.destAddress, apiKey)
  const travelMode = options.travelMode || 'car'

  const route = await cachedRoute(origin.lat, origin.lon, dest.lat, dest.lon, travelMode, apiKey)

  const originLabel = options.originAddress || `${origin.lat.toFixed(2)},${origin.lon.toFixed(2)}`
  const destLabel = options.destAddress || `${dest.lat.toFixed(2)},${dest.lon.toFixed(2)}`

  return returnServiceWithData(service, {
    ...route,
    routeName: options.routeName || `${originLabel} → ${destLabel}`,
  })
})
