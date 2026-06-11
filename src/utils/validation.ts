export function isUrl(ur: string) {
  if (!ur) {
    return false
  }

  try {
    new URL(ur)
    return true
  }
  catch {
    return false
  }
}
