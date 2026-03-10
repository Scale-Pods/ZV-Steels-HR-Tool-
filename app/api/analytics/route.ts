export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const userEmail = "guest@example.com";

    const { searchParams } = new URL(request.url);
    const campaignName = searchParams.get("campaignName");

    console.log(
      "[v0] Fetching analytics for user:",
      userEmail,
      "campaign:",
      campaignName || "overall"
    );

    // Build webhook URL
    const webhookBase = process.env.NEXT_PUBLIC_WEBHOOK_URL || "https://n8n.srv1010832.hstgr.cloud/webhook";
    const webhookPath = process.env.NEXT_PUBLIC_WEBHOOK_HR_ANALYTICS || "HRAnalytics";
    let webhookUrl = `${webhookBase}/${webhookPath}`;
    if (campaignName) {
      webhookUrl += `?campaignName=${encodeURIComponent(campaignName)}`;
    }

    const response = await fetch(webhookUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error(
        "[v0] Analytics webhook request failed with status:",
        response.status
      );
      const errorText = await response.text();
      throw new Error(`Analytics webhook request failed: ${response.status}`);
    }

    const rawData = await response.json();

    // Normalize the response
    const normalized =
      Array.isArray(rawData) && rawData.length > 0
        ? rawData[0]?.data || rawData[0]
        : rawData.data || rawData;

    if (!normalized || typeof normalized !== "object") {
      return NextResponse.json(
        { error: "Unexpected response format" },
        { status: 500 }
      );
    }

    return NextResponse.json(normalized);
  } catch (e: any) {
    console.error("[v0] Error fetching analytics:", e);
    return NextResponse.json(
      { error: e.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
