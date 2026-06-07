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
      >
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

    <Teleport to="body">
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
          ref="dropdownRef"
          class="rounded-xl border border-white/15 bg-neutral-950 shadow-xl shadow-black/20 overflow-hidden"
          :style="dropdownStyle"
        >
        <div v-if="filteredItems.length" class="py-1.5 max-h-80 overflow-y-auto">
          <div class="px-3 py-1.5 text-[11px] font-medium text-white/30 uppercase tracking-wider">
            Bookmarks
          </div>
          <component
            :is="item.isWebRadio ? 'button' : 'a'"
            v-for="(item, idx) in filteredItems"
            :key="item.id"
            :href="item.isWebRadio ? undefined : item.link"
            :target="item.isWebRadio ? undefined : linkTarget"
            type="button"
            class="flex items-center gap-3 px-3 py-2 mx-1.5 rounded-lg transition-colors w-[calc(100%-0.75rem)] text-left"
            :class="idx === selectedIndex ? 'bg-white/15' : 'hover:bg-white/10'"
            @mouseenter="selectedIndex = idx"
            @click="item.isWebRadio ? handleWebRadioBookmark(item, $event) : undefined"
          >
            <div class="flex-shrink-0 w-5 h-5 overflow-hidden">
              <ServiceBaseIcon v-if="item.icon" v-bind="{ ...item.icon, wrap: false }" />
              <Icon v-else :name="item.isWebRadio ? 'mdi:radio' : 'mdi:link'" class="w-5 h-5 text-white/50" />
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-sm text-white truncate">{{ item.title }}</div>
              <div v-if="item.description" class="text-xs text-white/40 truncate">{{ item.description }}</div>
            </div>
            <div class="flex items-center gap-1.5 flex-shrink-0">
              <span v-if="item.isWebRadio" class="px-1.5 py-0.5 text-[10px] font-medium rounded bg-white/10 text-white/70">
                Radio
              </span>
              <span v-if="item.tab" class="px-1.5 py-0.5 text-[10px] font-medium rounded bg-white/10 text-white/70 truncate max-w-24">
                {{ item.tab }}
              </span>
              <span class="text-[11px] text-white/30 truncate max-w-24">
                {{ item.group }}
              </span>
            </div>
          </component>
        </div>

        <div v-if="showRadioSection" class="border-t border-white/10 py-1.5 max-h-80 overflow-y-auto">
          <div class="px-3 py-1.5 text-[11px] font-medium text-white/30 uppercase tracking-wider">
            Webradio
          </div>
          <div v-if="radioLoading" class="px-3 py-2 text-xs text-white/40">Searching stations...</div>
          <div v-else-if="!radioResults.length" class="px-3 py-2 text-xs text-white/40">No stations found</div>
          <button
            v-for="(station, idx) in radioResults"
            :key="station.stationuuid"
            type="button"
            class="flex items-center gap-3 px-3 py-2 mx-1.5 rounded-lg transition-colors w-[calc(100%-0.75rem)] text-left"
            :class="(filteredItems.length + idx) === selectedIndex ? 'bg-white/15' : 'hover:bg-white/10'"
            @mouseenter="selectedIndex = filteredItems.length + idx"
            @click="playRadioStation(station)"
          >
            <div class="flex-shrink-0 w-5 h-5 overflow-hidden rounded">
              <img v-if="station.favicon" :src="station.favicon" alt="" class="w-full h-full object-cover">
              <Icon v-else name="mdi:radio" class="w-5 h-5 text-white/50" />
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-sm text-white truncate">{{ station.name }}</div>
              <div class="text-xs text-white/40 truncate">{{ station.tags || station.codec }}</div>
            </div>
          </button>
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
            :class="(filteredItems.length + radioSectionCount + idx) === selectedIndex ? 'bg-white/15' : 'hover:bg-white/10'"
            @mouseenter="selectedIndex = filteredItems.length + radioSectionCount + idx"
          >
            <Icon :name="engine.icon" class="w-5 h-5 flex-shrink-0" :style="{ color: engine.color }" />
            <span class="text-sm text-white">Search <strong>{{ engine.name }}</strong> for "{{ query }}"</span>
          </a>
        </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { Service, ServiceIcon, Tab } from '~/types'
import type { RadioBrowserStation } from '~/server/utils/radioBrowser'

interface FlatItem {
  id: string
  title: string
  description?: string
  link?: string
  icon?: ServiceIcon
  tab?: string
  group: string
  isWebRadio?: boolean
  stationUuid?: string
}

const { $services, $settings, $tabs } = useNuxtApp()
const tabs = $tabs as Tab[]

const inputRef = ref<HTMLInputElement>()
const containerRef = ref<HTMLElement>()
const dropdownRef = ref<HTMLElement>()
const dropdownStyle = ref<Record<string, string>>({})
const query = ref('')
const focused = ref(false)
const selectedIndex = ref(0)

const radioResults = ref<RadioBrowserStation[]>([])
const radioLoading = ref(false)

const { play } = useWebRadioPlayer()
const { searchStations } = useRadioBrowser()

const linkTarget = computed(() => $settings.behaviour?.target ?? '_blank')
const searchWebradioEnabled = computed(() => $settings.searchWebradio === true)
const searchWebradioCountryCode = computed(() => $settings.searchWebradioCountryCode ?? 'NL')

