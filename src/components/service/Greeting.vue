<template>
  <ServiceBase v-bind="props">
    <template v-if="!props.icon?.name && !props.icon?.url && !props.icon?.favicon" #icon>
      <ServiceBaseIcon name="mdi:hand-wave-outline" v-bind="iconProps" />
    </template>
    <template #title="{ service }">
      {{ service?.data?.text || '' }}
    </template>
    <template #description="{ service }">
      {{ service?.data?.subtitle || '' }}
    </template>
  </ServiceBase>
</template>

<script setup lang="ts">
import type { GreetingService, ServiceClient } from '~/types'

const props = defineProps<ServiceClient<GreetingService>>()

const iconProps = computed(() => {
  if (!props.icon) {
    return {}
  }
  const { name: _, ...p } = props.icon
  return p
})
</script>
