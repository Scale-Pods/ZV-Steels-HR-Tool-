"use client"

import { InfinityLoop } from "@/components/ui/infinity";
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
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"
import { Home, Workflow, MessageCircle, Key, Sparkles, AlertCircle, Calendar as CalendarIcon, PhoneCall, Users } from "lucide-react"
import { useState, useEffect, useRef, ReactNode } from "react"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserNav } from "@/components/profile/user-nav"
import { cn } from "@/lib/utils"
import { ReportIssueModal } from "@/components/campaigns/report-issue-modal"
import { PageTransition } from "@/components/animations/page-transition"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"

function NavItems() {
  const pathname = usePathname()
  const { user } = useAuth()
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
    ...(user?.accessType === "admin"
      ? [
          {
            href: "/users",
            label: "User Activity",
            icon: <Users className="size-6" />,
            description: "Admin · Access & Logs",
          },
        ]
      : []),
  ]

  return (
    <>
      <SidebarMenu className="gap-2 px-2 group-data-[state=collapsed]:px-0 group-data-[state=collapsed]:items-center">
        {items.map((item) => (
          <SidebarMenuItem key={item.href}>
            <Link href={item.href} className="w-full">
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                className={cn(
                  "w-full h-auto py-3 px-4 rounded-2xl transition-all duration-300 border border-transparent mb-1",
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
  const scrollRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  // Fade the scrollbar out when idle, show it only while scrolling
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    let timer: ReturnType<typeof setTimeout> | undefined
    const onScroll = () => {
      el.dataset.scrolling = "true"
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        el.dataset.scrolling = "false"
      }, 700)
    }
    el.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      el.removeEventListener("scroll", onScroll)
      if (timer) clearTimeout(timer)
    }
  }, [user])

  useEffect(() => {
    if (!loading && !user) {
      router.push("/sign-in")
    }
  }, [user, loading, router])

  if (loading || (!user && mounted)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <InfinityLoop className="size-12 text-primary" />
          <p className="text-muted-foreground font-medium animate-pulse">Verifying Session...</p>
        </div>
      </div>
    )
  }

  if (!user && mounted) return null

  return (
    <SidebarProvider
      className="bg-[#e5e7eb] dark:bg-[#1e1e1e]"
      style={
        {
          "--sidebar-width": "19rem",
          "--sidebar-width-mobile": "20rem",
        } as React.CSSProperties
      }
    >
      <Sidebar collapsible="icon" variant="floating" className="transition-colors duration-300 left-3 top-3 bottom-3 p-3">
        <SidebarHeader className="py-5 px-4 group-data-[state=collapsed]:px-0 overflow-hidden items-center">
          <Link href="/" className="flex flex-col items-center justify-center gap-3 hover:opacity-90 transition-opacity w-full">
            {/* ZV Steels Logo - Centered & Bigger */}
            <div className="flex flex-col items-center gap-1.5 w-full">
              <div className="relative h-14 w-28 group-data-[state=collapsed]:h-8 group-data-[state=collapsed]:w-8 transition-all">
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

        <SidebarContent className="py-3">
          <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 px-6 py-2 font-bold">
              Navigation
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <NavItems />
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-border/50 p-3 gap-3 group-data-[state=collapsed]:px-2 group-data-[state=collapsed]:items-center">
          <div className="flex w-full items-center justify-between gap-2 group-data-[state=collapsed]:flex-col-reverse group-data-[state=collapsed]:justify-center">
            <UserNav />
            <ThemeToggle />
          </div>
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
      </Sidebar>

      <SidebarInset className="h-svh flex flex-col overflow-hidden">
        <div className="flex-1 min-h-0 p-6 overflow-hidden">
          <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm">
            <div ref={scrollRef} data-scrolling="false" className="scroll-sleek flex-1 min-h-0 overflow-auto p-3 md:p-5">
              <PageTransition key={pathname}>
                {children}
              </PageTransition>
            </div>
          </div>
        </div>
        <ReportIssueModal open={isReportModalOpen} onOpenChange={setIsReportModalOpen} />
      </SidebarInset>
    </SidebarProvider>
  )
}
