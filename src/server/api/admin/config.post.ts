import yaml from 'yaml'
import { ZodError } from 'zod'
import { configSchema } from '~/server/validations'
import { configFileName } from '~/server/utils/config'

export default defineEventHandler(async (event) => {
  await requireAdminSession(event)

  const body = await readBody<{ yaml?: string }>(event)
  if (!body?.yaml || typeof body.yaml !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'YAML content required' })
  }

  let parsed: unknown
  try {
    parsed = yaml.parse(body.yaml)
  }
  catch (e: any) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Invalid YAML syntax',
      data: { error: e.message },
    })
  }

  if (!parsed || typeof parsed !== 'object') {
    throw createError({
      statusCode: 422,
      statusMessage: 'YAML must be an object',
    })
  }

  try {
    configSchema.parse(parsed)
  }
  catch (e) {
    if (e instanceof ZodError) {
      const formatted = e.format()
      throw createError({
        statusCode: 422,
        statusMessage: 'Config validation failed',
        data: {
          error: JSON.stringify(
            formatted,
            (key, val) => (key === '_errors' && !val.length) ? undefined : val,
            2,
          ),
        },
      })
    }
    throw e
  }

  const storage = useStorage('data')
  await storage.setItem(configFileName, body.yaml)

  return { ok: true }
})
