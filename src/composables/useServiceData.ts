import type { BaseService } from '~/types'

export interface ServiceDataOptions {
  immediate?: boolean
  updateInterval?: number
}

const typeAliases: Record<string, string> = {
  time: 'timezone',
}

export function useServiceData<T extends BaseService>(service: T, options?: ServiceDataOptions): any {
  const immediate = options?.immediate || false
  const updateInterval = (options?.updateInterval || 60) * 1000
  const type = service.type || 'base'
  const apiType = typeAliases[type] || type

  const { data, pending, status, refresh, execute } = useFetch(`/api/services/${apiType}`, {
    immediate,
    query: { id: service.id },
    timeout: 15000,
  })

  const { pause, resume } = useIntervalFn(refresh, updateInterval, { immediate })

  return {
    data,
    pending,
    status,
    execute,
    pauseUpdate: pause,
    resumeUpdate: resume,
  }
}
