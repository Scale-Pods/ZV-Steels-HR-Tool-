"use client"

import { useState, useEffect, useCallback, useImperativeHandle, forwardRef } from "react"
import {
  User,
  Mail,
  FileSearch,
  Phone,
  PhoneCall,
  MessageSquare,
  Briefcase,
  UserCog,
  Loader2,
  Save,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCcw,
  Info,
  ExternalLink,
  Send,
  CheckCircle,
  MessageCircle,
  CalendarClock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CandidateDecisionData {
  CampaignName: string
  Email: string
  "Resume Screening"?: string
  "Call Round"?: string
  "HR Round"?: string
  "HR Comments"?: string
  "Tech Interview"?: string
  "Tech Comments"?: string
  "Manager Interview"?: string
}

interface CallRoundData {
  status?: string
  decision?: string
  notes?: string
  calledBy?: string
  callDate?: string
  duration?: string
  [key: string]: any
}

interface CandidateDetails {
  CandidateID?: string
  Name?: string
  Email?: string
  City?: string
  HR?: string
  Score?: number
  Decision?: string
  FinalDecision?: string
  ResumeLink?: string
  TechnicalInterview?: string
  Experience?: string
  RoleApplied?: string
  PhoneNumber?: string
  ResumeSummary?: string
  Strengths?: string
  Gaps?: string
  FitAnalysis?: string
  Comments?: string
  ResumeScreening?: string
  CallRound?: string
  HRRound?: string
  TechInterviewRound?: string
  ManagerInterview?: string
  "HR Comments"?: string
  "Tech Comments"?: string
  HRMeetingDate?: string
  HRMeetingTime?: string
  HRMeetingLink?: string
  HREventID?: string
  TechMeetingDate?: string
  TechMeetingTime?: string
  TechMeetingLink?: string
  TechEventID?: string
  ManagerMeetingDate?: string
  ManagerMeetingTime?: string
  ManagerMeetingLink?: string
  ManagerEventID?: string

  // Followup Stages
  Call1?: string
  Call2?: string
  Whatsapp?: string
  FollowupMail1?: string
  FollowupMail2?: string
  Answered?: string
  Data?: string
  MailSent?: string
  CallRecording?: string
  HRMeetingMail?: string
  HRWAFollowup?: string
  TechMailSent?: string
  TechWAFollowup?: string
  ManagerMeetingMail?: string
  ManagerWAFollowup?: string
  HRMeetingType?: string
  TechMeetingType?: string
  ManagerMeetingType?: string
  [key: string]: any
}

interface CandidateDecisionSidebarContentProps {
  campaignName: string
  candidateEmail: string
  candidateDetails?: CandidateDetails | null
  onSuccess?: () => void
  hideSubmit?: boolean
  numberOfRounds?: number
}

export interface CandidateDecisionSidebarRef {
  submit: () => void
}

// Yes/No decision button group
function DecisionButtons({
  value,
  onChange,
  disabled,
}: {
  value: string
  onChange: (v: string) => void
  disabled: boolean
}) {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => onChange(value === "Yes" ? "" : "Yes")}
        disabled={disabled}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
        className={cn(
          "flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition-all duration-200 border",
          value === "Yes"
            ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-600 dark:text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
            : "bg-muted/50 border-border text-muted-foreground hover:bg-muted/80",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <CheckCircle2 className="size-4" />
        Yes
      </button>
      <button
        type="button"
        onClick={() => onChange(value === "No" ? "" : "No")}
        disabled={disabled}
        className={cn(
          "flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition-all duration-200 border",
          value === "No"
            ? "bg-red-500/20 border-red-500/50 text-red-600 dark:text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.15)]"
            : "bg-muted/50 border-border text-muted-foreground hover:bg-muted/80",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <XCircle className="size-4" />
        No
      </button>
    </div>
  )
}

// Status indicator pill
function StatusPill({ value }: { value: string }) {
  if (!value) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground">
        <Clock className="size-3" />
        Pending
      </span>
    )
  }
  if (value === "Yes") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/15 text-emerald-400">
        <CheckCircle2 className="size-3" />
        Approved
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-500/15 text-red-400">
      <XCircle className="size-3" />
      Rejected
    </span>
  )
}

