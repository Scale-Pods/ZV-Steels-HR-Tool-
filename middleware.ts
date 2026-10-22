import { NextRequest, NextResponse } from "next/server"
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session"

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/manage-campaigns",
  "/meetings",
  "/call-analysis",
  "/exhibitions",
  "/setup-credentials",
  "/whatsapp-chat",
  "/profile",
  "/users",
]

const ADMIN_ONLY_PREFIXES = ["/users"]

function matches(pathname: string, prefixes: string[]): boolean {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (!matches(pathname, PROTECTED_PREFIXES)) {
    return NextResponse.next()
  }

  const session = await verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value)
  if (!session) {
    const url = req.nextUrl.clone()
    url.pathname = "/sign-in"
    url.search = ""
    return NextResponse.redirect(url)
  }

  if (matches(pathname, ADMIN_ONLY_PREFIXES) && session.accessType !== "admin") {
    const url = req.nextUrl.clone()
    url.pathname = "/dashboard"
    url.search = ""
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/manage-campaigns/:path*",
    "/meetings/:path*",
    "/call-analysis/:path*",
    "/exhibitions/:path*",
    "/setup-credentials/:path*",
    "/whatsapp-chat/:path*",
    "/profile/:path*",
    "/users/:path*",
  ],
}
