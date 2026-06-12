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
import { Home, Workflow, MessageCircle, Key, Sparkles, AlertCircle, Calendar as CalendarIcon, PhoneCall } from "lucide-react"
import { useState, useEffect, ReactNode } from "react"
import { PageHeader } from "@/components/page-header"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"
import { ReportIssueModal } from "@/components/campaigns/report-issue-modal"
import { PageTransition } from "@/components/animations/page-transition"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"

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
    {
      href: "/call-analysis",
      label: "Call Analysis",
      icon: <PhoneCall className="size-6" />,
      description: "Automated Call Results",
    },
  ]

  return (
    <>
      <SidebarMenu className="gap-2.5 px-2 group-data-[state=collapsed]:px-0 group-data-[state=collapsed]:items-center">
        {items.map((item) => (
          <SidebarMenuItem key={item.href}>
            <Link href={item.href} className="w-full">
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                className={cn(
                  "w-full h-auto py-3.5 px-4 rounded-2xl transition-all duration-300 border border-transparent mb-1",
                  "group-data-[state=collapsed]:justify-center group-data-[state=collapsed]:py-3 group-data-[state=collapsed]:w-10! group-data-[state=collapsed]:p-0!",
                  pathname === item.href
                    ? "bg-primary/10 border-primary/20 text-foreground shadow-xs"
                    : "hover:bg-muted/40 text-foreground/60 hover:text-foreground",
                )}
              >
                <span className="flex items-center gap-4 w-full group-data-[state=collapsed]:justify-center">
                  <div
                    className={cn(
                      "transition-all duration-300 shrink-0 size-9 rounded-xl flex items-center justify-center",
                      pathname === item.href
                        ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105"
                        : "bg-muted/50 text-foreground/40 group-hover:bg-muted group-hover:text-foreground",
                    )}
                  >
                    {item.icon}
                  </div>
                  <div className="flex-1 overflow-hidden group-data-[state=collapsed]:hidden">
                    <div className="font-bold text-[14px] leading-tight truncate">
                      {item.label}
                    </div>
                    <div className="text-[10px] text-muted-foreground/50 font-bold opacity-80 mt-0.5 truncate uppercase tracking-widest">
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
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!loading && !user) {
      router.push("/sign-in")
    }
  }, [user, loading, router])

  if (loading || (!user && mounted)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground font-medium animate-pulse">Verifying Session...</p>
        </div>
      </div>
    )
  }

  if (!user && mounted) return null

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "19rem",
          "--sidebar-width-mobile": "20rem",
        } as React.CSSProperties
      }
    >
      <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar transition-colors duration-300">
        <SidebarHeader className="py-8 px-4 group-data-[state=collapsed]:px-0 overflow-hidden items-center">
          <Link href="/" className="flex flex-col items-center justify-center gap-4 hover:opacity-90 transition-opacity w-full">
            {/* ZV Steels Logo - Centered & Bigger */}
            <div className="flex flex-col items-center gap-1.5 w-full">
              <div className="relative h-20 w-40 group-data-[state=collapsed]:h-8 group-data-[state=collapsed]:w-8 transition-all">
                <Image
                  src="https://zvsteels.com/assets/img/zv_logo.png"
                  alt="ZV Steels Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            <div className="group-data-[state=collapsed]:hidden flex flex-col items-center gap-1.5 opacity-40 hover:opacity-100 transition-opacity">
              <span className="text-[8px] font-black uppercase tracking-[0.4em] text-muted-foreground leading-none text-center">
                Powered By
              </span>
              <div className="relative h-8 w-28">
                <Image
                  src="/images/scalepods-logo.avif"
                  alt="Scalepods Logo"
                  fill
                  className="object-contain invert dark:invert-0"
                />
              </div>
            </div>
          </Link>
        </SidebarHeader>

        <SidebarSeparator className="bg-border/50" />

        <SidebarContent className="py-4">
          <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 px-6 py-4 font-bold">
              Navigation
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <NavItems />
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-border/50 p-2 group-data-[state=collapsed]:px-0 group-data-[state=collapsed]:items-center">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setIsReportModalOpen(true)}
                className="w-full h-11 px-4 hover:bg-destructive/10 text-muted-foreground hover:text-destructive group transition-colors group-data-[state=collapsed]:justify-center group-data-[state=collapsed]:w-10! group-data-[state=collapsed]:p-0!"
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
          <div className="flex h-16 items-center gap-2 md:gap-4 px-4 md:px-8">
            <SidebarTrigger className="hover:bg-accent shrink-0 p-2 size-10" />
            <div className="flex-1 min-w-0">
              <PageHeader />
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-4 overflow-auto">
          <PageTransition key={pathname}>
            {children}
          </PageTransition>
        </main>
        <ReportIssueModal open={isReportModalOpen} onOpenChange={setIsReportModalOpen} />
      </SidebarInset>
    </SidebarProvider>
  )
}
