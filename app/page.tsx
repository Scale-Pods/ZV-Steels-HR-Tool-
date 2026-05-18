"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  BarChart3,
  Target,
  TrendingUp,
  CheckCircle2,
  Sparkles,
  Shield,
  Clock,
  ArrowRight,
  Building2,
  UserCheck,
  Workflow,
  Database,
  MessageSquare,
} from "lucide-react"
import DotGrid from "@/components/ui/dot-grid"
import SpotlightCard from "@/components/ui/spotlight-card"
import { useEffect, useState } from "react"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleDashboardClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (loading) return // Do nothing while loading
    
    if (user) {
      router.push("/dashboard")
    } else {
      router.push("/sign-in")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <header
        className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${
          scrolled
            ? "border-border/40 bg-background/95 backdrop-blur-xl shadow-lg"
            : "border-transparent bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 md:px-6 py-4">
          <Link href="/" className="flex items-center gap-1.5 md:gap-3 hover:opacity-90 transition-all duration-300 scale-90 md:scale-100 origin-left">
            <div className="flex flex-col items-center gap-0.5 md:gap-1">
              {/* ZV Steels Logo Container */}
              <div className="relative h-7 w-20 md:h-9 md:w-24 overflow-hidden">
                <Image
                  src="https://zvsteels.com/assets/img/zv_logo.png"
                  alt="ZV Steels Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <span className="text-[5px] md:text-[7px] font-bold uppercase tracking-widest text-muted-foreground/40 whitespace-nowrap">
                ZV Steels Pvt. Ltd.
              </span>
            </div>

            {/* Tight Vertical Separator */}
            <div className="h-6 md:h-8 w-px bg-border/20" />

            {/* ScalePods Branding */}
            <div className="flex flex-col items-center justify-center pt-0">
              <span className="text-[5px] md:text-[6px] font-black uppercase tracking-[0.2em] text-muted-foreground/30 leading-none mb-1 text-center">
                Powered By
              </span>
              <div className="relative h-5 w-18 md:h-7 md:w-24">
                <Image
                  src="/images/scalepods-logo.avif"
                  alt="Scalepods Logo"
                  fill
                  className="object-contain invert dark:invert-0 scale-[1.2]"
                />
              </div>
            </div>
          </Link>
          <div className="flex items-center gap-2 md:gap-3">
            <Link href="/sign-in">
              <Button 
                size="sm" 
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-bold px-4 md:px-6 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 rounded-lg text-xs md:text-sm"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden pt-16 md:pt-20">
        <div className="absolute inset-0 -z-10">
          <DotGrid
            dotSize={4}
            gap={20}
            baseColor="#6D28D9"
            activeColor="#8B5CF6"
            proximity={120}
            shockRadius={250}
            shockStrength={6}
            resistance={750}
            returnDuration={1.5}
            speedTrigger={60}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/70 to-background -z-10" />

        <div className="mx-auto max-w-7xl px-6 py-16 md:py-24 sm:py-32 lg:py-40">
          <div className="mx-auto max-w-4xl text-center">
            <Badge className="mb-6 bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-500/20 dark:border-purple-500/40 text-[10px] md:text-sm px-3 md:px-5 py-1 md:py-2 shadow-lg shadow-purple-500/5 dark:shadow-purple-500/20 backdrop-blur-sm">
              <Sparkles className="h-3 w-3 md:h-4 md:w-4 mr-2 inline animate-pulse text-purple-500 dark:text-purple-400" />
              AI-Powered HR Pipeline Platform
            </Badge>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 text-foreground leading-tight drop-shadow-sm">
              Transform Your Recruitment Workflow
            </h1>
            <p className="text-xl sm:text-2xl text-foreground/80 leading-relaxed mb-12 max-w-3xl mx-auto drop-shadow-sm">
              Streamline candidate tracking, automate campaign creation, and make data-driven hiring decisions with our
              comprehensive HR management platform.
            </p>
            <p className="mt-8 text-sm text-muted-foreground font-medium uppercase tracking-[0.2em] opacity-60">
              Enterprise Grade Recruitment Infrastructure
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-6 pb-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SpotlightCard
              className="bg-card/50 backdrop-blur-sm border-border/50"
              spotlightColor="rgba(139, 92, 246, 0.15)"
            >
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-500/10 flex items-center justify-center">
                  <Users className="h-7 w-7 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-4xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                    10K+
                  </p>
                  <p className="text-sm text-muted-foreground font-medium">Candidates Tracked</p>
                </div>
              </div>
            </SpotlightCard>
            <SpotlightCard
              className="bg-card/50 backdrop-blur-sm border-border/50"
              spotlightColor="rgba(139, 92, 246, 0.15)"
            >
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-500/10 flex items-center justify-center">
                  <TrendingUp className="h-7 w-7 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-4xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                    85%
                  </p>
                  <p className="text-sm text-muted-foreground font-medium">Faster Hiring</p>
                </div>
              </div>
            </SpotlightCard>
            <SpotlightCard
              className="bg-card/50 backdrop-blur-sm border-border/50"
              spotlightColor="rgba(139, 92, 246, 0.15)"
            >
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-500/10 flex items-center justify-center">
                  <Building2 className="h-7 w-7 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-4xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                    500+
                  </p>
                  <p className="text-sm text-muted-foreground font-medium">Companies Trust Us</p>
                </div>
              </div>
            </SpotlightCard>
          </div>
        </div>
      </section>

      <section id="features" className="py-24 bg-muted/20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-purple-500/10 text-purple-400 border-purple-500/30 backdrop-blur-sm">
              Powerful Features
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">Everything You Need to Hire Smarter</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive tools designed for modern HR teams to streamline recruitment and manage candidates
              effectively.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SpotlightCard spotlightColor="rgba(139, 92, 246, 0.15)">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Campaign Management</h3>
              <p className="text-muted-foreground leading-relaxed">
                Create and manage recruitment campaigns with automated workflows, custom templates, and multi-channel
                outreach capabilities.
              </p>
            </SpotlightCard>

            <SpotlightCard spotlightColor="rgba(139, 92, 246, 0.15)">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20">
                <UserCheck className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Candidate Tracking</h3>
              <p className="text-muted-foreground leading-relaxed">
                Track every candidate through your pipeline with real-time status updates, notes, and automated
                follow-ups for seamless management.
              </p>
            </SpotlightCard>

            <SpotlightCard spotlightColor="rgba(139, 92, 246, 0.15)">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Analytics Dashboard</h3>
              <p className="text-muted-foreground leading-relaxed">
                Gain insights with comprehensive analytics on hiring metrics, campaign performance, and team
                productivity in real-time.
              </p>
            </SpotlightCard>

            <SpotlightCard spotlightColor="rgba(139, 92, 246, 0.15)">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20">
                <Database className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Credentials Management</h3>
              <p className="text-muted-foreground leading-relaxed">
                Securely store and manage API credentials, integrations, and access tokens with enterprise-grade
                encryption and security.
              </p>
            </SpotlightCard>

            <SpotlightCard spotlightColor="rgba(139, 92, 246, 0.15)">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20">
                <MessageSquare className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">WhatsApp Integration</h3>
              <p className="text-muted-foreground leading-relaxed">
                Automate candidate communication via WhatsApp with personalized messages, bulk campaigns, and response
                tracking.
              </p>
            </SpotlightCard>

            <SpotlightCard spotlightColor="rgba(139, 92, 246, 0.15)">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20">
                <Workflow className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Automation Workflows</h3>
              <p className="text-muted-foreground leading-relaxed">
                Build custom automation workflows for screening, follow-ups, and candidate engagement at scale with
                no-code builders.
              </p>
            </SpotlightCard>
          </div>
        </div>
      </section>

      <section id="benefits" className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge className="mb-4 bg-purple-500/10 text-purple-400 border-purple-500/30 backdrop-blur-sm">
                Why Choose Us
              </Badge>
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">Built for Modern HR Teams</h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Our platform combines powerful automation with intuitive design to help you hire faster, smarter, and
                more efficiently than ever before.
              </p>
              <ul className="space-y-5">
                <li className="flex items-start gap-4">
                  <div className="h-7 w-7 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">Reduce Time-to-Hire by 85%</h4>
                    <p className="text-muted-foreground">
                      Automated workflows and intelligent screening help you identify top candidates faster than
                      traditional methods.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="h-7 w-7 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">Centralized Candidate Database</h4>
                    <p className="text-muted-foreground">
                      All candidate information, documents, and communication history in one secure, searchable
                      location.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="h-7 w-7 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">Data-Driven Insights</h4>
                    <p className="text-muted-foreground">
                      Make informed decisions with real-time analytics, performance metrics, and predictive hiring
                      intelligence.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="h-7 w-7 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">Enterprise-Grade Security</h4>
                    <p className="text-muted-foreground">
                      Bank-level encryption and compliance with GDPR, SOC 2, and industry standards to protect your
                      data.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-blue-500/10 to-purple-500/20 rounded-3xl blur-3xl" />
              <SpotlightCard
                className="relative bg-card/80 backdrop-blur-sm border-border/50"
                spotlightColor="rgba(139, 92, 246, 0.2)"
              >
                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-5 rounded-2xl bg-muted/50 backdrop-blur-sm">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                      <Clock className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg">Save 20+ Hours Per Week</p>
                      <p className="text-sm text-muted-foreground">On manual recruitment tasks</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-5 rounded-2xl bg-muted/50 backdrop-blur-sm">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg">99.9% Uptime Guarantee</p>
                      <p className="text-sm text-muted-foreground">Enterprise-grade reliability</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-5 rounded-2xl bg-muted/50 backdrop-blur-sm">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg">AI-Powered Matching</p>
                      <p className="text-sm text-muted-foreground">Find the perfect candidates</p>
                    </div>
                  </div>
                </div>
              </SpotlightCard>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-br from-muted/30 via-muted/20 to-muted/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(139,92,246,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(59,130,246,0.1),transparent_50%)]" />
        <div className="mx-auto max-w-4xl px-6 text-center relative">
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
            Ready to Transform Your Hiring Process?
          </h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join hundreds of companies using HRDashboard to build better teams faster with intelligent automation.
          </p>
          <p className="mt-8 text-sm text-muted-foreground font-semibold">
            Secure • Scaling • Professional
          </p>
        </div>
      </section>

      <footer className="border-t border-border/40 bg-muted/30 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="space-y-4">
              <Link href="/" className="flex flex-col items-start gap-4 hover:opacity-90 transition-all duration-300">
                <div className="relative h-14 w-44">
                  <Image
                    src="https://zvsteels.com/assets/img/zv_logo.png"
                    alt="ZV Steels Logo"
                    fill
                    className="object-contain"
                  />
                </div>
                
                <div className="flex flex-col items-center gap-2">
                  <span className="text-[8px] font-black uppercase tracking-[0.3em] text-muted-foreground/30 leading-none text-center">
                    Powered By
                  </span>
                  <div className="relative h-12 w-44">
                    <Image
                      src="/images/scalepods-logo.avif"
                      alt="Scalepods Logo"
                      fill
                      className="object-contain invert dark:invert-0 scale-[1.4] transition-all duration-500"
                    />
                  </div>
                </div>
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Modern HR management platform for recruitment workflows and candidate tracking.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {/* Links removed */}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Careers
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Privacy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/40 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© 2026 HRDashboard. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="#" className="hover:text-foreground transition-colors">
                Terms
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
