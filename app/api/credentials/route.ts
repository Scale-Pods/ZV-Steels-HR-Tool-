import { NextResponse } from "next/server"
import { encryptJSON } from "@/lib/crypto"

export async function GET() {
  try {
    // Standard mock user for now as Clerk is removed
    return NextResponse.json({ services: {} })
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Unknown error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { service: string; credentials: Record<string, string> }

    // Encrypt before storing
    const encrypted = await encryptJSON(body.credentials)

    // TODO: Implement alternative database storage
    console.log("[v0] Mock: Storing encrypted credentials for", body.service)

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Unknown error" }, { status: 500 })
  }
}
