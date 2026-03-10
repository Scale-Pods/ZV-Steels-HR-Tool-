"use client"

import { useEffect } from "react"
import gsap from "gsap"
import { Badge } from "@/components/ui/badge"

export function HeroSection() {
  useEffect(() => {
    // Basic entrance animations
    const tl = gsap.timeline()
    tl.from(".hero-badge", { opacity: 0, y: 8, duration: 0.4, ease: "power2.out" })
      .from(".hero-title", { opacity: 0, y: 14, duration: 0.5, ease: "power2.out" }, "-=0.1")
      .from(".hero-subtitle", { opacity: 0, y: 12, duration: 0.5, ease: "power2.out" }, "-=0.2")

    // Subtle pop-in for feature cards (if present on the page)
    gsap.from(".feature-card", {
      opacity: 0,
      y: 12,
      duration: 0.5,
      stagger: 0.08,
      delay: 0.15,
      ease: "power2.out",
    })
  }, [])

  return (
    <div className="max-w-3xl">
      <Badge className="hero-badge bg-accent text-accent-foreground">Business Automation Platform</Badge>
      <h1 className="hero-title mt-4 text-balance text-4xl font-semibold tracking-tight md:text-5xl lg:text-6xl">
        Automate Your Lead Funnel
      </h1>
      <p className="hero-subtitle mt-3 text-pretty text-base sm:text-lg text-muted-foreground leading-relaxed">
        Capture, organize, and follow up with leads automatically. Handle customer inquiries with AI-powered WhatsApp
        chatbots, integrate with Google Sheets, Telegram, and Gmail for complete automation.
      </p>
    </div>
  )
}
