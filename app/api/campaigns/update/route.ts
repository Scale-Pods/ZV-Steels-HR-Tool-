import { type NextRequest, NextResponse } from "next/server"

export async function PUT(request: NextRequest) {
  try {
    const userEmail = "guest@example.com"
    const body = await request.json()
    const { campaignName, updates } = body

    console.log("[v0] Updating campaign:", { userEmail, campaignName, updates })

    if (!campaignName || !updates) {
      return NextResponse.json({ error: "Missing required fields: campaignName or updates" }, { status: 400 })
    }

    const webhookUrl = "https://n8n.srv1010832.hstgr.cloud/webhook/HRcampaigns"

    const webhookPayload = {
      UserEmail: userEmail,
      CampaignName: campaignName,
      ...updates,
    }

    const response = await fetch(webhookUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(webhookPayload),
    })

    let data: any
    const responseText = await response.text()
    try {
      data = JSON.parse(responseText)
    } catch (e) {
      data = { message: responseText }
    }

    if (!response.ok) {
      const errorMessage = data.error || data.message || "Failed to update campaign"
      return NextResponse.json({ error: errorMessage }, { status: response.status })
    }

    return NextResponse.json({
      success: true,
      message: data.message || "Campaign updated successfully",
      data,
    })
  } catch (error: any) {
    console.error("[v0] Error updating campaign:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
