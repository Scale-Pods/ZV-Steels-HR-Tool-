"use client"

import Reordering from "@/components/animations/reordering"
import { cn } from "@/lib/utils"

type LoaderProps = {
  label?: string
  className?: string
}

export function Loader({ label = "Loading...", className }: LoaderProps) {
  return (
    <div
      className={cn("relative flex flex-col items-center justify-center rounded-xl border bg-card/50 p-6", className)}
    >
      {/* subtle background glow */}
      <div className="pointer-events-none absolute inset-0 rounded-xl bg-[radial-gradient(50%_50%_at_50%_0%,hsl(var(--accent))/12%,transparent_70%)]" />
      {/* Animation */}
      <div className="relative z-10">
        <Reordering />
      </div>
      {/* Label */}
      <p className="relative z-10 mt-4 text-sm text-muted-foreground">{label}</p>
    </div>
  )
}

export default Loader
