<template>
  <section class="admin-section">
    <button class="admin-section-header" @click="open = !open">
      <span class="font-semibold text-fg">Styles</span>
      <span class="chevron" :class="{ rotated: open }" />
    </button>
    <div v-show="open" class="admin-section-body space-y-4">
      <div v-for="el in elements" :key="el" class="border border-fg/10 rounded-lg p-3">
        <h4 class="text-sm font-medium text-fg capitalize mb-2">{{ el }}</h4>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <div>
            <label class="admin-label">Font Family</label>
            <input v-model="state.styles[el].fontFamily" type="text" class="admin-input w-full" placeholder="Arial, sans-serif">
          </div>
          <div>
            <label class="admin-label">Font Size</label>
            <input v-model="state.styles[el].fontSize" type="text" class="admin-input w-full" placeholder="1rem">
          </div>
          <div>
            <label class="admin-label">Font Weight</label>
            <input v-model="state.styles[el].fontWeight" type="text" class="admin-input w-full" placeholder="600">
          </div>
          <div>
            <label class="admin-label">Font Style</label>
            <select v-model="state.styles[el].fontStyle" class="admin-input w-full">
              <option value="">--</option>
              <option value="normal">normal</option>
              <option value="italic">italic</option>
            </select>
          </div>
          <div>
            <label class="admin-label">Text Decoration</label>
            <select v-model="state.styles[el].textDecoration" class="admin-input w-full">
              <option value="">--</option>
              <option value="none">none</option>
              <option value="underline">underline</option>
              <option value="line-through">line-through</option>
            </select>
          </div>
          <div>
            <label class="admin-label">Color</label>
            <div class="flex gap-1 items-center">
              <input
                :value="state.styles[el].color || '#ffffff'"
                type="color"
                class="w-8 h-7 rounded cursor-pointer border-0"
                @input="state.styles[el].color = ($event.target as HTMLInputElement).value"
              >
              <input v-model="state.styles[el].color" type="text" class="admin-input flex-1" placeholder="#ffffff">
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { BuilderState } from '~/composables/useConfigBuilder'

defineProps<{ state: BuilderState }>()
const open = ref(false)
const elements = ['category', 'title', 'description'] as const
</script>
