import { configFileName } from '~/server/utils/config'

export default defineEventHandler(async (event) => {
  await requireAdminSession(event)

  const storage = useStorage('data')

  if (!await storage.hasItem(configFileName)) {
    return { yaml: '' }
  }

  const raw = await storage.getItem<string>(configFileName)
  return { yaml: raw || '' }
})
