"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, CalendarIcon, CheckCircle2 } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/auth-context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const WEBHOOK_URL = "https://n8n.srv1010832.hstgr.cloud/webhook/ff7710c6-14c7-4cae-a24c-6c53e5f09497"

interface CreateCampaignFormProps {
  onSuccess?: () => void
}

interface Interviewer {
  name: string
  email: string
  type: string
  calendarLink: string
}

export function CreateCampaignForm({ onSuccess }: CreateCampaignFormProps) {
  // ── State ────────────────────────────────────────────────────────────────
  const { user } = useAuth()
  const userEmail = user?.email || "guest@example.com"

  const [campaignName, setCampaignName] = useState("")
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [isActive, setIsActive] = useState(false)
  const [description, setDescription] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [locationVal, setLocationVal] = useState("")
  const [expectedAttendees, setExpectedAttendees] = useState("")
  const [minSalary, setMinSalary] = useState("")
  const [maxSalary, setMaxSalary] = useState("")
  const [joiningDate, setJoiningDate] = useState<Date | undefined>(undefined)
  const [numberOfRounds, setNumberOfRounds] = useState<number>(1)
  const [pocEmails, setPocEmails] = useState<string[]>([""])
  const [pocCalendarLinks, setPocCalendarLinks] = useState<string[]>([""])
  const [skillsWeight, setSkillsWeight] = useState(25)
  const [experienceWeight, setExperienceWeight] = useState(25)
  const [educationWeight, setEducationWeight] = useState(25)
  const [alignmentWeight, setAlignmentWeight] = useState(25)
  const [optimizedHiring, setOptimizedHiring] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [interviewers, setInterviewers] = useState<Interviewer[]>([])
  const [loadingInterviewers, setLoadingInterviewers] = useState(false)

  // ── Effects ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchInterviewers = async () => {
      setLoadingInterviewers(true)
      try {
        const response = await fetch("/api/webhook-proxy?action=InterviewerListing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "InterviewerListing" })
        })
        if (response.ok) {
          const data = await response.json()
          let rawRows: any[] = []
          if (Array.isArray(data)) rawRows = data
          else if (data.data && Array.isArray(data.data)) rawRows = data.data
          else if (data.interviewers && Array.isArray(data.interviewers)) rawRows = data.interviewers
          
          const extracted: Interviewer[] = rawRows.map((row: any) => {
            const item = row.json || row
            return {
              name: String(item.Name || item.name || "Unknown"),
              email: String(item.Email || item.email || ""),
              type: String(item.Interviewer || item.type || ""),
              calendarLink: String(item["Calendar Link"] || item.calendarLink || item.calendar_link || ""),
            }
          })
          setInterviewers(extracted)
        }
      } catch (error) {
        console.error("[CreateCampaignForm] Error fetching interviewers:", error)
      } finally {
        setLoadingInterviewers(false)
      }
    }
    fetchInterviewers()
  }, [])

  // ── Helpers ───────────────────────────────────────────────────────────────
  const handleNumberOfRoundsChange = (value: string) => {
    let num = Number.parseInt(value, 10)
    if (isNaN(num) || num < 1) {
      setNumberOfRounds(1)
      setPocEmails([""])
      setPocCalendarLinks([""])
      return
    }
    if (num > 3) num = 3
    setNumberOfRounds(num)
    const nextEmails = Array(num).fill("") as string[]
    const nextLinks = Array(num).fill("") as string[]
    for (let i = 0; i < Math.min(pocEmails.length, num); i++) {
      nextEmails[i] = pocEmails[i]
      nextLinks[i] = pocCalendarLinks[i] || ""
    }
    setPocEmails(nextEmails)
    setPocCalendarLinks(nextLinks)
  }

  const handlePocEmailChange = (index: number, value: string) => {
    const next = [...pocEmails]
    next[index] = value
    setPocEmails(next)
  }

  const handlePocCalendarLinkChange = (index: number, value: string) => {
    const next = [...pocCalendarLinks]
    next[index] = value
    setPocCalendarLinks(next)
  }

  const handleInterviewerSelect = (index: number, interviewerName: string) => {
    const selected = interviewers.find(i => i.name === interviewerName)
    if (selected) {
      handlePocEmailChange(index, selected.email)
      handlePocCalendarLinkChange(index, selected.calendarLink)
    }
  }

  const areAllPocEmailsValid = () => {
    if (pocEmails.length !== numberOfRounds) return false
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return pocEmails.every((e) => e.trim() !== "" && re.test(e.trim()))
  }

  const resetForm = () => {
    setCampaignName("")
    setStartDate(undefined)
    setEndDate(undefined)
    setIsActive(false)
    setDescription("")
    setJobDescription("")
    setLocationVal("")
    setExpectedAttendees("")
    setMinSalary("")
    setMaxSalary("")
    setJoiningDate(undefined)
    setNumberOfRounds(1)
    setPocEmails([""])
    setPocCalendarLinks([""])
    setOptimizedHiring(true)
    setSkillsWeight(25)
    setExperienceWeight(25)
    setEducationWeight(25)
    setAlignmentWeight(25)
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!campaignName.trim())    { toast.error("Campaign Name is required"); return }
    if (!jobDescription.trim()) { toast.error("Job Description is required"); return }
    if (!startDate)            { toast.error("Please select a Start Date"); return }
    if (!endDate)              { toast.error("Please select an End Date"); return }
    if (!locationVal.trim())    { toast.error("Location is required"); return }
    if (!expectedAttendees.trim()) { toast.error("Expected Candidates count is required"); return }
    if (numberOfRounds < 1)   { toast.error("Number of Rounds must be at least 1"); return }
    if (!areAllPocEmailsValid()) {
      toast.error(`Please enter valid email(s) for all ${numberOfRounds} POC round(s)`)
      return
    }

    setIsSubmitting(true)

    try {
      // Check if campaign already exists
      const checkResponse = await fetch("/api/webhook-proxy?action=Campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ UserEmail: userEmail })
      })
      
      if (checkResponse.ok) {
        const text = await checkResponse.text()
        let data: any = []
        if (text && text.trim() !== "") {
          try { data = JSON.parse(text) } catch (e) { }
        }
        
        let existingCampaigns: any[] = []
        if (Array.isArray(data)) {
          existingCampaigns = data
        } else if (data.data && Array.isArray(data.data)) {
          existingCampaigns = data.data.map((item: any) => item.json || item)
        } else if (data.campaigns && Array.isArray(data.campaigns)) {
          existingCampaigns = data.campaigns
        }
        
        const exists = existingCampaigns.some((c: any) => 
          String(c.CampaignName || "").toLowerCase() === campaignName.trim().toLowerCase()
        )
        
        if (exists) {
          toast.error(`A campaign named "${campaignName.trim()}" already exists.`, {
            description: "Please choose a different name."
          })
          setIsSubmitting(false)
          return
        }
      }
    } catch (err) {
      console.error("[Campaign] Failed to check existing campaigns:", err)
    }

    const payload: Record<string, unknown> = {
      UserEmail: userEmail,
      CampaignName: campaignName.trim(),
      CreationDate: new Date().toISOString(),
      CampaignStartDate: format(startDate, "yyyy-MM-dd"),
      CampaignEndDate: format(endDate, "yyyy-MM-dd"),
      NumberOfRounds: numberOfRounds,
      IsActive: isActive,
    }

    // Add POC emails and calendar links as separate keys for each round
    pocEmails.forEach((email, index) => {
      payload[`POC_Round_${index + 1}`] = email.trim()
      if (pocCalendarLinks[index]?.trim()) {
        payload[`POC_Calendar_Round_${index + 1}`] = pocCalendarLinks[index].trim()
      }
    })
    if (description.trim()) payload.Description = description.trim()
    if (jobDescription.trim()) payload.JobDescription = jobDescription.trim()
    if (locationVal.trim()) payload.Location = locationVal.trim()
    if (expectedAttendees)  payload.ExpectedAttendees = Number.parseInt(expectedAttendees, 10) || 0
    if (minSalary) payload.MinSalary = Number.parseFloat(minSalary)
    if (maxSalary) payload.MaxSalary = Number.parseFloat(maxSalary)
    if (joiningDate) payload.JoiningDate = format(joiningDate, "yyyy-MM-dd")
    
    payload.OptimizedHiring = optimizedHiring
    payload.SkillsMatchWeight = skillsWeight
    payload.ExperienceRelevanceWeight = experienceWeight
    payload.EducationRelevanceWeight = educationWeight
    payload.JDAlignmentWeight = alignmentWeight

    console.log("[Campaign] Sending to webhook:", payload)

    try {
      const res = await fetch(`/api/webhook-proxy?action=CampaignCreation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        resetForm()
        setShowSuccessDialog(true)
      } else {
        let msg = "Failed to create campaign. Please try again."
        try { const d = await res.json(); msg = d.message || d.error || msg } catch { /* ignore */ }
        toast.error(msg)
      }
    } catch {
      toast.error("Network error — please check your connection and try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── UI ────────────────────────────────────────────────────────────────────
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <>
    <Card className="border-border bg-card/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold tracking-tight">Create a New Campaign</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Campaign Name */}
          <div className="space-y-2">
            <Label htmlFor="campaignName" className="text-sm font-medium">Campaign Name *</Label>
            <Input
              id="campaignName"
              placeholder="e.g., Q4 Tech Hiring Campaign"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              required
              disabled={isSubmitting}
              className="bg-background/50"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Describe your campaign objectives, target roles, and key requirements..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
              rows={3}
              className="resize-none bg-background/50"
            />
            <p className="text-[10px] text-muted-foreground ml-1">This description will be displayed on the campaign card</p>
          </div>

          {/* Job Description */}
          <div className="space-y-2">
            <Label htmlFor="jobDescription" className="text-sm font-medium">Job Description *</Label>
            <Textarea
              id="jobDescription"
              placeholder="Enter the full job description — responsibilities, qualifications, skills required..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              disabled={isSubmitting}
              rows={5}
              className="resize-none bg-background/50 font-mono text-xs leading-relaxed"
              required
            />
            <p className="text-[10px] text-muted-foreground ml-1">Detailed JD sent along with the campaign to candidates and recruiters</p>
          </div>

          {/* Dates */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Start Date */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Start Date *</Label>
              <Popover>
                <PopoverTrigger
                  className={cn(
                    "flex h-9 w-full items-center justify-start rounded-md border border-input bg-background/50 px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                    !startDate && "text-muted-foreground"
                  )}
                  disabled={isSubmitting}
                  type="button"
                >
                  <CalendarIcon className="mr-2 size-4 shrink-0" />
                  {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    disabled={(d) => d < today}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">End Date *</Label>
              <Popover>
                <PopoverTrigger
                  className={cn(
                    "flex h-9 w-full items-center justify-start rounded-md border border-input bg-background/50 px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                    !endDate && "text-muted-foreground"
                  )}
                  disabled={isSubmitting}
                  type="button"
                >
                  <CalendarIcon className="mr-2 size-4 shrink-0" />
                  {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    disabled={(d) => d < (startDate ?? today)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Location + Expected Attendees */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-medium">Location *</Label>
              <Input
                id="location"
                placeholder="e.g., Remote / Bangalore Office"
                value={locationVal}
                onChange={(e) => setLocationVal(e.target.value)}
                disabled={isSubmitting}
                className="bg-background/50"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expectedAttendees" className="text-sm font-medium">Expected Candidates *</Label>
              <Input
                id="expectedAttendees"
                type="number"
                placeholder="e.g., 100"
                value={expectedAttendees}
                onChange={(e) => setExpectedAttendees(e.target.value)}
                disabled={isSubmitting}
                min="0"
                className="bg-background/50"
                required
              />
            </div>
          </div>

          {/* Salary and Joining Date */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Salary Range (LPA Annually) (Optional)</Label>
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  placeholder="Min (e.g. 4)"
                  value={minSalary}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val.length <= 2) setMinSalary(val);
                  }}
                  disabled={isSubmitting}
                  className="bg-background/50"
                  min="0"
                  max="99"
                />
                <span className="text-muted-foreground">-</span>
                <Input
                  type="number"
                  placeholder="Max (e.g. 6)"
                  value={maxSalary}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val.length <= 2) setMaxSalary(val);
                  }}
                  disabled={isSubmitting}
                  className="bg-background/50"
                  min="0"
                  max="99"
                />
              </div>
            </div>

            {/* Joining Date */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Expected Joining Date (Optional)</Label>
              <Popover>
                <PopoverTrigger
                  className={cn(
                    "flex h-9 w-full items-center justify-start rounded-md border border-input bg-background/50 px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                    !joiningDate && "text-muted-foreground"
                  )}
                  disabled={isSubmitting}
                  type="button"
                >
                  <CalendarIcon className="mr-2 size-4 shrink-0" />
                  {joiningDate ? format(joiningDate, "PPP") : <span>Pick a date</span>}
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={joiningDate}
                    onSelect={setJoiningDate}
                    disabled={(d) => d < today}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Number of Rounds */}
          <div className="space-y-2">
            <Label htmlFor="numberOfRounds" className="text-sm font-medium">Number of Rounds *</Label>
            <Input
              id="numberOfRounds"
              type="number"
              value={numberOfRounds}
              onChange={(e) => handleNumberOfRoundsChange(e.target.value)}
              disabled={isSubmitting}
              min="1"
              max="3"
              className="bg-background/50 w-32"
            />
            <p className="text-[10px] text-muted-foreground ml-1">Specify the number of interview rounds for this campaign</p>
          </div>

          {/* POC Emails & Calendar Links */}
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide">PERSON OF CONTACT (POC) *</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Provide email addresses and optional calendar links for the point of contact for each round</p>
            </div>
            {Array.from({ length: numberOfRounds }).map((_, i) => (
              <div key={i} className="space-y-3 p-4 border border-border/50 rounded-lg bg-background/30 relative">
                <div className="absolute top-0 left-0 w-1 h-full bg-violet-500 rounded-l-lg opacity-50"></div>
                <p className="text-xs font-semibold text-violet-400 uppercase tracking-widest pl-2">Round {i + 1}</p>
                <div className="grid gap-4 md:grid-cols-3 pl-2">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Select Interviewer</Label>
                    <Select 
                      onValueChange={(val) => handleInterviewerSelect(i, val)}
                      disabled={isSubmitting || loadingInterviewers}
                    >
                      <SelectTrigger className="bg-background/50 h-9">
                        <SelectValue placeholder={loadingInterviewers ? "Loading..." : "Choose interviewer"} />
                      </SelectTrigger>
                      <SelectContent>
                        {interviewers.map((int, idx) => (
                          <SelectItem key={idx} value={int.name}>
                            {int.name} ({int.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor={`poc-email-${i}`} className="text-sm font-medium">Email *</Label>
                    <Input
                      id={`poc-email-${i}`}
                      type="email"
                      placeholder="e.g., hr.manager@company.com"
                      value={pocEmails[i] ?? ""}
                      onChange={(e) => handlePocEmailChange(i, e.target.value)}
                      disabled={isSubmitting}
                      className="bg-background/50 h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor={`poc-calendar-${i}`} className="text-sm font-medium">Calendar Link (Optional)</Label>
                    <Input
                      id={`poc-calendar-${i}`}
                      type="url"
                      placeholder="e.g., https://calendly.com/..."
                      value={pocCalendarLinks[i] ?? ""}
                      onChange={(e) => handlePocCalendarLinkChange(i, e.target.value)}
                      disabled={isSubmitting}
                      className="bg-background/50 h-9"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Evaluation Weights Section */}
          <div className="space-y-4 rounded-xl border border-border/50 p-4 bg-background/30">
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-violet-500" />
              <Label className="text-sm font-semibold uppercase tracking-wide">Candidate Evaluation Weights (%)</Label>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="skills-weight" className="text-xs text-muted-foreground">Skills Match</Label>
                <div className="relative">
                  <Input
                    id="skills-weight"
                    type="number"
                    min="0"
                    max="100"
                    value={skillsWeight}
                    onChange={(e) => setSkillsWeight(Number(e.target.value))}
                    className="bg-background/50 h-9 pr-7"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">%</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience-weight" className="text-xs text-muted-foreground">Experience Relevance</Label>
                <div className="relative">
                  <Input
                    id="experience-weight"
                    type="number"
                    min="0"
                    max="100"
                    value={experienceWeight}
                    onChange={(e) => setExperienceWeight(Number(e.target.value))}
                    className="bg-background/50 h-9 pr-7"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">%</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="education-weight" className="text-xs text-muted-foreground">Education Relevance</Label>
                <div className="relative">
                  <Input
                    id="education-weight"
                    type="number"
                    min="0"
                    max="100"
                    value={educationWeight}
                    onChange={(e) => setEducationWeight(Number(e.target.value))}
                    className="bg-background/50 h-9 pr-7"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">%</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="alignment-weight" className="text-xs text-muted-foreground">JD Alignment</Label>
                <div className="relative">
                  <Input
                    id="alignment-weight"
                    type="number"
                    min="0"
                    max="100"
                    value={alignmentWeight}
                    onChange={(e) => setAlignmentWeight(Number(e.target.value))}
                    className="bg-background/50 h-9 pr-7"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">%</span>
                </div>
              </div>
            </div>
            
            {(skillsWeight + experienceWeight + educationWeight + alignmentWeight) !== 100 && (
              <p className="text-[10px] text-amber-500 font-medium">
                Note: Total weight is {skillsWeight + experienceWeight + educationWeight + alignmentWeight}%. Aim for 100% for balanced scoring.
              </p>
            )}
          </div>

          {/* Optimized Hiring toggle */}
          <div className="flex items-center justify-between rounded-lg border border-border/50 p-4">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">Optimized Hiring</p>
              <p className="text-[10px] text-muted-foreground">
                When turned on, the candidate will directly move to call round
              </p>
            </div>
            <Switch id="optimizedHiring" checked={optimizedHiring} onCheckedChange={setOptimizedHiring} disabled={isSubmitting} />
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between rounded-lg border border-border/50 p-4">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">Set as Active Campaign</p>
              <p className="text-[10px] text-muted-foreground">
                When enabled, this campaign will be set as active and all other campaigns will be deactivated
              </p>
            </div>
            <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} disabled={isSubmitting} />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl shadow-lg transition-all active:scale-[0.99]"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-5 animate-spin mr-2" />
                Creating Campaign...
              </>
            ) : (
              "Create Campaign"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>

    {/* Success Dialog */}
    <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="items-center text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-emerald-500/10">
            <CheckCircle2 className="size-8 text-emerald-500" />
          </div>
          <DialogTitle className="text-xl">Campaign Created!</DialogTitle>
          <DialogDescription className="text-center">
            Your campaign has been successfully created and sent to the system for processing.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center pt-2">
          <Button
            onClick={() => {
              setShowSuccessDialog(false)
              onSuccess?.()
            }}
            className="w-full sm:w-auto bg-violet-600 hover:bg-violet-700 text-white font-semibold px-8"
          >
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  )
}
