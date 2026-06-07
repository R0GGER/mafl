<template>
  <div>
    <div
      v-if="mapReady"
      ref="mapContainer"
      :style="{ height: `${mapHeight}px`, width: '100%', borderRadius: '0.75rem', overflow: 'hidden' }"
    />
    <ServicePlaceholder v-else />
  </div>
</template>

<script setup lang="ts">
import type { TomtomTrafficMapService, ServiceClient } from '~/types'

const props = defineProps<ServiceClient<TomtomTrafficMapService>>()

const mapHeight = computed(() => props.options?.mapHeight || 300)
const showTrafficFlow = computed(() => props.options?.showTrafficFlow !== false)
const showIncidents = computed(() => props.options?.showIncidents !== false)
const mapStyleOption = computed(() => props.options?.mapStyle || 'standard')

const MAP_TILE_PATHS: Record<string, string> = {
  standard: 'basic/main',
  dark: 'basic/night',
  satellite: 'hybrid/main',
}

const mapContainer = ref<HTMLElement | null>(null)
const mapReady = ref(false)

const immediate = computed(() => !!props.type)
const { data } = useServiceData<TomtomTrafficMapService>(props, {
  immediate: immediate.value,
})

watch(data, async (val) => {
  if (!val?.data?.lat) return
  mapReady.value = true
  await nextTick()
  initMap(val.data)
}, { immediate: true })

let leafletMap: any = null

async function initMap(mapData: any) {
  if (!mapContainer.value || leafletMap) return

  const L = await import('leaflet')
  await import('leaflet/dist/leaflet.css')

  const apiKey = mapData.apiKey
  const center: [number, number] = [mapData.lat, mapData.lon]
  const zoom = mapData.zoom

  leafletMap = L.map(mapContainer.value, {
    zoomControl: true,
    attributionControl: false,
    center,
    zoom,
  })

  const tilePath = MAP_TILE_PATHS[mapStyleOption.value] || 'basic/main'
  const tileExt = mapStyleOption.value === 'satellite' ? 'jpg' : 'png'
  L.tileLayer(
    `https://api.tomtom.com/map/1/tile/${tilePath}/{z}/{x}/{y}.${tileExt}?key=${apiKey}&tileSize=256`,
    { maxZoom: 18 },
  ).addTo(leafletMap)

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
}

onBeforeUnmount(() => {
  if (leafletMap) {
    leafletMap.remove()
    leafletMap = null
  }
})
</script>
