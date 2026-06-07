<template>
  <div>
    <ServiceBase v-bind="props">
      <template #icon>
        <ServiceBaseIcon :name="travelIcon" v-bind="iconProps" />
      </template>
      <template #title="{ service }">
        {{ service?.data?.routeName || '' }}: {{ formattedArrival(service?.data) }}
      </template>
      <template #description="{ service }">
        {{ formattedDuration(service?.data) }} · {{ formattedDelay(service?.data) }} · {{ formattedDistance(service?.data) }}
      </template>
    </ServiceBase>

    <div
      v-if="mapReady"
      ref="mapContainer"
      class="leaflet-map-widget"
      :style="{ height: `${mapHeight}px`, width: '100%', borderRadius: '0.75rem', overflow: 'hidden' }"
    />
  </div>
</template>

<script setup lang="ts">
import type { TomtomEtaMapService, ServiceClient } from '~/types'

const props = defineProps<ServiceClient<TomtomEtaMapService>>()

const iconProps = computed(() => {
  if (!props.icon) {
    return {}
  }
  const { name: _, ...p } = props.icon
  return p
})

const travelIcon = computed(() => {
  if (props.icon?.name) return props.icon.name
  const mode = props.options?.travelMode || 'car'
  const icons: Record<string, string> = {
    car: 'mdi:car',
    truck: 'mdi:truck',
    bicycle: 'mdi:bike',
    pedestrian: 'mdi:walk',
  }
  return icons[mode] || 'mdi:car'
})

const hour12 = computed(() => props.options?.timeFormat === '12h')
const mapHeight = computed(() => props.options?.mapHeight || 300)
const showTrafficFlow = computed(() => props.options?.showTrafficFlow !== false)
const showIncidents = computed(() => props.options?.showIncidents !== false)
const mapStyle = computed(() => props.options?.mapStyle || 'standard')

const MAP_TILE_PATHS: Record<string, string> = {
  standard: 'basic/main',
  dark: 'basic/night',
}

function formattedArrival(data: any) {
  if (!data?.arrivalTime) return ''
  try {
    const date = new Date(data.arrivalTime)
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: hour12.value,
    })
  }
  catch {
    return ''
  }
}

function formattedDuration(data: any) {
  if (!data?.travelTimeInSeconds) return ''
  const totalMin = Math.round(data.travelTimeInSeconds / 60)
  const hours = Math.floor(totalMin / 60)
  const mins = totalMin % 60
  if (hours > 0) return `${hours}h ${mins}min`
  return `${mins} min`
}

function formattedDelay(data: any) {
  if (!data?.trafficDelayInSeconds) return 'no delay'
  const delayMin = Math.round(data.trafficDelayInSeconds / 60)
  if (delayMin <= 0) return 'no delay'
  return `+${delayMin} min delay`
}

function formattedDistance(data: any) {
  if (!data?.lengthInMeters) return ''
  const km = (data.lengthInMeters / 1000).toFixed(1)
  return `${km} km`
}

const mapContainer = ref<HTMLElement | null>(null)
const mapReady = ref(false)

const immediate = computed(() => !!props.type)
const { data } = useServiceData<TomtomEtaMapService>(props, {
  immediate: immediate.value,
})

watch(data, async (val) => {
  if (!val?.data?.routePoints?.length) return
  mapReady.value = true
  await nextTick()
  initMap(val.data)
}, { immediate: true })

let leafletMap: any = null

async function initMap(routeData: any) {
  if (!mapContainer.value || leafletMap) return

  const L = await import('leaflet')
  await import('leaflet/dist/leaflet.css')

  const apiKey = routeData.apiKey
  const bbox = routeData.bbox
  const routePoints = routeData.routePoints

  const isSatellite = mapStyle.value === 'satellite'

  leafletMap = L.map(mapContainer.value, {
    zoomControl: true,
    attributionControl: false,
  })

  if (isSatellite) {
    L.tileLayer(
      `https://api.tomtom.com/map/1/tile/sat/main/{z}/{x}/{y}.jpg?key=${apiKey}&tileSize=256`,
      { maxZoom: 19 },
    ).addTo(leafletMap)
    L.tileLayer(
      `https://api.tomtom.com/map/1/tile/hybrid/main/{z}/{x}/{y}.png?key=${apiKey}&tileSize=256`,
      { maxZoom: 18, opacity: 0.9 },
    ).addTo(leafletMap)
  }
  else {
    const tilePath = MAP_TILE_PATHS[mapStyle.value] || 'basic/main'
    L.tileLayer(
      `https://api.tomtom.com/map/1/tile/${tilePath}/{z}/{x}/{y}.png?key=${apiKey}&tileSize=256`,
      { maxZoom: 18 },
    ).addTo(leafletMap)
  }

  if (showTrafficFlow.value) {
    L.tileLayer(
      `https://api.tomtom.com/traffic/map/4/tile/flow/relative0/{z}/{x}/{y}.png?key=${apiKey}&tileSize=256`,
      { maxZoom: 18, opacity: 0.7 },
    ).addTo(leafletMap)
  }

  if (showIncidents.value) {
    L.tileLayer(
      `https://api.tomtom.com/traffic/map/4/tile/incidents/s3/{z}/{x}/{y}.png?key=${apiKey}&tileSize=256`,
      { maxZoom: 18, opacity: 0.8 },
    ).addTo(leafletMap)
  }

  const latLngs = routePoints.map((p: any) => [p.lat, p.lon] as [number, number])
  L.polyline(latLngs, { color: '#4A90D9', weight: 5, opacity: 0.85 }).addTo(leafletMap)

  const startIcon = L.divIcon({ className: '', html: '<div style="background:#22c55e;width:12px;height:12px;border-radius:50%;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.4)"></div>', iconSize: [12, 12], iconAnchor: [6, 6] })
  const endIcon = L.divIcon({ className: '', html: '<div style="background:#ef4444;width:12px;height:12px;border-radius:50%;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.4)"></div>', iconSize: [12, 12], iconAnchor: [6, 6] })

  L.marker(latLngs[0], { icon: startIcon }).addTo(leafletMap)
  L.marker(latLngs[latLngs.length - 1], { icon: endIcon }).addTo(leafletMap)

  leafletMap.fitBounds([
    [bbox.minLat, bbox.minLon],
    [bbox.maxLat, bbox.maxLon],
  ], { padding: [20, 20] })
}

onBeforeUnmount(() => {
  if (leafletMap) {
    leafletMap.remove()
    leafletMap = null
  }
})
</script>
