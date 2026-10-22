import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { deleteUser, findUserByEmail, getUserById, updateUser } from "@/lib/users"

export const dynamic = "force-dynamic"

async function requireAdmin() {
  const session = await getSession()
  if (!session) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  if (session.accessType !== "admin") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) }
  }
  return { session }
}

function parseId(raw: string): number | null {
  const id = Number(raw)
  return Number.isInteger(id) && id > 0 ? id : null
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin()
  if ("error" in admin) return admin.error

  const id = parseId(params.id)
  if (!id) return NextResponse.json({ error: "Invalid user id" }, { status: 400 })

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const patch: { name?: string; email?: string; accessType?: string; password?: string } = {}
  if (body?.name !== undefined) {
    if (typeof body.name !== "string" || !body.name.trim()) {
      return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 })
    }
    patch.name = body.name.trim()
  }
  if (body?.email !== undefined) {
    if (typeof body.email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 })
    }
    patch.email = body.email.trim()
  }
  if (body?.accessType !== undefined) {
    const accessType = String(body.accessType).trim().toLowerCase()
    if (accessType !== "admin" && accessType !== "interviewer") {
      return NextResponse.json({ error: "Access type must be admin or interviewer" }, { status: 400 })
    }
    patch.accessType = accessType
  }
  if (body?.password !== undefined && body.password !== "") {
    if (typeof body.password !== "string" || body.password.length < 4) {
      return NextResponse.json({ error: "Password must be at least 4 characters" }, { status: 400 })
    }
    patch.password = body.password
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 })
  }

  try {
    const current = await getUserById(id)
    if (!current) return NextResponse.json({ error: "User not found" }, { status: 404 })
    if (patch.email && patch.email.toLowerCase() !== (current.Email || "").toLowerCase()) {
      const existing = await findUserByEmail(patch.email)
      if (existing && existing.id !== id) {
        return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 })
      }
    }
    if (
      current.Access_Type?.toLowerCase() === "admin" &&
      patch.accessType &&
      patch.accessType !== "admin" &&
      (current.Email || "").toLowerCase() === admin.session.email.toLowerCase()
    ) {
      return NextResponse.json({ error: "You cannot demote your own account" }, { status: 400 })
    }
    const user = await updateUser(id, patch)
    return NextResponse.json({ user })
  } catch (error) {
    console.error("[api/users] update failed:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin()
  if ("error" in admin) return admin.error

  const id = parseId(params.id)
  if (!id) return NextResponse.json({ error: "Invalid user id" }, { status: 400 })

  try {
    const current = await getUserById(id)
    if (!current) return NextResponse.json({ error: "User not found" }, { status: 404 })
    if ((current.Email || "").toLowerCase() === admin.session.email.toLowerCase()) {
      return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 })
    }
    await deleteUser(id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[api/users] delete failed:", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}
