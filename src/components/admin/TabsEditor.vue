<template>
  <section class="admin-section">
    <button class="admin-section-header" @click="open = !open">
      <span class="font-semibold text-fg">Tabs &amp; Services</span>
      <span class="chevron" :class="{ rotated: open }" />
    </button>
    <div v-show="open" class="admin-section-body">
      <div class="space-y-4">
        <div v-for="(tab, ti) in state.tabs" :key="ti" class="border border-fg/10 rounded-lg p-3">
          <!-- Tab header -->
          <div class="flex items-center gap-2">
            <button class="text-fg-dimmed hover:text-fg px-1" :title="isTabOpen(ti) ? 'Collapse' : 'Expand'" @click="toggleTab(ti)">
              <span v-if="isTabOpen(ti)">&#9662;</span><span v-else>&#9656;</span>
            </button>
            <input v-model="tab.name" type="text" class="admin-input flex-1 font-medium" placeholder="Tab name">
            <input v-model="tab.icon" type="text" class="admin-input w-36" placeholder="Icon (mdi:home)">
            <button
              class="text-fg-dimmed hover:text-fg px-1"
              :class="{ 'text-sky-400 hover:text-sky-300': !tab.hidden, 'text-fg-dimmed/50 hover:text-fg-dimmed': tab.hidden }"
              :title="tab.hidden ? 'Show tab on frontpage' : 'Hide tab from frontpage'"
              @click="toggleTabHidden(ti)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <template v-if="!tab.hidden">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </template>
                <template v-else>
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </template>
              </svg>
            </button>
            <button
              class="text-fg-dimmed hover:text-fg px-1"
              :class="{ 'text-amber-400 hover:text-amber-300': tab.locked }"
              :title="tab.locked ? 'Unlock tab' : 'Lock tab'"
              @click="toggleTabLock(ti)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path v-if="tab.locked" d="M7 11V7a5 5 0 0 1 10 0v4" />
                <path v-else d="M7 11V7a5 5 0 0 1 9.9-1" />
              </svg>
            </button>
            <button
              v-if="!tab.locked"
              class="text-red-400 hover:text-red-300 px-1"
              @click="removeTab(ti)"
            >
              &times;
            </button>
          </div>

          <!-- Collapsible tab content -->
          <div v-show="isTabOpen(ti)" class="mt-3">
            <!-- Groups -->
            <div class="space-y-3 ml-2">
              <div v-for="(group, gi) in tab.groups" :key="gi" class="border border-fg/10 rounded p-2 bg-fg/[0.02]">
                <!-- Group header -->
                <div class="flex items-center gap-2 mb-2">
                  <button class="text-fg-dimmed hover:text-fg px-1" title="Move up" @click="moveGroup(ti, gi, -1)">&#9650;</button>
                  <button class="text-fg-dimmed hover:text-fg px-1" title="Move down" @click="moveGroup(ti, gi, 1)">&#9660;</button>
                  <input v-model="group.name" type="text" class="admin-input flex-1" placeholder="Group name">
                  <select v-model="group.display" class="admin-input text-xs">
                    <option value="list">list</option>
                    <option value="grid">grid</option>
                  </select>
                  <button v-if="!tab.locked" class="text-red-400 hover:text-red-300 px-1" @click="removeGroup(ti, gi)">&times;</button>
                </div>

                <!-- Items -->
                <div class="space-y-1">
                  <div
                    v-for="(item, ii) in group.items"
                    :key="ii"
                    class="border border-fg/10 rounded p-2 bg-fg/[0.03] text-xs"
                  >
                    <!-- Item summary row -->
                    <div class="flex items-center gap-1 mb-1">
                      <button class="text-fg-dimmed hover:text-fg px-1" title="Move up" @click="moveItem(ti, gi, ii, -1)">&#9650;</button>
                      <button class="text-fg-dimmed hover:text-fg px-1" title="Move down" @click="moveItem(ti, gi, ii, 1)">&#9660;</button>
                      <span v-if="item.serviceType !== 'bookmark'" class="text-[10px] px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-500">
                        {{ typeLabel(item.serviceType) }}
                      </span>
                      <span class="flex-1 font-medium text-fg truncate">{{ itemTitle(item) }}</span>
                      <button class="text-brand-500 hover:text-brand-400 px-1 text-xs" @click="toggleEdit(ti, gi, ii)">
                        {{ isEditing(ti, gi, ii) ? 'close' : 'edit' }}
                      </button>
                      <button v-if="!tab.locked" class="text-red-400 hover:text-red-300 px-1" @click="removeItem(ti, gi, ii)">&times;</button>
                    </div>

                    <!-- Expanded edit fields -->
                    <div v-if="isEditing(ti, gi, ii)" class="mt-2 space-y-2">
                      <!-- Module-specific fields -->
                      <AdminItemFields :item="item" :tab-index="ti" :group-index="gi" :item-index="ii" />
                    </div>
                  </div>
                </div>

                <!-- Add item buttons -->
                <div class="flex flex-wrap gap-1 mt-2">
                  <button class="text-xs text-brand-500 hover:text-brand-400" @click="addItem(ti, gi, 'bookmark')">+ Bookmark</button>
                  <template v-if="group.display === 'grid'">
                    <span class="text-xs text-fg-dimmed">|</span>
                    <button class="text-xs text-brand-500 hover:text-brand-400" @click="addItem(ti, gi, 'openweathermap')">+ Weather</button>
                    <span class="text-xs text-fg-dimmed">|</span>
                    <button class="text-xs text-brand-500 hover:text-brand-400" @click="addItem(ti, gi, 'ip-api')">+ IP API</button>
                    <span class="text-xs text-fg-dimmed">|</span>
                    <button class="text-xs text-brand-500 hover:text-brand-400" @click="addItem(ti, gi, 'time')">+ Time</button>
                    <span class="text-xs text-fg-dimmed">|</span>
                    <button class="text-xs text-brand-500 hover:text-brand-400" @click="addItem(ti, gi, 'datetime-weather')">+ DateTime Weather</button>
                    <span class="text-xs text-fg-dimmed">|</span>
                    <button class="text-xs text-brand-500 hover:text-brand-400" @click="addItem(ti, gi, 'greeting')">+ Greeting</button>
                    <span class="text-xs text-fg-dimmed">|</span>
                    <button class="text-xs text-brand-500 hover:text-brand-400" @click="addItem(ti, gi, 'custom-html')">+ Custom HTML</button>
                  </template>
                </div>
              </div>
            </div>
            <button
              class="mt-2 ml-2 text-xs text-brand-500 hover:text-brand-400"
              @click="addGroup(ti)"
            >
              + Add Group
            </button>
          </div>
        </div>
      </div>

      <button
        class="mt-3 text-sm bg-brand-600 hover:bg-brand-700 text-white px-3 py-1.5 rounded transition-colors"
        @click="addTab()"
      >
        + Add Tab
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { BuilderItem, BuilderState, ServiceType } from '~/composables/useConfigBuilder'

