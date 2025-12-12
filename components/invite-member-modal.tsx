"use client"

import { useState, useEffect, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mail, X, UserPlus, Search, Loader2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function InviteMemberModal({ open, onClose, pod, onMemberAdded }: {
  open: boolean
  onClose: () => void
  pod: any
  onMemberAdded?: () => void
}) {
  const [activeTab, setActiveTab] = useState<"invite" | "direct">("direct")
  const [email, setEmail] = useState("")
  const [isInviting, setIsInviting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  
  // Direct add state
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isAdding, setIsAdding] = useState<string | null>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)

    if (!email.trim()) {
      setError("Email is required")
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address")
      return
    }

    setIsInviting(true)

    try {
      const response = await fetch(`/api/pods/${pod.id}/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setEmail("")
        setTimeout(() => {
          onClose()
          setSuccess(false)
        }, 2000)
      } else {
        // Check for specific error messages
        if (data.error?.includes("does not exist") || data.error?.includes("must sign up")) {
          setError("This user is not signed up in WACE. They must create an account first.")
        } else {
          setError(data.error || "Failed to send invitation")
        }
      }
    } catch (error) {
      console.error("Error inviting member:", error)
      setError("Failed to send invitation. Please try again.")
    } finally {
      setIsInviting(false)
    }
  }

  // Search users for direct add
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (searchQuery.length < 2) {
      setSearchResults([])
      return
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true)
      try {
        const response = await fetch(`/api/user/search?q=${encodeURIComponent(searchQuery)}`)
        const data = await response.json()
        if (response.ok) {
          setSearchResults(data.users || [])
        }
      } catch (error) {
        console.error("Error searching users:", error)
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery])

  const handleDirectAdd = async (userId: string) => {
    setIsAdding(userId)
    setError("")
    
    try {
      const response = await fetch(`/api/pods/${pod.id}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setSearchQuery("")
        setSearchResults([])
        if (onMemberAdded) {
          onMemberAdded()
        }
        setTimeout(() => {
          onClose()
          setSuccess(false)
        }, 1500)
      } else {
        setError(data.error || "Failed to add member")
      }
    } catch (error) {
      console.error("Error adding member:", error)
      setError("Failed to add member. Please try again.")
    } finally {
      setIsAdding(null)
    }
  }

  const handleClose = () => {
    setEmail("")
    setSearchQuery("")
    setSearchResults([])
    setError("")
    setSuccess(false)
    setActiveTab("direct")
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
                Add Member
              </DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-white mt-1">
                Add a user to <strong>{pod?.name}</strong>
              </DialogDescription>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 dark:text-white hover:text-gray-600 dark:hover:text-black transition"
            >
              <X size={20} />
            </button>
          </div>
        </DialogHeader>

        {success ? (
          <div className="py-12 text-center animate-in fade-in-0 zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4 ring-4 ring-green-50 dark:ring-green-900/20">
              <UserPlus size={36} className="text-green-600 dark:text-green-400" />
            </div>
            <p className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Member Added!
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              The user has been added to the pod successfully.
            </p>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "invite" | "direct")} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100 dark:bg-gray-800">
              <TabsTrigger 
                value="direct" 
                className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900"
              >
                <UserPlus size={16} />
                Add Directly
              </TabsTrigger>
              <TabsTrigger 
                value="invite" 
                className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900"
              >
                <Mail size={16} />
                Send Invitation
              </TabsTrigger>
            </TabsList>

            <TabsContent value="direct" className="space-y-4">
              <div>
                <Label htmlFor="search" className="text-sm font-medium text-gray-700 dark:text-white mb-2 block">
                  Search Users
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    id="search"
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setError("")
                    }}
                    className="pl-10 bg-white dark:bg-black text-gray-900 dark:text-white border-gray-300 dark:border-white"
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-white mt-2">
                  Search for users by name or email to add them directly.
                </p>
              </div>

              {searchQuery.length >= 2 && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg max-h-60 overflow-y-auto shadow-sm">
                  {isSearching ? (
                    <div className="p-6 text-center">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto text-gray-400 dark:text-gray-500" />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Searching...</p>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {searchResults.map((user) => (
                        <div
                          key={user.id}
                          className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <Avatar className="h-9 w-9 ring-2 ring-gray-200 dark:ring-gray-700">
                              <AvatarImage src={user.profilePicture} />
                              <AvatarFallback className="bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-200 text-xs font-semibold">
                                {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {user.name || "No name"}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {user.email}
                              </p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleDirectAdd(user.id)}
                            disabled={isAdding === user.id}
                            className="ml-2 bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 transition-all shadow-sm hover:shadow"
                          >
                            {isAdding === user.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              "Add"
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400">No users found</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Try a different search term</p>
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                  {error}
                </div>
              )}
            </TabsContent>

            <TabsContent value="invite" className="space-y-4">
              <form onSubmit={handleInvite} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-white mb-2 block">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                      id="email"
                      type="email"
                      placeholder="user@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        setError("")
                      }}
                      className="pl-10 bg-white dark:bg-black text-gray-900 dark:text-white border-gray-300 dark:border-white"
                      disabled={isInviting}
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-white mt-2">
                    The user must be signed up in WACE to receive an invitation email.
                  </p>
                </div>

                {error && (
                  <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 rounded-lg animate-in fade-in-0 slide-in-from-top-1">
                    {error}
                  </div>
                )}

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={isInviting}
                    className="dark:bg-black dark:text-white dark:border-white"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isInviting || !email.trim()}
                    className="bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-white"
                  >
                    {isInviting ? "Sending..." : "Send Invitation"}
                  </Button>
                </DialogFooter>
              </form>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  )
}

