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
          <div class="flex items-center gap-2 mb-3">
            <input v-model="tab.name" type="text" class="admin-input flex-1 font-medium" placeholder="Tab name">
            <input v-model="tab.icon" type="text" class="admin-input w-36" placeholder="Icon (mdi:home)">
            <button class="text-red-400 hover:text-red-300 text-lg px-2" @click="removeTab(ti)">&times;</button>
          </div>

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
                <button class="text-red-400 hover:text-red-300 px-1" @click="removeGroup(ti, gi)">&times;</button>
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
                    <button class="text-red-400 hover:text-red-300 px-1" @click="removeItem(ti, gi, ii)">&times;</button>
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
  addGroup: (tabIndex: number, name?: string, display?: 'grid' | 'list') => void
  removeGroup: (tabIndex: number, groupIndex: number) => void
  addItem: (tabIndex: number, groupIndex: number, serviceType?: ServiceType) => void
  removeItem: (tabIndex: number, groupIndex: number, itemIndex: number) => void
  moveItem: (tabIndex: number, groupIndex: number, itemIndex: number, direction: -1 | 1) => void
  moveGroup: (tabIndex: number, groupIndex: number, direction: -1 | 1) => void
}>()

const open = ref(true)
const openEdits = ref(new Set<string>())

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
