<template>
  <section class="admin-section">
    <button class="admin-section-header" @click="open = !open">
      <span class="font-semibold text-fg">Layout</span>
      <span class="chevron" :class="{ rotated: open }" />
    </button>
    <div v-show="open" class="admin-section-body">
      <p class="text-xs text-fg-dimmed mb-2">Grid columns per breakpoint</p>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div>
          <label class="admin-label">Small</label>
          <input v-model.number="state.gridSmall" type="number" min="1" max="12" class="admin-input w-full">
        </div>
        <div>
          <label class="admin-label">Medium</label>
          <input v-model.number="state.gridMedium" type="number" min="1" max="12" class="admin-input w-full">
        </div>
        <div>
          <label class="admin-label">Large</label>
          <input v-model.number="state.gridLarge" type="number" min="1" max="12" class="admin-input w-full">
        </div>
        <div>
          <label class="admin-label">XLarge</label>
          <input v-model.number="state.gridXlarge" type="number" min="1" max="12" class="admin-input w-full">
        </div>
      </div>

      <p class="text-xs text-fg-dimmed mt-4 mb-2">Grid item size</p>
      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="admin-label">Icon size</label>
          <input v-model="state.gridIconSize" type="text" class="admin-input w-full" placeholder="4rem">
        </div>
        <div>
          <label class="admin-label">Item padding</label>
          <input v-model="state.gridItemPadding" type="text" class="admin-input w-full" placeholder="1rem">
        </div>
      </div>
      <p class="text-xs text-fg-dimmed mt-1">Use smaller values (e.g. 2.5rem / 0.5rem) to fit more icons per row.</p>

      <p class="text-xs text-fg-dimmed mt-4 mb-2">List columns per breakpoint</p>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div>
          <label class="admin-label">Small</label>
          <input v-model.number="state.listSmall" type="number" min="1" max="12" class="admin-input w-full">
        </div>
        <div>
          <label class="admin-label">Medium</label>
          <input v-model.number="state.listMedium" type="number" min="1" max="12" class="admin-input w-full">
        </div>
        <div>
          <label class="admin-label">Large</label>
          <input v-model.number="state.listLarge" type="number" min="1" max="12" class="admin-input w-full">
        </div>
        <div>
          <label class="admin-label">XLarge</label>
          <input v-model.number="state.listXlarge" type="number" min="1" max="12" class="admin-input w-full">
        </div>
      </div>

      <p class="text-xs text-fg-dimmed mt-4 mb-2">Spacing</p>
      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="admin-label">Group</label>
          <input v-model="state.spacingGroup" type="text" class="admin-input w-full" placeholder="2.5rem">
        </div>
        <div>
          <label class="admin-label">Item</label>
          <input v-model="state.spacingItem" type="text" class="admin-input w-full" placeholder="0.5rem">
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { BuilderState } from '~/composables/useConfigBuilder'

defineProps<{ state: BuilderState }>()
const open = ref(false)
</script>
