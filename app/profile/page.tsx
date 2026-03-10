"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { KeyRound, Workflow, User2, ArrowRight } from "lucide-react"
import { SignOutButton } from "@/components/profile/sign-out-button"

export const dynamic = "force-dynamic"

export default function ProfilePage() {
  // Mock user data (Clerk removed)
  const user = {
    id: "guest-user",
    emailAddresses: [{ emailAddress: "guest@example.com" }],
    firstName: "Guest",
    lastName: "User",
  }

  const credentials: any[] = []
  const campaigns: any[] = []

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* User Info */}
      <Card className="border-2">
        <CardHeader className="flex flex-row items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600">
            <User2 className="size-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl">Your Profile</CardTitle>
            <CardDescription className="text-pretty">Account details and your current connections</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Email</div>
            <div className="font-medium">{user.emailAddresses[0]?.emailAddress}</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">User ID</div>
            <div className="font-mono text-sm">{user.id}</div>
          </div>
          {(user.firstName || user.lastName) && (
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Name</div>
              <div className="font-medium">{`${user.firstName || ""} ${user.lastName || ""}`.trim()}</div>
            </div>
          )}
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Connections</div>
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-600 text-white">{credentials.length} Connected</Badge>
              <Badge variant="outline">{campaigns.length} Campaigns</Badge>
            </div>
          </div>
          <div className="md:col-span-2 mt-2 flex flex-wrap gap-2">
            <Link href="/setup-credentials">
              <Button variant="outline" className="gap-2 bg-transparent">
                <KeyRound className="size-4" />
                Manage Credentials
              </Button>
            </Link>
            <Link href="/manage-campaigns">
              <Button variant="outline" className="gap-2 bg-transparent">
                <Workflow className="size-4" />
                Manage Campaigns
              </Button>
            </Link>
            <SignOutButton className="ml-auto" />
          </div>
        </CardContent>
      </Card>

      {/* Connected Credentials */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Connected Credentials</CardTitle>
          <CardDescription>Services you've connected. Secrets are never displayed.</CardDescription>
        </CardHeader>
        <CardContent>
          {credentials.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No credentials connected yet.{" "}
              <Link href="/setup-credentials" className="underline underline-offset-4">
                Connect now
              </Link>
              .
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {credentials.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between rounded-md border p-3 transition-all hover:shadow-sm"
                >
                  <div className="grid">
                    <span className="font-medium">{c.node_key}</span>
                    <span className="text-xs text-muted-foreground">{c.label || "No label"}</span>
                  </div>
                  <span className="text-xs rounded bg-emerald-600/10 text-emerald-600 px-2 py-1">Connected</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Campaigns */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Campaigns</CardTitle>
          <CardDescription>Recent campaigns you've created</CardDescription>
        </CardHeader>
        <CardContent>
          {campaigns.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No campaigns yet.{" "}
              <Link href="/manage-campaigns" className="underline underline-offset-4">
                Create your first campaign
              </Link>
              .
            </div>
          ) : (
            <div className="grid gap-3">
              {campaigns.map((k) => (
                <div
                  key={k.id}
                  className="flex items-center justify-between rounded-md border p-3 transition-all hover:shadow-sm"
                >
                  <div className="grid">
                    <span className="font-medium">{k.name ?? `Campaign ${k.id.slice(0, 6)}`}</span>
                    <span className="text-xs text-muted-foreground">
                      Created {new Date(k.created_at as any).toLocaleString()}
                    </span>
                  </div>
                  <Link
                    href="/manage-campaigns"
                    className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                  >
                    Open <ArrowRight className="size-4" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
