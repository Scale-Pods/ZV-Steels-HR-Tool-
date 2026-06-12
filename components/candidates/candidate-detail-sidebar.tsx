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
    if (numberOfRounds >= 1) visibleRounds.push(rounds[2]) // HR
    if (numberOfRounds >= 2) {
      visibleRounds.push(rounds[3]) // R2
    }
    if (numberOfRounds >= 3) visibleRounds.push(rounds[4]) // Manager

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
    
    // ULTIMATE SELECTOR: Find the field with most 1) pattern matches
    let bestText = ""
    let maxMatches = -1
    for (const [key, val] of Object.entries(candidate)) {
      if (typeof val === "string" && val.length > 5) {
        const matches = (val as string).match(/\d+[\.\)]\s/g)
        const count = matches ? matches.length : 0
        let score = count
        if (count > 0 && /log|call|intel/i.test(key)) score += 0.5
        if (score > maxMatches) {
          maxMatches = score
          bestText = val as string
        }
      }
    }
    
    // Fallback if no pattern found
    if (!bestText) {
      bestText =
        candidate["Call Logs"] ??
        candidate.CallLogs ??
        candidate.call_logs ??
        candidate.Data ??
        candidate.data ??
        ""
    }
    
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
            className="fixed right-0 top-0 h-full w-full md:w-[650px] lg:w-[800px] xl:w-[900px] bg-slate-950/95 backdrop-blur-2xl border-l border-white/10 shadow-[-20px_0_40px_-15px_rgba(0,0,0,0.5)] z-50 flex flex-col"
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
                    <div className="bg-slate-950/80 backdrop-blur-md border-b border-white/5 px-6 pt-6 pb-6 shadow-2xl shadow-black/40 shrink-0">
                      {/* Close button row */}
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Candidate Dossier / Pipeline</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={onClose}
                          className="size-10 text-white/40 hover:text-white hover:bg-white/10 rounded-xl transition-all"
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
                                          ? "bg-slate-800 border-dashed border-slate-500 shadow-lg shadow-slate-500/20"
                                          : "bg-slate-800/60 border-slate-700/40"
                                  )}>
                                    {isPassed ? (
                                      <CheckCircle className="size-5 text-white drop-shadow" />
                                    ) : isRejected ? (
                                      <X className="size-5 text-red-400" />
                                    ) : (
                                      <Icon className={cn("size-4", isCurrent ? cfg.colors.text : "text-slate-600")} />
                                    )}
                                  </div>
                                  {/* Pulse ring for current stage */}
                                  {isCurrent && (
                                    <motion.div
                                      animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                                      transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                                      className="absolute inset-0 rounded-full border border-slate-400/50"
                                    />
                                  )}
                                </div>

                                {/* Label */}
                                <span className={cn(
                                  "text-[10px] font-bold tracking-wide truncate max-w-[64px] text-center",
                                  isPassed ? cfg.colors.text : isRejected ? "text-red-400" : isCurrent ? "text-slate-300" : "text-slate-600"
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
                                    className="text-[9px] font-bold px-1.5 py-0.5 rounded-full border uppercase tracking-wide bg-slate-700/60 text-slate-400 border-slate-600/50"
                                  >
                                    Active
                                  </motion.span>
                                )}
                                {isPending && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full border uppercase tracking-wide bg-slate-800/60 text-slate-600 border-slate-700/30">
                                    Pending
                                  </span>
                                )}
                              </motion.div>

                              {/* Connector bar */}
                              {!isLast && (
                                <div className="flex-1 mx-1 h-0.5 min-w-[8px] relative overflow-hidden rounded-full bg-slate-700/40">
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
                <div className="flex items-center gap-6 pb-8 border-b border-white/5">
                  <div className="relative group">
                    <div className="absolute -inset-1.5 bg-linear-to-tr from-primary to-blue-600 rounded-full blur-md opacity-40 group-hover:opacity-70 transition-opacity" />
                    <div className="relative size-20 rounded-full bg-slate-900 border-2 border-white/10 flex items-center justify-center text-white text-3xl font-black shadow-2xl shrink-0">
                      {candidate.Name && candidate.Name.trim() !== ""
                        ? candidate.Name.charAt(0).toUpperCase()
                        : candidate.Email
                          ? candidate.Email.charAt(0).toUpperCase()
                          : "?"}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3 truncate mb-1">
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
                      <p className="text-white/40 text-base font-medium truncate">{candidate.Email || "No email provided"}</p>
                      {candidate.RoleApplied && (
                        <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
                          {candidate.RoleApplied}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Info HUD */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { icon: Mail, label: "Email", value: candidate.Email || "N/A", color: "text-blue-400", bg: "bg-blue-400/5" },
                    { icon: Phone, label: "Phone", value: candidate.PhoneNumber || "N/A", color: "text-emerald-400", bg: "bg-emerald-400/5" },
                    { icon: MapPin, label: "Location", value: candidate.City || "N/A", color: "text-violet-400", bg: "bg-violet-400/5" },
                    { icon: Briefcase, label: "Exp", value: candidate.Experience || "N/A", color: "text-amber-400", bg: "bg-amber-400/5" },
                  ].map((item, idx) => (
                    <div key={idx} className={cn("p-4 rounded-2xl border border-white/5 flex flex-col gap-3 transition-colors hover:bg-white/5", item.bg)}>
                      <item.icon className={cn("size-5", item.color)} />
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 mb-1">{item.label}</p>
                        <p className="text-xs font-bold text-white/90 truncate">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Score and Decisions */}
                <Card className="bg-slate-800/50 border-slate-700/50">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-lg bg-gradient-to-br from-emerald-500/20 to-blue-500/20">
                          <Award className="size-6 text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-400">Candidate Score</p>
                          <p className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                            {typeof candidate.Score === "number"
                              ? candidate.Score.toFixed(2)
                              : candidate.Score || "N/A"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <div>
                          <p className="text-xs text-slate-400 mb-1">Decision</p>
                          <Badge className={getDecisionColor(candidate.Decision || "")}>
                            {getDecisionIcon(candidate.Decision || "")} {candidate.Decision || "Pending"}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <Separator className="bg-slate-700/50" />

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-slate-400">HR Assigned</p>
                        <p className="text-white font-medium">
                          {candidate.HR && candidate.HR.trim() !== "" && candidate.HR !== "Unassigned"
                            ? candidate.HR.includes("@")
                              ? candidate.HR.split("@")[0]
                              : candidate.HR
                            : "Unassigned"}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400">Status</p>
                        <p className="text-white font-medium">{candidate.TechnicalInterview || "Pending"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="flex items-center gap-1 bg-white/5 border border-white/5 p-1 rounded-2xl">
                    {["profile", "call-logs", "evaluation", "resume", "decision"].map((tab) => (
                      <TabsTrigger 
                        key={tab} 
                        value={tab} 
                        className="flex-1 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white/60 transition-all py-2.5"
                      >
                        {tab.replace("-", " ")}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  <TabsContent value="profile" className="space-y-4 mt-4">
                    <Card className="bg-slate-800/50 border-slate-700/50">
                      <CardContent className="p-4 space-y-3">
                        <h3 className="font-semibold text-white flex items-center gap-2">
                          <User className="size-4 text-emerald-400" />
                          Basic Information
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400">Full Name</span>
                            <span className="text-white font-medium flex items-center gap-2">
                              {candidate.Name && candidate.Name.trim() !== "" ? (
                                candidate.Name
                              ) : (
                                <>
                                  <AlertCircle className="size-3 text-amber-400" />
                                  <span className="text-amber-400">Name not provided</span>
                                </>
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Candidate ID</span>
                            <span className="text-white font-mono">{candidate.CandidateID || "N/A"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Role Applied</span>
                            <span className="text-white">{candidate.RoleApplied || "Not specified"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">City</span>
                            <span className="text-white">{candidate.City || "Not specified"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Experience</span>
                            <span className="text-white">{candidate.Experience || "Not specified"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Email</span>
                            <span className="text-white truncate max-w-[200px]">
                              {candidate.Email || "Not provided"}
                            </span>
                          </div>
                          {candidate.PhoneNumber && (
                            <div className="flex justify-between">
                              <span className="text-slate-400">Phone</span>
                              <span className="text-white">{candidate.PhoneNumber}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {candidate.ResumeSummary && (
                      <Card className="bg-slate-800/50 border-slate-700/50">
                        <CardContent className="p-4 space-y-3">
                          <h3 className="font-semibold text-white">Resume Summary</h3>
                          <p className="text-sm text-slate-300 leading-relaxed">{candidate.ResumeSummary}</p>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                    <TabsContent value="call-logs" className="space-y-4 mt-4">
                      {(() => {
                        const recordingUrl = candidate["Call Recording"] || candidate.CallRecording || candidate.call_recording || candidate.Recording || candidate.recording;
                        if (!recordingUrl) return null;
                        return (
                          <Card className="bg-slate-800/50 border-white/5">
                            <CardContent className="p-5 space-y-3">
                              <h3 className="font-black text-white/80 flex items-center gap-2 text-[11px] uppercase tracking-widest">
                                <Phone className="size-4 text-primary" />
                                Call Recording
                              </h3>
                              <audio controls src={recordingUrl} className="w-full [&::-webkit-media-controls-panel]:bg-slate-800 [&::-webkit-media-controls-panel]:rounded-xl" />
                            </CardContent>
                          </Card>
                        );
                      })()}

                      {callMetrics.length > 0 ? (
                        <div className="space-y-3">
                          {callMetrics.map(({ label, value }, idx) => {
                            const vLower = value.toLowerCase().trim()
                            const isYes = vLower === "yes" || vLower.startsWith("yes,") || vLower.startsWith("yes ")
                            const isNo  = vLower === "no"  || vLower.startsWith("no,")  || vLower.startsWith("no ")
                            return (
                              <div
                                key={idx}
                                className="group rounded-2xl border border-white/5 bg-white/2 hover:bg-white/4 transition-colors p-5 space-y-2"
                              >
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 group-hover:text-white/50 transition-colors">
                                  {label}
                                </p>
                                {isYes ? (
                                  <div className="flex items-center gap-2">
                                    <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-sm font-bold text-emerald-400">{value}</span>
                                  </div>
                                ) : isNo ? (
                                  <div className="flex items-center gap-2">
                                    <div className="size-2 rounded-full bg-red-500" />
                                    <span className="text-sm font-bold text-red-400">{value}</span>
                                  </div>
                                ) : (
                                  <p className="text-sm text-white/90 font-medium leading-relaxed">{value}</p>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <Card className="bg-white/2 border-white/5">
                          <CardContent className="p-10 text-center">
                            <Phone className="size-10 mx-auto mb-4 text-white/10" />
                            <p className="text-white/30 text-sm font-medium">No call log data available for this candidate.</p>
                            <p className="text-white/20 text-xs mt-1">Call Logs will appear here once the candidate has been contacted.</p>
                          </CardContent>
                        </Card>
                      )}
                    </TabsContent>


                  <TabsContent value="evaluation" className="space-y-4 mt-4">
                    {candidate.Strengths && (
                      <Card className="bg-slate-800/50 border-slate-700/50">
                        <CardContent className="p-4 space-y-3">
                          <h3 className="font-semibold text-emerald-400 flex items-center gap-2">
                            <Award className="size-4" />
                            Strengths
                          </h3>
                          <p className="text-sm text-slate-300 leading-relaxed">{candidate.Strengths}</p>
                        </CardContent>
                      </Card>
                    )}

                    {candidate.Gaps && (
                      <Card className="bg-slate-800/50 border-slate-700/50">
                        <CardContent className="p-4 space-y-3">
                          <h3 className="font-semibold text-amber-400 flex items-center gap-2">
                            <AlertCircle className="size-4" />
                            Areas for Improvement
                          </h3>
                          <p className="text-sm text-slate-300 leading-relaxed">{candidate.Gaps}</p>
                        </CardContent>
                      </Card>
                    )}

                    {candidate.FitAnalysis && (
                      <Card className="bg-slate-800/50 border-slate-700/50">
                        <CardContent className="p-4 space-y-3">
                          <h3 className="font-semibold text-blue-400 flex items-center gap-2">
                            <FileText className="size-4" />
                            Fit Analysis
                          </h3>
                          <p className="text-sm text-slate-300 leading-relaxed">{candidate.FitAnalysis}</p>
                        </CardContent>
                      </Card>
                    )}

                    {candidate.Comments && (
                      <Card className="bg-slate-800/50 border-slate-700/50">
                        <CardContent className="p-4 space-y-3">
                          <h3 className="font-semibold text-violet-400">Comments</h3>
                          <p className="text-sm text-slate-300 leading-relaxed">{candidate.Comments}</p>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  <TabsContent value="resume" className="space-y-4 mt-4">
                    <Card className="bg-slate-800/50 border-slate-700/50">
                      <CardContent className="p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-white flex items-center gap-2">
                            <FileText className="size-4 text-emerald-400" />
                            Resume Preview
                          </h3>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleDownloadResume}
                              className="gap-2 bg-slate-700/50 border-slate-600/50 hover:bg-slate-700"
                            >
                              <ExternalLink className="size-4" />
                              Open Full
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleDownloadResume}
                              className="gap-2 bg-slate-700/50 border-slate-600/50 hover:bg-slate-700"
                            >
                              <Download className="size-4" />
                              Download
                            </Button>
                          </div>
                        </div>

                        {embedUrl ? (
                          <div className="relative w-full h-[600px] rounded-lg overflow-hidden border border-slate-700/50">
                            <iframe src={embedUrl} className="w-full h-full" allow="autoplay" title="Resume Preview" />
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-[400px] bg-slate-900/50 rounded-lg border border-slate-700/50">
                            <FileText className="size-16 text-slate-600 mb-4" />
                            <p className="text-slate-400 mb-4">Resume preview not available</p>
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
                      <Card className="bg-slate-800/50 border-slate-700/50">
                        <CardContent className="p-6 text-center py-8 text-slate-400">
                          <AlertCircle className="size-12 mx-auto mb-4 opacity-50" />
                          <p>Campaign information not available</p>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                </Tabs>

                {/* Action Buttons */}
                <div className="flex gap-4 shrink-0 bg-slate-950/80 backdrop-blur-xl px-6 pt-4 pb-6 border-t border-white/5 rounded-b-2xl">
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
                    className="flex-1 h-14 rounded-2xl text-white/60 hover:text-white bg-white/5 border-white/10 hover:bg-white/10 transition-all font-bold"
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
