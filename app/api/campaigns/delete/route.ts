import { type NextRequest, NextResponse } from "next/server"

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { userEmail, campaignName } = body

    console.log("[v0] Soft deleting campaign:", { userEmail, campaignName })

    if (!userEmail || !campaignName) {
      return NextResponse.json({ error: "Missing required fields: userEmail or campaignName" }, { status: 400 })
    }

    const webhookBase = process.env.NEXT_PUBLIC_WEBHOOK_URL || "https://n8n.srv1010832.hstgr.cloud/webhook";
    const webhookPath = process.env.NEXT_PUBLIC_WEBHOOK_HR_CAMPAIGNS || "HRcampaigns";
    const webhookUrl = `${webhookBase}/${webhookPath}`;

    const response = await fetch(webhookUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userEmail,
        campaignName,
        updates: {
          IsDeleted: true,
        },
      }),
    })

    console.log("[v0] Webhook response status:", response.status)

    let data: any
    try {
      data = await response.json()
      console.log("[v0] Webhook response data:", data)
    } catch (parseError) {
      console.error("[v0] Failed to parse webhook response as JSON")
      return NextResponse.json({ error: "Invalid response from webhook" }, { status: 500 })
    }

    if (!response.ok) {
      const errorMessage = data.error || data.message || "Failed to delete campaign"
      return NextResponse.json({ error: errorMessage }, { status: response.status })
    }

    return NextResponse.json({
      success: true,
      message: "Campaign hidden successfully",
      data,
    })
  } catch (error: any) {
    console.error("[v0] Error deleting campaign:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
