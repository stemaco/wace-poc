"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Users, Mail } from "lucide-react"
import InviteMemberModal from "./invite-member-modal"

export default function PodDetailsModal({ open, onClose, pod, user }: {
  open: boolean
  onClose: () => void
  pod: any
  user: any
}) {
  const [podDetails, setPodDetails] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showInviteModal, setShowInviteModal] = useState(false)

  useEffect(() => {
    if (open && pod?.id) {
      fetchPodDetails()
    }
  }, [open, pod?.id])

  const fetchPodDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/pods/${pod.id}`)
      if (response.ok) {
        const data = await response.json()
        setPodDetails(data.pod)
      }
    } catch (error) {
      console.error("Error fetching pod details:", error)
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
            <div className="flex items-center justify-center py-8">
              <p className="text-gray-600 dark:text-white">Loading...</p>
            </div>
          ) : podDetails ? (
            <div className="space-y-6">
              {/* Pod Header */}
              <div className="flex items-start gap-4">
                {podDetails.logoUrl ? (
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-200 dark:bg-white flex-shrink-0">
                    <img
                      src={podDetails.logoUrl}
                      alt={podDetails.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-gray-200 dark:bg-white flex items-center justify-center flex-shrink-0">
                    <span className="text-gray-700 dark:text-black font-bold text-2xl">
                      {podDetails.name?.charAt(0).toUpperCase() || "P"}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    {podDetails.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-white">
                    {podDetails.tagline || "No tagline"}
                  </p>
                </div>
              </div>

              {/* Member Count */}
              <div className="flex items-center gap-2 p-4 bg-gray-50 dark:bg-white rounded-lg">
                <Users size={20} className="text-gray-600 dark:text-black" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-black">
                    {podDetails.memberCount || 0} {podDetails.memberCount === 1 ? 'Member' : 'Members'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-black">
                    People with access to this pod
                  </p>
                </div>
              </div>

              {/* Invite Button - Only for creator */}
              {isCreator && (
                <Button
                  onClick={() => setShowInviteModal(true)}
                  className="w-full bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-white"
                >
                  <Mail size={16} className="mr-2" />
                  Invite Members
                </Button>
              )}

              {/* Pod Info */}
              <div className="pt-4 border-t border-gray-200 dark:border-white">
                <p className="text-xs text-gray-500 dark:text-white">
                  Created {new Date(podDetails.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <p className="text-gray-600 dark:text-white">Failed to load pod details</p>
            </div>
          )}
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

