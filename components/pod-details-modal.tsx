"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { Users, Mail, Calendar, AlertCircle } from "lucide-react"
import InviteMemberModal from "./invite-member-modal"

export default function PodDetailsModal({ open, onClose, pod, user }: {
  open: boolean
  onClose: () => void
  pod: any
  user: any
}) {
  const [podDetails, setPodDetails] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showInviteModal, setShowInviteModal] = useState(false)

  useEffect(() => {
    if (open && pod?.id) {
      fetchPodDetails()
    } else if (!open) {
      // Reset state when modal closes
      setPodDetails(null)
      setError(null)
      setLoading(true)
    }
  }, [open, pod?.id])

  const fetchPodDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/pods/${pod.id}`)
      if (response.ok) {
        const data = await response.json()
        setPodDetails(data.pod)
      } else {
        setError("Failed to load pod details")
      }
    } catch (error) {
      console.error("Error fetching pod details:", error)
      setError("Failed to load pod details")
    } finally {
      setLoading(false)
    }
  }

  const isCreator = user && podDetails?.creatorId === user.id

  if (!open) return null

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              Pod Details
            </DialogTitle>
          </DialogHeader>

          {loading ? (
            <div className="space-y-6 py-4">
              {/* Skeleton for Pod Header */}
              <div className="flex items-start gap-4">
                <Skeleton className="w-20 h-20 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-64" />
                </div>
              </div>
              
              {/* Skeleton for Member Count */}
              <Skeleton className="h-20 w-full rounded-lg" />
              
              {/* Skeleton for Button */}
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {error}
                </p>
                <p className="text-sm text-gray-500 dark:text-white">
                  Please try again later
                </p>
              </div>
              <Button
                onClick={fetchPodDetails}
                variant="outline"
                className="mt-4"
              >
                Retry
              </Button>
            </div>
          ) : podDetails ? (
            <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
              {/* Pod Header */}
              <div className="flex items-start gap-4">
                {podDetails.logoUrl ? (
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 dark:bg-white flex-shrink-0 ring-2 ring-gray-200 dark:ring-white/20 shadow-sm">
                    <img
                      src={podDetails.logoUrl}
                      alt={podDetails.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 dark:from-white/10 dark:to-white/10 flex items-center justify-center flex-shrink-0 ring-2 ring-gray-200 dark:ring-white/20 shadow-sm">
                    <span className="text-gray-700 dark:text-black font-bold text-2xl">
                      {podDetails.name?.charAt(0).toUpperCase() || "P"}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 truncate">
                    {podDetails.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-white line-clamp-2">
                    {podDetails.tagline || "No tagline provided"}
                  </p>
                </div>
              </div>

              {/* Member Count */}
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-black dark:to-black rounded-xl border border-gray-200 dark:border-white/20 transition-all hover:shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-white flex items-center justify-center flex-shrink-0">
                  <Users size={20} className="text-blue-600 dark:text-black" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {podDetails.memberCount || 0} {podDetails.memberCount === 1 ? 'Member' : 'Members'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-white">
                    People with access to this pod
                  </p>
                </div>
              </div>

              {/* Invite Button - Only for creator */}
              {isCreator && (
                <Button
                  onClick={() => setShowInviteModal(true)}
                  className="w-full bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 transition-all shadow-sm hover:shadow-md"
                  size="lg"
                >
                  <Mail size={18} className="mr-2" />
                  Invite Members
                </Button>
              )}

              {/* Pod Info */}
              <div className="pt-4 border-t border-gray-200 dark:border-white/20">
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-white">
                  <Calendar size={14} />
                  <span>
                    Created {new Date(podDetails.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {showInviteModal && podDetails && (
        <InviteMemberModal
          open={showInviteModal}
          onClose={() => {
            setShowInviteModal(false)
            fetchPodDetails() // Refresh member count
          }}
          onMemberAdded={() => {
            fetchPodDetails() // Refresh immediately when member is added
          }}
          pod={podDetails}
        />
      )}
    </>
  )
}

