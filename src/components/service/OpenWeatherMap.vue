<template>
  <ServiceBase v-bind="props">
    <template #icon="{ service }">
      <ServiceBaseIcon :name="`wi:owm-${service?.data?.iconId}`" v-bind="iconProps" />
    </template>
    <template #title="{ service }">
      <span class="flex flex-col items-start">
        <span v-if="service.data?.place">{{ service.data.place }}</span>
        <span>{{ service.data?.temp?.toFixed(1) }} {{ metricSymbol }}</span>
      </span>
    </template>
    <template #description="{ service }">
      <template v-if="showDescription">{{ service.data?.description }}</template>
    </template>
  </ServiceBase>
</template>

<script setup lang="ts">
import type { OpenWeatherMapService, ServiceClient } from '~/types'

const props = defineProps<ServiceClient<OpenWeatherMapService>>()
const showDescription = computed(() => props.options?.showDescription !== false)
const iconProps = computed(() => {
  if (!props.icon) {
    return {}
  }

  const { name: _, ...p } = props.icon

  return p
})
const metricSymbol = computed(() => {
  if (props?.options?.units === 'imperial') {
    return '°F'
  }

  return '°C'
})
</script>
