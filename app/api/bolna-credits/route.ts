import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const webhookUrl = "https://n8n.srv1010832.hstgr.cloud/webhook/e535ef1a-c5ae-4c36-8a5e-b11e12db78d4"
    
    const response = await fetch(webhookUrl, {
      method: "GET",
      cache: "no-store",
    })

    const text = await response.text()
    
    // The response is like: [{"data": "...event: message\ndata: {...}..."}]
    // Try to parse as array first
    try {
      if (text.trim().startsWith('[')) {
        const arr = JSON.parse(text)
        if (Array.isArray(arr) && arr.length > 0 && arr[0].data) {
          const sse = arr[0].data
          // Look for wallet in the SSE content
          const walletMatch = sse.match(/"wallet"\s*:\s*([0-9]+(?:\.[0-9]+)?)/)
          if (walletMatch) {
            return NextResponse.json({
              success: true,
              data: { wallet: parseFloat(walletMatch[1]) },
            })
          }
        }
      }
    } catch (e) {
      // ignore
    }
    
    // Direct search
    const walletMatch = text.match(/"wallet"\s*:\s*([0-9]+(?:\.[0-9]+)?)/)
    if (walletMatch) {
      return NextResponse.json({
        success: true,
        data: { wallet: parseFloat(walletMatch[1]) },
      })
    }

    return NextResponse.json(
      { success: false, error: "Could not parse credit data" },
      { status: 500 }
    )
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
