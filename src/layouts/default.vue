<template>
  <img
    v-if="$settings.logo && showLogo"
    :src="`/api/assets/${$settings.logo}`"
    :alt="$settings.title || 'Logo'"
    class="fixed top-6 left-6 z-50 h-8 w-auto object-contain pointer-events-none drop-shadow-md"
  >
  <div class="min-h-screen relative flex flex-col">
    <div
      v-if="$settings.background"
      class="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
      :style="{ backgroundImage: `url(/api/assets/${$settings.background})` }"
    />
    <div
      v-if="$settings.background"
      class="fixed inset-0 -z-10"
      :style="{
        backgroundColor: overlay.color,
        opacity: overlay.opacity,
      }"
    />
    <div class="mx-auto px-4 sm:px-6 lg:px-8" :style="{ maxWidth: containerMaxWidth }">
      <div class="pt-6 pb-2">
        <SearchBar />
      </div>
      <nav v-if="tabs.length > 0" class="flex items-center gap-1 pb-4 overflow-x-auto scrollbar-hide">
        <button
          v-for="(tab, idx) in tabs"
          :key="tab.name"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all"
          :class="idx === activeTabIndex
            ? 'bg-white/20 text-white shadow-sm'
            : 'text-white/50 hover:text-white/80 hover:bg-white/10'"
          @click="activeTabIndex = idx"
        >
          <Icon v-if="tab.icon" :name="tab.icon" class="w-4 h-4 flex-shrink-0" />
          {{ tab.name }}
        </button>
      </nav>
      <slot />
    </div>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import type { Tab } from '~/types'

const { $settings, $tabs, $activeTabIndex } = useNuxtApp()

const tabs = $tabs as Tab[]
const activeTabIndex = $activeTabIndex as Ref<number>

const overlay = computed(() => ({
  color: $settings.backgroundOverlay?.color ?? '#000000',
  opacity: $settings.backgroundOverlay?.opacity ?? 0.5,
}))

const windowWidth = ref(0)
const showLogo = computed(() => windowWidth.value > 1640)

onMounted(() => {
  windowWidth.value = window.innerWidth
  window.addEventListener('resize', () => {
    windowWidth.value = window.innerWidth
  })
})

const containerMaxWidth = computed(() => {
  const gridCols = $settings.layout?.grid?.xlarge ?? 5
  const listCols = $settings.layout?.list?.xlarge ?? 5
  const maxCols = Math.max(gridCols, listCols)
  return `${maxCols * 240 + 80}px`
})
</script>
