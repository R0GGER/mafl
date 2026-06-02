export default defineEventHandler(async (event) => {
  if (!isAdminConfigured()) {
    throw createError({ statusCode: 503, statusMessage: 'Admin not configured' })
  }

  const ip = getClientIp(event)

  if (!checkRateLimit(ip)) {
    await delay(FAIL_DELAY_MS)
    throw createError({ statusCode: 429, statusMessage: 'Too many attempts. Try again later.' })
  }

  const body = await readBody<{ password?: string }>(event)
  if (!body?.password) {
    throw createError({ statusCode: 400, statusMessage: 'Password required' })
  }

  const config = useRuntimeConfig()
  const valid = await verifyPassword(body.password, config.adminPasswordHash)

  if (!valid) {
    recordFailedAttempt(ip)
    await delay(FAIL_DELAY_MS)
    throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' })
  }

  clearRateLimit(ip)
  const session = await getAdminSession(event)
  await session.update({ authenticated: true })

  return { ok: true }
})
