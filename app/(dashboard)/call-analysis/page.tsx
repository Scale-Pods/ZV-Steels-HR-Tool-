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

// ── Configuration ─────────────────────────────────────────────────────────────
const METRIC_COLUMNS = [
  { key: "experience",        label: "Experience",         icon: Briefcase },
  { key: "responsibilityfit", label: "Responsibility Fit", icon: CheckCircle2 },
  { key: "location",          label: "Location",           icon: MapPin },
  { key: "targets",           label: "Targets",            icon: Target },
  { key: "noticeperiod",      label: "Notice Period",      icon: Calendar },
  { key: "availability",      label: "Availability",       icon: Clock },
  { key: "salary",            label: "Salary",             icon: DollarSign },
  { key: "interview",         label: "Interview",          icon: MessageSquare }
]

// Normalize labels for parsing
const LABEL_TO_KEY: Record<string, string> = {
  "experience": "experience",
  "responsibility fit": "responsibilityfit",
  "responsibilityfit": "responsibilityfit",
  "location": "location",
  "targets": "targets",
  "notice period": "noticeperiod",
  "noticeperiod": "noticeperiod",
  "availability": "availability",
  "salary": "salary",
  "salary expectation": "salary",
  "interview": "interview"
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function normalizeDecision(raw?: any): "Passed" | "Rejected" | "Pending" {
  if (raw === undefined || raw === null || raw === "") return "Pending"
  const v = String(raw).toLowerCase().trim()
  if (["yes", "pass", "passed", "approved", "selected", "hired"].includes(v)) return "Passed"
  if (["no", "fail", "failed", "rejected"].includes(v)) return "Rejected"
  return "Pending"
}

function parseCallLogs(raw: any): Record<string, string> {
  const result: Record<string, string> = {}
  if (!raw) return result
  const str = String(raw)

  // Try line-by-line first (standard format from n8n)
  const lines = str.split("\n")
  for (const line of lines) {
    const colonIndex = line.indexOf(":")
    if (colonIndex > 0) {
      const rawLabel = line.slice(0, colonIndex).trim().toLowerCase()
      const content = line.slice(colonIndex + 1).trim()
      const internalKey = LABEL_TO_KEY[rawLabel]
      if (internalKey && content) {
        result[internalKey] = content
      }
    }
  }

  // If still empty, try regex fallback for single-line blobs
  if (Object.keys(result).length === 0) {
    const labelsPattern = Object.keys(LABEL_TO_KEY).join("|")
    const regex = new RegExp(`(${labelsPattern})\\s*:\\s*([^\\n]+)`, "gi")
    let match
    while ((match = regex.exec(str)) !== null) {
      const internalKey = LABEL_TO_KEY[match[1].toLowerCase()]
      if (internalKey) result[internalKey] = match[2].trim()
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
  if (sortField !== field) return <ChevronDown className="size-3 text-slate-700" />
  return sortDir === "asc" ? <ChevronUp className="size-3 text-cyan-400" /> : <ChevronDown className="size-3 text-cyan-400" />
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
        status === "Passed" && "bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_-5px_var(--color-emerald-500)]",
        status === "Rejected" && "bg-red-500/10 text-red-400 shadow-[0_0_15px_-5px_var(--color-red-500)]",
        status === "Pending" && "bg-slate-700/30 text-slate-400"
      )}>
        <div className="flex items-center gap-1.5">
          <div className={cn(
            "size-1.5 rounded-full",
            status === "Passed" && "bg-emerald-400 animate-pulse",
            status === "Rejected" && "bg-red-400",
            status === "Pending" && "bg-slate-500"
          )} />
          <SelectValue placeholder="Status" />
        </div>
      </SelectTrigger>
      <SelectContent className="bg-slate-900 border-white/10">
        <SelectItem value="Passed" className="text-emerald-400 focus:text-emerald-300">Passed</SelectItem>
        <SelectItem value="Rejected" className="text-red-400 focus:text-red-300">Rejected</SelectItem>
        <SelectItem value="Pending" className="text-slate-400">Pending</SelectItem>
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
      let actualData = rawData.data || rawData

      if (Array.isArray(actualData)) {
        list = actualData.map(item => item?.json || item)
      } else if (actualData && typeof actualData === "object") {
        list = actualData.campaignCandidates || actualData.candidates || actualData.data || actualData.items || []
      }

      setAllCandidates(list)
    } catch (err) {
      console.error("[CallAnalysis] data fetch error:", err)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { fetchData(selectedCampaign) }, [selectedCampaign, fetchData])

  // Data processing — only include candidates that have Call Logs data
  const dataRows = useMemo(() => {
    return allCandidates
      .map(c => {
        // Find Call Logs field (might have space or variations)
        const rawText = c["Call Logs"] || c.CallLogs || c.call_logs || c.Data || c.data || ""
        return { candidate: c, metrics: parseCallLogs(rawText), hasCallData: rawText.trim().length > 0 }
      })
      .filter(({ hasCallData }) => hasCallData) // Only show candidates with actual call data
  }, [allCandidates])

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
    total: allCandidates.length,
    passed: allCandidates.filter(c => normalizeDecision(c["Call Decision"] || c.CallRound || c.decision || c.Decision) === "Passed").length,
    rejected: allCandidates.filter(c => normalizeDecision(c["Call Decision"] || c.CallRound || c.decision || c.Decision) === "Rejected").length,
  }), [allCandidates, filtered])

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
      <div className="relative overflow-hidden rounded-3xl bg-card border border-border p-8 shadow-sm">
        <div className="absolute top-0 right-0 p-8 opacity-5 blur-3xl bg-primary rounded-full size-64 -mr-32 -mt-32" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Sparkles className="size-6 text-primary" />
              </div>
              <h1 className="text-3xl font-black text-foreground tracking-tight">Call Analysis <span className="text-primary">Hub</span></h1>
            </div>
            <p className="text-muted-foreground text-sm max-w-lg">Intelligent extraction of key candidate metrics from automated call logs.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => fetchData(selectedCampaign)} disabled={loading} className="rounded-xl border-border text-foreground h-12 px-6 bg-background/50 backdrop-blur-md">
              <RefreshCcw className={cn("size-4 mr-2", loading && "animate-spin")} /> {loading ? "Syncing..." : "Refresh Data"}
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {[
            { label: "Profiles", value: stats.total, icon: Users, color: "text-foreground" },
            { label: "Matching", value: filtered.length, icon: ListChecks, color: "text-primary" },
            { label: "Passed", value: stats.passed, icon: CheckCircle2, color: "text-emerald-500" },
            { label: "Rejected", value: stats.rejected, icon: XCircle, color: "text-red-500" },
          ].map((s, i) => (
            <div key={i} className="bg-muted/30 rounded-2xl p-4 border border-border">
              <div className="flex items-center gap-2 mb-1">
                <s.icon className={cn("size-3.5", s.color)} />
                <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">{s.label}</span>
              </div>
              <div className="text-2xl font-black text-foreground">{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Constraints & Controls */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
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
              <tr className="bg-muted/50 border-b border-border">
                <th className="sticky left-0 z-20 bg-muted/50 px-3 py-3 text-left font-black text-muted-foreground uppercase tracking-widest w-[160px] cursor-pointer border-r border-border" onClick={() => toggleSort("name")}>
                  <div className="flex items-center gap-2">Target Profile <SortIcon field="name" sortField={sortField} sortDir={sortDir} /></div>
                </th>
                <th className="px-3 py-3 text-left font-black text-muted-foreground uppercase tracking-widest w-[110px] border-r border-border whitespace-nowrap">Status</th>
                {METRIC_COLUMNS.map((col, i) => (
                  <th key={i} className="px-3 py-3 text-left font-black text-muted-foreground uppercase tracking-widest min-w-[120px] max-w-[180px] border-r border-border">
                    <div className="flex items-center gap-2">
                       <col.icon className="size-3 text-muted-foreground/60" />
                       <span className="text-foreground/80">{col.label}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={METRIC_COLUMNS.length + 2} className="py-32 text-center">
                    <Loader2 className="size-10 animate-spin mx-auto text-cyan-400 mb-4 opacity-50" />
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Processing Transcripts...</p>
                  </td>
                </tr>
              ) : !selectedCampaign ? (
                <tr>
                  <td colSpan={METRIC_COLUMNS.length + 2} className="py-32 text-center">
                    <Sparkles className="size-10 mx-auto text-cyan-500/30 mb-4 animate-pulse" />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Select a campaign to view the data</p>
                    <p className="text-slate-600 text-[9px] mt-2">Choose a campaign from the dropdown above to start analysis</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={METRIC_COLUMNS.length + 2} className="py-32 text-center">
                    <PhoneCall className="size-8 mx-auto text-slate-800 mb-4" />
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[9px]">No matching records found</p>
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
                      <td className="sticky left-0 z-10 bg-card/95 backdrop-blur-md px-3 py-2 border-r border-border group-hover:bg-muted transition-colors">
                        <div className="flex items-center gap-2.5">
                          <div className="size-7 rounded-lg bg-linear-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-black shadow-lg shadow-cyan-500/10 text-[10px]">
                            {name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-white text-[11px] truncate leading-none">{name}</p>
                            <p className="text-[9px] text-slate-500 mt-1 truncate font-medium">{c.Email || ""}</p>
                          </div>
                        </div>
                      </td>
                      <td 
                        className="px-3 py-2 border-r border-white/5"
                        onClick={(e) => e.stopPropagation()} // Prevent sidebar from opening when clicking dropdown
                      >
                        <DecisionSelect 
                          value={c["Call Decision"] || c.CallRound || c.call_decision || c.Decision || ""} 
                          onValueChange={(v) => handleUpdateDecision(c, v)}
                          disabled={updatingEmail === c.Email}
                        />
                      </td>
                      {METRIC_COLUMNS.map((col, ci) => {
                        const val = metrics[col.key]
                        if (!val) return <td key={ci} className="px-3 py-2 text-muted-foreground/30 font-mono border-r border-border text-center">—</td>
                        const style = answerStyle(val)
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
                              <p className="text-foreground/80 dark:text-slate-300 text-[9px] leading-tight line-clamp-2" title={val}>{val}</p>
                            )}
                          </td>
                        )
                      })}
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
