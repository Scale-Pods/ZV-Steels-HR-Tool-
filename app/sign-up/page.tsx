"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Users } from "lucide-react"
import { SignUpForm } from "@/components/auth/sign-up-form"
import { GoogleOAuthButton } from "@/components/auth/oauth-buttons"

export const dynamic = "force-dynamic"

export default function SignUpPage() {

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
          <p className="text-sm text-white/60">© 2026 HR Pipeline. All rights reserved.</p>
        </div>
      </div>

      {/* Right side - Mock Sign Up */}
      <div className="flex items-center justify-center p-6 lg:p-12 bg-background">
          <div className="space-y-4">
            <h1 className="text-2xl font-bold tracking-tight">Create an account</h1>
            <p className="text-sm text-muted-foreground">
              Enter your details to get started with HR Pipeline
            </p>
          </div>

          <div className="mt-8 space-y-6 text-left">
            <SignUpForm />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <GoogleOAuthButton />
          </div>

          <div className="mt-8 text-center text-sm">
            <p className="text-muted-foreground">
              Already have an account?{" "}
              <Link href="/sign-in" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>
      </div>
    </div>
  )
}
