"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect, useCallback, useMemo } from "react"
import {
  X,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Award,
  FileText,
  Download,
  ExternalLink,
  User,
  AlertCircle,
  CheckCircle,
  Save,
  Clock,
  PhoneCall,
  MessageSquare,
  Star,
  ClipboardList,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { useRef } from "react"
import { CandidateDecisionSidebarContent, type CandidateDecisionSidebarRef } from "./candidate-decision-sidebar"

export interface Candidate {
  CandidateID: string
  Name?: string
  Email: string
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

  "Call Logs"?: string
  CallLogs?: string
  call_logs?: string
  Data?: string
  data?: string
  call_recording?: string
  CallRecording?: string
  "Call Recording"?: string
  Recording?: string
  recording?: string

  // Followup Stages
  Call1?: string
  Call2?: string
  Whatsapp?: string
  FollowupMail1?: string
  FollowupMail2?: string
  Answered?: string

  // Allow any extra dynamic fields from the API
  [key: string]: any
}

interface CandidateDetailSidebarProps {
  candidate: Candidate | null
  isOpen: boolean
  onClose: () => void
  campaignName?: string
  onDecisionUpdate?: () => void
  numberOfRounds?: number
  isOptimized?: boolean
}

export function CandidateDetailSidebar({
  candidate,
  isOpen,
  onClose,
  campaignName,
  onDecisionUpdate,
  numberOfRounds = 3,
  isOptimized = false,
}: CandidateDetailSidebarProps) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("profile")
  const decisionRef = useRef<CandidateDecisionSidebarRef>(null)


  const driveFileId = useMemo(() => {
    if (!candidate?.ResumeLink) return null
    const patterns = [/\/file\/d\/([a-zA-Z0-9_-]+)/, /id=([a-zA-Z0-9_-]+)/, /\/d\/([a-zA-Z0-9_-]+)/]
    for (const pattern of patterns) {
      const match = candidate.ResumeLink.match(pattern)
      if (match && match[1]) return match[1]
    }
    return null
  }, [candidate])

  // Use the direct download/export URL which doesn't require Google sign-in
  const embedUrl = driveFileId
    ? `https://drive.google.com/file/d/${driveFileId}/preview`
    : null

  const downloadUrl = driveFileId
    ? `https://drive.google.com/uc?export=download&id=${driveFileId}`
    : candidate?.ResumeLink || null

  const normalizeDecision = (val: any): string => {
    if (!val) return ""
    const v = String(val).toLowerCase()
    if (v === "yes" || v === "pass" || v === "passed" || v === "approved" || v === "hired") return "Yes"
    if (v === "no" || v === "fail" || v === "failed" || v === "rejected") return "No"
    return String(val)
  }

  const pipelineProgress = useMemo(() => {
    if (!candidate) return null

    const rounds = [
      { key: "ResumeScreening", label: "Resume", icon: FileText, colorStr: "blue", 
        classes: {
            pastBg: "bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/40",
            pastIconBg: "bg-blue-500",
            pastText: "text-blue-300",
            currentBg: "bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30 border-dashed",
            currentIconText: "text-blue-400",
            currentText: "text-blue-400/70",
            currentPill: "bg-blue-500/20 text-blue-300 border-blue-500/30",
            connector: "bg-blue-500"
        }
      },
      { key: "CallRound", label: "Call", icon: Phone, colorStr: "emerald",
        classes: {
            pastBg: "bg-gradient-to-br from-emerald-500/20 to-green-500/20 border-emerald-500/40",
            pastIconBg: "bg-emerald-500",
            pastText: "text-emerald-300",
            currentBg: "bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/30 border-dashed",
            currentIconText: "text-emerald-400",
            currentText: "text-emerald-400/70",
            currentPill: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
            connector: "bg-emerald-500"
        }
      },
      { key: "HRRound", label: "R1", icon: User, colorStr: "violet",
        classes: {
            pastBg: "bg-gradient-to-br from-violet-500/20 to-purple-500/20 border-violet-500/40",
            pastIconBg: "bg-violet-500",
            pastText: "text-violet-300",
            currentBg: "bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/30 border-dashed",
            currentIconText: "text-violet-400",
            currentText: "text-violet-400/70",
            currentPill: "bg-violet-500/20 text-violet-300 border-violet-500/30",
            connector: "bg-violet-500"
        }
      },
      { key: "TechInterviewRound", label: "R2", icon: Briefcase, colorStr: "amber",
        classes: {
            pastBg: "bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-amber-500/40",
            pastIconBg: "bg-amber-500",
            pastText: "text-amber-300",
            currentBg: "bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30 border-dashed",
            currentIconText: "text-amber-400",
            currentText: "text-amber-400/70",
            currentPill: "bg-amber-500/20 text-amber-300 border-amber-500/30",
            connector: "bg-amber-500"
        }
      },
      { key: "ManagerInterview", label: "R3", icon: Award, colorStr: "fuchsia",
        classes: {
            pastBg: "bg-gradient-to-br from-fuchsia-500/20 to-pink-500/20 border-fuchsia-500/40",
            pastIconBg: "bg-fuchsia-500",
            pastText: "text-fuchsia-300",
            currentBg: "bg-gradient-to-br from-fuchsia-500/10 to-pink-500/10 border-fuchsia-500/30 border-dashed",
            currentIconText: "text-fuchsia-400",
            currentText: "text-fuchsia-400/70",
            currentPill: "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30",
            connector: "bg-fuchsia-500"
        }
      },
    ]

    // Map NumberOfRounds to which rounds to show
    // 0: Resume
    // 1: Call
    // 2: HR
    // 3: Tech
    // 4: Manager
    const visibleRounds = [rounds[0], rounds[1]] // Always show Resume and Call
    
    // Add R1, R2, R3 if they are in the candidate data or required by numberOfRounds
    if (numberOfRounds >= 1 || candidate.HRRound) visibleRounds.push(rounds[2]) 
    if (numberOfRounds >= 2 || candidate.TechInterviewRound) {
      visibleRounds.push(rounds[3]) 
    }
    if (numberOfRounds >= 3 || candidate.ManagerInterview) visibleRounds.push(rounds[4])

    const stages = visibleRounds.map((r) => {
      // @ts-ignore
      const rawVal = candidate[r.key] || (candidate as any)[r.label + " Decision"]
      const decision = normalizeDecision(rawVal)
      return {
        ...r,
        decision,
        isCompleted: decision === "Yes" || decision === "No",
        isPassed: decision === "Yes",
        isRejected: decision === "No",
      }
    })

    // Determine current stage index (the first one that is NOT passed)
    let currentStageIndex = 0
    for (let i = 0; i < stages.length; i++) {
        if (stages[i].isPassed) {
            currentStageIndex = i + 1
        } else {
            break
        }
    }

    if (currentStageIndex >= stages.length) {
        currentStageIndex = stages.length - 1
    }

    // Override if a stage is rejected
    const rejectedIndex = stages.findIndex(s => s.isRejected)
    if (rejectedIndex !== -1) {
        currentStageIndex = rejectedIndex
    }

    return {
      stages,
      currentStageIndex,
    }
  }, [candidate])

  const handleDownloadResume = () => {
    if (candidate?.ResumeLink) {
      window.open(candidate.ResumeLink, "_blank")
      toast({
        title: "Opening Resume",
        description: "Resume is being opened in a new tab.",
      })
    } else {
      toast({
        title: "Resume Not Available",
        description: "No resume link found for this candidate.",
        variant: "destructive",
      })
    }
  }

  const getDecisionColor = (decision: string) => {
    const lowerDecision = decision?.toLowerCase()
    if (lowerDecision === "yes" || lowerDecision === "selected") {
      return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
    } else if (lowerDecision === "no" || lowerDecision === "rejected") {
      return "bg-red-500/20 text-red-400 border-red-500/30"
    } else {
      return "bg-amber-500/20 text-amber-400 border-amber-500/30"
    }
  }

  const getDecisionIcon = (decision: string) => {
    const lowerDecision = decision?.toLowerCase()
    if (lowerDecision === "yes" || lowerDecision === "selected") {
      return "🟢"
    } else if (lowerDecision === "no" || lowerDecision === "rejected") {
      return "🔴"
    } else {
      return "🟡"
    }
  }

  const handleDecisionSuccess = () => {
    toast({
      title: "Success",
      description: "Decision saved successfully. Closing sidebar...",
    })
    if (onDecisionUpdate) {
      onDecisionUpdate()
    }
    setTimeout(() => {
      onClose()
    }, 2000)
  }

  // Dynamic parser: captures ALL real Q&A pairs from raw Call Logs text.
  // Skips answers that are effectively empty ("Not mentioned", "N/A", etc.)
  // so only genuine data is shown as section headers + values.
  const SIDEBAR_EMPTY = new Set([
    "n/a", "na",
    "none", "-", "\u2014", "", "null", "undefined",
  ])

  const parseCallLogs = (raw: any): { label: string; value: string }[] => {
    if (!raw) return []
    const str = String(raw).trim()
    if (!str) return []
    const pairs: { label: string; value: string }[] = []
    const seen = new Set<string>()

    const addPair = (label: string, value: string) => {
      const key = label.toLowerCase().replace(/[^a-z0-9]/g, "")
      if (!key || seen.has(key)) return
      if (SIDEBAR_EMPTY.has(value.toLowerCase().trim())) return
      seen.add(key)
      pairs.push({ label, value })
    }

    // Try JSON array format: [{question, answer}]
    try {
      const parsed = JSON.parse(str)
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          const q = item?.question || item?.Question || item?.label || item?.Label
          const a = item?.answer || item?.Answer || item?.value || item?.Value
          if (q && a) addPair(String(q), String(a))
        }
        if (pairs.length > 0) return pairs
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
         addPair(digitMatch[1].trim(), digitMatch[2].trim())
         continue
      }

      // 2. Try to match "Q: Question text"
      const qMatch = line.match(/^(?:(?:\d+[\.\)]\s*)?Q|Question)\s*[:\-]\s*(.*)$/i)
      if (qMatch) {
        pendingQuestion = qMatch[1].trim()
        continue
      }

      const aMatch = line.match(/^(?:A|Answer)\s*[:\-]\s*(.*)$/i)
      if (aMatch && pendingQuestion) {
        addPair(pendingQuestion, aMatch[1].trim())
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
        
        if (!isAgent && !isTooLong && content) {
          const cleanLabel = rawLabel.replace(/^[QA]\s*$/i, "").trim()
          if (cleanLabel) {
             addPair(cleanLabel, content)
          }
        }
      }
    }

    return pairs
  }

  const callMetrics = useMemo(() => {
    if (!candidate) return []
    
    // STRICT SELECTOR: Only the explicit call log columns.
    // Do NOT use Data/data — those hold resume screening summaries (Key Skills, Experience, Education).
    const bestText =
      candidate["Call Logs"] ??
      candidate.CallLogs ??
      candidate.call_logs ??
      ""
    
    return parseCallLogs(bestText)
  }, [candidate])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full md:w-[650px] lg:w-[800px] xl:w-[900px] bg-background/95 backdrop-blur-2xl border-l border-border shadow-[-20px_0_40px_-15px_rgba(0,0,0,0.5)] z-50 flex flex-col"
          >
            {candidate && (
              <div className="flex flex-col h-full">

                {/* ── PIPELINE TRACKER (top, full-width) ── */}
                {pipelineProgress && (() => {
                  const stageConfig = [
                    { colors: { active: "from-violet-500 to-purple-600", glow: "shadow-violet-500/40", text: "text-violet-300", bar: "bg-violet-500", pill: "bg-violet-500/20 text-violet-300 border-violet-500/30" } },
                    { colors: { active: "from-cyan-500 to-blue-600",   glow: "shadow-cyan-500/40",   text: "text-cyan-300",   bar: "bg-cyan-500",   pill: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" } },
                    { colors: { active: "from-emerald-500 to-green-600", glow: "shadow-emerald-500/40", text: "text-emerald-300", bar: "bg-emerald-500", pill: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" } },
                    { colors: { active: "from-amber-500 to-orange-600", glow: "shadow-amber-500/40",  text: "text-amber-300",  bar: "bg-amber-500",  pill: "bg-amber-500/20 text-amber-300 border-amber-500/30" } },
                    { colors: { active: "from-fuchsia-500 to-pink-600", glow: "shadow-fuchsia-500/40", text: "text-fuchsia-300", bar: "bg-fuchsia-500", pill: "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30" } },
                  ]
                  return (
                    <div className="bg-background/80 backdrop-blur-md border-b border-border px-6 pt-6 pb-6 shadow-2xl shadow-black/40 shrink-0">
                      {/* Close button row */}
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">Candidate Dossier / Pipeline</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={onClose}
                          className="size-10 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all"
                        >
                          <X className="size-5" />
                        </Button>
                      </div>

                      {/* Stages row */}
                      <div className="flex items-center gap-0">
                        {pipelineProgress.stages.map((stage, index) => {
                          const cfg = stageConfig[index]
                          const isPassed = stage.isPassed
                          const isRejected = stage.isRejected
                          const isCurrent = index === pipelineProgress.currentStageIndex && !isRejected
                          const isPending = !isPassed && !isRejected && !isCurrent
                          const Icon = stage.icon
                          const isLast = index === pipelineProgress.stages.length - 1

                          return (
                            <div key={stage.key} className="flex items-center flex-1 min-w-0">
                              {/* Stage card */}
                              <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.07 * index, type: "spring", stiffness: 300 }}
                                className="flex flex-col items-center gap-2 flex-1"
                              >
                                {/* Icon circle */}
                                <div className="relative">
                                  <div className={cn(
                                    "size-11 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                                    isPassed
                                      ? `bg-gradient-to-br ${cfg.colors.active} border-transparent shadow-lg ${cfg.colors.glow}`
                                      : isRejected
                                        ? "bg-red-500/20 border-red-500/60 shadow-lg shadow-red-500/30"
                                        : isCurrent
                                          ? "bg-muted border-dashed border-muted-foreground/50 shadow-lg shadow-black/20"
                                          : "bg-muted/60 border-border"
                                  )}>
                                    {isPassed ? (
                                      <CheckCircle className="size-5 text-white drop-shadow" />
                                    ) : isRejected ? (
                                      <X className="size-5 text-red-400" />
                                    ) : (
                                      <Icon className={cn("size-4", isCurrent ? cfg.colors.text : "text-muted-foreground/60")} />
                                    )}
                                  </div>
                                  {/* Pulse ring for current stage */}
                                  {isCurrent && (
                                    <motion.div
                                      animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                                      transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                                      className="absolute inset-0 rounded-full border border-primary/50"
                                    />
                                  )}
                                </div>

                                {/* Label */}
                                <span className={cn(
                                  "text-[10px] font-bold tracking-wide truncate max-w-[64px] text-center",
                                  isPassed ? cfg.colors.text : isRejected ? "text-red-400" : isCurrent ? "text-foreground" : "text-muted-foreground/60"
                                )}>
                                  {stage.label}
                                </span>

                                {/* Status pill */}
                                {isPassed && (
                                  <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-full border uppercase tracking-wide", cfg.colors.pill)}>
                                    Passed
                                  </span>
                                )}
                                {isRejected && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full border uppercase tracking-wide bg-red-500/20 text-red-300 border-red-500/30">
                                    Rejected
                                  </span>
                                )}
                                {isCurrent && (
                                  <motion.span
                                    animate={{ opacity: [1, 0.4, 1] }}
                                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                                    className="text-[9px] font-bold px-1.5 py-0.5 rounded-full border uppercase tracking-wide bg-primary/10 text-primary border-primary/20"
                                  >
                                    Active
                                  </motion.span>
                                )}
                                {isPending && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full border uppercase tracking-wide bg-muted text-muted-foreground border-border">
                                    Pending
                                  </span>
                                )}
                              </motion.div>

                              {/* Connector bar */}
                              {!isLast && (
                                <div className="flex-1 mx-1 h-0.5 min-w-[8px] relative overflow-hidden rounded-full bg-border">
                                  {isPassed && (
                                    <motion.div
                                      initial={{ scaleX: 0 }}
                                      animate={{ scaleX: 1 }}
                                      transition={{ delay: 0.07 * index + 0.2, duration: 0.4 }}
                                      style={{ transformOrigin: "left" }}
                                      className={cn("absolute inset-0 rounded-full", cfg.colors.bar)}
                                    />
                                  )}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })()}

                <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8">
                {/* Header Section */}
                <div className="flex items-center gap-6 pb-8 border-b border-border">
                  <div className="relative group">
                    <div className="absolute -inset-1.5 bg-linear-to-tr from-primary to-blue-600 rounded-full blur-md opacity-40 group-hover:opacity-70 transition-opacity" />
                    <div className="relative size-20 rounded-full bg-muted border-2 border-border flex items-center justify-center text-foreground text-3xl font-black shadow-2xl shrink-0">
                      {candidate.Name && candidate.Name.trim() !== ""
                        ? candidate.Name.charAt(0).toUpperCase()
                        : candidate.Email
                          ? candidate.Email.charAt(0).toUpperCase()
                          : "?"}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-3xl font-black text-foreground tracking-tight flex items-center gap-3 truncate mb-1">
                      {candidate.Name && candidate.Name.trim() !== "" ? (
                        candidate.Name
                      ) : (
                        <>
                          <AlertCircle className="size-6 text-amber-500 shrink-0" />
                          <span className="text-amber-500 truncate">
                            {candidate.Email ? candidate.Email.split("@")[0] : "Unnamed Candidate"}
                          </span>
                        </>
                      )}
                    </h2>
                    <div className="flex items-center gap-3">
                      <p className="text-muted-foreground text-sm font-medium truncate">{candidate.Email || "No email provided"}</p>
                      {candidate.RoleApplied && (
                        <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
                          {candidate.RoleApplied}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Info HUD */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { icon: Mail, label: "Email", value: candidate.Email || "N/A", color: "text-blue-400", bg: "bg-blue-400/5" },
                    { icon: Phone, label: "Phone", value: candidate.PhoneNumber || "N/A", color: "text-emerald-400", bg: "bg-emerald-400/5" },
                    { icon: MapPin, label: "Location", value: candidate.City || "N/A", color: "text-violet-400", bg: "bg-violet-400/5" },
                  ].map((item, idx) => (
                    <div key={idx} className={cn("p-4 rounded-2xl border border-border flex flex-col gap-3 transition-colors hover:bg-muted/50", item.bg)}>
                      <item.icon className={cn("size-5", item.color)} />
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">{item.label}</p>
                        <p className="text-xs font-bold text-foreground truncate">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tabs — Premium segmented control */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid grid-cols-5 w-full bg-muted/60 border border-border p-1.5 rounded-2xl h-auto gap-1">
                    {([
                      { value: "profile",    label: "Profile",    icon: User },
                      { value: "call-logs",  label: "Call Logs",  icon: PhoneCall },
                      { value: "evaluation", label: "Evaluation", icon: Star },
                      { value: "resume",     label: "Resume",     icon: FileText },
                      { value: "decision",   label: "Decision",   icon: ClipboardList },
                    ] as { value: string; label: string; icon: React.ElementType }[]).map(({ value, label, icon: Icon }) => (
                      <TabsTrigger
                        key={value}
                        value={value}
                        className={cn(
                          "flex items-center justify-center gap-2 rounded-xl py-3 px-4 transition-all duration-200 border border-transparent",
                          "text-muted-foreground hover:text-foreground hover:bg-background/20",
                          "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md data-[state=active]:border-border"
                        )}
                      >
                        <Icon className="size-5 shrink-0" />
                        <span className="text-[11px] font-black uppercase tracking-widest leading-none">{label}</span>
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  <TabsContent value="profile" className="space-y-4 mt-4">
                    <Card className="bg-card border-border shadow-sm">
                      <CardContent className="p-4 space-y-4">
                        <h3 className="font-black text-foreground flex items-center gap-2 text-[11px] uppercase tracking-[0.2em]">
                          <User className="size-4 text-emerald-400" />
                          Basic Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-4">
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Full Name</span>
                            <span className="text-foreground font-bold flex items-center gap-2 text-sm">
                              {candidate.Name && candidate.Name.trim() !== "" ? (
                                candidate.Name
                              ) : (
                                <span className="text-amber-500 italic">Name not provided</span>
                              )}
                            </span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Candidate ID</span>
                            <span className="text-foreground font-mono font-bold text-sm">{candidate.CandidateID || "N/A"}</span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Role Applied</span>
                            <span className="text-foreground font-bold text-sm">{candidate.RoleApplied || "Not specified"}</span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">City</span>
                            <span className="text-foreground font-bold text-sm">{candidate.City || "Not specified"}</span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Call Time</span>
                            <span className="text-foreground font-bold text-sm">{candidate.Call_time || "—"}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {candidate.ResumeSummary && (
                      <Card className="bg-muted/50 border-border">
                        <CardContent className="p-4 space-y-3">
                          <h3 className="font-semibold text-foreground">Resume Summary</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">{candidate.ResumeSummary}</p>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                    <TabsContent value="call-logs" className="space-y-4 mt-4">
                      {/* Call Recording — only rendered if URL present */}
                      {(() => {
                        const recordingUrl =
                          candidate["Call Recording"] ||
                          candidate.CallRecording ||
                          candidate.call_recording ||
                          candidate.Recording ||
                          candidate.recording
                        if (!recordingUrl) return null
                        return (
                          <Card className="bg-muted/50 border-border">
                            <CardContent className="p-5 space-y-3">
                              <div className="flex items-center gap-2">
                                <div className="size-7 rounded-lg bg-primary/10 flex items-center justify-center">
                                  <PhoneCall className="size-4 text-primary" />
                                </div>
                                <span className="font-bold text-foreground text-sm">Call Recording</span>
                              </div>
                              <audio
                                controls
                                src={recordingUrl}
                                className="w-full h-10 [&::-webkit-media-controls-panel]:bg-muted [&::-webkit-media-controls-panel]:rounded-xl"
                              />
                            </CardContent>
                          </Card>
                        )
                      })()}

                      {/* Call Log Q&A pairs — strictly from Data / Call Logs columns */}
                      {callMetrics.length > 0 ? (
                        <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/60 px-1 pb-1">
                            Call Intelligence
                          </p>
                          {callMetrics.map(({ label, value }, idx) => {
                            const vLower = value.toLowerCase().trim()
                            const isYes = vLower === "yes" || vLower.startsWith("yes,") || vLower.startsWith("yes ")
                            const isNo  = vLower === "no"  || vLower.startsWith("no,")  || vLower.startsWith("no ")
                            return (
                              <div
                                key={idx}
                                className="group flex items-start gap-4 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 transition-colors p-4"
                              >
                                {/* Index badge */}
                                <div className="size-6 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                                  <span className="text-[9px] font-black text-muted-foreground">{idx + 1}</span>
                                </div>
                                <div className="flex-1 min-w-0 space-y-1">
                                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                                    {label}
                                  </p>
                                  {isYes ? (
                                    <div className="flex items-center gap-2">
                                      <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                                      <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{value}</span>
                                    </div>
                                  ) : isNo ? (
                                    <div className="flex items-center gap-2">
                                      <div className="size-2 rounded-full bg-red-400" />
                                      <span className="text-sm font-semibold text-red-600 dark:text-red-400">{value}</span>
                                    </div>
                                  ) : (
                                    <p className="text-sm text-foreground leading-relaxed">{value}</p>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        /* No recording AND no call data — show empty state */
                        !(candidate["Call Recording"] || candidate.CallRecording || candidate.call_recording || candidate.Recording || candidate.recording) && (
                          <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
                            <div className="size-14 rounded-2xl bg-muted flex items-center justify-center">
                              <PhoneCall className="size-7 text-muted-foreground/40" />
                            </div>
                            <p className="text-muted-foreground/70 text-sm font-medium">No call data yet</p>
                            <p className="text-muted-foreground/40 text-xs max-w-[220px] leading-relaxed">
                              Call logs and recordings will appear here once this candidate has been contacted.
                            </p>
                          </div>
                        )
                      )}
                    </TabsContent>


                  <TabsContent value="evaluation" className="space-y-4 mt-4">
                    {candidate.Strengths && (
                      <Card className="bg-muted/50 border-border">
                        <CardContent className="p-4 space-y-3">
                          <h3 className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                            <Award className="size-4" />
                            Strengths
                          </h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">{candidate.Strengths}</p>
                        </CardContent>
                      </Card>
                    )}

                    {candidate.Gaps && (
                      <Card className="bg-muted/50 border-border">
                        <CardContent className="p-4 space-y-3">
                          <h3 className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-2">
                            <AlertCircle className="size-4" />
                            Areas for Improvement
                          </h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">{candidate.Gaps}</p>
                        </CardContent>
                      </Card>
                    )}

                    {candidate.FitAnalysis && (
                      <Card className="bg-muted/50 border-border">
                        <CardContent className="p-4 space-y-3">
                          <h3 className="font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                            <FileText className="size-4" />
                            Fit Analysis
                          </h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">{candidate.FitAnalysis}</p>
                        </CardContent>
                      </Card>
                    )}

                    {candidate.Comments && (
                      <Card className="bg-muted/50 border-border">
                        <CardContent className="p-4 space-y-3">
                          <h3 className="font-semibold text-violet-600 dark:text-violet-400">Comments</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">{candidate.Comments}</p>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  <TabsContent value="resume" className="space-y-4 mt-4">
                    <Card className="bg-muted/50 border-border">
                      <CardContent className="p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-foreground flex items-center gap-2">
                            <FileText className="size-4 text-emerald-500 dark:text-emerald-400" />
                            Resume Preview
                          </h3>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleDownloadResume}
                              className="gap-2 bg-muted/50 border-border hover:bg-muted"
                            >
                              <ExternalLink className="size-4" />
                              Open Full
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleDownloadResume}
                              className="gap-2 bg-muted/50 border-border hover:bg-muted"
                            >
                              <Download className="size-4" />
                              Download
                            </Button>
                          </div>
                        </div>

                        {embedUrl ? (
                          <div className="relative w-full h-[600px] rounded-lg overflow-hidden border border-border">
                            <iframe src={embedUrl} className="w-full h-full" allow="autoplay" title="Resume Preview" />
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-[400px] bg-muted/30 rounded-lg border border-border">
                            <FileText className="size-16 text-muted-foreground opacity-20 mb-4" />
                            <p className="text-muted-foreground mb-4">Resume preview not available</p>
                            {candidate.ResumeLink && (
                              <Button onClick={handleDownloadResume} className="gap-2">
                                <ExternalLink className="size-4" />
                                Open Resume Link
                              </Button>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="decision" className="mt-4">
                    {campaignName ? (
                      <CandidateDecisionSidebarContent
                        ref={decisionRef}
                        campaignName={campaignName}
                        candidateEmail={candidate.Email}
                        candidateDetails={candidate}
                        onSuccess={handleDecisionSuccess}
                        numberOfRounds={numberOfRounds}
                        hideSubmit={true}
                        isOptimized={isOptimized}
                      />
                    ) : (
                      <Card className="bg-muted/30 border-border">
                        <CardContent className="p-6 text-center py-8 text-muted-foreground">
                          <AlertCircle className="size-12 mx-auto mb-4 opacity-50" />
                          <p>Campaign information not available</p>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                </Tabs>

                {/* Action Buttons */}
                <div className="flex gap-4 shrink-0 bg-background/80 backdrop-blur-xl px-6 pt-4 pb-6 border-t border-border rounded-b-2xl">
                  <Button
                    onClick={() => {
                      if (activeTab !== "decision") {
                        setActiveTab("decision")
                        toast({
                          title: "Decision Required",
                          description: "Switched to Decision tab. Please review and click Save again to confirm.",
                        })
                      } else {
                        decisionRef.current?.submit()
                      }
                    }}
                    className="flex-2 h-14 rounded-2xl text-base font-black uppercase tracking-widest gap-3 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-2xl shadow-emerald-500/20 text-white border-0 transition-all active:scale-[0.98]"
                  >
                    <Save className="size-5" />
                    Save Decision
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={onClose} 
                    className="flex-1 h-14 rounded-2xl text-muted-foreground hover:text-foreground bg-muted border-border hover:bg-muted/80 transition-all font-bold"
                  >
                    Close
                  </Button>
                </div> {/* end action buttons */}
                </div> {/* end scrollable content */}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
