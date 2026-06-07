<template>
  <section class="admin-section">
    <button class="admin-section-header" @click="open = !open">
      <span class="font-semibold text-fg">Global Settings</span>
      <span class="chevron" :class="{ rotated: open }" />
    </button>
    <div v-show="open" class="admin-section-body">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="admin-label">Title</label>
          <input v-model="state.title" type="text" class="admin-input w-full">
        </div>
        <div>
          <label class="admin-label">Language</label>
          <select v-model="state.lang" class="admin-input w-full">
            <option value="en">English</option>
            <option value="nl">Nederlands</option>
            <option value="de">Deutsch</option>
            <option value="fr">Français</option>
            <option value="es">Español</option>
            <option value="ru">Русский</option>
            <option value="zh">中文</option>
            <option value="hi">हिंदी</option>
            <option value="ar">العربية</option>
            <option value="pl">Polski</option>
            <option value="gr">Ελληνικά</option>
          </select>
        </div>
        <div>
          <label class="admin-label">Theme</label>
          <select v-model="state.theme" class="admin-input w-full">
            <option value="system">system</option>
            <option value="light">light</option>
            <option value="dark">dark</option>
            <option value="deep">deep</option>
            <option value="sepia">sepia</option>
            <option value="bluer">bluer</option>
          </select>
        </div>
        <div>
          <label class="admin-label">Search Provider</label>
          <select v-model="state.searchProvider" class="admin-input w-full">
            <option value="google">Google</option>
            <option value="duckduckgo">DuckDuckGo</option>
          </select>
        </div>
        <div class="sm:col-span-2">
          <label class="admin-label flex items-center gap-2 cursor-pointer">
            <input v-model="state.searchWebradio" type="checkbox" class="accent-brand-500">
            Include Webradio stations in search results
          </label>
          <p class="mt-1 text-xs text-fg-dimmed">
            Search online radio stations via Radio Browser when typing in the search bar.
          </p>
        </div>
        <div v-if="state.searchWebradio">
          <label class="admin-label">Webradio country code</label>
          <input
            v-model="state.searchWebradioCountryCode"
            type="text"
            class="admin-input w-full uppercase"
            maxlength="2"
            placeholder="NL"
          >
        </div>
        <div>
          <label class="admin-label">Logo Type</label>
          <select v-model="state.logoType" class="admin-input w-full">
            <option value="none">None</option>
            <option value="image">Image</option>
            <option value="text">Text / Letter</option>
            <option value="both">Image + Text</option>
          </select>
        </div>
        <div>
          <label class="admin-label">Background (filename in data/)</label>
          <input v-model="state.background" type="text" class="admin-input w-full" placeholder="background.jpg">
        </div>
        <div>
          <label class="admin-label">Favicon API</label>
          <input v-model="state.faviconApi" type="text" class="admin-input w-full" placeholder="https://favicon.vemetric.com/">
        </div>
        <div>
          <label class="admin-label">Link Target</label>
          <select v-model="state.target" class="admin-input w-full">
            <option value="_blank">_blank</option>
            <option value="_self">_self</option>
            <option value="_parent">_parent</option>
            <option value="_top">_top</option>
          </select>
        </div>
      </div>

      <!-- Image logo fields -->
      <div v-if="state.logoType === 'image' || state.logoType === 'both'" class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="admin-label">Logo Image (filename in data/)</label>
          <input v-model="state.logoImage" type="text" class="admin-input w-full" placeholder="logo.png">
        </div>
      </div>

      <!-- Text logo fields -->
      <div v-if="state.logoType === 'text' || state.logoType === 'both'" class="mt-4 space-y-3">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="admin-label">Logo Text</label>
            <input v-model="state.logoText" type="text" class="admin-input w-full" placeholder="M+">
          </div>
          <div>
            <label class="admin-label">Font Family</label>
            <input v-model="state.logoFontFamily" type="text" class="admin-input w-full" placeholder="Inter, sans-serif">
          </div>
          <div>
            <label class="admin-label">Font Size</label>
            <input v-model="state.logoFontSize" type="text" class="admin-input w-full" placeholder="1.5rem">
          </div>
          <div>
            <label class="admin-label">Font Weight</label>
            <select v-model="state.logoFontWeight" class="admin-input w-full">
              <option value="100">100 - Thin</option>
              <option value="200">200 - Extra Light</option>
              <option value="300">300 - Light</option>
              <option value="400">400 - Normal</option>
              <option value="500">500 - Medium</option>
              <option value="600">600 - Semi Bold</option>
              <option value="700">700 - Bold</option>
              <option value="800">800 - Extra Bold</option>
              <option value="900">900 - Black</option>
            </select>
          </div>
          <div>
            <label class="admin-label">Text Color</label>
            <div class="flex gap-2 items-center">
              <input v-model="state.logoColor" type="color" class="w-8 h-8 rounded cursor-pointer border-0">
              <input v-model="state.logoColor" type="text" class="admin-input flex-1" placeholder="#ffffff">
            </div>
          </div>
          <div>
            <label class="admin-label">Background Color</label>
            <div class="flex gap-2 items-center">
              <input v-model="state.logoBackgroundColor" type="color" class="w-8 h-8 rounded cursor-pointer border-0">
              <input v-model="state.logoBackgroundColor" type="text" class="admin-input flex-1" placeholder="transparent">
            </div>
          </div>
          <div>
            <label class="admin-label">Border Radius</label>
            <input v-model="state.logoBorderRadius" type="text" class="admin-input w-full" placeholder="0.5rem">
          </div>
          <div>
            <label class="admin-label">Padding</label>
            <input v-model="state.logoPadding" type="text" class="admin-input w-full" placeholder="0.25rem 0.5rem">
          </div>
        </div>

        <!-- Preview -->
        <div v-if="state.logoText" class="flex items-center gap-3">
          <span class="admin-label mb-0">Preview:</span>
          <span
            :style="{
              fontSize: state.logoFontSize || '1.5rem',
              fontWeight: state.logoFontWeight || 700,
              fontFamily: state.logoFontFamily || 'inherit',
              color: state.logoColor || '#ffffff',
              backgroundColor: state.logoBackgroundColor || 'transparent',
              borderRadius: state.logoBorderRadius || '0',
              padding: state.logoPadding || '0',
              lineHeight: 1,
            }"
          >{{ state.logoText }}</span>
        </div>
      </div>

      <div v-if="state.background" class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="admin-label">Overlay Color</label>
          <div class="flex gap-2 items-center">
            <input v-model="state.overlayColor" type="color" class="w-8 h-8 rounded cursor-pointer border-0">
            <input v-model="state.overlayColor" type="text" class="admin-input flex-1" placeholder="#000000">
          </div>
        </div>
        <div>
          <label class="admin-label">Overlay Opacity: {{ state.overlayOpacity }}</label>
          <input v-model.number="state.overlayOpacity" type="range" min="0" max="1" step="0.05" class="w-full accent-brand-500">
        </div>
      </div>

      <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="admin-label">Footer Text</label>
          <input v-model="state.footerText" type="text" class="admin-input w-full" placeholder="Optional footer text">
        </div>
        <div>
          <label class="admin-label">Footer HTML</label>
          <input v-model="state.footerHtml" type="text" class="admin-input w-full" placeholder="Optional footer HTML">
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { BuilderState } from '~/composables/useConfigBuilder'

defineProps<{ state: BuilderState }>()
const open = ref(true)
</script>
