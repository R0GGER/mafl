<template>
  <component
    :is="inline ? 'div' : 'section'"
    :class="inline ? '' : 'admin-section'"
  >
    <button
      v-if="!inline"
      class="admin-section-header"
      @click="open = !open"
    >
      <span class="font-semibold text-fg">App Favicon</span>
      <span class="chevron" :class="{ rotated: open }" />
    </button>
    <div
      v-show="inline || open"
      :class="inline ? 'space-y-4' : 'admin-section-body space-y-4'"
    >
      <p class="text-xs text-fg-dimmed">
        Upload a square PNG or SVG. The image is automatically converted to <code class="text-[11px]">favicon.ico</code>
        (16/32/48), apple-touch-icon (180x180), PWA icons (192x192 + 512x512) and Android icons.
        For the best result, use an SVG or a PNG that is at least 512&times;512.
      </p>
      <p class="text-xs text-fg-dimmed">
        Need a favicon? Generate one at
        <a
          href="https://favicon.maflplus.eu"
          target="_blank"
          rel="noopener noreferrer"
          class="text-brand-300 hover:text-brand-200 underline underline-offset-2"
        >favicon.maflplus.eu</a>.
      </p>

      <!-- Status -->
      <div class="border border-fg/10 rounded-md p-3 flex items-center justify-between gap-3 bg-background">
        <div class="text-sm">
          <div v-if="status?.custom" class="flex items-center gap-2">
            <span class="inline-block w-2 h-2 rounded-full bg-green-500" />
            <span class="text-fg">Custom favicon active</span>
          </div>
          <div v-else class="flex items-center gap-2">
            <span class="inline-block w-2 h-2 rounded-full bg-fg/30" />
            <span class="text-fg-dimmed">Using bundled / default favicons</span>
          </div>
          <div v-if="status?.source" class="text-xs text-fg-dimmed mt-1">
            Source: <span class="text-fg">{{ status.source.name }}</span>
            <span class="ml-2">({{ formatBytes(status.source.size) }}, {{ status.source.mime }})</span>
          </div>
          <div v-if="status?.generatedAt" class="text-xs text-fg-dimmed">
            Generated: {{ new Date(status.generatedAt).toLocaleString() }}
          </div>
          <div v-if="status?.usedAsLogo" class="text-xs text-green-400 mt-1 flex items-center gap-1">
            <Icon name="ph:check-circle-bold" class="w-3.5 h-3.5" />
            Also used as site logo
          </div>
        </div>
        <div v-if="status?.custom" class="flex flex-col gap-2 items-end">
          <button
            type="button"
            class="text-xs px-3 py-1.5 rounded border transition-colors disabled:opacity-50 whitespace-nowrap"
            :class="status?.usedAsLogo
              ? 'border-fg/10 text-fg-dimmed hover:bg-fg/5'
              : 'border-brand-500/40 text-brand-300 hover:bg-brand-500/10'"
            :disabled="busy || applyingAsLogo"
            :title="status?.usedAsLogo ? 'Re-apply (e.g. after a new upload)' : 'Use this favicon as the site logo'"
            @click="useAsLogo"
          >
            {{ applyingAsLogo ? 'Applying...' : (status?.usedAsLogo ? 'Re-apply as logo' : 'Use as site logo') }}
          </button>
          <button
            type="button"
            class="text-xs px-3 py-1.5 rounded border border-red-400/30 text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-50 whitespace-nowrap"
            :disabled="busy"
            @click="resetFavicon"
          >
            Reset to default
          </button>
        </div>
        <div v-else-if="status" class="flex flex-col gap-2 items-end">
          <button
            type="button"
            class="text-xs px-3 py-1.5 rounded border border-fg/15 text-fg hover:bg-fg/5 transition-colors disabled:opacity-50 whitespace-nowrap"
            :disabled="busy || regenerating"
            title="Rebuild every bundled default variant (favicon.ico, 16x16, 32x32, android-chrome, ...) from the largest master image on disk."
            @click="regenerateDefaults"
          >
            {{ regenerating ? 'Regenerating...' : 'Regenerate defaults' }}
          </button>
        </div>
      </div>

      <!-- Drop / pick zone -->
      <div
        class="border-2 border-dashed rounded-md p-4 transition-colors text-center cursor-pointer"
        :class="dragOver
          ? 'border-brand-500 bg-brand-500/5'
          : 'border-fg/15 hover:border-fg/30 bg-background'"
        @click="triggerPick"
        @dragover.prevent="dragOver = true"
        @dragleave.prevent="dragOver = false"
        @drop.prevent="handleDrop"
      >
        <input
          ref="fileInput"
          type="file"
          accept="image/png,image/svg+xml"
          class="hidden"
          @change="handlePick"
        >
        <div v-if="!selectedFile" class="text-sm text-fg-dimmed">
          <div class="font-medium text-fg">Click to choose</div>
          <div>or drag &amp; drop a PNG / SVG here</div>
        </div>
        <div v-else class="flex items-center justify-center gap-3">
          <img
            v-if="selectedPreviewUrl"
            :src="selectedPreviewUrl"
            alt="Preview"
            class="w-12 h-12 object-contain border border-fg/10 rounded bg-background"
          >
          <div class="text-left">
            <div class="text-sm font-medium text-fg">{{ selectedFile.name }}</div>
            <div class="text-xs text-fg-dimmed">{{ formatBytes(selectedFile.size) }} &middot; {{ selectedFile.type || 'unknown' }}</div>
          </div>
        </div>
      </div>

      <div v-if="uploadError" class="border border-red-400/30 rounded-md p-2 text-xs text-red-300 bg-red-400/5 whitespace-pre-wrap">
        {{ uploadError }}
      </div>

      <div v-if="uploadWarnings.length" class="border border-amber-400/30 rounded-md p-2 text-xs text-amber-300 bg-amber-400/5">
        <div class="font-semibold mb-1">Warnings</div>
        <ul class="list-disc list-inside space-y-0.5">
          <li v-for="(w, i) in uploadWarnings" :key="i">{{ w }}</li>
        </ul>
      </div>

      <div class="flex items-center gap-2">
        <button
          type="button"
          class="text-sm px-3 py-1.5 rounded bg-brand-600 hover:bg-brand-700 text-white transition-colors disabled:opacity-50"
          :disabled="!selectedFile || busy"
          @click="uploadFavicon"
        >
          {{ busy ? 'Generating...' : 'Upload & Generate' }}
        </button>
        <button
          v-if="selectedFile"
          type="button"
          class="text-sm px-3 py-1.5 rounded border border-fg/10 text-fg hover:bg-fg/5 transition-colors"
          :disabled="busy"
          @click="clearSelection"
        >
          Clear
        </button>
      </div>

      <!-- Live preview grid -->
      <div v-if="status" class="pt-3 border-t border-fg/10">
        <div class="text-xs text-fg-dimmed mb-2">Current variants</div>
        <div class="flex flex-wrap gap-3">
          <div
            v-for="variant in previewVariants"
            :key="variant.name"
            class="flex flex-col items-center gap-1 p-2 border border-fg/10 rounded bg-background"
          >
            <img
              :src="variantUrl(variant.name)"
              :alt="variant.name"
              :style="{
                width: variant.preview + 'px',
                height: variant.preview + 'px',
                opacity: missingVariants.has(variant.name) ? 0.15 : 1,
              }"
              class="object-contain transition-opacity"
              @load="onPreviewLoad(variant.name)"
              @error="onPreviewError(variant.name)"
            >
            <div class="text-[10px] text-fg-dimmed">{{ variant.label }}</div>
          </div>
        </div>
      </div>
    </div>
  </component>
