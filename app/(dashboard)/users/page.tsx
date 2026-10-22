"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2, Pencil, Trash2, UserPlus } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"

interface UserRow {
  id: number
  created_at: string
  Name: string | null
  Email: string | null
  Access_Type: string | null
  Last_Activity: string | null
}

const emptyForm = { name: "", email: "", accessType: "interviewer", password: "" }

function formatDate(value: string | null): string {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

export default function UserActivityPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  const [users, setUsers] = useState<UserRow[]>([])
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState("")

  const [dialogOpen, setDialogOpen] = useState(false)
  const [mode, setMode] = useState<"create" | "edit">("create")
  const [editing, setEditing] = useState<UserRow | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null)
  const [deleting, setDeleting] = useState(false)

  const isAdmin = user?.accessType === "admin"

  const loadUsers = useCallback(async () => {
    setFetching(true)
    setError("")
    try {
      const res = await fetch("/api/users", { cache: "no-store" })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || "Failed to load users")
      }
      setUsers(data.users || [])
    } catch (err: any) {
      setError(err.message || "Failed to load users")
    } finally {
      setFetching(false)
    }
  }, [])

  useEffect(() => {
    if (!loading && !user) router.replace("/sign-in")
    if (!loading && user && user.accessType !== "admin") router.replace("/dashboard")
  }, [loading, user, router])

  useEffect(() => {
    if (isAdmin) loadUsers()
  }, [isAdmin, loadUsers])

  const openCreate = () => {
    setMode("create")
    setEditing(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const openEdit = (row: UserRow) => {
    setMode("edit")
    setEditing(row)
    setForm({
      name: row.Name || "",
      email: row.Email || "",
      accessType: (row.Access_Type || "interviewer").toLowerCase(),
      password: "",
    })
    setDialogOpen(true)
  }

  const save = async () => {
    setSaving(true)
    try {
      const isEdit = mode === "edit" && editing
      const body: Record<string, string> = {
        name: form.name,
        email: form.email,
        accessType: form.accessType,
      }
      if (form.password) body.password = form.password

      const res = await fetch(isEdit ? `/api/users/${editing.id}` : "/api/users", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data.error || "Failed to save user")
        return
      }
      toast.success(isEdit ? "User updated" : "User created")
      setDialogOpen(false)
      await loadUsers()
    } catch {
      toast.error("Failed to save user")
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/users/${deleteTarget.id}`, { method: "DELETE" })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data.error || "Failed to delete user")
        return
      }
      toast.success("User deleted")
      setDeleteTarget(null)
      await loadUsers()
    } catch {
      toast.error("Failed to delete user")
    } finally {
      setDeleting(false)
    }
  }

  if (loading || !isAdmin) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Card className="border-2">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl">User Activity</CardTitle>
            <CardDescription>
              Accounts, access types and last activity across the team
            </CardDescription>
          </div>
          <Button className="gap-2" onClick={openCreate}>
            <UserPlus className="size-4" />
            Add User
          </Button>
        </CardHeader>
        <CardContent>
          {fetching ? (
            <div className="flex justify-center py-12">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="py-12 text-center text-sm text-destructive">{error}</div>
          ) : users.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">No users found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Access</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.Name || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{row.Email || "—"}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "capitalize",
                          (row.Access_Type || "").toLowerCase() === "admin"
                            ? "border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                            : "border-sky-500/40 bg-sky-500/10 text-sky-600 dark:text-sky-400",
                        )}
                      >
                        {row.Access_Type || "—"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(row.Last_Activity)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(row.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          onClick={() => openEdit(row)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-destructive hover:text-destructive"
                          onClick={() => setDeleteTarget(row)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{mode === "create" ? "Add User" : "Edit User"}</DialogTitle>
            <DialogDescription>
              {mode === "create"
                ? "Create a new account with an access type."
                : "Update account details. Leave password blank to keep the current one."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Full name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="name@company.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder={mode === "edit" ? "Leave blank to keep current" : "Password"}
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Access Type</label>
              <div className="grid grid-cols-2 gap-2">
                {(["admin", "interviewer"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setForm({ ...form, accessType: type })}
                    className={cn(
                      "h-10 rounded-lg border text-sm font-medium capitalize transition-colors",
                      form.accessType === type
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:bg-muted/40",
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
              {mode === "create" ? "Create User" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove{" "}
              <span className="font-medium text-foreground">
                {deleteTarget?.Name || deleteTarget?.Email}
              </span>{" "}
              and their access to the dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                remove()
              }}
              disabled={deleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deleting && <Loader2 className="mr-2 size-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
