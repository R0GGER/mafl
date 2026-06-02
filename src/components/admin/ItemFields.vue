<template>
  <div class="space-y-2 text-xs">
    <!-- Bookmark fields -->
    <template v-if="item.serviceType === 'bookmark'">
      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="admin-label">Title</label>
          <input v-model="item.title" type="text" class="admin-input w-full">
        </div>
        <div>
          <label class="admin-label">Link</label>
          <input v-model="item.link" type="text" class="admin-input w-full" placeholder="https://...">
        </div>
      </div>
      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="admin-label">Description</label>
          <input v-model="item.description" type="text" class="admin-input w-full">
        </div>
        <div>
          <label class="admin-label">Target (override)</label>
          <select v-model="item.target" class="admin-input w-full">
            <option value="">-- (use global)</option>
            <option value="_blank">_blank</option>
            <option value="_self">_self</option>
            <option value="_parent">_parent</option>
            <option value="_top">_top</option>
          </select>
        </div>
      </div>
    </template>

    <!-- OpenWeatherMap -->
    <template v-if="item.serviceType === 'openweathermap'">
      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="admin-label">Latitude</label>
          <input v-model="item.owmLat" type="text" class="admin-input w-full" placeholder="51.5085">
        </div>
        <div>
          <label class="admin-label">Longitude</label>
          <input v-model="item.owmLon" type="text" class="admin-input w-full" placeholder="-0.1257">
        </div>
      </div>
      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="admin-label">Units</label>
          <select v-model="item.owmUnits" class="admin-input w-full">
            <option value="metric">metric</option>
            <option value="imperial">imperial</option>
            <option value="standard">standard</option>
          </select>
        </div>
        <div>
          <label class="admin-label">API Key</label>
          <input v-model="item.owmApiKey" type="text" class="admin-input w-full" placeholder="your-api-key">
        </div>
      </div>
    </template>

    <!-- IP-API -->
    <template v-if="item.serviceType === 'ip-api'">
      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="admin-label">Location Name</label>
          <input v-model="item.ipapiLocationName" type="text" class="admin-input w-full" placeholder="(auto-detect from IP)">
        </div>
        <div>
          <label class="admin-label">Flag Icon</label>
          <select v-model="item.ipapiFlagIcon" class="admin-input w-full">
            <option value="true">true</option>
            <option value="false">false</option>
          </select>
        </div>
      </div>
    </template>

    <!-- Time -->
    <template v-if="item.serviceType === 'time'">
      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="admin-label">Timezone</label>
          <input v-model="item.tzTimezone" type="text" class="admin-input w-full" placeholder="Europe/Amsterdam">
        </div>
        <div>
          <label class="admin-label">Location Name</label>
          <input v-model="item.tzLocationName" type="text" class="admin-input w-full" placeholder="Amsterdam">
        </div>
      </div>
      <div class="grid grid-cols-3 gap-2">
        <div>
          <label class="admin-label">Country Code</label>
          <input v-model="item.tzCountry" type="text" class="admin-input w-full" placeholder="nl" maxlength="2">
        </div>
        <div>
          <label class="admin-label">Time Format</label>
          <select v-model="item.tzTimeFormat" class="admin-input w-full">
            <option value="24h">24h</option>
            <option value="12h">12h</option>
          </select>
        </div>
        <div>
          <label class="admin-label">Date Format</label>
          <select v-model="item.tzDateFormat" class="admin-input w-full">
            <option v-for="f in dateFormats" :key="f" :value="f">{{ f }}</option>
          </select>
        </div>
      </div>
    </template>

    <!-- DateTime Weather -->
    <template v-if="item.serviceType === 'datetime-weather'">
      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="admin-label">Latitude</label>
          <input v-model="item.dtwLat" type="text" class="admin-input w-full" placeholder="52.370216">
        </div>
        <div>
          <label class="admin-label">Longitude</label>
          <input v-model="item.dtwLon" type="text" class="admin-input w-full" placeholder="4.895168">
        </div>
      </div>
      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="admin-label">Timezone</label>
          <input v-model="item.dtwTimezone" type="text" class="admin-input w-full" placeholder="Europe/Amsterdam">
        </div>
        <div>
          <label class="admin-label">API Key</label>
          <input v-model="item.dtwApiKey" type="text" class="admin-input w-full" placeholder="your-api-key">
        </div>
      </div>
      <div class="grid grid-cols-3 gap-2">
        <div>
          <label class="admin-label">Units</label>
          <select v-model="item.dtwUnits" class="admin-input w-full">
            <option value="metric">metric</option>
            <option value="imperial">imperial</option>
            <option value="standard">standard</option>
          </select>
        </div>
        <div>
          <label class="admin-label">Time Format</label>
          <select v-model="item.dtwTimeFormat" class="admin-input w-full">
            <option value="24h">24h</option>
            <option value="12h">12h</option>
          </select>
        </div>
        <div>
          <label class="admin-label">Date Format</label>
          <select v-model="item.dtwDateFormat" class="admin-input w-full">
            <option v-for="f in dateFormats" :key="f" :value="f">{{ f }}</option>
          </select>
        </div>
      </div>
    </template>

    <!-- Greeting -->
    <template v-if="item.serviceType === 'greeting'">
      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="admin-label">Text</label>
          <input v-model="item.greetText" type="text" class="admin-input w-full" placeholder="Hello!">
        </div>
        <div>
          <label class="admin-label">Subtitle</label>
          <input v-model="item.greetSubtitle" type="text" class="admin-input w-full" placeholder="Welcome to your dashboard">
        </div>
      </div>
    </template>

    <!-- Custom HTML -->
    <template v-if="item.serviceType === 'custom-html'">
      <div>
        <label class="admin-label">HTML Content</label>
        <input v-model="item.customHtml" type="text" class="admin-input w-full" placeholder="<p>Custom HTML</p>">
      </div>
      <div>
        <label class="inline-flex items-center gap-1 text-fg-dimmed">
          <input v-model="item.customHidden" type="checkbox"> Hidden
        </label>
      </div>
    </template>

    <!-- Span (all types) -->
    <div class="grid grid-cols-2 gap-2">
      <div>
        <label class="admin-label">Span (columns)</label>
        <input v-model="item.span" type="number" min="1" max="12" class="admin-input w-full" placeholder="1">
      </div>
    </div>

    <!-- Icon (not for time module) -->
    <div v-if="item.serviceType !== 'time'" class="border-t border-fg/10 pt-2">
      <label class="admin-label block mb-1">Icon Type</label>
      <div class="flex gap-3 mb-2">
        <label class="inline-flex items-center gap-1 text-fg-dimmed">
          <input v-model="item.iconType" type="radio" value="favicon"> favicon
        </label>
        <label class="inline-flex items-center gap-1 text-fg-dimmed">
          <input v-model="item.iconType" type="radio" value="url"> url
        </label>
        <label class="inline-flex items-center gap-1 text-fg-dimmed">
          <input v-model="item.iconType" type="radio" value="name"> name
        </label>
      </div>

      <div v-if="item.iconType === 'favicon'" class="flex gap-2 items-end">
        <div class="flex-1">
          <label class="admin-label">Domain</label>
          <input v-model="item.iconFavicon" type="text" class="admin-input w-full" placeholder="example.com">
        </div>
        <div>
          <label class="admin-label">Color</label>
          <input v-model="item.iconColor" type="text" class="admin-input w-20" placeholder="#hex">
        </div>
        <div>
          <label class="admin-label">&nbsp;</label>
          <label class="inline-flex items-center gap-1 text-fg-dimmed admin-input cursor-pointer">
            <input v-model="item.iconWrap" type="checkbox" style="accent-color: #69a870"> wrap
          </label>
        </div>
      </div>
      <div v-else-if="item.iconType === 'url'">
        <div class="flex gap-2 items-end">
          <div class="flex-1">
            <label class="admin-label">URL</label>
            <input v-model="item.iconUrl" type="text" class="admin-input w-full" placeholder="https://...">
          </div>
          <div>
            <label class="admin-label">&nbsp;</label>
            <label class="inline-flex items-center gap-1 text-fg-dimmed admin-input cursor-pointer">
              <input v-model="item.iconWrap" type="checkbox" style="accent-color: #69a870"> wrap
            </label>
          </div>
        </div>
        <div class="mt-1 text-[10px] text-fg-dimmed">
          Browse icons:
          <a href="https://selfh.st/icons/" target="_blank" class="hover:underline" style="color: rgb(124 180 132)">selfh.st/icons</a>
          ·
          <a href="https://dashboardicons.com/icons" target="_blank" class="hover:underline" style="color: rgb(124 180 132)">dashboardicons.com</a>
        </div>
      </div>
      <div v-else class="flex gap-2 items-end">
        <div class="flex-1">
          <label class="admin-label">Name</label>
          <input v-model="item.iconName" type="text" class="admin-input w-full" placeholder="mdi:home">
        </div>
        <div>
          <label class="admin-label">Color</label>
          <input v-model="item.iconColor" type="text" class="admin-input w-20" placeholder="#hex">
        </div>
        <div>
          <label class="admin-label">&nbsp;</label>
          <label class="inline-flex items-center gap-1 text-fg-dimmed admin-input cursor-pointer">
            <input v-model="item.iconWrap" type="checkbox" style="accent-color: #69a870"> wrap
          </label>
        </div>
      </div>
    </div>

    <!-- Status & Tags (bookmark only) -->
    <div v-if="item.serviceType === 'bookmark'" class="border-t border-fg/10 pt-2 space-y-2">
      <label class="inline-flex items-center gap-1 text-fg-dimmed cursor-pointer">
        Uptime monitoring
        <label class="inline-flex items-center gap-1 text-fg-dimmed admin-input cursor-pointer">
          <input v-model="item.statusEnabled" type="checkbox" style="accent-color: #69a870">
        </label>
      </label>
      <div>
        <label class="admin-label">Tags (comma separated)</label>
        <input
          :value="item.tags.join(', ')"
          type="text"
          class="admin-input w-full"
          placeholder="tag1, tag2"
          @input="item.tags = ($event.target as HTMLInputElement).value.split(',').map(s => s.trim()).filter(Boolean)"
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BuilderItem } from '~/composables/useConfigBuilder'

defineProps<{
  item: BuilderItem
  tabIndex: number
  groupIndex: number
  itemIndex: number
}>()

const dateFormats = ['short', 'medium', 'long', 'eu', 'compact', 'short-eu', 'iso']
</script>
