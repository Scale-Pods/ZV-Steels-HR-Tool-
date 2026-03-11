"use client"

import Link from "next/link"
import Image from "next/image"
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"
import { Home, Workflow, MessageCircle, Key, Sparkles, AlertCircle, Calendar as CalendarIcon } from "lucide-react"
import { useState, useEffect, ReactNode } from "react"
import { PageHeader } from "@/components/page-header"
import { ThemeToggle } from "@/components/theme-toggle"
import { Toaster } from "sonner"
import { cn } from "@/lib/utils"
import { ReportIssueModal } from "@/components/campaigns/report-issue-modal"
import { PageTransition } from "@/components/animations/page-transition"

function NavItems() {
  const pathname = usePathname()
  const items = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: <Home className="size-6" />,
      description: "Overview & Analytics",
    },
    {
      href: "/manage-campaigns",
      label: "Campaigns",
      icon: <Workflow className="size-6" />,
      description: "Create & Manage",
    },
    {
      href: "/meetings",
      label: "Meetings",
      icon: <CalendarIcon className="size-6" />,
      description: "Interview Schedule",
    },
  ]

  return (
    <>
      <SidebarMenu className="gap-3 px-3">
        {items.map((item) => (
          <SidebarMenuItem key={item.href}>
            <Link href={item.href} className="w-full">
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                className={cn(
                  "w-full h-auto py-4 px-5 rounded-xl transition-all duration-200",
                  pathname === item.href
                    ? "bg-muted/50 text-foreground"
                    : "hover:bg-muted/20 text-muted-foreground hover:text-foreground",
                )}
              >
                <span className="flex items-center gap-4 w-full">
                  <span
                    className={cn(
                      "transition-colors shrink-0",
                      pathname === item.href ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    {item.icon}
                  </span>
                  <div className="flex-1 overflow-hidden">
                    <div className="font-semibold text-[15px] leading-tight truncate">
                      {item.label}
                    </div>
                    <div className="text-[11px] text-muted-foreground font-medium group-data-[state=collapsed]:hidden opacity-60 mt-0.5 truncate uppercase tracking-wider">
                      {item.description}
                    </div>
                  </div>
                </span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </>
  )
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "19rem",
          "--sidebar-width-mobile": "20rem",
        } as React.CSSProperties
      }
    >
      {mounted && <Toaster position="top-right" closeButton richColors />}
      <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar transition-colors duration-300">
        <SidebarHeader className="py-8 px-6">
          <Link href="/" className="flex flex-col items-center gap-6 hover:opacity-90 transition-opacity">
            <div className="relative h-16 w-32 shrink-0 group-data-[state=collapsed]:h-10 group-data-[state=collapsed]:w-10">
              <Image
                src="https://zvsteels.com/assets/img/zv_logo.png"
                alt="ZV Steels Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="group-data-[state=collapsed]:hidden flex flex-col items-center gap-1 opacity-40">
              <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
                Management System
              </span>
            </div>
          </Link>
        </SidebarHeader>

        <SidebarSeparator className="bg-border/10" />

        <SidebarContent className="py-2">
          <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/30 px-6 py-4 font-bold">
              Navigation
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <NavItems />
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-border/10 p-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setIsReportModalOpen(true)}
                className="w-full h-11 px-4 hover:bg-destructive/10 text-muted-foreground hover:text-destructive group transition-colors"
                tooltip="Report an Issue"
              >
                <div className="flex items-center gap-4">
                  <AlertCircle className="size-5 text-red-500/80 group-hover:text-red-500 transition-colors" />
                  <span className="font-bold text-[14px]">Report an Issue</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      <SidebarInset className="min-h-svh bg-background flex flex-col">
        <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
          <div className="flex h-16 items-center gap-4 px-8">
            <SidebarTrigger className="hover:bg-accent shrink-0 p-2 size-10" />
            <PageHeader />
          </div>
        </header>

        <main className="flex-1 p-8 overflow-auto">
          <PageTransition key={pathname}>
            {children}
          </PageTransition>
        </main>
        <ReportIssueModal open={isReportModalOpen} onOpenChange={setIsReportModalOpen} />
      </SidebarInset>
    </SidebarProvider>
  )
}
