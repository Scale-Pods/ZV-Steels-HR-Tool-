"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  FileText,
  PhoneCall,
  Sparkles,
  Workflow,
  type LucideIcon,
} from "lucide-react"
import { useEffect, useState } from "react"

const features: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: Sparkles,
    title: "AI Screening Engine",
    description:
      "Automatically parse, score, and rank every resume against your job descriptions with precision ML models.",
  },
  {
    icon: Workflow,
    title: "Smart Pipeline",
    description:
      "Multi-round interview tracking with intelligent scheduling, automated reminders, and bottleneck detection.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description:
      "Real-time metrics on conversion rates, time-to-hire, city distribution, and recruiter performance leaderboards.",
  },
  {
    icon: FileText,
    title: "Offer Generator",
    description:
      "Generate beautiful, branded offer letters instantly with customizable templates and one-click PDF export.",
  },
  {
    icon: PhoneCall,
    title: "Call Intelligence",
    description:
      "AI-powered call log analysis that extracts key insights, scores candidate responses, and flags red flags.",
  },
  {
    icon: CalendarDays,
    title: "Interview Scheduler",
    description:
      "Integrated calendar with Google Meet/Zoom links, automated rescheduling, and timezone-aware booking.",
  },
]

const steps: { number: string; title: string; description: string }[] = [
  {
    number: "01",
    title: "Upload Resumes",
    description: "Bulk upload resumes in any format. Our AI parses and structures the data instantly.",
  },
  {
    number: "02",
    title: "AI Analysis",
    description: "Each candidate is scored against your JD with weighted criteria and gap analysis.",
  },
  {
    number: "03",
    title: "Interview & Score",
    description: "Schedule multi-round interviews with automated meeting links and call analysis.",
  },
  {
    number: "04",
    title: "Hire & Offer",
    description: "Generate offer letters, track acceptance, and onboard — all from one place.",
  },
]

