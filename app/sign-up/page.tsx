"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Users, TrendingUp, Shield } from "lucide-react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export const dynamic = "force-dynamic"

export default function SignUpPage() {
  const router = useRouter()

  useEffect(() => {
    // Simulated auto-login for guest
    const timer = setTimeout(() => {
      router.push("/dashboard")
    }, 2000)
    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-svh grid lg:grid-cols-2">
      {/* Left side - Benefits/Hero */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(139,92,246,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.1),transparent_50%)]" />

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="flex items-center justify-center size-12 rounded-xl bg-primary">
              <span className="text-2xl font-bold text-primary-foreground">H</span>
            </div>
            <span className="text-2xl font-bold">HR Pipeline</span>
          </Link>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <Badge className="mb-6 bg-primary/20 text-primary-foreground border-primary/30 backdrop-blur-sm">
              <Sparkles className="size-3 mr-2" />
              Trusted by 500+ Companies
            </Badge>
            <h1 className="text-4xl font-bold mb-4 leading-tight">Join the Future of HR Management</h1>
            <p className="text-lg text-white/80 leading-relaxed max-w-md">
              Streamline your recruitment process with AI-powered automation, intelligent candidate tracking, and
              data-driven insights.
            </p>
          </div>

          <div className="grid gap-4">
            <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="size-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                <Users className="size-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">10,000+ Candidates Tracked</h3>
                <p className="text-sm text-white/70">Manage your entire talent pipeline in one place</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-sm text-white/60">© {new Date().getFullYear()} HR Pipeline. All rights reserved.</p>
        </div>
      </div>

      {/* Right side - Mock Sign Up */}
      <div className="flex items-center justify-center p-6 lg:p-12 bg-background">
        <div className="w-full max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4">Creating your account...</h2>
          <p className="text-muted-foreground">Redirecting you to the dashboard.</p>
          <div className="mt-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
