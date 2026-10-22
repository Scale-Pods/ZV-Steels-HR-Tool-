import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { findUserByEmail, touchActivity } from "@/lib/users"

export const dynamic = "force-dynamic"

export async function POST() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const row = await findUserByEmail(session.email)
    if (row) await touchActivity(row.id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[auth/activity] update failed:", error)
    return NextResponse.json({ error: "Activity update failed" }, { status: 500 })
  }
}
