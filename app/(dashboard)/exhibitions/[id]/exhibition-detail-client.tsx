"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  ArrowLeft,
  Share2,
  Calendar,
  MapPin,
  Users,
  MessageSquare,
  ExternalLink,
  CheckCircle2,
  Loader2,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Mock exhibition data - replace with actual API call
const getExhibitionData = (id: string) => {
  return {
    id,
    title: "Tech Innovation Expo 2025",
    description:
      "Join us at the premier technology exhibition showcasing the latest innovations in AI, automation, and digital transformation. Connect with industry leaders and discover cutting-edge solutions.",
    date: "March 15-17, 2025",
    location: "Dubai World Trade Centre",
    attendees: "5000+ Expected",
    status: "Upcoming",
    features: [
      "AI-powered WhatsApp automation demos",
      "Live workflow demonstrations",
      "One-on-one consultations",
      "Networking opportunities",
      "Exclusive product launches",
    ],
    organizer: "Scalepods",
    website: "https://techinnovationexpo.com",
  }
}

export default function ExhibitionDetailClient() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [exhibition, setExhibition] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sharing, setSharing] = useState(false)

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const data = getExhibitionData(params.id as string)
      setExhibition(data)
      setLoading(false)
    }, 500)
  }, [params.id])

  const shareToWhatsApp = () => {
    if (!exhibition) return

    setSharing(true)

    const message = `🎪 ${exhibition.title}\n\n${exhibition.description}\n\n📅 Date: ${exhibition.date}\n📍 Location: ${exhibition.location}\n👥 Expected Attendees: ${exhibition.attendees}\n\n✨ Highlights:\n${exhibition.features.map((f: string) => `• ${f}`).join("\n")}\n\n🔗 Learn more: ${typeof window !== "undefined" ? window.location.href : ""}`

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")

    setTimeout(() => {
      setSharing(false)
      toast({
        title: "Opening WhatsApp...",
        description: "Share this exhibition with your contacts!",
      })
    }, 500)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="size-12 animate-spin text-muted-foreground mx-auto" />
          <p className="text-muted-foreground">Loading exhibition details...</p>
        </div>
      </div>
    )
  }

  if (!exhibition) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Exhibition Not Found</CardTitle>
            <CardDescription>The exhibition you're looking for doesn't exist.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.back()} variant="outline" className="gap-2">
              <ArrowLeft className="size-4" />
              Go Back
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button onClick={() => router.back()} variant="outline" size="icon" className="shrink-0">
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{exhibition.title}</h1>
          <p className="text-muted-foreground mt-1">Organized by {exhibition.organizer}</p>
        </div>
        <Badge className="bg-emerald-600 text-white">{exhibition.status}</Badge>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Exhibition Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description Card */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>About This Exhibition</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{exhibition.description}</p>
            </CardContent>
          </Card>

          {/* Key Information */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                <Calendar className="size-5 text-emerald-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm">Date & Time</h4>
                  <p className="text-sm text-muted-foreground mt-1">{exhibition.date}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                <MapPin className="size-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm">Location</h4>
                  <p className="text-sm text-muted-foreground mt-1">{exhibition.location}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                <Users className="size-5 text-purple-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm">Expected Attendance</h4>
                  <p className="text-sm text-muted-foreground mt-1">{exhibition.attendees}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features & Highlights */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>What to Expect</CardTitle>
              <CardDescription>Key highlights and features of this exhibition</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {exhibition.features.map((feature: string, index: number) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="size-5 text-emerald-600 mt-0.5 shrink-0" />
                    <p className="text-sm text-muted-foreground">{feature}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Actions */}
        <div className="space-y-6">
          {/* Share to WhatsApp Card */}
          <Card className="border-2 bg-gradient-to-br from-green-500/5 to-emerald-500/5 dark:from-green-500/10 dark:to-emerald-500/10">
            <CardHeader>
              <div className="flex items-center justify-center size-14 rounded-2xl bg-gradient-to-br from-green-600 to-emerald-600 shadow-lg shadow-green-500/30 mb-4">
                <Share2 className="size-7 text-white" />
              </div>
              <CardTitle>Share on WhatsApp</CardTitle>
              <CardDescription>
                Share this exhibition with your contacts, colleagues, or potential attendees directly through WhatsApp.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Alert className="border-2 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20 border-emerald-300 dark:border-emerald-800">
                <MessageSquare className="size-4 text-emerald-600 dark:text-emerald-400" />
                <AlertTitle className="text-sm font-bold text-emerald-900 dark:text-emerald-100">
                  What Gets Shared
                </AlertTitle>
                <AlertDescription className="text-xs mt-2 text-emerald-800 dark:text-emerald-200 space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-3" />
                    <span>Exhibition title and description</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-3" />
                    <span>Date, location, and attendance info</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-3" />
                    <span>Key features and highlights</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-3" />
                    <span>Direct link to this page</span>
                  </div>
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter>
              <Button
                onClick={shareToWhatsApp}
                disabled={sharing}
                size="lg"
                className="w-full gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg shadow-green-500/30"
              >
                {sharing ? (
                  <>
                    <Loader2 className="size-5 animate-spin" />
                    Opening WhatsApp...
                  </>
                ) : (
                  <>
                    <Share2 className="size-5" />
                    Share on WhatsApp
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          {/* Visit Website Card */}
          {exhibition.website && (
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-lg">Official Website</CardTitle>
                <CardDescription>Visit the exhibition website for more information</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button asChild variant="outline" size="lg" className="w-full gap-2 group bg-transparent">
                  <a href={exhibition.website} target="_blank" rel="noopener noreferrer">
                    Visit Website
                    <ExternalLink className="size-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* Quick Actions */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                <Calendar className="size-4" />
                Add to Calendar
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
                <MessageSquare className="size-4" />
                Contact Organizer
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
