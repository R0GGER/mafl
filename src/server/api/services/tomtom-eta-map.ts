import type { TomtomEtaMapService } from '~/types'
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
    legs: {
      points: { latitude: number, longitude: number }[]
    }[]
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

const cachedRouteWithGeometry = defineCachedFunction(async (
  originLat: number,
  originLon: number,
  destLat: number,
  destLon: number,
  travelMode: string,
  apiKey: string,
) => {
  const response = await $fetch<TomTomRouteResponse>(
    `https://api.tomtom.com/routing/1/calculateRoute/${originLat},${originLon}:${destLat},${destLon}/json`
    + `?key=${apiKey}&traffic=true&computeTravelTimeFor=all&travelMode=${travelMode}&routeRepresentation=polyline`,
  )
  if (!response.routes?.length) {
    throw createError({ statusCode: 502, statusMessage: 'No route found' })
  }

  const route = response.routes[0]
  const allPoints = route.legs.flatMap(leg => leg.points)
  const routePoints = allPoints.map(p => ({ lat: p.latitude, lon: p.longitude }))

  const lats = routePoints.map(p => p.lat)
  const lons = routePoints.map(p => p.lon)

  return {
    arrivalTime: route.summary.arrivalTime,
    travelTimeInSeconds: route.summary.travelTimeInSeconds,
    trafficDelayInSeconds: route.summary.trafficDelayInSeconds,
    lengthInMeters: route.summary.lengthInMeters,
    routePoints,
    bbox: {
      minLat: Math.min(...lats),
      minLon: Math.min(...lons),
      maxLat: Math.max(...lats),
      maxLon: Math.max(...lons),
    },
  }
}, { maxAge: 60 * 2, getKey: (oLat: number, oLon: number, dLat: number, dLon: number, mode: string) => `map:${oLat},${oLon}:${dLat},${dLon}:${mode}` })

export default defineEventHandler(async (event) => {
  const service = await getServiceWithDefaultData<TomtomEtaMapService>(event)
  const { options, secrets } = service.config
  const apiKey = secrets.apiKey

  const origin = await resolveCoords(options.originLat, options.originLon, options.originAddress, apiKey)
  const dest = await resolveCoords(options.destLat, options.destLon, options.destAddress, apiKey)
  const travelMode = options.travelMode || 'car'

  const route = await cachedRouteWithGeometry(origin.lat, origin.lon, dest.lat, dest.lon, travelMode, apiKey)

  return returnServiceWithData(service, {
    ...route,
    routeName: options.routeName || `${origin.lat.toFixed(2)},${origin.lon.toFixed(2)} → ${dest.lat.toFixed(2)},${dest.lon.toFixed(2)}`,
    apiKey,
  })
})
