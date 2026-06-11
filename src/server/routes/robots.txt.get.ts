const BLOCKING_ROBOTS = `User-agent: *
Disallow: /
`

const ALLOWING_ROBOTS = `User-agent: *
Allow: /
`

export default defineEventHandler(async (event) => {
  const config = await getConfig()
  const blockCrawlers = config?.robotsTxt !== false

  setResponseHeader(event, 'content-type', 'text/plain; charset=utf-8')

  return blockCrawlers ? BLOCKING_ROBOTS : ALLOWING_ROBOTS
})
