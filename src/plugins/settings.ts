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

  const visibleTabs = tabs ? tabs.filter(tab => !tab.hidden) : []

  const activeServices = computed(() => {
    if (visibleTabs.length > 0) {
      return visibleTabs[activeTabIndex.value]?.services ?? []
    }
    return services
  })

  return {
    provide: {
      services,
      settings,
      tabs: visibleTabs,
      activeTabIndex,
      activeServices,
    },
  }
})
