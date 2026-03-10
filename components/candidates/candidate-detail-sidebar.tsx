"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useMemo } from "react"
import {
  X,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Award,
  FileText,
  Download,
  Flag,
  ExternalLink,
  User,
  AlertCircle,
  MessageCircle,
  CheckCircle,
  Clock,
  Send,
  MessageSquare,
  PhoneCall,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { CandidateDecisionSidebarContent } from "./candidate-decision-sidebar"

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
}

interface CandidateDetailSidebarProps {
  candidate: Candidate | null
  isOpen: boolean
  onClose: () => void
  campaignName?: string
  onDecisionUpdate?: () => void
}

export function CandidateDetailSidebar({
  candidate,
  isOpen,
  onClose,
  campaignName,
  onDecisionUpdate,
}: CandidateDetailSidebarProps) {
  const { toast } = useToast()

  const embedUrl = useMemo(() => {
    if (!candidate?.ResumeLink) return null
    const patterns = [/\/file\/d\/([a-zA-Z0-9_-]+)/, /id=([a-zA-Z0-9_-]+)/, /\/d\/([a-zA-Z0-9_-]+)/]
    for (const pattern of patterns) {
      const match = candidate.ResumeLink.match(pattern)
      if (match && match[1]) {
        return `https://drive.google.com/file/d/${match[1]}/preview`
      }
    }
    if (candidate.ResumeLink.includes("/preview")) {
      return candidate.ResumeLink
    }
    return null
  }, [candidate])

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
      { key: "HRRound", label: "HR", icon: User, colorStr: "violet",
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
      { key: "TechInterviewRound", label: "Tech", icon: Briefcase, colorStr: "amber",
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
      { key: "ManagerInterview", label: "Manager", icon: Award, colorStr: "fuchsia",
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

    const stages = rounds.map((r) => {
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

  const handleFlagForReview = () => {
    toast({
      title: "Flagged for Review",
      description: `${candidate?.Name} has been flagged for additional review.`,
    })
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
            className="fixed right-0 top-0 h-full w-full md:w-[600px] lg:w-[700px] bg-gradient-to-br from-slate-900 to-slate-800 border-l border-slate-700/50 shadow-2xl z-50 overflow-y-auto"
          >
            {candidate && (
              <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between sticky top-0 bg-gradient-to-br from-slate-900 to-slate-800 pb-4 border-b border-slate-700/50 z-10">
                  <div className="flex items-center gap-4">
                    <div className="size-16 rounded-full bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                      {candidate.Name && candidate.Name.trim() !== ""
                        ? candidate.Name.charAt(0).toUpperCase()
                        : candidate.Email
                          ? candidate.Email.charAt(0).toUpperCase()
                          : "?"}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white drop-shadow-sm flex items-center gap-2">
                        {candidate.Name && candidate.Name.trim() !== "" ? (
                          candidate.Name
                        ) : (
                          <>
                            <AlertCircle className="size-5 text-amber-400" />
                            <span className="text-amber-400">
                              {candidate.Email ? candidate.Email.split("@")[0] : "Unnamed Candidate"}
                            </span>
                          </>
                        )}
                      </h2>
                      <p className="text-slate-400 text-sm">{candidate.Email || "No email provided"}</p>

                      {pipelineProgress && (
                        <div className="mt-3 space-y-1.5 w-full">
                          <div className="flex items-center gap-2 mb-1.5">
                            <Briefcase className="size-3 text-blue-400" />
                            <span className="text-xs font-medium text-slate-300">Interview Pipeline</span>
                          </div>

                          {/* Horizontal Layout - scrollable on small screens */}
                          <div className="flex items-center gap-1 overflow-x-auto pb-1 hide-scrollbar">
                            {pipelineProgress.stages.map((stage, index) => {
                              const isCurrent = index === pipelineProgress.currentStageIndex
                              const isPast = index < pipelineProgress.currentStageIndex
                              const isRejected = stage.isRejected
                              
                              let bgClass = "bg-slate-800/30 border-slate-700/30"
                              let iconBg = "bg-slate-700"
                              let iconColor = "text-slate-400"
                              let textClass = "text-slate-500"
                              let connector = "bg-slate-700/50"
                              
                              if (isRejected) {
                                bgClass = "bg-gradient-to-br from-red-500/20 to-red-400/20 border-red-500/40"
                                iconBg = "bg-red-500"
                                iconColor = "text-white"
                                textClass = "text-red-300"
                                connector = "bg-red-500"
                              } else if (isPast || stage.isPassed) {
                                bgClass = stage.classes.pastBg
                                iconBg = stage.classes.pastIconBg
                                iconColor = "text-white"
                                textClass = stage.classes.pastText
                                connector = stage.classes.connector
                              } else if (isCurrent) {
                                bgClass = stage.classes.currentBg
                                iconBg = "bg-slate-700/50"
                                iconColor = stage.classes.currentIconText
                                textClass = stage.classes.currentText
                              }
                              
                              const Icon = stage.icon

                              return (
                                <div key={stage.key} className="flex items-center shrink-0">
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.1 * index }}
                                    className={cn(
                                      "flex flex-col items-center justify-center gap-1.5 p-2 rounded-lg border w-20",
                                      bgClass
                                    )}
                                  >
                                    <div className={cn("size-6 rounded-full flex items-center justify-center", iconBg)}>
                                      {isRejected ? (
                                        <X className={cn("size-3.5", iconColor)} />
                                      ) : isPast || stage.isPassed ? (
                                        <CheckCircle className={cn("size-3.5", iconColor)} />
                                      ) : (
                                        <Icon className={cn("size-3.5", iconColor)} />
                                      )}
                                    </div>
                                    <div className="text-center w-full">
                                      <div className="flex flex-col items-center gap-0.5">
                                        <span className={cn("text-[9px] font-medium leading-tight", textClass)}>
                                          {stage.label}
                                        </span>
                                        {isCurrent && !isRejected && (
                                          <motion.span
                                            animate={{ opacity: [1, 0.5, 1] }}
                                            transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
                                            className={cn(
                                              "text-[8px] px-1 py-0.5 rounded border mt-0.5 whitespace-nowrap",
                                              stage.classes.currentPill
                                            )}
                                          >
                                            IN PROGRESS
                                          </motion.span>
                                        )}
                                        {isRejected && (
                                          <span className="text-[8px] px-1 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30 mt-0.5">
                                            REJECTED
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </motion.div>
                                  
                                  {/* Connector logic */}
                                  {index < pipelineProgress.stages.length - 1 && (
                                    <div className="flex items-center px-0.5">
                                      <div
                                        className={cn(
                                          "h-0.5 w-3",
                                          connector
                                        )}
                                      />
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    <X className="size-5" />
                  </Button>
                </div>

                {/* Quick Info */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                    <Mail className="size-4 text-blue-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-400">Email</p>
                      <p className="text-sm text-white truncate">{candidate.Email || "Not provided"}</p>
                    </div>
                  </div>
                  {candidate.PhoneNumber && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                      <Phone className="size-4 text-emerald-400" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-400">Phone</p>
                        <p className="text-sm text-white">{candidate.PhoneNumber}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                    <MapPin className="size-4 text-violet-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-400">Location</p>
                      <p className="text-sm text-white">{candidate.City || "Not specified"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                    <Briefcase className="size-4 text-amber-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-400">Experience</p>
                      <p className="text-sm text-white">{candidate.Experience || "Not specified"}</p>
                    </div>
                  </div>
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
                          <Badge className={getDecisionColor(candidate.Decision)}>
                            {getDecisionIcon(candidate.Decision)} {candidate.Decision || "Pending"}
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
                <Tabs defaultValue="profile" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 border border-slate-700/50">
                    <TabsTrigger value="profile" className="data-[state=active]:bg-emerald-600">
                      Profile
                    </TabsTrigger>
                    <TabsTrigger value="evaluation" className="data-[state=active]:bg-emerald-600">
                      Evaluation
                    </TabsTrigger>
                    <TabsTrigger value="resume" className="data-[state=active]:bg-emerald-600">
                      Resume
                    </TabsTrigger>
                    <TabsTrigger value="decision" className="data-[state=active]:bg-emerald-600">
                      Decision
                    </TabsTrigger>
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
                    <Card className="bg-slate-800/50 border-slate-700/50">
                      <CardContent className="p-6">
                        {campaignName ? (
                          <CandidateDecisionSidebarContent
                            campaignName={campaignName}
                            candidateEmail={candidate.Email}
                            candidateDetails={candidate}
                            onSuccess={handleDecisionSuccess}
                          />
                        ) : (
                          <div className="text-center py-8 text-slate-400">
                            <AlertCircle className="size-12 mx-auto mb-4 opacity-50" />
                            <p>Campaign information not available</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                {/* Action Buttons */}
                <div className="flex gap-3 sticky bottom-0 bg-gradient-to-t from-slate-900 to-transparent pt-4">
                  <Button
                    variant="outline"
                    onClick={handleFlagForReview}
                    className="flex-1 gap-2 bg-slate-800/50 border-slate-700/50 hover:bg-slate-800"
                  >
                    <Flag className="size-4" />
                    Flag for Review
                  </Button>
                  <Button onClick={onClose} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                    Close
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
