export const dynamic = "force-dynamic"

import { type NextRequest, NextResponse } from "next/server"

type OverallAnalytics = {
  total_leads: number
  meetings_booked: number
  messages_sent: number
  active_campaigns: number
  status_counts: {
    replied: number
    waiting_for_reply: number
    nurture_email_sent: number
    unresponsive: number
    [key: string]: number
  }
  conversion_rates: {
    reply_rate_percent: number
    booking_rate_percent: number
  }
  recent_leads: Array<{
    row_number?: number
    firstName?: string
    lastName?: string
    companyName?: string
    position?: string
    email?: string
    WPphoneNumber?: number | string
    Status?: string
    lastOutreachTS?: string
    emailAction1?: string
    emailAction2?: string
    emailAction3?: string
    emailAction4?: string
    emailAction5?: string
    [key: string]: any
  }>
}

type UserSpecificData = {
  row_number?: number
  firstName?: string
  lastName?: string
  companyName?: string
  position?: string
  email?: string
  WPphoneNumber?: number | string
  Status?: string
  lastOutreachTS?: string
  unresponsive?: string
  meetBooked?: string
  emailAction1?: string
  emailAction2?: string
  emailAction3?: string
  emailAction4?: string
  emailAction5?: string
  [key: string]: any
}

type AnalyticsResponse = {
  totalLeads: number
  meetingsBooked: number
  messagesSent: number
  activeCampaigns: number
  leadsByStatus: Record<string, number>
  conversionRates: {
    replyRate: number
    bookingRate: number
  }
  recentLeads: Array<{
    name: string
    company: string
    email: string
    phone: string
    status: string
    scannedAt: string
    emailAction1?: string
    emailAction2?: string
    emailAction3?: string
    emailAction4?: string
    emailAction5?: string
    position?: string
    [key: string]: any
  }>
  leadsPerDay: { date: string; count: number }[]
  lastUpdated: string
  userSpecificData?: UserSpecificData | undefined
  error?: string
}

const WEBHOOK_URL = "https://n8n.srv1010832.hstgr.cloud/webhook/HRAnalytics"

/**
 * Utility: safeNumber
 * Converts strings like "65.76" or "76.19" to Number, but returns 0 on NaN
 */
function safeNumber(v: any) {
  const n = typeof v === "number" ? v : Number(String(v).replace(/[^0-9.-]+/g, ""))
  return Number.isFinite(n) ? n : 0
}

/**
 * Build a consistent empty fallback response
 */
