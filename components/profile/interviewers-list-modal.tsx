"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, UserPlus, Mail, Link as LinkIcon, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { AddInterviewerModal } from "./add-interviewer-modal"
import { cn } from "@/lib/utils"

interface Interviewer {
  name: string
  email: string
  type: string
  calendarLink: string
}

interface InterviewersListModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InterviewersListModal({ open, onOpenChange }: InterviewersListModalProps) {
  const [interviewers, setInterviewers] = useState<Interviewer[]>([])
  const [loading, setLoading] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const { toast } = useToast()

  const fetchInterviewers = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/webhook-proxy?action=InterviewerListing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "InterviewerListing" })
      })

      if (!response.ok) throw new Error("Failed to fetch interviewers")

      const data = await response.json()
      console.log("[InterviewersList] Received:", data)

      let rawRows: any[] = []
      if (Array.isArray(data)) {
        rawRows = data
      } else if (data.data && Array.isArray(data.data)) {
        rawRows = data.data
      } else if (data.interviewers && Array.isArray(data.interviewers)) {
        rawRows = data.interviewers
      }

      // Map the n8n spreadsheet fields to our interface
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
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to load interviewers.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      fetchInterviewers()
    }
  }, [open])

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[850px] max-h-[85vh] flex flex-col p-6 overflow-hidden">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
            <div className="space-y-1">
              <DialogTitle className="text-3xl font-extrabold tracking-tight">Team Interviewers</DialogTitle>
              <DialogDescription className="text-muted-foreground text-base">
                View and manage your recruitment team members and their availability.
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="flex flex-col gap-6 flex-1 min-h-0">
             <div className="flex items-center justify-between bg-muted/30 p-4 rounded-xl border border-border/50">
               <div className="flex items-center gap-4">
                 <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
                   <UserPlus className="size-6 text-primary" />
                 </div>
                 <div>
                   <h4 className="font-bold text-lg text-foreground">Add New Team Member</h4>
                   <p className="text-sm text-muted-foreground">Register a new HR, Tech, or Manager interviewer.</p>
                 </div>
               </div>
               <Button onClick={() => setShowAddModal(true)} size="lg" className="shadow-lg shadow-primary/20 font-bold">
                 <UserPlus className="mr-2 h-5 w-5" />
                 Add Interviewer
               </Button>
             </div>

            <div className="flex-1 overflow-hidden rounded-xl border border-border/50 bg-card/50 shadow-inner flex flex-col">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-24 space-y-4">
                  <div className="relative">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <div className="absolute inset-0 flex items-center justify-center">
                       <div className="size-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin-reverse" />
                    </div>
                  </div>
                  <p className="font-semibold text-muted-foreground animate-pulse">Syncing team data...</p>
                </div>
              ) : interviewers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center space-y-6">
                  <div className="size-20 rounded-2xl bg-muted/50 flex items-center justify-center border-2 border-dashed border-border">
                    <UserPlus className="size-10 text-muted-foreground/50" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xl font-bold text-foreground">No Team Members Found</p>
                    <p className="text-muted-foreground max-w-sm">Your interviewer directory is currently empty. Start building your team by clicking the button above.</p>
                  </div>
                </div>
              ) : (
                <div className="overflow-auto custom-scrollbar flex-1">
                  <Table>
                    <TableHeader className="bg-muted/80 backdrop-blur-md sticky top-0 z-10 shadow-sm">
                      <TableRow className="hover:bg-transparent border-b-2">
                        <TableHead className="font-extrabold text-foreground py-4 px-6">Name</TableHead>
                        <TableHead className="font-extrabold text-foreground py-4">Role</TableHead>
                        <TableHead className="font-extrabold text-foreground py-4 px-6">Email Address</TableHead>
                        <TableHead className="font-extrabold text-foreground py-4 px-6 text-right">Calendar Link</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {interviewers.map((interviewer, idx) => (
                        <TableRow key={idx} className="hover:bg-primary/5 transition-all duration-200 group border-b border-border/40">
                          <TableCell className="py-4 px-6">
                             <span className="font-bold text-foreground text-base group-hover:text-primary transition-colors">{interviewer.name}</span>
                          </TableCell>
                          <TableCell className="py-4">
                            <Badge 
                              variant="secondary" 
                              className={cn(
                                "font-bold px-3 py-1 rounded-full uppercase tracking-wider text-[10px]",
                                interviewer.type === "HR" && "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
                                interviewer.type === "Tech" && "bg-violet-500/10 text-violet-500 border-violet-500/20",
                                (interviewer.type === "Manager" || interviewer.type === "Final Decision") && "bg-blue-500/10 text-blue-500 border-blue-500/20"
                              )}
                            >
                              {interviewer.type || "N/A"}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-4 px-6">
                            <div className="flex items-center text-sm font-medium text-muted-foreground">
                              <Mail className="size-3.5 mr-2 opacity-60" />
                              {interviewer.email}
                            </div>
                          </TableCell>
                          <TableCell className="py-4 px-6 text-right">
                            {interviewer.calendarLink ? (
                              <a 
                                href={interviewer.calendarLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-bold text-sm bg-primary/5 px-4 py-2 rounded-lg border border-primary/10 hover:border-primary/30 transition-all active:scale-95"
                              >
                                <ExternalLink className="size-4" />
                                View Link
                              </a>
                            ) : (
                              <span className="text-xs text-muted-foreground italic">No link</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
          <div className="pt-6 border-t border-border mt-auto flex justify-end gap-3">
            <Button variant="ghost" onClick={fetchInterviewers} disabled={loading} className="font-bold">
               {loading ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
               Refresh List
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)} className="font-bold">Close Portal</Button>
          </div>
        </DialogContent>
      </Dialog>

      <AddInterviewerModal 
        open={showAddModal} 
        onOpenChange={(open) => {
          setShowAddModal(open)
          if (!open) fetchInterviewers() // Refetch when add modal closes
        }} 
      />
    </>
  )
}
