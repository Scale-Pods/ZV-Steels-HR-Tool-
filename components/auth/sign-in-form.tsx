"use client"

import Link from "next/link"

export function SignInForm() {
  return (
    <div className="space-y-5 text-center p-6 border rounded-lg bg-card">
      <h3 className="text-xl font-bold">Sign In</h3>
      <p className="text-muted-foreground">Authentication is currently disabled.</p>
      <Link href="/dashboard" className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md">
        Go to Dashboard
      </Link>
    </div>
  )
}
