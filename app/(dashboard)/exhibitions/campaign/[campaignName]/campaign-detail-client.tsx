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
  Trash2,
  Briefcase,
  MapPin,
  Target,
  DollarSign,
  MessageSquare,
  FileText,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { CandidateDetailSidebar } from "@/components/candidates/candidate-detail-sidebar"
import { HRUploadZone } from "@/components/upload/hr-upload-zone"
import { DeleteCampaignDialog } from "@/components/campaigns/delete-campaign-dialog"

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
  CallLogs?: string
  Call_time?: string
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
  numberOfRounds?: number
}

interface CampaignDetailClientProps {
  campaignName: string
}

const ITEMS_PER_PAGE = 10

const USER_EMAIL = "guest@example.com"
const GUEST_USER = { primaryEmailAddress: { emailAddress: USER_EMAIL } }

// Values that indicate no real answer was captured
const EMPTY_VALUES = new Set([
  "n/a", "na", "none", "-", "—", "", "null", "undefined",
])

function isRealValue(v: string): boolean {
  return !EMPTY_VALUES.has(v.toLowerCase().trim())
}

function parseCallLogsForTable(raw: any): Record<string, { value: string; label: string }> {
  const result: Record<string, { value: string; label: string }> = {}
  if (!raw) return result
  const str = String(raw).trim()
  if (!str) return result

  // Try JSON first
  try {
    const parsed = JSON.parse(str)
    if (Array.isArray(parsed)) {
      for (const item of parsed) {
        const q = item?.question || item?.Question || item?.label || item?.Label
        const a = item?.answer || item?.Answer || item?.value || item?.Value
        if (q && a && isRealValue(String(a))) {
          const key = String(q).toLowerCase().replace(/[^a-z0-9]/g, "")
          if (!result[key]) result[key] = { value: String(a), label: String(q) }
        }
      }
      if (Object.keys(result).length > 0) return result
    }
  } catch (_e) { /* Not JSON */ }

  const lines = str.split(/\n|\r|\r\n|\\n/)
  let pendingQuestion = ""

  for (let line of lines) {
    line = line.trim()
    if (!line) continue

    // 1) Numbered intelligence "1) Label - Value" or "1. Label: Value"
    const digitMatch = line.match(/^\s*\d+[\.\)]\s*(.+?)\s*[:\-\—\–]\s*(.*)$/)
    if (digitMatch) {
      const q = digitMatch[1].trim()
      const a = digitMatch[2].trim()
      if (q && a && isRealValue(a)) {
        const key = q.toLowerCase().replace(/[^a-z0-9]/g, "")
        if (!result[key]) result[key] = { value: a, label: q }
        continue
      }
    }

    // Standard Q: A: format
    const qMatch = line.match(/^(?:Q|Question)\s*[:\-]\s*(.*)$/i)
    if (qMatch) {
      pendingQuestion = qMatch[1].trim()
      continue
    }

    const aMatch = line.match(/^(?:A|Answer)\s*[:\-]\s*(.*)$/i)
    if (aMatch && pendingQuestion) {
      const answer = aMatch[1].trim()
      if (isRealValue(answer)) {
        const key = pendingQuestion.toLowerCase().replace(/[^a-z0-9]/g, "")
        if (!result[key]) {
          result[key] = { value: answer, label: pendingQuestion }
        }
      }
      pendingQuestion = ""
      continue
    }

    // 3. Fallback to standard "Label: Value" or "Label - Value" format
    const match = line.match(/^(?:\d+[\.\)]\s?)(.+?)\s*[:\-–—]\s*(.*)$/) || 
                  line.match(/^([^:\-–—]{3,120})\s*[:\-–—]\s*(.*)$/)
    
    if (match) {
      const rawLabel = match[1].trim()
      const content = match[2].trim()
      
      const isAgent = /^(agent|candidate|user|simran|caller|receiver|speaker|person)$/i.test(rawLabel)
      const isTooLong = rawLabel.length > 120
      
      if (!isAgent && !isTooLong && content && isRealValue(content)) {
        const cleanLabel = rawLabel.replace(/^[QA]\s*$/i, "").trim()
        if (cleanLabel) {
          const key = cleanLabel.toLowerCase().replace(/[^a-z0-9]/g, "")
          if (!result[key]) {
            result[key] = { value: content, label: cleanLabel }
          }
        }
      }
    }
  }
  return result
}

