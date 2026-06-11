<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
const { $settings } = useNuxtApp()
const colorMode = useColorMode()
const { locale } = useI18n()

locale.value = $settings.lang

const i18nHead = useLocaleHead({
  addDirAttribute: true,
  identifierAttribute: 'id',
})

const route = useRoute()
onMounted(() => {
  if (!route.path.startsWith('/admin')) {
    colorMode.preference = $settings.theme || 'system'
  }
})

const headMeta = computed(() => buildHeadMeta($settings.meta, $settings.title))

useHead({
  title: $settings.title,
  meta: headMeta,
  htmlAttrs: {
    lang: i18nHead.value.htmlAttrs?.lang,
    dir: i18nHead.value.htmlAttrs?.dir,
  },
  bodyAttrs: {
    class: 'relative',
  },
})
</script>
