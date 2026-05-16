<template>
  <footer v-if="hasContent" class="mt-auto py-6 text-center text-sm text-white/50">
    <p v-if="$settings.footer?.text">{{ $settings.footer.text }}</p>
    <div v-if="$settings.footer?.html" v-html="$settings.footer.html" />
  </footer>
</template>

<script setup lang="ts">
const { $settings } = useNuxtApp()

const hasContent = computed(() =>
  $settings.footer?.text || $settings.footer?.html,
)
</script>
