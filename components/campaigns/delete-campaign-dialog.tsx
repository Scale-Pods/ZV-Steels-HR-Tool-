"use client"

import { useState, useEffect } from "react"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface DeleteCampaignDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  campaignName: string;
}

export function DeleteCampaignDialog({ isOpen, onClose, onConfirm, campaignName }: DeleteCampaignDialogProps) {
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    if (isOpen) {
      setCountdown(5)
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [isOpen])

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="border-red-500/20 bg-card">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-red-500/10">
              <AlertTriangle className="size-5 text-red-500" />
            </div>
            <AlertDialogTitle className="text-xl">Delete Campaign</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-3 text-base">
            This action <strong>cannot be reversed</strong>. This will permanently delete 
            <span className="font-semibold text-foreground"> "{campaignName}" </span> 
            and all of its associated candidate data will be gone forever.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4 gap-2 sm:gap-0">
          <AlertDialogCancel onClick={onClose} className="mt-0">Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm()
              onClose()
            }}
            disabled={countdown > 0}
            className="w-full sm:w-auto relative overflow-hidden group transition-all"
          >
            {countdown > 0 ? (
              <span className="tabular-nums">Delete in {countdown}s</span>
            ) : (
              "Yes, Delete Campaign"
            )}
            {/* Countdown progress background */}
            {countdown > 0 && (
              <div 
                className="absolute left-0 bottom-0 h-1 bg-black/20" 
                style={{ width: `${(countdown / 5) * 100}%`, transition: 'width 1s linear' }}
              />
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
