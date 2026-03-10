import { NextResponse } from "next/server"
import { encryptJSON } from "@/lib/crypto"

export async function GET() {
  try {
    // Note: Previously fetched from Supabase database
    return NextResponse.json({ data: [] })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    const { nodeKey, label, credentials } = body || {}

    if (!nodeKey || typeof nodeKey !== "string") {
      return NextResponse.json({ error: "nodeKey (string) is required" }, { status: 400 })
    }
    if (!credentials || typeof credentials !== "object") {
      return NextResponse.json({ error: "credentials (object) is required" }, { status: 400 })
    }

    // Encrypt credentials JSON using app's crypto helper
    const encrypted = encryptJSON(credentials)

    // Note: Previously stored in Supabase database
    return NextResponse.json({
      data: {
        id: Date.now().toString(),
        node_key: nodeKey,
        label: label ?? null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      stored: true,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 })
  }
}
