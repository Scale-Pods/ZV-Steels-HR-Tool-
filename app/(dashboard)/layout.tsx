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
import type { ReactNode } from "react"
import { PageHeader } from "@/components/page-header"
import { ThemeToggle } from "@/components/theme-toggle"
import { Toaster } from "sonner"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { ReportIssueModal } from "@/components/campaigns/report-issue-modal"

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
      href: "/whatsapp-chat",
      label: "Messages",
      icon: <MessageCircle className="size-6" />,
      description: "View Conversations",
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
                <span className="flex items-center gap-5 w-full">
                  <span
                    className={cn(
                      "transition-colors",
                      pathname === item.href ? "text-violet-500" : "text-muted-foreground",
                    )}
                  >
                    {item.icon}
                  </span>
                  <span className="flex-1">
                    <div className="font-bold text-[17px] leading-tight active:scale-95 transition-transform">
                      {item.label}
                    </div>
                    <div className="text-[13px] text-muted-foreground font-medium group-data-[state=collapsed]:hidden opacity-70 mt-0.5">
                      {item.description}
                    </div>
                  </span>
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
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "19rem",
          "--sidebar-width-mobile": "20rem",
        } as React.CSSProperties
      }
    >
      <Toaster position="top-right" closeButton richColors />
      <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar transition-colors duration-300">
        <SidebarHeader className="pt-10 pb-4 px-6">
          <Link href="/" className="flex flex-col items-center gap-4 hover:opacity-80 transition-opacity group-data-[state=collapsed]:items-center">
            <div className="relative h-20 w-full shrink-0 group-data-[state=collapsed]:h-12 group-data-[state=collapsed]:w-12">
              <Image
                src="https://zvsteels.com/assets/img/zv_logo.png"
                alt="ZV Steels Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="group-data-[state=collapsed]:hidden flex flex-col items-center">
              <span className="text-[7px] font-black uppercase tracking-[0.4em] text-muted-foreground/30 leading-none mb-2">
                Powered By
              </span>
              <div className="relative h-10 w-44">
                <Image
                  src="/images/scalepods-logo.avif"
                  alt="Scalepods Logo"
                  fill
                  className="object-contain scale-[2.2] invert dark:invert-0 transition-all duration-300"
                />
              </div>
            </div>
          </Link>
        </SidebarHeader>

        <SidebarSeparator className="bg-border/10" />

        <SidebarContent className="py-10">
          <SidebarGroup>
            <SidebarGroupLabel className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground/40 w-full justify-center mb-10 font-black">
              Main Menu
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <NavItems />
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-border/10 p-4 space-y-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setIsReportModalOpen(true)}
                className="w-full h-11 px-4 hover:bg-muted/20 text-muted-foreground hover:text-foreground"
              >
                <div className="flex items-center gap-4 w-full">
                  <AlertCircle className="size-5 text-red-500" />
                  <span className="font-bold text-[15px]">Report an Issue</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <div className="flex items-center justify-between w-full h-11 px-4 rounded-lg hover:bg-muted/10 transition-colors">
                <div className="flex items-center gap-4">
                  <ThemeToggle />
                  <span className="text-sm font-semibold text-muted-foreground group-data-[state=collapsed]:hidden tracking-tight">
                    Toggle Theme
                  </span>
                </div>
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      <SidebarInset className="min-h-svh bg-background">
        <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
          <div className="flex h-16 items-center gap-4 px-6">
            <SidebarTrigger className="hover:bg-accent shrink-0 p-2 size-10" />
            <PageHeader />
          </div>
        </header>

        <main className="p-10">{children}</main>
        <ReportIssueModal open={isReportModalOpen} onOpenChange={setIsReportModalOpen} />
      </SidebarInset>
    </SidebarProvider>
  )
}
