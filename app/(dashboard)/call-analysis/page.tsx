"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  PhoneCall, Search, Loader2, RefreshCcw, CheckCircle2, XCircle, Clock,
  ChevronDown, ChevronUp, Filter, Download, User, MapPin, Briefcase, 
  Target, Calendar, DollarSign, MessageSquare, LayoutDashboard,
  Sparkles, Layers, ListChecks, Check, X, AlertCircle
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import { CandidateDetailSidebar, type Candidate as SidebarCandidate } from "@/components/candidates/candidate-detail-sidebar"

// Use the sidebar's candidate type for consistency, but extend for the dynamic nature of this page
type Candidate = SidebarCandidate & {
  decision?: string
  call_decision?: string
  "Call Decision"?: string
  name?: string
  email?: string
  city?: string
  score?: number | string
  "Call Logs"?: string
  CallLogs?: string
  call_logs?: string
  data?: string
  CampaignName?: string
  CallRound?: string
  ResumeScreening?: string
  "Resume Decision"?: string
  HRRound?: string
  "HR Decision"?: string
  TechInterviewRound?: string
  "Tech Decision"?: string
  ManagerInterview?: string
  "Manager Decision"?: string
  "HR Comments"?: string
  "Tech Comments"?: string
  [key: string]: any
}


interface Campaign { CampaignName: string; IsActive: boolean }

// ── Helpers ───────────────────────────────────────────────────────────────────
function normalizeDecision(raw?: any): "Passed" | "Rejected" | "Pending" {
  if (raw === undefined || raw === null || raw === "") return "Pending"
  const v = String(raw).toLowerCase().trim()
  if (["yes", "pass", "passed", "approved", "selected", "hired"].includes(v)) return "Passed"
  if (["no", "fail", "failed", "rejected"].includes(v)) return "Rejected"
  return "Pending"
}

type MetricEntry = { value: string; label: string }

function parseScreeningResponses(candidate: any): Record<string, MetricEntry> {
  const result: Record<string, MetricEntry> = {}
  if (!candidate) return result

  const tryExtract = (obj: any): boolean => {
    if (!obj) return false
    const resolved = typeof obj === "string" ? JSON.parse(obj) : obj
    if (!resolved) return false
    const targets = [resolved, resolved?.output, resolved?.Output].filter(Boolean)
    for (const t of targets) {
      const responses = t?.screeningResponses || t?.ScreeningResponses
      if (Array.isArray(responses)) {
        for (const r of responses) {
          if (r.question && r.answer) {
            const key = r.question.toLowerCase().replace(/[^a-z0-9]/g, "")
            if (!result[key]) result[key] = { value: r.answer, label: r.question }
          }
        }
        if (Object.keys(result).length > 0) return true
      }
    }
    return false
  }

  const paths = [candidate, candidate?.json, candidate?.output, candidate?.Output]
  for (const p of paths) {
    if (!p) continue
    try { if (tryExtract(p)) return result } catch (_e) {}
  }

  return result
}

// Values that indicate no real answer was captured — we skip these so they
// don't pollute the column list with "Not mentioned" everywhere.
const EMPTY_VALUES = new Set([
  "n/a", "na", "none", "-", "—", "", "null", "undefined",
])

function isRealValue(v: string): boolean {
  return !EMPTY_VALUES.has(v.toLowerCase().trim())
}

