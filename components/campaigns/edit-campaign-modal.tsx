"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"
import toast from "react-hot-toast"
import { cn } from "@/lib/utils"
// Removed Clerk import


interface Campaign {
  CampaignName: string
  UserEmail: string
  CampaignStartDate: string
  CampaignEndDate: string
  IsActive: boolean
  Description?: string
  Location?: string
  ExpectedAttendees?: string | number
  SkillsMatchWeight?: number
  ExperienceRelevanceWeight?: number
  EducationRelevanceWeight?: number
  JDAlignmentWeight?: number
}

interface EditCampaignModalProps {
  campaign: Campaign
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function EditCampaignModal({ campaign, open, onOpenChange, onSuccess }: EditCampaignModalProps) {
  const [campaignName, setCampaignName] = useState<string>(campaign.CampaignName || "")
  const [userEmail] = useState("guest@example.com")


  // Initial values (for change tracking)
  const [initialValues, setInitialValues] = useState<Campaign>(campaign)

  // Current form values
  const [startDate, setStartDate] = useState<Date | undefined>(
    campaign.CampaignStartDate ? new Date(campaign.CampaignStartDate) : undefined,
  )
  const [endDate, setEndDate] = useState<Date | undefined>(
    campaign.CampaignEndDate ? new Date(campaign.CampaignEndDate) : undefined,
  )
  const [isActive, setIsActive] = useState(campaign.IsActive || false)
  const [description, setDescription] = useState(campaign.Description || "")
  const [location, setLocation] = useState(campaign.Location || "")
  const [expectedAttendees, setExpectedAttendees] = useState(
    campaign.ExpectedAttendees ? String(campaign.ExpectedAttendees) : "",
  )
  const [skillsWeight, setSkillsWeight] = useState<number>(Number(campaign.SkillsMatchWeight) || 25)
  const [experienceWeight, setExperienceWeight] = useState<number>(Number(campaign.ExperienceRelevanceWeight) || 25)
  const [educationWeight, setEducationWeight] = useState<number>(Number(campaign.EducationRelevanceWeight) || 25)
  const [alignmentWeight, setAlignmentWeight] = useState<number>(Number(campaign.JDAlignmentWeight) || 25)

  const [isSubmitting, setIsSubmitting] = useState(false)

  // Update initial values when campaign prop changes
  useEffect(() => {
    console.log("[v0] Campaign prop received:", campaign)
    console.log("[v0] Campaign name from prop:", campaign.CampaignName)
    setCampaignName(campaign.CampaignName || "")
    setInitialValues(campaign)
    setStartDate(campaign.CampaignStartDate ? new Date(campaign.CampaignStartDate) : undefined)
    setEndDate(campaign.CampaignEndDate ? new Date(campaign.CampaignEndDate) : undefined)
    setIsActive(campaign.IsActive || false)
    setDescription(campaign.Description || "")
    setLocation(campaign.Location || "")
    setExpectedAttendees(campaign.ExpectedAttendees ? String(campaign.ExpectedAttendees) : "")
    setSkillsWeight(Number(campaign.SkillsMatchWeight) || 25)
    setExperienceWeight(Number(campaign.ExperienceRelevanceWeight) || 25)
    setEducationWeight(Number(campaign.EducationRelevanceWeight) || 25)
    setAlignmentWeight(Number(campaign.JDAlignmentWeight) || 25)
  }, [campaign])

  // Track changes - only include fields that have been modified
  const getChangedFields = () => {
    const updates: Record<string, any> = {}

    // Compare dates
    const initialStartDate = initialValues.CampaignStartDate
      ? new Date(initialValues.CampaignStartDate).toISOString().split("T")[0]
      : ""
    const currentStartDate = startDate ? format(startDate, "yyyy-MM-dd") : ""
    if (currentStartDate !== initialStartDate) {
      updates.CampaignStartDate = currentStartDate
    }

    const initialEndDate = initialValues.CampaignEndDate
      ? new Date(initialValues.CampaignEndDate).toISOString().split("T")[0]
      : ""
    const currentEndDate = endDate ? format(endDate, "yyyy-MM-dd") : ""
    if (currentEndDate !== initialEndDate) {
      updates.CampaignEndDate = currentEndDate
    }

    // Compare IsActive
    if (isActive !== initialValues.IsActive) {
      updates.IsActive = isActive
    }

    // Compare Description
    const initialDescription = initialValues.Description || ""
    if (description !== initialDescription) {
      updates.Description = description
    }

    // Compare Location
    const initialLocation = initialValues.Location || ""
    if (location !== initialLocation) {
      updates.Location = location
    }

    // Compare ExpectedAttendees
    const initialAttendees = initialValues.ExpectedAttendees ? String(initialValues.ExpectedAttendees) : ""
    if (expectedAttendees !== initialAttendees) {
      updates.ExpectedAttendees = expectedAttendees
    }

    // Compare Weights
    if (skillsWeight !== Number(initialValues.SkillsMatchWeight)) updates.SkillsMatchWeight = skillsWeight
    if (experienceWeight !== Number(initialValues.ExperienceRelevanceWeight)) updates.ExperienceRelevanceWeight = experienceWeight
    if (educationWeight !== Number(initialValues.EducationRelevanceWeight)) updates.EducationRelevanceWeight = educationWeight
    if (alignmentWeight !== Number(initialValues.JDAlignmentWeight)) updates.JDAlignmentWeight = alignmentWeight

    return updates
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!campaignName) {
      toast.error("Campaign name is missing. Please close and reopen the modal.")
      console.error("[v0] Campaign name is undefined:", { campaign, campaignName })
      return
    }

    // userEmail is now a constant state

    if (!userEmail) {
      toast.error("User email not found. Please sign in again.")
      return
    }

    setIsSubmitting(true)

    try {
      const updates = getChangedFields()

      // If no changes, show message and return
      if (Object.keys(updates).length === 0) {
        toast("No changes detected", {
          icon: "ℹ️",
        })
        setIsSubmitting(false)
        return
      }

      console.log("[v0] Updating campaign with changes:", updates)
      console.log("[v0] Campaign name:", campaignName)
      console.log("[v0] User email:", userEmail)

      const webhookUrl = "https://n8n.srv1010832.hstgr.cloud/webhook/HRcampaigns"

      const requestBody = {
        UserEmail: userEmail,
        CampaignName: campaignName,
        ...updates,
      }

      console.log("[v0] Full request body:", JSON.stringify(requestBody))

      const response = await fetch("/api/webhook-proxy?action=EditCampaign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      console.log("[v0] API response status:", response.status)

      let data: any
      const contentType = response.headers.get("content-type")

      if (contentType && contentType.includes("application/json")) {
        data = await response.json()
        console.log("[v0] API response data:", data)
      } else {
        const responseText = await response.text()
        console.error("[v0] API returned non-JSON response:", responseText.substring(0, 200))
        toast.error("An unexpected error occurred. Please try again.")
        setIsSubmitting(false)
        return
      }

      if (response.ok && data.success) {
        toast.success("Campaign updated successfully")
        onOpenChange(false)
        if (onSuccess) {
          onSuccess()
        }
      } else {
        const errorMessage = data.error || "Failed to update campaign. Please try again."
        toast.error(errorMessage)
      }
    } catch (error: any) {
      console.error("[v0] Error updating campaign:", error)
      toast.error(error.message || "An unexpected error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Edit Campaign</DialogTitle>
          <DialogDescription>Update campaign details. Only modified fields will be saved.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Non-editable fields */}
          <div className="space-y-4 rounded-lg border border-border p-4 bg-muted/30">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Campaign Name</Label>
              <p className="text-base font-semibold">{campaignName || "Unknown Campaign"}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">User Email</Label>
              <p className="text-base">{campaign.UserEmail}</p>
            </div>
          </div>

          {/* Editable fields */}
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Start Date */}
              <div className="space-y-2">
                <Label htmlFor="startDate">Campaign Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground",
                      )}
                      disabled={isSubmitting}
                    >
                      <CalendarIcon className="mr-2 size-4" />
                      {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <Label htmlFor="endDate">Campaign End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}
                      disabled={isSubmitting}
                    >
                      <CalendarIcon className="mr-2 size-4" />
                      {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      disabled={(date) => (startDate ? date < startDate : false)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your campaign objectives, target audience, and key messaging..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
                rows={3}
                className="resize-none"
              />
            </div>

            {/* Location and Expected Attendees */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  type="text"
                  placeholder="e.g., Dubai World Trade Centre"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expectedAttendees">Expected Attendees</Label>
                <Input
                  id="expectedAttendees"
                  type="text"
                  placeholder="e.g., 5000+"
                  value={expectedAttendees}
                  onChange={(e) => setExpectedAttendees(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Evaluation Weights Section */}
            <div className="space-y-4 rounded-lg border border-border p-4 bg-muted/30">
              <Label className="text-sm font-semibold uppercase tracking-wide">Candidate Evaluation Weights (%)</Label>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-skills-weight" className="text-xs text-muted-foreground">Skills Match</Label>
                  <div className="relative">
                    <Input
                      id="edit-skills-weight"
                      type="number"
                      min="0"
                      max="100"
                      value={skillsWeight}
                      onChange={(e) => setSkillsWeight(Number(e.target.value))}
                      className="bg-background h-9 pr-7"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-experience-weight" className="text-xs text-muted-foreground">Experience</Label>
                  <div className="relative">
                    <Input
                      id="edit-experience-weight"
                      type="number"
                      min="0"
                      max="100"
                      value={experienceWeight}
                      onChange={(e) => setExperienceWeight(Number(e.target.value))}
                      className="bg-background h-9 pr-7"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-education-weight" className="text-xs text-muted-foreground">Education</Label>
                  <div className="relative">
                    <Input
                      id="edit-education-weight"
                      type="number"
                      min="0"
                      max="100"
                      value={educationWeight}
                      onChange={(e) => setEducationWeight(Number(e.target.value))}
                      className="bg-background h-9 pr-7"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-alignment-weight" className="text-xs text-muted-foreground">JD Alignment</Label>
                  <div className="relative">
                    <Input
                      id="edit-alignment-weight"
                      type="number"
                      min="0"
                      max="100"
                      value={alignmentWeight}
                      onChange={(e) => setAlignmentWeight(Number(e.target.value))}
                      className="bg-background h-9 pr-7"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">%</span>
                  </div>
                </div>
              </div>
              
              {(skillsWeight + experienceWeight + educationWeight + alignmentWeight) !== 100 && (
                <p className="text-[10px] text-amber-600 font-medium">
                  Note: Total weight is {skillsWeight + experienceWeight + educationWeight + alignmentWeight}%. Aim for 100% for balanced scoring.
                </p>
              )}
            </div>

            {/* IsActive Toggle */}
            <div className="flex items-center justify-between rounded-lg border border-border p-4 bg-muted/50">
              <div className="space-y-0.5">
                <Label htmlFor="isActive" className="text-base font-medium">
                  Active Campaign
                </Label>
                <p className="text-sm text-muted-foreground">
                  When enabled, this campaign will be set as active and all other campaigns will be deactivated
                </p>
              </div>
              <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} disabled={isSubmitting} />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Saving Changes...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
