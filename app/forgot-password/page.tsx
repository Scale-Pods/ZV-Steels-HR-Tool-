"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"

export default function ForgotPasswordPage() {
  const router = useRouter()

  useEffect(() => {
    router.push("/sign-in#/reset-password")
  }, [router])

  return (
    <div className="min-h-svh grid place-items-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto flex flex-col items-center gap-2">
            <div className="relative h-12 w-32">
              <Image
                src="https://zvsteels.com/assets/img/zv_logo.png"
                alt="ZV Steels logo"
                fill
                className="object-contain"
              />
            </div>
            <div className="flex items-center gap-1.5 opacity-40">
              <span className="text-[7px] font-black uppercase tracking-[0.3em] text-muted-foreground whitespace-nowrap">
                Powered By
              </span>
              <div className="relative h-3 w-14">
                <Image
                  src="/images/scalepods-logo.avif"
                  alt="Scalepods Logo"
                  fill
                  className="object-contain invert dark:invert-0"
                />
              </div>
            </div>
          </div>
          <CardTitle className="text-pretty">Reset your password</CardTitle>
          <CardDescription>Redirecting to password reset...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </CardContent>
        <div className="flex justify-center p-6">
          <Link
            href="/sign-in"
            className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
        </div>
      </Card>
    </div>
  )
}
