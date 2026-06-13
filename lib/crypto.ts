// lib/crypto.ts
// ============================================================
// Encrypts sensitive data (email app passwords) before storing
// in Supabase, and decrypts when needed to send email.
//
// Generate your key once with:
//   openssl rand -hex 32
// Then add to .env.local:
//   ENCRYPTION_KEY=<64 hex characters>
// ============================================================

import crypto from 'crypto'

const ALGORITHM = 'aes-256-cbc'

function getKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY
  if (!key || key.length !== 64) {
    throw new Error(
      'ENCRYPTION_KEY missing or invalid. Generate one with: openssl rand -hex 32'
    )
  }
  return Buffer.from(key, 'hex')
}

// ── Encrypt a string (e.g. app password) before saving ────────

export function encrypt(text: string): string {
  const key = getKey()
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()])
  return iv.toString('hex') + ':' + encrypted.toString('hex')
}

// ── Decrypt a string before using it ───────────────────────────

export function decrypt(data: string): string {
  const key = getKey()
  const [ivHex, encHex] = data.split(':')
  if (!ivHex || !encHex) throw new Error('Invalid encrypted data format')
  const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(ivHex, 'hex'))
  const decrypted = Buffer.concat([decipher.update(Buffer.from(encHex, 'hex')), decipher.final()])
  return decrypted.toString('utf8')
}
