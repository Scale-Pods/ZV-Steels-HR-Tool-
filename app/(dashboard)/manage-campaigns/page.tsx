"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CreateCampaignForm } from "@/components/campaigns/create-campaign-form"
import { CampaignsList, type CampaignsListRef } from "@/components/campaigns/campaigns-list"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, Brain, Award, Target, Plus, X } from "lucide-react"
import { cn } from "@/lib/utils"

export default function ManageCampaignsPage() {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const campaignsListRef = useRef<CampaignsListRef>(null)

  const features = [
    {
      icon: <Upload className="size-5" />,
      title: "Bulk Resume Upload",
      description: "Upload multiple resumes in ZIP format for automated processing and parsing",
      color: "text-emerald-500",
      bg: "bg-emerald-500/10"
    },
    {
      icon: <Brain className="size-5" />,
      title: "AI-Powered Analysis",
      description: "Intelligent analysis of candidate strengths, gaps, and role fit using OpenAI",
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    {
      icon: <Award className="size-5" />,
      title: "Smart Scoring System",
      description: "Automated candidate scoring based on job description and qualifications",
      color: "text-violet-500",
      bg: "bg-violet-500/10"
    },
    {
      icon: <Target className="size-5" />,
      title: "Multi-Round Tracking",
      description: "Track candidates through multiple interview rounds with decision workflow",
      color: "text-amber-500",
      bg: "bg-amber-500/10"
    },
  ]

  return (
    <div className="space-y-12 px-6">
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Hiring Campaigns</h1>
            <p className="text-muted-foreground text-sm md:text-base">Manage and track your active recruitment drives.</p>
          </div>
          <Button 
            onClick={() => setShowCreateForm(!showCreateForm)}
            variant={showCreateForm ? "outline" : "default"}
            className={cn(
              "w-full sm:w-auto gap-2 h-10 px-6 font-semibold transition-all active:scale-95 shadow-md",
              !showCreateForm && "bg-violet-600 hover:bg-violet-700 text-white"
            )}
          >
            {showCreateForm ? (
              <>
                <X className="size-4" />
                Cancel
              </>
            ) : (
              <>
                <Plus className="size-4" />
                Create New Campaign
              </>
            )}
          </Button>
        </div>

        <AnimatePresence>
          {showCreateForm && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 24 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              className="rounded-2xl overflow-hidden border border-violet-500/20 shadow-2xl shadow-violet-500/5"
            >
              <CreateCampaignForm onSuccess={() => {
                setShowCreateForm(false)
                campaignsListRef.current?.refetch()
              }} />
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <section className="space-y-4 border-t border-border/50 pt-10">
        <div className="flex items-center gap-2 mb-4">
          <Award className="size-5 text-violet-400" />
          <h2 className="text-2xl font-bold">Expert Active Listing</h2>
        </div>
        <CampaignsList ref={campaignsListRef} />
      </section>
      
      <section className="space-y-8 border-t border-border/50 pt-10 pb-20">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Platform Capabilities</h2>
          <p className="text-muted-foreground text-lg">Everything you need to scale your hiring process.</p>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <Card key={index} className="bg-card/30 border-border/50 shadow-sm hover:shadow-md transition-all duration-300 group">
              <CardHeader>
                <div className={`size-12 rounded-xl ${feature.bg} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                  <span className={feature.color}>{feature.icon}</span>
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
                <CardDescription className="text-sm leading-relaxed">{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
