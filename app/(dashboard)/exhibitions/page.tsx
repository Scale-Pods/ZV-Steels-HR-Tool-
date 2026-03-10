"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, ArrowRight, Loader2, Edit, Play, Pause } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { EditCampaignModal } from "@/components/campaigns/edit-campaign-modal"

type Campaign = {
  row_number?: number
  CampaignName: string
  UserEmail?: string
  IsActive?: boolean
  CreationDate?: string
  CampaignStartDate?: string
  CampaignEndDate?: string
  Description?: string
  Location?: string
  ExpectedAttendees?: string | number
}

export default function ExhibitionsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loadingCampaigns, setLoadingCampaigns] = useState(true)
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchCampaigns()
  }, [])

  const fetchCampaigns = async () => {
    try {
      setLoadingCampaigns(true)
      const response = await fetch("/api/campaigns")
      const data = await response.json()

      if (response.ok) {
        setCampaigns(data.campaigns || [])
      } else {
        console.error("Failed to fetch campaigns:", data.error)
      }
    } catch (error) {
      console.error("Error fetching campaigns:", error)
    } finally {
      setLoadingCampaigns(false)
    }
  }

  const handleEditCampaign = (campaign: Campaign) => {
    setEditingCampaign(campaign)
    setIsEditModalOpen(true)
  }

  const handleEditSuccess = () => {
    fetchCampaigns()
    toast({
      title: "Campaign updated",
      description: "Your campaign has been updated successfully.",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl border-2 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-rose-500/10 dark:from-purple-500/20 dark:via-pink-500/20 dark:to-rose-500/20 p-6">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(white,transparent_85%)]" />
        <div className="relative">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
            Candidates
          </h1>
          <p className="text-muted-foreground mt-1">
            Browse and manage all your hiring campaigns and candidates
          </p>
        </div>
      </div>

      {loadingCampaigns ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <Loader2 className="size-8 animate-spin text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground">Loading campaigns...</p>
          </div>
        </div>
      ) : campaigns.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Active Campaigns</h2>
            <Badge variant="outline" className="text-sm">
              {campaigns.length} {campaigns.length === 1 ? "Campaign" : "Campaigns"}
            </Badge>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {campaigns.map((campaign, index) => (
              <Card
                key={campaign.row_number || index}
                className="group hover:shadow-xl transition-all border-2 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                <CardHeader className="relative">
                  <div className="flex items-start justify-between mb-2">
                    <Badge className={campaign.IsActive ? "bg-emerald-600 text-white" : "bg-gray-500 text-white"}>
                      {campaign.IsActive ? (
                        <>
                          <Play className="size-3 mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <Pause className="size-3 mr-1" />
                          Inactive
                        </>
                      )}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{campaign.CampaignName}</CardTitle>
                  {campaign.Description && (
                    <CardDescription className="line-clamp-2">{campaign.Description}</CardDescription>
                  )}
                </CardHeader>

                <CardContent className="relative space-y-3">
                  {campaign.CampaignStartDate && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="size-4 text-emerald-600" />
                      <span>
                        {new Date(campaign.CampaignStartDate).toLocaleDateString()}
                        {campaign.CampaignEndDate && ` - ${new Date(campaign.CampaignEndDate).toLocaleDateString()}`}
                      </span>
                    </div>
                  )}
                  {campaign.Location && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="size-4 text-blue-600" />
                      <span>{campaign.Location}</span>
                    </div>
                  )}
                  {campaign.ExpectedAttendees && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="size-4 text-purple-600" />
                      <span>{campaign.ExpectedAttendees} Expected</span>
                    </div>
                  )}
                  {campaign.CreationDate && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="size-4 text-blue-600" />
                      <span>Created {new Date(campaign.CreationDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="relative flex gap-2">
                  <Button asChild variant="default" className="flex-1 gap-2 group/btn">
                    <Link href={`/exhibitions/campaign/${encodeURIComponent(campaign.CampaignName)}`}>
                      View Details
                      <ArrowRight className="size-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEditCampaign(campaign)}
                    title="Edit Campaign"
                  >
                    <Edit className="size-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center">
          <div className="size-16 rounded-full bg-muted flex items-center justify-center">
            <Users className="size-8 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-semibold">No campaigns found</h3>
            <p className="text-muted-foreground">Create a campaign from the Campaigns section to get started.</p>
          </div>
        </div>
      )}

      {editingCampaign && (
        <EditCampaignModal
          campaign={editingCampaign}
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  )
}