function emptyResponse(error?: string): AnalyticsResponse {
  return {
    totalLeads: 0,
    meetingsBooked: 0,
    messagesSent: 0,
    activeCampaigns: 0,
    leadsByStatus: {},
    conversionRates: { replyRate: 0, bookingRate: 0 },
    recentLeads: [],
    leadsPerDay: [],
    lastUpdated: new Date().toISOString(),
    userSpecificData: undefined,
    error,
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userEmail = searchParams.get("email") || undefined
    const campaignName = searchParams.get("campaignName") || undefined

    // Build webhook URL with query params
    let webhookUrl = WEBHOOK_URL
    const params = new URLSearchParams()
    if (userEmail) params.append("email", userEmail)
    if (campaignName && campaignName !== "all") params.append("campaignName", campaignName)
    if (params.toString()) webhookUrl = `${WEBHOOK_URL}?${params.toString()}`

    console.log("[v0] Calling analytics webhook:", webhookUrl)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)

    let response: Response
    try {
      response = await fetch(webhookUrl, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
      })
    } catch (fetchErr: any) {
      clearTimeout(timeoutId)
      console.error("[v0] Fetch failed:", fetchErr?.message ?? fetchErr)
      if (fetchErr.name === "AbortError") {
        return NextResponse.json(emptyResponse("Request to analytics webhook timed out after 15 seconds"), {
          status: 200,
        })
      }
      return NextResponse.json(emptyResponse(fetchErr?.message ?? "Failed to call webhook"), { status: 200 })
    } finally {
      clearTimeout(timeoutId)
    }

    if (!response.ok) {
      console.error("[v0] Analytics webhook returned error:", response.status, response.statusText)
      return NextResponse.json(emptyResponse(`Analytics webhook returned ${response.status}: ${response.statusText}`), {
        status: 200,
      })
    }

    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      console.error("[v0] Analytics webhook returned non-JSON content type:", contentType)
      return NextResponse.json(emptyResponse("Analytics webhook returned non-JSON response"), { status: 200 })
    }

    // Parse JSON safely
    let rawData: any
    try {
      rawData = await response.json()
      console.log("[v0] Received data from analytics webhook:", JSON.stringify(rawData).substring(0, 400))
    } catch (parseError: any) {
      console.error("[v0] Failed to parse JSON from analytics webhook:", parseError?.message ?? parseError)
      return NextResponse.json(emptyResponse("Failed to parse response from analytics webhook"), { status: 200 })
    }

    // Normalize: support array-wrapped responses and nested data fields
    let data: any = rawData
    if (Array.isArray(rawData) && rawData.length > 0) {
      data = rawData[0]
    }
    // unwrap .data layers, allow double-nesting
    if (data && typeof data === "object" && "data" in data) data = (data as any).data
    if (data && typeof data === "object" && "data" in data) data = (data as any).data

    // If still not an object, fail gracefully
    if (!data || typeof data !== "object") {
      console.error(
        "[v0] Unknown or invalid data format after normalization:",
        JSON.stringify(rawData).substring(0, 400),
      )
      return NextResponse.json(emptyResponse("Unexpected data format from analytics webhook"), { status: 200 })
    }

    // If webhook returned explicit error message indicating no user data
    if (typeof data.error === "string" && data.error.toLowerCase().includes("user data not found")) {
      console.log("[v0] User data not found, returning empty user-specific data")
      return NextResponse.json({
        ...emptyResponse(),
        userSpecificData: undefined,
      })
    }

    // CASE 1: user-specific single-lead payload: presence of firstName + email
    if (data.firstName && data.email) {
      console.log("[v0] Processing user-specific data for:", data.email)
      const userSpecificData: UserSpecificData = {
        row_number: data.row_number,
        firstName: data.firstName,
        lastName: data.lastName,
        companyName: data.companyName,
        position: data.position,
        email: data.email,
        WPphoneNumber: data.WPphoneNumber,
        Status: data.Status,
        lastOutreachTS: data.lastOutreachTS,
        unresponsive: data.unresponsive,
        meetBooked: data.meetBooked,
        emailAction1: data.emailAction1,
        emailAction2: data.emailAction2,
        emailAction3: data.emailAction3,
        emailAction4: data.emailAction4,
        emailAction5: data.emailAction5,
        ...data,
      }

      const analyticsResponse: AnalyticsResponse = {
        totalLeads: 1,
        meetingsBooked: data.meetBooked === "Yes" ? 1 : 0,
        messagesSent: 0,
        activeCampaigns: 0,
        leadsByStatus: { [data.Status || "Unknown"]: 1 },
        conversionRates: { replyRate: 0, bookingRate: 0 },
        recentLeads: [],
        leadsPerDay: [],
        lastUpdated: new Date().toISOString(),
        userSpecificData,
      }

      return NextResponse.json(analyticsResponse)
    }

    // CASE 2: HR Analytics payload (your example from n8n) - contains totalCandidates, decisions, topCandidates, avgScoreByCity, etc.
    if (data.totalCandidates !== undefined && data.decisions !== undefined && data.topCandidates !== undefined) {
      console.log("[v0] Processing HR Analytics payload")
      const formattedResponse: AnalyticsResponse = {
        totalLeads: safeNumber(data.totalCandidates),
        meetingsBooked: safeNumber(data.finalDecisions?.Yes ?? 0),
        // 'messagesSent' isn't directly present in HR payload — use total No decisions as a fallback (you can change)
        messagesSent: safeNumber(data.finalDecisions?.No ?? 0),
        activeCampaigns: Object.keys(data.avgScorePerHR || {}).length || 0,
        leadsByStatus: data.decisions && typeof data.decisions === "object" ? data.decisions : {},
        conversionRates: {
          replyRate: safeNumber(data.passRate),
          bookingRate: safeNumber(data.holdRate ?? data.failRate),
        },
        recentLeads: Array.isArray(data.topCandidates)
          ? data.topCandidates.map((c: any) => ({
              name: c.Name ?? `${c.Name || ""}`.trim(),
              company: c.City ?? "N/A",
              email: c.HR ?? "N/A",
              phone: undefined,
              status: c.Decision ?? "Unknown",
              scannedAt: undefined,
              emailAction1: undefined,
              emailAction2: undefined,
              emailAction3: undefined,
              emailAction4: undefined,
              emailAction5: undefined,
              position: undefined,
              candidateId: c.CandidateID,
              _raw: c,
            }))
          : [],
        leadsPerDay: [], // HR payload does not provide per-day counts by default
        lastUpdated: new Date().toISOString(),
        userSpecificData: undefined,
      }

      return NextResponse.json(formattedResponse)
    }

    // CASE 3: original sheets/overall analytics format (expected keys: total_leads, status_counts, recent_leads, conversion_rates, etc.)
    if (data.total_leads !== undefined && data.status_counts !== undefined) {
      console.log("[v0] Processing overall analytics data (sheet format)")

      const recentLeads = Array.isArray(data.recent_leads)
        ? data.recent_leads.map((lead: any) => ({
            name: `${lead.firstName || ""} ${lead.lastName || ""}`.trim() || "Unknown",
            company: lead.companyName || "N/A",
            email: lead.email || "N/A",
            phone: lead.WPphoneNumber?.toString() || "N/A",
            status: lead.Status || "Unknown",
            scannedAt: lead.lastOutreachTS || new Date().toISOString(),
            position: lead.position,
            emailAction1: lead.emailAction1,
            emailAction2: lead.emailAction2,
            emailAction3: lead.emailAction3,
            emailAction4: lead.emailAction4,
            emailAction5: lead.emailAction5,
            ...lead,
          }))
        : []

      const analyticsResponse: AnalyticsResponse = {
        totalLeads: safeNumber(data.total_leads),
        meetingsBooked: safeNumber(data.meetings_booked),
        messagesSent: safeNumber(data.messages_sent),
        activeCampaigns: safeNumber(data.active_campaigns),
        leadsByStatus: data.status_counts && typeof data.status_counts === "object" ? data.status_counts : {},
        conversionRates: {
          replyRate: safeNumber(data.conversion_rates?.reply_rate_percent),
          bookingRate: safeNumber(data.conversion_rates?.booking_rate_percent),
        },
        recentLeads,
        leadsPerDay: Array.isArray(data.leadsPerDay) ? data.leadsPerDay : [],
        lastUpdated: new Date().toISOString(),
        userSpecificData: undefined,
      }

      return NextResponse.json(analyticsResponse)
    }

    // CASE 4: Some webhooks may return wrapper object with keys like {status, message, data: {...}} but data had different keys
    // At this point we already unwrapped data, so any other format is considered unrecognized but we can attempt to map a few common keys.
    // Try a best-effort mapping for some commonly-used fields:
    const fallback: AnalyticsResponse = {
      totalLeads: safeNumber(data.totalCandidates ?? data.total_leads ?? data.total ?? 0),
      meetingsBooked: safeNumber(data.meetings_booked ?? data.meetingsBooked ?? 0),
      messagesSent: safeNumber(data.messages_sent ?? data.messagesSent ?? 0),
      activeCampaigns: safeNumber(data.active_campaigns ?? 0),
      leadsByStatus: (data.decisions ?? data.status_counts ?? {}) as Record<string, number>,
      conversionRates: {
        replyRate: safeNumber(data.passRate ?? data.conversion_rates?.reply_rate_percent ?? 0),
        bookingRate: safeNumber(data.holdRate ?? data.conversion_rates?.booking_rate_percent ?? 0),
      },
      recentLeads: Array.isArray(data.recent_leads)
        ? data.recent_leads.map((lead: any) => ({
            name: `${lead.firstName || ""} ${lead.lastName || ""}`.trim() || "Unknown",
            company: lead.companyName || "N/A",
            email: lead.email || "N/A",
            phone: lead.WPphoneNumber?.toString() || "N/A",
            status: lead.Status || "Unknown",
            scannedAt: lead.lastOutreachTS || new Date().toISOString(),
            position: lead.position,
            emailAction1: lead.emailAction1,
            emailAction2: lead.emailAction2,
            emailAction3: lead.emailAction3,
            emailAction4: lead.emailAction4,
            emailAction5: lead.emailAction5,
            ...lead,
          }))
        : [],
      leadsPerDay: Array.isArray(data.leadsPerDay) ? data.leadsPerDay : [],
      lastUpdated: new Date().toISOString(),
      userSpecificData: undefined,
      error: "Unrecognized analytics data structure - returned best-effort mapping",
    }

    console.warn("[v0] Unrecognized but mapped data format; returning best-effort mapping.")
    return NextResponse.json(fallback)
  } catch (error: any) {
    console.error("[v0] Error in sheets stats API:", error)

    let errorMessage = "Failed to fetch analytics data"
    if (error?.name === "AbortError") {
      errorMessage = "Request to analytics webhook timed out after 15 seconds"
    } else if (error?.message) {
      errorMessage = error.message
    }

    return NextResponse.json(
      {
        totalLeads: 0,
        meetingsBooked: 0,
        messagesSent: 0,
        activeCampaigns: 0,
        leadsByStatus: {},
        conversionRates: { replyRate: 0, bookingRate: 0 },
        recentLeads: [],
        leadsPerDay: [],
        lastUpdated: new Date().toISOString(),
        error: errorMessage,
      },
      { status: 200 },
    )
  }
}
