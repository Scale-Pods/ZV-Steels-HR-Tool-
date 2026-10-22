const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const TABLE = "Users_HR"

export interface UserHR {
  id: number
  created_at: string
  Name: string | null
  Email: string | null
  Access_Type: string | null
  Last_Activity: string | null
  Password?: string | null
}

function baseHeaders(): Record<string, string> {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables")
  }
  return {
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    "Content-Type": "application/json",
  }
}

function restUrl(query: string): string {
  return `${SUPABASE_URL!.replace(/\/$/, "")}/rest/v1/${encodeURIComponent(TABLE)}${query}`
}

async function request(query: string, init: RequestInit): Promise<Response> {
  const res = await fetch(restUrl(query), { ...init, headers: { ...baseHeaders(), ...(init.headers || {}) }, cache: "no-store" })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`${TABLE} request failed (${res.status}): ${body.substring(0, 300)}`)
  }
  return res
}

function escapeIlike(value: string): string {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`)
}

export async function findUserByEmail(email: string): Promise<UserHR | null> {
  const query = new URLSearchParams()
  query.set("select", "id,created_at,Name,Email,Access_Type,Last_Activity,Password")
  query.set("Email", `ilike.${escapeIlike(email.trim())}`)
  query.set("limit", "1")
  const res = await request(`?${query.toString()}`, { method: "GET" })
  const rows: UserHR[] = await res.json()
  return rows[0] ?? null
}

export async function getUserById(id: number): Promise<UserHR | null> {
  const query = new URLSearchParams()
  query.set("select", "id,created_at,Name,Email,Access_Type,Last_Activity")
  query.set("id", `eq.${id}`)
  query.set("limit", "1")
  const res = await request(`?${query.toString()}`, { method: "GET" })
  const rows: UserHR[] = await res.json()
  return rows[0] ?? null
}

export async function listUsers(): Promise<UserHR[]> {
  const query = new URLSearchParams()
  query.set("select", "id,created_at,Name,Email,Access_Type,Last_Activity")
  query.set("order", "created_at.asc")
  const res = await request(`?${query.toString()}`, { method: "GET" })
  return res.json()
}

export interface CreateUserInput {
  name: string
  email: string
  accessType: string
  password: string
}

export async function createUser(input: CreateUserInput): Promise<UserHR> {
  const res = await request(`?${new URLSearchParams({ select: "*" })}`, {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      Name: input.name,
      Email: input.email,
      Access_Type: input.accessType,
      Password: input.password,
      Last_Activity: new Date().toISOString(),
    }),
  })
  const rows: UserHR[] = await res.json()
  return rows[0]
}

export interface UpdateUserInput {
  name?: string
  email?: string
  accessType?: string
  password?: string
}

export async function updateUser(id: number, input: UpdateUserInput): Promise<UserHR | null> {
  const patch: Record<string, string> = {}
  if (input.name !== undefined) patch.Name = input.name
  if (input.email !== undefined) patch.Email = input.email
  if (input.accessType !== undefined) patch.Access_Type = input.accessType
  if (input.password !== undefined && input.password !== "") patch.Password = input.password
  if (Object.keys(patch).length === 0) return null
  const query = new URLSearchParams()
  query.set("id", `eq.${id}`)
  const res = await request(`?${query.toString()}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(patch),
  })
  const rows: UserHR[] = await res.json()
  return rows[0] ?? null
}

export async function deleteUser(id: number): Promise<void> {
  const query = new URLSearchParams()
  query.set("id", `eq.${id}`)
  await request(`?${query.toString()}`, { method: "DELETE" })
}

export async function touchActivity(id: number): Promise<void> {
  const query = new URLSearchParams()
  query.set("id", `eq.${id}`)
  await request(`?${query.toString()}`, {
    method: "PATCH",
    body: JSON.stringify({ Last_Activity: new Date().toISOString() }),
  })
}
