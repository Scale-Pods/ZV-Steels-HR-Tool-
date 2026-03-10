const subtle = globalThis.crypto?.subtle

function strToUint8(str: string) {
  return new TextEncoder().encode(str)
}
function uint8ToB64(buf: ArrayBuffer) {
  return Buffer.from(new Uint8Array(buf)).toString("base64")
}
function b64ToUint8(b64: string) {
  return Uint8Array.from(Buffer.from(b64, "base64"))
}

async function getKey() {
  const secret = process.env.CREDENTIALS_ENCRYPTION_KEY
  if (!secret || secret.length < 32) {
    throw new Error("Server misconfiguration: CREDENTIALS_ENCRYPTION_KEY must be set (>=32 chars).")
  }
  // Derive a fixed-length key from the secret
  const baseKey = await subtle!.importKey("raw", strToUint8(secret.slice(0, 32)), "AES-GCM", false, [
    "encrypt",
    "decrypt",
  ])
  return baseKey
}

export async function encryptJSON(obj: unknown) {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await getKey()
  const plaintext = strToUint8(JSON.stringify(obj))
  const ciphertext = await subtle!.encrypt({ name: "AES-GCM", iv }, key, plaintext)
  return {
    __enc: true,
    iv: uint8ToB64(iv.buffer),
    data: uint8ToB64(ciphertext),
  }
}
