<template>
  <div v-if="props.options?.hidden" class="hidden">
    <ServiceBase v-bind="props">
      <template #description="{ service }">
        <span v-if="service?.data?.html" ref="hiddenHtmlRef" v-html="service.data.html" />
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
      <span v-if="service?.data?.html" ref="visibleHtmlRef" v-html="service.data.html" />
    </template>
  </ServiceBase>
</template>

<script setup lang="ts">
import type { CustomHtmlService, ServiceClient } from '~/types'

const props = defineProps<ServiceClient<CustomHtmlService>>()

const hiddenHtmlRef = ref<HTMLElement | null>(null)
const visibleHtmlRef = ref<HTMLElement | null>(null)

const iconProps = computed(() => {
  if (!props.icon) {
    return {}
  }
  const { name: _, ...p } = props.icon
  return p
})

function activateScripts(container: HTMLElement) {
  const scripts = container.querySelectorAll('script')
  scripts.forEach((oldScript) => {
    const newScript = document.createElement('script')
    for (const attr of oldScript.attributes) {
      newScript.setAttribute(attr.name, attr.value)
    }
    if (oldScript.textContent) {
      newScript.textContent = oldScript.textContent
    }
    oldScript.parentNode?.replaceChild(newScript, oldScript)
  })
}

function watchRef(elRef: Ref<HTMLElement | null>) {
  watch(elRef, (el) => {
    if (el) {
      nextTick(() => activateScripts(el))
    }
  }, { immediate: true })
}

watchRef(hiddenHtmlRef)
watchRef(visibleHtmlRef)
</script>
