"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
// Removed Clerk import

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  ArrowLeft,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  Users,
  TrendingUp,
  CheckCircle2,
  Clock,
  Loader2,
  AlertCircle,
  Building2,
  Phone,
  PhoneCall,
  Check,
  X,
  MoreVertical,
  ExternalLink,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { CandidateDetailSidebar } from "@/components/candidates/candidate-detail-sidebar"
import { HRUploadZone } from "@/components/upload/hr-upload-zone"

interface Candidate {
  CandidateID: string
  Name: string
  Email: string
  City: string
  HR: string
  Score: number
  Decision: string
  FinalDecision: string
  ResumeLink: string
  TechnicalInterview: string
  Experience: string
  RoleApplied: string
  PhoneNumber?: string
  ResumeSummary?: string
  Strengths?: string
  Gaps?: string
  FitAnalysis?: string
  Comments?: string
  AppBooked?: string
  TIAssigned?: string

  // Pipeline Rounds
  ResumeScreening?: string
  CallRound?: string
  HRRound?: string
  TechInterviewRound?: string
  ManagerInterview?: string

  // HR Meeting Details
  HRMeetingDate?: string
  HRMeetingTime?: string
  HRMeetingLink?: string
  HREventID?: string

  // Tech Meeting Details
  TechMeetingDate?: string
  TechMeetingTime?: string
  TechMeetingLink?: string
  TechEventID?: string

  // Manager Meeting Details
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
}

interface CampaignAnalytics {
  totalCandidates: number
  avgScore: string
  passRate: string
  failRate: string
  holdRate: string
  candidateList: Candidate[]
  tiAvgScore: string
  tiConversionRate: string
  medianScore: string
  scoreStdDeviation: string
  avgScoreYes: string
  avgScoreNo: string
  decisionEffectivenessIndex: string
  topHRs: { HR: string; avgScore: string; successRate: string }[]
  avgScorePerHR: { [key: string]: string }
  avgScoreByCity: { [key: string]: string }
}

interface CampaignDetailClientProps {
  campaignName: string
}

const ITEMS_PER_PAGE = 10

const USER_EMAIL = "guest@example.com"
const GUEST_USER = { primaryEmailAddress: { emailAddress: USER_EMAIL } }

