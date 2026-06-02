<template>
  <ServiceBase v-bind="props">
    <template #icon="{ service }">
      <ServiceBaseIcon
        v-if="service?.data?.country"
        :name="`flag:${service.data.country}-1x1`"
        v-bind="iconProps"
      />
      <ServiceBaseIcon v-else name="mdi:clock-outline" v-bind="iconProps" />
    </template>
    <template #title>
      {{ currentTime }}
    </template>
    <template #description>
      {{ currentDate }}
    </template>
  </ServiceBase>
</template>

<script setup lang="ts">
import type { TimeService, ServiceClient } from '~/types'

const props = defineProps<ServiceClient<TimeService>>()

const { $settings } = useNuxtApp()
const lang = computed(() => $settings.lang || 'en')
const hour12 = computed(() => props.options?.timeFormat === '12h')
const dateFormat = computed(() => props.options?.dateFormat)
const timezone = computed(() => props.options?.timezone)

const { formatDate } = useDateFormat(dateFormat, lang, timezone)

const iconProps = computed(() => {
  if (!props.icon) {
    return {}
  }
  const { name: _, ...p } = props.icon
  return p
})

const now = ref(new Date())
let timer: ReturnType<typeof setInterval> | undefined

const timeFormatter = computed(() =>
  new Intl.DateTimeFormat(lang.value, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: hour12.value,
    timeZone: props.options?.timezone,
  }),
)

const currentTime = computed(() => timeFormatter.value.format(now.value))
const currentDate = computed(() => formatDate(now.value))

onMounted(() => {
  timer = setInterval(() => {
    now.value = new Date()
  }, 1000)
})

onBeforeUnmount(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>
