"use client"

export default function ManageCampaignsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-6 max-w-md px-6">
        <div className="size-16 mx-auto rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <span className="text-3xl text-red-400 font-bold">!</span>
        </div>
        <h2 className="text-2xl font-bold">Failed to load campaigns</h2>
        <p className="text-muted-foreground text-sm">
          {error.message || "An unexpected error occurred while loading campaigns."}
        </p>
        <button
          onClick={reset}
          className="px-6 py-2.5 bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-xl text-primary transition-all text-sm font-medium"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
