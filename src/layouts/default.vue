<template>
  <div
    v-if="logoBoth && showLogo"
    class="fixed top-6 left-6 z-50 flex items-center gap-2 pointer-events-none drop-shadow-md"
  >
    <img
      :src="`/api/assets/${logoBoth.image}`"
      :alt="$settings.title || 'Logo'"
      class="h-8 w-auto object-contain"
    >
    <span
      class="select-none"
      :style="logoTextStyle"
    >{{ logoBoth.text }}</span>
  </div>
  <img
    v-else-if="logoImage && showLogo"
    :src="`/api/assets/${logoImage}`"
    :alt="$settings.title || 'Logo'"
    class="fixed top-6 left-6 z-50 h-8 w-auto object-contain pointer-events-none drop-shadow-md"
  >
  <span
    v-else-if="logoText && showLogo"
    class="fixed top-6 left-6 z-50 pointer-events-none drop-shadow-md select-none"
    :style="logoTextStyle"
  >{{ logoText.text }}</span>
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
    <div class="w-full mx-auto px-4 sm:px-6 lg:px-8" :style="{ maxWidth: containerMaxWidth }">
      <div class="pt-6 pb-2">
        <SearchBar />
      </div>
      <nav v-if="visibleTabs.length > 1" class="flex items-center gap-1 pb-4 overflow-x-auto scrollbar-hide">
        <button
          v-for="(tab, idx) in visibleTabs"
          :key="tab.name"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all"
          :class="idx === activeTabIndex
            ? 'bg-white/20 text-white shadow-sm'
            : 'text-white/50 hover:text-white/80 hover:bg-white/10'"
          @click="selectTab(idx)"
        >
          <Icon v-if="tab.icon" :name="tab.icon" class="w-4 h-4 flex-shrink-0" />
          {{ tab.name }}
        </button>
      </nav>
      <slot />
    </div>
    <Footer />
    <ServiceWebRadioMiniPlayer />
  </div>
</template>

<script setup lang="ts">
import type { Tab, LogoText, LogoBoth } from '~/types'

const { $settings, $tabs, $activeTabIndex } = useNuxtApp()

const visibleTabs = $tabs as Tab[]
const activeTabIndex = $activeTabIndex as Ref<number>

function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

function findTabIndexByHash(hash: string): number {
  if (!hash || hash === '#') return -1
  const slug = hash.slice(1)
  return visibleTabs.findIndex(tab => slugify(tab.name) === slug)
}

function setTabFromHash() {
  const idx = findTabIndexByHash(window.location.hash)
  if (idx >= 0) {
    activeTabIndex.value = idx
  }
}

function selectTab(idx: number) {
  activeTabIndex.value = idx
  const slug = slugify(visibleTabs[idx].name)
  window.history.replaceState(null, '', `#${slug}`)
}

const overlay = computed(() => ({
  color: $settings.backgroundOverlay?.color ?? '#000000',
  opacity: $settings.backgroundOverlay?.opacity ?? 0.5,
}))

const logoBoth = computed((): LogoBoth | null => {
  const logo = $settings.logo
  if (!logo || typeof logo === 'string') return null
  if (logo.type === 'both') return logo
  return null
})

const logoImage = computed(() => {
  const logo = $settings.logo
  if (!logo) return null
  if (typeof logo === 'string') return logo
  if (logo.type === 'image') return logo.image
  return null
})

const logoText = computed((): LogoText | null => {
  const logo = $settings.logo
  if (!logo || typeof logo === 'string') return null
  if (logo.type === 'text') return logo
  return null
})

const logoTextSource = computed(() => logoBoth.value || logoText.value)

const logoTextStyle = computed(() => {
  const lt = logoTextSource.value
  if (!lt) return {}
  return {
    fontSize: lt.fontSize || '1.5rem',
    fontWeight: lt.fontWeight || 700,
    fontFamily: lt.fontFamily || 'inherit',
    color: lt.color || '#ffffff',
    backgroundColor: lt.backgroundColor || 'transparent',
    borderRadius: lt.borderRadius || '0',
    padding: lt.padding || '0',
    lineHeight: 1,
  }
})

const windowWidth = ref(0)
const showLogo = computed(() => windowWidth.value > 1640)

onMounted(() => {
  setTabFromHash()
  window.addEventListener('hashchange', setTabFromHash)

  windowWidth.value = window.innerWidth
  window.addEventListener('resize', () => {
    windowWidth.value = window.innerWidth
  })
})

onUnmounted(() => {
  window.removeEventListener('hashchange', setTabFromHash)
})

const containerMaxWidth = computed(() => {
  const gridCols = $settings.layout?.grid?.xlarge ?? 5
  const listCols = $settings.layout?.list?.xlarge ?? 5
  const maxCols = Math.max(gridCols, listCols)
  return `${maxCols * 240 + 80}px`
})
</script>
