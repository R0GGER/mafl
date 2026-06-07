import type { Tag } from '~/types/config'

export interface ServiceStatus {
  enabled?: boolean
  interval?: number
  animation?: boolean
  position?: 'left' | 'right'
}

export interface ServiceIcon {
  url?: string
  name?: string
  favicon?: string
  wrap?: boolean
  background?: string
  color?: string
}

export interface Service {
  id: string
  type?: string
  title?: string
  description?: string
  link?: string
  target?: '_blank' | '_self' | '_parent' | '_top'
  icon?: ServiceIcon
  status?: ServiceStatus
  tags: Tag['name'][] | Tag[]
  span?: number
  stack?: Service[]
  options?: Record<string, any>
  secrets?: Record<string, any>
  server?: Record<string, any>
}

export type ServiceClient<T> = Omit<T, 'secrets' | 'server'>

export interface PingServiceData {
  status: boolean
  time: number
}

export interface ServiceWithDefaultData<S> {
  config: S
  defaultData: {
    ping?: PingServiceData
  }
}

export type ReturnServiceWithData<D, S extends ServiceWithDefaultData<Service>['defaultData']> = S & { data: D }

export interface BaseService extends Service {}

export interface IpApiService extends Service {
  options?: {
    flagIcon?: boolean
    locationName?: string
  }
  server: {
    ip: string
    place: string
  }
}

export interface OpenWeatherMapService extends Service {
  options: {
    lon: number
    lat: number
    units: 'metric' | 'imperial' | 'standard'
  }
  secrets: {
    apiKey: string
  }
  server: {
    temp: number
    place: string
    description: string
    iconId: number
  }
}

export interface TimeService extends Service {
  options: {
    timezone: string
    locationName?: string
    country?: string
    timeFormat?: '12h' | '24h'
    dateFormat?: 'short' | 'medium' | 'long' | 'short-eu' | 'compact' | 'iso' | 'eu'
  }
  server: {
    timezone: string
    locationName: string
    country: string
  }
}

export interface DatetimeWeatherService extends Service {
  options: {
    lon: number
    lat: number
    units: 'metric' | 'imperial' | 'standard'
    timezone: string
    timeFormat?: '12h' | '24h'
    dateFormat?: 'short' | 'medium' | 'long' | 'short-eu' | 'compact' | 'iso' | 'eu'
  }
  secrets: {
    apiKey: string
  }
  server: {
    temp: number
    place: string
    description: string
    iconId: number
    timezone: string
  }
}

export interface CustomHtmlService extends Service {
  options: {
    html: string
    hidden?: boolean
  }
  server: {
    html: string
  }
}

export interface GreetingService extends Service {
  options: {
    text: string
    subtitle?: string
  }
  server: {
    text: string
    subtitle: string
  }
}

export interface TomtomTrafficMapService extends Service {
  options: {
    lat?: number
    lon?: number
    address?: string
    zoom?: number
    showTrafficFlow?: boolean
    showIncidents?: boolean
    mapHeight?: number
    mapStyle?: 'standard' | 'dark' | 'satellite'
  }
  secrets: {
    apiKey: string
  }
  server: {
    lat: number
    lon: number
    zoom: number
    apiKey: string
  }
}

export interface TomtomEtaService extends Service {
  options: {
    originLat?: number
    originLon?: number
    originAddress?: string
    destLat?: number
    destLon?: number
    destAddress?: string
    routeName?: string
    travelMode?: 'car' | 'truck' | 'bicycle' | 'pedestrian'
    timeFormat?: '12h' | '24h'
  }
  secrets: {
    apiKey: string
  }
  server: {
    arrivalTime: string
    travelTimeInSeconds: number
    trafficDelayInSeconds: number
    lengthInMeters: number
    routeName: string
  }
}

export interface TomtomEtaMapService extends Service {
  options: {
    originLat?: number
    originLon?: number
    originAddress?: string
    destLat?: number
    destLon?: number
    destAddress?: string
    routeName?: string
    travelMode?: 'car' | 'truck' | 'bicycle' | 'pedestrian'
    showTrafficFlow?: boolean
    showIncidents?: boolean
    mapHeight?: number
    mapStyle?: 'standard' | 'dark' | 'satellite'
    timeFormat?: '12h' | '24h'
  }
  secrets: {
    apiKey: string
  }
  server: {
    arrivalTime: string
    travelTimeInSeconds: number
    trafficDelayInSeconds: number
    lengthInMeters: number
    routeName: string
    routePoints: { lat: number, lon: number }[]
    bbox: { minLat: number, minLon: number, maxLat: number, maxLon: number }
    apiKey: string
  }
}
