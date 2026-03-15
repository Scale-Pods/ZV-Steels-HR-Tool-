"use client"

import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Users } from "lucide-react"
import { SignUpForm } from "@/components/auth/sign-up-form"

export const dynamic = "force-dynamic"

export default function SignUpPage() {

  return (
    <div className="min-h-svh grid lg:grid-cols-2">
      {/* Left side - Benefits/Hero */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(139,92,246,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.1),transparent_50%)]" />

        <div className="relative z-10 w-full h-full flex items-center justify-center">
          <Link href="/" className="flex flex-col items-center justify-center gap-3 hover:opacity-80 transition-opacity mt-[-10vh]">
            <div className="relative h-32 w-64 max-w-full">
              <Image
                src="https://zvsteels.com/assets/img/zv_logo.png"
                alt="ZV Steels Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>
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
          </div>
      </div>
    </div>
  )
}
