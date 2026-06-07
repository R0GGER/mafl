<template>
  <div class="min-h-screen bg-background">
    <!-- Header -->
    <header class="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-fg/10">
      <div class="max-w-screen-2xl mx-auto px-4 py-3 flex items-center justify-between">
        <h1 class="text-xl font-bold text-fg">MAFL+ Config Builder</h1>
        <div class="flex items-center flex-wrap gap-y-2">
          <button
            class="p-1.5 rounded border border-fg/10 hover:bg-fg/5 transition-colors text-fg"
            title="Toggle light/dark"
            @click="toggleAdminTheme"
          >
            <svg v-if="adminDark" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
            <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
          </button>

          <span class="w-px h-6 bg-fg/15 mx-2" />

          <div class="flex gap-2">
            <button
              class="text-sm px-3 py-1.5 rounded border border-fg/10 hover:bg-fg/5 transition-colors text-fg"
              title="Import config.yml"
              @click="triggerImport"
            >
              <span class="flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-8-8l-4 4m0 0l4 4m-4-4h12"/></svg>
                Import
              </span>
            </button>
            <input
              ref="fileInput"
              type="file"
              accept=".yml,.yaml"
              class="hidden"
              @change="handleImport"
            >
            <button
              class="text-sm px-3 py-1.5 rounded border border-fg/10 hover:bg-fg/5 transition-colors text-fg"
              title="Export / backup config.yml"
              @click="exportConfig"
            >
              <span class="flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                Export
              </span>
            </button>
          </div>

          <span class="w-px h-6 bg-fg/15 mx-2" />

          <div class="flex gap-2">
            <button
              class="text-sm px-3 py-1.5 rounded bg-brand-600 hover:bg-brand-700 text-white transition-colors disabled:opacity-50"
              :disabled="saving"
              @click="saveConfig"
            >
              {{ saving ? 'Saving...' : 'Save & Apply' }}
            </button>
            <button
              class="relative text-sm px-3 py-1.5 rounded border overflow-hidden transition-colors"
              :class="resetConfirming
                ? 'border-red-400/50 text-red-400 hover:bg-red-400/10'
                : 'border-fg/10 text-fg hover:bg-fg/5'"
              @click="resetAll"
            >
              <span class="relative z-10">{{ resetConfirming ? 'Click again to reset' : 'Reset' }}</span>
              <span
                v-if="resetConfirming"
                class="absolute inset-y-0 left-0 bg-red-400/20 reset-timer-bar"
              />
            </button>
          </div>

          <span class="w-px h-6 bg-fg/15 mx-2" />

          <div class="flex gap-2">
            <NuxtLink to="/" class="text-sm px-3 py-1.5 rounded border border-fg/10 hover:bg-fg/5 transition-colors text-fg">
              Dashboard
            </NuxtLink>
            <button
              class="text-sm px-3 py-1.5 rounded border border-red-400/30 text-red-400 hover:bg-red-400/10 transition-colors"
              @click="logout"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Toast -->
    <Transition name="toast">
      <div v-if="toast" class="fixed bottom-4 right-4 z-50">
        <div
          class="px-4 py-2 rounded-lg shadow-lg text-white text-sm"
          :class="toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'"
        >
          {{ toast.message }}
        </div>
      </div>
    </Transition>

    <!-- Main -->
    <main class="max-w-screen-2xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Left: Form -->
      <div class="space-y-4" @input.capture="schedulePreview" @change.capture="schedulePreview" @click.capture="schedulePreviewAfterClick">
        <AdminGlobalSettings :state="state" />
        <AdminLayoutSettings :state="state" />
        <AdminStylesSettings :state="state" />
        <AdminTagsEditor :state="state" :add-tag="addTag" :remove-tag="removeTag" />
        <AdminTabsEditor
          :state="state"
          :add-tab="addTab"
          :remove-tab="removeTab"
          :toggle-tab-lock="toggleTabLock"
          :toggle-tab-hidden="toggleTabHidden"
          :add-group="addGroup"
          :remove-group="removeGroup"
          :add-item="addItem"
          :remove-item="removeItem"
          :move-item="moveItem"
          :move-group="moveGroup"
          :add-stack="addStack"
          :add-stack-child="addStackChild"
          :remove-stack-child="removeStackChild"
          :move-stack-child="moveStackChild"
        />
      </div>

      <!-- Right: YAML Preview -->
      <div class="lg:sticky lg:top-16 lg:self-start">
        <div class="border border-fg/10 rounded-lg bg-fg/[0.02]">
          <div class="flex items-center justify-between p-4 border-b border-fg/10">
            <div class="flex items-center gap-2">
              <span class="font-semibold text-fg">YAML Output</span>
              <button
                class="p-1 rounded border transition-colors"
                :class="syntaxHighlight
                  ? 'border-brand-500/40 text-brand-500 bg-brand-500/10'
                  : 'border-fg/10 text-fg-dimmed hover:bg-fg/5'"
                title="Syntax highlighting (may cause slight input delay on large configs)"
                @click="toggleHighlight"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
              </button>
              <span v-if="syntaxHighlight" class="text-[10px] text-fg-dimmed italic">may slow input</span>
            </div>
            <button
              class="text-sm px-3 py-1.5 rounded bg-brand-600 hover:bg-brand-700 text-white transition-colors"
              @click="copyYaml"
            >
              Copy to Clipboard
            </button>
          </div>
          <div class="p-4 max-h-[80vh] overflow-auto">
            <pre v-if="syntaxHighlight" class="yaml-hl text-xs font-mono leading-relaxed whitespace-pre" v-html="highlightedYaml" />
            <pre v-else class="text-xs font-mono leading-relaxed whitespace-pre text-fg">{{ plainYaml }}</pre>
          </div>
        </div>

        <!-- Validation errors -->
        <div v-if="validationError" class="mt-4 border border-red-400/30 rounded-lg p-4 bg-red-400/5">
          <h3 class="text-sm font-semibold text-red-400 mb-2">Validation Error</h3>
          <pre class="text-xs text-red-300 whitespace-pre-wrap font-mono">{{ validationError }}</pre>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { highlightYaml } from '~/utils/yamlHighlight'
