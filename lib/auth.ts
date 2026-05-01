// Web Crypto API — Edge Runtime + Node.js compatible
function getSecret(): string {
  const s = process.env.AWP_SESSION_SECRET
  if (!s) throw new Error('AWP_SESSION_SECRET not set')
  return s
}

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

async function hmac(secret: string, data: string): Promise<string> {
  const enc = new TextEncoder()
  const key = await globalThis.crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  )
  const sig = await globalThis.crypto.subtle.sign('HMAC', key, enc.encode(data))
  return toHex(sig)
}

export async function createSessionToken(): Promise<string> {
  const bytes = new Uint8Array(32)
  globalThis.crypto.getRandomValues(bytes)
  const nonce = toHex(bytes.buffer)
  const sig = await hmac(getSecret(), nonce)
  return `${nonce}.${sig}`
}

export async function verifySessionToken(token: string): Promise<boolean> {
  try {
    const dot = token.lastIndexOf('.')
    if (dot === -1) return false
    const nonce = token.slice(0, dot)
    const sig = token.slice(dot + 1)
    const expected = await hmac(getSecret(), nonce)
    // constant-time compare
    if (sig.length !== expected.length) return false
    let diff = 0
    for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i)
    return diff === 0
  } catch {
    return false
  }
}