</template>

<script setup lang="ts">
interface FaviconStatus {
  custom: boolean
  bundled: boolean
  version: number
  source: { name: string; mime: string; size: number } | null
  generatedAt: string | null
  variants: string[]
  sourceAsset: string | null
  usedAsLogo: boolean
}

// `inline` renders the section without its own accordion wrapper so the parent
// (e.g. the Logo accordion in GlobalSettings) can embed it inside an existing
// expandable group.
withDefaults(defineProps<{ inline?: boolean }>(), { inline: false })

const open = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const selectedPreviewUrl = ref<string | null>(null)
const dragOver = ref(false)
const busy = ref(false)
const applyingAsLogo = ref(false)
const regenerating = ref(false)
const uploadError = ref('')
const uploadWarnings = ref<string[]>([])
const status = ref<FaviconStatus | null>(null)
const previewBust = ref(Date.now())
const missingVariants = ref<Set<string>>(new Set())

const previewVariants = [
  { name: 'favicon.ico', label: 'favicon.ico (32px preview)', preview: 32 },
  { name: 'favicon-16x16.png', label: '16x16', preview: 16 },
  { name: 'favicon-32x32.png', label: '32x32', preview: 32 },
  { name: 'apple-touch-icon.png', label: 'apple 180', preview: 48 },
  { name: 'pwa-192x192.png', label: 'pwa 192', preview: 48 },
  { name: 'pwa-512x512.png', label: 'pwa 512', preview: 64 },
  { name: 'android-chrome-192x192.png', label: 'android 192', preview: 48 },
  { name: 'android-chrome-512x512.png', label: 'android 512', preview: 64 },
]

