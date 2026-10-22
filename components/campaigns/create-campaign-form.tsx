"use client"

import { InfinityLoop } from "@/components/ui/infinity";
import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CalendarIcon, CheckCircle2, AlertCircle, Wallet } from "lucide-react";
import { format } from "date-fns"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/auth-context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const WEBHOOK_URL = "https://n8n.srv1010832.hstgr.cloud/webhook/ff7710c6-14c7-4cae-a24c-6c53e5f09497"

/* Draft auto-save: survives page refresh, expires after 15 minutes */
const DRAFT_KEY = "createCampaignDraftV1"
const DRAFT_TTL_MS = 15 * 60 * 1000

interface CampaignDraft {
  savedAt: number
  campaignName: string
  startDate?: string
  endDate?: string
  jobDescription: string
  locationVal: string
  minSalary: string
  maxSalary: string
  joiningDate?: string
  numberOfRounds: number
  pocEmails: string[]
  pocCalendarLinks: string[]
  roundSchedules: Array<{ startDate?: string; endDate?: string; startTime?: string; endTime?: string }>
  callQuestions: string
  skillsWeight: number
  experienceWeight: number
  educationWeight: number
  alignmentWeight: number
  optimizedHiring: boolean
}

/* Shared, minimal glass styling used across the form */
const inputCls =
  "h-10 rounded-xl border-white/60 dark:border-white/10 bg-white/70 dark:bg-white/[0.05] shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)] focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:border-ring/40 md:text-sm"

const textareaCls =
  "rounded-xl border-white/60 dark:border-white/10 bg-white/70 dark:bg-white/[0.05] shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)] focus-visible:ring-2 focus:ring-ring/30 focus-visible:border-ring/40 text-sm leading-relaxed resize-none"

const dateTriggerCls =
  "flex h-10 w-full items-center justify-start rounded-xl border border-white/60 dark:border-white/10 bg-white/70 dark:bg-white/[0.05] px-3 py-2 text-sm shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)] backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50"

const glassPanelCls =
  "rounded-2xl border border-white/60 dark:border-white/10 bg-white/50 dark:bg-white/[0.03] backdrop-blur-xl backdrop-saturate-150 shadow-[0_1px_3px_rgba(15,23,42,0.05)]"

/* Time slots for round start/end: 9:00 AM → 9:00 PM in 30-min steps */
const START_HOUR = 9
const END_HOUR = 21
const TIME_OPTIONS = Array.from({ length: (END_HOUR - START_HOUR) * 2 + 1 }, (_, i) => {
  const hour = START_HOUR + Math.floor(i / 2)
  const minute = i % 2 === 0 ? "00" : "30"
  const hour12 = hour % 12 === 0 ? 12 : hour % 12
  const suffix = hour < 12 ? "AM" : "PM"
  return {
    value: `${String(hour).padStart(2, "0")}:${minute}`,
    label: `${hour12}:${minute} ${suffix}`,
  }
})

function SectionHeading({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium tracking-tight text-foreground">{title}</p>
      {hint ? <p className="text-xs leading-relaxed text-muted-foreground">{hint}</p> : null}
    </div>
  )
}


interface CreateCampaignFormProps {
  onSuccess?: (campaignName?: string) => void
}

interface Interviewer {
  name: string
  email: string
  type: string
  calendarLink: string
}

interface RoundSchedule {
  startDate?: Date
  endDate?: Date
  startTime?: string
  endTime?: string
}

