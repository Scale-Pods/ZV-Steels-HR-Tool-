"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface ReportIssueModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const REPORT_WEBHOOK = "https://n8n.srv1010832.hstgr.cloud/webhook/ff7710c6-14c7-4cae-a24c-6c53e5f09497"

export function ReportIssueModal({ open, onOpenChange }: ReportIssueModalProps) {
  const [topic, setTopic] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!topic || !description) {
      toast.error("Please fill in all fields")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/webhook-proxy?action=Report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic,
          description,
          timestamp: new Date().toISOString(),
          userEmail: "guest@example.com", // Mock email for now
        }),
      })

      if (!response.ok) throw new Error("Failed to send report")

      toast.success("Issue Reported", {
        description: "Our technical team has been notified. We'll look into it right away.",
        icon: <CheckCircle2 className="size-4 text-emerald-500" />
      })
      
      onOpenChange(false)
      setTopic("")
      setDescription("")
    } catch (error) {
      console.error("[ReportIssue] Error:", error)
      toast.error("Failed to send report", {
        description: "Please try again later or contact support directly."
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] bg-slate-900 border-slate-800 text-white">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-red-500/10">
              <AlertCircle className="size-5 text-red-500" />
            </div>
            <DialogTitle className="text-xl font-bold">Report an Issue</DialogTitle>
          </div>
          <DialogDescription className="text-slate-400">
            Tell us what's wrong and our team will get back to you as soon as possible.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="topic" className="text-sm font-semibold text-slate-200">
              Select Issue Topic
            </Label>
            <Select value={topic} onValueChange={setTopic}>
              <SelectTrigger id="topic" className="bg-slate-800/50 border-slate-700 text-white h-11">
                <SelectValue placeholder="What kind of issue are you facing?" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-white">
                <SelectItem value="Notification Not Sent">Notification Not Sent</SelectItem>
                <SelectItem value="Data Not Syncing">Data Not Syncing</SelectItem>
                <SelectItem value="Campaign Creation Failed">Campaign Creation Failed</SelectItem>
                <SelectItem value="UI Glitch / Visual Bug">UI Glitch / Visual Bug</SelectItem>
                <SelectItem value="Performance / Lag">Performance / Lag</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description" className="text-sm font-semibold text-slate-200">
              Describe the Issue
            </Label>
            <Textarea
              id="description"
              placeholder="Please provide as much detail as possible..."
              className="bg-slate-800/50 border-slate-700 text-white min-h-[120px] resize-none focus:ring-red-500/20"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-slate-400 hover:text-white hover:bg-slate-800"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg shadow-red-600/20"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Sending Report...
              </>
            ) : (
              "Submit Report"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
