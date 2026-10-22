const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const HR_CAMPAIGNS_TABLE = "hr_campaigns"
const CANDIDATES_TABLE = "HR Data"

export type HRDataTableRow = Record<string, any>

async function selectFrom(table: string, query: string): Promise<HRDataTableRow[]> {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables")
  }
  const url = `${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/${encodeURIComponent(table)}?${query}`
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
    cache: "no-store",
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`${table} query failed (${res.status}): ${body.substring(0, 300)}`)
  }
  return res.json()
}

export async function getRows(opts: { campaign?: string; email?: string } = {}): Promise<HRDataTableRow[]> {
  const params = new URLSearchParams()
  params.set("select", "*")
  if (opts.campaign) params.set("Role", `eq.${opts.campaign}`)
  if (opts.email) params.set("Email", `eq.${opts.email}`)
  params.set("order", "id.asc")
  return selectFrom(CANDIDATES_TABLE, params.toString())
}

const HR_CAMPAIGNS_SELECT_COLUMNS = [
  "id",
  "UserEmail",
  "CampaignName",
  "CampaignStartDate",
  "CampaignEndDate",
  "CreationDate",
  "Description",
  "Location",
  "ExpectedAttendees",
  "NumberOfRounds",
  "Optimized",
  "IsActive",
  "Status",
  "Questions",
  "CallQuestions",
]

function hrCampaignsQuery() {
  const params = new URLSearchParams()
  params.set("select", HR_CAMPAIGNS_SELECT_COLUMNS.map((col) => `"${col}"`).join(","))
  params.set("order", "id.asc")
  return params.toString()
}

async function selectFromCampaigns(): Promise<HRDataTableRow[]> {
  return selectFrom(HR_CAMPAIGNS_TABLE, hrCampaignsQuery())
}

async function deriveCampaignsFromCandidates() {
  const rows = await selectFrom(CANDIDATES_TABLE, "select=Role,time&order=Role.asc")
  const grouped = new Map<string, { CampaignName: string; CreationDate: string }>()

  for (const row of rows) {
    const role = String(row.Role || "").trim()
    if (!role) continue
    const time = row.time
    const date = time ? String(time) : ""
    const existing = grouped.get(role)
    if (!existing) {
      grouped.set(role, { CampaignName: role, CreationDate: date })
    } else if (!existing.CreationDate && date) {
      existing.CreationDate = date
    }
  }

  return Array.from(grouped.values()).map((campaign, index) => ({
    row_number: index + 1,
    CampaignName: campaign.CampaignName,
    UserEmail: "guest@example.com",
    CreationDate: campaign.CreationDate,
    IsActive: true,
    Description: "",
    Location: "",
    ExpectedAttendees: 0,
  }))
}

export async function getCampaigns() {
  try {
    const k = process.env.SUPABASE_SERVICE_ROLE_KEY
    const u = process.env.SUPABASE_URL
    if (k && u) {
      const url = `${u.replace(/\/$/, "")}/rest/v1/hr_campaigns?select=*&order=id.asc`
      const res = await fetch(url, { headers: { apikey: k, Authorization: `Bearer ${k}` }, cache: "no-store" })
      if (res.ok) {
        const rows = await res.json()
        const arr = Array.isArray(rows) ? rows : rows?.value || []
        const filtered = arr.filter((row: any) => {
          const del = row.IsDeleted ?? row.isDeleted ?? row["Is Deleted"] ?? row.deleted
          if (del === true) return false
          if (typeof del === "string" && del.toLowerCase() === "true") return false
          return true
        })
        const list = (filtered.length ? filtered : arr).map((row: any, index: number) => {
          const status = row.Status ? String(row.Status).toLowerCase() : ""
          const isOpen = status === "open" || (status === "" ? row.IsActive !== false : true)
          return {
            row_number: index + 1,
            CampaignName: row.CampaignName ? String(row.CampaignName) : "Unnamed Campaign",
            UserEmail: row.UserEmail ? String(row.UserEmail) : "guest@example.com",
            CreationDate: row.CreationDate ? String(row.CreationDate) : row.created_at ? String(row.created_at) : "",
            CampaignStartDate: row.CampaignStartDate ? String(row.CampaignStartDate) : "",
            CampaignEndDate: row.CampaignEndDate ? String(row.CampaignEndDate) : "",
            Description: row.Description ? String(row.Description) : "",
            Location: row.Location ? String(row.Location) : "",
            ExpectedAttendees: row.ExpectedAttendees ?? 0,
            NumberOfRounds: row.NumberOfRounds ?? 1,
            Optimized: row.Optimized ?? "",
            IsActive: isOpen,
            Status: status || (row.IsActive === false ? "close" : "open"),
            Questions: row.Questions ?? row.CallQuestions ?? "",
          }
        })
        return list
      }
    }
    const rows = await selectFromCampaigns()
    let filtered = rows.filter((row: any) => {
      const del = row.IsDeleted ?? row.isDeleted ?? row["Is Deleted"] ?? row.deleted
      if (del === true) return false
      if (typeof del === "string" && del.toLowerCase() === "true") return false
      return true
    })
    if (filtered.length === 0 && rows.length > 0) {
      filtered = rows
    }
    const campaignList = filtered.map((row, index) => {
      const status = row.Status ? String(row.Status).toLowerCase() : ""
      const isOpen = status === "open" || (status === "" && row.IsActive !== false)
      return {
        row_number: index + 1,
        CampaignName: row.CampaignName ? String(row.CampaignName) : "Unnamed Campaign",
        UserEmail: row.UserEmail ? String(row.UserEmail) : "guest@example.com",
        CreationDate: row.CreationDate ? String(row.CreationDate) : row.created_at ? String(row.created_at) : "",
        CampaignStartDate: row.CampaignStartDate ? String(row.CampaignStartDate) : "",
        CampaignEndDate: row.CampaignEndDate ? String(row.CampaignEndDate) : "",
        Description: row.Description ? String(row.Description) : "",
        Location: row.Location ? String(row.Location) : "",
        ExpectedAttendees: row.ExpectedAttendees ?? 0,
        NumberOfRounds: row.NumberOfRounds ?? 1,
        Optimized: row.Optimized ?? "",
        IsActive: isOpen,
        Status: status || (row.IsActive === false ? "close" : "open"),
        Questions: row.Questions ?? row.CallQuestions ?? "",
      }
    })
    return campaignList
  } catch (error) {
    console.warn("[hr-data] hr_campaigns lookup failed, falling back to derived campaigns:", (error as Error).message)
    return deriveCampaignsFromCandidates()
  }
}

