"use client"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const features = [
  {
    title: "Connect Providers",
    desc: "Use modular nodes to integrate WhatsApp providers and third-party services with minimal setup.",
  },
  {
    title: "Secure Credentials",
    desc: "Credentials are encrypted at rest and protected with strict RLS policies tied to your account.",
  },
  {
    title: "Orchestrate Campaigns",
    desc: "Build automated flows for broadcasts, drip sequences, and event-driven automations.",
  },
  {
    title: "Monitor and Retry",
    desc: "Get delivery status, error traces, and configurable retry backoffs for reliable workflows.",
  },
]

export default function FeatureGrid() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <div className="mx-auto max-w-6xl">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {features.map((f, i) => (
          <Card
            key={f.title}
            className={cn(
              "feature-card bg-card/60 shadow-sm backdrop-blur",
              "transition-all duration-500 ease-out",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
            )}
            style={{ transitionDelay: `${i * 80}ms` }}
            aria-label={f.title}
          >
            <CardHeader>
              <CardTitle className="text-base">{f.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
