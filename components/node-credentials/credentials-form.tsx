"use client"

import * as React from "react"
import useSWR from "swr"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const schema = z.object({
  nodeKey: z.string().min(1, "Node key is required"),
  label: z.string().optional(),
  credentialsText: z.string().min(2, "Credentials JSON is required"),
})

export function CredentialsForm() {
  const { data, mutate, isLoading } = useSWR<{ data: any[] }>("/api/node-credentials", fetcher)
  const [nodeKey, setNodeKey] = React.useState("")
  const [label, setLabel] = React.useState("")
  const [credentialsText, setCredentialsText] = React.useState('{\n  "apiKey": "..."\n}')
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    const parsed = schema.safeParse({ nodeKey, label, credentialsText })
    if (!parsed.success) {
      setError(parsed.error.errors.map((e) => e.message).join(", "))
      return
    }

    let creds: any
    try {
      creds = JSON.parse(credentialsText)
    } catch {
      setError("Credentials must be valid JSON")
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/node-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodeKey, label, credentials: creds }),
      })
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json?.error || "Failed to store credentials")
      }
      setSuccess("Connected successfully")
      setNodeKey("")
      setLabel("")
      setCredentialsText('{\n  "apiKey": "..."\n}')
      mutate()
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-pretty">Store Node Credentials</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="nodeKey">Node key</Label>
              <Input
                id="nodeKey"
                placeholder="e.g. whatsapp"
                value={nodeKey}
                onChange={(e) => setNodeKey(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="label">Label (optional)</Label>
              <Input
                id="label"
                placeholder="e.g. Primary WhatsApp node"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="credentials">Credentials JSON</Label>
              <Textarea
                id="credentials"
                className="font-mono"
                rows={8}
                value={credentialsText}
                onChange={(e) => setCredentialsText(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Paste only non-secret placeholders here for demo. Real values will be encrypted server-side and never
                returned.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Save credentials"}
              </Button>
              {error && <span className="text-sm text-destructive">{error}</span>}
              {success && <span className="text-sm text-green-600">{success}</span>}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-pretty">Stored Credentials</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : (data?.data?.length ?? 0) === 0 ? (
            <div className="text-sm text-muted-foreground">No credentials stored yet.</div>
          ) : (
            <div className="grid gap-3">
              {data?.data?.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-md border p-3">
                  <div className="grid">
                    <span className="font-medium">{item.node_key}</span>
                    <span className="text-xs text-muted-foreground">{item.label || "No label"}</span>
                  </div>
                  <span className="text-xs rounded bg-emerald-600/10 text-emerald-600 px-2 py-1">Connected</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
