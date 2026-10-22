import { NextResponse } from "next/server"
import { findUserByEmail, touchActivity } from "@/lib/users"
import { createSessionToken, safeStringEqual, sessionCookieOptions, SESSION_COOKIE } from "@/lib/session"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const email = typeof body?.email === "string" ? body.email.trim() : ""
  const password = typeof body?.password === "string" ? body.password : ""
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
  }

  let row
  try {
    row = await findUserByEmail(email)
  } catch (error) {
    console.error("[auth/login] lookup failed:", error)
    return NextResponse.json({ error: "Authentication service unavailable" }, { status: 503 })
  }

  if (!row || !row.Password || !safeStringEqual(row.Password, password)) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
  }

  const user = {
    email: row.Email || email,
    name: row.Name || email,
    accessType: (row.Access_Type || "interviewer").toLowerCase(),
  }

  const token = await createSessionToken(user)

  try {
    await touchActivity(row.id)
  } catch (error) {
    console.error("[auth/login] activity update failed:", error)
  }

  const res = NextResponse.json({ user })
  const requestUrl = new URL(req.url)
  res.cookies.set(SESSION_COOKIE, token, {
    ...sessionCookieOptions,
    secure: requestUrl.protocol === "https:",
  })
  return res
}
