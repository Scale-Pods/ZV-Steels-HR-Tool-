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
import { Toaster } from "sonner"
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
      <SidebarMenu className="gap-2.5 px-2">
        {items.map((item) => (
          <SidebarMenuItem key={item.href}>
            <Link href={item.href} className="w-full">
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                className={cn(
                  "w-full h-auto py-3.5 px-4 rounded-xl transition-all duration-200",
                  "group-data-[state=collapsed]:justify-center group-data-[state=collapsed]:px-0 group-data-[state=collapsed]:py-3",
                  pathname === item.href
                    ? "bg-muted/50 text-foreground"
                    : "hover:bg-muted/30 text-foreground/70 hover:text-foreground",
                )}
              >
                <span className="flex items-center gap-4 w-full group-data-[state=collapsed]:justify-center">
                  <span
                    className={cn(
                      "transition-colors shrink-0",
                      pathname === item.href
                        ? "text-primary"
                        : "text-foreground/60 group-hover:text-foreground",
                    )}
                  >
                    {item.icon}
                  </span>
                  <div className="flex-1 overflow-hidden group-data-[state=collapsed]:hidden">
                    <div className="font-semibold text-[15px] leading-tight truncate">
                      {item.label}
                    </div>
                    <div className="text-[11px] text-muted-foreground font-medium opacity-60 mt-0.5 truncate uppercase tracking-wider">
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
      {mounted && <Toaster position="top-right" closeButton richColors />}
      <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar transition-colors duration-300">
        <SidebarHeader className="py-8 px-4 group-data-[state=collapsed]:px-0 overflow-hidden">
          <Link href="/" className="flex flex-col items-center justify-center gap-4 hover:opacity-90 transition-opacity">
            {/* ZV Steels Logo - Centered & Bigger */}
            <div className="flex flex-col items-center gap-1.5">
              <div className="relative h-20 w-40 group-data-[state=collapsed]:h-8 group-data-[state=collapsed]:w-10 transition-all">
                <Image
                  src="https://zvsteels.com/assets/img/zv_logo.png"
                  alt="ZV Steels Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <span className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 whitespace-nowrap group-data-[state=collapsed]:hidden">
                ZV Steels Pvt. Ltd.
              </span>
            </div>

            {/* Powered By & ScalePods - Centered & Bigger */}
            <div className="group-data-[state=collapsed]:hidden flex flex-col items-center gap-2">
              <div className="flex items-center gap-3 w-full opacity-60">
                <div className="h-px w-8 bg-border/30" />
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground/30 leading-none text-center">
                  Powered By
                </span>
                <div className="h-px w-8 bg-border/30" />
              </div>
              
              <div className="relative h-14 w-44">
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

        <SidebarSeparator className="bg-border/10" />

        <SidebarContent className="py-4">
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
