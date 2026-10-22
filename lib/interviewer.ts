export type InterviewType = "hr" | "tech" | "manager"

export const INTERVIEW_TYPE_LABEL: Record<InterviewType, string> = {
  hr: "HR",
  tech: "Tech",
  manager: "Manager",
}

export const INTERVIEW_TYPE_ROUND: Record<InterviewType, number> = {
  hr: 1,
  tech: 2,
  manager: 3,
}

export const INTERVIEW_TYPE_ROUND_LABEL: Record<InterviewType, string> = {
  hr: "Round 1",
  tech: "Round 2",
  manager: "Round 3",
}

const ASSIGNMENT_FIELDS: Record<InterviewType, string[]> = {
  hr: [
    "HR Assigned",
    "HR Assigned Email",
    "HR Interviewer",
    "HRAssigned",
    "hr_assigned",
    "hrAssigned",
    "HR",
    "hr",
  ],
  tech: [
    "Tech Interviewer",
    "Tech Interviewer Assigned",
    "Tech Assigned",
    "TI Assigned",
    "TIAssigned",
    "ti_assigned",
    "tiAssigned",
    "Tech",
    "tech",
  ],
  manager: [
    "Manager Assigned",
    "Manager Interviewer",
    "ManagerAssigned",
    "manager_assigned",
    "managerAssigned",
    "Manger Assigned",
    "Manager",
    "manager",
  ],
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(value: unknown): boolean {
  return typeof value === "string" && EMAIL_PATTERN.test(value.trim())
}

export function cleanEmail(value: unknown): string {
  if (typeof value !== "string") return ""
  const trimmed = value.trim()
  return EMAIL_PATTERN.test(trimmed) ? trimmed : ""
}

function readField(source: Record<string, any>, field: string): string {
  const value = source[field]
  if (typeof value === "string") return value.trim()
  if (typeof value === "number") return String(value).trim()
  return ""
}

export function getAssignmentValue(
  candidate: Record<string, any> | null | undefined,
  type: InterviewType,
): string {
  const source = (candidate || {}) as Record<string, any>
  for (const field of ASSIGNMENT_FIELDS[type]) {
    const value = readField(source, field)
    if (value) return value
  }
  return ""
}

export function getInterviewerAssignments(
  candidate: Record<string, any> | null | undefined,
): Record<InterviewType, string> {
  const source = (candidate || {}) as Record<string, any>
  const resolve = (type: InterviewType) => {
    for (const field of ASSIGNMENT_FIELDS[type]) {
      const email = cleanEmail(source[field])
      if (email) return email
    }
    return ""
  }
  return {
    hr: resolve("hr"),
    tech: resolve("tech"),
    manager: resolve("manager"),
  }
}

export function resolveInterviewerEmail(
  candidate: Record<string, any> | null | undefined,
  type: InterviewType,
): string {
  return getInterviewerAssignments(candidate)[type] || ""
}

export function normalizeInterviewType(value: unknown): InterviewType | null {
  const raw = String(value ?? "").toLowerCase().trim()
  if (!raw) return null
  if (raw.includes("manager") || raw.includes("manger")) return "manager"
  if (raw.includes("tech") || raw.includes("technical")) return "tech"
  if (raw.includes("hr")) return "hr"
  if (raw.includes("round 1") || raw.includes("round1")) return "hr"
  if (raw.includes("round 2") || raw.includes("round2")) return "tech"
  if (raw.includes("round 3") || raw.includes("round3")) return "manager"
  return null
}

export function buildInterviewerPayload(
  assignments: Record<InterviewType, string>,
): Record<string, string> {
  return {
    interviewerEmail: assignments.manager || assignments.tech || assignments.hr || "",
    hrAssigned: assignments.hr || "",
    techInterviewer: assignments.tech || "",
    managerAssigned: assignments.manager || "",
    "HR Assigned": assignments.hr || "",
    "Tech Interviewer": assignments.tech || "",
    "Manager Assigned": assignments.manager || "",
    HR: assignments.hr || "",
    TIAssigned: assignments.tech || "",
    ManagerAssigned: assignments.manager || "",
  }
}
