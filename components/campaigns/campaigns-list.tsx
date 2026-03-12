"use client"

import { useEffect, useState, forwardRef, useImperativeHandle } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Calendar, MapPin, Users, Edit2, Trash2, Loader2, AlertCircle, Eye } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { EditCampaignModal } from "./edit-campaign-modal"
import { DeleteCampaignDialog } from "./delete-campaign-dialog"
import Link from "next/link"

const FETCH_URL = "https://n8n.srv1010832.hstgr.cloud/webhook/ab8d28de-afb7-416f-aaf1-454949b27c18?action=Campaigns"

interface Campaign {
  CampaignName: string
  UserEmail: string
  CampaignStartDate: string
  CampaignEndDate: string
  IsActive: boolean
  Description?: string
  JobDescription?: string
  Location?: string
  ExpectedAttendees?: string | number
}

export interface CampaignsListRef {
  refetch: () => void
}

export const CampaignsList = forwardRef<CampaignsListRef>(function CampaignsList(_props, ref) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Edit & Delete Modal State
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [deletingCampaign, setDeletingCampaign] = useState<string | null>(null)

  const fetchCampaigns = async () => {
    setLoading(true)
    setError(null)
    try {
      // Use local proxy to handle the webhook call while obeying the 'everything in body' rule
      // and bypassing browser CORS restrictions.
      const response = await fetch("/api/webhook-proxy?action=Campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          UserEmail: "guest@example.com"
        })
      })
      if (!response.ok) throw new Error("Failed to fetch campaigns")
      
      const text = await response.text()
      let data: any = []
      
      if (text && text.trim() !== "") {
        try {
          data = JSON.parse(text)
        } catch (e) {
          console.error("[CampaignsList] JSON Parse error:", e)
          throw new Error("Invalid response from server")
        }
      }
      
      console.log("[CampaignsList] Received data:", data)
      
      // Handle different possible response formats
      let extracted: Campaign[] = []
      if (Array.isArray(data)) {
        extracted = data
      } else if (data.data && Array.isArray(data.data)) {
        extracted = data.data.map((item: any) => item.json || item)
      } else if (data.campaigns && Array.isArray(data.campaigns)) {
        extracted = data.campaigns
      }
      
      setCampaigns(extracted)
    } catch (err: any) {
      console.error("[CampaignsList] Error:", err)
      setError(err.message || "An unexpected error occurred")
      toast.error("Could not load campaigns")
    } finally {
      setLoading(false)
    }
  }

  useImperativeHandle(ref, () => ({
    refetch: fetchCampaigns,
  }))

  useEffect(() => {
    fetchCampaigns()
  }, [])

  const handleEditClick = (campaign: Campaign) => {
    setEditingCampaign(campaign)
    setIsEditModalOpen(true)
  }

  const executeDelete = async (campaignName: string) => {

    try {
      const response = await fetch("/api/webhook-proxy?action=DeleteCampaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "DeleteCampaign",
          campaignName: campaignName
        })
      })
      
      if (!response.ok) throw new Error("Failed to delete campaign")
      
      toast.success("Campaign deleted successfully", {
        action: {
          label: "OK",
          onClick: () => fetchCampaigns(),
        },
        duration: Infinity, // Keep it visible until they click OK as requested
      })
    } catch (err: any) {
      console.error("[CampaignsList] Delete error:", err)
      toast.error(err.message || "Failed to delete campaign")
    }
  }

  if (loading && campaigns.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-slate-800 animate-pulse rounded" />
            <div className="h-4 w-64 bg-slate-800/50 animate-pulse rounded" />
          </div>
          <div className="h-9 w-24 bg-slate-800 animate-pulse rounded" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-card/50 border-border/50 overflow-hidden">
              <div className="h-1 w-full bg-muted animate-pulse" />
              <CardHeader className="pb-3 space-y-3">
                <div className="h-5 w-16 bg-muted animate-pulse rounded-full" />
                <div className="h-7 w-3/4 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="h-4 w-full bg-muted/50 animate-pulse rounded" />
                  <div className="h-4 w-5/6 bg-muted/50 animate-pulse rounded" />
                </div>
                <div className="space-y-3 pt-2 border-t border-border/50">
                  <div className="h-3 w-1/2 bg-muted/30 animate-pulse rounded" />
                  <div className="h-3 w-2/3 bg-muted/30 animate-pulse rounded" />
                  <div className="h-3 w-1/3 bg-muted/30 animate-pulse rounded" />
                </div>
                <div className="h-9 w-full bg-muted/50 animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
        <AlertCircle className="size-12 text-destructive/50" />
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-destructive">Failed to load campaigns</h3>
          <p className="text-muted-foreground max-w-md mx-auto">{error}</p>
        </div>
        <Button onClick={fetchCampaigns} variant="outline" className="mt-2">
          Try Again
        </Button>
      </div>
    )
  }

  if (campaigns.length === 0) {
    return (
      <Card className="bg-card/30 border-dashed border-border/50">
        <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="size-16 rounded-full bg-muted flex items-center justify-center">
            <Users className="size-8 text-muted-foreground" />
          </div>
          <div className="text-center space-y-1">
            <h3 className="text-xl font-semibold">No active campaigns</h3>
            <p className="text-muted-foreground">Get started by creating your first campaign above.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Active Campaigns</h2>
          <p className="text-muted-foreground">Currently registered hiring campaigns</p>
        </div>
        <Button onClick={fetchCampaigns} variant="secondary" size="sm" disabled={loading}>
          Refresh
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {campaigns.map((campaign, index) => (
          <Card key={index} className="bg-card/50 border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
            {/* Active Indicator Bar */}
            <div className={cn(
              "absolute top-0 left-0 w-full h-1",
              campaign.IsActive ? "bg-emerald-500" : "bg-muted-foreground/30"
            )} />
            
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <Badge variant={campaign.IsActive ? "default" : "secondary"} className={cn(
                    "mb-2",
                    campaign.IsActive ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : ""
                  )}>
                    {campaign.IsActive ? "Active" : "Paused"}
                  </Badge>
                  <CardTitle className="text-xl line-clamp-1 text-foreground">{campaign.CampaignName}</CardTitle>
                </div>
                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-full hover:bg-violet-500/10 hover:text-violet-500 h-8 w-8"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleEditClick(campaign)
                    }}
                  >
                    <Edit2 className="size-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-full hover:bg-destructive/10 hover:text-destructive h-8 w-8"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setDeletingCampaign(campaign.CampaignName)
                    }}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4 pt-0">
              {campaign.Description && (
                <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
                  {campaign.Description}
                </p>
              )}
              
              <div className="space-y-2.5 pt-2 border-t border-border/50">
                <div className="flex items-center text-xs text-muted-foreground">
                  <Calendar className="mr-2 size-3.5 text-violet-500" />
                  <span>
                    {campaign.CampaignStartDate ? format(new Date(campaign.CampaignStartDate), "MMM d, yyyy") : "N/A"} - 
                    {campaign.CampaignEndDate ? format(new Date(campaign.CampaignEndDate), "MMM d, yyyy") : "N/A"}
                  </span>
                </div>
                
                <div className="flex items-center text-xs text-muted-foreground">
                  <MapPin className="mr-2 size-3.5 text-emerald-500" />
                  <span className="line-clamp-1">{campaign.Location || "Remote"}</span>
                </div>
                
                <div className="flex items-center text-xs text-muted-foreground">
                  <Users className="mr-2 size-3.5 text-blue-500" />
                  <span>{campaign.ExpectedAttendees || 0} Candidates Expected</span>
                </div>
              </div>
              
              <Link href={`/exhibitions/campaign/${encodeURIComponent(campaign.CampaignName)}`} className="block w-full">
                <Button 
                  variant="outline" 
                  className="w-full mt-2 group-hover:bg-violet-600 group-hover:text-white group-hover:border-violet-600 transition-all duration-300"
                  size="sm"
                >
                  <Eye className="size-4 mr-2" />
                  View Analytics & Candidates
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {editingCampaign && (
        <EditCampaignModal 
          campaign={editingCampaign}
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          onSuccess={fetchCampaigns}
        />
      )}

      <DeleteCampaignDialog
        isOpen={!!deletingCampaign}
        onClose={() => setDeletingCampaign(null)}
        onConfirm={() => {
          if (deletingCampaign) executeDelete(deletingCampaign)
        }}
        campaignName={deletingCampaign || ""}
      />
    </div>
  )
})
