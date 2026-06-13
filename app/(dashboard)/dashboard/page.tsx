"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import {
  Users,
  TrendingUp,
  Award,
  AlertCircle,
  Building2,
  CheckCircle2,
  Loader2,
  Target,
  BarChart3,
  Search,
  ArrowUpRight,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import {
  ResponsiveContainer,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  PieChart,
  Pie,
} from "recharts"

interface Campaign {
  row_number: number
  CampaignName: string
  UserEmail: string
  CreationDate: string
  CampaignStartDate?: string
  CampaignEndDate?: string
  IsActive: boolean
  Description?: string
  Location?: string
  ExpectedAttendees?: number
}

interface CandidateData {
  row_number: number
  Name: string
  "Resume Summary": string
  Email: string
  "Phone Number": number
  City: string
  "Resume Link": string
  Score: number
  Strengths: string
  Gaps: string
  "Fit Analysis": string
  Decision: string
  "App. Booked for 1st Round": string
  "Technical Interview": string
  "TI Assigned": string
  Comments: string
  "Final Decision": string
  "HR Assigned": string
  "Candidate ID": string
}

interface HRAnalytics {
  overview: {
    totalCandidates: number
    avgScore: string
    medianScore: string
    resume_passed: number
    call_passed: number
    hr_passed: number
    tech_passed: number
    manager_passed: number
    rejected: number
    // Funnel Transitions
    resume_to_call: string
    call_to_hr: string
    hr_to_tech: string
    tech_to_manager: string
    overallConversion: string
  }
  hrPerformance: Array<{
    hr: string
    total: number
    hired: number
    avgScore: string
    successRate: string
    hiringEfficiencyPercent?: string
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
    resume_passed: Candidate[]
    call_passed: Candidate[]
    hr_passed: Candidate[]
    tech_passed: Candidate[]
    manager_passed: Candidate[]
    rejected: Candidate[]
    all: Candidate[]
  }
  campaignCandidates: Candidate[]
  insights: string[]
  qualityIndex?: {
    avgAllScore?: string
    avgHiredScore?: string
  }
  funnel?: {
    tiToHiredPercent?: string
    shortlistedToTIPercent?: string
    overallConversionPercent?: string
  }
  overall?: {
    totalCandidates?: number
    hired?: number
    rejected?: number
    shortlisted?: number
    technicalInterview?: number
    avgScore?: string
    medianScore?: string
    topScore?: number
    lowScore?: number
  }
  meta?: {
    totalCandidates?: number
  }
}

interface Candidate {
  id: string
  name: string
  email: string
  phone: string
  city: string
  score: number
  hr: string
  resumeDecision: string
  callDecision: string
  hrDecision: string
  techDecision: string
  managerDecision: string
  comments: string
  strengths: string
  gaps: string
  resumeLink: string
  resumeSummary: string
  appliedDate: string
  
  // Meeting Details
  hrMeetingDate?: string
  hrMeetingTime?: string
  hrMeetingLink?: string
  hrEventID?: string
  
  techMeetingDate?: string
  techMeetingTime?: string
  techMeetingLink?: string
  techEventID?: string
  
  managerMeetingDate?: string
  managerMeetingTime?: string
  managerMeetingLink?: string
  managerEventID?: string
}

const colors = {
  primary: "#8b5cf6",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  info: "#3b82f6",
}

const isYes = (val: any) => 
  val === true || (typeof val === "string" && ["yes", "hired", "pass", "passed", "done"].includes(val.toLowerCase()));
const isNo = (val: any) => 
  val === false || (typeof val === "string" && ["no", "rejected", "fail", "failed"].includes(val.toLowerCase()));

