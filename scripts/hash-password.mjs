#!/usr/bin/env node
import crypto from 'node:crypto'

const password = process.argv[2]

if (!password) {
  console.error('Usage: node scripts/hash-password.mjs <password>')
  console.error('Output the scrypt hash to set as NUXT_ADMIN_PASSWORD_HASH')
  process.exit(1)
}

const KEYLEN = 64
const salt = crypto.randomBytes(16)

crypto.scrypt(password, salt, KEYLEN, (err, derivedKey) => {
  if (err) {
    console.error('Error:', err.message)
    process.exit(1)
  }
  const hash = `${salt.toString('hex')}:${derivedKey.toString('hex')}`
  console.log(hash)
})
