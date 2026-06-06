<template>
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
</template>

<script setup lang="ts">
import type { TomtomEtaService, ServiceClient } from '~/types'

const props = defineProps<ServiceClient<TomtomEtaService>>()

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
</script>
