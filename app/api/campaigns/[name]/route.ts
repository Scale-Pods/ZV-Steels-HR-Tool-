import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { name: string } }) {
  try {
    const userEmail = "guest@example.com"
    const campaignName = decodeURIComponent(params.name)

    console.log("[v0] Fetching campaign:", campaignName, "for user:", userEmail)

    // Fetch specific campaign from webhook
    const webhookUrl = `https://n8n.srv1010832.hstgr.cloud/webhook/HRcampaigns?UserEmail=${encodeURIComponent(userEmail)}&CampaignName=${encodeURIComponent(campaignName)}`

    const response = await fetch(webhookUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      console.error("[v0] Webhook error:", response.status, response.statusText)
      return NextResponse.json({ error: "Failed to fetch campaign from webhook" }, { status: response.status })
    }

    const webhookData = await response.json()
    console.log("[v0] Webhook response:", JSON.stringify(webhookData).substring(0, 200))

    if (!webhookData.success || !webhookData.data || webhookData.data.length === 0) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    // Extract campaign data from nested structure
    const campaign = webhookData.data[0].json

    console.log("[v0] Found campaign:", campaign.CampaignName)

    return NextResponse.json({ campaign })
  } catch (error: any) {
    console.error("[v0] Error fetching campaign:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
