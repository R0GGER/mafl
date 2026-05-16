<template>
  <div v-if="props.options?.hidden" class="hidden">
    <ServiceBase v-bind="props">
      <template #description="{ service }">
        <span v-if="service?.data?.html" v-html="service.data.html" />
      </template>
    </ServiceBase>
  </div>
  <ServiceBase v-else v-bind="props">
    <template #icon>
      <ServiceBaseIcon v-if="props.icon?.name || props.icon?.url || props.icon?.favicon" v-bind="props.icon" />
      <ServiceBaseIcon v-else name="mdi:code-tags" v-bind="iconProps" />
    </template>
    <template #title>
      {{ props.title || '' }}
    </template>
    <template #description="{ service }">
      <span v-if="service?.data?.html" v-html="service.data.html" />
    </template>
  </ServiceBase>
</template>

<script setup lang="ts">
import type { CustomHtmlService, ServiceClient } from '~/types'

const props = defineProps<ServiceClient<CustomHtmlService>>()

const iconProps = computed(() => {
  if (!props.icon) {
    return {}
  }
  const { name: _, ...p } = props.icon
  return p
})
</script>
