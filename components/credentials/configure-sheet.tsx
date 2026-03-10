"use client"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

type Field = { name: string; label: string; type: "password" | "text" }

export function ConfigureSheet({
  open,
  onOpenChange,
  serviceKey,
  serviceName,
  docsUrl,
  fields,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  serviceKey: string
  serviceName: string
  docsUrl: string
  fields: Field[]
  onSaved: () => void
}) {
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [values, setValues] = useState<Record<string, string>>({})

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service: serviceKey,
          credentials: values,
        }),
      })
      if (!res.ok) throw new Error("Failed to save")
      toast({ title: "Credentials saved", description: `${serviceName} connected successfully.` })
      onSaved()
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Connect {serviceName}</SheetTitle>
          <SheetDescription>
            Enter your API credentials to connect {serviceName} to your automation workflow.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4 space-y-4">
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            {fields.map((f) => (
              <div key={f.name} className="grid gap-2">
                <Label htmlFor={f.name}>{f.label}</Label>
                <Input
                  id={f.name}
                  type={f.type}
                  placeholder={f.label}
                  value={values[f.name] ?? ""}
                  onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
                />
              </div>
            ))}
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Credentials"}
              </Button>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  )
}
