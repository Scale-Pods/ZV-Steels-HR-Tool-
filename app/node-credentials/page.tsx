import type { Metadata } from "next"
import { CredentialsForm } from "@/components/node-credentials/credentials-form"

export const metadata: Metadata = {
  title: "Node Credentials",
  description: "Securely store per-node credentials",
}

export const dynamic = "force-dynamic"

export default async function NodeCredentialsPage() {
  return (
    <main className="container mx-auto max-w-3xl p-6">
      <h1 className="mb-4 text-2xl font-semibold tracking-tight">Node Credentials</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Add credentials for each node. Values are encrypted at rest and protected with row-level security.
      </p>
      <CredentialsForm />
    </main>
  )
}