import { stateToYaml } from '~/composables/useConfigBuilder'

definePageMeta({
  layout: false,
  middleware: 'admin',
  colorMode: 'dark',
})

const colorMode = useColorMode()
const allThemeClasses = ['light', 'dark', 'deep', 'sepia', 'bluer']
const adminDark = ref(true)

useHead({
  htmlAttrs: { class: 'dark' },
})

function forceColorMode(mode: string) {
  colorMode.preference = mode
  if (import.meta.client) {
    allThemeClasses.forEach(c => document.documentElement.classList.remove(c))
    document.documentElement.classList.add(mode)
  }
}

forceColorMode('dark')

function applyAdminTheme(dark: boolean) {
  forceColorMode(dark ? 'dark' : 'light')
}

function toggleAdminTheme() {
  adminDark.value = !adminDark.value
  applyAdminTheme(adminDark.value)
  localStorage.setItem('mafl-admin-theme', adminDark.value ? 'dark' : 'light')
}

onUnmounted(() => {
  const { $settings } = useNuxtApp()
  colorMode.preference = $settings.theme || 'system'
})

const {
  state,
  resetState,
  loadFromYaml,
  addTag,
  removeTag,
  addTab,
  removeTab,
  toggleTabLock,
  toggleTabHidden,
  addGroup,
  removeGroup,
  addItem,
  removeItem,
  moveItem,
  moveGroup,
  addStack,
  addStackChild,
  removeStackChild,
  moveStackChild,
} = useConfigBuilder()

function freshYaml() { return stateToYaml(state) }

const syntaxHighlight = ref(false)
const highlightedYaml = ref('')
const plainYaml = ref('')
let _previewTimer: ReturnType<typeof setTimeout> | null = null

function updatePreview() {
  if (_previewTimer) clearTimeout(_previewTimer)
  _previewTimer = null
  const yml = freshYaml()
  plainYaml.value = yml
  if (syntaxHighlight.value) {
    highlightedYaml.value = highlightYaml(yml)
  }
}

function toggleHighlight() {
  syntaxHighlight.value = !syntaxHighlight.value
  localStorage.setItem('mafl-admin-highlight', String(syntaxHighlight.value))
  if (syntaxHighlight.value) {
    highlightedYaml.value = highlightYaml(plainYaml.value)
  }
}

