"use client"

import { useEffect } from "react"
import gsap from "gsap"

export function Ripple() {
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(".ripple-dot", { scale: 0.6, opacity: 0.35, transformOrigin: "center center" })
      gsap.to(".ripple-dot", {
        scale: 4,
        opacity: 0,
        duration: 3,
        ease: "power2.out",
        stagger: { each: 0.8, repeat: -1 },
        repeat: -1,
        repeatDelay: 0.6,
      })
    })
    return () => ctx.revert()
  }, [])

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <span className="ripple-dot absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent/40" />
      <span className="ripple-dot absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent/30" />
      <span className="ripple-dot absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent/20" />
    </div>
  )
}
