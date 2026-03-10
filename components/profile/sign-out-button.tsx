"use client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export function SignOutButton({ className }: { className?: string }) {
  const router = useRouter()

  const onSignOut = async () => {
    router.push("/sign-in")
  }

  return (
    <Button onClick={onSignOut} variant="destructive" className={className + " gap-2"}>
      <LogOut className="size-4" />
      Logout
    </Button>
  )
}
