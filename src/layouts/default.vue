<template>
  <img
    v-if="$settings.logo"
    :src="`/api/assets/${$settings.logo}`"
    :alt="$settings.title || 'Logo'"
    class="hidden sm:block fixed top-5 left-5 sm:top-6 sm:left-6 z-50 h-6 sm:h-7 md:h-8 w-auto object-contain pointer-events-none drop-shadow-md"
  >
  <div class="min-h-screen relative">
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

const containerMaxWidth = computed(() => {
  const gridCols = $settings.layout?.grid?.xlarge ?? 5
  const listCols = $settings.layout?.list?.xlarge ?? 5
  const maxCols = Math.max(gridCols, listCols)
  return `${maxCols * 240 + 80}px`
})
</script>
