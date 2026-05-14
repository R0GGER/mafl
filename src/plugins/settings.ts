import type { CompleteConfig } from '~/types'

/**
 * @todo create a hot reboot configuration. Receive data from websocket
 */
export default defineNuxtPlugin(async () => {
  const { on } = useWebsocket()

  on('config:update', () => {
    reloadNuxtApp({
      force: true,
    })
  })

  const asyncData = await useFetch<CompleteConfig>('/api/settings')
  const { services, tabs, ...settings } = asyncData.data.value!

  const activeTabIndex = useState('activeTabIndex', () => 0)

  const activeServices = computed(() => {
    if (tabs && tabs.length > 0) {
      return tabs[activeTabIndex.value]?.services ?? []
    }
    return services
  })

  return {
    provide: {
      services,
      settings,
      tabs: tabs ?? [],
      activeTabIndex,
      activeServices,
    },
  }
})
