<template>
  <div class="min-h-screen bg-background">
    <!-- Header -->
    <header class="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-fg/10">
      <div class="max-w-screen-2xl mx-auto px-4 py-3 flex items-center justify-between">
        <h1 class="text-xl font-bold text-fg">MAFL+ Config Builder</h1>
        <div class="flex gap-2 items-center">
          <button
            class="text-sm px-3 py-1.5 rounded border border-fg/10 hover:bg-fg/5 transition-colors text-fg"
            @click="loadCurrentConfig"
          >
            {{ configLoading ? 'Loading...' : 'Load Current Config' }}
          </button>
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
      <div class="space-y-4">
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
        />
      </div>

      <!-- Right: YAML Preview -->
      <div class="lg:sticky lg:top-16 lg:self-start">
        <div class="border border-fg/10 rounded-lg bg-fg/[0.02]">
          <div class="flex items-center justify-between p-4 border-b border-fg/10">
            <span class="font-semibold text-fg">YAML Output</span>
            <button
              class="text-sm px-3 py-1.5 rounded bg-brand-600 hover:bg-brand-700 text-white transition-colors"
              @click="copyYaml"
            >
              Copy to Clipboard
            </button>
          </div>
          <div class="p-4 max-h-[80vh] overflow-auto">
            <pre class="text-xs text-fg font-mono leading-relaxed whitespace-pre">{{ yamlOutput }}</pre>
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
definePageMeta({
  layout: false,
  middleware: 'admin',
})

const {
  state,
  yamlOutput,
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
} = useConfigBuilder()

const saving = ref(false)
const configLoading = ref(false)
const validationError = ref('')
const toast = ref<{ message: string; type: 'success' | 'error' } | null>(null)

let toastTimeout: ReturnType<typeof setTimeout> | null = null

function showToast(message: string, type: 'success' | 'error' = 'success') {
  if (toastTimeout) clearTimeout(toastTimeout)
  toast.value = { message, type }
  toastTimeout = setTimeout(() => { toast.value = null }, 3000)
}

async function loadCurrentConfig() {
  configLoading.value = true
  validationError.value = ''
  try {
    const data = await $fetch('/api/admin/config')
    if (data.yaml) {
      loadFromYaml(data.yaml)
      showToast('Config loaded successfully')
    }
    else {
      showToast('No config.yml found', 'error')
    }
  }
  catch (e: any) {
    if (e.statusCode === 401) {
      navigateTo('/admin/login')
      return
    }
    showToast('Failed to load config', 'error')
  }
  finally {
    configLoading.value = false
  }
}

async function saveConfig() {
  saving.value = true
  validationError.value = ''
  try {
    await $fetch('/api/admin/config', {
      method: 'POST',
      body: { yaml: yamlOutput.value },
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
  navigator.clipboard.writeText(yamlOutput.value).then(() => {
    showToast('Copied to clipboard')
  })
}

onMounted(() => {
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