const placeholder = computed(() => {
  if (searchWebradioEnabled.value) {
    return 'Search bookmarks, radio, or Google... ( / or Ctrl+K )'
  }
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

function pushItem(items: FlatItem[], item: Service, group: string, tab?: string) {
  items.push({
    id: item.id,
    title: item.title ?? '',
    description: item.description,
    link: item.link,
    icon: item.icon,
    tab,
    group,
    isWebRadio: item.type === 'web-radio',
    stationUuid: item.type === 'web-radio' ? item.options?.stationUuid : undefined,
  })
}

const allItems = computed<FlatItem[]>(() => {
  const items: FlatItem[] = []

  if (tabs.length > 0) {
    for (const tab of tabs) {
      for (const group of tab.services) {
        for (const item of group.items) {
          if (item.stack?.length) {
            for (const child of item.stack) {
              pushItem(items, child, group.title ?? '', tab.name)
            }
          }
          else {
            pushItem(items, item, group.title ?? '', tab.name)
          }
        }
      }
    }
  }
  else {
    for (const group of $services) {
      for (const item of group.items) {
        if (item.stack?.length) {
          for (const child of item.stack) {
            pushItem(items, child, group.title ?? '')
          }
        }
        else {
          pushItem(items, item, group.title ?? '')
        }
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

const showRadioSection = computed(() => {
  return searchWebradioEnabled.value && query.value.length >= 2
})

const radioSectionCount = computed(() => {
  if (!showRadioSection.value) return 0
  if (radioLoading.value) return 1
  return Math.max(radioResults.value.length, 1)
})

const showDropdown = computed(() => {
  if (!focused.value || query.value.length < 1) return false
  if (filteredItems.value.length > 0) return true
  if (showRadioSection.value) return true
  return query.value.length >= 2
})

function updateDropdownPosition() {
  if (!containerRef.value) return
  const rect = containerRef.value.getBoundingClientRect()
  dropdownStyle.value = {
    position: 'fixed',
    top: `${rect.bottom + 8}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    zIndex: '10000',
    isolation: 'isolate',
    transform: 'translateZ(0)',
  }
}

watch(showDropdown, async (visible) => {
  document.body.classList.toggle('search-dropdown-open', visible)
  if (visible) {
    await nextTick()
    updateDropdownPosition()
  }
})

useEventListener(window, 'scroll', updateDropdownPosition, { capture: true })
useEventListener(window, 'resize', updateDropdownPosition)
useResizeObserver(containerRef, updateDropdownPosition)

const totalItems = computed(() => {
  return filteredItems.value.length + radioSectionCount.value + (query.value.length >= 2 ? searchEngines.value.length : 0)
})

async function fetchRadioResults() {
  if (!searchWebradioEnabled.value || query.value.length < 2) {
    radioResults.value = []
    radioLoading.value = false
    return
  }

  radioLoading.value = true
  try {
    radioResults.value = await searchStations(
      query.value,
      searchWebradioCountryCode.value,
      8,
    )
  }
  catch {
    radioResults.value = []
  }
  finally {
    radioLoading.value = false
  }
}

const debouncedFetchRadio = useDebounceFn(fetchRadioResults, 300)

watch(query, () => {
  selectedIndex.value = 0
  debouncedFetchRadio()
})

async function playRadioStation(station: RadioBrowserStation) {
  await play({
    stationuuid: station.stationuuid,
    name: station.name,
    urlResolved: station.urlResolved,
    favicon: station.favicon,
  })
  clearSearch()
  focused.value = false
  inputRef.value?.blur()
}

async function handleWebRadioBookmark(item: FlatItem, event: Event) {
  event.preventDefault()
  if (!item.stationUuid) return

  try {
    const station = await $fetch<RadioBrowserStation>(`/api/radio-browser/stations/${item.stationUuid}`)
    await play({
      stationuuid: station.stationuuid,
      name: item.title || station.name,
      urlResolved: station.urlResolved,
      favicon: item.icon?.url || station.favicon,
    })
    clearSearch()
    focused.value = false
    inputRef.value?.blur()
  }
  catch {
    // ignore
  }
}

function moveSelection(delta: number) {
  if (!showDropdown.value) return
  const count = totalItems.value
  if (count === 0) return
  selectedIndex.value = (selectedIndex.value + delta + count) % count
}

async function handleEnter() {
  if (!showDropdown.value) return

  const bookmarkCount = filteredItems.value.length
  const radioCount = radioSectionCount.value

  if (selectedIndex.value < bookmarkCount) {
    const item = filteredItems.value[selectedIndex.value]
    if (item?.isWebRadio) {
      await handleWebRadioBookmark(item, new Event('click'))
    }
    else if (item?.link) {
      window.open(item.link, linkTarget.value)
      clearSearch()
    }
    return
  }

  const radioIdx = selectedIndex.value - bookmarkCount
  if (radioIdx < radioCount && showRadioSection.value) {
    if (!radioLoading.value && radioResults.value[radioIdx]) {
      await playRadioStation(radioResults.value[radioIdx])
    }
    return
  }

  const engineIdx = selectedIndex.value - bookmarkCount - radioCount
  const engine = searchEngines.value[engineIdx]
  if (engine) {
    window.open(engine.url + encodeURIComponent(query.value), '_blank')
    clearSearch()
  }
}

function handleEscape() {
  if (query.value) {
    clearSearch()
  }
  else {
    focused.value = false
    inputRef.value?.blur()
  }
}

function clearSearch() {
  query.value = ''
  selectedIndex.value = 0
  radioResults.value = []
  radioLoading.value = false
}

function handleClickOutside(e: MouseEvent) {
  const target = e.target as Node
  if (containerRef.value?.contains(target)) return
  if (dropdownRef.value?.contains(target)) return
  focused.value = false
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
  document.body.classList.remove('search-dropdown-open')
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleGlobalKeydown)
})
</script>