export function CreateCampaignForm({ onSuccess }: CreateCampaignFormProps) {
  // ── State ────────────────────────────────────────────────────────────────
  const { user } = useAuth()
  const userEmail = user?.email || "guest@example.com"

  const [campaignName, setCampaignName] = useState("")
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [jobDescription, setJobDescription] = useState("")
  const [locationVal, setLocationVal] = useState("")
  const [minSalary, setMinSalary] = useState("")
  const [maxSalary, setMaxSalary] = useState("")
  const [joiningDate, setJoiningDate] = useState<Date | undefined>(undefined)
  const [numberOfRounds, setNumberOfRounds] = useState<number>(1)
  const [pocEmails, setPocEmails] = useState<string[]>([""])
  const [pocCalendarLinks, setPocCalendarLinks] = useState<string[]>([""])
  const [roundSchedules, setRoundSchedules] = useState<RoundSchedule[]>([{}])
  const [callQuestions, setCallQuestions] = useState("")
  const [skillsWeight, setSkillsWeight] = useState(25)
  const [experienceWeight, setExperienceWeight] = useState(25)
  const [educationWeight, setEducationWeight] = useState(25)
  const [alignmentWeight, setAlignmentWeight] = useState(25)
  const [optimizedHiring, setOptimizedHiring] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const createdCampaignNameRef = useRef("")
  const [interviewers, setInterviewers] = useState<Interviewer[]>([])
  const [loadingInterviewers, setLoadingInterviewers] = useState(false)
  const [bolnaCredits, setBolnaCredits] = useState<number | null>(null)
  const [creditsLoading, setCreditsLoading] = useState(false)

  // ── Effects ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchInterviewers = async () => {
      setLoadingInterviewers(true)
      try {
        const response = await fetch("/api/hr-data?view=interviewers")
        if (response.ok) {
          const data = await response.json()
          let rawRows: any[] = []
          if (Array.isArray(data)) rawRows = data
          else if (data.data && Array.isArray(data.data)) rawRows = data.data
          else if (data.interviewers && Array.isArray(data.interviewers)) rawRows = data.interviewers
          
          const extracted: Interviewer[] = rawRows.map((row: any) => {
            const item = row.json || row
            return {
              name: String(item.Name || item.name || "Unknown"),
              email: String(item.Email || item.email || ""),
              type: String(item.Interviewer || item.type || ""),
              calendarLink: String(item["Calendar Link"] || item.calendarLink || item.calendar_link || ""),
            }
          })
          setInterviewers(extracted)
        }
      } catch (error) {
        console.error("[CreateCampaignForm] Error fetching interviewers:", error)
      } finally {
        setLoadingInterviewers(false)
      }
    }
    const fetchBolnaCredits = async () => {
      setCreditsLoading(true)
      try {
        const res = await fetch("https://n8n.srv1010832.hstgr.cloud/webhook/e535ef1a-c5ae-4c36-8a5e-b11e12db78d4", { 
          cache: "no-store",
          method: "GET"
        })
        if (res.ok) {
          const text = await res.text()
          const walletMatch = text.match(/"wallet"\s*:\s*([0-9]+(?:\.[0-9]+)?)/)
          if (walletMatch) {
            setBolnaCredits(parseFloat(walletMatch[1]))
            setCreditsLoading(false)
            return
          }
        }
        const apiRes = await fetch("/api/bolna-credits", { cache: "no-store" })
        if (apiRes.ok) {
          const data = await apiRes.json()
          if (data.success && data.data?.wallet !== undefined) {
            setBolnaCredits(Number(data.data.wallet))
          }
        }
      } catch (error) {
        console.error("[CreateCampaignForm] Error fetching credits:", error)
      } finally {
        setCreditsLoading(false)
      }
    }
    fetchInterviewers()
    fetchBolnaCredits()
  }, [])

  // ── Draft auto-save / restore (15 min) ──────────────────────────────────
  const hydrated = useRef(false)

  // Restore a saved draft on mount (only if still fresh)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY)
      if (!raw) {
        hydrated.current = true
        return
      }
      const draft = JSON.parse(raw) as CampaignDraft
      if (!draft || typeof draft.savedAt !== "number" || Date.now() - draft.savedAt > DRAFT_TTL_MS) {
        localStorage.removeItem(DRAFT_KEY)
        hydrated.current = true
        return
      }
      setCampaignName(draft.campaignName ?? "")
      setStartDate(draft.startDate ? new Date(draft.startDate) : undefined)
      setEndDate(draft.endDate ? new Date(draft.endDate) : undefined)
      setJobDescription(draft.jobDescription ?? "")
      setLocationVal(draft.locationVal ?? "")
      setMinSalary(draft.minSalary ?? "")
      setMaxSalary(draft.maxSalary ?? "")
      setJoiningDate(draft.joiningDate ? new Date(draft.joiningDate) : undefined)
      const rounds = draft.numberOfRounds >= 1 && draft.numberOfRounds <= 3 ? draft.numberOfRounds : 1
      setNumberOfRounds(rounds)
      setPocEmails(Array.isArray(draft.pocEmails) ? draft.pocEmails : [""])
      setPocCalendarLinks(Array.isArray(draft.pocCalendarLinks) ? draft.pocCalendarLinks : [""])
      setRoundSchedules(
        (Array.isArray(draft.roundSchedules) ? draft.roundSchedules : []).map((r) => ({
          startDate: r.startDate ? new Date(r.startDate) : undefined,
          endDate: r.endDate ? new Date(r.endDate) : undefined,
          startTime: r.startTime,
          endTime: r.endTime,
        })),
      )
      setCallQuestions(draft.callQuestions ?? "")
      setSkillsWeight(typeof draft.skillsWeight === "number" ? draft.skillsWeight : 25)
      setExperienceWeight(typeof draft.experienceWeight === "number" ? draft.experienceWeight : 25)
      setEducationWeight(typeof draft.educationWeight === "number" ? draft.educationWeight : 25)
      setAlignmentWeight(typeof draft.alignmentWeight === "number" ? draft.alignmentWeight : 25)
      setOptimizedHiring(typeof draft.optimizedHiring === "boolean" ? draft.optimizedHiring : true)
      toast("Draft restored — you can continue where you left off.")
    } catch (e) {
      console.warn("[CreateCampaignForm] Failed to restore draft:", e)
    } finally {
      hydrated.current = true
    }
  }, [])

  // Persist the draft to localStorage on every change (after hydration)
  const firstSave = useRef(true)
  useEffect(() => {
    if (firstSave.current) {
      firstSave.current = false
      return
    }
    if (!hydrated.current) return
    const draft: CampaignDraft = {
      savedAt: Date.now(),
      campaignName,
      startDate: startDate ? startDate.toISOString() : undefined,
      endDate: endDate ? endDate.toISOString() : undefined,
      jobDescription,
      locationVal,
      minSalary,
      maxSalary,
      joiningDate: joiningDate ? joiningDate.toISOString() : undefined,
      numberOfRounds,
      pocEmails,
      pocCalendarLinks,
      roundSchedules: roundSchedules.map((r) => ({
        startDate: r.startDate ? r.startDate.toISOString() : undefined,
        endDate: r.endDate ? r.endDate.toISOString() : undefined,
        startTime: r.startTime,
        endTime: r.endTime,
      })),
      callQuestions,
      skillsWeight,
      experienceWeight,
      educationWeight,
      alignmentWeight,
      optimizedHiring,
    }
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
    } catch (e) {
      console.warn("[CreateCampaignForm] Failed to save draft:", e)
    }
  }, [
    campaignName,
    startDate,
    endDate,
    jobDescription,
    locationVal,
    minSalary,
    maxSalary,
    joiningDate,
    numberOfRounds,
    pocEmails,
    pocCalendarLinks,
    roundSchedules,
    callQuestions,
    skillsWeight,
    experienceWeight,
    educationWeight,
    alignmentWeight,
    optimizedHiring,
  ])

  // ── Helpers ───────────────────────────────────────────────────────────────
  const roundsInputRef = useRef<HTMLInputElement>(null)

  const handleNumberOfRoundsChange = (value: string) => {
    let num = Number.parseInt(value, 10)
    if (isNaN(num) || num < 1) {
      setNumberOfRounds(1)
      setPocEmails([""])
      setPocCalendarLinks([""])
      setRoundSchedules([{}])
      return
    }
    if (num > 3) num = 3
    setNumberOfRounds(num)
    const nextEmails = Array(num).fill("") as string[]
    const nextLinks = Array(num).fill("") as string[]
    for (let i = 0; i < Math.min(pocEmails.length, num); i++) {
      nextEmails[i] = pocEmails[i]
      nextLinks[i] = pocCalendarLinks[i] || ""
    }
    setPocEmails(nextEmails)
    setPocCalendarLinks(nextLinks)
    setRoundSchedules(
      Array.from({ length: num }, (_, i) => roundSchedules[i] ?? {})
    )
  }

  // Scroll wheel over the rounds input adjusts the count while hovered
  useEffect(() => {
    const el = roundsInputRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      if (isSubmitting) return
      e.preventDefault()
      const next = Math.min(3, Math.max(1, numberOfRounds + (e.deltaY < 0 ? 1 : -1)))
      if (next !== numberOfRounds) handleNumberOfRoundsChange(String(next))
    }
    el.addEventListener("wheel", onWheel, { passive: false })
    return () => el.removeEventListener("wheel", onWheel)
  }, [numberOfRounds, isSubmitting, handleNumberOfRoundsChange])

  const updateRoundSchedule = (index: number, patch: Partial<RoundSchedule>) => {
    setRoundSchedules((prev) => {
      const next = [...prev]
      next[index] = { ...(next[index] ?? {}), ...patch }
      return next
    })
  }

  const handlePocEmailChange = (index: number, value: string) => {
    const next = [...pocEmails]
    next[index] = value
    setPocEmails(next)
  }

  const handlePocCalendarLinkChange = (index: number, value: string) => {
    const next = [...pocCalendarLinks]
    next[index] = value
    setPocCalendarLinks(next)
  }

  const handleInterviewerSelect = (index: number, interviewerName: string) => {
    const selected = interviewers.find(i => i.name === interviewerName)
    if (selected) {
      handlePocEmailChange(index, selected.email)
      handlePocCalendarLinkChange(index, selected.calendarLink)
    }
  }

  const areAllPocEmailsValid = () => {
    if (pocEmails.length !== numberOfRounds) return false
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return pocEmails.every((e) => e.trim() !== "" && re.test(e.trim()))
  }

  const resetForm = () => {
    try {
      localStorage.removeItem(DRAFT_KEY)
    } catch (e) {
      console.warn("[CreateCampaignForm] Failed to clear draft:", e)
    }
    setCampaignName("")
    setStartDate(undefined)
    setEndDate(undefined)
    setJobDescription("")
    setLocationVal("")
    setMinSalary("")
    setMaxSalary("")
    setJoiningDate(undefined)
    setNumberOfRounds(1)
    setPocEmails([""])
    setPocCalendarLinks([""])
    setRoundSchedules([{}])
    setCallQuestions("")
    setOptimizedHiring(true)
    setSkillsWeight(25)
    setExperienceWeight(25)
    setEducationWeight(25)
    setAlignmentWeight(25)
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (bolnaCredits !== null && bolnaCredits < 15) {
      toast.error("Insufficient Bolna credits", {
        description: `You have ${bolnaCredits.toFixed(2)} INR. You need at least 15 INR to create a campaign.`
      })
      return
    }

    if (!campaignName.trim())    { toast.error("Campaign Name is required"); return }
    if (!jobDescription.trim()) { toast.error("Job Description is required"); return }
    if (!startDate)            { toast.error("Please select a Start Date"); return }
    if (!endDate)              { toast.error("Please select an End Date"); return }
    if (!locationVal.trim())    { toast.error("Location is required"); return }
    if (numberOfRounds < 1)   { toast.error("Number of Rounds must be at least 1"); return }
    if (!areAllPocEmailsValid()) {
      toast.error(`Please enter valid email(s) for all ${numberOfRounds} POC round(s)`)
      return
    }
    for (let i = 0; i < numberOfRounds; i++) {
      const schedule = roundSchedules[i] ?? {}
      if (!schedule.startDate) { toast.error(`Please select a Start Date for Round ${i + 1}`); return }
      if (!schedule.endDate)   { toast.error(`Please select an End Date for Round ${i + 1}`); return }
      if (schedule.endDate < schedule.startDate) {
        toast.error(`Round ${i + 1} End Date must be on or after its Start Date`)
        return
      }
      if (!schedule.startTime) { toast.error(`Please select a Start Time for Round ${i + 1}`); return }
      if (!schedule.endTime)   { toast.error(`Please select an End Time for Round ${i + 1}`); return }
      if (
        schedule.endDate.getTime() === schedule.startDate.getTime() &&
        schedule.endTime <= schedule.startTime
      ) {
        toast.error(`Round ${i + 1} End Time must be after its Start Time`)
        return
      }
    }

    setIsSubmitting(true)

    try {
      // Check if campaign already exists
      const checkResponse = await fetch("/api/hr-data?view=campaigns")
      
      if (checkResponse.ok) {
        const text = await checkResponse.text()
        let data: any = []
        if (text && text.trim() !== "") {
          try { data = JSON.parse(text) } catch (e) { }
        }
        
        let existingCampaigns: any[] = []
        if (Array.isArray(data)) {
          existingCampaigns = data
        } else if (data.data && Array.isArray(data.data)) {
          existingCampaigns = data.data.map((item: any) => item.json || item)
        } else if (data.campaigns && Array.isArray(data.campaigns)) {
          existingCampaigns = data.campaigns
        }
        
        const exists = existingCampaigns.some((c: any) => 
          String(c.CampaignName || "").toLowerCase() === campaignName.trim().toLowerCase()
        )
        
        if (exists) {
          toast.error(`A campaign named "${campaignName.trim()}" already exists.`, {
            description: "Please choose a different name."
          })
          setIsSubmitting(false)
          return
        }
      }
    } catch (err) {
      console.error("[Campaign] Failed to check existing campaigns:", err)
    }

    const payload: Record<string, unknown> = {
      UserEmail: userEmail,
      CampaignName: campaignName.trim(),
      CreationDate: new Date().toISOString(),
      CampaignStartDate: format(startDate, "yyyy-MM-dd"),
      CampaignEndDate: format(endDate, "yyyy-MM-dd"),
      NumberOfRounds: numberOfRounds,
      IsActive: true,
    }

    // Add POC emails and calendar links as separate keys for each round
    pocEmails.forEach((email, index) => {
      payload[`POC_Round_${index + 1}`] = email.trim()
      if (pocCalendarLinks[index]?.trim()) {
        payload[`POC_Calendar_Round_${index + 1}`] = pocCalendarLinks[index].trim()
      }
    })

    // Add per-round schedule (dates + times)
    roundSchedules.slice(0, numberOfRounds).forEach((schedule, index) => {
      const round = index + 1
      if (schedule.startDate) payload[`RoundStartDate_${round}`] = format(schedule.startDate, "yyyy-MM-dd")
      if (schedule.endDate)   payload[`RoundEndDate_${round}`]   = format(schedule.endDate, "yyyy-MM-dd")
      if (schedule.startTime) payload[`RoundStartTime_${round}`] = schedule.startTime
      if (schedule.endTime)   payload[`RoundEndTime_${round}`]   = schedule.endTime
    })

    if (callQuestions.trim()) {
      payload.CallQuestions = callQuestions.trim()
      payload.Questions = callQuestions.trim()
    }

    if (jobDescription.trim()) payload.JobDescription = jobDescription.trim()
    if (locationVal.trim()) payload.Location = locationVal.trim()
    if (minSalary) payload.MinSalary = Number.parseFloat(minSalary)
    if (maxSalary) payload.MaxSalary = Number.parseFloat(maxSalary)
    if (joiningDate) payload.JoiningDate = format(joiningDate, "yyyy-MM-dd")
    
    payload.OptimizedHiring = optimizedHiring
    payload.SkillsMatchWeight = skillsWeight
    payload.ExperienceRelevanceWeight = experienceWeight
    payload.EducationRelevanceWeight = educationWeight
    payload.JDAlignmentWeight = alignmentWeight

    console.log("[Campaign] Sending to webhook:", payload)

    try {
      const res = await fetch(`/api/webhook-proxy?action=CampaignCreation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        createdCampaignNameRef.current = campaignName.trim()
        resetForm()
        setShowSuccessDialog(true)
      } else {
        let msg = "Failed to create campaign. Please try again."
        try { const d = await res.json(); msg = d.message || d.error || msg } catch { /* ignore */ }
        toast.error(msg)
      }
    } catch {
      toast.error("Network error — please check your connection and try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── UI ────────────────────────────────────────────────────────────────────
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <>
    <Card className="rounded-[2rem] border-white/60 dark:border-white/10 bg-white/55 dark:bg-white/[0.04] backdrop-blur-2xl backdrop-saturate-150 shadow-[0_24px_60px_-24px_rgba(15,23,42,0.25)] dark:shadow-[0_24px_60px_-24px_rgba(0,0,0,0.7)]">
      <CardHeader className="gap-1.5 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">New campaign</span>
            <CardTitle className="text-xl font-semibold tracking-tight">Create Campaign</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Define the role, schedule each round, and assign the points of contact.
            </CardDescription>
          </div>
          <div className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl border",
            bolnaCredits !== null && bolnaCredits < 15 ? "border-red-500/50 bg-red-500/10" : "border-emerald-500/50 bg-emerald-500/10"
          )}>
            <Wallet className={cn(
              "size-4",
              bolnaCredits !== null && bolnaCredits < 15 ? "text-red-500" : "text-emerald-500"
            )} />
            <div className="text-right">
              <p className="text-[8px] uppercase font-black tracking-widest text-muted-foreground">Bolna Credit</p>
              <p className={cn(
                "text-sm font-black",
                bolnaCredits !== null && bolnaCredits < 15 ? "text-red-500" : "text-emerald-600"
              )}>
                {creditsLoading ? "..." : bolnaCredits !== null ? `${bolnaCredits.toFixed(2)} INR` : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {bolnaCredits !== null && bolnaCredits < 15 && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="size-4" />
            <AlertTitle>Insufficient Credits</AlertTitle>
            <AlertDescription>
              You have {bolnaCredits.toFixed(2)} INR. You need at least 15 INR to create a campaign.
            </AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Campaign Name */}
          <div className="space-y-1.5">
            <Label htmlFor="campaignName" className="text-sm font-medium">Campaign Name *</Label>
            <Input
              id="campaignName"
              placeholder="e.g., Q4 Tech Hiring Campaign"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              required
              disabled={isSubmitting}
              className={inputCls}
            />
          </div>

          {/* Job Description */}
          <div className="space-y-1.5">
            <Label htmlFor="jobDescription" className="text-sm font-medium">Job Description *</Label>
            <Textarea
              id="jobDescription"
              placeholder="Enter the full job description — responsibilities, qualifications, skills required..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              disabled={isSubmitting}
              rows={5}
              className={textareaCls}
              required
            />
            <p className="text-xs text-muted-foreground">Detailed JD sent along with the campaign to candidates and recruiters</p>
          </div>

          {/* Dates */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Start Date */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Start Date *</Label>
              <Popover>
                <PopoverTrigger
                  className={cn(
                    dateTriggerCls,
                    !startDate && "text-muted-foreground"
                  )}
                  disabled={isSubmitting}
                  type="button"
                >
                  <CalendarIcon className="mr-2 size-4 shrink-0" />
                  {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    disabled={(d) => d < today}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* End Date */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">End Date *</Label>
              <Popover>
                <PopoverTrigger
                  className={cn(
                    dateTriggerCls,
                    !endDate && "text-muted-foreground"
                  )}
                  disabled={isSubmitting}
                  type="button"
                >
                  <CalendarIcon className="mr-2 size-4 shrink-0" />
                  {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    disabled={(d) => d < (startDate ?? today)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <Label htmlFor="location" className="text-sm font-medium">Location *</Label>
            <Input
              id="location"
              placeholder="e.g., Remote / Bangalore Office"
              value={locationVal}
              onChange={(e) => setLocationVal(e.target.value)}
              disabled={isSubmitting}
              className={inputCls}
              required
            />
          </div>

          {/* Salary and Joining Date */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Salary Range (LPA Annually) (Optional)</Label>
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  placeholder="Min (e.g. 4)"
                  value={minSalary}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val.length <= 2) setMinSalary(val);
                  }}
                  disabled={isSubmitting}
                  className={inputCls}
                  min="0"
                  max="99"
                />
                <span className="text-muted-foreground">-</span>
                <Input
                  type="number"
                  placeholder="Max (e.g. 6)"
                  value={maxSalary}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val.length <= 2) setMaxSalary(val);
                  }}
                  disabled={isSubmitting}
                  className={inputCls}
                  min="0"
                  max="99"
                />
              </div>
            </div>

            {/* Joining Date */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Expected Joining Date (Optional)</Label>
              <Popover>
                <PopoverTrigger
                  className={cn(
                    dateTriggerCls,
                    !joiningDate && "text-muted-foreground"
                  )}
                  disabled={isSubmitting}
                  type="button"
                >
                  <CalendarIcon className="mr-2 size-4 shrink-0" />
                  {joiningDate ? format(joiningDate, "PPP") : <span>Pick a date</span>}
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={joiningDate}
                    onSelect={setJoiningDate}
                    disabled={(d) => d < today}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Number of Rounds */}
          <div className="space-y-1.5">
            <Label htmlFor="numberOfRounds" className="text-sm font-medium">Number of Rounds *</Label>
            <Input
              id="numberOfRounds"
              ref={roundsInputRef}
              type="number"
              value={numberOfRounds}
              onChange={(e) => handleNumberOfRoundsChange(e.target.value)}
              disabled={isSubmitting}
              min="1"
              max="3"
              className={cn(inputCls, "w-32")}
            />
            <p className="text-xs text-muted-foreground">Specify the number of interview rounds for this campaign — hover and scroll to adjust</p>
          </div>

          {/* Round schedule + POC */}
          <div className="space-y-3">
            <SectionHeading
              title="Rounds, Schedule & Point of Contact"
              hint="Set the start/end date, daily time window and point of contact for each round."
            />
            {Array.from({ length: numberOfRounds }).map((_, i) => (
              <div key={i} className={cn(glassPanelCls, "space-y-3 p-4")}>
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex h-6 items-center rounded-full border border-white/60 dark:border-white/10 bg-white/70 dark:bg-white/[0.06] px-2.5 text-[11px] font-medium text-muted-foreground backdrop-blur-md">
                    Round {i + 1}
                  </span>
                  <span className="h-px flex-1 bg-border/50" />
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">Select Interviewer</Label>
                    <Select 
                      onValueChange={(val) => handleInterviewerSelect(i, val)}
                      disabled={isSubmitting || loadingInterviewers}
                    >
                      <SelectTrigger className={inputCls}>
                        <SelectValue placeholder={loadingInterviewers ? "Loading..." : "Choose interviewer"} />
                      </SelectTrigger>
                      <SelectContent>
                        {interviewers.map((int, idx) => (
                          <SelectItem key={idx} value={int.name}>
                            {int.name} ({int.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor={`poc-email-${i}`} className="text-xs font-medium text-muted-foreground">Email *</Label>
                    <Input
                      id={`poc-email-${i}`}
                      type="email"
                      placeholder="e.g., hr.manager@company.com"
                      value={pocEmails[i] ?? ""}
                      onChange={(e) => handlePocEmailChange(i, e.target.value)}
                      disabled={isSubmitting}
                      className={inputCls}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor={`poc-calendar-${i}`} className="text-xs font-medium text-muted-foreground">Calendar Link (Optional)</Label>
                    <Input
                      id={`poc-calendar-${i}`}
                      type="url"
                      placeholder="e.g., https://calendly.com/..."
                      value={pocCalendarLinks[i] ?? ""}
                      onChange={(e) => handlePocCalendarLinkChange(i, e.target.value)}
                      disabled={isSubmitting}
                      className={inputCls}
                    />
                  </div>
                </div>

                {/* Round Schedule: dates + times */}
                <div className="grid gap-3 md:grid-cols-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">Start Date *</Label>
                    <Popover>
                      <PopoverTrigger
                        className={cn(
                          dateTriggerCls,
                          !roundSchedules[i]?.startDate && "text-muted-foreground"
                        )}
                        disabled={isSubmitting}
                        type="button"
                      >
                        <CalendarIcon className="mr-2 size-4 shrink-0" />
                        {roundSchedules[i]?.startDate ? (
                          format(roundSchedules[i].startDate!, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={roundSchedules[i]?.startDate}
                          onSelect={(d) => updateRoundSchedule(i, { startDate: d })}
                          disabled={(d) =>
                            d < today ||
                            (!!startDate && d < startDate) ||
                            (!!endDate && d > endDate)
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">End Date *</Label>
                    <Popover>
                      <PopoverTrigger
                        className={cn(
                          dateTriggerCls,
                          !roundSchedules[i]?.endDate && "text-muted-foreground"
                        )}
                        disabled={isSubmitting}
                        type="button"
                      >
                        <CalendarIcon className="mr-2 size-4 shrink-0" />
                        {roundSchedules[i]?.endDate ? (
                          format(roundSchedules[i].endDate!, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={roundSchedules[i]?.endDate}
                          onSelect={(d) => updateRoundSchedule(i, { endDate: d })}
                          disabled={(d) =>
                            d < (roundSchedules[i]?.startDate ?? startDate ?? today) ||
                            (!!endDate && d > endDate)
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">Time From *</Label>
                    <Select
                      value={roundSchedules[i]?.startTime ?? ""}
                      onValueChange={(val) => updateRoundSchedule(i, { startTime: val })}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger className={inputCls}>
                        <SelectValue placeholder="From" />
                      </SelectTrigger>
                      <SelectContent className="max-h-64">
                        {TIME_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">Time To *</Label>
                    <Select
                      value={roundSchedules[i]?.endTime ?? ""}
                      onValueChange={(val) => updateRoundSchedule(i, { endTime: val })}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger className={inputCls}>
                        <SelectValue placeholder="To" />
                      </SelectTrigger>
                      <SelectContent className="max-h-64">
                        {TIME_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Call Questions */}
          <div className={cn(glassPanelCls, "space-y-3 p-4")}>
            <SectionHeading
              title="Call Questions"
              hint="Free text — anything you want asked during the screening call."
            />
            <Textarea
              id="callQuestions"
              placeholder={"e.g.\nTell me about a time you owned a feature end-to-end.\nWhat is your expected notice period?"}
              value={callQuestions}
              onChange={(e) => setCallQuestions(e.target.value)}
              disabled={isSubmitting}
              rows={4}
              className={textareaCls}
            />
          </div>

          {/* Evaluation Weights Section */}
          <div className={cn(glassPanelCls, "space-y-3 p-4")}>
            <SectionHeading
              title="Candidate Evaluation Weights (%)"
              hint="Relative importance of each signal when scoring candidates against the role."
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="skills-weight" className="text-xs text-muted-foreground">Skills Match</Label>
                <div className="relative">
                  <Input
                    id="skills-weight"
                    type="number"
                    min="0"
                    max="100"
                    value={skillsWeight}
                    onChange={(e) => setSkillsWeight(Number(e.target.value))}
                    className={cn(inputCls, "h-9 pr-7")}
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="experience-weight" className="text-xs text-muted-foreground">Experience Relevance</Label>
                <div className="relative">
                  <Input
                    id="experience-weight"
                    type="number"
                    min="0"
                    max="100"
                    value={experienceWeight}
                    onChange={(e) => setExperienceWeight(Number(e.target.value))}
                    className={cn(inputCls, "h-9 pr-7")}
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="education-weight" className="text-xs text-muted-foreground">Education Relevance</Label>
                <div className="relative">
                  <Input
                    id="education-weight"
                    type="number"
                    min="0"
                    max="100"
                    value={educationWeight}
                    onChange={(e) => setEducationWeight(Number(e.target.value))}
                    className={cn(inputCls, "h-9 pr-7")}
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="alignment-weight" className="text-xs text-muted-foreground">JD Alignment</Label>
                <div className="relative">
                  <Input
                    id="alignment-weight"
                    type="number"
                    min="0"
                    max="100"
                    value={alignmentWeight}
                    onChange={(e) => setAlignmentWeight(Number(e.target.value))}
                    className={cn(inputCls, "h-9 pr-7")}
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
                </div>
              </div>
            </div>
            
            {(skillsWeight + experienceWeight + educationWeight + alignmentWeight) !== 100 && (
              <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
                Note: Total weight is {skillsWeight + experienceWeight + educationWeight + alignmentWeight}%. Aim for 100% for balanced scoring.
              </p>
            )}
          </div>

          {/* Optimized Hiring toggle */}
          <div className={cn(glassPanelCls, "flex items-center justify-between gap-3 p-4")}>
            <div className="space-y-1">
              <p className="text-sm font-medium tracking-tight">Optimized Hiring</p>
              <p className="text-xs text-muted-foreground">
                When turned on, the candidate will directly move to call round
              </p>
            </div>
            <Switch id="optimizedHiring" checked={optimizedHiring} onCheckedChange={setOptimizedHiring} disabled={isSubmitting} />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={isSubmitting || (bolnaCredits !== null && bolnaCredits < 15)}
            className="w-full h-11 rounded-2xl bg-primary text-primary-foreground font-medium tracking-tight shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <InfinityLoop className="size-4 mr-2" />
                Creating campaign…
              </>
            ) : (bolnaCredits !== null && bolnaCredits < 15) ? (
              "Insufficient Credits"
            ) : (
              "Create Campaign"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>

    {/* Success Dialog */}
    <Dialog
      open={showSuccessDialog}
      onOpenChange={(open) => {
        setShowSuccessDialog(open)
        if (!open) onSuccess?.(createdCampaignNameRef.current)
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="items-center text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-emerald-500/10">
            <CheckCircle2 className="size-8 text-emerald-500" />
          </div>
          <DialogTitle className="text-xl">Campaign Created!</DialogTitle>
          <DialogDescription className="text-center">
            Your campaign has been successfully created and sent to the system for processing.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center pt-2">
          <Button
            onClick={() => {
              setShowSuccessDialog(false)
              onSuccess?.(createdCampaignNameRef.current)
            }}
            className="w-full sm:w-auto rounded-xl px-8 font-medium shadow-sm"
          >
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  )
}
