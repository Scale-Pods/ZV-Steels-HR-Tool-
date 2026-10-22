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

/** Naming used by the booking calendar / decision stages for each round. */
export const INTERVIEW_TYPE_DECISION_LABEL: Record<InterviewType, string> = {
  hr: "HR Decision",
  tech: "Tech Decision",
  manager: "Manager Decision",
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

/** ISO (yyyy-MM-dd) or dd/MM/yyyy -> dd/MM/yyyy, the format stored in "HR Data". */
export function formatInterviewDate(value: string): string {
  const raw = String(value || "").trim()
  if (!raw) return ""
  const iso = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (iso) return `${iso[3].padStart(2, "0")}/${iso[2].padStart(2, "0")}/${iso[1]}`
  const dmy = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (dmy) {
    return `${dmy[1].padStart(2, "0")}/${dmy[2].padStart(2, "0")}/${dmy[3]}`
  }
  return raw
}

/** "16:00" | "04:00 pm" | "4:00 PM" -> "04:00 pm", the format used by the booking calendar. */
export function formatInterviewTime(value: string): string {
  const raw = String(value || "").trim().toLowerCase()
  if (!raw) return ""
  const match = raw.match(/^(\d{1,2})(?::(\d{1,2}))?\s*(am|pm)?$/)
  if (!match) return raw
  let hour = Number(match[1])
  const minute = match[2] ? Number(match[2]) : 0
  const meridiem = match[3]
  if (meridiem) {
    if (hour > 12) return raw
    if (meridiem === "pm" && hour !== 12) hour += 12
    if (meridiem === "am" && hour === 12) hour = 0
  } else if (hour > 23) {
    return raw
  }
  const hour12 = hour % 12 === 0 ? 12 : hour % 12
  const suffix = hour >= 12 ? "pm" : "am"
  return `${String(hour12).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${suffix}`
}

/** "04:00 pm" | "16:00" -> "16:00" */
export function to24HourTime(value: string): string {
  const raw = String(value || "").trim().toLowerCase()
  const match = raw.match(/^(\d{1,2})(?::(\d{1,2}))?\s*(am|pm)?$/)
  if (!match) return raw
  let hour = Number(match[1])
  const minute = match[2] ? Number(match[2]) : 0
  const meridiem = match[3]
  if (meridiem) {
    if (hour > 12) return raw
    if (meridiem === "pm" && hour !== 12) hour += 12
    if (meridiem === "am" && hour === 12) hour = 0
  }
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
}

export interface RescheduleInterviewerMeta {
  email: string
  name?: string
  slug?: string
  calendarLink?: string
  bookingLink?: string
}

export interface ReschedulePayloadInput {
  meetingType: InterviewType
  interviewer: RescheduleInterviewerMeta
  assignments: Record<InterviewType, string>
  candidateEmail: string
  candidateDetails?: Record<string, any>
  campaignName?: string
  eventId?: string
  meetingLink?: string
  oldDate?: string
  oldTime?: string
  newDate: string
  newTime: string
  userRole?: string
}

export type ReschedulePayload = Record<string, any>

const CANDIDATE_DETAIL_KEYS = [
  "Name",
  "Role",
  "Email",
  "Phone Number",
  "City",
  "Score",
  "Candidate ID",
  "HR Assigned",
  "Tech Interviewer",
  "Manager Assigned",
  "HR Calendar Link",
  "Tech Calendar Link",
  "Manager Calendar Link",
  "HR Meeting Date",
  "HR Meeting Time",
  "HR Meeting Link",
  "HR Event ID",
  "Tech Meeting Date",
  "Tech Meeting Time",
  "Tech Meeting Link",
  "Tech Event ID",
  "Manager Meeting Date",
  "Manager Meeting Time",
  "Manager Meeting Link",
  "Manager Interview Link",
  "Manager Event ID",
  "HR Meeting Type",
  "Tech Meeting Type",
  "Manager Meeting Type",
  "HR Meeting Mail",
  "Tech Mail Sent",
  "Manger Meeting Mail",
]

/** Keeps the raw "HR Data" column names (Name, Role, HR Assigned, ...) for the automation. */
export function pickCandidateDetails(
  raw: Record<string, any> | null | undefined,
): Record<string, any> {
  const source = (raw || {}) as Record<string, any>
  const details: Record<string, any> = {}
  for (const key of CANDIDATE_DETAIL_KEYS) {
    const value = source[key]
    if (value === undefined || value === null) continue
    details[key] = value
  }
  return details
}

/**
 * Single source of truth for the payload the n8n reschedule workflow expects.
 * Every key is sent both as a query parameter and inside the JSON body so the
 * workflow can read it from either side of the webhook trigger.
 */
export function buildReschedulePayload(
  input: ReschedulePayloadInput,
): ReschedulePayload {
  const { meetingType } = input
  const assignments = input.assignments
  const interviewerEmail = input.interviewer.email || ""

  return {
    action: "Reschedule",
    meetingType,
    interviewType: meetingType,
    meetingTypeLabel: INTERVIEW_TYPE_LABEL[meetingType],
    round: INTERVIEW_TYPE_ROUND[meetingType],
    roundLabel: INTERVIEW_TYPE_ROUND_LABEL[meetingType],
    roundName: INTERVIEW_TYPE_DECISION_LABEL[meetingType],
    interviewerName: input.interviewer.name || "",
    interviewerSlug: input.interviewer.slug || "",
    calendarLink: input.interviewer.calendarLink || "",
    bookingLink: input.interviewer.bookingLink || input.interviewer.calendarLink || "",
    candidateEmail: input.candidateEmail,
    campaignName: input.campaignName || "",
    eventId: input.eventId || "",
    meetingLink: input.meetingLink || "",
    oldDate: input.oldDate || "",
    oldTime: input.oldTime || "",
    newDate: input.newDate,
    newTime: input.newTime,
    newDateDisplay: formatInterviewDate(input.newDate),
    newTimeDisplay: formatInterviewTime(input.newTime),
    userRole: input.userRole || "Admin",
    ...buildInterviewerPayload(assignments),
    interviewerEmail,
    meetingDetails: {
      type: INTERVIEW_TYPE_ROUND_LABEL[meetingType],
      meetingType,
      interviewType: meetingType,
      round: INTERVIEW_TYPE_ROUND[meetingType],
      oldDate: input.oldDate || "",
      oldTime: input.oldTime || "",
      newDate: input.newDate,
      newTime: input.newTime,
      newDateDisplay: formatInterviewDate(input.newDate),
      newTimeDisplay: formatInterviewTime(input.newTime),
      link: input.meetingLink || "",
      eventId: input.eventId || "",
    },
    candidateDetails: {
      ...(input.candidateDetails || {}),
      ...buildInterviewerPayload(assignments),
      interviewerEmail,
      interviewerName: input.interviewer.name || "",
    },
  }
}

const RESCHEDULE_QUERY_KEYS = [
  "action",
  "meetingType",
  "interviewType",
  "meetingTypeLabel",
  "round",
  "interviewerEmail",
  "interviewerName",
  "interviewerSlug",
  "calendarLink",
  "bookingLink",
  "candidateEmail",
  "campaignName",
  "eventId",
  "meetingLink",
  "oldDate",
  "oldTime",
  "newDate",
  "newTime",
  "newDateDisplay",
  "newTimeDisplay",
  "userRole",
  "hrAssigned",
  "techInterviewer",
  "managerAssigned",
] as const

export function buildRescheduleQuery(
  payload: ReschedulePayload,
): Record<string, string> {
  const query: Record<string, string> = {}
  for (const key of RESCHEDULE_QUERY_KEYS) {
    const value = payload[key]
    if (value === undefined || value === null || value === "") continue
    query[key] = String(value)
  }
  return query
}
