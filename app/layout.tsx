import type React from "react"
import type { Metadata } from "next"

import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/context/auth-context"
import NextTopLoader from "nextjs-toploader"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

// Initialize fonts
import { Inter, JetBrains_Mono } from "next/font/google"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: "HRDashboard - HR Management Platform",
  description: "Comprehensive HR management platform for employee tracking, recruitment, and analytics",
  generator: "v0.app",
}

export const dynamic = "force-dynamic"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`antialiased ${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body className="font-sans">
        <NextTopLoader color="#3b82f6" height={3} showSpinner={false} />
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
            <Toaster />
            <Analytics />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