function variantUrl(name: string) {
  return `/favicons/${name}?t=${previewBust.value}`
}

function onPreviewError(name: string) {
  const next = new Set(missingVariants.value)
  next.add(name)
  missingVariants.value = next
}

function onPreviewLoad(name: string) {
  if (!missingVariants.value.has(name)) return
  const next = new Set(missingVariants.value)
  next.delete(name)
  missingVariants.value = next
}

function refreshPreview(version: number) {
  previewBust.value = version || Date.now()
  missingVariants.value = new Set()
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

async function loadStatus() {
  try {
    status.value = await $fetch<FaviconStatus>('/api/admin/favicon')
  }
  catch (e: any) {
    if (e.statusCode !== 401) {
      uploadError.value = e?.statusMessage || 'Failed to load favicon status'
    }
  }
}

function triggerPick() {
  if (busy.value) return
  fileInput.value?.click()
}

function setSelected(file: File | null) {
  if (selectedPreviewUrl.value) {
    URL.revokeObjectURL(selectedPreviewUrl.value)
    selectedPreviewUrl.value = null
  }
  selectedFile.value = file
  uploadError.value = ''
  uploadWarnings.value = []
  if (file) {
    selectedPreviewUrl.value = URL.createObjectURL(file)
  }
}

function validatePicked(file: File): string | null {
  const mime = (file.type || '').toLowerCase()
  if (mime !== 'image/png' && mime !== 'image/svg+xml') {
    return 'Only PNG or SVG files are accepted.'
  }
  if (file.size === 0) return 'File is empty.'
  if (file.size > 5 * 1024 * 1024) return 'File is larger than 5 MB.'
  return null
}

function handlePick(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0] || null
  if (!file) {
    setSelected(null)
    return
  }
  const err = validatePicked(file)
  if (err) {
    uploadError.value = err
    input.value = ''
    return
  }
  setSelected(file)
  input.value = ''
}

function handleDrop(e: DragEvent) {
  dragOver.value = false
  const file = e.dataTransfer?.files?.[0] || null
  if (!file) return
  const err = validatePicked(file)
  if (err) {
    uploadError.value = err
    return
  }
  setSelected(file)
}

function clearSelection() {
  setSelected(null)
}

