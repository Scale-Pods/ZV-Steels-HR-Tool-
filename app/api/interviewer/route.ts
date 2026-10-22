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

const ROUND_CALENDAR_LINK: Record<InterviewType, string> = {
  hr: "HR Calendar Link",
  tech: "Tech Calendar Link",
  manager: "Manager Calendar Link",
}

function bookingSlug(calendarLink: string): string {
  const parts = String(calendarLink || "")
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean)
  return parts.length ? parts[parts.length - 1] : ""
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
    let interviewers: Awaited<ReturnType<typeof getInterviewers>> = []
    let matched: (typeof interviewers)[number] | undefined

    if (type) {
      try {
        interviewers = await getInterviewers()
      } catch {
        interviewers = []
      }

      if (!interviewerEmail) {
        const rawValue = getAssignmentValue(row, type)
        if (rawValue) {
          const lowered = rawValue.toLowerCase()
          matched =
            interviewers.find(
              (i) => i.Name.toLowerCase() === lowered && interviewerTypeMatches(i.Interviewer, type),
            ) ||
            interviewers.find((i) => i.Name.toLowerCase() === lowered) ||
            interviewers.find((i) => i.Email.toLowerCase() === lowered)
          if (matched?.Email) interviewerEmail = matched.Email
        }
      }

      if (!matched && interviewerEmail) {
        matched = interviewers.find(
          (i) => i.Email.toLowerCase() === interviewerEmail.toLowerCase(),
        )
      }
    }

    const bookingLink = matched?.["Calendar Link"] || ""
    const calendarLink = type
      ? String(row[ROUND_CALENDAR_LINK[type]] || "") || bookingLink
      : ""

    return Response.json({
      email,
      hr: assignments.hr,
      tech: assignments.tech,
      manager: assignments.manager,
      interviewerEmail,
      interviewerName: matched?.Name || "",
      interviewerSlug: bookingSlug(bookingLink),
      calendarLink,
      bookingLink,
      assignment: type ? getAssignmentValue(row, type) : "",
    })
  } catch (error: any) {
    return Response.json(
      { error: error?.message || "Failed to resolve interviewer" },
      { status: 500 },
    )
  }
}
