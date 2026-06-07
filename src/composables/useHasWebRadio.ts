import type { Service, ServicesGroup } from '~/types'

function collectItems(groups: ServicesGroup[]): Service[] {
  const items: Service[] = []
  for (const group of groups) {
    for (const item of group.items) {
      if (item.stack?.length) {
        items.push(...item.stack)
      }
      else {
        items.push(item)
      }
    }
  }
  return items
}

export function useHasWebRadio() {
  const { $activeServices } = useNuxtApp()

  return computed(() => {
    const groups = unref($activeServices as Ref<ServicesGroup[] | undefined>) ?? []
    const items = collectItems(groups)
    const webRadioItems = items.filter(item => item.type === 'web-radio')

    return {
      enabled: webRadioItems.length > 0,
      countryCode: webRadioItems[0]?.options?.countryCode || 'NL',
    }
  })
}
