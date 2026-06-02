export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path === '/admin/login') return

  try {
    const data = await $fetch('/api/admin/session')
    if (!data.authenticated) {
      return navigateTo('/admin/login')
    }
  }
  catch {
    return navigateTo('/admin/login')
  }
})
