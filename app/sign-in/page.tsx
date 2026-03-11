import Link from "next/link"
import { SignInForm } from "@/components/auth/sign-in-form"
import { GoogleOAuthButton } from "@/components/auth/oauth-buttons"

export const dynamic = "force-dynamic"

export default function SignInPage() {
  return (
    <div className="min-h-svh grid lg:grid-cols-2">
      {/* Left side - Testimonial/Hero */}
      <div className="hidden lg:flex relative bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 p-12 items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('/office-team-collaboration.png')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-slate-900/80 to-transparent" />

        <div className="relative z-10 max-w-lg space-y-8">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="flex items-center justify-center size-12 rounded-xl bg-primary">
              <span className="text-2xl font-bold text-primary-foreground">H</span>
            </div>
            <span className="text-2xl font-bold text-white">HR Pipeline</span>
          </Link>

          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-white leading-tight">Transform Your Recruitment</h1>
            <p className="text-lg text-slate-300 leading-relaxed">
              "This HR platform streamlined our hiring process and saved us countless hours. The analytics and
              automation features are game-changing."
            </p>
          </div>

          <div className="flex items-center gap-4 pt-8 border-t border-slate-700">
            <div className="size-12 rounded-full bg-slate-700 overflow-hidden flex items-center justify-center text-white font-semibold">
              KW
            </div>
            <div>
              <p className="font-semibold text-white">Katie Waters</p>
              <p className="text-sm text-slate-400">Head of HR, TechCorp</p>
            </div>
          </div>
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
              Don't have an account?{" "}
              <Link href="/sign-up" className="text-primary hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
