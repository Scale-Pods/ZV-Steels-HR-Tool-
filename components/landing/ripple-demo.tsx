import { Ripple } from "@/components/magicui/ripple"

export function RippleDemo() {
  return (
    <div className="relative flex h-[320px] w-full items-center justify-center overflow-hidden rounded-xl border bg-card/50">
      <p className="z-10 text-center text-3xl font-semibold tracking-tight text-primary">Create Campaigns</p>
      <Ripple />
    </div>
  )
}
