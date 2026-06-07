import type { RadioBrowserStation } from '~/server/utils/radioBrowser'

export function useRadioBrowser() {
  async function searchStations(name: string, countrycode = 'NL', limit = 10): Promise<RadioBrowserStation[]> {
    return $fetch('/api/radio-browser/stations/search', {
      query: { name, countrycode, limit },
    })
  }

  async function getStation(uuid: string): Promise<RadioBrowserStation> {
    return $fetch(`/api/radio-browser/stations/${uuid}`)
  }

  return { searchStations, getStation }
}