export default function CampaignDetailClient({ campaignName }: CampaignDetailClientProps) {
  const router = useRouter()
  const isLoaded = true
  const user = GUEST_USER

  const { toast } = useToast()

  const [isMounted, setIsMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState<CampaignAnalytics | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [decisionFilter, setDecisionFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [sortBy, setSortBy] = useState<"score" | "city" | "hr">("score")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  
  useEffect(() => {
    setIsMounted(true)
  }, [])

  interface HRAnalytics {
    overview: {
      totalCandidates: number
      avgScore: string
      medianScore: string
      topScore: number
      lowScore: number
      round1_passed: number
      round2_passed: number
      final_hired: number
      rejected: number
      round1_to_2: string
      round2_to_hire: string
      overallConversion: string
    }
    hrPerformance: Array<{
      hr: string
      total: number
      hired: number
      avgScore: string
      successRate: string
    }>
    cityPerformance: Array<{
      city: string
      total: number
      hired: number
      avgScore: string
      hireRate: string
    }>
    decisionEffectiveness: string
    candidatesByStage: {
      round1_passed: Candidate[]
      round2_passed: Candidate[]
      final_hired: Candidate[]
      rejected: Candidate[]
    }
    campaignCandidates: Candidate[]
    insights: string[]
  }

  const fetchCampaignData = useCallback(async () => {
    try {
      setLoading(true)
      const userEmail = USER_EMAIL


      if (!userEmail) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to view campaign details.",
          variant: "destructive",
        })
        return
      }

      // Use "Certain Campaign" — this is the webhook that returns candidate data
      // for a specific campaign from: ab8d28de-afb7-416f-aaf1-454949b27c18
      const response = await fetch("/api/webhook-proxy?action=Certain%20Campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          CampaignName: campaignName,
          UserEmail: userEmail
        })
      })

      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`)
      }

      const rawData = await response.json()
      console.log("[v0] Raw webhook response:", JSON.stringify(rawData).substring(0, 500))

      const normalizeDecision = (val: any): string => {
        if (!val) return ""
        const v = String(val).toLowerCase()
        if (v === "yes" || v === "pass" || v === "passed" || v === "approved" || v === "hired") return "Yes"
        if (v === "no" || v === "fail" || v === "failed" || v === "rejected") return "No"
        return String(val)
      }

      // ─── Normalize the candidate item to our Candidate interface ───────────
      // Field names from webhook use spaces: "Phone Number", "Resume Link", etc.
      const normalizeCandidate = (c: any): Candidate => ({
        ...c,
        CandidateID:  c["Candidate ID"] || c.CandidateID || c.id || c.candidateID || "",
        Name:         c.Name || c.name || c.CandidateName || "",
        Email:        c.Email || c.email || c.CandidateEmail || "",
        City:         c.City || c.city || "",
        HR:           c["HR Assigned"] || c.HR || c.hr || c.HRName || "",
        Score:        Number(c.Score ?? c.score ?? c.OverallScore ?? 0),
        
        // Pipeline Mapping
        ResumeScreening: normalizeDecision(c["Resume Decision"] || c["resume_decision"] || c["Resume Screening"] || c["resume_screening"] || c.Decision || c.decision),
        CallRound:       normalizeDecision(c["Call Decision"] || c["call_decision"] || c["Call Round"] || c["call_round"] || c["Call Status"] || c["call_status"] || c.CallRound || c.call_round),
        HRRound:         normalizeDecision(c["HR Decision"] || c["hr_decision"] || c["HR Round"] || c["hr_round"] || c.HRRound || c.hr_round),
        TechInterviewRound: normalizeDecision(c["Tech Decision"] || c["tech_decision"] || c["Technical Interview"] || c["Tech Interview"] || c.TechnicalInterview || c.technical_interview),
        ManagerInterview: normalizeDecision(c["Manager Decision"] || c["manager_decision"] || c["Final Decision"] || c["Manager Interview"] || c.ManagerInterview || c.manager_interview),

        Decision:     normalizeDecision(c["Resume Decision"] || c["HR Decision"] || c.Decision || c.decision),
        FinalDecision: normalizeDecision(c["Manager Decision"] || c.FinalDecision || c.final_decision),
        TechnicalInterview: normalizeDecision(c["Tech Decision"] || c.TechnicalInterview || c.technical_interview),
        ResumeLink:   c["Resume Link"] || c.ResumeLink || c.resumeLink || "",
        Experience:   c.Experience || c.experience || "",
        RoleApplied:  c.Role || c.RoleApplied || c.roleApplied || "",
        PhoneNumber:  String(c["Phone Number"] || c.PhoneNumber || c.phone || ""),
        ResumeSummary: c.Summary || c.ResumeSummary || c.resumeSummary || "",
        Strengths:    c.Strengths || c.strengths || "",
        Gaps:         c.Gaps || c.gaps || "",
        FitAnalysis:  c["Fit Analysis"] || c.FitAnalysis || c.fitAnalysis || "",
        Comments:     c["HR Comments"] || c.Comments || c.comments || "",
        AppBooked:    c.AppBooked || c.appBooked || "",
        TIAssigned:   c["Tech Interviewer"] || c.TIAssigned || c.tiAssigned || "",
        
        // HR Meeting Details
        HRMeetingDate: c["HR Meeting Date"] || c.HRMeetingDate || "",
        HRMeetingTime: c["HR Meeting Time"] || c.HRMeetingTime || "",
        HRMeetingLink: c["HR Meeting Link"] || c.HRMeetingLink || "",
        HREventID:     c["HR Event ID"] || c.HREventID || "",

        // Tech Meeting Details
        TechMeetingDate: c["Tech Meeting Date"] || c.TechMeetingDate || "",
        TechMeetingTime: c["Tech Meeting Time"] || c.TechMeetingTime || "",
        TechMeetingLink: c["Tech Meeting Link"] || c.TechMeetingLink || "",
        TechEventID:     c["Tech. Event ID"] || c["Tech Event ID"] || c.TechEventID || "",

        // Manager Meeting Details
        ManagerMeetingDate: c["Manager Meeting Date"] || c.ManagerMeetingDate || "",
        ManagerMeetingTime: c["Manager Meeting Time"] || c.ManagerMeetingTime || "",
        ManagerMeetingLink: c["Manager Interview Link"] || c.ManagerMeetingLink || "",
        ManagerEventID:     c["Manager Event ID"] || c.ManagerEventID || "",

        // Followup Stages
        Call1: c["Call 1"] || c.Call1 || "",
        Call2: c["Call 2"] || c.Call2 || "",
        Whatsapp: c["Whatsapp"] || c.whatsapp || "",
        FollowupMail1: c["Followup Mail 1"] || c.FollowupMail1 || "",
        FollowupMail2: c["Followup Mail 2"] || c.FollowupMail2 || "",
        Answered: c["Answered"] || c.answered || "",
        Data: c["Data"] || c.data || "",
        MailSent: c["Mail Sent"] || c["MailSent"] || c.mailSent || "",
        CallRecording: c["Call Recording"] || c["CallRecording"] || c.callRecording || "",
        HRMeetingMail: c["HR Meeting Mail"] || c.HRMeetingMail || "",
        HRWAFollowup: c["HR WA Followup"] || c.HRWAFollowup || "",
        TechMailSent: c["Tech Mail Sent"] || c["TechMailSent"] || c.TechMailSent || "",
        TechWAFollowup: c["Tech WA Followup"] || c["TechWAFollowup"] || c.TechWAFollowup || "",
        ManagerMeetingMail: c["Manager Meeting Mail"] || c.ManagerMeetingMail || "",
        ManagerWAFollowup: c["Manager WA Followup"] || c.ManagerWAFollowup || "",
        HRMeetingType: c["HR Meeting Type"] || c.HRMeetingType || "",
        TechMeetingType: c["Tech Meeting Type"] || c.TechMeetingType || "",
        ManagerMeetingType: c["Manager Meeting Type"] || c.ManagerMeetingType || "",
      })

      // ─── Extract candidate list from any known response envelope ───────────
      let candidateList: Candidate[] = []

      const extractFromArray = (arr: any[]): Candidate[] => {
        // Check if elements are candidates or wrappers
        const first = arr[0]
        if (!first) return []
        // Format: [{ data: [...candidates] }]  ← actual webhook format
        if (first.data && Array.isArray(first.data)) {
          return first.data.map((item: any) => normalizeCandidate(item.json || item))
        }
        // Format: [{ json: {...candidate} }]  ← n8n envelope
        if (first.json) {
          return arr.map((item: any) => normalizeCandidate(item.json))
        }
        // Format: flat array of candidates
        return arr.map(normalizeCandidate)
      }

      if (Array.isArray(rawData)) {
        candidateList = extractFromArray(rawData)

      } else if (rawData.data && Array.isArray(rawData.data)) {
        candidateList = rawData.data.map((item: any) => normalizeCandidate(item.json || item))

      } else if (rawData.campaignCandidates && Array.isArray(rawData.campaignCandidates)) {
        candidateList = rawData.campaignCandidates.map(normalizeCandidate)

      } else if (rawData.candidates && Array.isArray(rawData.candidates)) {
        candidateList = rawData.candidates.map(normalizeCandidate)

      } else if (rawData.status === 200 && rawData.data) {
        const inner = rawData.data
        if (inner.campaignCandidates) {
          candidateList = inner.campaignCandidates.map(normalizeCandidate)
        } else if (Array.isArray(inner)) {
          candidateList = inner.map(normalizeCandidate)
        }

      } else if (rawData.Status === 404 || rawData.Error || rawData.Eror) {
        toast({
          title: "No Data Available",
          description: rawData.Error || rawData.Eror || "No candidate data found for this campaign.",
          variant: "default",
        })
        setLoading(false)
        return
      }

      console.log("[v0] Extracted", candidateList.length, "candidates")

      if (candidateList.length === 0) {
        console.warn("[v0] No candidates extracted. Raw keys:", Object.keys(rawData))
        toast({
          title: "No Candidates Found",
          description: "No candidate data found for this campaign yet.",
          variant: "default",
        })
        setLoading(false)
        return
      }

      // ─── Compute analytics from candidate list ─────────────────────────────
      const scores = candidateList.map((c) => c.Score).filter((s) => s > 0)
      const avgScore = scores.length > 0
        ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2) : "0.00"
      const medianScore = scores.length > 0
        ? [...scores].sort((a, b) => a - b)[Math.floor(scores.length / 2)].toFixed(2) : "0.00"
      const mean = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
      const variance = scores.length > 0
        ? scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length : 0
      const stdDev = Math.sqrt(variance).toFixed(2)

      const yesCount = candidateList.filter((c) => c.Decision?.toLowerCase() === "yes").length
      const noCount  = candidateList.filter((c) => c.Decision?.toLowerCase() === "no").length
      const pendingCount = candidateList.filter((c) =>
        !c.Decision || c.Decision === "" || c.Decision?.toLowerCase() === "pending"
      ).length
      const passRate    = candidateList.length > 0 ? ((yesCount / candidateList.length) * 100).toFixed(2) : "0.00"
      const failRate    = candidateList.length > 0 ? ((noCount  / candidateList.length) * 100).toFixed(2) : "0.00"
      const pendingRate = candidateList.length > 0 ? ((pendingCount / candidateList.length) * 100).toFixed(2) : "0.00"

      const tiCandidates = candidateList.filter((c) => c.TechnicalInterview?.toLowerCase() === "yes")
      const tiScores     = tiCandidates.map((c) => c.Score).filter((s) => s > 0)
      const tiAvgScore   = tiScores.length > 0
        ? (tiScores.reduce((a, b) => a + b, 0) / tiScores.length).toFixed(2) : avgScore
      const tiConversionRate = yesCount > 0
        ? ((tiCandidates.length / yesCount) * 100).toFixed(2) : "0.00"

      // HR performance
      const hrGroups: Record<string, { total: number; hired: number; scores: number[] }> = {}
      candidateList.forEach((c) => {
        const hr = c.HR || "Unassigned"
        if (!hrGroups[hr]) hrGroups[hr] = { total: 0, hired: 0, scores: [] }
        hrGroups[hr].total++
        if (c.FinalDecision?.toLowerCase() === "yes") hrGroups[hr].hired++
        if (c.Score > 0) hrGroups[hr].scores.push(c.Score)
      })
      const topHRs = Object.entries(hrGroups)
        .map(([hr, data]) => ({
          HR: hr,
          avgScore: data.scores.length > 0
            ? (data.scores.reduce((a, b) => a + b, 0) / data.scores.length).toFixed(2) : "0",
          successRate: data.total > 0 ? ((data.hired / data.total) * 100).toFixed(2) : "0",
        }))
        .sort((a, b) => Number(b.successRate) - Number(a.successRate))

      // City performance
      const cityGroups: Record<string, number[]> = {}
      candidateList.forEach((c) => {
        const city = c.City || "Unknown"
        if (!cityGroups[city]) cityGroups[city] = []
        if (c.Score > 0) cityGroups[city].push(c.Score)
      })
      const avgScoreByCity = Object.fromEntries(
        Object.entries(cityGroups).map(([city, sc]) => [
          city,
          sc.length > 0 ? (sc.reduce((a, b) => a + b, 0) / sc.length).toFixed(2) : "0",
        ])
      )

      setAnalytics({
        totalCandidates: candidateList.length,
        avgScore,
        medianScore,
        tiAvgScore,
        passRate,
        failRate,
        holdRate: pendingRate,
        tiConversionRate,
        scoreStdDeviation: stdDev,
        avgScoreYes: avgScore,
        avgScoreNo: "0",
        decisionEffectivenessIndex: rawData.decisionEffectiveness || "0",
        candidateList,
        topHRs,
        avgScorePerHR: {},
        avgScoreByCity,
      })

      console.log("[v0] Analytics set with", candidateList.length, "candidates")
    } catch (error: any) {
      console.error("[v0] Error fetching campaign data:", error)
      toast({
        title: "Error Loading Data",
        description: "Failed to load campaign analytics. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [campaignName, toast])

  const candidateMap = useMemo(() => {
    if (!analytics?.candidateList) return new Map()
    return new Map(analytics.candidateList.map((c) => [c.CandidateID, c]))
  }, [analytics?.candidateList])

  useEffect(() => {
    if (isMounted) {
      fetchCampaignData()
    }
  }, [isMounted, fetchCampaignData])

  useEffect(() => {
    if (analytics?.candidateList && candidateMap.size > 0) {
      const params = new URLSearchParams(window.location.search)
      const candidateId = params.get("candidate")
      if (candidateId) {
        const candidate =
          candidateMap.get(candidateId) ||
          analytics.candidateList.find((c) => c.Email === decodeURIComponent(candidateId))
        if (candidate) {
          setSelectedCandidate(candidate)
          setIsSidebarOpen(true)
        }
      }
    }
  }, [analytics, candidateMap])

  const handleRefresh = () => {
    fetchCampaignData()
    toast({
      title: "Refreshing Data",
      description: "Campaign data is being updated...",
    })
  }

  const handleCandidateClick = (candidate: Candidate) => {
    setSelectedCandidate(candidate)
    setIsSidebarOpen(true)

    // Add candidate ID to URL (non-blocking)
    requestAnimationFrame(() => {
      const url = new URL(window.location.href)
      url.searchParams.set("candidate", candidate.CandidateID)
      window.history.pushState({}, "", url.toString())
    })
  }

  const filteredCandidates =
    analytics?.candidateList?.filter((candidate) => {
      const matchesSearch =
        candidate.Name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.Email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.HR?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesFilter =
        decisionFilter === "all" ||
        candidate.Decision?.toLowerCase() === decisionFilter.toLowerCase() ||
        candidate.FinalDecision?.toLowerCase() === decisionFilter.toLowerCase()

      return matchesSearch && matchesFilter
    }) || []

  const sortedCandidates = [...filteredCandidates].sort((a, b) => {
    if (sortBy === "score") {
      return sortOrder === "desc" ? b.Score - a.Score : a.Score - b.Score
    } else if (sortBy === "city") {
      const cityA = a.City || ""
      const cityB = b.City || ""
      return sortOrder === "desc" ? cityB.localeCompare(cityA) : cityA.localeCompare(cityB)
    } else if (sortBy === "hr") {
      const hrA = a.HR || ""
      const hrB = b.HR || ""
      return sortOrder === "desc" ? hrB.localeCompare(hrA) : hrA.localeCompare(hrB)
    }
    return 0
  })

  const totalPages = Math.ceil(sortedCandidates.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedCandidates = sortedCandidates.slice(startIndex, endIndex)

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1))
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
  }

  // Optimistically update a candidate's decision in local state
  const updateCandidateLocally = (candidateId: string, roundKey: string, decision: string) => {
    setAnalytics((prev) => {
      if (!prev) return prev
      const updatedList = prev.candidateList.map((c) => {
        if (c.CandidateID !== candidateId) return c
        return { ...c, [roundKey]: decision }
      })
      return { ...prev, candidateList: updatedList }
    })
  }

  // Handle direct decision updates from the table
  const handleDecisionUpdate = async (candidate: Candidate, roundKey: string, decision: string) => {
    const roundMapping: Record<string, string> = {
      ResumeScreening: "Resume Screening",
      CallRound: "Call Round",
      HRRound: "HR Round",
      TechInterviewRound: "Tech Interview",
      ManagerInterview: "Manager Interview"
    }

    // ── 1. Optimistic update: reflect change immediately in UI ──────────────
    const previousDecision = (candidate as any)[roundKey]
    updateCandidateLocally(candidate.CandidateID, roundKey, decision)

    toast({
      title: "Decision Updated",
      description: `${candidate.Name}'s ${roundMapping[roundKey] || roundKey} marked as ${decision}`,
    })

    // ── 2. Save to backend in background ───────────────────────────────────
    try {
      // Only send the field that was actually changed — not all other existing decisions
      const fieldName = roundMapping[roundKey] || roundKey
      const queryParams = new URLSearchParams({ 
        action: "UpdateDecision",
        [fieldName]: decision,
      })

      const bodyData = {
        CandidateID: candidate.CandidateID,
        Name: candidate.Name,
        Email: candidate.Email,
        CampaignName: campaignName,
        City: candidate.City,
        Score: candidate.Score,
        HR: candidate.HR,
        ResumeLink: candidate.ResumeLink,
        PhoneNumber: candidate.PhoneNumber,
        Experience: candidate.Experience,
        RoleApplied: candidate.RoleApplied,
        ResumeSummary: candidate.ResumeSummary,
        Strengths: candidate.Strengths,
        Gaps: candidate.Gaps,
        FitAnalysis: candidate.FitAnalysis,
        Comments: candidate.Comments,
      }

      const queryString = queryParams.toString().replace(/\+/g, '%20')
      const response = await fetch(`/api/webhook-proxy?${queryString}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      })

      if (!response.ok) throw new Error("Failed to save to backend")

    } catch (err: any) {
      // ── 3. Revert optimistic update on failure ───────────────────────────
      updateCandidateLocally(candidate.CandidateID, roundKey, previousDecision ?? "")
      toast({
        title: "Save Failed",
        description: "Could not save to backend. The change has been reverted.",
        variant: "destructive",
      })
    }
  }

  // Helper to render interactive decision badge
  const DecisionBadge = ({ 
    candidate, 
    roundKey, 
    value,
    readOnly = false 
  }: { 
    candidate: Candidate, 
    roundKey: string, 
    value: string | undefined,
    readOnly?: boolean
  }) => {
    const isYes = value?.toLowerCase() === "yes" || value?.toLowerCase() === "pass" || value?.toLowerCase() === "approved" || value?.toLowerCase() === "hired" || value?.toLowerCase() === "passed"
    const isNo = value?.toLowerCase() === "no" || value?.toLowerCase() === "fail" || value?.toLowerCase() === "rejected" || value?.toLowerCase() === "failed"
    
    const label = value ? (isYes ? "Yes" : isNo ? "No" : value) : "Pending"
    
    const badgeStyle = isYes 
      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30" 
      : isNo 
        ? "bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30"
        : "bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/30"

    if (readOnly) {
      return (
        <Badge className={cn("cursor-default px-2 py-0.5 font-medium shadow-sm transition-all", badgeStyle)}>
          {value === "Yes" ? <Check className="size-3 mr-1" /> : value === "No" ? <X className="size-3 mr-1" /> : null}
          {label}
        </Badge>
      )
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <button className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border transition-all active:scale-95 shadow-sm", badgeStyle)}>
            {label}
            <MoreVertical className="size-2.5 ml-1 opacity-50" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="bg-card border-border min-w-[100px]">
          <DropdownMenuItem 
            className="text-emerald-400 focus:text-emerald-300 focus:bg-emerald-500/10 cursor-pointer flex items-center gap-2"
            onClick={(e) => {
              e.stopPropagation()
              handleDecisionUpdate(candidate, roundKey, "Yes")
            }}
          >
            <Check className="size-3.5" /> Yes
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="text-red-400 focus:text-red-300 focus:bg-red-500/10 cursor-pointer flex items-center gap-2"
            onClick={(e) => {
              e.stopPropagation()
              handleDecisionUpdate(candidate, roundKey, "No")
            }}
          >
            <X className="size-3.5" /> No
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  if (!isMounted || (loading && !analytics)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="size-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="size-8 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin-reverse" />
            </div>
          </div>
          <p className="text-muted-foreground font-medium animate-pulse">Loading campaign intelligence...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-background">
        <AlertCircle className="size-12 text-muted-foreground" />
        <p className="text-lg text-muted-foreground">Please sign in to view campaign details</p>
        <Link href="/sign-in">
          <Button>Sign In</Button>
        </Link>
      </div>
    )
  }

  const totalCandidates = analytics?.totalCandidates || 0
  const avgScore = analytics?.avgScore ? Number.parseFloat(analytics.avgScore).toFixed(2) : "0.00"
  const passRate = analytics?.passRate ? Number.parseFloat(analytics.passRate).toFixed(2) : "0.00"
  const failRate = analytics?.failRate ? Number.parseFloat(analytics.failRate).toFixed(2) : "0.00"
  const holdRate = analytics?.holdRate ? Number.parseFloat(analytics.holdRate).toFixed(2) : "0.00"
  const tiAvgScore = analytics?.tiAvgScore ? Number.parseFloat(analytics.tiAvgScore).toFixed(2) : "0.00"
  const tiConversionRate = analytics?.tiConversionRate
    ? Number.parseFloat(analytics.tiConversionRate).toFixed(2)
    : "0.00"
  const medianScore = analytics?.medianScore ? Number.parseFloat(analytics.medianScore).toFixed(2) : "0.00"
  const scoreStdDeviation = analytics?.scoreStdDeviation
    ? Number.parseFloat(analytics.scoreStdDeviation).toFixed(2)
    : "0.00"
  const avgScoreYes = analytics?.avgScoreYes ? Number.parseFloat(analytics.avgScoreYes).toFixed(2) : "0.00"
  const avgScoreNo = analytics?.avgScoreNo ? Number.parseFloat(analytics.avgScoreNo).toFixed(2) : "0.00"
  const decisionEffectivenessIndex = analytics?.decisionEffectivenessIndex
    ? Number.parseFloat(analytics.decisionEffectivenessIndex).toFixed(2)
    : "0.00"

  const topHRs = analytics?.topHRs || []
  const avgScorePerHR = analytics?.avgScorePerHR || {}
  const avgScoreByCity = analytics?.avgScoreByCity || {}

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-8">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-violet-500/5" />
          <div className="relative space-y-4">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="size-5" />
                </Button>
              </Link>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-foreground">
                  {campaignName}
                </h1>
                <p className="text-muted-foreground mt-1">Campaign Analytics & Candidate Management</p>
              </div>
              <Button
                onClick={handleRefresh}
                variant="outline"
                className="gap-2 bg-muted/50 border-border hover:bg-muted"
              >
                <RefreshCw className="size-4" />
                Refresh Data
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="p-4 rounded-lg bg-card border border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10">
                    <Users className="size-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{totalCandidates}</p>
                    <p className="text-xs text-muted-foreground">Total Candidates</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-card border border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-violet-500/10">
                    <TrendingUp className="size-5 text-violet-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{avgScore}</p>
                    <p className="text-xs text-muted-foreground">Average Score</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-card border border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <CheckCircle2 className="size-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-500">{passRate}%</p>
                    <p className="text-xs text-muted-foreground">Pass Rate</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-card border border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <Clock className="size-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-amber-500">{holdRate}%</p>
                    <p className="text-xs text-muted-foreground">Pending</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 rounded-lg bg-muted/30 border border-border">
                <p className="text-xs text-muted-foreground mb-1">Median Score</p>
                <p className="text-lg font-bold text-violet-500">{medianScore}</p>
              </div>

              <div className="p-3 rounded-lg bg-muted/30 border border-border">
                <p className="text-xs text-muted-foreground mb-1">Std Deviation</p>
                <p className="text-lg font-bold text-blue-500">{scoreStdDeviation}</p>
              </div>

              <div className="p-3 rounded-lg bg-muted/30 border border-border">
                <p className="text-xs text-muted-foreground mb-1">TI Avg Score</p>
                <p className="text-lg font-bold text-emerald-500">{tiAvgScore}</p>
              </div>

              <div className="p-3 rounded-lg bg-muted/30 border border-border">
                <p className="text-xs text-muted-foreground mb-1">TI Conversion</p>
                <p className="text-lg font-bold text-amber-500">{tiConversionRate}%</p>
              </div>
            </div>
          </div>
        </div>

        <HRUploadZone campaignName={campaignName} />

        <div className="grid gap-4 lg:grid-cols-2">
          {topHRs.length > 0 && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Users className="size-5 text-violet-500" />
                  HR Performance
                </CardTitle>
                <CardDescription className="text-muted-foreground">Top performing HR managers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topHRs.slice(0, 5).map((hr, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 border border-border group/hr transition-colors"
                    >
                      <div
                        className={`flex items-center justify-center size-8 rounded-full font-bold text-xs ${
                          index === 0
                            ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                            : index === 1
                              ? "bg-muted text-muted-foreground border border-border"
                              : index === 2
                                ? "bg-orange-500/20 text-orange-600 dark:text-orange-400"
                                : "bg-muted text-muted-foreground"
                        }`}
                      >
                        #{index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground text-sm">
                          {hr.HR && hr.HR !== "Unassigned" ? hr.HR : "Unassigned"}
                        </p>
                        <p className="text-xs text-muted-foreground">Avg Score: {Number.parseFloat(hr.avgScore).toFixed(2)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                          {Number.parseFloat(hr.successRate).toFixed(2)}%
                        </p>
                        <p className="text-xs text-muted-foreground">Success</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {Object.keys(avgScoreByCity).length > 0 && (
            <Card className="bg-card border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Building2 className="size-5 text-blue-500" />
                  Performance by City
                </CardTitle>
                <CardDescription className="text-muted-foreground">Average scores by location</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(avgScoreByCity)
                    .sort(([, a], [, b]) => Number.parseFloat(b as string) - Number.parseFloat(a as string))
                    .slice(0, 5)
                    .map(([city, score], index) => (
                      <div
                        key={city}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border"
                      >
                        <div className="flex items-center gap-3">
                          <Building2 className="size-4 text-blue-500" />
                          <p className="font-medium text-foreground text-sm">
                            {city === "Unknown" ? "Not Specified" : city}
                          </p>
                        </div>
                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          {Number.parseFloat(score as string).toFixed(2)}
                        </p>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <Card className="bg-card border-border shadow-md">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-foreground text-2xl">Candidate List</CardTitle>
                <CardDescription className="text-muted-foreground">{sortedCandidates.length} candidates found</CardDescription>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, or HR..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="pl-10 bg-muted/50 border-border text-foreground placeholder-muted-foreground w-full min-w-[200px] md:w-[280px]"
                  />
                </div>
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as "score" | "city" | "hr")}>
                  <SelectTrigger className="w-[120px] bg-muted/50 border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="score">Sort by Score</SelectItem>
                    <SelectItem value="city">Sort by City</SelectItem>
                    <SelectItem value="hr">Sort by HR</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  className="bg-slate-800/50 border-slate-700/50 hover:bg-slate-800"
                >
                  {sortOrder === "desc" ? "↓" : "↑"}
                </Button>
                <Select
                  value={decisionFilter}
                  onValueChange={(value) => {
                    setDecisionFilter(value)
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="w-full min-w-[140px] md:w-[180px] bg-slate-800/50 border-slate-700/50 text-white">
                    <SelectValue placeholder="Filter by decision" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="all">All Decisions</SelectItem>
                    <SelectItem value="yes">Approved</SelectItem>
                    <SelectItem value="no">Rejected</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {paginatedCandidates.length > 0 ? (
              <>
                <div className="rounded-lg border border-slate-800/50 overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-800/50 hover:bg-slate-800/50 border-slate-700/50">
                        <TableHead className="text-slate-300 font-semibold min-w-[180px]">Candidate</TableHead>
                        <TableHead className="text-slate-300 font-semibold min-w-[120px]">Contact</TableHead>
                        <TableHead className="text-slate-300 font-semibold min-w-[200px]">Key Insights</TableHead>
                        <TableHead className="text-slate-300 font-semibold text-center min-w-[80px]">Score</TableHead>
                        <TableHead className="text-emerald-400/80 font-semibold text-center min-w-[100px]">Resume</TableHead>
                        <TableHead className="text-cyan-400/80 font-semibold text-center min-w-[100px]">Call</TableHead>
                        <TableHead className="text-blue-400/80 font-semibold text-center min-w-[100px]">HR Round</TableHead>
                        <TableHead className="text-amber-400/80 font-semibold text-center min-w-[100px]">Tech</TableHead>
                        <TableHead className="text-violet-400/80 font-semibold text-center min-w-[100px]">Final</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedCandidates.map((candidate, index) => {
                        const displayName =
                          candidate.Name && candidate.Name.trim() !== ""
                            ? candidate.Name
                            : candidate.Email
                              ? candidate.Email.split("@")[0]
                              : "Unnamed Candidate"

                        const hasInsights = candidate.Strengths || candidate.Gaps || candidate.FitAnalysis
                        const insightPreview = candidate.Strengths
                          ? candidate.Strengths.substring(0, 80) + (candidate.Strengths.length > 80 ? "..." : "")
                          : candidate.FitAnalysis
                            ? candidate.FitAnalysis.substring(0, 80) + (candidate.FitAnalysis.length > 80 ? "..." : "")
                            : null

                        return (
                          <TableRow
                            key={candidate.CandidateID || index}
                            className="border-slate-800/50 hover:bg-slate-800/30 cursor-pointer transition-colors"
                            onClick={() => handleCandidateClick(candidate)}
                          >
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <div className="size-8 rounded-full bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                  {displayName.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                <p className="text-foreground font-bold truncate group-hover:text-primary transition-colors">{displayName}</p>
                                  <p className="text-xs text-slate-400 truncate">{candidate.City || "Location N/A"}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <p className="text-xs text-slate-400 truncate">{candidate.Email}</p>
                                {candidate.PhoneNumber && (
                                  <p className="text-xs text-slate-500 flex items-center gap-1">
                                    <Phone className="size-3" />
                                    {candidate.PhoneNumber}
                                  </p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {hasInsights ? (
                                <div className="text-xs text-slate-400 leading-relaxed">
                                  {insightPreview || (
                                    <span className="text-slate-500 italic">Click to view insights</span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs text-slate-600 italic">No insights available</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              <span className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                                {typeof candidate.Score === "number" ? candidate.Score.toFixed(0) : candidate.Score}
                              </span>
                            </TableCell>
                            <TableCell className="text-center">
                              <DecisionBadge 
                                candidate={candidate} 
                                roundKey="ResumeScreening" 
                                value={candidate.ResumeScreening} 
                              />
                            </TableCell>
                            <TableCell className="text-center">
                              <DecisionBadge 
                                candidate={candidate} 
                                roundKey="CallRound" 
                                value={candidate.CallRound} 
                              />
                            </TableCell>
                            <TableCell className="text-center">
                              <DecisionBadge 
                                candidate={candidate} 
                                roundKey="HRRound" 
                                value={candidate.HRRound} 
                              />
                            </TableCell>
                            <TableCell className="text-center">
                              <DecisionBadge 
                                candidate={candidate} 
                                roundKey="TechInterviewRound" 
                                value={candidate.TechInterviewRound} 
                              />
                            </TableCell>
                            <TableCell className="text-center">
                              <DecisionBadge 
                                candidate={candidate} 
                                roundKey="ManagerInterview" 
                                value={candidate.ManagerInterview} 
                              />
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>

                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                    <p className="text-sm text-slate-400">
                      Showing {startIndex + 1} to {Math.min(endIndex, sortedCandidates.length)} of{" "}
                      {sortedCandidates.length} candidates
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                        className="gap-2 bg-slate-800/50 border-slate-700/50 hover:bg-slate-800 disabled:opacity-50"
                      >
                        <ChevronLeft className="size-4" />
                        <span className="hidden sm:inline">Previous</span>
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum
                          if (totalPages <= 5) {
                            pageNum = i + 1
                          } else if (currentPage <= 3) {
                            pageNum = i + 1
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i
                          } else {
                            pageNum = currentPage - 2 + i
                          }

                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(pageNum)}
                              className={`w-10 ${
                                currentPage === pageNum
                                  ? "bg-emerald-600 hover:bg-emerald-700"
                                  : "bg-slate-800/50 border-slate-700/50 hover:bg-slate-800"
                              }`}
                            >
                              {pageNum}
                            </Button>
                          )
                        })}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        className="gap-2 bg-slate-800/50 border-slate-700/50 hover:bg-slate-800 disabled:opacity-50"
                      >
                        <span className="hidden sm:inline">Next</span>
                        <ChevronRight className="size-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                <Users className="size-16 mb-4 opacity-50" />
                <p className="text-lg mb-2">No candidates found</p>
                <p className="text-sm">
                  {searchQuery || decisionFilter !== "all"
                    ? "Try adjusting your filters"
                    : "No candidates have been added to this campaign yet"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <CandidateDetailSidebar
        candidate={selectedCandidate}
        isOpen={isSidebarOpen}
        onClose={() => {
          setIsSidebarOpen(false)
          setSelectedCandidate(null) // Clear selected candidate when sidebar closes
          // Remove candidate ID from URL when sidebar closes
          const url = new URL(window.location.href)
          url.searchParams.delete("candidate")
          window.history.pushState({}, "", url.toString())
        }}
        campaignName={campaignName}
        onDecisionUpdate={fetchCampaignData}
      />
    </div>
  )
}
