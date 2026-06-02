import crypto from 'node:crypto'
import type { H3Event } from 'h3'

const logger = useLogger('auth')

const SCRYPT_KEYLEN = 64

/**
 * Verify a plaintext password against a stored scrypt hash (format: hex-salt:hex-hash).
 * Uses constant-time comparison to prevent timing attacks.
 */
export async function verifyPassword(plain: string, storedHash: string): Promise<boolean> {
  const parts = storedHash.split(':')
  if (parts.length !== 2) return false

  const [saltHex, hashHex] = parts
  const salt = Buffer.from(saltHex, 'hex')
  const expectedHash = Buffer.from(hashHex, 'hex')

  const derived = await new Promise<Buffer>((resolve, reject) => {
    crypto.scrypt(plain, salt, SCRYPT_KEYLEN, (err, key) => {
      if (err) reject(err)
      else resolve(key)
    })
  })

  if (derived.length !== expectedHash.length) return false
  return crypto.timingSafeEqual(derived, expectedHash)
}

/**
 * Hash a plaintext password with a random salt using scrypt.
 * Returns "hex-salt:hex-hash".
 */
export async function hashPassword(plain: string): Promise<string> {
  const salt = crypto.randomBytes(16)
  const hash = await new Promise<Buffer>((resolve, reject) => {
    crypto.scrypt(plain, salt, SCRYPT_KEYLEN, (err, key) => {
      if (err) reject(err)
      else resolve(key)
    })
  })
  return `${salt.toString('hex')}:${hash.toString('hex')}`
}

// --- Session helpers ---

const SESSION_MAX_AGE = 60 * 60 * 24 // 24 hours

function getSessionConfig() {
  const config = useRuntimeConfig()
  return {
    password: config.sessionPassword,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
    },
    maxAge: SESSION_MAX_AGE,
    name: 'mafl-admin',
  }
}

interface AdminSessionData {
  authenticated?: boolean
}

export async function getAdminSession(event: H3Event) {
  return useSession<AdminSessionData>(event, getSessionConfig())
}

export async function requireAdminSession(event: H3Event) {
  const session = await getAdminSession(event)
  if (!session.data?.authenticated) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  return session
}

// --- Rate limiter ---

interface RateLimitEntry {
  attempts: number
  firstAttempt: number
}

const rateLimitMap = new Map<string, RateLimitEntry>()
const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000 // 15 minutes
const FAIL_DELAY_MS = 1000

export function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now - entry.firstAttempt > RATE_LIMIT_WINDOW_MS) {
    return true
  }

  return entry.attempts < RATE_LIMIT_MAX
}

export function recordFailedAttempt(ip: string) {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now - entry.firstAttempt > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { attempts: 1, firstAttempt: now })
  }
  else {
    entry.attempts++
  }

  logger.warn(`Failed login attempt from ${ip}`)
}

export function clearRateLimit(ip: string) {
  rateLimitMap.delete(ip)
}

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export { FAIL_DELAY_MS }

export function getClientIp(event: H3Event): string {
  const forwarded = getHeader(event, 'x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return getHeader(event, 'x-real-ip') || '127.0.0.1'
}

export function isAdminConfigured(): boolean {
  const config = useRuntimeConfig()
  return !!config.adminPasswordHash && !!config.sessionPassword
}
