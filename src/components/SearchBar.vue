<template>
  <div class="relative w-full max-w-2xl mx-auto" ref="containerRef">
    <div
      class="flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all"
      :class="focused
        ? 'bg-white/15 border-white/30 shadow-lg shadow-black/10'
        : 'bg-white/10 border-white/15 hover:bg-white/12'"
    >
      <Icon name="mdi:magnify" class="w-5 h-5 text-white/60 flex-shrink-0" />
      <input
        ref="inputRef"
        v-model="query"
        type="text"
        :placeholder="placeholder"
        class="w-full bg-transparent text-white placeholder-white/40 text-sm outline-none"
        @focus="focused = true"
        @keydown.escape="handleEscape"
        @keydown.enter="handleEnter"
        @keydown.down.prevent="moveSelection(1)"
        @keydown.up.prevent="moveSelection(-1)"
      />
      <kbd
        v-if="!focused && !query"
        class="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-white/40 border border-white/15 rounded"
      >/</kbd>
      <button
        v-if="query"
        @click="clearSearch"
        class="text-white/40 hover:text-white/70 transition-colors flex-shrink-0"
      >
        <Icon name="mdi:close" class="w-4 h-4" />
      </button>
    </div>

    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-1"
    >
      <div
        v-if="showDropdown"
        class="absolute top-full left-0 right-0 mt-2 rounded-xl border border-white/15 bg-black/80 backdrop-blur-xl shadow-xl shadow-black/20 overflow-hidden z-50"
      >
        <div v-if="filteredItems.length" class="py-1.5 max-h-80 overflow-y-auto">
          <div class="px-3 py-1.5 text-[11px] font-medium text-white/30 uppercase tracking-wider">
            Bookmarks
          </div>
          <a
            v-for="(item, idx) in filteredItems"
            :key="item.id"
            :href="item.link"
            :target="linkTarget"
            class="flex items-center gap-3 px-3 py-2 mx-1.5 rounded-lg transition-colors"
            :class="idx === selectedIndex ? 'bg-white/15' : 'hover:bg-white/10'"
            @mouseenter="selectedIndex = idx"
          >
            <div class="flex-shrink-0 w-5 h-5 overflow-hidden">
              <ServiceBaseIcon v-if="item.icon" v-bind="{ ...item.icon, wrap: false }" />
              <Icon v-else name="mdi:link" class="w-5 h-5 text-white/50" />
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-sm text-white truncate">{{ item.title }}</div>
              <div v-if="item.description" class="text-xs text-white/40 truncate">{{ item.description }}</div>
            </div>
            <div class="flex items-center gap-1.5 flex-shrink-0">
              <span v-if="item.tab" class="px-1.5 py-0.5 text-[10px] font-medium rounded bg-white/10 text-white/70 truncate max-w-24">
                {{ item.tab }}
              </span>
              <span class="text-[11px] text-white/30 truncate max-w-24">
                {{ item.group }}
              </span>
            </div>
          </a>
        </div>

        <div v-if="query.length >= 2" class="border-t border-white/10 py-1.5">
          <div class="px-3 py-1.5 text-[11px] font-medium text-white/30 uppercase tracking-wider">
            Search the web
          </div>
          <a
            v-for="(engine, idx) in searchEngines"
            :key="engine.name"
            :href="engine.url + encodeURIComponent(query)"
            target="_blank"
            class="flex items-center gap-3 px-3 py-2 mx-1.5 rounded-lg transition-colors"
            :class="(filteredItems.length + idx) === selectedIndex ? 'bg-white/15' : 'hover:bg-white/10'"
            @mouseenter="selectedIndex = filteredItems.length + idx"
          >
            <Icon :name="engine.icon" class="w-5 h-5 flex-shrink-0" :style="{ color: engine.color }" />
            <span class="text-sm text-white">Search <strong>{{ engine.name }}</strong> for "{{ query }}"</span>
          </a>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { Service, ServiceIcon, Tab } from '~/types'

