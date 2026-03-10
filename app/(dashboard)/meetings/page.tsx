"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Video, 
  ChevronRight, 
  Loader2,
  Users,
  Building2,
  ExternalLink
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format, isSameDay, parse, isValid } from "date-fns"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

interface Meeting {
  candidate: Candidate
  type: string
  date: string
  time?: string
  link?: string
  eventId?: string
  meetingType?: string
  color: string
}

interface Candidate {
  id: string
  name: string
  email: string
  phone: string
  city: string
  score: number
  role?: string
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
  hrMeetingType?: string
  techMeetingType?: string
  managerMeetingType?: string
}

interface Campaign {
  CampaignName: string
  IsActive: boolean
}

export default function MeetingsPage() {
  const { toast } = useToast()
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [selectedCampaign, setSelectedCampaign] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [meetingFilter, setMeetingFilter] = useState<string>("all")
  const [isRescheduling, setIsRescheduling] = useState<string | null>(null)
  const [rescheduleData, setRescheduleData] = useState<{
    mtg: Meeting | null;
    date: string;
    time: string;
    isOpen: boolean;
  }>({ mtg: null, date: "", time: "", isOpen: false })

  const openRescheduleDialog = (mtg: Meeting) => {
    let defaultDate = ""
    if (mtg.date) {
      const parsed = parseFlexibleDate(mtg.date)
      if (parsed) {
        defaultDate = format(parsed, "yyyy-MM-dd")
      }
    }
    setRescheduleData({ mtg, date: defaultDate, time: mtg.time || "", isOpen: true })
  }

  const submitReschedule = async () => {
    const { mtg, date, time } = rescheduleData
    if (!mtg) return

    setIsRescheduling(`${mtg.candidate.id}-${mtg.type}`)
    try {
      // Pick only relevant fields for candidateDetails
      const baseCandidate: any = {
        id: mtg.candidate.id,
        name: mtg.candidate.name,
        email: mtg.candidate.email,
        phone: mtg.candidate.phone,
        city: mtg.candidate.city,
        score: mtg.candidate.score,
      }

      const type = mtg.type.toLowerCase()
      if (type.includes("hr")) {
        baseCandidate.hrMeetingDate = mtg.candidate.hrMeetingDate
        baseCandidate.hrMeetingTime = mtg.candidate.hrMeetingTime
        baseCandidate.hrMeetingLink = mtg.candidate.hrMeetingLink
        baseCandidate.hrEventID = mtg.candidate.hrEventID
      } else if (type.includes("tech")) {
        baseCandidate.techMeetingDate = mtg.candidate.techMeetingDate
        baseCandidate.techMeetingTime = mtg.candidate.techMeetingTime
        baseCandidate.techMeetingLink = mtg.candidate.techMeetingLink
        baseCandidate.techEventID = mtg.candidate.techEventID
      } else if (type.includes("manager")) {
        baseCandidate.managerMeetingDate = mtg.candidate.managerMeetingDate
        baseCandidate.managerMeetingTime = mtg.candidate.managerMeetingTime
        baseCandidate.managerMeetingLink = mtg.candidate.managerMeetingLink
        baseCandidate.managerEventID = mtg.candidate.managerEventID
      }

      const payload = {
        action: "Reschedule",
        meetingDetails: {
          type: mtg.type,
          oldDate: mtg.date,
          oldTime: mtg.time,
          newDate: date,
          newTime: time,
          link: mtg.link,
          eventId: mtg.eventId
        },
        candidateDetails: baseCandidate
      }

      const webhookBase = "https://n8n.srv1010832.hstgr.cloud/webhook/fb2e3033-4cb9-4ad5-a4a2-6c96874349b4"
      let queryType = "other"
      if (type.includes("hr")) queryType = "hr"
      else if (type.includes("tech")) queryType = "tech"
      else if (type.includes("manager")) queryType = "manager"

      const userRole = mtg.candidate.role || "Admin"
      const res = await fetch(`${webhookBase}?meetingType=${queryType}&userRole=${encodeURIComponent(userRole)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, userRole })
      })

      if (res.ok) {
        toast({ title: "Reschedule Requested", description: `Sent postpone/prepone request for ${mtg.candidate.name}` })
        setRescheduleData(prev => ({ ...prev, isOpen: false }))
      } else {
        throw new Error("Failed to send webhook")
      }
    } catch (e: any) {
      toast({ title: "Reschedule Failed", description: e.message, variant: "destructive" })
    } finally {
      setIsRescheduling(null)
    }
  }

  const fetchCampaigns = async () => {
    try {
      const response = await fetch("/api/campaigns")
      if (response.ok) {
        const data = await response.json()
        setCampaigns(data.campaigns || [])
      }
    } catch (error) {
      console.error("Error fetching campaigns:", error)
    }
  }

  const normalizeCandidate = (c: any): Candidate => ({
    id: String(c.id || c["Candidate ID"] || c.id_candidate || `cand-${c.row_number || Math.random()}`),
    name: String(c.name || c.Name || c.CandidateName || "Unknown"),
    email: String(c.email || c.Email || c.CandidateEmail || ""),
    phone: String(c.phone || c["Phone Number"] || c.PhoneNumber || ""),
    city: String(c.city || c.City || ""),
    score: Number(c.score || c.Score || c.OverallScore || 0),
    role: String(c.RoleApplied || c.role || c.Role || c.CampaignName || ""),
    
    // HR Round
    hrMeetingDate: c["HR Meeting Date"] || c.HRMeetingDate || c.hrMeetingDate || "",
    hrMeetingTime: c["HR Meeting Time"] || c.HRMeetingTime || c.hrMeetingTime || "",
    hrMeetingLink: c["HR Meeting Link"] || c.HRMeetingLink || c.hrMeetingLink || "",
    hrEventID:     c["HR Event ID"] || c.HREventID || c.hrEventID || "",
    
    // Tech Round
    techMeetingDate: c["Tech Meeting Date"] || c.TechMeetingDate || c.techMeetingDate || "",
    techMeetingTime: c["Tech Meeting Time"] || c.TechMeetingTime || c.techMeetingTime || "",
    techMeetingLink: c["Tech Meeting Link"] || c.TechMeetingLink || c.techMeetingLink || "",
    techEventID:     c["Tech. Event ID"] || c["Tech Event ID"] || c.TechEventID || c.techEventID || "",
    
    // Manager Round
    managerMeetingDate: c["Manager Meeting Date"] || c.ManagerMeetingDate || c.managerMeetingDate || "",
    managerMeetingTime: c["Manager Meeting Time"] || c.ManagerMeetingTime || c.managerMeetingTime || "",
    managerMeetingLink: c["Manager Interview Link"] || c["Manager Meeting Link"] || c.ManagerMeetingLink || c.managerMeetingLink || "",
    managerEventID:     c["Manager Event ID"] || c.ManagerEventID || c.managerEventID || "",
    
    // Meeting Types
    hrMeetingType:      c["HR Meeting Type"] || c.HRMeetingType || c.hrMeetingType || "",
    techMeetingType:    c["Tech Meeting Type"] || c.TechMeetingType || c.techMeetingType || "",
    managerMeetingType: c["Manager Meeting Type"] || c.ManagerMeetingType || c.managerMeetingType || "",
  })

  const fetchCandidates = async (campaignName: string) => {
    setLoading(true)
    try {
      let rawCandidates: any[] = []
      
      if (campaignName === "all") {
        console.log("[Meetings] Mode: All Campaigns - Attempting global fetch...")
        
        // 1. Try global HRAnalytics fetch
        try {
          const res = await fetch("/api/webhook-proxy?action=HRAnalytics", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: "guest@example.com", campaign: undefined }),
          })
          
          if (res.ok) {
            const rawData = await res.json()
            const actualData = (rawData.status === 200 ? rawData.data : rawData) || rawData
            
            if (Array.isArray(actualData)) {
              rawCandidates = actualData.map((item: any) => item?.json || item)
            } else if (actualData && typeof actualData === "object") {
              rawCandidates = actualData.campaignCandidates || actualData.candidates || actualData.data || actualData.items || []
            }
          }
        } catch (e) {
          console.error("[Meetings] HRAnalytics fetch failed:", e)
        }

        // 2. Fallback: If 0 candidates, aggregate from all individual campaigns
        if (rawCandidates.length === 0) {
          console.log("[Meetings] Global fetch returned 0. Retrying via aggregation...")
          
          let campaignList = campaigns
          if (campaignList.length === 0) {
            const res = await fetch("/api/campaigns")
            const data = await res.json()
            campaignList = data.campaigns || []
            setCampaigns(campaignList)
          }

          if (campaignList.length > 0) {
            const aggregateResponses = await Promise.all(
              campaignList.map(async (camp) => {
                try {
                  const res = await fetch("/api/webhook-proxy?action=Certain%20Campaign", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      CampaignName: camp.CampaignName,
                      UserEmail: "guest@example.com"
                    })
                  })
                  if (!res.ok) return []
                  const rawData = await res.json()
                  
                  let extracted: any[] = []
                  if (Array.isArray(rawData)) {
                    if (rawData[0] && rawData[0].data && Array.isArray(rawData[0].data)) {
                      extracted = rawData[0].data.map((i: any) => i.json || i)
                    } else if (rawData[0] && rawData[0].json) {
                      extracted = rawData.map((i: any) => i.json)
                    } else {
                      extracted = rawData
                    }
                  } else if (rawData.data && Array.isArray(rawData.data)) {
                    extracted = rawData.data.map((i: any) => i.json || i)
                  } else if (rawData.candidates && Array.isArray(rawData.candidates)) {
                    extracted = rawData.candidates.map((i: any) => i.json || i)
                  }

                  const finalItems = extracted.map((i: any) => ({
                    ...i,
                    CampaignName: camp.CampaignName
                  }))
                  return finalItems
                } catch (e) { return [] }
              })
            )
            rawCandidates = aggregateResponses.flat()
            console.log(`[Meetings] Aggregated ${rawCandidates.length} candidates from ${campaignList.length} campaigns`)
          }
        }
      } else {
        // Single campaign fetch
        console.log(`[Meetings] Mode: Single Campaign (${campaignName})`)
        const response = await fetch("/api/webhook-proxy?action=Certain%20Campaign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            CampaignName: campaignName,
            UserEmail: "guest@example.com"
          })
        })
        if (response.ok) {
          const rawData = await response.json()
          let extracted: any[] = []
          
          if (Array.isArray(rawData)) {
            if (rawData[0] && rawData[0].data && Array.isArray(rawData[0].data)) {
              extracted = rawData[0].data.map((i: any) => i.json || i)
            } else if (rawData[0] && rawData[0].json) {
              extracted = rawData.map((i: any) => i.json)
            } else {
              extracted = rawData
            }
          } else if (rawData.data && Array.isArray(rawData.data)) {
            extracted = rawData.data.map((i: any) => i.json || i)
          } else if (rawData.candidates && Array.isArray(rawData.candidates)) {
            extracted = rawData.candidates.map((i: any) => i.json || i)
          }

          rawCandidates = extracted.map((i: any) => ({
            ...i,
            CampaignName: campaignName
          }))
        }
      }

      const normalized = rawCandidates.map(normalizeCandidate)
      setCandidates(normalized)
    } catch (error) {
      console.error("Error fetching candidates:", error)
      toast({ title: "Error", description: "Failed to load schedule", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCampaigns()
  }, [])

  useEffect(() => {
    fetchCandidates(selectedCampaign)
  }, [selectedCampaign])

  const allMeetings = useMemo(() => {
    return candidates.flatMap((c) => {
      const meetings: Meeting[] = []
      if (c.hrMeetingDate && c.hrMeetingDate.trim() !== "") {
        meetings.push({ 
          candidate: c, 
          type: "HR Round", 
          date: c.hrMeetingDate, 
          time: c.hrMeetingTime, 
          link: c.hrMeetingLink, 
          eventId: c.hrEventID, 
          meetingType: c.hrMeetingType,
          color: "blue" 
        })
      }
      if (c.techMeetingDate && c.techMeetingDate.trim() !== "") {
        meetings.push({ 
          candidate: c, 
          type: "Tech Interview", 
          date: c.techMeetingDate, 
          time: c.techMeetingTime, 
          link: c.techMeetingLink, 
          eventId: c.techEventID, 
          meetingType: c.techMeetingType,
          color: "amber" 
        })
      }
      if (c.managerMeetingDate && c.managerMeetingDate.trim() !== "") {
        meetings.push({ 
          candidate: c, 
          type: "Manager Interview", 
          date: c.managerMeetingDate, 
          time: c.managerMeetingTime, 
          link: c.managerMeetingLink, 
          eventId: c.managerEventID, 
          meetingType: c.managerMeetingType,
          color: "violet" 
        })
      }
      return meetings
    })
  }, [candidates])

  const parseFlexibleDate = (dateStr: string) => {
    if (!dateStr || typeof dateStr !== "string") return null
    const formats = ["d/M/yyyy", "dd/MM/yyyy", "yyyy-MM-dd", "MM/dd/yyyy", "d-M-yyyy", "dd-MM-yyyy"]
    for (const fmt of formats) {
      try {
        const d = parse(dateStr.trim(), fmt, new Date())
        if (isValid(d)) return d
      } catch (e) {}
    }
    const native = new Date(dateStr)
    return isValid(native) ? native : null
  }

  const getMeetingsForDate = (date: Date) => {
    return allMeetings.filter((m: Meeting) => {
      const meetingDate = parseFlexibleDate(m.date!)
      return meetingDate && isSameDay(meetingDate, date)
    })
  }

  const selectedDayMeetings = selectedDate ? getMeetingsForDate(selectedDate) : []
  const todayMeetings = getMeetingsForDate(new Date()).filter((m: Meeting) => 
    meetingFilter === "all" || m.type.toLowerCase().includes(meetingFilter.toLowerCase())
  )

  const hasMeetingOnDate = (date: Date) => {
    return allMeetings.some((m: Meeting) => {
      const meetingDate = parseFlexibleDate(m.date!)
      return meetingDate && isSameDay(meetingDate, date)
    })
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <section className="relative overflow-hidden rounded-4xl border border-border bg-card p-10 shadow-2xl">
        <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-transparent to-violet-500/10" />
        <div className="absolute -right-20 -top-20 size-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
               <div className="p-2 rounded-xl bg-primary/20 backdrop-blur-md">
                  <CalendarIcon className="size-6 text-primary" />
               </div>
               <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-black tracking-widest uppercase text-[10px]">Management Suite</Badge>
            </div>
            <h1 className="text-5xl font-black tracking-tighter text-foreground lg:text-6xl">
              Interview <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-violet-500">Center</span>
            </h1>
            <p className="text-muted-foreground text-xl font-medium max-w-2xl">
              Synchronize your team, manage candidate sessions, and track recruitment momentum in real-time.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
             <div className="group relative w-full sm:w-[280px]">
                <div className="absolute -inset-0.5 bg-linear-to-r from-primary to-violet-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
                 <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                    <SelectTrigger className="relative w-full h-14 bg-card border-border/50 text-foreground font-bold rounded-xl shadow-inner">
                      <SelectValue placeholder="All Active Campaigns" />
                    </SelectTrigger>
                    <SelectContent className="bg-card/95 backdrop-blur-xl border-border/50">
                      <SelectItem value="all" className="font-bold text-primary">All Campaigns</SelectItem>
                      {campaigns.map(c => (
                        <SelectItem key={c.CampaignName} value={c.CampaignName} className="font-medium">{c.CampaignName}</SelectItem>
                      ))}
                    </SelectContent>
                 </Select>
             </div>
          </div>
        </div>

        {/* Quick Stats Strip */}
        <div className="relative grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 pt-8 border-t border-border/50">
           <div className="space-y-1">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Today's Load</p>
              <p className="text-2xl font-black text-foreground">{todayMeetings.length} <span className="text-sm font-medium text-muted-foreground">Sessions</span></p>
           </div>
           <div className="space-y-1">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Active Candidates</p>
              <p className="text-2xl font-black text-foreground">{candidates.length} <span className="text-sm font-medium text-muted-foreground">Profiles</span></p>
           </div>
           <div className="space-y-1">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Scheduled</p>
              <p className="text-2xl font-black text-foreground">{allMeetings.length} <span className="text-sm font-medium text-muted-foreground">Interviews</span></p>
           </div>
           <div className="space-y-1">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Next Session</p>
              <p className="text-sm font-bold text-primary truncate">
                 {todayMeetings.length > 0 ? todayMeetings[0].time + " with " + todayMeetings[0].candidate.name : "No upcoming today"}
              </p>
           </div>
        </div>
      </section>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-6 bg-card/30 rounded-4xl border border-dashed border-border">
           <div className="relative">
              <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
              <Loader2 className="size-16 animate-spin text-primary relative" />
           </div>
           <div className="text-center space-y-2">
              <p className="text-xl font-black text-foreground uppercase tracking-widest">Retrieving Schedule</p>
              <p className="text-sm text-muted-foreground font-medium">Syncing with recruitment pipelines...</p>
           </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Main Grid: Calendar & Day Detail */}
          <div className="grid gap-8 lg:grid-cols-12">
            {/* Calendar Control */}
            <Card className="lg:col-span-12 overflow-hidden bg-card border-border shadow-2xl rounded-4xl">
               <div className="grid lg:grid-cols-12 min-h-[600px]">
                  {/* Left: Picker */}
                  <div className="lg:col-span-4 p-10 border-r border-border/50 bg-muted/20 flex flex-col items-center justify-center">
                    <div className="space-y-8 w-full max-w-[320px]">
                       <div className="text-center space-y-2">
                          <h2 className="text-2xl font-black text-foreground tracking-tight">Select Date</h2>
                          <p className="text-sm text-muted-foreground font-medium">Browse scheduled sessions by day</p>
                       </div>
                       <div className="p-4 rounded-4xl bg-background border border-border shadow-inner">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            className="mx-auto"
                            modifiers={{ hasMeeting: hasMeetingOnDate }}
                            modifiersClassNames={{
                              hasMeeting: "relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:size-1.5 after:rounded-full after:bg-primary font-black text-primary bg-primary/5 rounded-lg",
                            }}
                          />
                       </div>
                       <div className="space-y-3">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-2">Round Indicators</p>
                          <div className="flex flex-wrap gap-2">
                             <Badge variant="outline" className="bg-blue-500/5 text-blue-500 border-blue-500/20 text-[10px] py-1">HR</Badge>
                             <Badge variant="outline" className="bg-amber-500/5 text-amber-500 border-amber-500/20 text-[10px] py-1">Tech</Badge>
                             <Badge variant="outline" className="bg-violet-500/5 text-violet-500 border-violet-500/20 text-[10px] py-1">Manager</Badge>
                          </div>
                       </div>
                    </div>
                  </div>

                  {/* Right: Selected Day List */}
                  <div className="lg:col-span-8 flex flex-col bg-background/30">
                    <div className="p-10 border-b border-border/50 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-10">
                      <div className="space-y-1">
                        <h3 className="text-3xl font-black text-foreground flex items-center gap-4">
                          <Clock className="size-7 text-primary" />
                          {selectedDate ? format(selectedDate, "MMMM do, yyyy") : "Daily Breakdown"}
                        </h3>
                        <p className="text-sm text-muted-foreground font-medium italic">
                          {selectedDayMeetings.length} interviews scheduled for this date
                        </p>
                      </div>
                      <Badge className="bg-primary hover:bg-primary/90 text-white font-black px-4 py-2 rounded-full shadow-lg shadow-primary/20">
                        {selectedDayMeetings.length} TOTAL
                      </Badge>
                    </div>

                    <div className="flex-1 overflow-y-auto p-10 space-y-6 max-h-[700px] scrollbar-hide">
                      {selectedDayMeetings.length > 0 ? (
                        <div className="grid gap-6 md:grid-cols-2">
                          {selectedDayMeetings.map((mtg: Meeting, idx: number) => (
                            <div 
                              key={idx}
                              className={cn(
                                "group relative overflow-hidden p-6 rounded-3xl border transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl",
                                mtg.color === "blue" ? "bg-blue-500/5 border-blue-500/20 hover:border-blue-500/50 hover:bg-blue-500/10" :
                                mtg.color === "amber" ? "bg-amber-500/5 border-amber-500/20 hover:border-amber-500/50 hover:bg-amber-500/10" :
                                "bg-violet-500/5 border-violet-500/20 hover:border-violet-500/50 hover:bg-violet-500/10"
                              )}
                            >
                              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <div className={cn("size-2 rounded-full animate-ping", 
                                    mtg.color === "blue" ? "bg-blue-500" : mtg.color === "amber" ? "bg-amber-500" : "bg-violet-500"
                                 )} />
                              </div>

                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <Badge className={cn(
                                    "text-[10px] uppercase font-black px-2.5 h-6 tracking-tighter border-none",
                                    mtg.color === "blue" ? "bg-blue-500 text-white" :
                                    mtg.color === "amber" ? "bg-amber-500 text-white" :
                                    "bg-violet-500 text-white"
                                  )}>
                                    {mtg.type}
                                  </Badge>
                                  <span className="text-xl font-black text-foreground tabular-nums group-hover:scale-110 transition-transform">{mtg.time}</span>
                                </div>

                                <div className="space-y-1">
                                  <h4 className="text-2xl font-black text-foreground truncate leading-tight">
                                    {mtg.candidate.name}
                                  </h4>
                                  <p className="text-xs font-bold text-muted-foreground flex items-center gap-2">
                                     <Users className="size-3" />
                                     {mtg.candidate.email}
                                  </p>
                                </div>

                                <div className="pt-4 flex items-center justify-between border-t border-border/30">
                                   <div className="flex flex-col">
                                      <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">Meeting Type</span>
                                      <span className="text-[11px] font-bold text-foreground">
                                         {mtg.meetingType || (mtg.link ? "Online Meeting" : "Not Specified")}
                                       </span>
                                       {mtg.eventId && <span className="text-[10px] text-muted-foreground/40 font-mono truncate max-w-[120px]">{mtg.eventId}</span>}
                                    </div>
                                   <div className="flex items-center gap-2">
                                       <Button
                                         variant="outline"
                                         className="h-12 px-4 rounded-xl font-black text-xs gap-2 transition-all hover:bg-orange-500/10 hover:text-orange-500 border-border/50"
                                         onClick={() => openRescheduleDialog(mtg)}
                                         disabled={isRescheduling === `${mtg.candidate.id}-${mtg.type}`}
                                         title="Postpone / Prepone Meeting"
                                       >
                                         {isRescheduling === `${mtg.candidate.id}-${mtg.type}` ? (
                                            <Loader2 className="size-4 animate-spin" />
                                         ) : (
                                            <Clock className="size-4" />
                                         )}
                                         <span className="hidden sm:inline">RESCHEDULE</span>
                                       </Button>
                                       {mtg.link && (
                                          <Button className={cn(
                                          "h-12 px-6 rounded-xl font-black text-xs gap-3 shadow-lg shadow-current/10 transition-all",
                                          mtg.color === "blue" ? "bg-blue-600 hover:bg-blue-700 text-white" :
                                          mtg.color === "amber" ? "bg-amber-600 hover:bg-amber-700 text-white" :
                                          "bg-violet-600 hover:bg-violet-700 text-white"
                                        )}
                                        onClick={() => window.open(mtg.link, "_blank")}
                                      >
                                        <Video className="size-4" />
                                        JOIN NOW
                                       </Button>
                                    )}
                                    </div>
                                 </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-20 space-y-6">
                          <div className="relative">
                             <div className="absolute inset-0 bg-muted/40 blur-3xl rounded-full" />
                             <CalendarIcon className="size-24 text-muted-foreground/20 relative" />
                          </div>
                          <div className="space-y-2">
                            <p className="text-2xl font-black text-muted-foreground/60">No Engagements Today</p>
                            <p className="text-sm text-muted-foreground/40 max-w-xs mx-auto">This date is currently open for strategic planning or administrative tasks.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
               </div>
            </Card>
          </div>

          {/* BELOW SECTION: Today's Full-Width Filterable List */}
          <div className="space-y-6">
             <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 px-2">
                <div className="flex items-center gap-4">
                   <div className="relative">
                      <div className="absolute inset-0 bg-red-500 blur-md rounded-full animate-pulse opacity-20" />
                      <div className="size-4 rounded-full bg-red-500 border-4 border-background relative" />
                   </div>
                   <h2 className="text-3xl font-black tracking-tight text-foreground">Live <span className="text-muted-foreground font-medium">Daily Track</span></h2>
                </div>
                
                <div className="flex items-center gap-2 p-1 bg-muted/50 rounded-2xl border border-border/50">
                  {["all", "hr", "tech", "manager"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setMeetingFilter(f)}
                      className={cn(
                        "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                        meetingFilter === f 
                          ? "bg-primary text-white shadow-lg shadow-primary/20" 
                          : "text-muted-foreground hover:bg-background hover:text-foreground"
                      )}
                    >
                      {f}
                    </button>
                  ))}
                </div>
             </div>

             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {todayMeetings.length > 0 ? (
                  todayMeetings.map((mtg: Meeting, idx: number) => (
                    <Card key={idx} className="group overflow-hidden bg-card/40 border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5">
                       <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                             <div>
                                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">{mtg.time}</p>
                                <h4 className="font-bold text-foreground text-lg truncate group-hover:text-primary transition-colors">{mtg.candidate.name}</h4>
                             </div>
                             <div className="flex items-center gap-1">
                                 <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="size-10 p-0 rounded-full hover:bg-orange-500/10 hover:text-orange-500"
                                    onClick={() => openRescheduleDialog(mtg)}
                                    disabled={isRescheduling === `${mtg.candidate.id}-${mtg.type}`}
                                    title="Postpone / Prepone Meeting"
                                 >
                                    {isRescheduling === `${mtg.candidate.id}-${mtg.type}` ? (
                                       <Loader2 className="size-5 animate-spin" />
                                    ) : (
                                       <Clock className="size-5" />
                                    )}
                                 </Button>
                                 {mtg.link && (
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="size-10 p-0 rounded-full hover:bg-primary/10 hover:text-primary"
                                  onClick={() => window.open(mtg.link, "_blank")}
                                >
                                  <Video className="size-5" />
                                    </Button>
                                 )}
                              </div>
                           </div>
                          <div className="flex items-center gap-2">
                             <Badge variant="secondary" className="text-[9px] font-black px-1.5 h-4 tracking-tighter uppercase">{mtg.type}</Badge>
                             <span className="text-[10px] font-medium text-muted-foreground italic truncate">
                                {mtg.meetingType || (mtg.link ? "Online Meeting" : "Not Specified")}
                             </span>
                          </div>
                       </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-muted/10 rounded-[2.5rem] border-2 border-dashed border-border/50">
                    <Loader2 className="size-10 mb-4 animate-spin-slow opacity-10" />
                    <p className="text-sm font-black text-muted-foreground/30 uppercase tracking-[0.3em]">No Active Sessions Today</p>
                  </div>
                )}
             </div>
          </div>
        </div>
      )}

      <Dialog open={rescheduleData.isOpen} onOpenChange={(open) => setRescheduleData(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent className="sm:max-w-md bg-card border-border/50">
          <DialogHeader>
            <DialogTitle>Reschedule Meeting</DialogTitle>
            <DialogDescription>
              Select a new date and time for {rescheduleData.mtg?.candidate.name}'s {rescheduleData.mtg?.type}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reschedule-date">New Date</Label>
              <Input
                id="reschedule-date"
                type="date"
                className="col-span-3 border-border/50 bg-background"
                value={rescheduleData.date}
                onChange={(e) => setRescheduleData(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="reschedule-time">New Time</Label>
              <Input
                id="reschedule-time"
                type="time"
                className="col-span-3 border-border/50 bg-background"
                value={rescheduleData.time}
                onChange={(e) => setRescheduleData(prev => ({ ...prev, time: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setRescheduleData(prev => ({ ...prev, isOpen: false }))}
            >
              Cancel
            </Button>
            <Button
              onClick={submitReschedule}
              disabled={!rescheduleData.date || !rescheduleData.time || isRescheduling !== null}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              {isRescheduling !== null && <Loader2 className="mr-2 size-4 animate-spin" />}
              Confirm Reschedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