const metrics: { value: string; label: string; description: string }[] = [
  {
    value: "85%",
    label: "Faster Screening",
    description: "AI-powered resume analysis cuts screening time dramatically",
  },
  {
    value: "3.2x",
    label: "Better Hires",
    description: "Data-driven decisions lead to higher quality candidates",
  },
  {
    value: "60%",
    label: "Less Admin Work",
    description: "Automated pipelines free your team to focus on people",
  },
  {
    value: "8.2d",
    label: "Time to Hire",
    description: "From application to offer, faster than industry average",
  },
]

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24)
    handleScroll()
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="dark brand-dark min-h-screen bg-background text-foreground">
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled ? "border-b border-border/40 bg-background/80 backdrop-blur-xl" : "border-b border-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
          <Link href="/" className="flex origin-left scale-90 items-center gap-1.5 transition-all hover:opacity-90 md:scale-100 md:gap-3">
            <div className="flex flex-col items-center gap-0.5 md:gap-1">
              <div className="relative h-7 w-20 md:h-9 md:w-24">
                <Image
                  src="https://zvsteels.com/assets/img/zv_logo.png"
                  alt="ZV Steels Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <span className="whitespace-nowrap text-[5px] font-bold uppercase tracking-widest text-muted-foreground/40 md:text-[7px]">
                ZV Steels Pvt. Ltd.
              </span>
            </div>
            <div className="h-6 w-px bg-border/30 md:h-8" />
            <div className="flex flex-col items-center justify-center">
              <span className="mb-1 text-center text-[5px] font-black uppercase leading-none tracking-[0.2em] text-muted-foreground/30 md:text-[6px]">
                Powered By
              </span>
              <div className="relative h-5 w-18 md:h-7 md:w-24">
                <Image
                  src="/images/scalepods-logo.avif"
                  alt="ScalePods Logo"
                  fill
                  className="object-contain invert scale-[1.2]"
                />
              </div>
            </div>
          </Link>
          <div className="flex items-center gap-2 md:gap-5">
            <Link
              href="#features"
              className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground md:inline"
            >
              Features
            </Link>
            <Link
              href="#benefits"
              className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground md:inline"
            >
              Why us
            </Link>
            <Button variant="glass" className="h-9 rounded-full px-5 text-sm" asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden pb-20 pt-32 md:pb-28 md:pt-44">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-[-16rem] h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-primary/[0.25] blur-[130px]" />
          <div className="absolute right-[-10rem] top-1/3 h-96 w-96 rounded-full bg-primary/[0.20] blur-[120px]" />
          <div className="absolute bottom-[-8rem] left-[-10rem] h-80 w-80 rounded-full bg-primary/[0.15] blur-[110px]" />
        </div>

        <div className="mx-auto max-w-3xl px-6 text-center">
          <span className="glass-well inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            AI-Powered HR Pipeline Platform
          </span>
          <h1 className="mt-8 text-4xl font-semibold leading-[1.08] tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Transform your recruitment workflow
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Streamline candidate tracking, automate campaign creation, and make data-driven hiring decisions — all in
            one place.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/sign-in"
              className="glass-primary inline-flex h-11 items-center gap-2 rounded-full px-7 text-sm font-semibold"
            >
              Sign In
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="#features"
              className="glass inline-flex h-11 items-center rounded-full px-7 text-sm font-medium transition-opacity hover:opacity-80"
            >
              Explore features
            </Link>
          </div>
          <p className="mt-10 text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
            Enterprise grade recruitment infrastructure
          </p>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-6 py-24 md:py-28">
        <div className="mx-auto max-w-xl text-center">
          <span className="glass-well inline-flex rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Platform features
          </span>
          <h2 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
            Total Control of Your Pipeline
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Everything you need to scale your team, condensed into a single elegant interface.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <article key={feature.title} className="glass glass-hover rounded-3xl p-7">
                <div className="glass-well mb-5 flex h-12 w-12 items-center justify-center rounded-2xl text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold tracking-tight">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
              </article>
            )
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24 md:pb-28">
        <div className="mx-auto max-w-xl text-center">
          <span className="glass-well inline-flex rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            How it works
          </span>
          <h2 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">From resume to offer in four steps</h2>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <article key={step.number} className="glass glass-hover rounded-3xl p-7">
              <p className="text-3xl font-semibold tabular-nums tracking-tight text-primary">{step.number}</p>
              <h3 className="mt-4 text-base font-semibold tracking-tight">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="benefits" className="mx-auto max-w-6xl px-6 pb-24 md:pb-28">
        <div className="mx-auto max-w-xl text-center">
          <span className="glass-well inline-flex rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Why ScalePods
          </span>
          <h2 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
            Built for modern HR teams
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Our platform combines powerful automation with intuitive design to help you hire faster, smarter, and
            more efficiently than ever before.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => (
            <article key={metric.label} className="glass glass-hover rounded-3xl px-6 py-7">
              <p className="text-4xl font-semibold tabular-nums tracking-tight text-primary">{metric.value}</p>
              <h3 className="mt-3 text-sm font-semibold tracking-tight">{metric.label}</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{metric.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24 md:pb-28">
        <div className="glass relative overflow-hidden rounded-[2.5rem] px-8 py-14 text-center md:py-16">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgb(50_134_190/0.22),transparent_60%)]"
          />
          <div className="relative mx-auto max-w-xl">
            <span className="glass-well inline-flex rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Let's talk
            </span>
            <h2 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
              Stop managing spreadsheets. Start building teams.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              HRDashboard gives your recruiters one screen for screening, pipelines, interviews, and offers — so your
              team spends time with people, not paperwork.
            </p>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              We built it for ourselves. Now it's yours.
            </p>
            <Link
              href="/sign-in"
              className="glass-primary mt-8 inline-flex h-11 items-center gap-2 rounded-full px-7 text-sm font-semibold"
            >
              Get started
              <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="mt-6 text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
              Secure • Scalable • Professional
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/40">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-10 md:flex-row md:justify-between">
          <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-90">
            <div className="relative h-8 w-24">
              <Image src="https://zvsteels.com/assets/img/zv_logo.png" alt="ZV Steels Logo" fill className="object-contain" />
            </div>
            <div className="h-5 w-px bg-border/50" />
            <div className="relative h-5 w-20">
              <Image
                src="/images/scalepods-logo.avif"
                alt="ScalePods Logo"
                fill
                className="object-contain invert"
              />
            </div>
          </Link>
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <Link href="#" className="transition-colors hover:text-foreground">
              About
            </Link>
            <Link href="#" className="transition-colors hover:text-foreground">
              Contact
            </Link>
            <Link href="#" className="transition-colors hover:text-foreground">
              Terms
            </Link>
            <Link href="#" className="transition-colors hover:text-foreground">
              Privacy
            </Link>
          </nav>
          <p className="text-sm text-muted-foreground">© 2026 HRDashboard. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