defineProps<{
  state: BuilderState
  addTab: (name?: string, icon?: string) => void
  removeTab: (index: number) => void
  toggleTabLock: (index: number) => void
  toggleTabHidden: (index: number) => void
  addGroup: (tabIndex: number, name?: string, display?: 'grid' | 'list') => void
  removeGroup: (tabIndex: number, groupIndex: number) => void
  addItem: (tabIndex: number, groupIndex: number, serviceType?: ServiceType) => void
  removeItem: (tabIndex: number, groupIndex: number, itemIndex: number) => void
  moveItem: (tabIndex: number, groupIndex: number, itemIndex: number, direction: -1 | 1) => void
  moveGroup: (tabIndex: number, groupIndex: number, direction: -1 | 1) => void
}>()

const open = ref(true)
const openTabs = ref(new Set<number>())
const openEdits = ref(new Set<string>())

function isTabOpen(ti: number) {
  return openTabs.value.has(ti)
}

function toggleTab(ti: number) {
  if (openTabs.value.has(ti)) {
    openTabs.value.delete(ti)
  }
  else {
    openTabs.value.add(ti)
  }
}

function editKey(ti: number, gi: number, ii: number) {
  return `${ti}-${gi}-${ii}`
}

function isEditing(ti: number, gi: number, ii: number) {
  return openEdits.value.has(editKey(ti, gi, ii))
}

function toggleEdit(ti: number, gi: number, ii: number) {
  const key = editKey(ti, gi, ii)
  if (openEdits.value.has(key)) {
    openEdits.value.delete(key)
  }
  else {
    openEdits.value.add(key)
  }
}

const TYPE_LABELS: Record<string, string> = {
  openweathermap: 'Weather',
  'ip-api': 'IP API',
  time: 'Time',
  'datetime-weather': 'DateTime Weather',
  greeting: 'Greeting',
  'custom-html': 'Custom HTML',
}

function typeLabel(t: string) {
  return TYPE_LABELS[t] || ''
}

function itemTitle(item: BuilderItem) {
  if (item.title) return item.title
  if (item.serviceType === 'greeting' && item.greetText) return item.greetText
  if (item.serviceType !== 'bookmark') return typeLabel(item.serviceType) || item.serviceType
  return '(untitled)'
}
</script>
