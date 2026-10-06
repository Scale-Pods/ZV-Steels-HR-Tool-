import Link from "next/link"
import Image from "next/image"
import { SignInForm } from "@/components/auth/sign-in-form"

export const dynamic = "force-dynamic"

export default function SignInPage() {
  return (
    <div className="dark brand-dark relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-background px-6 py-12 text-foreground">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-14rem] h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-primary/[0.25] blur-[130px]" />
        <div className="absolute bottom-[-10rem] right-[-6rem] h-96 w-96 rounded-full bg-primary/[0.20] blur-[120px]" />
        <div className="absolute bottom-[-6rem] left-[-8rem] h-72 w-72 rounded-full bg-primary/[0.15] blur-[110px]" />
      </div>

      <Link href="/" className="mb-8 flex flex-col items-center gap-2 transition-opacity hover:opacity-80">
        <div className="relative h-10 w-32">
          <Image
            src="https://zvsteels.com/assets/img/zv_logo.png"
            alt="ZV Steels Logo"
            fill
            className="object-contain"
            priority
          />
        </div>
        <div className="flex items-center gap-1.5 opacity-50">
          <span className="text-[7px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Powered By
          </span>
          <div className="relative h-3 w-14">
            <Image
              src="/images/scalepods-logo.avif"
              alt="ScalePods Logo"
              fill
              className="object-contain invert"
            />
          </div>
        </div>
      </Link>

      <div className="glass w-full max-w-md rounded-[2rem] p-8 md:p-10">
        <SignInForm />
      </div>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        © 2026 HRDashboard. All rights reserved.
      </p>
    </div>
  )
}
