import { getRows, getInterviewers } from "@/lib/hr-data"
import {
  getAssignmentValue,
  getInterviewerAssignments,
  normalizeInterviewType,
  type InterviewType,
} from "@/lib/interviewer"

export const dynamic = "force-dynamic"

function interviewerTypeMatches(interviewerType: string, type: InterviewType): boolean {
  const value = String(interviewerType || "").toLowerCase().trim()
  if (!value) return false
  if (type === "hr") return value.includes("hr")
  if (type === "tech") return value.includes("tech")
  return value.includes("manager") || value.includes("manger")
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const email = String(searchParams.get("email") || "").trim()
  const type = normalizeInterviewType(searchParams.get("type"))

  if (!email) {
    return Response.json({ error: "email query parameter is required" }, { status: 400 })
  }

  try {
    const rows = await getRows({ email })
    const row: Record<string, any> = rows[0] || {}
    const assignments = getInterviewerAssignments(row)

    let interviewerEmail = type ? assignments[type] : ""

    if (type && !interviewerEmail) {
      const rawValue = getAssignmentValue(row, type)
      if (rawValue) {
        try {
          const interviewers = await getInterviewers()
          const lowered = rawValue.toLowerCase()
          const match =
            interviewers.find(
              (i) => i.Name.toLowerCase() === lowered && interviewerTypeMatches(i.Interviewer, type),
            ) ||
            interviewers.find((i) => i.Name.toLowerCase() === lowered) ||
            interviewers.find((i) => i.Email.toLowerCase() === lowered)
          if (match?.Email) interviewerEmail = match.Email
        } catch {
          interviewerEmail = ""
        }
      }
    }

    return Response.json({
      email,
      hr: assignments.hr,
      tech: assignments.tech,
      manager: assignments.manager,
      interviewerEmail,
      assignment: type ? getAssignmentValue(row, type) : "",
    })
  } catch (error: any) {
    return Response.json(
      { error: error?.message || "Failed to resolve interviewer" },
      { status: 500 },
    )
  }
}