async function uploadFavicon() {
  if (!selectedFile.value) return
  busy.value = true
  uploadError.value = ''
  uploadWarnings.value = []
  try {
    const fd = new FormData()
    fd.append('file', selectedFile.value, selectedFile.value.name)
    const res = await $fetch<{ ok: true; version: number; warnings: string[] }>('/api/admin/favicon', {
      method: 'POST',
      body: fd,
    })
    uploadWarnings.value = res.warnings || []
    refreshPreview(res.version)
    setSelected(null)
    await loadStatus()
    emit('toast', { message: 'Favicon generated and applied', type: 'success' })
  }
  catch (e: any) {
    const msg = e.data?.data?.error || e.data?.statusMessage || e.statusMessage || 'Upload failed'
    uploadError.value = msg
    emit('toast', { message: 'Favicon upload failed', type: 'error' })
  }
  finally {
    busy.value = false
  }
}

async function resetFavicon() {
  if (busy.value) return
  if (!window.confirm('Remove the custom favicon and revert to the bundled defaults?')) return
  busy.value = true
  uploadError.value = ''
  uploadWarnings.value = []
  try {
    await $fetch('/api/admin/favicon', { method: 'DELETE' })
    refreshPreview(Date.now())
    await loadStatus()
    emit('toast', { message: 'Custom favicon removed', type: 'success' })
  }
  catch (e: any) {
    uploadError.value = e?.statusMessage || 'Reset failed'
    emit('toast', { message: 'Reset failed', type: 'error' })
  }
  finally {
    busy.value = false
  }
}

async function regenerateDefaults() {
  if (busy.value || regenerating.value) return
  if (!window.confirm('Regenerate the bundled default favicon set on disk? Existing default files will be overwritten from the largest master image.')) return
  regenerating.value = true
  uploadError.value = ''
  uploadWarnings.value = []
  try {
    const res = await $fetch<{
      ok: true
      version: number
      generated: string[]
      failed: string[]
      master: string
    }>('/api/admin/favicon-defaults-regenerate', { method: 'POST' })

    refreshPreview(res.version)

    if (res.failed.length > 0) {
      uploadWarnings.value = res.failed.map(name => `Could not regenerate ${name}`)
    }

    await loadStatus()

    const count = res.generated.length
    emit('toast', {
      message: count > 0
        ? `Regenerated ${count} default favicon${count === 1 ? '' : 's'} from ${res.master}`
        : `No default favicons needed regenerating (master: ${res.master})`,
      type: 'success',
    })
  }
  catch (e: any) {
    const msg = e.data?.data?.error || e.data?.statusMessage || e.statusMessage || 'Regenerate failed'
    uploadError.value = msg
    emit('toast', { message: 'Regenerate defaults failed', type: 'error' })
  }
  finally {
    regenerating.value = false
  }
}

interface AppliedLogo {
  type: 'image' | 'both'
  image: string
  text?: string
  fontSize?: string
  fontWeight?: string | number
  fontFamily?: string
  color?: string
  backgroundColor?: string
  borderRadius?: string
  padding?: string
}

async function useAsLogo() {
  if (busy.value || applyingAsLogo.value) return
  applyingAsLogo.value = true
  uploadError.value = ''
  try {
    const res = await $fetch<{ ok: true; image: string; logo: AppliedLogo }>('/api/admin/favicon-use-as-logo', { method: 'POST' })
    await loadStatus()
    // Let the parent sync the in-memory builder state so the Logo Image input
    // (and the YAML preview) immediately reflect the new favicon-backed logo.
    emit('logo-applied', res.logo)
    emit('toast', {
      message: `Site logo set to ${res.image}.`,
      type: 'success',
    })
  }
  catch (e: any) {
    const msg = e.data?.data?.error || e.data?.statusMessage || e.statusMessage || 'Failed to apply favicon as logo'
    uploadError.value = msg
    emit('toast', { message: 'Apply as logo failed', type: 'error' })
  }
  finally {
    applyingAsLogo.value = false
  }
}

const emit = defineEmits<{
  (e: 'toast', payload: { message: string; type: 'success' | 'error' }): void
  (e: 'logo-applied', logo: AppliedLogo): void
}>()

onMounted(() => {
  loadStatus()
})

onBeforeUnmount(() => {
  if (selectedPreviewUrl.value) URL.revokeObjectURL(selectedPreviewUrl.value)
})
</script>
