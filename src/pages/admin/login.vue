<template>
  <div class="min-h-screen flex items-center justify-center bg-background p-4">
    <div class="w-full max-w-sm">
      <div class="bg-background border border-fg/10 rounded-xl shadow-lg p-8">
        <div class="text-center mb-8">
          <h1 class="text-2xl font-bold text-fg">MAFL+ Admin</h1>
          <p class="text-fg-dimmed text-sm mt-1">Log in to manage your config</p>
        </div>

        <div v-if="!configured" class="text-center text-fg-dimmed text-sm">
          <p>Admin is not configured.</p>
          <p class="mt-2">
            Set <code class="text-fg font-mono text-xs bg-fg/5 px-1 py-0.5 rounded">NUXT_ADMIN_PASSWORD_HASH</code>
            and <code class="text-fg font-mono text-xs bg-fg/5 px-1 py-0.5 rounded">NUXT_SESSION_PASSWORD</code>
            environment variables.
          </p>
        </div>

        <form v-else @submit.prevent="login">
          <div class="mb-4">
            <label class="block text-sm font-medium text-fg mb-1.5">Password</label>
            <input
              v-model="password"
              type="password"
              autocomplete="current-password"
              class="w-full px-3 py-2 rounded-lg border border-fg/10 bg-background text-fg
                     focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              placeholder="Enter admin password"
              :disabled="loading"
            >
          </div>

          <div v-if="error" class="mb-4 p-3 rounded-lg bg-red-500/10 text-red-500 text-sm">
            {{ error }}
          </div>

          <button
            type="submit"
            :disabled="loading || !password"
            class="w-full py-2.5 rounded-lg font-medium text-white bg-brand-600 hover:bg-brand-700
                   disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {{ loading ? 'Logging in...' : 'Log in' }}
          </button>
        </form>

        <div class="mt-6 text-center">
          <NuxtLink to="/" class="text-sm text-fg-dimmed hover:text-fg transition-colors">
            &larr; Back to dashboard
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const colorMode = useColorMode()
colorMode.preference = 'dark'

onMounted(() => {
  const saved = localStorage.getItem('mafl-admin-theme')
  if (saved === 'light') colorMode.preference = 'light'
})

onUnmounted(() => {
  const { $settings } = useNuxtApp()
  colorMode.preference = $settings.theme || 'system'
})

const password = ref('')
const loading = ref(false)
const error = ref('')
const configured = ref(true)

onMounted(async () => {
  try {
    const data = await $fetch('/api/admin/session')
    configured.value = data.configured
    if (data.authenticated) {
      navigateTo('/admin')
    }
  }
  catch {}
})

async function login() {
  loading.value = true
  error.value = ''

  try {
    await $fetch('/api/admin/login', {
      method: 'POST',
      body: { password: password.value },
    })
    navigateTo('/admin')
  }
  catch (e: any) {
    error.value = e.data?.message || e.statusMessage || 'Login failed'
    password.value = ''
  }
  finally {
    loading.value = false
  }
}
</script>
