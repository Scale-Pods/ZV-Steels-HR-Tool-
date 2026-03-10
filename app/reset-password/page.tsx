"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function ResetPasswordPage() {
  const router = useRouter()

  useEffect(() => {
    router.push("/sign-in#/reset-password")
  }, [router])

  return (
    <div className="min-h-svh grid place-items-center px-4 py-8 bg-background">
      <Card className="w-full max-w-md border-2">
        <CardHeader className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="flex items-center justify-center size-12 rounded-xl bg-primary">
              <span className="text-2xl font-bold text-primary-foreground">H</span>
            </div>
            <span className="text-2xl font-bold">HRDashboard</span>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl">Reset your password</CardTitle>
            <CardDescription className="text-base">Redirecting to password reset...</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-6">
          <p className="text-sm text-muted-foreground">
            © 2025 HRDashboard . All rights reserved.{" "}
            <Link href="/terms" className="hover:text-primary">
              Terms & Conditions
            </Link>{" "}
            <Link href="/privacy" className="hover:text-primary">
              Privacy Policy
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
