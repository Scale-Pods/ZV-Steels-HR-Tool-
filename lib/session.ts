import { cookies } from "next/headers"

export const SESSION_COOKIE = "hr_session"
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60

export interface SessionUser {
  email: string
  name: string
  accessType: string
}

function getSecret(): string {
  const secret = process.env.AUTH_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!secret) throw new Error("Missing AUTH_SECRET or SUPABASE_SERVICE_ROLE_KEY environment variable")
  return secret
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = ""
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

function fromBase64Url(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((value.length + 3) % 4)
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

async function hmac(data: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  )
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data))
  return new Uint8Array(signature)
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i]
  return diff === 0
}

export function safeStringEqual(a: string, b: string): boolean {
  const ab = new TextEncoder().encode(a)
  const bb = new TextEncoder().encode(b)
  if (ab.length !== bb.length) return false
  let diff = 0
  for (let i = 0; i < ab.length; i++) diff |= ab[i] ^ bb[i]
  return diff === 0
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  const payload = toBase64Url(
    new TextEncoder().encode(
      JSON.stringify({ ...user, exp: Date.now() + SESSION_TTL_SECONDS * 1000 }),
    ),
  )
  const signature = toBase64Url(await hmac(payload))
  return `${payload}.${signature}`
}

export async function verifySessionToken(token: string | undefined | null): Promise<SessionUser | null> {
  if (!token) return null
  const [payloadPart, signaturePart] = token.split(".")
  if (!payloadPart || !signaturePart) return null
  try {
    const expected = await hmac(payloadPart)
    const actual = fromBase64Url(signaturePart)
    if (!timingSafeEqual(expected, actual)) return null
    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(payloadPart)))
    if (typeof payload.exp !== "number" || payload.exp < Date.now()) return null
    if (typeof payload.email !== "string" || typeof payload.name !== "string" || typeof payload.accessType !== "string") {
      return null
    }
    return { email: payload.email, name: payload.name, accessType: payload.accessType }
  } catch {
    return null
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const token = cookies().get(SESSION_COOKIE)?.value
  return verifySessionToken(token)
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_TTL_SECONDS,
}
