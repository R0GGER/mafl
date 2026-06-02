<template>
  <section class="admin-section">
    <button class="admin-section-header" @click="open = !open">
      <span class="font-semibold text-fg">Tags</span>
      <span class="chevron" :class="{ rotated: open }" />
    </button>
    <div v-show="open" class="admin-section-body">
      <div class="space-y-2">
        <div v-for="(tag, i) in state.tags" :key="i" class="flex items-center gap-2">
          <input v-model="tag.name" type="text" class="admin-input flex-1" placeholder="Tag name">
          <select v-model="tag.color" class="admin-input">
            <option v-for="c in TAG_COLORS" :key="c" :value="c">{{ c }}</option>
          </select>
          <button class="text-red-400 hover:text-red-300 text-lg px-1" @click="removeTag(i)">&times;</button>
        </div>
      </div>
      <button
        class="mt-3 text-sm bg-brand-600 hover:bg-brand-700 text-white px-3 py-1.5 rounded transition-colors"
        @click="addTag()"
      >
        + Add Tag
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { BuilderState } from '~/composables/useConfigBuilder'
import { TAG_COLORS } from '~/composables/useConfigBuilder'

defineProps<{
  state: BuilderState
  addTag: (name?: string, color?: string) => void
  removeTag: (index: number) => void
}>()

const open = ref(false)
</script>
