<template>
  <div
    class="cursor-pointer rounded-2xl transition-all"
    :class="isActive ? 'ring-2 ring-white/30 bg-white/5' : 'hover:bg-fg/5 dark:hover:bg-fg/9'"
    @click="handleClick"
  >
    <ServiceBase ref="serviceBaseRef" v-bind="props">
      <template v-if="!props.icon?.name && !props.icon?.url && !props.icon?.favicon" #icon>
        <ServiceBaseIcon name="mdi:radio" v-bind="iconProps" />
      </template>
      <template #title="{ service }">
        <span class="flex items-center gap-2">
          {{ service?.data?.name || props.title || '' }}
          <Icon
            v-if="isActive"
            name="mdi:equalizer"
            class="w-4 h-4 text-white/70 animate-pulse flex-shrink-0"
          />
        </span>
      </template>
      <template #description="{ service }">
        {{ service?.data?.meta || service?.data?.tags || props.description || '' }}
      </template>
    </ServiceBase>
  </div>
</template>

<script setup lang="ts">
import type { ServiceClient, WebRadioService } from '~/types'

const props = defineProps<ServiceClient<WebRadioService>>()

const serviceBaseRef = ref<{ data?: { data?: WebRadioService['server'] } } | null>(null)

const { play, isActive: checkActive } = useWebRadioPlayer()

const iconProps = computed(() => {
  if (!props.icon) {
    return {}
  }
  const { name: _, ...p } = props.icon
  return p
})

const isActive = computed(() => {
  const uuid = serviceBaseRef.value?.data?.data?.stationuuid
  return uuid ? checkActive(uuid) : false
})

function handleClick() {
  const station = serviceBaseRef.value?.data?.data
  if (!station?.urlResolved) {
    return
  }

  play({
    stationuuid: station.stationuuid,
    name: station.name,
    urlResolved: station.urlResolved,
    favicon: station.favicon || props.icon?.url,
  })
}
</script>
