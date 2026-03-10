import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    console.log("[v0] Campaign creation API called")

    const userEmail = "guest@example.com"
    console.log("[v0] Using mock user:", userEmail)

    let body: any
    try {
      body = await request.json()
      console.log("[v0] Request body parsed:", body)
    } catch (parseError: any) {
      console.error("[v0] Failed to parse request body:", parseError)
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    const webhookPayload = {
      UserEmail: userEmail,
      CampaignName: body.campaignName || body.CampaignName,
      campaignStartDate: body.campaignStartDate,
      campaignEndDate: body.campaignEndDate,
      isActive: body.isActive,
      description: body.description || "",
      location: body.location || "",
      expectedAttendees: body.expectedAttendees || "",
    }

    console.log("[v0] Calling webhook with data:", webhookPayload)

    let response: Response
    try {
      // Updated to newest webhook endpoint
      const webhookBase = process.env.NEXT_PUBLIC_WEBHOOK_URL || "https://n8n.srv1010832.hstgr.cloud/webhook";
      const webhookPath = process.env.NEXT_PUBLIC_WEBHOOK_CAMPAIGN_CREATION || "ff7710c6-14c7-4cae-a24c-6c53e5f09497";
      response = await fetch(`${webhookBase}/${webhookPath}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(webhookPayload),
      })
      console.log("[v0] Webhook response status:", response.status)
    } catch (fetchError: any) {
      console.error("[v0] Failed to call webhook:", fetchError)
      return NextResponse.json({ error: "Failed to connect to campaign service" }, { status: 503 })
    }

    let webhookData: any
    try {
      const responseText = await response.text()
      try {
        webhookData = JSON.parse(responseText)
      } catch (e) {
        webhookData = { message: responseText }
      }
    } catch (parseError: any) {
      return NextResponse.json({ error: "Invalid response from campaign creation service" }, { status: 500 })
    }

    if (!response.ok) {
      const errorMessage = webhookData.message || webhookData.error || "Failed to create campaign"
      return NextResponse.json({ error: errorMessage }, { status: response.status })
    }

    return NextResponse.json({
      success: true,
      message: "Campaign created successfully!",
      data: webhookData,
    })
  } catch (error: any) {
    console.error("[v0] Unexpected error in campaign creation:", error)
    return NextResponse.json({ error: error.message || "An unexpected error occurred" }, { status: 500 })
  }
}
