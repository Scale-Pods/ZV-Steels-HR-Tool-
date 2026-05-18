"use client"

import { usePathname } from "next/navigation"
import { UserNav } from "@/components/profile/user-nav"
import { ThemeToggle } from "@/components/theme-toggle"

function titleForPath(path: string) {
  if (path.startsWith("/exhibitions/campaign/")) return "Campaign Details"
  
  switch (path) {
    case "/dashboard":
    case "/":
      return "Dashboard"
    case "/setup-credentials":
      return "Setup Credentials"
    case "/manage-campaigns":
      return "Manage Campaigns"
    case "/meetings":
      return "Meetings"
    case "/call-analysis":
      return "Call Analysis"
    default:
      return "HR Pipeline"
  }
}

import { useState, useEffect } from "react"

export function PageHeader() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const title = titleForPath(pathname)

  return (
    <div className="flex w-full items-center justify-between px-0 md:px-4 h-16 gap-2">
      <h1 className="text-lg md:text-xl font-bold tracking-tight text-foreground truncate">
        {title}
      </h1>
      <div className="flex items-center gap-2 md:gap-4 shrink-0">
        <ThemeToggle />
        <UserNav />
      </div>
    </div>
  )
}
