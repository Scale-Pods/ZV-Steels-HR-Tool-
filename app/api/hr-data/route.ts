import { getRows, getCampaigns, getUsers, getInterviewers } from "@/lib/hr-data"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const view = searchParams.get("view") || "candidates"
  const campaign = searchParams.get("campaign") || undefined
  const email = searchParams.get("email") || undefined

  try {
    switch (view) {
      case "campaigns":
        return Response.json({ campaigns: await getCampaigns() })
      case "users":
        return Response.json({ users: await getUsers() })
      case "interviewers":
        return Response.json({ interviewers: await getInterviewers() })
      default:
        return Response.json(await getRows({ campaign, email }))
    }
  } catch (error: any) {
    console.error(`[hr-data] view=${view} failed:`, error?.message || error)
    return Response.json({ error: error?.message || "Failed to read HR Data" }, { status: 500 })
  }
}
