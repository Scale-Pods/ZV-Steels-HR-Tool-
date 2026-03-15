import Link from "next/link"
import Image from "next/image"
import { SignInForm } from "@/components/auth/sign-in-form"

export const dynamic = "force-dynamic"

export default function SignInPage() {
  return (
    <div className="min-h-svh grid lg:grid-cols-2">
      {/* Left side - Testimonial/Hero */}
      <div className="hidden lg:flex relative bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 p-12 items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('/office-team-collaboration.png')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-slate-900/80 to-transparent" />

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
      </div>

      {/* Right side - Sign In */}
      <div className="flex items-center justify-center p-6 lg:p-12 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link
            href="/"
            className="lg:hidden flex items-center justify-center gap-3 mb-8 hover:opacity-80 transition-opacity"
          >
            <div className="flex items-center justify-center size-10 rounded-xl bg-primary">
              <span className="text-xl font-bold text-primary-foreground">H</span>
            </div>
            <span className="text-xl font-bold">HR Pipeline</span>
          </Link>

          <div className="space-y-4">
            <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
            <p className="text-sm text-muted-foreground">
              Enter your credentials to access your HR dashboard
            </p>
          </div>

          <div className="mt-8 space-y-6">
            <SignInForm />
          </div>
        </div>
      </div>
    </div>
  )
}
