import { getFaviconVersion } from '~/server/utils/favicons'

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-cache, must-revalidate')

  return {
    version: await getFaviconVersion(),
  }
})