export default function DashboardPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const userEmail = user?.email || "guest@example.com"
  const router = useRouter()

  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [selectedCampaign, setSelectedCampaign] = useState<string>("all")
  const [loadingCampaigns, setLoadingCampaigns] = useState(true)
  const [hrData, setHrData] = useState<HRAnalytics | null>(null)
  const [candidateData, setCandidateData] = useState<CandidateData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  
  useEffect(() => {
    setIsMounted(true)
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) setGreeting("Good Morning")
    else if (hour >= 12 && hour < 17) setGreeting("Good Afternoon")
    else setGreeting("Good Evening")
  }, [])

  const [greeting, setGreeting] = useState("Hi, HR Manager")

  const [showCandidatesModal, setShowCandidatesModal] = useState(false)
  const [showHRModal, setShowHRModal] = useState(false)
  const [showCityModal, setShowCityModal] = useState(false)

  const [searchQuery, setSearchQuery] = useState("")

  const [candidateStageFilter, setCandidateStageFilter] = useState<string>("all")

  const [sortBy, setSortBy] = useState<"score" | "city" | "hr">("score")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  const [expandedCard, setExpandedCard] = useState<string | null>(null)

  const fetchCampaigns = async () => {
    setLoadingCampaigns(true)
    try {
      // Use the internal API route which calls AllCampaign via POST through proxy
      const response = await fetch("/api/campaigns")
      if (!response.ok) throw new Error(`API returned ${response.status}`)

      const data = await response.json()
      console.log("[dashboard] Campaigns response:", data)

      const list: Campaign[] = data.campaigns || []
      console.log("[dashboard] Total campaigns:", list.length)
      setCampaigns(list)
    } catch (error: any) {
      console.error("[dashboard] Error fetching campaigns:", error)
      toast({
        title: "Campaigns Error",
        description: "Failed to load campaign data.",
        variant: "destructive",
      })
      setCampaigns([])
    } finally {
      setLoadingCampaigns(false)
    }
  }

  const fetchHRAnalytics = async (campaignName?: string) => {
    try {
      setLoading(true)

      let response: Response
      if (campaignName && campaignName !== "all") {
        // As requested: send Certian Campaign action when a specific campaign is clicked
        const url = `/api/campaigns?campaignName=${encodeURIComponent(campaignName)}`
        console.log(`[dashboard] Fetching metrics from Certain Campaign: ${url}`)
        response = await fetch(url)
      } else {
        // Default overall view
        const params = new URLSearchParams()
        params.append("action", "HRAnalytics")
        
        response = await fetch(`/api/webhook-proxy?${params.toString()}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: userEmail,
            campaign: undefined
          }),
        })
      }

      const responseText = await response.text()
      let rawData: any = {}
      try {
        rawData = JSON.parse(responseText)
      } catch (e) {
        console.warn("[dashboard] Failed to parse JSON response")
      }

      if (!response.ok) {
        if (response.status === 500 && responseText.includes("No item to return was found")) {
          console.log("[dashboard] n8n returned no items, treating as empty state")
          rawData = { data: [] }
        } else {
          throw new Error(`API returned ${response.status}: ${responseText.substring(0, 100)}`)
        }
      }

      console.log("[dashboard] Received raw data:", rawData)

      // Normalize rawData to handle various envelope shapes
      let actualData = rawData
      if (rawData.status === 200 && rawData.data) {
        actualData = rawData.data 
      } else if (rawData.data && Array.isArray(rawData.data)) {
        actualData = rawData.data
      }

      // Resilient candidate extraction
      let rawCandidates: any[] = []
      if (Array.isArray(actualData)) {
        // If it's an array of items, check if they are wrapped in .json (common in n8n)
        rawCandidates = actualData.map(item => item?.json || item)
      } else if (actualData && typeof actualData === "object") {
        // Look for the candidates list in common property names
        rawCandidates = actualData.campaignCandidates || 
                        actualData.candidates || 
                        actualData.data || 
                        actualData.items || 
                        []
      }

        // Map raw rows to Candidate objects
        const normalizedCandidates: Candidate[] = rawCandidates.map((c: any, index: number) => ({
          id: String(c.id || c["Candidate ID"] || c.id_candidate || `cand-${c.row_number || index}`),
          name: String(c.name || c.Name || "Unknown Candidate"),
          email: String(c.email || c.Email || ""),
          phone: String(c.phone || c["Phone Number"] || ""),
          city: String(c.city || c.City || "Unknown"),
          score: typeof c.score === "number" ? c.score : Number.parseFloat(c.score || c.Score || "0") || 0,
          hr: String(c.hr || c["HR Assigned"] || c.hr_assigned || "Unassigned"),
          resumeDecision: String(c["Resume Decision"] || c.resume_decision || c["Resume Screening"] || c.resume_screening || c.decision || c.Decision || "Pending"),
          callDecision: String(c["Call Decision"] || c.call_decision || c["Call Round"] || c.call_round || c["Call Status"] || c.call_status || "Pending"),
          hrDecision: String(c["HR Decision"] || c.hr_decision || c["HR Round"] || c.hr_round || "Pending"),
          techDecision: String(c["Tech Decision"] || c.tech_decision || c["Tech Interview"] || c.tech_interview || c.technicalInterview || c["Technical Interview"] || "Pending"),
          managerDecision: String(c["Manager Decision"] || c.manager_decision || c["Final Decision"] || c["Manager Interview"] || c.ManagerInterview || c.final_decision || "Pending"),
          comments: String(c.comments || c.Comments || ""),
          strengths: String(c.strengths || c.Strengths || ""),
          gaps: String(c.gaps || c.Gaps || ""),
          resumeLink: String(c.resumeLink || c["Resume Link"] || ""),
          resumeSummary: String(c.resumeSummary || c["Resume Summary"] || ""),
          appliedDate: String(c.appliedDate || c.applied_date || c.CreationDate || c.date || ""),

          // HR Meeting Details
          hrMeetingDate: c["HR Meeting Date"] || c.HRMeetingDate || "",
          hrMeetingTime: c["HR Meeting Time"] || c.HRMeetingTime || "",
          hrMeetingLink: c["HR Meeting Link"] || c.HRMeetingLink || "",
          hrEventID:     c["HR Event ID"] || c.HREventID || "",

          // Tech Meeting Details
          techMeetingDate: c["Tech Meeting Date"] || c.TechMeetingDate || "",
          techMeetingTime: c["Tech Meeting Time"] || c.TechMeetingTime || "",
          techMeetingLink: c["Tech Meeting Link"] || c.TechMeetingLink || "",
          techEventID:     c["Tech. Event ID"] || c["Tech Event ID"] || c.TechEventID || "",

          // Manager Meeting Details
          managerMeetingDate: c["Manager Meeting Date"] || c.ManagerMeetingDate || "",
          managerMeetingTime: c["Manager Meeting Time"] || c.ManagerMeetingTime || "",
          managerMeetingLink: c["Manager Interview Link"] || c.ManagerMeetingLink || "",
          managerEventID:     c["Manager Event ID"] || c.ManagerEventID || "",
        }))

        if (normalizedCandidates.length === 0 && !actualData.overview) {
          setHrData({
            overview: { totalCandidates: 0, avgScore: "0", medianScore: "0", resume_passed: 0, call_passed: 0, hr_passed: 0, tech_passed: 0, manager_passed: 0, rejected: 0, resume_to_call: "0%", call_to_hr: "0%", hr_to_tech: "0%", tech_to_manager: "0%", overallConversion: "0%" },
            hrPerformance: [], cityPerformance: [], decisionEffectiveness: "0",
            candidatesByStage: { resume_passed: [], call_passed: [], hr_passed: [], tech_passed: [], manager_passed: [], rejected: [], all: [] },
            campaignCandidates: [], insights: [],
          })
        } else {
          // Cumulative counts for funnel overview metrics (how many EVER passed each stage)
          const resumePassed = normalizedCandidates.filter(c => isYes(c.resumeDecision))
          const callPassed = normalizedCandidates.filter(c => isYes(c.callDecision))
          const hrPassed = normalizedCandidates.filter(c => isYes(c.hrDecision))
          const techPassed = normalizedCandidates.filter(c => isYes(c.techDecision))
          const managerPassed = normalizedCandidates.filter(c => isYes(c.managerDecision))
          const rejectedCands = normalizedCandidates.filter(c => 
            isNo(c.resumeDecision) || isNo(c.callDecision) || 
            isNo(c.hrDecision) || isNo(c.techDecision) || 
            isNo(c.managerDecision)
          )

          // Stage TABS: each candidate appears only in their HIGHEST cleared stage
          const stageManagerPassed  = normalizedCandidates.filter(c => isYes(c.managerDecision))
          const stageTechPassed     = normalizedCandidates.filter(c => isYes(c.techDecision) && !isYes(c.managerDecision))
          const stageHrPassed       = normalizedCandidates.filter(c => isYes(c.hrDecision) && !isYes(c.techDecision) && !isYes(c.managerDecision))
          const stageCallPassed     = normalizedCandidates.filter(c => isYes(c.callDecision) && !isYes(c.hrDecision) && !isYes(c.techDecision) && !isYes(c.managerDecision))
          const stageResumePassed   = normalizedCandidates.filter(c => isYes(c.resumeDecision) && !isYes(c.callDecision) && !isYes(c.hrDecision) && !isYes(c.techDecision) && !isYes(c.managerDecision))
          const stageRejected       = normalizedCandidates.filter(c => 
            isNo(c.resumeDecision) || isNo(c.callDecision) || 
            isNo(c.hrDecision) || isNo(c.techDecision) || 
            isNo(c.managerDecision)
          )

        const totalCands = actualData.overview?.totalCandidates || normalizedCandidates.length || 0
        const scores = normalizedCandidates.map(c => c.score || 0).filter(s => s > 0)
        const avgScore = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2) : "0.00"

        const cityMap: Record<string, { city: string, total: number, hired: number, scoreSum: number }> = {}
        const hrMap: Record<string, { hr: string, total: number, hired: number, scoreSum: number }> = {}

        normalizedCandidates.forEach(c => {
          const city = c.city || "Unknown"
          if (!cityMap[city]) cityMap[city] = { city, total: 0, hired: 0, scoreSum: 0 }
          cityMap[city].total++
          if (isYes(c.managerDecision)) cityMap[city].hired++
          cityMap[city].scoreSum += (c.score || 0)

          const hr = c.hr || "Unassigned"
          if (!hrMap[hr]) hrMap[hr] = { hr, total: 0, hired: 0, scoreSum: 0 }
          hrMap[hr].total++
          if (isYes(c.managerDecision)) hrMap[hr].hired++
          hrMap[hr].scoreSum += (c.score || 0)
        })

        const calculatedCityPerf = Object.values(cityMap).map(city => ({
          city: city.city, total: city.total, hired: city.hired,
          avgScore: (city.scoreSum / city.total).toFixed(2),
          hireRate: ((city.hired / city.total) * 100).toFixed(1) + "%"
        }))

        const calculatedHrPerf = Object.values(hrMap).map(hr => ({
          hr: hr.hr, total: hr.total, hired: hr.hired,
          avgScore: (hr.scoreSum / hr.total).toFixed(2),
          successRate: ((hr.hired / hr.total) * 100).toFixed(1) + "%",
          hiringEfficiencyPercent: ((hr.hired / hr.total) * 100).toFixed(1)
        }))

        const transformedData: HRAnalytics = {
          overview: {
            totalCandidates: totalCands,
            avgScore: actualData.overview?.avgScore || avgScore,
            medianScore: actualData.overview?.medianScore || avgScore,
            resume_passed: resumePassed.length,
            call_passed: callPassed.length,
            hr_passed: hrPassed.length,
            tech_passed: techPassed.length,
            manager_passed: managerPassed.length,
            rejected: rejectedCands.length,
            resume_to_call: (resumePassed.length > 0 ? ((callPassed.length / resumePassed.length) * 100).toFixed(0) + "%" : "0%"),
            call_to_hr: (callPassed.length > 0 ? ((hrPassed.length / callPassed.length) * 100).toFixed(0) + "%" : "0%"),
            hr_to_tech: (hrPassed.length > 0 ? ((techPassed.length / hrPassed.length) * 100).toFixed(0) + "%" : "0%"),
            tech_to_manager: (techPassed.length > 0 ? ((managerPassed.length / techPassed.length) * 100).toFixed(0) + "%" : "0%"),
            overallConversion: (totalCands > 0 ? ((managerPassed.length / totalCands) * 100).toFixed(0) + "%" : "0%"),
          },
          overall: actualData.overall || actualData.overview || {},
          funnel: actualData.funnel || {},
          qualityIndex: actualData.qualityIndex || {},
          hrPerformance: hrPerformance.length > 0 ? hrPerformance : calculatedHrPerf,
          cityPerformance: cityPerformance.length > 0 ? cityPerformance : calculatedCityPerf,
          decisionEffectiveness: actualData.decisionEffectiveness || avgScore,
          candidatesByStage: {
            resume_passed: stageResumePassed,
            call_passed: stageCallPassed,
            hr_passed: stageHrPassed,
            tech_passed: stageTechPassed,
            manager_passed: stageManagerPassed,
            rejected: stageRejected,
            all: normalizedCandidates,
          },
          campaignCandidates: normalizedCandidates,
          insights: actualData.insights || [],
        }
        setHrData(transformedData)
      }
      setLoading(false)
    } catch (error: any) {
      console.error("[dashboard] Error fetching HR analytics:", error.message)
      toast({
        title: "Connection Error",
        description: "Failed to connect to the analytics service.",
        variant: "destructive",
      })
      setHrData(null)
      setLoading(false)
    }
  }

  const handleCampaignDropdownOpen = (open: boolean) => {
    if (open && campaigns.length === 0 && !loadingCampaigns) {
      fetchCampaigns()
    }
  }

  useEffect(() => {
    fetchCampaigns()
  }, [])

  useEffect(() => {
    localStorage.setItem("selectedCampaign", selectedCampaign)
    fetchHRAnalytics(selectedCampaign)
  }, [selectedCampaign])

  if (!isMounted || (loading && !hrData) || (loadingCampaigns && campaigns.length === 0)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background transition-colors duration-500">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="size-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="size-10 border-4 border-accent/20 border-t-accent rounded-full animate-spin-reverse" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-foreground font-bold text-xl tracking-tight">Intelligence Engine Loading</p>
            <p className="text-muted-foreground text-sm font-medium animate-pulse">Synchronizing HR Analytics...</p>
          </div>
        </div>
      </div>
    )
  }

  const isNewUser = !loading && !loadingCampaigns && hrData && hrData.overview?.totalCandidates === 0 && campaigns.length === 0

  if (isNewUser) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-4 md:p-6 lg:p-8 mb-6">
            <div className="absolute inset-0 bg-linear-to-r from-primary/5 to-accent/5" />
            <div className="relative">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground mb-3">
                Welcome to ZV Steels HR Analytics
              </h1>
              <p className="text-muted-foreground text-lg font-medium">Empower your recruitment process with data-driven insights.</p>
            </div>
          </div>

          {/* Welcome Card */}
          <Card className="bg-card border-border shadow-xl shadow-primary/5">
            <CardHeader>
              <CardTitle className="text-foreground text-2xl">Start Your Hiring Journey</CardTitle>
              <CardDescription className="text-muted-foreground text-base">
                Create your first campaign to unlock powerful analytics and streamline your hiring process
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Features Grid */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-emerald-500/10">
                      <TrendingUp className="size-5 text-emerald-500" />
                    </div>
                    <h3 className="font-semibold text-foreground">Track Recruitment Funnels</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Visualize your hiring pipeline from initial screening to final offers
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-violet-500/10">
                      <BarChart3 className="size-5 text-violet-500" />
                    </div>
                    <h3 className="font-semibold text-foreground">Evaluate Candidate Quality</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">AI-powered scoring and analysis for every candidate</p>
                </div>

                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <Users className="size-5 text-blue-500" />
                    </div>
                    <h3 className="font-semibold text-foreground">Compare HR Performance</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">Track success rates and efficiency across your HR team</p>
                </div>

                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-amber-500/10">
                      <Building2 className="size-5 text-amber-500" />
                    </div>
                    <h3 className="font-semibold text-foreground">Analyze City Hiring Trends</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">Understand hiring patterns and success rates by location</p>
                </div>
              </div>

              {/* CTA */}
              <div className="flex justify-center pt-4">
                <Link href="/manage-campaigns">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                  >
                    <Building2 className="size-5 mr-2" />
                    Create Your First Campaign
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const totalCandidates =
    hrData?.overview?.totalCandidates || hrData?.overall?.totalCandidates || hrData?.meta?.totalCandidates || 0
  const avgScore =
    hrData?.overview?.avgScore || hrData?.overall?.avgScore
      ? Number.parseFloat((hrData?.overview?.avgScore || hrData?.overall?.avgScore)!).toFixed(2)
      : "0.00"
  const medianScore =
    hrData?.overview?.medianScore || hrData?.overall?.medianScore
      ? Number.parseFloat((hrData?.overview?.medianScore || hrData?.overall?.medianScore)!).toFixed(2)
      : "0.00"
  const topScore = hrData?.overall?.topScore || 95 // Fallback to reasonable default
  const lowScore = hrData?.overall?.lowScore || 36 // Fallback to reasonable default
  const overallConversion = hrData?.overview?.overallConversion || hrData?.funnel?.overallConversionPercent || "0%"
  const decisionEffectiveness = hrData?.decisionEffectiveness
    ? Number.parseFloat(hrData.decisionEffectiveness).toFixed(2)
    : hrData?.qualityIndex?.avgHiredScore
      ? Number.parseFloat(hrData.qualityIndex.avgHiredScore).toFixed(2)
      : "0.00"

  const finalHired = hrData?.overview?.manager_passed || 0
  const rejected = hrData?.overview?.rejected || 0

  const insights = hrData?.insights || []
  const hrPerformance = hrData?.hrPerformance || []
  const cityPerformance = hrData?.cityPerformance || []

  const stageDistributionData = [
    { name: "Resume Screening", value: hrData?.overview?.resume_passed || 0, fill: "#8b5cf6" },
    { name: "Call Round", value: hrData?.overview?.call_passed || 0, fill: "#3b82f6" },
    { name: "Round 1", value: hrData?.overview?.hr_passed || 0, fill: "#10b981" },
    { name: "Round 2", value: hrData?.overview?.tech_passed || 0, fill: "#f59e0b" },
    { name: "Round 3", value: hrData?.overview?.manager_passed || 0, fill: "#ef4444" },
  ] // Removed filter to ensure all rounds show in legend even if 0

  const scoreRangeData =
    hrPerformance.length > 0
      ? [
          {
            name: "Excellent (80-100)",
            value: hrData?.campaignCandidates?.filter((c) => (c.score || 0) >= 80).length || 0,
            fill: "#8b5cf6",
          },
          {
            name: "Good (60-79)",
            value: hrData?.campaignCandidates?.filter((c) => (c.score || 0) >= 60 && (c.score || 0) < 80).length || 0,
            fill: "#10b981",
          },
          {
            name: "Average (40-59)",
            value: hrData?.campaignCandidates?.filter((c) => (c.score || 0) >= 40 && (c.score || 0) < 60).length || 0,
            fill: "#f59e0b",
          },
          {
            name: "Below Average (<40)",
            value: hrData?.campaignCandidates?.filter((c) => (c.score || 0) < 40).length || 0,
            fill: "#ef4444",
          },
        ].filter((item) => item.value > 0)
      : []

  const funnelData = [
    { stage: "Applied", value: totalCandidates, fill: "#f59e0b" },
    { stage: "Resume Passed", value: hrData?.overview?.resume_passed || 0, fill: "#8b5cf6" },
    { stage: "Call Round", value: hrData?.overview?.call_passed || 0, fill: "#3b82f6" },
    { stage: "HR Passed", value: hrData?.overview?.hr_passed || 0, fill: "#10b981" },
    { stage: "Tech Passed", value: hrData?.overview?.tech_passed || 0, fill: "#6366f1" },
    { stage: "Manager Passed", value: hrData?.overview?.manager_passed || 0, fill: "#ec4899" },
  ]

  // Updated HRs mapping for new schema
  const topHRs = hrPerformance.map((hr) => {
    // Handle HR name - if it's "Unassigned" or doesn't contain @, use as-is
    let hrName = "Unassigned"
    if (hr.hr && hr.hr.trim() !== "" && hr.hr !== "Unassigned") {
      hrName = hr.hr.includes("@") ? hr.hr.split("@")[0] : hr.hr
    }

    // Parse and validate success rate - ensure it's a valid number
    const parsedSuccessRate = Number.parseFloat(hr.successRate || "0")
    const validSuccessRate = isNaN(parsedSuccessRate) ? 0 : parsedSuccessRate

    // Parse and validate avg score - ensure it's a valid number
    const parsedAvgScore = Number.parseFloat(hr.avgScore || "0")
    const validAvgScore = isNaN(parsedAvgScore) ? 0 : parsedAvgScore

    return {
      HR: hrName,
      successRate: validSuccessRate.toFixed(2),
      avgScore: validAvgScore.toFixed(2),
    }
  })

  const activeCampaigns = campaigns.filter((c) => c.IsActive).length

  // Updated city performance data extraction and sorting
  const cityDecisionData = cityPerformance
    .map((city) => ({
      city: city.city === "Unknown" ? "Not Specified" : city.city,
      approved: Number.parseFloat(city.hireRate || "0"), // Assuming hireRate is percentage of hired candidates
      rejected: 100 - Number.parseFloat(city.hireRate || "0"), // Calculate rejected based on hireRate
      total: city.total,
      hired: city.hired,
    }))
    .sort((a, b) => b.approved - a.approved)
    .slice(0, 6)

  // Updated HR performance data extraction and slicing
  const hrComparisonData = topHRs
    .map((hr) => {
      const successRate = Number.parseFloat(hr.successRate)
      const avgScore = Number.parseFloat(hr.avgScore)

      return {
        name: hr.HR,
        successRate: isNaN(successRate) ? 0 : successRate,
        avgScore: isNaN(avgScore) ? 0 : avgScore,
        efficiency: (isNaN(successRate) ? 0 : successRate) * 0.7 + (isNaN(avgScore) ? 0 : avgScore) * 0.3,
      }
    })
    .slice(0, 5)

  const calculateStdDeviation = () => {
    if (!hrData?.hrPerformance || hrData.hrPerformance.length === 0) return "0.00"

    const scores = hrData.hrPerformance.map((hr) => Number.parseFloat(hr.avgScore || "0"))
    // Handle cases where scores might not be valid numbers after parsing
    const validScores = scores.filter((score) => !isNaN(score))

    if (validScores.length === 0) return "0.00"

    const mean = validScores.reduce((a, b) => a + b, 0) / validScores.length
    const variance = validScores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / validScores.length
    return Math.sqrt(variance).toFixed(2)
  }

  const calculatePendingRate = () => {
    if (!hrData?.overview) return "0.00"
    const total = hrData.overview.totalCandidates || 0
    const processed = (hrData.overview.manager_passed || 0) + (hrData.overview.rejected || 0)
    const pending = total - processed
    return total > 0 ? ((pending / total) * 100).toFixed(2) : "0.00"
  }

  const scoreStdDev = calculateStdDeviation()
  const pendingRate = calculatePendingRate()

  const getCandidatesByStage = () => {
    if (!hrData?.candidatesByStage) return []
    const stageKeyMap: Record<string, keyof typeof hrData.candidatesByStage> = {
      all: "all",
      resume: "resume_passed",
      call: "call_passed",
      hr: "hr_passed",
      tech: "tech_passed",
      manager: "manager_passed",
      rejected: "rejected",
    }
    const key = stageKeyMap[candidateStageFilter] || "all"
    return hrData.candidatesByStage[key] || []
  }

  // Using sortedCandidates instead of filteredCandidates
  const sortedCandidates = [...getCandidatesByStage()].sort((a, b) => {
    if (sortBy === "score") {
      return sortOrder === "desc" ? b.score - a.score : a.score - b.score
    } else if (sortBy === "city") {
      const cityA = a.city || ""
      const cityB = b.city || ""
      return sortOrder === "desc" ? cityB.localeCompare(cityA) : cityA.localeCompare(cityB)
    } else if (sortBy === "hr") {
      const hrA = a.hr || ""
      const hrB = b.hr || ""
      return sortOrder === "desc" ? hrB.localeCompare(hrA) : hrA.localeCompare(hrB)
    }
    return 0
  })

  const filteredCandidates = sortedCandidates.filter(
    (candidate) =>
      candidate.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.city?.toLowerCase().includes(searchQuery.toLowerCase()),
  )


  return (
    <div className="min-h-screen bg-background transition-colors duration-500">
      <div className="grid gap-6 p-6">
        {/* Header Section */}
        <section className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm p-4 md:p-6 lg:p-8">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-violet-500/5" />
          <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-3 w-full lg:w-auto">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
                {greeting}
              </h1>
              <p className="text-muted-foreground text-base md:text-lg font-medium">This is your HR analytics dashboard</p>
              <div className="flex flex-wrap items-center gap-3 md:gap-4 pt-2">
                <div className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg bg-secondary border border-border">
                  <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs md:text-sm text-foreground font-semibold">Live Data</span>
                </div>
                <div className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg bg-secondary border border-border">
                  <Building2 className="size-4 text-primary" />
                  <span className="text-xs md:text-sm text-foreground font-semibold">{activeCampaigns} Active Campaigns</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
              <Select
                value={selectedCampaign}
                onValueChange={setSelectedCampaign}
                onOpenChange={handleCampaignDropdownOpen}
              >
                <SelectTrigger className="w-full sm:w-[240px] bg-card border-border text-foreground hover:bg-muted transition-colors">
                  <SelectValue placeholder={loadingCampaigns ? "Loading..." : "Select Campaign"}>
                    {selectedCampaign === "all"
                      ? "Select campaign for analytics"
                      : campaigns.find((c) => c.CampaignName === selectedCampaign)?.CampaignName || selectedCampaign}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="all">Select campaign for analytics</SelectItem>
                  {loadingCampaigns ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="size-4 animate-spin text-slate-400" />
                    </div>
                  ) : campaigns.length > 0 ? (
                    campaigns.map((campaign) => (
                      <SelectItem key={campaign.CampaignName} value={campaign.CampaignName}>
                        <div className="flex items-center justify-between w-full">
                           <span>{campaign.CampaignName}</span>
                           {campaign.IsActive && (
                             <Badge variant="outline" className="ml-2 scale-75 bg-emerald-500/10 text-emerald-500 border-emerald-500/20 py-0 h-4">Active</Badge>
                           )}
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-2 py-4 text-sm text-slate-400 text-center">No campaigns found</div>
                  )}
                </SelectContent>
              </Select>
              <Link href="/manage-campaigns" className="w-full sm:w-auto">
                <Button className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white shadow-lg shadow-emerald-500/20">
                  Create Campaign
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Key Metrics Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card
            className="bg-card border-border hover:border-emerald-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10 cursor-pointer"
            onClick={() => setExpandedCard(expandedCard === "total" ? null : "total")}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Total Candidates</CardTitle>
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Users className="size-4 text-emerald-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-foreground">{totalCandidates}</div>
              <div className="flex items-center gap-2 mt-2">
                <ArrowUpRight className="size-4 text-emerald-400" />
                <p className="text-xs text-emerald-400 font-medium">{overallConversion}</p>
              </div>
              {expandedCard === "total" && (
                <div className="mt-4 pt-4 border-t border-border space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Resume Pass:</span>
                    <span className="text-foreground font-semibold">{hrData?.overview?.resume_passed || 0}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Call Pass:</span>
                    <span className="text-foreground font-semibold">{hrData?.overview?.call_passed || 0}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">HR Pass:</span>
                    <span className="text-foreground font-semibold">{hrData?.overview?.hr_passed || 0}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Tech Pass:</span>
                    <span className="text-foreground font-semibold">{hrData?.overview?.tech_passed || 0}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Manager Pass:</span>
                    <span className="text-foreground font-semibold">{hrData?.overview?.manager_passed || 0}</span>
                  </div>
                  <div className="flex justify-between text-xs pt-1 border-t border-border mt-1">
                    <span className="text-muted-foreground font-bold">Total Hired:</span>
                    <span className="text-emerald-500 font-bold">{finalHired}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card
            className="bg-card border-border hover:border-violet-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/10 cursor-pointer"
            onClick={() => setExpandedCard(expandedCard === "score" ? null : "score")}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Average Score</CardTitle>
              <div className="p-2 rounded-lg bg-violet-500/10">
                <TrendingUp className="size-4 text-violet-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-foreground">{avgScore}</div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-muted-foreground font-medium">
                  Range: {lowScore} - {topScore}
                </p>
                <p className="text-xs text-muted-foreground font-medium">Median: {medianScore}</p>
              </div>
              {expandedCard === "score" && (
                <div className="mt-4 pt-4 border-t border-border space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Std Deviation:</span>
                    <span className="text-foreground font-semibold">{scoreStdDev}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Hired Avg:</span>
                    <span className="text-emerald-500 font-semibold">
                      {hrData?.qualityIndex?.avgHiredScore || "N/A"}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card
            className="bg-card border-border hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 cursor-pointer"
            onClick={() => setExpandedCard(expandedCard === "hired" ? null : "hired")}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Final Hired</CardTitle>
              <div className="p-2 rounded-lg bg-blue-500/10">
                <CheckCircle2 className="size-4 text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-blue-500">{finalHired}</div>
              <div className="flex items-center gap-1 mt-2">
                <Target className="size-4 text-blue-500" />
                <p className="text-xs text-blue-500 font-medium">{hrData?.funnel?.tiToHiredPercent || "0%"}</p>
              </div>
              {expandedCard === "hired" && (
                <div className="mt-4 pt-4 border-t border-border space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Resume → Call:</span>
                    <span className="text-foreground font-semibold">{hrData?.overview?.resume_to_call || "0%"}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Call → HR:</span>
                    <span className="text-foreground font-semibold">{hrData?.overview?.call_to_hr || "0%"}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">HR → Tech:</span>
                    <span className="text-foreground font-semibold">{hrData?.overview?.hr_to_tech || "0%"}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Tech → Manager:</span>
                    <span className="text-foreground font-semibold">{hrData?.overview?.tech_to_manager || "0%"}</span>
                  </div>
                  <div className="flex justify-between text-xs pt-1 border-t border-border mt-1">
                    <span className="text-muted-foreground">Rejection Rate:</span>
                    <span className="text-red-500 font-semibold">{rejected} candidates</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card
            className="bg-card border-border hover:border-amber-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/10 cursor-pointer"
            onClick={() => setExpandedCard(expandedCard === "quality" ? null : "quality")}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Decision Quality</CardTitle>
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Award className="size-4 text-amber-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-foreground">{decisionEffectiveness}</div>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="size-4 text-amber-500" />
                <p className="text-xs text-amber-500 font-medium">Effectiveness Index</p>
              </div>
              {expandedCard === "quality" && (
                <div className="mt-4 pt-4 border-t border-border space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">All Candidates Avg:</span>
                    <span className="text-foreground font-semibold">{hrData?.qualityIndex?.avgAllScore || "N/A"}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Hired Avg:</span>
                    <span className="text-emerald-500 font-semibold">
                      {hrData?.qualityIndex?.avgHiredScore || "N/A"}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>


        {/* Charts Section */}
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Target className="size-5 text-emerald-500" />
                Stage Distribution
              </CardTitle>
              <CardDescription className="text-muted-foreground">Candidates by recruitment stage</CardDescription>
            </CardHeader>
            <CardContent>
              {stageDistributionData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={stageDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                      label={false}
                      labelLine={false}
                    >
                      {stageDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      itemStyle={{ color: "hsl(var(--popover-foreground))" }}
                      labelStyle={{ color: "hsl(var(--popover-foreground))" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-[250px] text-slate-500">
                  <AlertCircle className="size-12 mb-4 opacity-50" />
                  <p>No stage data available</p>
                </div>
              )}
              {stageDistributionData.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                  {stageDistributionData.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="size-3 rounded-full shadow-sm" style={{ backgroundColor: entry.fill }} />
                      <span className="text-xs text-muted-foreground font-medium truncate">
                        {entry.name}: {entry.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Users className="size-5 text-violet-400" />
                HR Performance
              </CardTitle>
              <CardDescription className="text-muted-foreground">Top performing HR managers</CardDescription>
            </CardHeader>
            <CardContent>
              {hrPerformance.length > 0 ? (
                <div className="space-y-3">
                  {hrPerformance.slice(0, 4).map((hr, index) => {
                    const hrName = hr.hr === "Unassigned" || !hr.hr ? "Unassigned" : hr.hr
                    const displayName = hrName.includes("@") ? hrName.split("@")[0] : hrName

                    return (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border hover:bg-muted transition-all duration-200"
                      >
                        <div
                          className={`flex items-center justify-center size-8 rounded-full font-bold text-xs ${
                            index === 0
                              ? "bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          #{index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-foreground text-sm">{displayName}</p>
                          <p className="text-xs text-muted-foreground">
                            {hr.hired}/{hr.total} hired • Avg: {Number.parseFloat(hr.avgScore).toFixed(1)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                            {Number.parseFloat(hr.hiringEfficiencyPercent || hr.successRate || "0").toFixed(1)}%
                          </p>
                          <p className="text-xs text-muted-foreground">Success</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[250px] text-muted-foreground">
                  <Users className="size-12 mb-4 opacity-50" />
                  <p className="text-muted-foreground">No HR data available</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Building2 className="size-5 text-blue-500" />
                City Performance
              </CardTitle>
              <CardDescription className="text-muted-foreground">Hiring rates by location</CardDescription>
            </CardHeader>
            <CardContent>
              {cityPerformance.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={cityPerformance.slice(0, 5)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis 
                      dataKey="city" 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false} 
                      angle={-45} 
                      textAnchor="end" 
                      height={80} 
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      itemStyle={{ color: "hsl(var(--popover-foreground))" }}
                      labelStyle={{ color: "hsl(var(--popover-foreground))" }}
                    />
                    <Bar dataKey="hired" fill="#10b981" radius={[8, 8, 0, 0]} name="Hired" />
                    <Bar dataKey="total" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Total" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-[250px] text-muted-foreground">
                  <Building2 className="size-12 mb-4 opacity-50" />
                  <p>No city data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Candidate List - Only show for campaign-specific view */}
        {selectedCampaign !== "all" && (
          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <Award className="size-5 text-amber-500" />
                    Candidates
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">Filter by recruitment stage</CardDescription>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      placeholder="Search candidates..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-muted/50 border-border text-foreground placeholder:text-muted-foreground w-full sm:w-[250px]"
                    />
                  </div>
                  <Select value={sortBy} onValueChange={(v) => setSortBy(v as "score" | "city" | "hr")}>
                    <SelectTrigger className="w-full sm:w-[120px] bg-muted/50 border-border text-foreground">
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
                    className="bg-muted/50 border-border hover:bg-muted"
                  >
                    {sortOrder === "desc" ? "↓" : "↑"}
                  </Button>
                  <Link href={`/exhibitions/campaign/${encodeURIComponent(selectedCampaign)}`}>
                    <Button variant="outline" className="gap-2 bg-muted/50 border-border hover:bg-muted">
                      View Full Campaign
                      <ArrowUpRight className="size-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={candidateStageFilter} onValueChange={setCandidateStageFilter} className="w-full">
                <TabsList className="flex flex-wrap h-auto gap-2 bg-muted/50 p-1 mb-4">
                  <TabsTrigger value="all" className="flex-1 min-w-[100px] data-[state=active]:bg-muted shadow-sm">
                    All ({hrData?.candidatesByStage?.all?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="resume" className="flex-1 min-w-[100px] data-[state=active]:bg-purple-100 dark:data-[state=active]:bg-purple-900/40 data-[state=active]:text-purple-600 dark:data-[state=active]:text-purple-400">
                    Resume ({hrData?.candidatesByStage?.resume_passed?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="call" className="flex-1 min-w-[100px] data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-900/40 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400">
                    Call ({hrData?.candidatesByStage?.call_passed?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="hr" className="flex-1 min-w-[100px] data-[state=active]:bg-emerald-100 dark:data-[state=active]:bg-emerald-900/40 data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400">
                    HR ({hrData?.candidatesByStage?.hr_passed?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="tech" className="flex-1 min-w-[100px] data-[state=active]:bg-amber-100 dark:data-[state=active]:bg-amber-900/40 data-[state=active]:text-amber-600 dark:data-[state=active]:text-amber-400">
                    Tech ({hrData?.candidatesByStage?.tech_passed?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="manager" className="flex-1 min-w-[100px] data-[state=active]:bg-rose-100 dark:data-[state=active]:bg-rose-900/40 data-[state=active]:text-rose-600 dark:data-[state=active]:text-rose-400">
                    Manager ({hrData?.candidatesByStage?.manager_passed?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="rejected" className="flex-1 min-w-[100px] data-[state=active]:bg-red-100 dark:data-[state=active]:bg-red-900/40 data-[state=active]:text-red-600 dark:data-[state=active]:text-red-400">
                    Rejected ({hrData?.candidatesByStage?.rejected?.length || 0})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value={candidateStageFilter} className="mt-0">
                  {filteredCandidates.length > 0 ? (
                    <div className="space-y-2">
                      {filteredCandidates.map((candidate, index) => (
                        <div
                          key={candidate.id || index}
                          className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-all duration-200 group cursor-pointer shadow-sm hover:shadow-md"
                          onClick={() => {
                            router.push(
                              `/exhibitions/campaign/${encodeURIComponent(selectedCampaign)}?candidate=${encodeURIComponent(candidate.id || candidate.email)}`,
                            )
                          }}
                        >
                          <div className="flex items-start gap-4 flex-1 min-w-0">
                            {/* Avatar */}
                            <div className="flex items-center justify-center size-12 rounded-full bg-gradient-to-br from-emerald-500 to-blue-500 font-bold text-lg text-white flex-shrink-0">
                              {candidate.name?.charAt(0).toUpperCase() || "?"}
                            </div>

                            {/* Main Content Area */}
                            <div className="flex-1 min-w-0 grid gap-3">
                              {/* Name Row */}
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-foreground text-lg group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                                  {candidate.name || candidate.email || "Unknown"}
                                </p>
                              </div>

                              {/* Contact Information Grid - Responsive layout */}
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">
                                {candidate.phone && (
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span className="text-muted-foreground">📞</span>
                                    <span className="font-medium hidden md:inline">Phone:</span>
                                    <span>{candidate.phone}</span>
                                  </div>
                                )}
                                {candidate.email && (
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span className="text-muted-foreground">✉️</span>
                                    <span className="font-medium hidden md:inline">Email:</span>
                                    <span className="truncate">{candidate.email}</span>
                                  </div>
                                )}
                                {candidate.city && (
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Building2 className="size-4 text-muted-foreground/50" />
                                    <span className="font-medium hidden md:inline">City:</span>
                                    <span>{candidate.city}</span>
                                  </div>
                                )}
                              </div>

                               {/* Show Resume Summary or Strengths - Hidden on mobile */}
                               {(candidate.resumeSummary || candidate.strengths) && (
                                 <div className="hidden lg:block text-sm text-muted-foreground leading-relaxed">
                                   <span className="text-muted-foreground/60 font-medium whitespace-nowrap">
                                     {candidate.resumeSummary && candidate.resumeSummary.trim() !== "" ? "Summary: " : "Strengths: "}
                                   </span>
                                   <span className="line-clamp-2 ml-1">
                                     {(candidate.resumeSummary && candidate.resumeSummary.trim() !== "" ? candidate.resumeSummary : candidate.strengths || "").slice(0, 200)}
                                     {(candidate.resumeSummary && candidate.resumeSummary.trim() !== "" ? candidate.resumeSummary : candidate.strengths || "").length > 200 && "..."}
                                   </span>
                                 </div>
                               )}

                              {/* HR Assignment - Visible on tablet and larger */}
                              {candidate.hr && (
                                <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                                  <Users className="size-4 text-muted-foreground/50" />
                                  <span className="font-medium">HR:</span>
                                  <span>{candidate.hr}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Score and Badge - Always visible */}
                          <div className="flex items-center gap-4 md:gap-6 flex-shrink-0 ml-4">
                            <div className="text-right">
                              <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                                {candidate.score || 0}
                              </p>
                              <p className="text-xs text-muted-foreground">Score</p>
                            </div>
                            <Badge
                              className={`px-3 md:px-4 py-1 text-xs md:text-sm whitespace-nowrap shadow-sm border transition-colors ${
                                isYes(candidate.managerDecision)
                                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                                  : isNo(candidate.resumeDecision) || isNo(candidate.callDecision) || isNo(candidate.hrDecision) || isNo(candidate.techDecision) || isNo(candidate.managerDecision)
                                    ? "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30"
                                    : isYes(candidate.techDecision)
                                      ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                                      : isYes(candidate.hrDecision)
                                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                                        : isYes(candidate.callDecision)
                                          ? "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30"
                                          : isYes(candidate.resumeDecision)
                                            ? "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30"
                                            : "bg-muted text-muted-foreground border-border"
                               }`}
                            >
                              {isYes(candidate.managerDecision)
                                ? "Manager Passed"
                                : isNo(candidate.resumeDecision) || isNo(candidate.callDecision) || isNo(candidate.hrDecision) || isNo(candidate.techDecision) || isNo(candidate.managerDecision)
                                  ? "Rejected"
                                  : isYes(candidate.techDecision)
                                    ? "Tech Passed"
                                    : isYes(candidate.hrDecision)
                                      ? "HR Passed"
                                      : isYes(candidate.callDecision)
                                        ? "Call Passed"
                                        : isYes(candidate.resumeDecision)
                                          ? "Resume Passed"
                                          : "Pending"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                      <Award className="size-16 mb-4 opacity-50" />
                      <p className="text-lg mb-2">
                        {searchQuery ? "No candidates match your search" : "No candidates in this stage"}
                      </p>
                      <p className="text-sm">
                        {searchQuery
                          ? "Try a different search term"
                          : "Candidates will appear here as they progress through recruitment"}
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* AI Insights */}
        {insights.length > 0 && (
          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <AlertCircle className="size-5 text-emerald-500" />
                AI-Powered Insights
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Data-driven recommendations for your hiring process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {insights.map((insight, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 hover:border-emerald-500/30 transition-all duration-200 group"
                  >
                    <div className="p-2 rounded-lg bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
                      <AlertCircle className="size-4 text-emerald-500" />
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed font-medium">{insight}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
