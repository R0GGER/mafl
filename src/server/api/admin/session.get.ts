export default defineEventHandler(async (event) => {
  if (!isAdminConfigured()) {
    return { authenticated: false, configured: false }
  }

  const session = await getAdminSession(event)
  return {
    authenticated: !!session.data?.authenticated,
    configured: true,
  }
})
