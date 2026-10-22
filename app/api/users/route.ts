import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { createUser, findUserByEmail, listUsers } from "@/lib/users"

export const dynamic = "force-dynamic"

async function requireAdmin() {
  const session = await getSession()
  if (!session) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  if (session.accessType !== "admin") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) }
  }
  return { session }
}

export async function GET() {
  const admin = await requireAdmin()
  if ("error" in admin) return admin.error
  try {
    return NextResponse.json({ users: await listUsers() })
  } catch (error) {
    console.error("[api/users] list failed:", error)
    return NextResponse.json({ error: "Failed to load users" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const admin = await requireAdmin()
  if ("error" in admin) return admin.error

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const name = typeof body?.name === "string" ? body.name.trim() : ""
  const email = typeof body?.email === "string" ? body.email.trim() : ""
  const accessType = typeof body?.accessType === "string" ? body.accessType.trim().toLowerCase() : ""
  const password = typeof body?.password === "string" ? body.password : ""

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Name, email and password are required" }, { status: 400 })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 })
  }
  if (password.length < 4) {
    return NextResponse.json({ error: "Password must be at least 4 characters" }, { status: 400 })
  }
  if (accessType !== "admin" && accessType !== "interviewer") {
    return NextResponse.json({ error: "Access type must be admin or interviewer" }, { status: 400 })
  }

  try {
    const existing = await findUserByEmail(email)
    if (existing) {
      return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 })
    }
    const user = await createUser({ name, email, accessType, password })
    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    console.error("[api/users] create failed:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}