export default function CampaignDetailClient({ campaignName }: CampaignDetailClientProps) {
  const router = useRouter()
  const isLoaded = true
  const user = GUEST_USER

  const [isMounted, setIsMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState<CampaignAnalytics | null>(null)
  const [isOptimized, setIsOptimized] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [decisionFilter, setDecisionFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [sortBy, setSortBy] = useState<"score" | "city" | "hr">("score")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [viewingMediaFor, setViewingMediaFor] = useState<{name: string, data: string, logs: string} | null>(null)
  const [mediaTab, setMediaTab] = useState<'script' | 'intelligence'>('script')
  
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
        toast.error("Authentication Required", {
          description: "Please sign in to view campaign details.",
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

      const responseText = await response.text()
      if (!responseText || responseText.trim() === "") {
        console.log("[v0] Empty response from webhook (candidates likely still processing).")
        setAnalytics({
          totalCandidates: 0,
          avgScore: "0.00",
          medianScore: "0.00",
          tiAvgScore: "0.00",
          passRate: "0.00",
          failRate: "0.00",
          holdRate: "0.00",
          tiConversionRate: "0.00",
          scoreStdDeviation: "0.00",
          avgScoreYes: "0.00",
          avgScoreNo: "0.00",
          decisionEffectivenessIndex: "0.00",
          candidateList: [],
          topHRs: [],
          avgScorePerHR: {},
          avgScoreByCity: {},
        })
        setLoading(false)
        return
      }

      const rawData = JSON.parse(responseText)
      console.log("[v0] Raw webhook response:", JSON.stringify(rawData).substring(0, 500))

      // ─── Extract Campaign Metadata ───────────────────────────────────────
      let campaignRounds = Number(rawData.NumberOfRounds || rawData.numberOfRounds || 3)
      
      // If metadata not in certain campaign response, try fetching from campaigns list
      if (!rawData.NumberOfRounds && !rawData.numberOfRounds) {
        try {
          const campaignsRes = await fetch("/api/webhook-proxy?action=Campaigns", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ UserEmail: userEmail })
          })
          if (campaignsRes.ok) {
            const campaignsData = await campaignsRes.json()
            let campaignsList: any[] = []
            if (Array.isArray(campaignsData)) campaignsList = campaignsData
            else if (campaignsData.data) campaignsList = campaignsData.data.map((item: any) => item.json || item)
            
            const currentCampaign = campaignsList.find(c => 
              String(c.CampaignName || "").toLowerCase() === campaignName.toLowerCase()
            )
            if (currentCampaign?.NumberOfRounds) {
              campaignRounds = Number(currentCampaign.NumberOfRounds)
            }
            if (currentCampaign) {
              setIsOptimized(String(currentCampaign.Optimized || "").toLowerCase() === "true")
            }
          }
        } catch (err) {
          console.warn("[v0] Could not fetch supplemental campaign metadata:", err)
        }
      } else {
        setIsOptimized(String(rawData.Optimized || "").toLowerCase() === "true")
      }

      const normalizeDecision = (val: any): string => {
        if (!val) return ""
        const v = String(val).toLowerCase()
        if (v === "yes" || v === "pass" || v === "passed" || v === "approved" || v === "hired") return "Yes"
        if (v === "no" || v === "fail" || v === "failed" || v === "rejected") return "No"
        return String(val)
      }

      // ─── Normalize the candidate item to our Candidate interface ───────────
      const normalizeCandidate = (item: any): Candidate => {
        if (!item) return {} as Candidate
        
        // DEEP MERGE: Bring hidden data to the top level
        let c = { ...item }
        if (item.json && typeof item.json === "object") c = { ...c, ...item.json }
        if (item.output && typeof item.output === "object") c = { ...c, ...item.output }
        if (item.data && typeof item.data === "object" && !Array.isArray(item.data)) c = { ...c, ...item.data }

        // ULTIMATE SELECTOR: Find the best CallLogs field
        let bestCallLogs = ""
        let maxMatches = -1
        
        // PRIORITY 1: Explicit "Call Logs" with pattern
        const explicitKeys = ["Call Logs", "CallLogs", "call_logs", "Call_logs", "callLogs"]
        for (const k of explicitKeys) {
          const val = c[k]
          if (typeof val === "string" && val.length > 5) {
            const matches = val.match(/\d+[\.\)]\s/g)
            const count = matches ? matches.length : 0
            if (count > maxMatches) {
               maxMatches = count
               bestCallLogs = val
            }
          }
        }

        // PRIORITY 2: Any string field with better pattern density (skip known profile-data fields)
        const skipKeys = new Set(["Data", "data", "json", "output"])
        if (maxMatches < 1) {
          for (const [key, val] of Object.entries(c)) {
            if (skipKeys.has(key)) continue
            if (typeof val === "string" && val.length > 5) {
              const matches = val.match(/\d+[\.\)]\s/g)
              const count = matches ? matches.length : 0
              if (count > maxMatches) {
                maxMatches = count
                bestCallLogs = val
              }
            }
          }
        }

        // Final fallback for CallLogs if no pattern found at all
        if (!bestCallLogs) {
          bestCallLogs = c["Call Logs"] || c.CallLogs || c.call_logs || ""
        }

        return {
          ...c,
          CandidateID:  c["Candidate ID"] || c.CandidateID || c.id || c.candidateID || "",
          Name:         c.Name || c.name || c.CandidateName || "",
          Email:        c.Email || c.email || c.CandidateEmail || "",
          City:         c.City || c.city || "",
          Score:        Number(c.Score ?? c.score ?? c.OverallScore ?? 0),
          
          // Pipeline Mapping
          ResumeScreening: normalizeDecision(c["Resume Decision"] || c["resume_decision"] || c["Resume Screening"] || c["resume_screening"] || c.Decision || c.decision),
          CallRound:       normalizeDecision(c["Call Decision"] || c["call_decision"] || c["Call Round"] || c["call_round"] || c["Call Status"] || c["call_status"] || c.CallRound || c.call_round),
          HRRound:         normalizeDecision(c["HR Decision"] || c["hr_decision"] || c["HR Round"] || c["hr_round"] || c.HRRound || c.hr_round),
          TechInterviewRound: normalizeDecision(c["Tech Decision"] || c["tech_decision"] || c["Technical Interview"] || c["Tech Interview"] || c.TechnicalInterview || c.technical_interview),
          ManagerInterview: normalizeDecision(c["Manager Decision"] || c["manager_decision"] || c["Final Decision"] || c["Manager Interview"] || c.ManagerInterview || c.manager_interview),

          Decision:     normalizeDecision(c["Resume Decision"] || c["HR Decision"] || c.Decision || c.decision),
          FinalDecision: normalizeDecision(c["Manager Decision"] || c.FinalDecision || c.final_decision),
          ResumeLink:   c["Resume Link"] || c.ResumeLink || c.resumeLink || "",
          PhoneNumber:  String(c["Phone Number"] || c.PhoneNumber || c.phone || ""),
          
          // Transcripts & Logs
          Data: c["Data"] || c.data || "",
          CallRecording: c["Call Recording"] || c["CallRecording"] || c.call_recording || c.recording || "",
          CallLogs: bestCallLogs,

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
          Call_time:          c["Call_time"] || c.Call_time || c["Call Time"] || c.call_time || "",
      }
      }

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
        toast.info("No Data Available", {
          description: rawData.Error || rawData.Eror || "No candidate data found for this campaign.",
        })
        setLoading(false)
        return
      }

      console.log("[v0] Extracted", candidateList.length, "candidates")

      if (candidateList.length === 0) {
        console.warn("[v0] No candidates extracted. Raw keys:", Object.keys(rawData))
        toast.info("No Candidates Found", {
          description: "No candidate data found for this campaign yet.",
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
        numberOfRounds: campaignRounds,
      })

      console.log("[v0] Analytics set with", candidateList.length, "candidates")
    } catch (error) {
      console.error("[v0] Error fetching campaign data:", error)
      toast.error("Error Loading Data", {
        description: (error as Error).message || "Failed to load campaign analytics. Please try again.",
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
    toast.success("Refreshing Data", {
      description: "Campaign data is being updated...",
    })
  }

  const handleDeleteCampaign = async () => {

    try {
      const response = await fetch("/api/webhook-proxy?action=DeleteCampaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "DeleteCampaign",
          campaignName: campaignName
        })
      })
      
      if (!response.ok) throw new Error("Failed to delete campaign")
      
      toast.success("Campaign Deleted", {
        description: `Successfully deleted campaign "${campaignName}"`,
        action: {
          label: "OK",
          onClick: () => router.push("/dashboard"),
        },
        duration: Infinity,
      })
    } catch (err: any) {
      console.error("[CampaignDetail] Delete error:", err)
      toast.error("Deletion Failed", {
        description: err.message || "Failed to delete campaign",
      })
    }
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

  // ── Dynamic Call Log Columns ───────────────────────────────────────
  const { dynamicMetricKeys, columnLabels, candidateMetrics } = useMemo(() => {
    const keySet = new Set<string>()
    const labelMap: Record<string, string> = {}
    const metricMap = new Map<string, Record<string, { value: string; label: string }>>()
    
    if (!analytics?.candidateList) return { dynamicMetricKeys: [], columnLabels: {}, candidateMetrics: metricMap }

    analytics.candidateList.forEach(c => {
      const rawText = c.CallLogs || (c as any)["Call Logs"] || (c as any).call_logs || ""
      const metrics = parseCallLogsForTable(rawText)
      metricMap.set(c.CandidateID, metrics)
      
      Object.entries(metrics).forEach(([key, entry]) => {
        keySet.add(key)
        if (!labelMap[key]) labelMap[key] = entry.label
      })
    })

    // Sort keys alphabetically by label for consistency
    const excludedKeys = new Set(['education', 'experience', 'keyskills', 'skills'])
    const sortedKeys = Array.from(keySet)
      .filter(key => !excludedKeys.has(key))
      .sort((a, b) => 
        labelMap[a].localeCompare(labelMap[b])
      )

    return { 
      dynamicMetricKeys: sortedKeys, 
      columnLabels: labelMap,
      candidateMetrics: metricMap
    }
  }, [analytics?.candidateList])

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

    toast.success("Decision Updated", {
      description: `${candidate.Name}'s marked as ${decision}`,
    })

    // ── 2. Save to backend in background ───────────────────────────────────
    try {
      // For final round, send "Hire"/"Reject" instead of "Yes"/"No"
      const isFinalRound = roundKey === lastRoundKey
      const backendDecision = isFinalRound
        ? decision === "Yes" ? "Hire" : decision === "No" ? "Reject" : decision
        : decision

      // Only send the field that was actually changed — not all other existing decisions
      const fieldName = roundMapping[roundKey] || roundKey
      const queryParams = new URLSearchParams({ 
        action: "UpdateDecision",
        [fieldName]: backendDecision,
      })

      const bodyData = {
        CandidateID: candidate.CandidateID,
        Name: candidate.Name,
        Email: candidate.Email,
        CampaignName: campaignName,
        City: candidate.City,
        Score: candidate.Score,
        HR: candidate.HR,
        "HR Comments": (candidate as any)["HR Comments"],
        "Tech Comments": (candidate as any)["Tech Comments"],
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
      toast.error("Save Failed", {
        description: "Could not save to backend. The change has been reverted.",
      })
    }
  }

  // Helper to render interactive decision badge
  const rounds = analytics?.numberOfRounds ?? 3
  const lastRoundKey = rounds >= 3 ? "ManagerInterview" : rounds === 2 ? "TechInterviewRound" : rounds === 1 ? "HRRound" : "CallRound"

  const DecisionBadge = ({ 
    candidate, 
    roundKey, 
    value,
    readOnly = false,
    isFinal = false,
  }: { 
    candidate: Candidate, 
    roundKey: string, 
    value: string | undefined,
    readOnly?: boolean,
    isFinal?: boolean,
  }) => {
    const isYes = value?.toLowerCase() === "yes" || value?.toLowerCase() === "pass" || value?.toLowerCase() === "approved" || value?.toLowerCase() === "hired" || value?.toLowerCase() === "passed"
    const isNo = value?.toLowerCase() === "no" || value?.toLowerCase() === "fail" || value?.toLowerCase() === "rejected" || value?.toLowerCase() === "failed"
    
    const yesLabel = isFinal ? "Hire" : "Yes"
    const noLabel = isFinal ? "Reject" : "No"
    const label = value ? (isYes ? yesLabel : isNo ? noLabel : value) : "Pending"
    
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
            <Check className="size-3.5" /> {yesLabel}
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="text-red-400 focus:text-red-300 focus:bg-red-500/10 cursor-pointer flex items-center gap-2"
            onClick={(e) => {
              e.stopPropagation()
              handleDecisionUpdate(candidate, roundKey, "No")
            }}
          >
            <X className="size-3.5" /> {noLabel}
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
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="w-full max-w-[98%] mx-auto space-y-6">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-4 md:p-8">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-violet-500/5" />
          <div className="relative space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <Link href="/dashboard">
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground shrink-0">
                    <ArrowLeft className="size-5" />
                  </Button>
                </Link>
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground truncate">
                    {campaignName}
                  </h1>
                  <p className="text-muted-foreground text-sm mt-1 truncate">Analytics & Management</p>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-auto">
                <Button
                  onClick={handleRefresh}
                  variant="outline"
                  className="flex-1 sm:flex-none gap-2 bg-muted/50 border-border hover:bg-muted text-xs md:text-sm h-9"
                >
                  <RefreshCw className="size-3.5" />
                  Refresh
                </Button>
                <Button
                  onClick={() => setIsDeleteDialogOpen(true)}
                  variant="destructive"
                  className="flex-1 sm:flex-none gap-2 text-xs md:text-sm h-9"
                >
                  <Trash2 className="size-3.5" />
                  Delete
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="p-4 rounded-lg bg-card border border-border shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 shrink-0">
                    <Users className="size-5 text-emerald-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xl md:text-2xl font-bold text-foreground truncate">{totalCandidates}</p>
                    <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider font-semibold">Candidates</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-card border border-border shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-violet-500/10 shrink-0">
                    <TrendingUp className="size-5 text-violet-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xl md:text-2xl font-bold text-foreground truncate">{avgScore}</p>
                    <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider font-semibold">Avg Score</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-card border border-border shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10 shrink-0">
                    <CheckCircle2 className="size-5 text-blue-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xl md:text-2xl font-bold text-blue-500 truncate">{passRate}%</p>
                    <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider font-semibold">Pass Rate</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-card border border-border shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10 shrink-0">
                    <Clock className="size-5 text-amber-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xl md:text-2xl font-bold text-amber-500 truncate">{holdRate}%</p>
                    <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider font-semibold">Pending</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <div className="p-3 rounded-lg bg-muted/30 border border-border">
                <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-tighter font-bold">Median</p>
                <p className="text-base md:text-lg font-bold text-violet-500">{medianScore}</p>
              </div>

              <div className="p-3 rounded-lg bg-muted/30 border border-border">
                <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-tighter font-bold">Std Dev</p>
                <p className="text-base md:text-lg font-bold text-blue-500">{scoreStdDeviation}</p>
              </div>

              <div className="p-3 rounded-lg bg-muted/30 border border-border">
                <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-tighter font-bold">TI Avg</p>
                <p className="text-base md:text-lg font-bold text-emerald-500">{tiAvgScore}</p>
              </div>

              <div className="p-3 rounded-lg bg-muted/30 border border-border">
                <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-tighter font-bold">TI Conv</p>
                <p className="text-base md:text-lg font-bold text-amber-500">{tiConversionRate}%</p>
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
                  <SelectTrigger className="w-full min-w-[140px] md:w-[180px] bg-muted/50 border-border text-foreground">
                    <SelectValue placeholder="Filter by decision" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
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
                {/* Desktop Table View */}
                <div className="hidden md:block rounded-lg border border-border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50 hover:bg-muted/50 border-border">
                        <TableHead className="text-muted-foreground font-semibold px-4 w-[200px]">Candidate</TableHead>
                        <TableHead className="text-muted-foreground font-semibold px-4 w-[180px]">Contact</TableHead>
                        <TableHead className="text-muted-foreground font-semibold px-4 w-[120px]">Media</TableHead>
                        {dynamicMetricKeys.map((key) => (
                          <TableHead key={key} className="text-muted-foreground font-semibold text-sm px-4 min-w-[200px]">
                            {columnLabels[key]}
                          </TableHead>
                        ))}
                        <TableHead className="text-muted-foreground font-semibold text-center px-2 w-[80px]">Score</TableHead>
                        <TableHead className="text-muted-foreground font-semibold text-center px-4 w-[100px]">Call Time</TableHead>
                        {!isOptimized && (
                          <TableHead className="text-emerald-500 font-semibold text-center px-1 w-[80px]">Resume</TableHead>
                        )}
                        <TableHead className="text-blue-500 font-semibold text-center px-1 w-[80px]">Call</TableHead>
                        {(analytics?.numberOfRounds ?? 3) >= 1 && (
                          <TableHead className="text-blue-600 dark:text-blue-400 font-semibold text-center px-1 w-[80px]">Round 1</TableHead>
                        )}
                        {(analytics?.numberOfRounds ?? 3) >= 2 && (
                          <TableHead className="text-amber-600 dark:text-amber-400 font-semibold text-center px-1 w-[80px]">Round 2</TableHead>
                        )}
                        {(analytics?.numberOfRounds ?? 3) >= 3 && (
                          <TableHead className="text-emerald-600 dark:text-emerald-400 font-semibold text-center px-1 w-[80px]">Round 3</TableHead>
                        )}
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

                        return (
                          <TableRow
                            key={candidate.CandidateID || index}
                            className="border-border hover:bg-muted transition-colors cursor-pointer group"
                            onClick={() => handleCandidateClick(candidate)}
                          >
                            <TableCell className="font-medium px-4">
                              <div className="flex items-center gap-3">
                                <div className="size-10 rounded-full bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                                  {displayName.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-foreground font-bold truncate group-hover:text-primary transition-colors">{displayName}</p>
                                  <p className="text-xs text-slate-400 truncate">{candidate.City || "Location N/A"}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="px-4">
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground truncate max-w-[170px]">{candidate.Email}</p>
                                {candidate.PhoneNumber && (
                                  <p className="text-xs text-slate-500 flex items-center gap-1">
                                    <Phone className="size-3" />
                                    {candidate.PhoneNumber}
                                  </p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="px-4">
                              <div className="flex flex-col gap-1.5">
                                {candidate.CallRecording && (
                                  <a 
                                    href={candidate.CallRecording} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    onClick={e => e.stopPropagation()}
                                    className="inline-flex w-fit items-center gap-1.5 text-[10px] bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 px-2 py-1 rounded border border-emerald-500/20 font-bold uppercase tracking-wider transition-colors"
                                  >
                                    <PhoneCall className="size-3" /> Audio
                                  </a>
                                )}
                                {candidate.Data && (
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); setViewingMediaFor({ name: displayName, data: candidate.Data!, logs: candidate.CallLogs || "" }); setMediaTab('script') }}
                                    className="inline-flex w-fit items-center gap-1.5 text-[10px] bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 px-2 py-1 rounded border border-blue-500/20 font-bold uppercase tracking-wider transition-colors"
                                  >
                                    <ExternalLink className="size-3" /> Script
                                  </button>
                                )}
                                {(!candidate.CallRecording && !candidate.Data) && (
                                  <span className="text-xs text-muted-foreground/40 italic">—</span>
                                )}
                              </div>
                            </TableCell>
                            {dynamicMetricKeys.map((key) => {
                              const entry = candidateMetrics.get(candidate.CandidateID)?.[key]
                              return (
                                <TableCell key={key} className="px-4 py-3 min-w-[200px]">
                                  {entry ? (
                                    <p className="text-foreground text-base leading-snug line-clamp-3" title={entry.value}>
                                      {entry.value}
                                    </p>
                                  ) : (
                                    <span className="text-muted-foreground/20 font-mono text-[10px]">—</span>
                                  )}
                                </TableCell>
                              )
                            })}
                            <TableCell className="text-center px-2">
                              <span className="text-xl font-bold bg-linear-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                                {typeof candidate.Score === "number" ? candidate.Score.toFixed(0) : candidate.Score}
                              </span>
                            </TableCell>
                            <TableCell className="text-center px-4 text-xs font-medium text-muted-foreground">
                              {candidate.Call_time || "—"}
                            </TableCell>
                            {!isOptimized && (
                              <TableCell className="text-center px-1">
                                <DecisionBadge 
                                  candidate={candidate} 
                                  roundKey="ResumeScreening" 
                                  value={candidate.ResumeScreening} 
                                  isFinal={false}
                                />
                              </TableCell>
                            )}
                            <TableCell className="text-center px-1">
                              <DecisionBadge 
                                candidate={candidate} 
                                roundKey="CallRound" 
                                value={candidate.CallRound} 
                                isFinal={lastRoundKey === "CallRound"}
                              />
                            </TableCell>
                            {(analytics?.numberOfRounds ?? 3) >= 1 && (
                              <TableCell className="text-center px-1">
                                <DecisionBadge 
                                  candidate={candidate} 
                                  roundKey="HRRound" 
                                  value={candidate.HRRound} 
                                  isFinal={lastRoundKey === "HRRound"}
                                />
                              </TableCell>
                            )}
                            {(analytics?.numberOfRounds ?? 3) >= 2 && (
                              <TableCell className="text-center px-1">
                                <DecisionBadge 
                                  candidate={candidate} 
                                  roundKey="TechInterviewRound" 
                                  value={candidate.TechInterviewRound} 
                                  isFinal={lastRoundKey === "TechInterviewRound"}
                                />
                              </TableCell>
                            )}
                            {(analytics?.numberOfRounds ?? 3) >= 3 && (
                              <TableCell className="text-center px-1">
                                <DecisionBadge 
                                  candidate={candidate} 
                                  roundKey="ManagerInterview" 
                                  value={candidate.ManagerInterview} 
                                  isFinal={lastRoundKey === "ManagerInterview"}
                                />
                              </TableCell>
                            )}
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                  {paginatedCandidates.map((candidate, index) => {
                    const displayName =
                      candidate.Name && candidate.Name.trim() !== ""
                        ? candidate.Name
                        : candidate.Email
                          ? candidate.Email.split("@")[0]
                          : "Unnamed Candidate"
                    
                    return (
                      <div
                        key={candidate.CandidateID || index}
                        onClick={() => handleCandidateClick(candidate)}
                        className="bg-muted/30 border border-border rounded-xl p-4 space-y-4 active:scale-[0.98] transition-all"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="size-10 rounded-full bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                              {displayName.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-foreground truncate">{displayName}</p>
                              <p className="text-xs text-slate-400 truncate">{candidate.City || "Location N/A"}</p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                              {typeof candidate.Score === "number" ? candidate.Score.toFixed(0) : candidate.Score}
                            </p>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Score</p>
                          </div>
                        </div>

                        {candidate.Call_time && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg">
                            <Clock className="size-3.5" />
                            <span>Call Time: <span className="font-semibold text-foreground">{candidate.Call_time}</span></span>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 py-3 border-y border-border/50">
                          <div className="space-y-1">
                            <p className="text-[10px] text-muted-foreground uppercase font-bold">Email</p>
                            <p className="text-xs text-foreground truncate">{candidate.Email}</p>
                          </div>
                          {candidate.PhoneNumber && (
                            <div className="space-y-1">
                              <p className="text-[10px] text-muted-foreground uppercase font-bold">Phone</p>
                              <p className="text-xs text-foreground">{candidate.PhoneNumber}</p>
                            </div>
                          )}
                        </div>

                        {/* Dynamic Questions (Mobile) */}
                        {dynamicMetricKeys.filter(key => !!candidateMetrics.get(candidate.CandidateID)?.[key]).length > 0 && (
                          <div className="space-y-3 py-3 border-b border-border/50">
                            {dynamicMetricKeys.map((key) => {
                              const entry = candidateMetrics.get(candidate.CandidateID)?.[key]
                              if (!entry) return null
                              return (
                                  <div key={key} className="space-y-1">
                                  <p className="text-xs text-muted-foreground uppercase font-bold">{columnLabels[key]}</p>
                                  <p className="text-base text-foreground leading-snug">{entry.value}</p>
                                </div>
                              )
                            })}
                          </div>
                        )}

                        <div className="space-y-2">
                          <p className="text-[10px] text-muted-foreground uppercase font-bold">Pipeline Status</p>
                          <div className="flex flex-wrap gap-2">
                            {!isOptimized && (
                              <div className="space-y-1">
                                <p className="text-[8px] text-slate-500 uppercase">Resume</p>
                                <DecisionBadge candidate={candidate} roundKey="ResumeScreening" value={candidate.ResumeScreening} isFinal={false} />
                              </div>
                            )}
                            <div className="space-y-1">
                              <p className="text-[8px] text-slate-500 uppercase">Call</p>
                              <DecisionBadge candidate={candidate} roundKey="CallRound" value={candidate.CallRound} isFinal={lastRoundKey === "CallRound"} />
                            </div>
                            {(analytics?.numberOfRounds ?? 3) >= 1 && (
                              <div className="space-y-1">
                                <p className="text-[8px] text-slate-500 uppercase">R1</p>
                                <DecisionBadge candidate={candidate} roundKey="HRRound" value={candidate.HRRound} isFinal={lastRoundKey === "HRRound"} />
                              </div>
                            )}
                            {(analytics?.numberOfRounds ?? 3) >= 2 && (
                              <div className="space-y-1">
                                <p className="text-[8px] text-slate-500 uppercase">R2</p>
                                <DecisionBadge candidate={candidate} roundKey="TechInterviewRound" value={candidate.TechInterviewRound} isFinal={lastRoundKey === "TechInterviewRound"} />
                              </div>
                            )}
                            {(analytics?.numberOfRounds ?? 3) >= 3 && (
                              <div className="space-y-1">
                                <p className="text-[8px] text-slate-500 uppercase">R3</p>
                                <DecisionBadge candidate={candidate} roundKey="ManagerInterview" value={candidate.ManagerInterview} isFinal={lastRoundKey === "ManagerInterview"} />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
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
                        className="gap-2 bg-muted/50 border-border hover:bg-muted disabled:opacity-50"
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
                                  : "bg-muted/50 border-border hover:bg-muted"
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
        numberOfRounds={analytics?.numberOfRounds ?? 3}
        isOptimized={isOptimized}
      />
      <DeleteCampaignDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteCampaign}
        campaignName={campaignName}
      />
      {viewingMediaFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setViewingMediaFor(null)}>
          <div className="bg-card border border-border p-6 rounded-xl shadow-xl max-w-3xl w-full max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-foreground">Call Session: {viewingMediaFor.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">Review candidate transcript and extracted call logs</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setViewingMediaFor(null)} className="text-muted-foreground hover:text-foreground shrink-0">
                <X className="size-5" />
              </Button>
            </div>

            <div className="flex bg-muted/60 p-1 rounded-lg w-fit mb-5 border border-border">
              <button
                onClick={() => setMediaTab('script')}
                className={cn(
                  "px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all duration-150", 
                  mediaTab === 'script' 
                    ? "bg-background text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Raw Transcript
              </button>
              <button
                onClick={() => setMediaTab('intelligence')}
                className={cn(
                  "px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all duration-150", 
                  mediaTab === 'intelligence' 
                    ? "bg-background text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Extracted Intelligence
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-5 rounded-xl border border-border bg-card/40 backdrop-blur-sm">
              {mediaTab === 'script' ? (
                <ChatTranscript data={viewingMediaFor.data} candidateName={viewingMediaFor.name} />
              ) : (
                <ParsedIntelligence logs={viewingMediaFor.logs} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ChatTranscript({ data, candidateName }: { data: string, candidateName: string }) {
  const messages: { role: 'ai' | 'user', content: string }[] = [];
  const lines = data.split('\n');
  let currentRole: 'ai' | 'user' | null = null;
  let currentContent = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('Q: ')) {
      if (currentRole && currentContent) {
        messages.push({ role: currentRole, content: currentContent.trim() });
      }
      currentRole = 'ai';
      currentContent = line.substring(3) + '\n';
    } else if (line.startsWith('A: ')) {
      if (currentRole && currentContent) {
        messages.push({ role: currentRole, content: currentContent.trim() });
      }
      currentRole = 'user';
      currentContent = line.substring(3) + '\n';
    } else {
      if (currentRole) {
        currentContent += line + '\n';
      } else {
        currentContent += line + '\n';
      }
    }
  }
  if (currentRole && currentContent) {
    messages.push({ role: currentRole, content: currentContent.trim() });
  } else if (!currentRole && currentContent.trim()) {
    return <div className="whitespace-pre-wrap font-mono text-sm">{data}</div>;
  }

  if (messages.length === 0) {
    return <div className="whitespace-pre-wrap font-mono text-sm">{data}</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      {messages.map((msg, idx) => (
        <div key={idx} className={cn("flex w-full", msg.role === 'user' ? "justify-end" : "justify-start")}>
          <div className={cn("flex flex-col gap-1 max-w-[85%]", msg.role === 'user' ? "items-end" : "items-start")}>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1">
              {msg.role === 'user' ? candidateName : "AI Recruiter"}
            </span>
            <div className={cn(
              "px-4 py-2.5 rounded-2xl text-sm shadow-sm whitespace-pre-wrap",
              msg.role === 'user' 
                ? "bg-primary text-primary-foreground rounded-tr-sm" 
                : "bg-muted border border-border text-foreground rounded-tl-sm"
            )}>
              {msg.content}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ParsedIntelligence({ logs }: { logs: string }) {
  const dynamicMetrics = parseCallLogsForTable(logs);

  if (Object.keys(dynamicMetrics).length === 0) {
    if (logs && logs.trim().length > 0) {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-amber-500 mb-2">
            <AlertCircle className="size-4" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Raw Call Interface Data</span>
          </div>
          <div className="bg-muted/30 border border-border/80 rounded-xl p-5 font-mono text-xs leading-relaxed whitespace-pre-wrap text-foreground/80 italic">
            {logs}
          </div>
          <p className="text-[9px] text-muted-foreground text-center">Note: Structured parsing failed, showing raw content from "Call Logs".</p>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <FileText className="size-12 mb-4 opacity-20" />
        <p className="text-sm font-semibold">No intelligence metrics found</p>
        <p className="text-xs opacity-60 mt-1">Check "Raw Transcript" tab or verify the "Call Logs" column in your data source.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Object.values(dynamicMetrics).map((metric, idx) => (
        <div key={idx} className="bg-muted/30 border border-border/80 rounded-xl p-4 flex flex-col gap-2 transition-all hover:bg-muted/40 shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground border-b border-border/30 pb-2 mb-1">
            <MessageSquare className="size-3 text-emerald-500" />
            <span className="text-[9px] font-black uppercase tracking-widest leading-none">{metric.label}</span>
          </div>
          <p className="text-sm font-semibold text-foreground leading-relaxed pl-5">{metric.value}</p>
        </div>
      ))}
    </div>
  );
}