interface FlatItem {
  id: string
  title: string
  description?: string
  link?: string
  icon?: ServiceIcon
  tab?: string
  group: string
}

const { $services, $settings, $tabs } = useNuxtApp()
const tabs = $tabs as Tab[]

const inputRef = ref<HTMLInputElement>()
const containerRef = ref<HTMLElement>()
const query = ref('')
const focused = ref(false)
const selectedIndex = ref(0)

const linkTarget = computed(() => $settings.behaviour?.target ?? '_blank')

const placeholder = computed(() => {
  const provider = searchEngines.value[0]?.name ?? 'the web'
  return `Search bookmarks or ${provider}... ( / or Ctrl+K )`
})

const searchEngines = computed(() => {
  const engines = [
    { name: 'Google', url: 'https://www.google.com/search?q=', icon: 'mdi:google', color: '#4285f4' },
    { name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=', icon: 'simple-icons:duckduckgo', color: '#de5833' },
  ]

  const provider = $settings.searchProvider
  if (provider === 'duckduckgo') return engines.reverse()
  return engines
})

const allItems = computed<FlatItem[]>(() => {
  const items: FlatItem[] = []

  if (tabs.length > 0) {
    for (const tab of tabs) {
      for (const group of tab.services) {
        for (const item of group.items) {
          items.push({
            id: item.id,
            title: item.title ?? '',
            description: item.description,
            link: item.link,
            icon: item.icon,
            tab: tab.name,
            group: group.title ?? '',
          })
        }
      }
    }
  } else {
    for (const group of $services) {
      for (const item of group.items) {
        items.push({
          id: item.id,
          title: item.title ?? '',
          description: item.description,
          link: item.link,
          icon: item.icon,
          group: group.title ?? '',
        })
      }
    }
  }

  return items
})

const filteredItems = computed(() => {
  if (!query.value || query.value.length < 1) return []
  const q = query.value.toLowerCase()
  return allItems.value.filter((item) => {
    return (
      item.title.toLowerCase().includes(q) ||
      (item.description?.toLowerCase().includes(q)) ||
      (item.link?.toLowerCase().includes(q)) ||
      (item.tab?.toLowerCase().includes(q)) ||
      (item.group.toLowerCase().includes(q))
    )
  }).slice(0, 10)
})

const showDropdown = computed(() => {
  return focused.value && query.value.length >= 1 && (filteredItems.value.length > 0 || query.value.length >= 2)
})

const totalItems = computed(() => filteredItems.value.length + (query.value.length >= 2 ? searchEngines.value.length : 0))

watch(query, () => {
  selectedIndex.value = 0
})

function moveSelection(delta: number) {
  if (!showDropdown.value) return
  const count = totalItems.value
  if (count === 0) return
  selectedIndex.value = (selectedIndex.value + delta + count) % count
}

function handleEnter() {
  if (!showDropdown.value) return

  if (selectedIndex.value < filteredItems.value.length) {
    const item = filteredItems.value[selectedIndex.value]
    if (item?.link) {
      window.open(item.link, linkTarget.value)
    }
  } else {
    const engineIdx = selectedIndex.value - filteredItems.value.length
    const engine = searchEngines.value[engineIdx]
    if (engine) {
      window.open(engine.url + encodeURIComponent(query.value), '_blank')
    }
  }

  clearSearch()
}

function handleEscape() {
  if (query.value) {
    clearSearch()
  } else {
    focused.value = false
    inputRef.value?.blur()
  }
}

function clearSearch() {
  query.value = ''
  selectedIndex.value = 0
}

function handleClickOutside(e: MouseEvent) {
  if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
    focused.value = false
  }
}

function handleGlobalKeydown(e: KeyboardEvent) {
  if (e.key === '/' && !focused.value && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
    e.preventDefault()
    inputRef.value?.focus()
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault()
    inputRef.value?.focus()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleGlobalKeydown)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleGlobalKeydown)
})
</script>
