import { NextRequest, NextResponse } from "next/server"

// Map of action names to their corresponding n8n webhook URLs
const WEBHOOK_MAP: Record<string, string> = {
  // Campaign listing / fetching
  "Campaigns":         "https://n8n.srv1010832.hstgr.cloud/webhook/ab8d28de-afb7-416f-aaf1-454949b27c18",
  "Certain Campaign":  "https://n8n.srv1010832.hstgr.cloud/webhook/ab8d28de-afb7-416f-aaf1-454949b27c18",
  "AllCampaign":       "https://n8n.srv1010832.hstgr.cloud/webhook/ab8d28de-afb7-416f-aaf1-454949b27c18",

  // Campaign management
  "CampaignCreation":  "https://n8n.srv1010832.hstgr.cloud/webhook/ff7710c6-14c7-4cae-a24c-6c53e5f09497",
  "CampaignDetails":   "https://n8n.srv1010832.hstgr.cloud/webhook/ff7710c6-14c7-4cae-a24c-6c53e5f09497",
  "EditCampaign":      "https://n8n.srv1010832.hstgr.cloud/webhook/HRcampaigns",

  // Analytics
  "HRAnalytics":       "https://n8n.srv1010832.hstgr.cloud/webhook/HRAnalytics",

  // Misc
  "Report":            "https://n8n.srv1010832.hstgr.cloud/webhook/ff7710c6-14c7-4cae-a24c-6c53e5f09497",
  "UpdateDecision":    "https://n8n.srv1010832.hstgr.cloud/webhook/4e32ea2c-cec1-4357-bd2c-e635fa910444",
  "CallRoundData":     "https://n8n.srv1010832.hstgr.cloud/webhook/4e32ea2c-cec1-4357-bd2c-e635fa910444",
}

// These actions are read-only fetches — forward them as GET to n8n
// (n8n webhook triggers are GET-first by default unless configured otherwise)
const GET_ACTIONS = new Set(["Campaigns", "Certain Campaign"])

export async function POST(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const action = searchParams.get("action")

  if (!action) {
    return NextResponse.json({ error: "Missing action parameter" }, { status: 400 })
  }

  const targetBase = WEBHOOK_MAP[action]
  if (!targetBase) {
    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
  }

  let body: any = {}
  try {
    body = await request.json()
  } catch {
    // Body may be empty — that's fine
  }

  const isGetAction = GET_ACTIONS.has(action)

  // For GET actions, include body fields as query params (since GET has no body)
  let targetUrl: string
  if (isGetAction) {
    const params = new URLSearchParams(searchParams)
    Object.entries(body).forEach(([k, v]) => params.append(k, String(v)))
    targetUrl = `${targetBase}?${params.toString().replace(/\+/g, '%20')}`
  } else {
    // For POST, just forward existing search params
    targetUrl = `${targetBase}?${searchParams.toString().replace(/\+/g, '%20')}`
  }

  console.log(`[Proxy] ${action} → ${isGetAction ? "GET" : "POST"} ${targetUrl}`)

  try {
    const fetchOptions: RequestInit = isGetAction
      ? { method: "GET" }
      : {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }

    const n8nResponse = await fetch(targetUrl, fetchOptions)
    const responseText = await n8nResponse.text()
    console.log(`[Proxy] n8n → status ${n8nResponse.status}, preview: ${responseText.substring(0, 200)}`)

    // Return the n8n response transparently
    return new NextResponse(responseText, {
      status: n8nResponse.ok ? 200 : n8nResponse.status,
      headers: {
        "Content-Type": "application/json",
      },
    })
  } catch (error: any) {
    console.error("[Proxy] Fetch error:", error)
    return NextResponse.json({ error: error.message }, { status: 502 })
  }
}
