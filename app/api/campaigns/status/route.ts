import { NextResponse } from "next/server"
import { updateCampaignStatus } from "@/lib/hr-data"

export const dynamic = "force-dynamic"

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const campaignName = body.campaignName || body.CampaignName
    const status = body.status || body.Status

    if (!campaignName) {
      return NextResponse.json({ error: "Missing required field: campaignName" }, { status: 400 })
    }

    if (status !== "open" && status !== "close") {
      return NextResponse.json({ error: "status must be 'open' or 'close'" }, { status: 400 })
    }

    const rows = await updateCampaignStatus(String(campaignName), status)
    return NextResponse.json({ success: true, campaign: rows?.[0] ?? null })
  } catch (error: any) {
    console.error("[campaigns/status] Error:", error)
    return NextResponse.json({ error: error.message || "Failed to update campaign status" }, { status: 500 })
  }
}