<template>
  <ServiceBase v-bind="props">
    <template v-if="!props.icon?.name && !props.icon?.url && !props.icon?.favicon" #icon>
      <ServiceBaseIcon name="mdi:hand-wave-outline" v-bind="iconProps" />
    </template>
    <template #title="{ service }">
      <span v-if="service?.data?.text" class="greeting-text" v-html="service.data.text" />
    </template>
    <template #description="{ service }">
      <span v-if="service?.data?.subtitle" class="greeting-subtitle" v-html="service.data.subtitle" />
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

<style>
/* Allow the greeting to render multi-line HTML by removing the default
   line-clamp on the parent title (h3) and description (p) elements. */
h3:has(> .greeting-text) {
  display: block;
  -webkit-line-clamp: unset;
  -webkit-box-orient: unset;
  overflow: visible;
}
p:has(> .greeting-subtitle) {
  display: block;
  -webkit-line-clamp: unset;
  -webkit-box-orient: unset;
  overflow: visible;
}
.greeting-text,
.greeting-subtitle {
  white-space: normal;
  word-break: break-word;
}
.greeting-text a,
.greeting-subtitle a {
  color: inherit;
  text-decoration: underline;
}
</style>
