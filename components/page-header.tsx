"use client"

import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"

function titleForPath(path: string) {
  switch (path) {
    case "/":
      return "Dashboard"
    case "/setup-credentials":
      return "Setup Credentials"
    case "/manage-campaigns":
      return "Manage Campaigns"
    default:
      return "ZV Steels"
  }
}

export function PageHeader() {
  const pathname = usePathname()
  const title = titleForPath(pathname)

  return (
    <div className="flex w-full items-center justify-between">
      <h1 className="text-pretty text-lg font-semibold">{title}</h1>
      <Button variant="outline" className="gap-2 bg-transparent" asChild>
        <Link href="/profile" aria-label="Open profile">
          <Image src="/placeholder-user.jpg" width={20} height={20} alt="" className="rounded-full" />
          <span className="hidden sm:inline">Account</span>
        </Link>
      </Button>
    </div>
  )
}
