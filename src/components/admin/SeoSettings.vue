<template>
  <section class="admin-section">
    <button class="admin-section-header" @click="open = !open">
      <span class="font-semibold text-fg">SEO &amp; Meta</span>
      <span class="chevron" :class="{ rotated: open }" />
    </button>
    <div v-show="open" class="admin-section-body space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div class="sm:col-span-2">
          <label class="admin-label">Description</label>
          <textarea
            v-model="state.metaDescription"
            rows="2"
            class="admin-input w-full resize-y"
            placeholder="Page description for search engines and social previews"
          />
        </div>
        <div>
          <label class="admin-label">Keywords</label>
          <input v-model="state.metaKeywords" type="text" class="admin-input w-full" placeholder="homelab, dashboard">
        </div>
        <div>
          <label class="admin-label">Author</label>
          <input v-model="state.metaAuthor" type="text" class="admin-input w-full" placeholder="Optional author name">
        </div>
        <div>
          <label class="admin-label">Meta robots</label>
          <input v-model="state.metaRobots" type="text" class="admin-input w-full" placeholder="noindex, nofollow">
        </div>
      </div>

      <div>
        <p class="text-sm font-medium text-fg mb-2">Open Graph</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="admin-label">OG Title</label>
            <input v-model="state.metaOgTitle" type="text" class="admin-input w-full" placeholder="Defaults to page title">
          </div>
          <div>
            <label class="admin-label">OG Type</label>
            <input v-model="state.metaOgType" type="text" class="admin-input w-full" placeholder="website">
          </div>
          <div class="sm:col-span-2">
            <label class="admin-label">OG Description</label>
            <input v-model="state.metaOgDescription" type="text" class="admin-input w-full" placeholder="Defaults to description">
          </div>
          <div class="sm:col-span-2">
            <label class="admin-label">OG Image URL</label>
            <input v-model="state.metaOgImage" type="text" class="admin-input w-full" placeholder="https://example.com/og.png">
          </div>
        </div>
      </div>

      <div>
        <label class="admin-label flex items-center gap-2 cursor-pointer">
          <input v-model="state.robotsTxt" type="checkbox" class="accent-brand-500">
          Block search engine crawlers (robots.txt)
        </label>
        <p class="mt-1 text-xs text-fg-dimmed">
          When enabled, serves <code class="text-xs">Disallow: /</code> to all crawlers. Disable to allow indexing.
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { BuilderState } from '~/composables/useConfigBuilder'

defineProps<{ state: BuilderState }>()
const open = ref(false)
</script>
