"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

export function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[280px] sm:w-[320px]">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription>Navigate to different sections</SheetDescription>
        </SheetHeader>
        <nav className="flex flex-col gap-4 mt-6">
          <Link
            href="/dashboard"
            className="text-foreground hover:text-accent font-medium py-2 px-3 rounded-md hover:bg-accent/10 transition-colors"
            onClick={() => setOpen(false)}
          >
            Dashboard
          </Link>
          <Link
            href="/setup-credentials"
            className="text-foreground hover:text-accent font-medium py-2 px-3 rounded-md hover:bg-accent/10 transition-colors"
            onClick={() => setOpen(false)}
          >
            Credentials
          </Link>
          <Link
            href="/manage-campaigns"
            className="text-foreground hover:text-accent font-medium py-2 px-3 rounded-md hover:bg-accent/10 transition-colors"
            onClick={() => setOpen(false)}
          >
            Campaigns
          </Link>
          <div className="flex flex-col gap-2 mt-4 pt-4 border-t">
            <Link href="/sign-in" onClick={() => setOpen(false)}>
              <Button variant="default" className="w-full">
                Sign In
              </Button>
            </Link>
            <Link href="/setup-credentials" onClick={() => setOpen(false)}>
              <Button variant="outline" className="w-full bg-transparent">
                Get Started
              </Button>
            </Link>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  )
}
