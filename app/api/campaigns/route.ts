import { NextResponse } from "next/server"

const WEBHOOK_BASE = process.env.NEXT_PUBLIC_WEBHOOK_URL || "https://n8n.srv1010832.hstgr.cloud/webhook";
const WEBHOOK_URL = `${WEBHOOK_BASE}/${process.env.NEXT_PUBLIC_WEBHOOK_CAMPAIGNS || "ab8d28de-afb7-416f-aaf1-454949b27c18"}`;
const WEBHOOK_CREATION = `${WEBHOOK_BASE}/${process.env.NEXT_PUBLIC_WEBHOOK_CAMPAIGN_CREATION || "ff7710c6-14c7-4cae-a24c-6c53e5f09497"}`;
const WEBHOOK_HR_CAMPAIGNS = `${WEBHOOK_BASE}/${process.env.NEXT_PUBLIC_WEBHOOK_HR_CAMPAIGNS || "HRcampaigns"}`;

export async function GET(request: Request) {
  try {
    const userEmail = "guest@example.com"
    const { searchParams } = new URL(request.url)
    const campaignName = searchParams.get("campaignName")
    const action = campaignName ? "Certain Campaign" : "Campaigns"

    console.log(`[campaigns] Calling n8n ${action} webhook via GET`)

    // Construct the query parameters
    const query = new URLSearchParams()
    query.append("action", action)
    query.append("UserEmail", userEmail)
    if (campaignName) {
      query.append("CampaignName", campaignName)
    }

    let targetUrl = `${WEBHOOK_URL}?action=${encodeURIComponent(action)}&UserEmail=${encodeURIComponent(userEmail)}`
    if (campaignName) {
      targetUrl += `&CampaignName=${encodeURIComponent(campaignName)}`
    }

    console.log(`[campaigns] Fetching: ${targetUrl}`)

    // Use GET with cache disabled to ensure fresh data
    const response = await fetch(targetUrl, {
      method: "GET",
      headers: { "Accept": "application/json" },
      cache: "no-store"
    })

    const responseText = await response.text()
    console.log(`[campaigns] Action: ${action} | Status: ${response.status}`)

    if (!response.ok) {
      return NextResponse.json({ campaigns: [], error: `Webhook error ${response.status}` })
    }

    let webhookData: any = null
    try {
      webhookData = JSON.parse(responseText)
    } catch (e) {
      console.error("[campaigns] JSON parse error")
      return NextResponse.json({ campaigns: [] })
    }

    // Extraction logic based on n8n patterns
    let campaigns: any[] = []
    
    // Handle Case 1: n8n default wrapper [{json: {data: [...]}}]
    if (Array.isArray(webhookData) && webhookData[0]?.json?.data) {
      campaigns = webhookData[0].json.data
    }
    // Handle Case 2: Direct data wrapper {data: [...]}
    else if (webhookData?.data && Array.isArray(webhookData.data)) {
      campaigns = webhookData.data
    }
    // Handle Case 3: Array of items [{json: {...}}, {json: {...}}]
    else if (Array.isArray(webhookData) && webhookData[0]?.json) {
      campaigns = webhookData.map((item: any) => item.json)
    }
    // Handle Case 4: Pure array of objects [{...}, {...}]
    else if (Array.isArray(webhookData)) {
      campaigns = webhookData
    }
    // Handle Case 5: Single object that contains data {...}
    else if (webhookData && typeof webhookData === "object") {
      campaigns = [webhookData]
    }

    console.log("[campaigns] Extracted", campaigns.length, "raw items")

    // Normalize field names
    const normalizeCampaign = (c: any) => ({
      CampaignName:      c.CampaignName || c.campaignName || c.Campaign || c.Role || c.name || c.Name || "Unnamed Campaign",
      UserEmail:         c.UserEmail || c.userEmail || c.email || c.Email || "",
      IsActive:          c.IsActive ?? c.isActive ?? c.Active ?? c.active ?? true,
      CreationDate:      c.CreationDate || c.creationDate || c.CreatedAt || c.created_at || "",
      CampaignStartDate: c.CampaignStartDate || c.StartDate || c.startDate || "",
      CampaignEndDate:   c.CampaignEndDate || c.EndDate || c.endDate || "",
      Description:       c.Description || c.description || c.Summary || c.summary || "",
      Location:          c.Location || c.location || c.City || c.city || "",
      ExpectedAttendees: c.ExpectedAttendees || c.expectedAttendees || c.Attendees || "",
      row_number:        c.row_number || c.RowNumber || undefined,
    })

    const normalizedCampaigns = campaigns.map(normalizeCampaign)
    console.log(`[campaigns] Normalized ${normalizedCampaigns.length} campaigns`)

    // Extract the actual data from the webhook response
    let finalResult = webhookData
    if (Array.isArray(webhookData) && webhookData.length === 1 && webhookData[0]?.json) {
      finalResult = webhookData[0].json
    }

    // IMPORTANT: If campaignName is provided, we return the unwrapped results
    if (campaignName) {
      if (Array.isArray(webhookData) && webhookData.every(item => item.json)) {
        return NextResponse.json(webhookData.map(item => item.json))
      }
      return NextResponse.json(finalResult)
    }

    return NextResponse.json({ campaigns: normalizedCampaigns })

  } catch (e: any) {
    console.error("[campaigns] Error:", e)
    return NextResponse.json({ campaigns: [], error: e.message ?? "Unknown error" })
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
