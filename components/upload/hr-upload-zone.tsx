"use client"

import type React from "react"

import { useState, useCallback, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, File, X, CheckCircle2, AlertCircle, ExternalLink, Loader2, FolderOpen, RefreshCcw, Edit2, Settings2, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { ToastAction } from "@/components/ui/toast"

interface UploadFile {
  file: File
  progress: number
  status: "pending" | "uploading" | "success" | "error"
  error?: string
}

interface HRUploadZoneProps {
  campaignName: string
}

interface UploadResponse {
  status: "success" | "exists"
  message: string
  folderLink?: string
  summary?: {
    campaignName: string
    folderLink: string
    totalFiles: number
  }
  timestamp: string
}

export function HRUploadZone({ campaignName }: HRUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [files, setFiles] = useState<UploadFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [jdText, setJdText] = useState("")
  const [isEditingJd, setIsEditingJd] = useState(true)
  const [hasExistingJd, setHasExistingJd] = useState(false)
  const [lastUpload, setLastUpload] = useState<UploadResponse | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [skillsWeight, setSkillsWeight] = useState(25)
  const [experienceWeight, setExperienceWeight] = useState(25)
  const [educationWeight, setEducationWeight] = useState(25)
  const [alignmentWeight, setAlignmentWeight] = useState(25)
  const { toast } = useToast()

  const fetchJD = useCallback(async () => {
    setIsRefreshing(true)
    try {
      // Fetch from "Campaigns" action — this returns campaign-level data
      // including JD, weights, location, etc. (not candidates)
      const response = await fetch("/api/webhook-proxy?action=Campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          UserEmail: "guest@example.com"
        })
      })
      if (!response.ok) throw new Error("Failed to fetch campaign details")
      
      const text = await response.text()
      console.log("[v0] Campaigns raw response (first 300 chars):", text.substring(0, 300))

      let fetchedJd = ""
      let fetchedSkills = 25
      let fetchedExp = 25
      let fetchedEdu = 25
      let fetchedAlign = 25

      if (text && text.trim() !== "") {
        try {
          const result = JSON.parse(text)
          
          // Extract campaign list from response (could be array or wrapped)
          let allCampaigns: any[] = []
          if (Array.isArray(result)) {
            // Could be [{ data: [...] }] or flat array of campaigns
            const first = result[0]
            if (first?.data && Array.isArray(first.data)) {
              allCampaigns = first.data.map((item: any) => item.json || item)
            } else if (first?.json) {
              allCampaigns = result.map((item: any) => item.json || item)
            } else {
              allCampaigns = result
            }
          } else if (result.data && Array.isArray(result.data)) {
            allCampaigns = result.data.map((item: any) => item.json || item)
          }
          
          console.log("[v0] Found", allCampaigns.length, "campaigns, looking for:", campaignName)
          
          // Find the matching campaign by name (case-insensitive)
          const matchedCampaign = allCampaigns.find((c: any) => {
            const name = c.CampaignName || c.campaignName || c.Name || c.name || ""
            return name.toLowerCase() === campaignName.toLowerCase()
          })
          
          if (matchedCampaign) {
            console.log("[v0] Matched campaign keys:", Object.keys(matchedCampaign))
            console.log("[v0] FULL matched campaign data:", JSON.stringify(matchedCampaign, null, 2))
            
            // Extract JD — try all possible field names
            fetchedJd = matchedCampaign.JobDescription 
              || matchedCampaign.JDText 
              || matchedCampaign.JD 
              || matchedCampaign.jobDescription 
              || matchedCampaign.jdText
              || matchedCampaign.Description
              || ""
            
            // Extract AI evaluation weights using all potential key formats
            const getWeight = (keys: string[], fallback: number) => {
              for (const k of keys) {
                if (matchedCampaign[k] !== undefined && matchedCampaign[k] !== null && matchedCampaign[k] !== "") {
                  const val = Number.parseFloat(matchedCampaign[k])
                  if (!isNaN(val)) return val
                }
              }
              return fallback
            }

            fetchedSkills = getWeight(["SkillsMatchWeight", "skills_match_percent", "Skills match", "Skills Match", "Skills match weight"], 25)
            fetchedExp = getWeight(["ExperienceRelevanceWeight", "experience_relevance_percent", "Experience relevance", "Experience Relevance", "Experience relevance weight"], 25)
            fetchedEdu = getWeight(["EducationRelevanceWeight", "education_relevance_percent", "Education/domain relevance", "Education", "Education relevance"], 25)
            fetchedAlign = getWeight(["JDAlignmentWeight", "jd_alignment_percent", "Job description alignment", "JD Alignment", "JD Alignment weight"], 25)
            
            console.log("[v0] Extracted JD length:", fetchedJd.length, "Weights:", fetchedSkills, fetchedExp, fetchedEdu, fetchedAlign)
          } else {
            console.warn("[v0] No matching campaign found for:", campaignName)
          }
        } catch (e) {
          console.error("[v0] JSON parse error in fetchJD:", e)
        }
      }

      // Check if JD exists or any weight is non-default to decide if we synced existing stuff
      const hasDetailedData = (fetchedJd && fetchedJd.trim() !== "") || 
                              (fetchedSkills !== 25 || fetchedExp !== 25 || fetchedEdu !== 25 || fetchedAlign !== 25)

      if (hasDetailedData) {
        setJdText(fetchedJd || "")
        setSkillsWeight(fetchedSkills)
        setExperienceWeight(fetchedExp)
        setEducationWeight(fetchedEdu)
        setAlignmentWeight(fetchedAlign)
        setHasExistingJd(true)
        setIsEditingJd(false)
        console.log("[v0] Campaign details synchronized successfully!")
      } else {
        console.log("[v0] No JD found — showing editable empty state")
        setJdText("")
        setSkillsWeight(fetchedSkills)
        setExperienceWeight(fetchedExp)
        setEducationWeight(fetchedEdu)
        setAlignmentWeight(fetchedAlign)
        setHasExistingJd(false)
        setIsEditingJd(true)
      }
    } catch (error) {
      console.error("[v0] Error fetching campaign details:", error)
      setHasExistingJd(false)
      setIsEditingJd(true)
    } finally {
      setIsRefreshing(false)
    }
  }, [campaignName])


  useEffect(() => {
    fetchJD()
  }, [fetchJD])

  // Handle drag events
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    processFiles(droppedFiles)
  }, [])

  // Validate and process files
  const processFiles = (fileList: File[]) => {
    const maxSize = 500 * 1024 * 1024 // 500 MB
    const validFiles: UploadFile[] = []

    for (const file of fileList) {
      // Check if file has required properties
      if (!file || typeof file.name !== "string" || typeof file.size !== "number") {
        toast({
          title: "Invalid File",
          description: `Invalid file object detected.`,
          variant: "destructive",
        })
        continue
      }


      if (file.size > maxSize) {
        toast({
          title: "File Too Large",
          description: `${file.name} exceeds the 500 MB limit.`,
          variant: "destructive",
        })
        continue
      }

      validFiles.push({
        file,
        progress: 0,
        status: "pending",
      })
    }

    setFiles((prev) => [...prev, ...validFiles])
  }

  // Handle file input change
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(Array.from(e.target.files))
    }
  }

  // Remove file from list
  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  // Upload files to API
  const handleUpload = async (sendOnlyJD = false) => {
    if (files.length === 0 && !jdText.trim()) {
      toast({
        title: "No Data Provided",
        description: "Please provide a job description or select files to upload.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()

      // Add campaign name
      formData.append("campaignName", campaignName)

      // Determine action
      let action = ""
      const hasJD = jdText && jdText.trim().length > 0
      const hasFiles = !sendOnlyJD && files.length > 0

      if (hasJD && hasFiles) {
        action = "JDFolder"
      } else if (hasJD) {
        action = "JD"
      } else if (hasFiles) {
        action = "Folder"
      }



      // Add JD text if provided
      if (hasJD) {
        formData.append("jd_text", jdText.trim())
      }

      // Add weights
      formData.append("skills_match_percent", skillsWeight.toString())
      formData.append("experience_relevance_percent", experienceWeight.toString())
      formData.append("education_relevance_percent", educationWeight.toString())
      formData.append("jd_alignment_percent", alignmentWeight.toString())

      // Add all files
      if (!sendOnlyJD) {
        files.forEach((fileObj) => {
          formData.append("file", fileObj.file, fileObj.file.name)
        })
      }

      console.log(`[v0] Uploading ${sendOnlyJD ? 0 : files.length} files. Action: ${action}`)

      // Update UI to show uploading status
      if (!sendOnlyJD) {
        setFiles((prev) => prev.map((f) => ({ ...f, status: "uploading" as const })))
      }

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setFiles((prev) =>
          prev.map((f) => (f.status === "uploading" && f.progress < 90 ? { ...f, progress: f.progress + 10 } : f)),
        )
      }, 500)

      const response = await fetch(
        `https://n8n.srv1010832.hstgr.cloud/webhook/6439e5c1-f256-4346-9f4e-c873768e7855?action=${action}`,
        {
          method: "POST",
          body: formData,
          // IMPORTANT: Do NOT set Content-Type header manually
          // The browser will automatically set multipart/form-data with correct boundary
        },
      )

      clearInterval(progressInterval)

      console.log("[v0] Upload response status:", response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[v0] Upload failed with status:", response.status, errorText)

        // Provide specific error messages based on status and content
        if (response.status === 500) {
          if (errorText.includes("decompress") || errorText.includes("compression")) {
            throw new Error(
              "Server error decompressing the ZIP file. Please ensure the file is a valid, unencrypted ZIP archive created with standard compression tools.",
            )
          }
          throw new Error(
            "Server error processing the ZIP file. Please ensure the file is a valid ZIP archive and try again.",
          )
        } else if (response.status === 400) {
          if (errorText.includes("binary")) {
            throw new Error("The server did not receive the file correctly. Please try uploading again.")
          }
          throw new Error("Bad request. Please check that the ZIP file is not corrupted and try again.")
        } else {
          throw new Error(`Upload failed with status ${response.status}. Please try again.`)
        }
      }

      const contentType = response.headers.get("content-type")
      const responseText = await response.text()

      console.log("[v0] Response content-type:", contentType)
      console.log("[v0] Response text:", responseText)

      let data: UploadResponse

      // Check if response is empty or whitespace
      if (!responseText || responseText.trim() === "") {
        console.warn("[v0] Empty response from webhook — cannot confirm success")
        throw new Error("The server returned an empty response. Upload may not have been processed. Please check and try again.")
      } else {
        // Try to parse as JSON
        try {
          data = JSON.parse(responseText)
          console.log("[v0] Parsed JSON response:", data)
        } catch (jsonError) {
          console.error("[v0] JSON parse error:", jsonError)

          if (responseText.includes("No valid binary files")) {
            throw new Error(
              "No valid binary files found in the ZIP. Please ensure the ZIP file is not empty and contains resume files.",
            )
          } else if (responseText.includes("split is not a function")) {
            throw new Error(
              "Server error processing the file structure. The decompression may have failed. Please ensure the ZIP file is not password-protected.",
            )
          } else if (responseText.includes("cannot decompress") || responseText.includes("decompression failed")) {
            throw new Error(
              "Unable to decompress the ZIP file. Please ensure it's a valid ZIP archive and not corrupted or password-protected.",
            )
          } else if (responseText.toLowerCase().includes("error")) {
            throw new Error(`Server error: ${responseText.substring(0, 200)}`)
          } else {
            // Non-JSON, non-error response — don't assume success
            console.warn("[v0] Non-JSON response, cannot confirm success:", responseText.substring(0, 200))
            throw new Error("Unexpected response from server. Upload may not have been processed correctly.")
          }
        }
      }

      console.log("[v0] Upload response parsed. Data status:", data.status, "Action:", action)

      // Check if the response indicates an error status
      if (data.status !== "success" && data.status !== "exists") {
        const msg = data.message || "The server did not confirm a successful upload."
        console.warn("[v0] Non-success status from webhook:", data.status, msg)
        throw new Error(msg)
      }

      // ── Only reach here if genuinely successful ──

      // Mark all files as successfully uploaded
      setFiles((prev) => prev.map((f) => ({ ...f, status: "success" as const, progress: 100 })))

      // Store the response so the inline success banner renders
      setLastUpload(data)

      // Always show success notification if it was a JD update and the fetch succeeded
      if (action === "JD") {
        setIsEditingJd(false)
        setHasExistingJd(true)
        toast({
          title: "Updated JD",
          description: "The job description has been updated successfully.",
          action: (
            <ToastAction altText="Refresh" onClick={() => fetchJD()}>
              OK
            </ToastAction>
          ),
        })
      } else if (data.status === "exists") {
        toast({
          title: "Folder Already Exists",
          description:
            data.message ||
            "Campaign folder already exists in Google Drive. Resumes may have been uploaded previously.",
          variant: "default",
          action: data.folderLink ? (
            <Button variant="outline" size="sm" onClick={() => window.open(data.folderLink, "_blank")}>
              <FolderOpen className="size-4 mr-2" />
              Open Folder
            </Button>
          ) : undefined,
        })
      } else if (data.status === "success") {
        let successTitle = "Upload Successful"
        let successDesc = data.message || "Processing started successfully"

        if (action === "Folder") {
          successTitle = "Resumes Uploaded"
          successDesc = "Candidates are now processing. You will receive an email once the AI scoring and skills extraction is complete."
        } else if (action === "JDFolder") {
          successTitle = "JD & Resumes Uploaded"
          successDesc = "Data uploaded. You will receive an email once the AI candidates scoring is complete."
        }

        toast({
          title: successTitle,
          description: successDesc,
          action: (
            <div className="flex gap-2">
              <ToastAction altText="Refresh JD" onClick={() => fetchJD()}>
                OK
              </ToastAction>
              {(data.summary?.folderLink || data.folderLink) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(data.summary?.folderLink || data.folderLink, "_blank")}
                >
                  <ExternalLink className="size-4 mr-2" />
                  View Folder
                </Button>
              )}
            </div>
          ),
        })
      }

      // Clear files after 3 seconds so the success banner stays visible
      setTimeout(() => {
        setFiles([])
      }, 3000)
    } catch (error: any) {
      console.error("[v0] Upload error:", error)

      let errorMessage = "An error occurred during upload"
      let errorTitle = "Upload Failed"

      if (error.message.includes("decompress") || error.message.includes("ZIP") || error.message.includes("split is not a function") || error.message.includes("Server error processing")) {
        errorTitle = "Processing Error"
        errorMessage = "The server could not process the folder. Please ensure it contains standard resume files."
      } else if (error.message.includes("Invalid file object")) {
        errorTitle = "Invalid File"
        errorMessage = error.message
      } else if (error.message.includes("Failed to fetch")) {
        errorTitle = "Network Error"
        errorMessage = "Unable to connect to the server. Please check your internet connection and try again."
      } else if (error.message) {
        errorMessage = error.message
      }

      // Update file status to error
      setFiles((prev) =>
        prev.map((f) => ({
          ...f,
          status: "error" as const,
          error: errorMessage,
        })),
      )

      // Show error toast with retry option
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
        action: (
          <Button variant="outline" size="sm" onClick={() => handleUpload()}>
            Retry
          </Button>
        ),
      })
    } finally {
      setIsUploading(false)
    }
  }

  // Universal Save for JD and weights
  const handleSaveCampaignDetails = async () => {
    if (!jdText.trim()) {
      toast({
        title: "Missing JD",
        description: "Please provide a job description before saving.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    try {
      // Use JSON instead of FormData for the proxy to easily forward it
      const payload = {
        campaignName: campaignName,
        jd_text: jdText.trim(),
        skills_match_percent: skillsWeight.toString(),
        experience_relevance_percent: experienceWeight.toString(),
        education_relevance_percent: educationWeight.toString(),
        jd_alignment_percent: alignmentWeight.toString()
      }

      const response = await fetch("/api/webhook-proxy?action=CampaignDetails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        setIsEditingJd(false)
        setHasExistingJd(true)
        toast({
          title: "Campaign Details Saved",
          description: "Job description and evaluation weights have been updated successfully.",
          action: (
             <ToastAction altText="Refresh" onClick={() => fetchJD()}>
               OK
             </ToastAction>
          ),
        })
      } else {
        const errorText = await response.text()
        throw new Error(errorText || "Failed to update campaign details")
      }
    } catch (error: any) {
      console.error("[v0] Save error:", error)
      toast({
        title: "Save Failed",
        description: error.message || "Unable to save campaign details. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const getFileIcon = (fileName: string) => {
    return <File className="size-4" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  return (
    <div className="space-y-6">
      {/* Campaign Details Card */}
      <Card className="bg-card border-border shadow-xl">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Settings2 className="size-5 text-violet-400" />
            Campaign Details
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Define requirements and evaluation weighting for <span className="font-semibold text-violet-400">{campaignName}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* JD Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="jd-text" className="text-muted-foreground font-medium">
                Job Description {hasExistingJd && !isEditingJd ? "(Saved)" : "(Required)"}
              </Label>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={fetchJD}
                  disabled={isUploading || isRefreshing}
                  className="h-8 text-[11px] text-muted-foreground hover:text-foreground"
                >
                  <RefreshCcw className={`size-3 mr-1 ${isRefreshing ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
                {hasExistingJd && !isEditingJd && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingJd(true)}
                    disabled={isUploading}
                    className="h-7 text-[11px] bg-muted border-border text-foreground hover:bg-muted"
                  >
                    <Edit2 className="size-3 mr-1" />
                    Edit JD
                  </Button>
                )}
              </div>
            </div>
            <div className="relative">
              <Textarea
                id="jd-text"
                placeholder="Paste the full job description here..."
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground min-h-[120px] focus:border-violet-500/50 transition-colors"
                disabled={isUploading || isRefreshing || (!isEditingJd && hasExistingJd)}
              />
              {isRefreshing && (
                <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[1px] flex items-center justify-center rounded-md">
                  <Loader2 className="size-6 animate-spin text-violet-500" />
                </div>
              )}
            </div>
          </div>

          {/* Evaluation Weights Section */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-500" />
              <Label className="text-muted-foreground font-medium">AI Evaluation Weights (%)</Label>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="skills-weight" className="text-[11px] text-muted-foreground">Skills Match</Label>
                <div className="relative">
                  <Input
                    id="skills-weight"
                    type="number"
                    min="0"
                    max="100"
                    value={skillsWeight}
                    onChange={(e) => setSkillsWeight(Number(e.target.value))}
                    className="bg-muted/50 border-border text-foreground h-9 pr-8 focus:ring-emerald-500/20"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">%</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience-weight" className="text-[11px] text-muted-foreground">Experience</Label>
                <div className="relative">
                  <Input
                    id="experience-weight"
                    type="number"
                    min="0"
                    max="100"
                    value={experienceWeight}
                    onChange={(e) => setExperienceWeight(Number(e.target.value))}
                    className="bg-muted/50 border-border text-foreground h-9 pr-8 focus:ring-emerald-500/20"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">%</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="education-weight" className="text-[11px] text-muted-foreground">Education</Label>
                <div className="relative">
                  <Input
                    id="education-weight"
                    type="number"
                    min="0"
                    max="100"
                    value={educationWeight}
                    onChange={(e) => setEducationWeight(Number(e.target.value))}
                    className="bg-muted/50 border-border text-foreground h-9 pr-8 focus:ring-emerald-500/20"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">%</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="alignment-weight" className="text-[11px] text-muted-foreground">JD Alignment</Label>
                <div className="relative">
                  <Input
                    id="alignment-weight"
                    type="number"
                    min="0"
                    max="100"
                    value={alignmentWeight}
                    onChange={(e) => setAlignmentWeight(Number(e.target.value))}
                    className="bg-muted/50 border-border text-foreground h-9 pr-8 focus:ring-emerald-500/20"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">%</span>
                </div>
              </div>
            </div>
            
            {(skillsWeight + experienceWeight + educationWeight + alignmentWeight) !== 100 && (
              <p className="text-[10px] text-amber-500/80">
                Note: Weights total {skillsWeight + experienceWeight + educationWeight + alignmentWeight}%. Aim for 100%.
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end pt-2">
          <Button
            onClick={handleSaveCampaignDetails}
            disabled={isUploading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 transition-all active:scale-95 shadow-lg shadow-emerald-500/10"
          >
            {isUploading ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle2 className="size-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Upload Resumes Card */}
      <Card className="bg-card border-border shadow-xl overflow-hidden relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Upload className="size-5 text-emerald-500" />
            Upload Candidate Resumes
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Process new applications for <span className="font-semibold text-emerald-500 dark:text-emerald-400">{campaignName}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-2xl p-10 transition-all ${
              isDragging
                ? "border-emerald-500 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                : "border-border hover:border-violet-500/30 bg-muted/20"
            }`}
          >
            <div className="flex flex-col items-center justify-center gap-5 text-center">
              <div
                className={`p-5 rounded-full transition-all duration-300 ${
                  isDragging ? "bg-emerald-500 scale-110" : "bg-muted shadow-inner"
                }`}
              >
                <Upload className={`size-10 ${isDragging ? "text-white" : "text-muted-foreground"}`} />
              </div>
              <div>
                <p className="text-xl font-semibold text-foreground mb-2">
                  {isDragging ? "Ready to drop" : "Drop folder here"}
                </p>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Upload a folder containing candidates (Resumes, Images, PDFs) to start analysis
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-4 relative mt-2">
                <div className="relative">
                  <input
                    type="file"
                    multiple
                    {...({
                      webkitdirectory: "",
                      directory: "",
                    } as any)}
                    onChange={handleFileSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    disabled={isUploading}
                  />
                  <Button variant="outline" className="bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20 pointer-events-none">
                    <FolderOpen className="size-4 mr-2" />
                    Select Folder
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {files.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar"
              >
                {files.map((uploadFile, index) => (
                   <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-violet-500/30 transition-colors shadow-sm"
                  >
                    <div className="p-2.5 rounded-lg bg-muted text-violet-500">
                      {getFileIcon(uploadFile.file.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{uploadFile.file.name}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <p className="text-[10px] text-muted-foreground font-mono">{formatFileSize(uploadFile.file.size)}</p>
                        {uploadFile.status === "uploading" && (
                          <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
                            <motion.div 
                              className="bg-violet-500 h-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${uploadFile.progress}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0">
                      {uploadFile.status === "pending" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFile(index)}
                          className="size-8 text-slate-500 hover:text-red-400 hover:bg-red-400/10"
                        >
                          <X className="size-4" />
                        </Button>
                      )}
                      {uploadFile.status === "uploading" && <Loader2 className="size-5 animate-spin text-violet-400" />}
                      {uploadFile.status === "success" && <CheckCircle2 className="size-5 text-emerald-400" />}
                      {uploadFile.status === "error" && <AlertCircle className="size-5 text-red-400" />}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {files.length > 0 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-3">
                  {files.length} {files.length === 1 ? 'file' : 'files'}
                </Badge>
                <p className="text-[11px] text-slate-500">Ready for processing</p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setFiles([])}
                  disabled={isUploading}
                  className="text-slate-400 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleUpload()}
                  disabled={isUploading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/10 px-6 py-5 rounded-xl transition-all active:scale-95"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="size-4 animate-spin mr-2" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="size-4 mr-2" />
                      Process Resumes
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {lastUpload && !files.length && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-5 rounded-2xl border ${
                lastUpload.status === "exists"
                  ? "bg-amber-500/5 border-amber-500/20"
                  : "bg-emerald-500/5 border-emerald-500/20"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`p-3 rounded-xl ${
                    lastUpload.status === "exists" ? "bg-amber-500/10" : "bg-emerald-500/10"
                  }`}
                >
                  <FolderOpen
                    className={`size-6 ${lastUpload.status === "exists" ? "text-amber-400" : "text-emerald-400"}`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground mb-1">Upload Completed</p>
                  <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{lastUpload.message}</p>
                  {lastUpload.status === "success" && (
                    <div className="flex items-start gap-2 mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
                      <Clock className="size-4 mt-0.5 shrink-0" />
                      <p className="text-xs leading-relaxed">
                        Resumes have been uploaded and are currently being processed. It will take some time to process skills and score the candidates. <strong>You will receive an email once everything is done.</strong>
                      </p>
                    </div>
                  )}
                  {lastUpload.summary && (
                    <div className="flex items-center gap-3 text-[10px] text-slate-500 uppercase tracking-wider font-medium">
                      <span>{lastUpload.summary.totalFiles} Candidates</span>
                      <span className="w-1 h-1 rounded-full bg-slate-700" />
                      <span>{formatTimestamp(lastUpload.timestamp)}</span>
                    </div>
                  )}
                </div>
                {(lastUpload.folderLink || lastUpload.summary?.folderLink) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(lastUpload.folderLink || lastUpload.summary?.folderLink, "_blank")}
                    className="bg-slate-800 border-slate-700 text-slate-300 transition-all hover:bg-slate-700"
                  >
                    <ExternalLink className="size-4 mr-2" />
                    Open Folder
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
