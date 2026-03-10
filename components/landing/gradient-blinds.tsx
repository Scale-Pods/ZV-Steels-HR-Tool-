"use client"

// Please provide the full GradientBlinds component code from React Bits

export default function GradientBlinds({
  gradientColors = ["#FF9FFC", "#5227FF"],
  angle = 0,
  noise = 0.3,
  blindCount = 12,
  blindMinWidth = 50,
  spotlightRadius = 0.5,
  spotlightSoftness = 1,
  spotlightOpacity = 1,
  mouseDampening = 0.15,
  distortAmount = 0,
  shineDirection = "left",
  mixBlendMode = "lighten",
}: {
  gradientColors?: string[]
  angle?: number
  noise?: number
  blindCount?: number
  blindMinWidth?: number
  spotlightRadius?: number
  spotlightSoftness?: number
  spotlightOpacity?: number
  mouseDampening?: number
  distortAmount?: number
  shineDirection?: string
  mixBlendMode?: string
}) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#FF9FFC] to-[#5227FF] opacity-20 blur-3xl" />
    </div>
  )
}
