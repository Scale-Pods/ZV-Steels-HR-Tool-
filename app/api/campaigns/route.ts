import { NextResponse } from "next/server"
import { getCampaigns, getRows } from "@/lib/hr-data"

const WEBHOOK_BASE = process.env.NEXT_PUBLIC_WEBHOOK_URL || "https://n8n.srv1010832.hstgr.cloud/webhook";
const WEBHOOK_CREATION = `${WEBHOOK_BASE}/${process.env.NEXT_PUBLIC_WEBHOOK_CAMPAIGN_CREATION || "ff7710c6-14c7-4cae-a24c-6c53e5f09497"}`;
const WEBHOOK_HR_CAMPAIGNS = `${WEBHOOK_BASE}/${process.env.NEXT_PUBLIC_WEBHOOK_HR_CAMPAIGNS || "HRcampaigns"}`;

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const campaignName = searchParams.get("campaignName")

    if (campaignName) {
      const rows = await getRows({ campaign: campaignName })
      return NextResponse.json(rows)
    }

    const campaigns = await getCampaigns()
    return NextResponse.json({ campaigns })
  } catch (e: any) {
    console.error("[campaigns] Error:", e)
    return NextResponse.json({ campaigns: [], error: e.message ?? "Unknown error" }, { status: 500 })
  }
}


export async function POST(request: Request) {
  try {
    const userEmail = "guest@example.com"
    const body = await request.json()

    const webhookPayload = {
      UserEmail: userEmail,
      CampaignName: body.campaignName || body.CampaignName,
      ...body,
    }

    const response = await fetch(WEBHOOK_CREATION, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(webhookPayload),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json({ error: errorData.message || "Failed to create campaign" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Unknown error" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const userEmail = "guest@example.com"
    const body = await request.json()

    const webhookPayload = {
      UserEmail: userEmail,
      CampaignName: body.campaignName || body.CampaignName,
      ...body,
    }

    const response = await fetch(WEBHOOK_HR_CAMPAIGNS, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(webhookPayload),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json({ error: errorData.message || "Failed to update campaign" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Unknown error" }, { status: 500 })
  }
}
