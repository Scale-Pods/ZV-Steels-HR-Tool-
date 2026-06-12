"use client"

export default function ExhibitionsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950">
      <div className="text-center space-y-6 max-w-md px-6">
        <div className="size-16 mx-auto rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <span className="text-3xl">!</span>
        </div>
        <h2 className="text-2xl font-bold text-white">Something went wrong</h2>
        <p className="text-slate-400 text-sm">
          {error.message || "An unexpected error occurred while loading exhibitions."}
        </p>
        <button
          onClick={reset}
          className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/80 hover:text-white transition-all text-sm font-medium"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