function schedulePreview() {
  if (_previewTimer) clearTimeout(_previewTimer)
  _previewTimer = setTimeout(updatePreview, 400)
}

function schedulePreviewAfterClick() {
  setTimeout(schedulePreview, 20)
}

const saving = ref(false)
const validationError = ref('')
const toast = ref<{ message: string; type: 'success' | 'error' } | null>(null)

let toastTimeout: ReturnType<typeof setTimeout> | null = null

function showToast(message: string, type: 'success' | 'error' = 'success') {
  if (toastTimeout) clearTimeout(toastTimeout)
  toast.value = { message, type }
  toastTimeout = setTimeout(() => { toast.value = null }, 3000)
}

async function loadCurrentConfig() {
  validationError.value = ''
  try {
    const data = await $fetch('/api/admin/config')
    if (data.yaml) {
      loadFromYaml(data.yaml)
      updatePreview()
    }
  }
  catch (e: any) {
    if (e.statusCode === 401) {
      navigateTo('/admin/login')
    }
  }
}

async function saveConfig() {
  saving.value = true
  validationError.value = ''
  try {
    await $fetch('/api/admin/config', {
      method: 'POST',
      body: { yaml: freshYaml() },
    })
    showToast('Config saved & applied!')
  }
  catch (e: any) {
    if (e.statusCode === 401) {
      navigateTo('/admin/login')
      return
    }
    const errorData = e.data?.data?.error || e.data?.message || e.statusMessage || 'Save failed'
    validationError.value = typeof errorData === 'string' ? errorData : JSON.stringify(errorData, null, 2)
    showToast('Validation failed - see errors below', 'error')
  }
  finally {
    saving.value = false
  }
}

const resetConfirming = ref(false)
let resetTimer: ReturnType<typeof setTimeout> | null = null
const RESET_TIMEOUT_MS = 5000
const resetTimeoutCss = `${RESET_TIMEOUT_MS}ms`

function cancelResetConfirm() {
  resetConfirming.value = false
  if (resetTimer) { clearTimeout(resetTimer); resetTimer = null }
}

function resetAll() {
  if (!resetConfirming.value) {
    resetConfirming.value = true
    resetTimer = setTimeout(cancelResetConfirm, RESET_TIMEOUT_MS)
    return
  }
  cancelResetConfirm()
  resetState()
  validationError.value = ''
  updatePreview()
  showToast('Reset to defaults')
}

async function logout() {
  try {
    await $fetch('/api/admin/logout', { method: 'POST' })
  }
  catch {}
  window.location.href = '/admin/login'
}

function copyYaml() {
  navigator.clipboard.writeText(freshYaml()).then(() => {
    showToast('Copied to clipboard')
  })
}

const fileInput = ref<HTMLInputElement | null>(null)

function triggerImport() {
  fileInput.value?.click()
}

function handleImport(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    const content = e.target?.result as string
    if (!content) {
      showToast('File is empty', 'error')
      return
    }
    try {
      loadFromYaml(content)
      updatePreview()
      showToast(`Imported "${file.name}" successfully`)
    }
    catch {
      showToast('Failed to parse YAML file', 'error')
    }
  }
  reader.onerror = () => {
    showToast('Failed to read file', 'error')
  }
  reader.readAsText(file)

  input.value = ''
}

function exportConfig() {
  const content = freshYaml()
  if (!content) {
    showToast('Nothing to export', 'error')
    return
  }

  const blob = new Blob([content], { type: 'application/x-yaml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  a.download = `config-backup-${timestamp}.yml`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  showToast('Config exported')
}

onMounted(() => {
  const saved = localStorage.getItem('mafl-admin-theme')
  adminDark.value = saved !== 'light'
  applyAdminTheme(adminDark.value)
  syntaxHighlight.value = localStorage.getItem('mafl-admin-highlight') === 'true'
  loadCurrentConfig()
})
</script>

<style scoped>
.toast-enter-active { animation: slideIn 0.3s ease; }
.toast-leave-active { animation: fadeOut 0.3s ease forwards; }
@keyframes slideIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
@keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }

.reset-timer-bar {
  animation: shrink-bar v-bind(resetTimeoutCss) linear forwards;
}
@keyframes shrink-bar {
  from { width: 100%; }
  to { width: 0%; }
}
</style>
