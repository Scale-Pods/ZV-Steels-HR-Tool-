import { Suspense } from "react"
import CampaignDetailClient from "./campaign-detail-client"
import { Loader2 } from "lucide-react"

export default function CampaignPage({ params }: { params: { campaignName: string } }) {
  const campaignName = decodeURIComponent(params.campaignName)

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-slate-950">
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="size-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="size-8 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin-reverse" />
              </div>
            </div>
            <p className="text-slate-400 font-medium animate-pulse">Initializing Campaign Intelligence...</p>
          </div>
        </div>
      }
    >
      <CampaignDetailClient campaignName={campaignName} />
    </Suspense>
  )
}
