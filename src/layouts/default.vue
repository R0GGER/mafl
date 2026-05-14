<template>
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
    <div class="max-w-screen-2xl mx-auto xl:flex-row px-4">
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
</script>
