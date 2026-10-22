import { Suspense } from "react"
import { InfinityLoop } from "@/components/ui/infinity";
import CampaignDetailClient from "./campaign-detail-client"

export default function CampaignPage({ params }: { params: { campaignName: string } }) {
  const campaignName = decodeURIComponent(params.campaignName)

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-slate-950">
          <div className="text-center space-y-4">
            <InfinityLoop className="size-16 text-emerald-500 mx-auto" />
            <p className="text-slate-400 font-medium animate-pulse">Initializing Campaign Intelligence...</p>
          </div>
        </div>
      }
    >
      <CampaignDetailClient campaignName={campaignName} />
    </Suspense>
  )
}
