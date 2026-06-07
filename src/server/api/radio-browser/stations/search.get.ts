import { searchStations } from '~/server/utils/radioBrowser'

export default defineEventHandler(async (event) => {
  const { name, countrycode, limit } = getQuery(event)

  return searchStations({
    name: name ? String(name) : undefined,
    countrycode: countrycode ? String(countrycode) : 'NL',
    limit: limit ? Number.parseInt(String(limit), 10) : 10,
  })
})