export async function updateCampaignStatus(campaignName: string, status: "open" | "close") {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables")
  }
  const params = new URLSearchParams()
  params.set('"CampaignName"', `eq.${campaignName}`)
  const url = `${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/${encodeURIComponent(HR_CAMPAIGNS_TABLE)}?${params.toString()}`
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({ Status: status }),
    cache: "no-store",
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`hr_campaigns update failed (${res.status}): ${body.substring(0, 300)}`)
  }
  return res.json()
}

export async function getUsers() {
  const rows = await selectFrom(CANDIDATES_TABLE, "select=Name,Phone%20Number")
  const users: Array<{ PhoneNumber: string; Name: string }> = []
  const seen = new Set<string>()

  for (const row of rows) {
    const phone = row["Phone Number"] ? String(row["Phone Number"]).trim() : ""
    const name = row.Name ? String(row.Name).trim() : ""
    if (!phone || !name || seen.has(phone)) continue
    seen.add(phone)
    users.push({ PhoneNumber: phone, Name: name })
  }
  return users
}

const HR_INTERVIEWERS_TABLE = "hr_interviewers"

export async function getInterviewers() {
  try {
    const rows = await selectFrom(
      HR_INTERVIEWERS_TABLE,
      'select="Interviewer",name,email,calendar_link'
    )

    const interviewers: Array<{ Name: string; Email: string; Interviewer: string; "Calendar Link": string }> = []
    const seen = new Set<string>()

    for (const row of rows) {
      const email = row.email ? String(row.email).trim() : ""
      if (!email || seen.has(email.toLowerCase())) continue
      seen.add(email.toLowerCase())
      const name = row.name ? String(row.name).trim() : email.split("@")[0]
      interviewers.push({
        Name: name,
        Email: email,
        Interviewer: row.Interviewer ? String(row.Interviewer).trim() : "",
        "Calendar Link": row.calendar_link ? String(row.calendar_link).trim() : "",
      })
    }
    return interviewers
  } catch (error) {
    console.warn("[hr-data] hr_interviewers lookup failed, falling back to candidates:", (error as Error).message)
    const rows = await selectFrom(
      CANDIDATES_TABLE,
      'select="HR Assigned","Tech Interviewer","Manager Assigned","HR Calendar Link","Tech Calendar Link","Manager Calendar Link"'
    )

    const definitions = [
      { emailKey: "HR Assigned", linkKey: "HR Calendar Link", type: "HR" },
      { emailKey: "Tech Interviewer", linkKey: "Tech Calendar Link", type: "Tech" },
      { emailKey: "Manager Assigned", linkKey: "Manager Calendar Link", type: "Manager" },
    ]

    const interviewers: Array<{ Name: string; Email: string; Interviewer: string; "Calendar Link": string }> = []
    const seen = new Set<string>()

    for (const row of rows) {
      for (const def of definitions) {
        const email = row[def.emailKey] ? String(row[def.emailKey]).trim() : ""
        if (!email || seen.has(email.toLowerCase())) continue
        seen.add(email.toLowerCase())
        const local = email.split("@")[0]
        const name = local
          .split(/[._-]+/)
          .filter(Boolean)
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(" ") || email
        interviewers.push({
          Name: name,
          Email: email,
          Interviewer: def.type,
          "Calendar Link": row[def.linkKey] ? String(row[def.linkKey]) : "",
        })
      }
    }
    return interviewers
  }
}