function parseCallLogs(raw: any): Record<string, MetricEntry> {
  const result: Record<string, MetricEntry> = {}
  if (!raw) return result
  const str = String(raw).trim()
  if (!str) return result

  // Try JSON first — some payloads are JSON arrays/objects
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
  } catch (_e) { /* Not JSON, fall through */ }

  const lines = str.split(/\n|\r|\r\n|\\n/)
  let pendingQuestion = ""
  
  for (let line of lines) {
    // 1) Question - Answer or Question: Answer
    // We specifically target the digit-prefix pattern first
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
    // Supports: "1) Question - Answer", "Question: Answer", "Question — Answer" etc.
    const match = line.match(/^(?:\d+[\.\)]\s?)(.+?)\s*[:\-–—]\s*(.*)$/) || 
                  line.match(/^([^:\-–—]{3,120})\s*[:\-–—]\s*(.*)$/)
    
    if (match) {
      const rawLabel = match[1].trim()
      const content = match[2].trim()
      
      // EXCLUDE long conversational lines and common transcript headers
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

function answerStyle(a: string): { label: string; type: "yes" | "no" | "other" } {
  const v = a.toLowerCase().trim()
  if (v === "yes" || v.startsWith("yes ") || v.startsWith("yes,")) return { label: "Yes", type: "yes" }
  if (v === "no" || v.startsWith("no ") || v.startsWith("no,")) return { label: "No", type: "no" }
  return { label: a, type: "other" }
}

function SortIcon({ field, sortField, sortDir }: { field: string, sortField: string, sortDir: string }) {
  if (sortField !== field) return <ChevronDown className="size-3 text-muted-foreground/40" />
  return sortDir === "asc" ? <ChevronUp className="size-3 text-cyan-500" /> : <ChevronDown className="size-3 text-cyan-500" />
}

function DecisionSelect({ 
  value, 
  onValueChange, 
  disabled 
}: { 
  value: string, 
  onValueChange: (v: string) => void,
  disabled?: boolean
}) {
  const status = normalizeDecision(value)
  
  return (
    <Select value={status} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className={cn(
        "h-8 w-[120px] rounded-lg border-none text-[10px] font-black uppercase tracking-wider px-3 transition-all",
        status === "Passed" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-[0_0_15px_-5px_var(--color-emerald-500)]",
        status === "Rejected" && "bg-red-500/10 text-red-600 dark:text-red-400 shadow-[0_0_15px_-5px_var(--color-red-500)]",
        status === "Pending" && "bg-muted text-muted-foreground"
      )}>
        <div className="flex items-center gap-1.5">
          <div className={cn(
            "size-1.5 rounded-full",
            status === "Passed" && "bg-emerald-500 animate-pulse",
            status === "Rejected" && "bg-red-500",
            status === "Pending" && "bg-muted-foreground/50"
          )} />
          <SelectValue placeholder="Status" />
        </div>
      </SelectTrigger>
      <SelectContent className="bg-popover border-border">
        <SelectItem value="Passed" className="text-emerald-600 dark:text-emerald-400 focus:text-emerald-700">Passed</SelectItem>
        <SelectItem value="Rejected" className="text-red-600 dark:text-red-400 focus:text-red-700">Rejected</SelectItem>
        <SelectItem value="Pending" className="text-muted-foreground">Pending</SelectItem>
      </SelectContent>
    </Select>
  )
}

// ── Page Component ──────────────────────────────────────────────────────────
export default function CallAnalysisPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [selectedCampaign, setSelectedCampaign] = useState<string>("")
  const [allCandidates, setAllCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(false)
  const [sortField, setSortField] = useState<"name" | "score" | "decision">("name")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")
  const [updatingEmail, setUpdatingEmail] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [decisionFilter, setDecisionFilter] = useState("all")

  // Sidebar state
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Fetch campaigns
  useEffect(() => {
    fetch("/api/campaigns")
      .then(r => r.json())
      .then((data: any) => setCampaigns(data.campaigns || []))
      .catch(err => console.error("[CallAnalysis] campaign fetch error:", err))
  }, [])

  const fetchData = useCallback(async (campaign: string) => {
    setLoading(true)
    setAllCandidates([])
    if (!campaign) {
      setLoading(false)
      return
    }
    try {
      const userEmail = user?.email || "guest@example.com"
      let response: Response

      if (campaign !== "all") {
        response = await fetch(`/api/campaigns?campaignName=${encodeURIComponent(campaign)}`)
      } else {
        const params = new URLSearchParams()
        params.append("action", "HRAnalytics")
        response = await fetch(`/api/webhook-proxy?${params.toString()}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userEmail }),
        })
      }

      if (!response.ok) throw new Error(`API returned ${response.status}`)
      
      const text = await response.text()
      if (!text || !text.trim()) {
        setAllCandidates([])
        return
      }

      const rawData = JSON.parse(text)
      let list: any[] = []
      
      // Attempt to find any array of objects that looks like candidates
      const findCandidateList = (obj: any): any[] | null => {
        if (Array.isArray(obj)) {
          // If it's an array of objects with common candidate fields, it's likely our list
          if (obj.length > 0 && typeof obj[0] === 'object' && (obj[0].Email || obj[0].email || obj[0].Name || obj[0].name || obj[0].phoneNumber)) {
            return obj
          }
          // Also check if it's an array of wrappers like [{ data: [...] }]
          for (const item of obj) {
            const nested = findCandidateList(item)
            if (nested) return nested
          }
        } else if (obj && typeof obj === 'object') {
          // Check common properties
          const targets = [obj.data, obj.candidates, obj.campaignCandidates, obj.items, obj.results]
          for (const t of targets) {
            if (Array.isArray(t)) return t
          }
          // Recursive check for any array property
          for (const key in obj) {
            if (Array.isArray(obj[key])) {
              const res = findCandidateList(obj[key])
              if (res) return res
            }
          }
        }
        return null
      }

      list = findCandidateList(rawData) || (Array.isArray(rawData) ? rawData : [])

      // Map candidates and merge potential JSON/output wrappers
      const candidates = list.map(item => {
        if (!item || typeof item !== "object") return item
        let base = { ...item }
        if (item.json && typeof item.json === "object") base = { ...base, ...item.json }
        if (item.output && typeof item.output === "object") base = { ...base, ...item.output }
        if (item.data && typeof item.data === "object" && !Array.isArray(item.data)) {
          base = { ...base, ...item.data }
        }
        return base
      })

      // Deduplicate by email/candidateID/phone
      const uniqueMap = new Map()
      candidates.forEach((c: any) => {
        if (!c || typeof c !== 'object') return
        const key = c.Email || c.email || c.CandidateID || c["Candidate ID"] || c.phoneNumber || c.PhoneNumber || c.Phone || c["Phone Number"] || Math.random().toString()
        if (!uniqueMap.has(key)) uniqueMap.set(key, c)
      })
      
      setAllCandidates(Array.from(uniqueMap.values()))
    } catch (err) {
      console.error("[CallAnalysis] data fetch error:", err)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { fetchData(selectedCampaign) }, [selectedCampaign, fetchData])

  // Data processing — raw Call Logs text is tried first (real Q&A from the call).
  // screeningResponses is only used as a fallback (it often has "Not mentioned" placeholders).
  const dataRows = useMemo(() => {
    return allCandidates
      .map(c => {
        // ULTIMATE FIX: Scan EVERY single field in the object for the intelligence pattern.
        // We look for the field that has the MOST matches of the "1) " pattern.
        let bestText = ""
        let maxMatches = -1
        
        const allEntries = Object.entries(c)
        for (const [key, val] of allEntries) {
          if (typeof val !== "string" || val.length < 5) continue
          
          const text = val.trim()
          const matches = text.match(/\d+[\.\)]\s/g)
          const count = matches ? matches.length : 0
          
          let score = count
          if (count > 0 && /log|call|intel/i.test(key)) score += 0.5

          if (score > maxMatches) {
            maxMatches = score
            bestText = text
          }
        }
        
        // Final fallback: If no pattern was found, try to find the explicit "Call Logs" field
        if (!bestText) {
          bestText = c["Call Logs"] || c.CallLogs || c.call_logs || ""
          if (bestText) maxMatches = 1 // Force it to parse
        }
        
        let metrics: Record<string, MetricEntry> = {}
        let hasCallData = false
        let bestRaw = ""

        if (maxMatches > 0) {
          metrics = parseCallLogs(bestText)
          hasCallData = true
          bestRaw = bestText
        } else {
          // Absolute fallback if no numbers found: check the hard-coded keys
          const logKeys = ["Call Logs", "CallLogs", "call_logs", "Call_logs", "callLogs"]
          for (const k of logKeys) {
            if (c[k] && String(c[k]).trim().length > 5) {
              bestText = String(c[k]).trim()
              metrics = parseCallLogs(bestText)
              hasCallData = true
              bestRaw = bestText
              break
            }
          }
        }

        if (hasCallData && Object.keys(metrics).length > 0) {
          return { candidate: c, metrics, hasCallData, bestRaw }
        }

        return { 
          candidate: c, 
          metrics: {} as Record<string, MetricEntry>, 
          hasCallData: hasCallData || !!(bestRaw && bestRaw.length > 0),
          bestRaw 
        }
      })
      // We keep the candidate if they have ANY text in Call Logs, even if parsing failed to extract metrics
      // This ensures they show up in the table so the user can at least see the profile.
      .filter(({ hasCallData }) => hasCallData)
  }, [allCandidates])

  const { dynamicMetricKeys, columnLabels } = useMemo(() => {
    const keySet = new Set<string>()
    const labelMap: Record<string, string> = {}
    for (const { metrics } of dataRows) {
      for (const [key, entry] of Object.entries(metrics)) {
        keySet.add(key)
        if (!labelMap[key]) labelMap[key] = entry.label
      }
    }
    const excludedKeys = new Set(['education', 'experience', 'keyskills', 'skills'])
    const keys = Array.from(keySet).filter(key => !excludedKeys.has(key))
    // ROOT FIX: If no dynamic keys were found but we have dataRows, add a 'RAW DATA' column
    if (keys.length === 0 && dataRows.length > 0) {
      keys.push("raw_fallback")
      labelMap["raw_fallback"] = "Raw Transcript"
    }
    return { dynamicMetricKeys: keys, columnLabels: labelMap }
  }, [dataRows])

  const filtered = useMemo(() => {
    return dataRows
      .filter(({ candidate: c }) => {
        const decision = normalizeDecision(c["Call Decision"] || c.CallRound || c.call_decision || c.Decision || c.decision)
        if (decisionFilter !== "all" && decision !== decisionFilter) return false
        const q = search.toLowerCase()
        if (!q) return true
        return (
          (c.Name || c.name || "").toLowerCase().includes(q) ||
          (c.Email || c.email || "").toLowerCase().includes(q) ||
          (c.City || c.city || "").toLowerCase().includes(q)
        )
      })
      .sort((a, b) => {
        let va: any = "", vb: any = ""
        if (sortField === "name") { va = a.candidate.Name || a.candidate.name || ""; vb = b.candidate.Name || b.candidate.name || "" }
        if (sortField === "score") { va = Number(a.candidate.Score || a.candidate.score) || 0; vb = Number(b.candidate.Score || b.candidate.score) || 0 }
        if (sortField === "decision") {
          va = normalizeDecision(a.candidate["Call Decision"] || a.candidate.CallRound || a.candidate.call_decision || a.candidate.Decision)
          vb = normalizeDecision(b.candidate["Call Decision"] || b.candidate.CallRound || b.candidate.call_decision || b.candidate.Decision)
        }
        const cmp = typeof va === "number" ? va - (vb as number) : String(va).localeCompare(String(vb))
        return sortDir === "asc" ? cmp : -cmp
      })
  }, [dataRows, search, decisionFilter, sortField, sortDir])

  const stats = useMemo(() => ({
    total: dataRows.length,
    passed: dataRows.filter(r => normalizeDecision(r.candidate["Call Decision"] || r.candidate.CallRound || r.candidate.decision || r.candidate.Decision) === "Passed").length,
    rejected: dataRows.filter(r => normalizeDecision(r.candidate["Call Decision"] || r.candidate.CallRound || r.candidate.decision || r.candidate.Decision) === "Rejected").length,
  }), [dataRows])

  const handleUpdateDecision = async (candidate: Candidate, newDecision: string) => {
    setUpdatingEmail(candidate.Email || "")
    try {
      // Formalize the decision string back to Yes/No for n8n/Firebase compatibility
      const apiValue = newDecision === "Passed" ? "Yes" : newDecision === "Rejected" ? "No" : "Pending"
      
      // Mirror the sidebar logic: Decisions in params, Details in body
      const queryParams = new URLSearchParams({
        action: "UpdateDecision",
        "Call Round": apiValue,
      })

      const bodyData = {
        CandidateID: candidate.CandidateID || "",
        Name: candidate.Name || "",
        Email: candidate.Email,
        CampaignName: candidate.CampaignName || selectedCampaign,
        City: candidate.City || "",
        HR: candidate.HR || "",
        Score: candidate.Score || "",
        "HR Comments": candidate["HR Comments"] || candidate.Comments || "",
        "Tech Comments": candidate["Tech Comments"] || "",
        UserEmail: user?.email || "guest@example.com"
      }

      const response = await fetch(`/api/webhook-proxy?${queryParams.toString().replace(/\+/g, '%20')}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      })

      if (!response.ok) throw new Error(`Status ${response.status}`)
      
      setAllCandidates(prev => prev.map(c => 
        c.Email === candidate.Email ? { ...c, "Call Decision": newDecision, CallRound: newDecision, call_decision: newDecision, Decision: newDecision } : c
      ))
      
      toast({ 
        title: "Database Sync Successful", 
        description: `Marked ${candidate.Name} as ${newDecision}.`,
      })

      // If sidebar is open with this candidate, update the sidebar as well
      if (selectedCandidate?.Email === candidate.Email) {
        setSelectedCandidate(prev => prev ? { ...prev, CallRound: apiValue, Decision: apiValue } : null)
      }
    } catch (err) {
      console.error("[DecisionSync] Error:", err)
      toast({ 
        title: "Sync Failed", 
        description: "The remote record could not be updated. Please try again.", 
        variant: "destructive" 
      })
    } finally {
      setUpdatingEmail(null)
    }
  }

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc")
    else { setSortField(field); setSortDir("asc") }
  }

  return (
    <div className="space-y-4 w-full animate-in fade-in duration-500 pb-10">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-[32px] bg-linear-to-br from-card/50 to-muted/20 border border-border/50 p-10 shadow-2xl backdrop-blur-3xl group">
        <div className="absolute top-0 right-0 p-8 opacity-10 blur-[100px] bg-primary rounded-full size-80 -mr-40 -mt-40 transition-all duration-700 group-hover:opacity-20 group-hover:scale-110" />
        <div className="absolute bottom-0 left-0 p-8 opacity-5 blur-[80px] bg-cyan-500 rounded-full size-64 -ml-32 -mb-32 transition-all duration-700 group-hover:opacity-10" />
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="size-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-inner group/icon">
                <Sparkles className="size-7 text-primary transition-transform duration-500 group-hover/icon:rotate-12 group-hover/icon:scale-110" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-foreground tracking-tight leading-none mb-1">Call Analysis <span className="text-primary italic">Hub</span></h1>
                <p className="text-muted-foreground/60 text-[11px] font-black uppercase tracking-[0.3em]">AI-Driven Candidate Intelligence</p>
              </div>
            </div>
            <p className="text-muted-foreground/70 text-sm max-w-xl leading-relaxed">Advanced NLP extraction of key qualification metrics and behavioral signals from automated candidate call logs.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={() => fetchData(selectedCampaign)} 
              disabled={loading} 
              className="rounded-2xl border-white/10 text-foreground h-14 px-4 md:px-8 bg-zinc-900/50 backdrop-blur-2xl hover:bg-zinc-900/80 transition-all font-black uppercase tracking-widest text-[10px] shadow-2xl active:scale-[0.98]"
            >
              <RefreshCcw className={cn("size-4 mr-3", loading && "animate-spin")} /> 
              {loading ? "Synchronizing..." : "Refresh Intelligence"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { label: "Analysed Profiles", value: stats.total, icon: Users, color: "text-blue-500", bg: "bg-blue-500/5" },
            { label: "Active Filter", value: filtered.length, icon: ListChecks, color: "text-primary", bg: "bg-primary/5" },
            { label: "Conversion Rate", value: stats.total > 0 ? `${((stats.passed / stats.total) * 100).toFixed(0)}%` : "0%", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/5" },
            { label: "Rejected", value: stats.rejected, icon: XCircle, color: "text-red-500", bg: "bg-red-500/5" },
          ].map((s, i) => (
            <div key={i} className={cn("rounded-2xl p-5 border border-white/5 transition-all duration-300 hover:scale-[1.02] hover:bg-white/5 shadow-sm", s.bg)}>
              <div className="flex items-center gap-2 mb-2 opacity-60">
                <s.icon className={cn("size-4", s.color)} />
                <span className="text-[9px] uppercase font-black tracking-widest text-muted-foreground">{s.label}</span>
              </div>
              <div className="text-3xl font-black text-foreground drop-shadow-sm">{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Constraints & Controls */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name, email, city..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            className="pl-12 h-14 bg-card border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:border-primary/50 transition-all" 
          />
        </div>
        <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
          <SelectTrigger className="w-full md:w-64 h-14 bg-card border-border rounded-2xl text-foreground font-bold px-6">
            <LayoutDashboard className="size-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Campaign" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border text-popover-foreground">
            <SelectItem value="all">All Campaigns</SelectItem>
            {campaigns.map(c => <SelectItem key={c.CampaignName} value={c.CampaignName}>{c.CampaignName}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={decisionFilter} onValueChange={setDecisionFilter}>
          <SelectTrigger className="w-full md:w-48 h-14 bg-card border-border rounded-2xl text-foreground font-bold px-6">
            <Filter className="size-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Decision" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border text-popover-foreground">
            <SelectItem value="all">Any Status</SelectItem>
            <SelectItem value="Passed">Passed</SelectItem>
            <SelectItem value="Rejected">Rejected</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Main Analysis Matrix */}
      <Card className="border-border bg-card shadow-sm rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[10px] border-collapse">
            <thead>
              <tr className="bg-muted/30 border-b border-border/50">
                <th className="md:sticky md:left-0 z-20 bg-background/80 backdrop-blur-xl px-3 md:px-4 py-4 text-left font-black text-muted-foreground/60 uppercase tracking-[0.15em] text-[9px] w-[120px] md:w-[180px] cursor-pointer border-r border-border/50 md:shadow-[4px_0_12px_-4px_rgba(0,0,0,0.1)]" onClick={() => toggleSort("name")}>
                  <div className="flex items-center gap-2">Target Profile (v7-ULTIMATE-SELECTOR) <SortIcon field="name" sortField={sortField} sortDir={sortDir} /></div>
                </th>
                <th className="px-4 py-4 text-left font-black text-muted-foreground/60 uppercase tracking-[0.15em] text-[9px] w-[110px] border-r border-border/50 whitespace-nowrap">Status</th>
                {dynamicMetricKeys.map((key, i) => (
                  <th key={i} className="px-4 py-4 text-left font-black text-muted-foreground/60 uppercase tracking-[0.15em] text-[9px] min-w-[130px] max-w-[200px] border-r border-border/50">
                    <div className="flex items-center gap-2">
                       <span className="text-foreground/70">{columnLabels[key] || key}</span>
                    </div>
                  </th>
                ))}
                <th className="px-4 py-4 text-left font-black text-muted-foreground/60 uppercase tracking-[0.15em] text-[9px] min-w-[150px] border-r border-border/50">
                  <div className="flex items-center gap-2">
                     <PhoneCall className="size-3 text-primary/60" />
                     <span className="text-foreground/70">Call Recording</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={dynamicMetricKeys.length + 3} className="py-32 text-center">
                    <Loader2 className="size-10 animate-spin mx-auto text-primary mb-4 opacity-50" />
                    <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">Processing Transcripts...</p>
                  </td>
                </tr>
              ) : !selectedCampaign ? (
                <tr>
                  <td colSpan={dynamicMetricKeys.length + 3} className="py-32 text-center">
                    <Sparkles className="size-10 mx-auto text-primary/30 mb-4 animate-pulse" />
                    <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">Select a campaign to view the data</p>
                    <p className="text-muted-foreground/60 text-[9px] mt-2">Choose a campaign from the dropdown above to start analysis</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={dynamicMetricKeys.length + 3} className="py-32 text-center">
                    <PhoneCall className="size-8 mx-auto text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground font-bold uppercase tracking-widest text-[9px]">No matching records found</p>
                  </td>
                </tr>
              ) : (
                filtered.map(({ candidate: c, metrics }, ri) => {
                  const name = c.Name || c.name || "Anonymous"
                  return (
                    <tr 
                      key={ri} 
                      className="hover:bg-muted/30 group transition-colors border-b border-border cursor-pointer text-foreground"
                      onClick={() => {
                        setSelectedCandidate(c)
                        setIsSidebarOpen(true)
                      }}
                    >
                      <td className="md:sticky md:left-0 z-10 bg-background/95 backdrop-blur-xl px-3 md:px-4 py-3 border-r border-border/50 group-hover:bg-muted/50 transition-colors md:shadow-[4px_0_12px_-4px_rgba(0,0,0,0.1)]">
                        <div className="flex items-center gap-2 md:gap-3">
                          <div className="size-7 md:size-8 rounded-xl bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-black border border-primary/20 shadow-sm text-[10px] md:text-[11px]">
                            {name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-foreground text-[10px] md:text-[11px] truncate leading-none mb-0.5 md:mb-1">{name}</p>
                            <p className="hidden sm:block text-[9px] text-muted-foreground/70 truncate font-medium">{c.Email || ""}</p>
                          </div>
                        </div>
                      </td>
                      <td 
                        className="px-3 py-2 border-r border-border"
                        onClick={(e) => e.stopPropagation()} // Prevent sidebar from opening when clicking dropdown
                      >
                        <DecisionSelect 
                          value={c["Call Decision"] || c.CallRound || c.call_decision || c.Decision || ""} 
                          onValueChange={(v) => handleUpdateDecision(c, v)}
                          disabled={updatingEmail === c.Email}
                        />
                      </td>
                      {dynamicMetricKeys.map((key, ci) => {
                        if (key === "raw_fallback") {
                          // ROOT FIX: Show the raw text if parsing failed
                          const rawText = c.CallLogs || c["Call Logs"] || ""
                          return (
                            <td key={ci} className="px-3 py-2 border-r border-border min-w-[250px] max-w-[400px]">
                              <p className="text-foreground/80 text-[10px] leading-tight line-clamp-3 font-mono italic" title={String(rawText)}>
                                {String(rawText).substring(0, 500)}
                                {String(rawText).length > 500 ? "..." : ""}
                              </p>
                            </td>
                          )
                        }
                        const entry = metrics[key]
                        if (!entry) return <td key={ci} className="px-3 py-2 text-muted-foreground/30 font-mono border-r border-border text-center">—</td>
                        const style = answerStyle(entry.value)
                        return (
                          <td key={ci} className="px-3 py-2 border-r border-border min-w-[120px] max-w-[180px]">
                            {style.type === "yes" ? (
                              <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-[9px]">
                                <Check className="size-2.5" /> YES
                              </div>
                            ) : style.type === "no" ? (
                              <div className="flex items-center gap-1 text-red-600 dark:text-red-400 font-bold text-[9px]">
                                <X className="size-2.5" /> NO
                              </div>
                            ) : (
                              <p className="text-foreground/80 text-[9px] leading-tight line-clamp-2" title={entry.value}>{entry.value}</p>
                            )}
                          </td>
                        )
                      })}
                      <td className="px-4 py-3 border-r border-border/50 min-w-[150px]" onClick={e => e.stopPropagation()}>
                        {(() => {
                          const recordingUrl = c["Call Recording"] || c.CallRecording || c.call_recording || c.Recording || c.recording;
                          if (!recordingUrl) return <div className="text-muted-foreground/30 font-mono text-center">—</div>;
                          return (
                            <div className="flex items-center gap-2 group/audio">
                              <audio 
                                controls 
                                src={recordingUrl}
                                className="h-7 w-full max-w-[140px] opacity-70 group-hover/audio:opacity-100 transition-opacity [&::-webkit-media-controls-panel]:bg-muted/80 [&::-webkit-media-controls-panel]:rounded-lg"
                              />
                            </div>
                          );
                        })()}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <CandidateDetailSidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        candidate={selectedCandidate}
        campaignName={selectedCandidate?.CampaignName || (selectedCampaign !== "all" ? selectedCampaign : undefined)}
        onDecisionUpdate={() => fetchData(selectedCampaign)}
      />
    </div>
  )
}

function Users(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
