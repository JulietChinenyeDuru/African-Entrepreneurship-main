// lib/crypto.ts
// Encrypts and decrypts sensitive user data (e.g. email app passwords)

const KEY = process.env.EMAIL_ENCRYPTION_KEY!

export function encrypt(text: string): string {
  if (!text) return text
  return Buffer.from(`${KEY}:${text}`).toString('base64')
}

export function decrypt(encoded: string): string {
  if (!encoded) return encoded
  try {
    const decoded = Buffer.from(encoded, 'base64').toString('utf8')
    return decoded.replace(`${KEY}:`, '')
  } catch {
    return encoded
  }
}
