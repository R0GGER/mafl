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

      <!-- Global Card Style -->
      <div class="border border-fg/10 rounded-lg p-3">
        <h4 class="text-sm font-medium text-fg mb-2">Card (global default)</h4>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <div>
            <label class="admin-label">Background Color</label>
            <div class="flex gap-1 items-center">
              <input
                :value="state.styles.card.backgroundColor || '#000000'"
                type="color"
                class="w-8 h-7 rounded cursor-pointer border-0"
                @input="state.styles.card.backgroundColor = ($event.target as HTMLInputElement).value"
              >
              <input v-model="state.styles.card.backgroundColor" type="text" class="admin-input flex-1" placeholder="#1a1a2e">
            </div>
          </div>
          <div>
            <label class="admin-label">Opacity</label>
            <div class="flex gap-1 items-center">
              <input
                v-model="state.styles.card.opacity"
                type="range"
                min="0"
                max="1"
                step="0.05"
                class="flex-1"
              >
              <span class="text-xs text-fg-dimmed w-8 text-right">{{ state.styles.card.opacity || '--' }}</span>
            </div>
          </div>
          <div>
            <label class="admin-label">Blur (glass)</label>
            <div class="flex gap-1 items-center">
              <input
                :value="parseFloat(state.styles.card.blur) || 0"
                type="range"
                min="0"
                max="30"
                step="1"
                class="flex-1"
                @input="state.styles.card.blur = ($event.target as HTMLInputElement).value + 'px'"
              >
              <span class="text-xs text-fg-dimmed w-10 text-right">{{ state.styles.card.blur || '--' }}</span>
            </div>
          </div>
          <div>
            <label class="admin-label">Border Width</label>
            <input v-model="state.styles.card.borderWidth" type="text" class="admin-input w-full" placeholder="1px">
          </div>
          <div>
            <label class="admin-label">Border Style</label>
            <select v-model="state.styles.card.borderStyle" class="admin-input w-full">
              <option value="">--</option>
              <option value="none">none</option>
              <option value="solid">solid</option>
              <option value="dashed">dashed</option>
              <option value="dotted">dotted</option>
              <option value="double">double</option>
            </select>
          </div>
          <div>
            <label class="admin-label">Border Color</label>
            <div class="flex gap-1 items-center">
              <input
                :value="state.styles.card.borderColor || '#ffffff'"
                type="color"
                class="w-8 h-7 rounded cursor-pointer border-0"
                @input="state.styles.card.borderColor = ($event.target as HTMLInputElement).value"
              >
              <input v-model="state.styles.card.borderColor" type="text" class="admin-input flex-1" placeholder="rgba(255,255,255,0.2)">
            </div>
          </div>
          <div>
            <label class="admin-label">Border Radius</label>
            <input v-model="state.styles.card.borderRadius" type="text" class="admin-input w-full" placeholder="0.5rem">
          </div>
          <div>
            <label class="admin-label">Padding</label>
            <input v-model="state.styles.card.padding" type="text" class="admin-input w-full" placeholder="1rem">
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