export const CandidateDecisionSidebarContent = forwardRef<CandidateDecisionSidebarRef, CandidateDecisionSidebarContentProps>(({
  campaignName,
  candidateEmail,
  candidateDetails,
  onSuccess,
  hideSubmit = false,
  numberOfRounds = 3,
}, ref) => {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [expandedRound, setExpandedRound] = useState<number>(0)

  useImperativeHandle(ref, () => ({
    submit: handleSubmit
  }))

  // Reschedule dialog state
  const [rescheduleDialog, setRescheduleDialog] = useState<{
    isOpen: boolean
    meetingType: "hr" | "tech" | "manager" | null
    interviewerEmail: string
    eventId: string
    date: string
    time: string
    isSubmitting: boolean
  }>({
    isOpen: false,
    meetingType: null,
    interviewerEmail: "",
    eventId: "",
    date: "",
    time: "",
    isSubmitting: false,
  })

  const openReschedule = (meetingType: "hr" | "tech" | "manager", interviewerEmail: string, eventId: string) => {
    const today = new Date().toISOString().split("T")[0]
    setRescheduleDialog({
      isOpen: true,
      meetingType,
      interviewerEmail,
      eventId,
      date: today,
      time: "",
      isSubmitting: false,
    })
  }

  const submitReschedule = async () => {
    const { meetingType, interviewerEmail, eventId, date, time } = rescheduleDialog
    if (!meetingType || !date || !time) return
    setRescheduleDialog(prev => ({ ...prev, isSubmitting: true }))
    try {
      const WEBHOOK_BASE = process.env.NEXT_PUBLIC_WEBHOOK_URL || "https://n8n.srv1010832.hstgr.cloud/webhook"
      const RESCHEDULE_ID = process.env.NEXT_PUBLIC_WEBHOOK_RESCHEDULE || "fb2e3033-4cb9-4ad5-a4a2-6c96874349b4"
      const params = new URLSearchParams({
        meetingType,
        interviewerEmail,
        eventId,
        candidateEmail,
        userRole: "Admin",
      })
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000)

      const res = await fetch(`${WEBHOOK_BASE}/${RESCHEDULE_ID}?${params.toString()}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          action: "Reschedule",
          campaignName,
          candidateEmail,
          meetingType,
          newDate: date,
          newTime: time,
          eventId,
          interviewerEmail,
        }),
      })
      clearTimeout(timeoutId)
      const text = await res.text()
      console.log("[Reschedule] Webhook Response Text:", text)
      
      let data: any
      try {
        data = JSON.parse(text)
      } catch (e) {
        console.warn("[Reschedule] Failed to parse response as JSON:", e)
        data = { message: text || `Reschedule request sent for ${meetingType.toUpperCase()} round.` }
      }

      console.log("[Reschedule] Parsed Response Data:", data)

      if (res.ok) {
        if (data.status === "unavailable") {
          toast({ 
            title: "Slot Unavailable", 
            description: data.message || "The selected time slot is already booked. Please choose another.",
            variant: "destructive"
          })
          return
        }
        
        // Handle "Booking Confirmed" (new), "booked" (old), or any successful 200 response
        const isSuccess = data.status === "Booking Confirmed" || data.status === "booked" || res.status === 200
        
        if (isSuccess) {
          toast({ 
            title: "Meeting Rescheduled ✓", 
            description: data.message || `${meetingType?.toUpperCase()} round successfully rescheduled. Confirmation email sent.`
          })
          setRescheduleDialog(prev => ({ ...prev, isOpen: false }))
        } else {
          throw new Error(data.message || "Meeting request sent, but confirmation was not received. Please check your calendar.")
        }
      } else {
        throw new Error(`Server returned error status: ${res.status}`)
      }
    } catch (e: any) {
      console.error("[Reschedule] Catch block error:", e)
      
      const isTimeout = e.name === "AbortError"
      
      toast({ 
        title: isTimeout ? "Request Path Timeout" : "Reschedule Failed", 
        description: isTimeout 
          ? "The automation server is taking too long to respond. This usually means a branch in n8n is not connected to a response node. Please check your workflow." 
          : (e.message || "An unexpected error occurred while rescheduling."), 
        variant: "destructive" 
      })
    } finally {
      setRescheduleDialog(prev => ({ ...prev, isSubmitting: false }))
    }
  }

  // Call Round data fetched from webhook
  const [callRoundData, setCallRoundData] = useState<CallRoundData | null>(null)
  const [isLoadingCallData, setIsLoadingCallData] = useState(false)

  const [formData, setFormData] = useState<CandidateDecisionData>({
    CampaignName: campaignName,
    Email: candidateEmail,
    "Resume Screening": "",
    "Call Round": "",
    "HR Round": "",
    "HR Comments": "",
    "Tech Interview": "",
    "Tech Comments": "",
    "Manager Interview": "",
  })

  // Fetch Call Round data from webhook
  const fetchCallRoundData = useCallback(async (forcedAction?: string) => {
    setIsLoadingCallData(true)
    try {
      const action = forcedAction || "CallRoundData"
      
      const response = await fetch(`/api/webhook-proxy?action=${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          CampaignName: campaignName,
          Email: candidateEmail,
          UserEmail: "guest@example.com"
        }),
      })

      if (!response.ok) {
        console.warn("[CallRound] Webhook returned status:", response.status)
        return
      }

      const text = await response.text()
      if (!text || text.trim() === "") return

      try {
        const data = JSON.parse(text)
        console.log(`[CallRound] ${action} response:`, data)

        let extracted: any = null
        if (Array.isArray(data)) {
          extracted = data[0]?.json || data[0] || null
        } else if (data.data && Array.isArray(data.data)) {
          // If we got the whole campaign list (action="Certain Campaign")
          const list = data.data
          const found = list.find((item: any) => {
            const c = item.json || item
            return c.Email?.toLowerCase() === candidateEmail.toLowerCase() || c.email?.toLowerCase() === candidateEmail.toLowerCase()
          })
          extracted = found ? (found.json || found) : null
        } else {
          extracted = data
        }

        // If this was just the trigger response, don't show it as the final data
        if (extracted?.message === "Workflow was started") {
          console.log("[CallRound] Trigger acknowledged, fetching results from campaign data...")
          // If we haven't already tried Certain Campaign, do it now
          if (action !== "Certain Campaign") {
            await fetchCallRoundData("Certain Campaign")
          }
          return
        }

        if (extracted) {
          setCallRoundData(extracted)
        }
      } catch {
        console.warn("[CallRound] Could not parse response")
      }
    } catch (err) {
      console.error("[CallRound] Fetch error:", err)
    } finally {
      setIsLoadingCallData(false)
    }
  }, [campaignName, candidateEmail])

  // Update form when candidate changes
  useEffect(() => {
    setFormData({
      CampaignName: campaignName,
      Email: candidateEmail,
      "Resume Screening": candidateDetails?.ResumeScreening || candidateDetails?.["Resume Decision"] || candidateDetails?.Decision || "",
      "Call Round": candidateDetails?.CallRound || candidateDetails?.["Call Decision"] || candidateDetails?.["Call Status"] || "",
      "HR Round": candidateDetails?.HRRound || candidateDetails?.["HR Decision"] || "",
      "HR Comments": candidateDetails?.["HR Comments"] || candidateDetails?.Comments || "",
      "Tech Interview": candidateDetails?.TechInterviewRound || candidateDetails?.["Tech Decision"] || candidateDetails?.TechnicalInterview || "",
      "Tech Comments": candidateDetails?.["Tech Comments"] || "",
      "Manager Interview": candidateDetails?.ManagerInterview || candidateDetails?.["Manager Decision"] || candidateDetails?.FinalDecision || "",
    })
    setExpandedRound(0)
    
    // Fallback: Initial data comes from candidateDetails
    if (candidateDetails) {
      setCallRoundData(candidateDetails)
    } else {
      setCallRoundData(null)
    }
    
    fetchCallRoundData()
  }, [campaignName, candidateEmail, candidateDetails, fetchCallRoundData])

  const followupProgress = useCallback(() => {
    if (!candidateDetails) return null

    const rounds = [
      { key: "Call1", label: "Call 1", icon: Phone, colorStr: "blue",
        classes: {
            pastBg: "bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/40",
            pastIconBg: "bg-blue-500",
            pastText: "text-blue-300",
            connector: "bg-blue-500"
        }
      },
      { key: "Call2", label: "Call 2", icon: PhoneCall, colorStr: "cyan",
        classes: {
            pastBg: "bg-gradient-to-br from-cyan-500/20 to-sky-500/20 border-cyan-500/40",
            pastIconBg: "bg-cyan-500",
            pastText: "text-cyan-300",
            connector: "bg-cyan-500"
        }
      },
      { key: "Whatsapp", label: "Whatsapp", icon: MessageSquare, colorStr: "emerald",
        classes: {
            pastBg: "bg-gradient-to-br from-emerald-500/20 to-green-500/20 border-emerald-500/40",
            pastIconBg: "bg-emerald-500",
            pastText: "text-emerald-300",
            connector: "bg-emerald-500"
        }
      },
      { key: "FollowupMail1", label: "Mail 1", icon: Mail, colorStr: "violet",
        classes: {
            pastBg: "bg-gradient-to-br from-violet-500/20 to-purple-500/20 border-violet-500/40",
            pastIconBg: "bg-violet-500",
            pastText: "text-violet-300",
            connector: "bg-violet-500"
        }
      },
      { key: "FollowupMail2", label: "Mail 2", icon: Send, colorStr: "fuchsia",
        classes: {
            pastBg: "bg-gradient-to-br from-fuchsia-500/20 to-pink-500/20 border-fuchsia-500/40",
            pastIconBg: "bg-fuchsia-500",
            pastText: "text-fuchsia-300",
            connector: "bg-fuchsia-500"
        }
      },
    ]

    const stages = rounds.map((r) => {
      const value = (candidateDetails as any)[r.key]
      const isCompleted = !!value && value !== "" && value !== "N/A"
      return {
        ...r,
        value,
        isCompleted,
      }
    })

    const isResponded = !!(candidateDetails as any).Data && !!(candidateDetails as any).Answered

    return {
      stages,
      isResponded,
    }
  }, [candidateDetails])

  const followup = followupProgress()

  const toggleRound = (index: number) => {
    setExpandedRound(expandedRound === index ? -1 : index)
  }

  const handleSubmit = async () => {
    if (!formData.CampaignName || !formData.Email) {
      toast({
        title: "Missing Required Fields",
        description: "Campaign name and email are required.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Include all candidate details along with round decisions
      const submitData: any = {
        // Candidate details
        CampaignName: formData.CampaignName,
        Email: formData.Email,
        ...(candidateDetails ? {
          CandidateID: candidateDetails.CandidateID || "",
          Name: candidateDetails.Name || "",
          City: candidateDetails.City || "",
          PhoneNumber: candidateDetails.PhoneNumber || "",
          Experience: candidateDetails.Experience || "",
          RoleApplied: candidateDetails.RoleApplied || "",
          Score: candidateDetails.Score ?? "",
          HR: candidateDetails.HR || "",
          ResumeLink: candidateDetails.ResumeLink || "",
          ResumeSummary: candidateDetails.ResumeSummary || "",
          Strengths: candidateDetails.Strengths || "",
          Gaps: candidateDetails.Gaps || "",
          FitAnalysis: candidateDetails.FitAnalysis || "",
        } : {}),
      }

      console.log("[v0] Submitting candidate decision:", submitData)

      // 1. Move round statuses to Query Parameters
      // ONLY send the records that have actually been modified to prevent wiping other backend records
      const queryParams = new URLSearchParams({ action: "UpdateDecision" })

      const origResume = candidateDetails?.ResumeScreening || candidateDetails?.["Resume Decision"] || candidateDetails?.Decision || ""
      const origCall = candidateDetails?.CallRound || candidateDetails?.["Call Decision"] || candidateDetails?.["Call Status"] || ""
      const origHR = candidateDetails?.HRRound || candidateDetails?.["HR Decision"] || ""
      const origTech = candidateDetails?.TechInterviewRound || candidateDetails?.["Tech Decision"] || candidateDetails?.TechnicalInterview || ""
      const origManager = candidateDetails?.ManagerInterview || candidateDetails?.["Manager Decision"] || candidateDetails?.FinalDecision || ""

      if (formData["Resume Screening"] && formData["Resume Screening"] !== origResume) {
        queryParams.append("Resume Screening", formData["Resume Screening"])
      }
      if (formData["Call Round"] && formData["Call Round"] !== origCall) {
        queryParams.append("Call Round", formData["Call Round"])
      }
      if (formData["HR Round"] && formData["HR Round"] !== origHR) {
        queryParams.append("HR Round", formData["HR Round"])
      }
      if (formData["Tech Interview"] && formData["Tech Interview"] !== origTech) {
        queryParams.append("Tech Interview", formData["Tech Interview"])
      }
      if (formData["Manager Interview"] && formData["Manager Interview"] !== origManager) {
        queryParams.append("Manager Interview", formData["Manager Interview"])
      }

      // 2. Build Body with strictly static details + updated comments
      const bodyData: any = {
        CandidateID: candidateDetails?.CandidateID || "",
        Name: candidateDetails?.Name || "",
        Email: formData.Email,
        CampaignName: formData.CampaignName,
        City: candidateDetails?.City || "",
        PhoneNumber: candidateDetails?.PhoneNumber || "",
        Experience: candidateDetails?.Experience || "",
        RoleApplied: candidateDetails?.RoleApplied || "",
        Score: candidateDetails?.Score ?? "",
        HR: candidateDetails?.HR || "",
        ResumeLink: candidateDetails?.ResumeLink || "",
        ResumeSummary: candidateDetails?.ResumeSummary || "",
        Strengths: candidateDetails?.Strengths || "",
        Gaps: candidateDetails?.Gaps || "",
        FitAnalysis: candidateDetails?.FitAnalysis || "",
        "HR Comments": formData["HR Comments"],
        "Tech Comments": formData["Tech Comments"],
      }

      // Force URLSearchParams space formatting to use %20 instead of + for N8N payload matching
      const queryString = queryParams.toString().replace(/\+/g, '%20')

      const response = await fetch(`/api/webhook-proxy?${queryString}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      })

      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("[v0] API response:", data)

      toast({
        title: "Decision Updated",
        description: data.message || "Candidate record updated successfully.",
      })

      if (onSuccess) {
        setTimeout(() => {
          onSuccess()
        }, 2000)
      }
    } catch (error: any) {
      console.error("[v0] Decision update error:", error)
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update candidate decision.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Determine the call round decision value for the summary
  const callRoundDecision = formData["Call Round"] || callRoundData?.decision || callRoundData?.status || ""
  const callRoundDecisionNormalized =
    callRoundDecision.toLowerCase() === "yes" || callRoundDecision.toLowerCase() === "approved" || callRoundDecision.toLowerCase() === "passed"
      ? "Yes"
      : callRoundDecision.toLowerCase() === "no" || callRoundDecision.toLowerCase() === "rejected" || callRoundDecision.toLowerCase() === "failed"
        ? "No"
        : ""

  // Define the editable rounds pipeline
  const rounds = [
    {
      title: "Resume Screening",
      icon: <FileSearch className="size-4" />,
      iconColor: "text-violet-400",
      barColor: "bg-violet-500",
      valueKey: "Resume Screening" as const,
      hasComments: false,
    },
    // Call Round is handled separately (read-only, index 1)
    {
      title: "HR Round",
      icon: <Phone className="size-4" />,
      iconColor: "text-blue-400",
      barColor: "bg-blue-500",
      valueKey: "HR Round" as const,
      hasComments: true,
      commentsKey: "HR Comments" as const,
    },
    {
      title: "Tech Interview",
      icon: <Briefcase className="size-4" />,
      iconColor: "text-amber-400",
      barColor: "bg-amber-500",
      valueKey: "Tech Interview" as const,
      hasComments: true,
      commentsKey: "Tech Comments" as const,
    },
    {
      title: "Manager Interview",
      icon: <UserCog className="size-4" />,
      iconColor: "text-emerald-400",
      barColor: "bg-emerald-500",
      valueKey: "Manager Interview" as const,
      hasComments: false,
    },
  ]

  // Map NumberOfRounds to which rounds to show
  // 0: Resume Screening (Always index 0)
  // 1: HR Round (Index 1)
  // 2: Tech Interview (Index 2)
  // 3: Manager Interview (Index 3)
  const visibleRounds = [rounds[0]] // Always show Resume Screening
  if (numberOfRounds >= 1) visibleRounds.push(rounds[1]) // HR
  if (numberOfRounds >= 2) {
    const techRound = { ...rounds[2] }
    if (numberOfRounds === 2) techRound.title = "Final"
    visibleRounds.push(techRound) // Tech or Final
  }
  if (numberOfRounds >= 3) visibleRounds.push(rounds[3]) // Manager

  // Total rounds for numbering (visible editable rounds + 1 read-only call round)
  const totalRounds = visibleRounds.length + 1

// Recursive component to render structured data (objects/arrays) beautifully
function StructuredValue({ 
  value, 
  depth = 0 
}: { 
  value: any 
  depth?: number 
}) {
  if (value === null || value === undefined) return <span className="text-slate-600 italic">No data</span>

  // Handle booleans
  if (typeof value === "boolean") {
    return (
      <span className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
        value 
          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
          : "bg-red-500/10 text-red-400 border border-red-500/20"
      )}>
        {value ? "Yes" : "No"}
      </span>
    )
  }

  // Handle primitives and pattern-based string parsing
  if (typeof value !== "object") {
    if (typeof value === "string") {
      const trimmed = value.trim()
      
      // 1. Check for JSON
      if ((trimmed.startsWith("{") && trimmed.endsWith("}")) || (trimmed.startsWith("[") && trimmed.endsWith("]"))) {
        try {
          const parsed = JSON.parse(trimmed)
          return <StructuredValue value={parsed} depth={depth} />
        } catch { /* ignore and continue */ }
      }

      // 2. Check for specific Question/Answer/Explanation pattern
      // Pattern: Question: [Q] Answer: [A] OR Q: [Q] A: [A]
      const qaPattern = /(?:Question|Q):\s*([\s\S]*?)\s*(?:Answer|A):\s*([\s\S]*?)(?=\s*(?:Question|Q):|$)/gi
      const qaMatches = [...trimmed.matchAll(qaPattern)]

      if (qaMatches.length > 0) {
        return (
          <div className="space-y-4 mt-2">
            {qaMatches.map((match, i) => {
              const q = match[1].trim()
              const rawA = match[2].trim()
              let a = rawA
              let e = ""
              
              // Try to split into Answer - Explanation if it follows that sub-pattern
              if (rawA.includes(" - ")) {
                const parts = rawA.split(" - ")
                if (parts[0].length < 30) {
                  a = parts[0].trim()
                  e = parts.slice(1).join(" - ").trim()
                }
              }

              const aLower = a.toLowerCase()
              const isPositive = aLower === "yes" || aLower === "approved" || aLower === "passed" || aLower.startsWith("yes ")
              const isNegative = aLower === "no" || aLower === "rejected" || aLower === "failed" || aLower.startsWith("no ")

              // For very long answers that aren't split by " - ", treat the whole thing as the 'explanation' and use a summary label
              const isLongAnswer = a.length > 40 && !e
              if (isLongAnswer && !isPositive && !isNegative) {
                e = a
                a = "Detailed Response"
              }

              return (
                <div key={i} className="flex flex-col gap-2.5 p-4 rounded-xl bg-slate-900/40 border border-slate-700/50 group/qa hover:shadow-md transition-all shadow-sm overflow-hidden">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3 flex-1 min-w-0">
                      <div className="size-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/20">
                        <span className="text-emerald-500/80 text-[10px] font-bold">Q</span>
                      </div>
                      <span className="text-slate-200 text-sm font-semibold leading-relaxed break-words">
                        {q}
                      </span>
                    </div>
                    <span className={cn(
                      "text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider border h-fit transition-all max-w-[140px] whitespace-normal text-right leading-tight",
                      isPositive ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.1)]" :
                      isNegative ? "bg-red-500/15 text-red-400 border-red-500/30 shadow-[0_0_8px_rgba(239,68,68,0.1)]" :
                      "bg-slate-700/50 text-slate-300 border-slate-600/50"
                    )}>
                      {a}
                    </span>
                  </div>
                  {e && e !== "null" && e !== "" && e.toLowerCase() !== "none" && (
                    <div className="mt-1 ml-8 flex flex-col gap-1.5 bg-muted/30 p-3 rounded-lg border border-border">
                      <div className="flex items-center gap-2">
                        <div className="h-px w-3 bg-border" />
                        <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">
                          {isLongAnswer ? "Response Content" : "Candidate Explanation"}
                        </span>
                      </div>
                      <span className="text-muted-foreground text-xs italic leading-relaxed pl-1">
                        "{e}"
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )
      }

      // 3. Check for Questionnaire Pattern (Question?: ANSWER Question?: ANSWER)
      // This pattern is common in chatbot/IVR data strings where answers are YES/NO/MAYBE
      const qPattern = /([^?]+\?\s*:\s*(?:YES|NO|MAYBE|[\w\s]{1,50}))/gi
      const matches = [...trimmed.matchAll(qPattern)]
      
      if (matches.length > 1) {
        return (
          <div className="space-y-3 mt-2 relative">
            {depth > 0 && <div className="absolute left-[-12px] top-2 bottom-2 w-px bg-border/60" />}
            {matches.map((match, i) => {
              const pair = match[1]
              // Split into question and answer at the first colon
              const colonIdx = pair.indexOf(':')
              const q = pair.substring(0, colonIdx).trim()
              const a = pair.substring(colonIdx + 1).trim()
              
              const isPositive = a.toUpperCase() === "YES"
              const isNegative = a.toUpperCase() === "NO"

              return (
                <div key={i} className="flex flex-col gap-1.5 p-3 rounded-lg bg-slate-900/40 border border-slate-700/50 group/qa hover:shadow-sm transition-all shadow-sm">
                  <span className="text-slate-400 text-[11px] font-medium leading-relaxed group-hover/qa:text-slate-200">
                    {q}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border whitespace-normal max-w-full leading-tight",
                      isPositive ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" :
                      isNegative ? "bg-red-500/15 text-red-400 border-red-500/30" :
                      "bg-slate-700/50 text-slate-300 border-slate-600/50"
                    )}>
                      {a}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )
      }
    }
    return <span className="text-foreground wrap-break-word leading-relaxed">{String(value)}</span>
  }

  // Handle arrays
  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-muted-foreground italic">Empty List</span>
    return (
      <div className="space-y-2 mt-1 relative">
        {/* Connector line for nested items */}
        {depth > 0 && <div className="absolute left-[-12px] top-2 bottom-2 w-px bg-slate-700/60" />}
        {value.map((item, i) => (
          <div key={i} className="flex gap-2 group">
            <span className="text-emerald-500/60 text-[10px] mt-1.5 font-bold shrink-0">[{i}]</span>
            <div className="flex-1 min-w-0">
              <StructuredValue value={item} depth={depth + 1} />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Handle objects
  const entries = Object.entries(value)
  if (entries.length === 0) return <span className="text-slate-600 italic">Empty Object</span>

  return (
    <div className="space-y-3 mt-1 relative">
      {/* Connector line for nested items */}
      {depth > 0 && <div className="absolute left-[-12px] top-2 bottom-2 w-px bg-slate-700/60" />}
      {entries.map(([k, v]) => {
        // Skip some internal fields if they might clutter the UI
        const displayKey = k
          .replace(/([A-Z])/g, ' $1') // Space before capitals
          .replace(/[_-]/g, ' ')   // Underscores/hyphens to spaces
          .trim()

        return (
          <div key={k} className="space-y-1 group">
            <span className="text-slate-500 text-[9px] uppercase font-bold tracking-widest block group-hover:text-slate-400 transition-colors">
              {displayKey}
            </span>
            <div className="min-w-0 overflow-hidden">
              <StructuredValue value={v} depth={depth + 1} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

  // Helper to render the call round data fields
  const renderCallDataField = (label: string, value: any) => {
    if (value === undefined || value === null || value === "") return null

    const displayLabel = label.toUpperCase() === "DATA" ? "Detailed Feedback" : label

    const isComplex = typeof value === "object" || (
      typeof value === "string" && (
        value.trim().startsWith("{") || 
        value.trim().startsWith("[") ||
        (value.includes("?:") && value.includes("?")) ||
        value.includes("Question:") ||
        (value.includes("Q:") && value.includes("A:"))
      )
    )

    if (isComplex) {
      return (
        <div className="space-y-2 pt-2 first:pt-0">
          <div className="flex items-center gap-2">
            <MessageSquare className="size-3 text-emerald-400/70" />
            <span className="text-emerald-400 text-[10px] uppercase font-black tracking-widest">{displayLabel}</span>
            <div className="flex-1 h-px bg-border" />
          </div>
          <div className="bg-slate-900/60 rounded-xl px-2 py-3 border border-slate-700/50 shadow-inner group/card hover:border-emerald-500/30 transition-colors">
            <StructuredValue value={value} />
          </div>
        </div>
      )
    }

    return (
      <div className="flex items-start gap-3 py-2 border-b border-border last:border-0 group">
        <span className="text-muted-foreground shrink-0 min-w-[90px] text-xs font-semibold group-hover:text-foreground transition-colors">
          {displayLabel}:
        </span>
        <span className="text-foreground text-sm break-all leading-tight">
          {String(value)}
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h3 className="text-xl font-bold text-foreground mb-1">Candidate Evaluation</h3>
        <p className="text-sm text-muted-foreground">Step-by-step round decisions</p>
      </div>

      <Separator className="bg-border" />

      {/* Candidate Info */}
      <Card className="bg-muted/30 border-border">
        <CardContent className="py-3 px-4 space-y-2">
          <div className="flex items-center gap-3 text-sm">
            <User className="size-4 text-emerald-500 shrink-0" />
            <span className="text-muted-foreground">Campaign:</span>
            <span className="text-foreground font-medium truncate">{campaignName}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Mail className="size-4 text-blue-500 shrink-0" />
            <span className="text-muted-foreground">Email:</span>
            <span className="text-foreground font-medium truncate">{candidateEmail}</span>
          </div>
        </CardContent>
      </Card>

      {/* Rounds Pipeline */}
      <div className="space-y-2">
        <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
          Interview Pipeline
        </Label>

        <div className="relative">
          <div className="space-y-1.5 relative z-10">

            {/* ── Round 1: Resume Screening (editable) ── */}
            {(() => {
              const round = rounds[0]
              const value = formData[round.valueKey] || ""
              const isExpanded = expandedRound === 0
              const isDecided = value === "Yes" || value === "No"

              return (
                <div
                  className={cn(
                    "rounded-xl border transition-all duration-200 overflow-hidden",
                    isExpanded
                      ? "bg-slate-800/70 border-slate-600/60 shadow-lg"
                      : "bg-slate-800/30 border-slate-700/40 hover:border-slate-600/50"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => toggleRound(0)}
                    className="w-full flex items-center gap-3 px-3 py-3 text-left"
                  >
                    <div
                      className={cn(
                        "size-[38px] shrink-0 rounded-full flex items-center justify-center border-2 transition-colors",
                        isDecided
                          ? value === "Yes" ? "bg-emerald-500/20 border-emerald-500/50" : "bg-red-500/20 border-red-500/50"
                          : "bg-muted border-border"
                      )}
                    >
                      <span className={cn(round.iconColor, isDecided && value === "Yes" && "text-emerald-400", isDecided && value === "No" && "text-red-400")}>
                        {round.icon}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">{round.title}</span>
                        <StatusPill value={value} />
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Round 1 of {totalRounds}</p>
                    </div>
                    {isExpanded ? <ChevronUp className="size-4 text-muted-foreground shrink-0" /> : <ChevronDown className="size-4 text-muted-foreground shrink-0" />}
                  </button>

                  {isExpanded && (
                    <div className="px-2 pb-4 pt-1 space-y-3 border-t border-border">
                      <div className={cn("h-0.5 w-12 rounded-full", round.barColor, "opacity-60")} />
                      <div className="space-y-2">
                        <Label className="text-muted-foreground text-xs">Decision</Label>
                        <DecisionButtons
                          value={value}
                          onChange={(v) => setFormData({ ...formData, [round.valueKey]: v })}
                          disabled={isSubmitting}
                        />
                      </div>

                      {candidateDetails?.MailSent && (
                        <div className="mt-4 pt-4 border-t border-border space-y-2 text-left">
                          <Label className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider flex items-center gap-2">
                            <Mail className="size-3 text-blue-500" />
                            Email Confirmation
                          </Label>
                          <div className="bg-muted/40 p-3 rounded-lg border border-border shadow-inner">
                             <p className="text-sm text-foreground font-medium">{candidateDetails.MailSent}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })()}

            {/* ── Round 2: Call Round (read-only from webhook) ── */}
            {(() => {
              const isExpanded = expandedRound === 1
              const hasData = !!callRoundData
              const isDecided = callRoundDecisionNormalized === "Yes" || callRoundDecisionNormalized === "No"

              return (
                <div
                  className={cn(
                    "rounded-xl border transition-all duration-200 overflow-hidden",
                    isExpanded
                      ? "bg-muted/60 border-cyan-500/30 shadow-lg"
                      : "bg-muted/20 border-border hover:border-border"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => toggleRound(1)}
                    className="w-full flex items-center gap-3 px-3 py-3 text-left"
                  >
                    <div
                      className={cn(
                        "size-[38px] shrink-0 rounded-full flex items-center justify-center border-2 transition-colors",
                        isDecided
                          ? callRoundDecisionNormalized === "Yes" ? "bg-emerald-500/20 border-emerald-500/50" : "bg-red-500/20 border-red-500/50"
                          : "bg-muted border-cyan-500/40"
                      )}
                    >
                      <PhoneCall className={cn(
                        "size-4",
                        isDecided
                          ? callRoundDecisionNormalized === "Yes" ? "text-emerald-400" : "text-red-400"
                          : "text-cyan-400"
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">Call Round</span>
                        {isLoadingCallData ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-cyan-500/15 text-cyan-400">
                            <Loader2 className="size-3 animate-spin" />
                            Loading
                          </span>
                        ) : hasData ? (
                          <StatusPill value={callRoundDecisionNormalized} />
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground">
                            <Info className="size-3" />
                            Awaiting Data
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Round 2 of {totalRounds} - Data from webhook</p>
                    </div>
                    {isExpanded ? <ChevronUp className="size-4 text-muted-foreground shrink-0" /> : <ChevronDown className="size-4 text-muted-foreground shrink-0" />}
                  </button>

                  {isExpanded && (
                    <div className="px-2 pb-4 pt-1 space-y-3 border-t border-border">
                      <div className="h-0.5 w-12 rounded-full bg-cyan-500 opacity-60" />

                      {/* Manual Decision Override */}
                      <div className="space-y-2">
                        <Label className="text-muted-foreground text-xs">Manual Decision</Label>
                        <DecisionButtons
                          value={formData["Call Round"] || ""}
                          onChange={(v) => setFormData({ ...formData, "Call Round": v })}
                          disabled={isSubmitting}
                        />
                        {callRoundData?.decision && !formData["Call Round"] && (
                          <p className="text-[10px] text-cyan-400/70 flex items-center gap-1 mt-1">
                            <Info className="size-3" />
                            Showing status from webhook. Select above to override.
                          </p>
                        )}
                      </div>

                      <Separator className="bg-border my-2" />

                      {isLoadingCallData ? (
                        <div className="flex items-center justify-center py-6 gap-2 text-slate-400 text-sm">
                          <Loader2 className="size-4 animate-spin" />
                          Fetching call data...
                        </div>
                       ) : callRoundData ? (
                         <div className="space-y-3">
                            {/* Data from Webhook Label */}
                            <div className="flex items-center gap-2">
                              <Label className="text-muted-foreground text-[10px] uppercase font-black tracking-widest">Automated Call Results</Label>
                              <div className="flex-1 h-px bg-border" />
                              <div className="size-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                            </div>

                            {/* Decision display */}
                            {callRoundData.decision && (
                              <div className="space-y-1.5">
                                <Label className="text-muted-foreground text-xs">Call Decision</Label>
                                <div className={cn(
                                  "flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-bold shadow-lg",
                                  callRoundDecisionNormalized === "Yes"
                                    ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-emerald-500/5"
                                    : "bg-red-500/10 border-red-500/40 text-red-400 shadow-red-500/5"
                                )}>
                                  {callRoundDecisionNormalized === "Yes" ? (
                                    <div className="size-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                      <CheckCircle2 className="size-4" />
                                    </div>
                                  ) : (
                                    <div className="size-6 rounded-full bg-red-500/20 flex items-center justify-center">
                                      <XCircle className="size-4" />
                                    </div>
                                  )}
                                  {callRoundData.decision}
                                </div>
                              </div>
                            )}

                             {/* Automated call results - only shows call-specific data */}
                             <div className="space-y-3 bg-muted/30 px-2 py-3 rounded-xl border border-border shadow-inner">
                               {renderCallDataField("Called By", callRoundData.calledBy || callRoundData.CalledBy || callRoundData["Called By"])}
                               {renderCallDataField("Call Date", callRoundData.callDate || callRoundData.CallDate || callRoundData["Call Date"])}
                               {renderCallDataField("Duration", callRoundData.duration || callRoundData.Duration)}
                               {/* The main questionnaire/evaluation answers */}
                               {renderCallDataField("DATA", callRoundData.data || callRoundData.Data || callRoundData["data"])}

                               {/* Call Recording */}
                               {(callRoundData.callRecording || callRoundData.CallRecording || (candidateDetails && candidateDetails.CallRecording)) && (
                                 <div className="pt-2 mt-2 border-t border-border space-y-2">
                                   <div className="flex items-center gap-2">
                                     <Phone className="size-3 text-cyan-400/70" />
                                     <span className="text-cyan-400 text-[10px] uppercase font-black tracking-widest">Call Recording</span>
                                     <div className="flex-1 h-px bg-border" />
                                   </div>
                                   <Button
                                     variant="outline"
                                     size="sm"
                                     onClick={() => {
                                       const link = callRoundData.callRecording || callRoundData.CallRecording || candidateDetails?.CallRecording;
                                       if (link) window.open(link, "_blank");
                                     }}
                                     className="w-full h-10 bg-cyan-500/10 border-cyan-500/30 hover:bg-cyan-500/20 text-cyan-400 text-xs font-bold gap-2 group transition-all"
                                   >
                                     <ExternalLink className="size-4 group-hover:scale-110 transition-transform" />
                                     Open Call Recording
                                   </Button>
                                 </div>
                               )}

                               {/* Followup Stages Section */}
                               {followup && (
                                 <div className="pt-2 mt-2 border-t border-border">
                                   <div className="flex items-center justify-between mb-3">
                                     <div className="flex items-center gap-2">
                                       <MessageCircle className="size-3 text-emerald-400" />
                                       <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Followup Stages</span>
                                     </div>
                                     {followup.isResponded && (
                                       <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[9px] px-1.5 py-0 h-4 uppercase tracking-tighter">
                                         <CheckCircle className="size-2.5 mr-1" />
                                         Responded
                                       </Badge>
                                     )}
                                   </div>

                                    <div className="grid grid-cols-5 gap-1.5">
                                      {followup.stages.map((stage, index) => {
                                        const isCompleted = stage.isCompleted
                                        
                                        let bgClass = "bg-muted/50 border-border"
                                        let iconBg = "bg-muted"
                                        let iconColor = "text-muted-foreground"
                                        let textClass = "text-muted-foreground/60"
                                        
                                        if (isCompleted) {
                                          bgClass = stage.classes.pastBg.replace('from-blue-500/20', 'from-blue-500/10') // subtle
                                          iconBg = stage.classes.pastIconBg
                                          iconColor = "text-white"
                                          textClass = stage.classes.pastText
                                        }
                                        
                                        const Icon = stage.icon

                                        return (
                                          <div 
                                            key={stage.key} 
                                            className={cn(
                                              "flex flex-col items-center justify-center gap-1.5 py-2.5 px-1 rounded-xl border transition-all text-center h-full",
                                              bgClass
                                            )}
                                          >
                                            <div className={cn("size-7 rounded-full flex items-center justify-center shadow-sm shrink-0", iconBg)}>
                                              <Icon className={cn("size-3.5", iconColor)} />
                                            </div>
                                            <div className="space-y-0.5 min-w-0 w-full">
                                              <span className={cn("text-[8px] sm:text-[9px] font-black leading-tight block truncate uppercase tracking-tighter", textClass)}>
                                                {stage.label}
                                              </span>
                                              <p className="text-[7px] sm:text-[8px] text-muted-foreground font-bold truncate">
                                                {isCompleted ? String(stage.value) : "—"}
                                              </p>
                                            </div>
                                          </div>
                                        )
                                      })}
                                    </div>
                                 </div>
                               )}
                             </div>

                            {/* Refresh button with improved design */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => fetchCallRoundData()}
                              disabled={isLoadingCallData}
                              className="w-full h-9 text-xs text-muted-foreground hover:text-foreground border-border bg-muted/20 hover:bg-muted/60 rounded-lg group transition-all"
                            >
                              <RefreshCcw className={cn("size-3 mr-2 group-hover:rotate-180 transition-transform duration-500", isLoadingCallData && "animate-spin")} />
                              {isLoadingCallData ? "Fetching Updates..." : "Refresh Call Data"}
                            </Button>
                         </div>
                      ) : (
                        <div className="text-center py-5 space-y-3">
                          <div className="size-10 mx-auto rounded-full bg-muted flex items-center justify-center">
                            <PhoneCall className="size-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">No call data available yet</p>
                            <p className="text-[11px] text-muted-foreground/60 mt-0.5">Data will appear here once the call round is completed</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => fetchCallRoundData()}
                            disabled={isLoadingCallData}
                            className="text-xs text-cyan-400 hover:text-cyan-300"
                          >
                            <RefreshCcw className="size-3 mr-1.5" />
                            Check Again
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })()}

            {/* ── Rounds 3-5: HR, Tech, Manager (editable) ── */}
            {visibleRounds.slice(1).map((round, i) => {
              const actualIndex = i + 2 // offset by 2 (Resume=0, Call=1, then HR=2, Tech=3, Manager=4)
              const value = formData[round.valueKey] || ""
              const isExpanded = expandedRound === actualIndex
              const isDecided = value === "Yes" || value === "No"

              return (
                <div
                  key={round.title}
                  className={cn(
                    "rounded-xl border transition-all duration-200 overflow-hidden",
                    isExpanded
                      ? "bg-muted/60 border-border shadow-lg"
                      : "bg-muted/20 border-border hover:border-border"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => toggleRound(actualIndex)}
                    className="w-full flex items-center gap-3 px-3 py-3 text-left"
                  >
                    <div
                      className={cn(
                        "size-[38px] shrink-0 rounded-full flex items-center justify-center border-2 transition-colors",
                        isDecided
                          ? value === "Yes" ? "bg-emerald-500/20 border-emerald-500/50" : "bg-red-500/20 border-red-500/50"
                          : "bg-muted border-border"
                      )}
                    >
                      <span className={cn(round.iconColor, isDecided && value === "Yes" && "text-emerald-400", isDecided && value === "No" && "text-red-400")}>
                        {round.icon}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">{round.title}</span>
                        <StatusPill value={value} />
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Round {actualIndex + 1} of {totalRounds}
                      </p>
                    </div>

                    {isExpanded ? <ChevronUp className="size-4 text-muted-foreground shrink-0" /> : <ChevronDown className="size-4 text-muted-foreground shrink-0" />}
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 space-y-3 border-t border-border">
                      <div className={cn("h-0.5 w-12 rounded-full", round.barColor, "opacity-60")} />

                      <div className="space-y-2">
                        <Label className="text-muted-foreground text-xs">Decision</Label>
                        <DecisionButtons
                          value={value}
                          onChange={(v) => setFormData({ ...formData, [round.valueKey]: v })}
                          disabled={isSubmitting}
                        />
                      </div>
                      
                      {round.title === "HR Round" && (candidateDetails?.HRMeetingDate || candidateDetails?.HRMeetingTime) && (
                        <div className="bg-blue-500/5 rounded-lg p-3 border border-blue-500/10 space-y-3">
                          <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <Clock className="size-3" />
                            HR Meeting Schedule
                          </p>
                          <div className="grid grid-cols-2 gap-4">
                            {candidateDetails.HRMeetingDate && (
                              <div>
                                <p className="text-[10px] text-muted-foreground">Date</p>
                                <p className="text-xs text-foreground font-medium">{candidateDetails.HRMeetingDate}</p>
                              </div>
                            )}
                            {candidateDetails.HRMeetingTime && (
                              <div>
                                <p className="text-[10px] text-muted-foreground">Time</p>
                                <p className="text-xs text-foreground font-medium">{candidateDetails.HRMeetingTime}</p>
                              </div>
                            )}
                            {candidateDetails.HREventID && (
                              <div>
                                <p className="text-[10px] text-muted-foreground">Event ID</p>
                                <p className="text-[10px] text-foreground font-mono truncate">{candidateDetails.HREventID}</p>
                              </div>
                            )}
                            {candidateDetails.HRMeetingType && (
                              <div>
                                <p className="text-[10px] text-muted-foreground">Meeting Type</p>
                                <p className="text-xs text-foreground font-medium">{candidateDetails.HRMeetingType}</p>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {candidateDetails.HRMeetingLink && (
                              <Button 
                                size="sm"
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-xs font-bold gap-2"
                                onClick={() => window.open(candidateDetails.HRMeetingLink, "_blank")}
                              >
                                <ExternalLink className="size-3.5" />
                                Join Meeting Now
                              </Button>
                            )}
                            {candidateDetails.HREventID && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 border-blue-500/40 text-blue-400 hover:bg-blue-500/10 text-xs font-bold gap-2"
                                onClick={() => openReschedule(
                                  "hr",
                                  candidateDetails.HR || "",
                                  candidateDetails.HREventID || ""
                                )}
                              >
                                <CalendarClock className="size-3.5" />
                                Reschedule
                              </Button>
                            )}
                          </div>
                        </div>
                      )}

                      {round.title === "HR Round" && (candidateDetails?.HRMeetingMail || candidateDetails?.HRWAFollowup) && (
                        <div className="space-y-2 pt-1">
                          {candidateDetails.HRMeetingMail && (
                            <div className="bg-muted/40 p-3 rounded-lg border border-border shadow-inner flex items-start gap-3">
                              <Mail className="size-3.5 text-blue-400 mt-0.5 shrink-0" />
                              <div>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">HR Meeting Mail Sent</p>
                                <p className="text-xs text-foreground mt-0.5">{candidateDetails.HRMeetingMail}</p>
                              </div>
                            </div>
                          )}
                          {candidateDetails.HRWAFollowup && (
                            <div className="bg-muted/40 p-3 rounded-lg border border-border shadow-inner flex items-start gap-3">
                              <MessageCircle className="size-3.5 text-emerald-400 mt-0.5 shrink-0" />
                              <div>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">WhatsApp Notification Date</p>
                                <p className="text-xs text-foreground mt-0.5">{candidateDetails.HRWAFollowup}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {round.title === "Tech Interview" && (candidateDetails?.TechMeetingDate || candidateDetails?.TechMeetingTime) && (
                        <div className="bg-amber-500/5 rounded-lg p-3 border border-amber-500/10 space-y-3">
                          <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <Clock className="size-3" />
                            Tech Interview Schedule
                          </p>
                          <div className="grid grid-cols-2 gap-4">
                            {candidateDetails.TechMeetingDate && (
                              <div>
                                <p className="text-[10px] text-muted-foreground">Date</p>
                                <p className="text-xs text-foreground font-medium">{candidateDetails.TechMeetingDate}</p>
                              </div>
                            )}
                            {candidateDetails.TechMeetingTime && (
                              <div>
                                <p className="text-[10px] text-muted-foreground">Time</p>
                                <p className="text-xs text-foreground font-medium">{candidateDetails.TechMeetingTime}</p>
                              </div>
                            )}
                            {candidateDetails.TechEventID && (
                              <div>
                                <p className="text-[10px] text-muted-foreground">Event ID</p>
                                <p className="text-[10px] text-foreground font-mono truncate">{candidateDetails.TechEventID}</p>
                              </div>
                            )}
                            {candidateDetails.TechMeetingType && (
                              <div>
                                <p className="text-[10px] text-muted-foreground">Meeting Type</p>
                                <p className="text-xs text-foreground font-medium">{candidateDetails.TechMeetingType}</p>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {candidateDetails.TechMeetingLink && (
                              <Button 
                                size="sm"
                                className="flex-1 bg-amber-600 hover:bg-amber-700 text-xs font-bold gap-2"
                                onClick={() => window.open(candidateDetails.TechMeetingLink, "_blank")}
                              >
                                <ExternalLink className="size-3.5" />
                                Join Tech Interview
                              </Button>
                            )}
                            {candidateDetails.TechEventID && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 border-amber-500/40 text-amber-400 hover:bg-amber-500/10 text-xs font-bold gap-2"
                                onClick={() => openReschedule(
                                  "tech",
                                  candidateDetails.TIAssigned || "",
                                  candidateDetails.TechEventID || ""
                                )}
                              >
                                <CalendarClock className="size-3.5" />
                                Reschedule
                              </Button>
                            )}
                          </div>
                        </div>
                      )}

                      {round.title === "Tech Interview" && (candidateDetails?.TechMailSent || candidateDetails?.TechWAFollowup) && (
                        <div className="space-y-2 pt-1">
                          {candidateDetails.TechMailSent && (
                            <div className="bg-muted/40 p-3 rounded-lg border border-border shadow-inner flex items-start gap-3">
                              <Mail className="size-3.5 text-blue-400 mt-0.5 shrink-0" />
                              <div>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Tech Mail Sent</p>
                                <p className="text-xs text-foreground mt-0.5">{candidateDetails.TechMailSent}</p>
                              </div>
                            </div>
                          )}
                          {candidateDetails.TechWAFollowup && (
                            <div className="bg-muted/40 p-3 rounded-lg border border-border shadow-inner flex items-start gap-3">
                              <MessageCircle className="size-3.5 text-emerald-400 mt-0.5 shrink-0" />
                              <div>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Tech WA Followup</p>
                                <p className="text-xs text-foreground mt-0.5">{candidateDetails.TechWAFollowup}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {round.title === "Manager Interview" && (candidateDetails?.ManagerMeetingDate || candidateDetails?.ManagerMeetingTime) && (
                        <div className="bg-violet-500/5 rounded-lg p-3 border border-violet-500/10 space-y-3">
                          <p className="text-[10px] text-violet-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <Clock className="size-3" />
                            Manager Interview Schedule
                          </p>
                          <div className="grid grid-cols-2 gap-4">
                            {candidateDetails.ManagerMeetingDate && (
                              <div>
                                <p className="text-[10px] text-muted-foreground">Date</p>
                                <p className="text-xs text-foreground font-medium">{candidateDetails.ManagerMeetingDate}</p>
                              </div>
                            )}
                            {candidateDetails.ManagerMeetingTime && (
                              <div>
                                <p className="text-[10px] text-muted-foreground">Time</p>
                                <p className="text-xs text-foreground font-medium">{candidateDetails.ManagerMeetingTime}</p>
                              </div>
                            )}
                            {candidateDetails.ManagerEventID && (
                              <div>
                                <p className="text-[10px] text-muted-foreground">Meeting Type (Walk-in/Online)</p>
                                <p className="text-[10px] text-foreground font-mono truncate">{candidateDetails.ManagerEventID}</p>
                              </div>
                            )}
                            {candidateDetails.ManagerMeetingType && (
                              <div>
                                <p className="text-[10px] text-muted-foreground">HR Defined Type</p>
                                <p className="text-xs text-foreground font-medium">{candidateDetails.ManagerMeetingType}</p>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {candidateDetails.ManagerMeetingLink && (
                              <Button 
                                size="sm"
                                className="flex-1 bg-violet-600 hover:bg-violet-700 text-xs font-bold gap-2"
                                onClick={() => window.open(candidateDetails.ManagerMeetingLink, "_blank")}
                              >
                                <ExternalLink className="size-3.5" />
                                Join Manager Interview
                              </Button>
                            )}
                            {candidateDetails.ManagerEventID && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 border-violet-500/40 text-violet-400 hover:bg-violet-500/10 text-xs font-bold gap-2"
                                onClick={() => openReschedule(
                                  "manager",
                                  candidateDetails.ManagerAssigned || candidateDetails.HR || "",
                                  candidateDetails.ManagerEventID || ""
                                )}
                              >
                                <CalendarClock className="size-3.5" />
                                Reschedule
                              </Button>
                            )}
                          </div>
                        </div>
                      )}

                      {round.title === "Manager Interview" && (candidateDetails?.ManagerMeetingMail || candidateDetails?.ManagerWAFollowup) && (
                        <div className="space-y-2 pt-1">
                          {candidateDetails.ManagerMeetingMail && (
                            <div className="bg-muted/40 p-3 rounded-lg border border-border shadow-inner flex items-start gap-3">
                              <Mail className="size-3.5 text-blue-400 mt-0.5 shrink-0" />
                              <div>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Manager Meeting Mail Sent</p>
                                <p className="text-xs text-foreground mt-0.5">{candidateDetails.ManagerMeetingMail}</p>
                              </div>
                            </div>
                          )}
                          {candidateDetails.ManagerWAFollowup && (
                            <div className="bg-muted/40 p-3 rounded-lg border border-border shadow-inner flex items-start gap-3">
                              <MessageCircle className="size-3.5 text-emerald-400 mt-0.5 shrink-0" />
                              <div>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Manager WA Followup</p>
                                <p className="text-xs text-foreground mt-0.5">{candidateDetails.ManagerWAFollowup}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {round.hasComments && round.commentsKey && (
                        <div className="space-y-2">
                          <Label className="text-muted-foreground text-xs flex items-center gap-1.5">
                            <MessageSquare className="size-3" />
                            Comments
                          </Label>
                          <Textarea
                            placeholder={`Add notes for ${round.title}...`}
                            value={formData[round.commentsKey] || ""}
                            onChange={(e) =>
                              setFormData({ ...formData, [round.commentsKey!]: e.target.value })
                            }
                            disabled={isSubmitting}
                            className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground min-h-[80px] text-sm"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Overall Summary */}
      <Card className="bg-muted/20 border-border">
        <CardContent className="py-3 px-4">
          <div className="grid grid-cols-5 gap-1.5 text-center">
            {/* Resume Screening */}
            {(() => {
              const v = formData["Resume Screening"] || ""
              return (
                <div className="space-y-1">
                  <div className={cn("size-7 mx-auto rounded-full flex items-center justify-center", v === "Yes" ? "bg-emerald-500/20" : v === "No" ? "bg-red-500/20" : "bg-muted")}>
                    {v === "Yes" ? <CheckCircle2 className="size-3.5 text-emerald-500" /> : v === "No" ? <XCircle className="size-3.5 text-red-500" /> : <Clock className="size-3.5 text-muted-foreground" />}
                  </div>
                  <p className="text-[9px] text-muted-foreground font-medium leading-tight">Resume</p>
                </div>
              )
            })()}

            {/* Call Round */}
            <div className="space-y-1">
              <div className={cn("size-7 mx-auto rounded-full flex items-center justify-center", callRoundDecisionNormalized === "Yes" ? "bg-emerald-500/20" : callRoundDecisionNormalized === "No" ? "bg-red-500/20" : "bg-muted")}>
                {callRoundDecisionNormalized === "Yes" ? <CheckCircle2 className="size-3.5 text-emerald-500" /> : callRoundDecisionNormalized === "No" ? <XCircle className="size-3.5 text-red-500" /> : isLoadingCallData ? <Loader2 className="size-3.5 text-cyan-500 animate-spin" /> : <PhoneCall className="size-3.5 text-muted-foreground" />}
              </div>
              <p className="text-[9px] text-muted-foreground font-medium leading-tight">Call</p>
            </div>

            {/* HR, Tech, Manager */}
            {rounds.slice(1).map((round) => {
              const v = formData[round.valueKey] || ""
              return (
                <div key={round.title} className="space-y-1">
                  <div className={cn("size-7 mx-auto rounded-full flex items-center justify-center", v === "Yes" ? "bg-emerald-500/20" : v === "No" ? "bg-red-500/20" : "bg-muted")}>
                    {v === "Yes" ? <CheckCircle2 className="size-3.5 text-emerald-500" /> : v === "No" ? <XCircle className="size-3.5 text-red-500" /> : <Clock className="size-3.5 text-muted-foreground" />}
                  </div>
                  <p className="text-[9px] text-muted-foreground font-medium leading-tight">
                    {round.title.split(" ")[0]}
                  </p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Separator className="bg-border" />

      {/* Submit */}
      {!hideSubmit && (
        <div className="flex gap-3 pt-1">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700 transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/10"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="size-4" />
                Save Decisions
              </>
            )}
          </Button>
        </div>
      )}

      {/* Reschedule Dialog */}
      <Dialog open={rescheduleDialog.isOpen} onOpenChange={(open) => setRescheduleDialog(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <CalendarClock className="size-5 text-blue-400" />
              Reschedule {rescheduleDialog.meetingType?.toUpperCase()} Meeting
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {rescheduleDialog.interviewerEmail && (
              <div className="p-3 rounded-lg bg-muted border border-border text-xs">
                <p className="text-muted-foreground mb-1">Interviewer</p>
                <p className="text-foreground font-medium">{rescheduleDialog.interviewerEmail}</p>
              </div>
            )}
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs">New Date</Label>
              <Input
                type="date"
                value={rescheduleDialog.date}
                onChange={(e) => setRescheduleDialog(prev => ({ ...prev, date: e.target.value }))}
                min={new Date().toISOString().split("T")[0]}
                className="bg-background border-border text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs">New Time</Label>
              <Select
                value={rescheduleDialog.time}
                onValueChange={(v) => setRescheduleDialog(prev => ({ ...prev, time: v }))}
              >
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue placeholder="Select a time slot" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border max-h-60">
                  {Array.from({ length: 22 }, (_, i) => {
                    const totalMins = 9 * 60 + i * 30 // Start at 9:00 AM, 30-min slots
                    const h24 = Math.floor(totalMins / 60)
                    const min = totalMins % 60
                    const h12 = h24 % 12 === 0 ? 12 : h24 % 12
                    const ampm = h24 < 12 ? "AM" : "PM"
                    const label = `${h12}:${min === 0 ? "00" : "30"} ${ampm}`
                    const value = `${String(h24).padStart(2, "0")}:${min === 0 ? "00" : "30"}`
                    return (
                      <SelectItem key={value} value={value} className="text-foreground focus:bg-muted">
                        {label}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              onClick={() => setRescheduleDialog(prev => ({ ...prev, isOpen: false }))}
              className="text-muted-foreground hover:text-foreground"
            >
              Cancel
            </Button>
            <Button
              onClick={submitReschedule}
              disabled={!rescheduleDialog.date || !rescheduleDialog.time || rescheduleDialog.isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 gap-2"
            >
              {rescheduleDialog.isSubmitting ? (
                <><Loader2 className="size-4 animate-spin" /> Sending...</>
              ) : (
                <><CalendarClock className="size-4" /> Confirm Reschedule</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
})
