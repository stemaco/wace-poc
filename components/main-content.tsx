"use client"

import { Bell, FileText, File, Video, Calendar, Target, ChevronDown, ArrowLeft, Plus, MessageCircle, Users, X, Smile, Clock, MapPin, CheckCircle2, Circle, Edit, Share2, Search, MoreVertical, Upload, LogOut, Trash2, Crown, Download } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import DeletePodModal from "./delete-pod-modal"
import DeleteBlockModal from "./delete-block-modal"
import PodDetailsModal from "./pod-details-modal"
import AddMembersToBlockModal from "./add-members-to-block-modal"
import EmojiPicker from "./emoji-picker"
import MentionAutocomplete from "./mention-autocomplete"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Spinner } from "@/components/ui/spinner"
import { ThemeToggle } from "@/components/theme-toggle"
import { useRouter } from "next/navigation"

export default function MainContent({ activeView, activePod, onPodClick, onBackToDashboard, onNavigate, isLoading = false, pods = [], user = null, onPodsUpdate }: {
  activeView: string
  activePod: any
  onPodClick: (pod: any) => void
  onBackToDashboard: () => void
  onNavigate: (view: string, pod?: any) => void
  isLoading?: boolean
  pods?: any[]
  user?: any
  onPodsUpdate?: () => void
}) {
  const router = useRouter()

  const handleLogout = async () => {
    await fetch("/api/auth/signout", { method: "POST" })
    router.push('/login')
    router.refresh()
  }

  if (activeView === "canvas") {
    return <PodCanvas podName={activePod?.name || activePod} pod={activePod} onBack={onBackToDashboard} isLoading={isLoading} user={user} />
  }

  const [notifications, setNotifications] = useState<any[]>([])
  const [notificationsLoading, setNotificationsLoading] = useState(true)

  // Fetch notifications
  useEffect(() => {
    fetchNotifications()
    // Poll for notifications every 30 seconds (reduced from 5 seconds)
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications/unread")
      if (response.ok) {
        const data = await response.json()
        const formattedNotifications = data.notifications.map((notif: any) => ({
          id: notif.blockId,
          title: `New messages in ${notif.podName}`,
          message: `${notif.unreadCount} unread message${notif.unreadCount > 1 ? 's' : ''} in ${notif.blockName}`,
          time: "Just now",
          unread: true,
          blockId: notif.blockId,
          podId: notif.podId,
        }))
        setNotifications(formattedNotifications)
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setNotificationsLoading(false)
    }
  }

  const unreadCount = notifications.filter((n) => n.unread).length

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-black">
      {/* Top Navigation */}
      <div className="bg-white dark:bg-black border-b border-gray-200 dark:border-white px-8 py-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Popover>
            <PopoverTrigger asChild>
              <button 
                className="relative p-2 hover:bg-gray-100 dark:hover:bg-white rounded-lg transition"
                suppressHydrationWarning
              >
            <Bell size={20} className="text-gray-600 dark:text-white" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 bg-white dark:bg-black border-gray-200 dark:border-white" align="end">
              <div className="p-4 border-b border-gray-200 dark:border-white">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="text-xs text-gray-500 dark:text-white">{unreadCount} new</span>
                  )}
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notificationsLoading ? (
                  <div className="p-8 text-center text-gray-500 dark:text-white">
                    <p>Loading notifications...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 dark:text-white">
                    <p>No notifications</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200 dark:divide-white">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={async () => {
                          // Mark as read when clicked
                          try {
                            await fetch(`/api/blocks/${notification.blockId}/unread`, {
                              method: "POST",
                            })
                            // Remove notification from list
                            setNotifications((prev) => prev.filter((n) => n.id !== notification.id))
                          } catch (error) {
                            console.error("Error marking notification as read:", error)
                          }
                        }}
                        className={`p-4 hover:bg-gray-50 dark:hover:bg-white transition cursor-pointer ${
                          notification.unread ? "bg-blue-50 dark:bg-white" : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {notification.unread && (
                            <div className="w-2 h-2 bg-blue-500 dark:bg-white rounded-full mt-2 flex-shrink-0"></div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-white mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-white mt-1">
                              {notification.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {notifications.length > 0 && (
                <div className="p-3 border-t border-gray-200 dark:border-white">
                  <button 
                    onClick={async () => {
                      // Mark all notifications as read
                      for (const notification of notifications) {
                        try {
                          await fetch(`/api/blocks/${notification.blockId}/unread`, {
                            method: "POST",
                          })
                        } catch (error) {
                          console.error("Error marking notification as read:", error)
                        }
                      }
                      setNotifications([])
                    }}
                    className="w-full text-sm text-blue-600 dark:text-black hover:text-blue-700 dark:hover:text-white font-medium"
                  >
                    Mark all as read
                  </button>
                </div>
              )}
            </PopoverContent>
          </Popover>
          <button
            onClick={() => onNavigate("marketplace")}
            className="px-4 py-2 text-sm font-medium text-white dark:text-black bg-gray-800 dark:bg-white rounded-lg hover:bg-gray-900 dark:hover:bg-white transition"
          >
            Upgrade
          </button>
          <button
            onClick={() => onNavigate("settings")}
            className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-white rounded-lg transition p-1"
          >
            {user?.profilePicture ? (
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <img
                  src={user.profilePicture}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-10 h-10 bg-gray-300 dark:bg-white rounded-full flex items-center justify-center text-gray-700 dark:text-black font-semibold">
                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
            )}
            <ChevronDown size={16} className="text-gray-600 dark:text-white" />
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-white rounded-lg transition"
            title="Log out"
          >
            <LogOut size={16} />
            <span>Log out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-white dark:bg-black">
        <div className="p-8">
          {/* Welcome Text */}
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8">
            {user?.name ? `Welcome back, ${user.name}!` : "Welcome back!"} {pods.length === 0 ? "Create your first pod to get started." : "Here's what's happening with your Pods."}
          </h2>

          {/* Pod Cards Grid */}
          {pods.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="text-center">
                <p className="text-gray-600 dark:text-white text-lg mb-4">
                  You don't have any pods yet.
                </p>
                <p className="text-gray-500 dark:text-white mb-6">
                  Create your first pod to start collaborating!
                </p>
                <button
                  onClick={() => onNavigate("create-pod")}
                  className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-white transition font-medium"
                >
                  Create Your First Pod
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-6">
              {pods.map((pod) => (
                <PodCard
                  key={pod.id}
                  pod={pod}
                  image={pod.logoUrl || "/placeholder.svg"}
                  name={pod.name}
                  tagline={pod.tagline || ""}
                  onClick={() => onPodClick(pod)}
                  onDelete={() => {
                    if (onPodsUpdate) onPodsUpdate()
                  }}
                  user={user}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function PodCard({ pod, image, name, tagline, onClick, onDelete, user }: {
  pod: any
  image: string
  name: string
  tagline: string
  onClick: () => void
  onDelete: () => void
  user: any
}) {
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [isCreator, setIsCreator] = useState(false)

  useEffect(() => {
    // Check if current user is the creator based on role
    if (pod && pod.role === 'creator') {
      setIsCreator(true)
    }
  }, [pod])

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowDeleteModal(true)
  }

  return (
    <>
      <div className="group bg-white dark:bg-black rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-200 dark:border-white relative">
        <button
          onClick={onClick}
          className="w-full text-left cursor-pointer"
        >
          <div className="relative h-56 overflow-hidden bg-gray-200 dark:bg-white">
            <img
              src={image || "/placeholder.svg"}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {/* 3-dot menu */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowDetailsModal(true)
              }}
              className="absolute top-2 right-2 p-2 bg-white dark:bg-black text-gray-600 dark:text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-gray-100 dark:hover:bg-white"
              title="Pod options"
            >
              <MoreVertical size={16} />
            </button>
            {isCreator && (
              <button
                onClick={handleDeleteClick}
                className="absolute top-2 right-12 p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                title="Delete pod"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
          <div className="p-5">
            <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">{name}</h3>
            <p className="text-sm text-gray-500 dark:text-white">{tagline}</p>
          </div>
        </button>
      </div>
      {showDeleteModal && (
        <DeletePodModal
          open={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          pod={pod}
          onDelete={onDelete}
        />
      )}
      {showDetailsModal && (
        <PodDetailsModal
          open={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          pod={pod}
          user={user}
        />
      )}
    </>
  )
}

function PodCanvas({ podName, pod, onBack, isLoading, user }: {
  podName?: string
  pod?: any
  onBack: () => void
  isLoading: boolean
  user?: any
}) {
  // Use pod object if available, otherwise fallback to podName string
  const podData = pod || { name: podName, tagline: "", id: null }

  const [activeSection, setActiveSection] = useState("chat")
  const [blocks, setBlocks] = useState({
    chat: [],
    docs: [],
    meetings: [],
    calendar: [],
    goals: [],
  })
  const [blocksLoading, setBlocksLoading] = useState(true)
  const [showCreateChatModal, setShowCreateChatModal] = useState(false)
  const [showCreateDocModal, setShowCreateDocModal] = useState(false)
  const [showCreateCalendarModal, setShowCreateCalendarModal] = useState(false)
  const [showCreateGoalModal, setShowCreateGoalModal] = useState(false)
  const [showMeetingDevModal, setShowMeetingDevModal] = useState(false)
  const [showDeleteBlockModal, setShowDeleteBlockModal] = useState(false)
  const [blockToDelete, setBlockToDelete] = useState(null)
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({})

  // Fetch blocks from API when pod is loaded
  useEffect(() => {
    if (podData?.id) {
      fetchBlocks()
    } else {
      setBlocksLoading(false)
    }
  }, [podData?.id])

  // Fetch unread counts when blocks are loaded
  useEffect(() => {
    if (blocks.chat && blocks.chat.length > 0) {
      fetchUnreadCounts()
      // Poll for unread counts every 30 seconds (reduced from 5 seconds)
      const interval = setInterval(fetchUnreadCounts, 30000)
      return () => clearInterval(interval)
    }
  }, [blocks.chat])

  const fetchBlocks = async () => {
    try {
      const response = await fetch(`/api/blocks?podId=${podData.id}`)
      if (response.ok) {
        const data = await response.json()
        // Organize blocks by type and ensure id field is set
        const organizedBlocks = {
          chat: [],
          docs: [],
          meetings: [],
          calendar: [],
          goals: [],
        }
        data.blocks.forEach((block) => {
          if (organizedBlocks[block.type]) {
            organizedBlocks[block.type].push({
              ...block,
              id: block._id || block.id, // Ensure id field exists
            })
          }
        })
        setBlocks(organizedBlocks)
      }
    } catch (error) {
      console.error("Error fetching blocks:", error)
    } finally {
      setBlocksLoading(false)
    }
  }

  const fetchUnreadCounts = async () => {
    try {
      // Use current blocks state
      const chatBlocks = blocks.chat || []
      if (chatBlocks.length === 0) {
        return // No blocks to check
      }
      
      const counts: Record<string, number> = {}
      
      // Fetch unread counts for all chat blocks in parallel
      const promises = chatBlocks.map(async (block: any) => {
        try {
          const response = await fetch(`/api/blocks/${block.id}/unread`)
          if (response.ok) {
            const data = await response.json()
            return { blockId: block.id, count: data.unreadCount || 0 }
          }
        } catch (error) {
          console.error(`Error fetching unread count for block ${block.id}:`, error)
        }
        return { blockId: block.id, count: 0 }
      })
      
      const results = await Promise.all(promises)
      results.forEach(({ blockId, count }) => {
        counts[blockId] = count
      })
      
      setUnreadCounts(counts)
    } catch (error) {
      console.error("Error fetching unread counts:", error)
    }
  }

  // Blocks are fetched from API - no hardcoded data
  const [selectedBox, setSelectedBox] = useState<string | null>(null)
  const [openingBox, setOpeningBox] = useState<string | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragStart, setDragStart] = useState({ mouseX: 0, mouseY: 0, blockX: 0, blockY: 0 })
  const [pendingDrag, setPendingDrag] = useState<{ boxId: string | null, initialPos: { x: number, y: number } | null, delay: NodeJS.Timeout | null }>({ boxId: null, initialPos: null, delay: null })
  
  // Canvas panning state
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 })

  // Get blocks for the active section
  const currentBlocks = blocks[activeSection] || []

  const handleDoubleClick = async (e: any, boxId: string) => {
    e.stopPropagation()
    e.preventDefault()
    
    // Prevent multiple clicks
    if (openingBox || selectedBox === boxId) return
    
    setOpeningBox(boxId)
    
    // Cancel any pending drag immediately
    if (pendingDrag.delay) {
      clearTimeout(pendingDrag.delay)
      setPendingDrag({ boxId: null, initialPos: null, delay: null })
    }
    
    // Cancel any active dragging
    setDraggingId(null)
    
    // Check block access before opening
    const box = currentBlocks.find((b: any) => b.id === boxId)
    if (!box) {
      setOpeningBox(null)
      return
    }

    // Check if user is creator or has block access (only for chat and docs)
    const isCreator = user && box.creatorId === user.id
    
    if ((box.type === "chat" || box.type === "docs" || box.type === "calendar" || box.type === "goals") && !isCreator) {
      // Check if user is a block member
      try {
        const response = await fetch(`/api/blocks/${boxId}/members`)
        if (response.ok) {
          const data = await response.json()
          const hasAccess = data.members.some((m: any) => m.id === user?.id)
          if (!hasAccess) {
            alert("You don't have access to this block. Ask the creator to add you.")
            setOpeningBox(null)
            return
          }
        } else {
          // If error, assume no access
          alert("You don't have access to this block. Ask the creator to add you.")
          setOpeningBox(null)
          return
        }
      } catch (error) {
        console.error("Error checking block access:", error)
        alert("Error checking access. Please try again.")
        setOpeningBox(null)
        return
      }
    }
    
    // Small delay to prevent rapid clicks
    setTimeout(() => {
      // Open the modal
      setSelectedBox(boxId)
      setOpeningBox(null)
    }, 100)
  }

  const handleMouseDown = (e, boxId) => {
    e.stopPropagation()
    const box = currentBlocks.find((b) => b.id === boxId)
    if (!box) return
    
    const initialMouseX = e.clientX
    const initialMouseY = e.clientY
    
    // Store initial position for drag detection
    setPendingDrag({ 
      boxId, 
      initialPos: { x: initialMouseX, y: initialMouseY },
      delay: null 
    })
  }

  const handleCanvasMouseDown = (e) => {
    // Only pan if clicking on empty canvas (not on a block or its children)
    if (e.target === e.currentTarget || e.target.classList.contains('canvas-background')) {
      setIsPanning(true)
      setPanStart({
        x: e.clientX - canvasOffset.x,
        y: e.clientY - canvasOffset.y,
      })
      e.preventDefault()
    }
  }

  const handleMouseMove = (e) => {
    // If there's a pending drag and mouse moved significantly, start dragging
    if (pendingDrag.boxId && pendingDrag.initialPos && !draggingId && !isPanning) {
      const mouseMoved = Math.abs(e.clientX - pendingDrag.initialPos.x) > 5 || Math.abs(e.clientY - pendingDrag.initialPos.y) > 5
      if (mouseMoved) {
        const box = currentBlocks.find((b) => b.id === pendingDrag.boxId)
        if (box) {
          setDraggingId(pendingDrag.boxId)
          setDragStart({
            mouseX: e.clientX,
            mouseY: e.clientY,
            blockX: box.x,
            blockY: box.y,
          })
          setPendingDrag({ boxId: null, initialPos: null, delay: null })
        }
      }
    }
    
    if (isPanning) {
      // Pan the canvas
      setCanvasOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      })
    } else if (draggingId !== null) {
      // Move a block: calculate delta from start position
      const deltaX = e.clientX - dragStart.mouseX
      const deltaY = e.clientY - dragStart.mouseY
      
      setBlocks((prev) => ({
        ...prev,
        [activeSection]: prev[activeSection].map((box) =>
          box.id === draggingId
            ? {
                ...box,
                x: dragStart.blockX + deltaX,
                y: dragStart.blockY + deltaY,
                // Preserve all other properties (docData, meetingData, etc.)
              }
            : box
        ),
      }))
    }
  }

  const handleMouseUp = () => {
    // Only clear pending drag if we didn't start dragging
    if (pendingDrag.boxId && !draggingId) {
      setPendingDrag({ boxId: null, initialPos: null, delay: null })
    }
    setDraggingId(null)
    setIsPanning(false)
  }

  return (
    <div
      className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-black relative"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Top Header - No background, floating elements */}
      <div className="absolute top-0 left-0 right-0 z-10 px-8 py-4 flex items-center justify-between pointer-events-none">
        {/* Left: Pod Info - No background */}
        <div className="flex items-center gap-4 pointer-events-auto">
          <button
            onClick={onBack}
            className="p-1.5 text-gray-600 dark:text-white hover:text-gray-900 dark:hover:text-black hover:bg-gray-100 dark:hover:bg-white rounded-lg transition"
            title="Back to Dashboard"
          >
            <ArrowLeft size={18} />
          </button>
            <div className="flex items-center gap-3">
            {podData.logoUrl ? (
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-200 dark:bg-white">
                <img 
                  src={podData.logoUrl} 
                  alt={podData.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-white flex items-center justify-center">
                <span className="text-gray-700 dark:text-black font-bold text-sm">
                  {podData.name ? podData.name.charAt(0).toUpperCase() : "P"}
                </span>
              </div>
            )}
          <div>
              <h2 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wide">{podData.name}</h2>
              <p className="text-xs text-gray-500 dark:text-white">{podData.tagline || "Build. Connect. Dominate"}</p>
            </div>
          </div>
        </div>

        {/* Middle: Floating Nav Bar */}
        <div className="absolute left-1/2 transform -translate-x-1/2 pointer-events-auto">
          <div className="bg-gray-100 dark:bg-white rounded-lg px-3 py-2 flex items-center gap-3 shadow-sm">
            <NavButton
              icon={<MessageCircle size={18} />}
              title="Chat"
              active={activeSection === "chat"}
              onClick={() => {
                setActiveSection("chat")
                setSelectedBox(null)
              }}
            />
            <NavButton
              icon={<File size={18} />}
              title="Docs"
              active={activeSection === "docs"}
              onClick={() => {
                setActiveSection("docs")
                setSelectedBox(null)
              }}
            />
            <NavButton
              icon={<Video size={18} />}
              title="Meetings"
              active={activeSection === "meetings"}
              onClick={() => {
                setActiveSection("meetings")
                setSelectedBox(null)
              }}
            />
            <NavButton
              icon={<Calendar size={18} />}
              title="Calendar"
              active={activeSection === "calendar"}
              onClick={() => {
                setActiveSection("calendar")
                setSelectedBox(null)
              }}
            />
            <NavButton
              icon={<Target size={18} />}
              title="Goals"
              active={activeSection === "goals"}
              onClick={() => {
                setActiveSection("goals")
                setSelectedBox(null)
              }}
            />
          </div>
        </div>

        {/* Right: Create Button (context-aware) */}
        <div className="pointer-events-auto">
          <button 
            onClick={() => {
              if (activeSection === "chat") {
                setShowCreateChatModal(true)
              } else if (activeSection === "docs") {
                setShowCreateDocModal(true)
              } else if (activeSection === "calendar") {
                setShowCreateCalendarModal(true)
              } else if (activeSection === "goals") {
                setShowCreateGoalModal(true)
              } else if (activeSection === "meetings") {
                setShowMeetingDevModal(true)
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black text-sm rounded-lg hover:bg-gray-800 dark:hover:bg-white transition"
          >
            <Plus size={16} />
            <span>
              {activeSection === "chat" && "Create Chat"}
              {activeSection === "docs" && "Create Doc"}
              {activeSection === "meetings" && "Schedule Meeting"}
              {activeSection === "calendar" && "Add Event"}
              {activeSection === "goals" && "Create Goal"}
            </span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center bg-white dark:bg-black">
          <div className="flex flex-col items-center gap-4">
            <Spinner className="w-8 h-8 text-gray-600 dark:text-white" />
            <p className="text-gray-600 dark:text-white font-medium">Loading pod...</p>
          </div>
        </div>
      ) : (
        <div
          className="flex-1 bg-white dark:bg-black relative overflow-hidden canvas-background"
          onMouseDown={handleCanvasMouseDown}
          style={{
            cursor: isPanning ? "grabbing" : draggingId ? "grabbing" : "grab",
          }}
        >
          {/* Infinite Canvas Container with transform for smooth panning */}
          <div
        style={{
              position: "absolute",
              transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px)`,
              width: "10000px",
              height: "10000px",
          backgroundImage:
            "linear-gradient(0deg, #e5e7eb 0.5px, transparent 0.5px), linear-gradient(90deg, #e5e7eb 0.5px, transparent 0.5px)",
          backgroundSize: "40px 40px",
        }}
      >
            {/* Draggable Boxes - Only show blocks for active section */}
            {currentBlocks.map((box: any) => {
              const isCreator = user && box.creatorId === user.id
              return (
                <div
                  key={box.id}
                  onMouseDown={(e: any) => handleMouseDown(e, box.id)}
                  onDoubleClick={(e: any) => handleDoubleClick(e, box.id)}
                  style={{
                    position: "absolute",
                    left: `${box.x}px`,
                    top: `${box.y}px`,
                    cursor: draggingId === box.id ? "grabbing" : "grab",
                  }}
                  className="select-none z-10 group"
                >
                  <div className="bg-black dark:bg-white rounded-2xl px-6 py-8 w-48 h-24 flex items-center justify-center hover:shadow-xl transition-shadow cursor-pointer relative">
                    <p className="text-white dark:text-black font-semibold text-center text-sm">{box.label}</p>
                    {/* Unread message badge - only for chat blocks */}
                    {box.type === "chat" && unreadCounts[box.id] && unreadCounts[box.id] > 0 && (
                      <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 text-xs font-bold z-20">
                        {unreadCounts[box.id] > 9 ? "9+" : unreadCounts[box.id]}
                      </div>
                    )}
                    {isCreator && (
                      <button
                        onClick={(e: any) => {
                          e.stopPropagation()
                          setBlockToDelete(box)
                          setShowDeleteBlockModal(true)
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-600"
                        title="Delete Block"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {selectedBox && activeSection === "chat" && (
            <ChatModal 
              boxId={selectedBox} 
              chatData={currentBlocks.find((b: any) => b.id === selectedBox)}
              podId={podData?.id}
              user={user}
              onClose={() => {
                setSelectedBox(null)
                // Refresh unread counts when chat is closed
                fetchUnreadCounts()
              }}
              onUnreadUpdate={fetchUnreadCounts}
            />
          )}
          {selectedBox && activeSection === "docs" && (
            <DocModal 
              boxId={selectedBox} 
              docData={currentBlocks.find((b: any) => b.id === selectedBox)}
              podId={podData?.id}
              user={user}
              onClose={() => setSelectedBox(null)} 
            />
          )}
          {selectedBox && activeSection === "meetings" && (
            <MeetingModal 
              boxId={selectedBox} 
              meetingData={currentBlocks.find(b => b.id === selectedBox)?.meetingData}
              onClose={() => setSelectedBox(null)} 
            />
          )}
          {selectedBox && activeSection === "calendar" && (
            <CalendarModal 
              boxId={selectedBox} 
              calendarData={currentBlocks.find((b: any) => b.id === selectedBox)}
              podId={podData?.id}
              user={user}
              onClose={() => setSelectedBox(null)} 
            />
          )}
          {selectedBox && activeSection === "goals" && (
            <GoalModal 
              boxId={selectedBox} 
              goalData={currentBlocks.find((b: any) => b.id === selectedBox)}
              podId={podData?.id}
              user={user}
              onClose={() => setSelectedBox(null)} 
            />
          )}
      </div>
      )}

      {/* Create Chat Modal */}
      {podData?.id && (
        <>
          <CreateChatModal
            open={showCreateChatModal}
            onClose={() => setShowCreateChatModal(false)}
            podId={podData.id}
            existingBlocks={blocks.chat || []}
            onCreated={fetchBlocks}
          />
          <CreateDocModal
            open={showCreateDocModal}
            onClose={() => setShowCreateDocModal(false)}
            podId={podData.id}
            existingBlocks={blocks.docs || []}
            onCreated={fetchBlocks}
          />
          <CreateCalendarModal
            open={showCreateCalendarModal}
            onClose={() => setShowCreateCalendarModal(false)}
            podId={podData.id}
            existingBlocks={blocks.calendar || []}
            onCreated={fetchBlocks}
          />
          <CreateGoalModal
            open={showCreateGoalModal}
            onClose={() => setShowCreateGoalModal(false)}
            podId={podData.id}
            existingBlocks={blocks.goals || []}
            onCreated={fetchBlocks}
          />
        </>
      )}

      {/* Meeting Feature Under Development Modal */}
      <FeatureUnderDevModal
        open={showMeetingDevModal}
        onClose={() => setShowMeetingDevModal(false)}
        featureName="Meetings"
      />

      {/* Delete Block Modal */}
      {blockToDelete && (
        <DeleteBlockModal
          open={showDeleteBlockModal}
          onClose={() => {
            setShowDeleteBlockModal(false)
            setBlockToDelete(null)
          }}
          block={blockToDelete}
          onDelete={() => {
            fetchBlocks()
            setBlockToDelete(null)
          }}
        />
      )}
    </div>
  )
}

function NavButton({ icon, title, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-9 h-9 flex items-center justify-center rounded-lg transition ${
        active
          ? "bg-white dark:bg-black text-gray-900 dark:text-white shadow-sm"
          : "text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-black"
      }`}
      title={title}
    >
      {icon}
    </button>
  )
}

function CreateChatModal({ open, onClose, podId, existingBlocks, onCreated }: {
  open: boolean
  onClose: () => void
  podId: string
  existingBlocks?: any[]
  onCreated: () => void
}) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState("")

  // Calculate next position based on existing blocks
  const calculateNextPosition = () => {
    const blockWidth = 192 // w-48 = 192px
    const spacingX = 220 // Horizontal spacing between blocks
    const spacingY = 120 // Vertical spacing between rows
    const startX = 100
    const startY = 100

    if (!existingBlocks || existingBlocks.length === 0) {
      return { x: startX, y: startY }
    }

    // Group blocks by row (Y position) - allow some tolerance for alignment
    const rowTolerance = 50 // Blocks within 50px vertically are considered same row
    const rows: { y: number; blocks: any[] }[] = []

    existingBlocks.forEach((block: any) => {
      // Find existing row with similar Y position
      let foundRow = false
      for (let i = 0; i < rows.length; i++) {
        if (Math.abs(rows[i].y - block.y) < rowTolerance) {
          rows[i].blocks.push(block)
          foundRow = true
          break
        }
      }
      // If no matching row, create new one
      if (!foundRow) {
        rows.push({ y: block.y, blocks: [block] })
      }
    })

    // Sort rows by Y position
    rows.sort((a, b) => a.y - b.y)

    // Get the bottom row (last row)
    if (rows.length === 0) {
      return { x: startX, y: startY }
    }

    const bottomRow = rows[rows.length - 1]
    bottomRow.blocks.sort((a: any, b: any) => a.x - b.x)

    // Find rightmost block in bottom row
    const rightmostBlock = bottomRow.blocks[bottomRow.blocks.length - 1]
    const nextX = rightmostBlock.x + spacingX

    // Check if next block would fit (assuming max width of ~1200px viewport)
    // If not, start new row
    if (nextX + blockWidth > 1200) {
      return { x: startX, y: bottomRow.y + spacingY }
    }

    // Place to the right of rightmost block in current row
    return { x: nextX, y: bottomRow.y }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!name.trim()) {
      setError("Chat name is required")
      return
    }

    setIsCreating(true)

    try {
      const position = calculateNextPosition()
      const response = await fetch("/api/blocks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          podId,
          type: "chat",
          label: name.trim(),
          description: description.trim() || undefined,
          x: position.x,
          y: position.y,
        }),
      })

      if (response.ok) {
        setName("")
        setDescription("")
        onCreated()
        onClose()
      } else {
        const data = await response.json()
        setError(data.error || "Failed to create chat")
      }
    } catch (error) {
      console.error("Error creating chat:", error)
      setError("Failed to create chat. Please try again.")
    } finally {
      setIsCreating(false)
    }
  }

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 bg-black dark:bg-white bg-opacity-20 dark:bg-opacity-20 z-40" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-black rounded-xl shadow-2xl z-50 border border-gray-200 dark:border-white">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Create Chat</h3>
            <button
              onClick={onClose}
              className="text-gray-400 dark:text-white hover:text-gray-600 dark:hover:text-black transition"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="chat-name" className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                Chat Name *
              </label>
              <input
                id="chat-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter chat name"
                className="w-full px-4 py-2 border border-gray-300 dark:border-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-black text-gray-900 dark:text-white"
                disabled={isCreating}
                required
              />
            </div>

            <div>
              <label htmlFor="chat-description" className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                Description
              </label>
              <textarea
                id="chat-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter chat description (optional)"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-black text-gray-900 dark:text-white resize-none"
                disabled={isCreating}
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isCreating}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-white bg-gray-100 dark:bg-white hover:bg-gray-200 dark:hover:bg-white rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating || !name.trim()}
                className="px-4 py-2 text-sm font-medium text-white dark:text-black bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? "Creating..." : "Create Chat"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

function CreateDocModal({ open, onClose, podId, existingBlocks, onCreated }: {
  open: boolean
  onClose: () => void
  podId: string
  existingBlocks?: any[]
  onCreated: () => void
}) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState("")

  // Calculate next position based on existing blocks
  const calculateNextPosition = () => {
    const blockWidth = 192 // w-48 = 192px
    const spacingX = 220 // Horizontal spacing between blocks
    const spacingY = 120 // Vertical spacing between rows
    const startX = 100
    const startY = 100

    if (!existingBlocks || existingBlocks.length === 0) {
      return { x: startX, y: startY }
    }

    // Group blocks by row (Y position) - allow some tolerance for alignment
    const rowTolerance = 50 // Blocks within 50px vertically are considered same row
    const rows: { y: number; blocks: any[] }[] = []

    existingBlocks.forEach((block: any) => {
      // Find existing row with similar Y position
      let foundRow = false
      for (let i = 0; i < rows.length; i++) {
        if (Math.abs(rows[i].y - block.y) < rowTolerance) {
          rows[i].blocks.push(block)
          foundRow = true
          break
        }
      }
      // If no matching row, create new one
      if (!foundRow) {
        rows.push({ y: block.y, blocks: [block] })
      }
    })

    // Sort rows by Y position
    rows.sort((a, b) => a.y - b.y)

    // Get the bottom row (last row)
    if (rows.length === 0) {
      return { x: startX, y: startY }
    }

    const bottomRow = rows[rows.length - 1]
    bottomRow.blocks.sort((a: any, b: any) => a.x - b.x)

    // Find rightmost block in bottom row
    const rightmostBlock = bottomRow.blocks[bottomRow.blocks.length - 1]
    const nextX = rightmostBlock.x + spacingX

    // Check if next block would fit (assuming max width of ~1200px viewport)
    // If not, start new row
    if (nextX + blockWidth > 1200) {
      return { x: startX, y: bottomRow.y + spacingY }
    }

    // Place to the right of rightmost block in current row
    return { x: nextX, y: bottomRow.y }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!name.trim()) {
      setError("Document folder name is required")
      return
    }

    setIsCreating(true)

    try {
      const position = calculateNextPosition()
      const response = await fetch("/api/blocks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          podId,
          type: "docs",
          label: name.trim(),
          description: description.trim() || undefined,
          x: position.x,
          y: position.y,
        }),
      })

      if (response.ok) {
        setName("")
        setDescription("")
        onCreated()
        onClose()
      } else {
        const data = await response.json()
        setError(data.error || "Failed to create document folder")
      }
    } catch (error) {
      console.error("Error creating document folder:", error)
      setError("Failed to create document folder. Please try again.")
    } finally {
      setIsCreating(false)
    }
  }

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 bg-black dark:bg-white bg-opacity-20 dark:bg-opacity-20 z-40" onClick={onClose} />

      <div className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-black rounded-xl shadow-2xl z-50 border border-gray-200 dark:border-white">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create Document Folder</h2>
            <button onClick={onClose} className="text-gray-400 dark:text-white hover:text-gray-600 dark:hover:text-black transition">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                Folder Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Project Documents"
                className="w-full px-3 py-2 border border-gray-300 dark:border-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-black text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description for this folder..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-black text-gray-900 dark:text-white resize-none"
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 dark:text-white bg-gray-100 dark:bg-white rounded-lg hover:bg-gray-200 dark:hover:bg-white transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-white transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? "Creating..." : "Create Folder"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

function CreateCalendarModal({ open, onClose, podId, existingBlocks, onCreated }: {
  open: boolean
  onClose: () => void
  podId: string
  existingBlocks?: any[]
  onCreated: () => void
}) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState("")

  // Calculate next position based on existing blocks
  const calculateNextPosition = () => {
    const blockWidth = 192 // w-48 = 192px
    const spacingX = 220 // Horizontal spacing between blocks
    const spacingY = 120 // Vertical spacing between rows
    const startX = 100
    const startY = 100

    if (!existingBlocks || existingBlocks.length === 0) {
      return { x: startX, y: startY }
    }

    // Group blocks by row (Y position) - allow some tolerance for alignment
    const rowTolerance = 50 // Blocks within 50px vertically are considered same row
    const rows: { y: number; blocks: any[] }[] = []

    existingBlocks.forEach((block: any) => {
      // Find existing row with similar Y position
      let foundRow = false
      for (let i = 0; i < rows.length; i++) {
        if (Math.abs(rows[i].y - block.y) < rowTolerance) {
          rows[i].blocks.push(block)
          foundRow = true
          break
        }
      }
      // If no matching row, create new one
      if (!foundRow) {
        rows.push({ y: block.y, blocks: [block] })
      }
    })

    // Sort rows by Y position
    rows.sort((a, b) => a.y - b.y)

    // Get the bottom row (last row)
    if (rows.length === 0) {
      return { x: startX, y: startY }
    }

    const bottomRow = rows[rows.length - 1]
    bottomRow.blocks.sort((a: any, b: any) => a.x - b.x)

    // Find rightmost block in bottom row
    const rightmostBlock = bottomRow.blocks[bottomRow.blocks.length - 1]
    const nextX = rightmostBlock.x + spacingX

    // Check if next block would fit (assuming max width of ~1200px viewport)
    // If not, start new row
    if (nextX + blockWidth > 1200) {
      return { x: startX, y: bottomRow.y + spacingY }
    }

    // Place to the right of rightmost block in current row
    return { x: nextX, y: bottomRow.y }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!name.trim()) {
      setError("Calendar name is required")
      return
    }

    setIsCreating(true)

    try {
      const position = calculateNextPosition()
      const response = await fetch("/api/blocks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          podId,
          type: "calendar",
          label: name.trim(),
          description: description.trim() || undefined,
          x: position.x,
          y: position.y,
        }),
      })

      if (response.ok) {
        setName("")
        setDescription("")
        onCreated()
        onClose()
      } else {
        const data = await response.json()
        setError(data.error || "Failed to create calendar")
      }
    } catch (error) {
      console.error("Error creating calendar:", error)
      setError("Failed to create calendar. Please try again.")
    } finally {
      setIsCreating(false)
    }
  }

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 bg-black dark:bg-white bg-opacity-20 dark:bg-opacity-20 z-40" onClick={onClose} />

      <div className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-black rounded-xl shadow-2xl z-50 border border-gray-200 dark:border-white">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create Calendar</h2>
            <button onClick={onClose} className="text-gray-400 dark:text-white hover:text-gray-600 dark:hover:text-black transition">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                Calendar Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Team Calendar"
                className="w-full px-3 py-2 border border-gray-300 dark:border-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-black text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description for this calendar..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-black text-gray-900 dark:text-white resize-none"
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 dark:text-white bg-gray-100 dark:bg-white rounded-lg hover:bg-gray-200 dark:hover:bg-white transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-white transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? "Creating..." : "Create Calendar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

function CreateGoalModal({ open, onClose, podId, existingBlocks, onCreated }: {
  open: boolean
  onClose: () => void
  podId: string
  existingBlocks?: any[]
  onCreated: () => void
}) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState("")

  // Calculate next position based on existing blocks
  const calculateNextPosition = () => {
    const blockWidth = 192 // w-48 = 192px
    const spacingX = 220 // Horizontal spacing between blocks
    const spacingY = 120 // Vertical spacing between rows
    const startX = 100
    const startY = 100

    if (!existingBlocks || existingBlocks.length === 0) {
      return { x: startX, y: startY }
    }

    // Group blocks by row (Y position) - allow some tolerance for alignment
    const rowTolerance = 50 // Blocks within 50px vertically are considered same row
    const rows: { y: number; blocks: any[] }[] = []

    existingBlocks.forEach((block: any) => {
      // Find existing row with similar Y position
      let foundRow = false
      for (let i = 0; i < rows.length; i++) {
        if (Math.abs(rows[i].y - block.y) < rowTolerance) {
          rows[i].blocks.push(block)
          foundRow = true
          break
        }
      }
      // If no matching row, create new one
      if (!foundRow) {
        rows.push({ y: block.y, blocks: [block] })
      }
    })

    // Sort rows by Y position
    rows.sort((a, b) => a.y - b.y)

    // Get the bottom row (last row)
    if (rows.length === 0) {
      return { x: startX, y: startY }
    }

    const bottomRow = rows[rows.length - 1]
    bottomRow.blocks.sort((a: any, b: any) => a.x - b.x)

    // Find rightmost block in bottom row
    const rightmostBlock = bottomRow.blocks[bottomRow.blocks.length - 1]
    const nextX = rightmostBlock.x + spacingX

    // Check if next block would fit (assuming max width of ~1200px viewport)
    // If not, start new row
    if (nextX + blockWidth > 1200) {
      return { x: startX, y: bottomRow.y + spacingY }
    }

    // Place to the right of rightmost block in current row
    return { x: nextX, y: bottomRow.y }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!name.trim()) {
      setError("Goal tracker name is required")
      return
    }

    setIsCreating(true)

    try {
      const position = calculateNextPosition()
      const response = await fetch("/api/blocks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          podId,
          type: "goals",
          label: name.trim(),
          description: description.trim() || undefined,
          x: position.x,
          y: position.y,
        }),
      })

      if (response.ok) {
        setName("")
        setDescription("")
        onCreated()
        onClose()
      } else {
        const data = await response.json()
        setError(data.error || "Failed to create goal tracker")
      }
    } catch (error) {
      console.error("Error creating goal tracker:", error)
      setError("Failed to create goal tracker. Please try again.")
    } finally {
      setIsCreating(false)
    }
  }

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 bg-black dark:bg-white bg-opacity-20 dark:bg-opacity-20 z-40" onClick={onClose} />

      <div className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-black rounded-xl shadow-2xl z-50 border border-gray-200 dark:border-white">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create Goal Tracker</h2>
            <button onClick={onClose} className="text-gray-400 dark:text-white hover:text-gray-600 dark:hover:text-black transition">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                Tracker Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Project Goals"
                className="w-full px-3 py-2 border border-gray-300 dark:border-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-black text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description for this goal tracker..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-black text-gray-900 dark:text-white resize-none"
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 dark:text-white bg-gray-100 dark:bg-white rounded-lg hover:bg-gray-200 dark:hover:bg-white transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-white transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? "Creating..." : "Create Tracker"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

function ChatModal({ boxId, chatData, podId, user, onClose, onUnreadUpdate }: {
  boxId: string
  chatData: any
  podId?: string
  user?: any
  onClose: () => void
  onUnreadUpdate?: () => void
}) {
  const [members, setMembers] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [messageInput, setMessageInput] = useState("")
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showAddMembersModal, setShowAddMembersModal] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showMentionAutocomplete, setShowMentionAutocomplete] = useState(false)
  const [mentionQuery, setMentionQuery] = useState("")
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 })
  const inputRef = useRef<HTMLInputElement>(null)

  const chatName = chatData?.label || "Chat"
  const chatDescription = chatData?.description || ""
  const isCreator = user && chatData?.creatorId === user.id
  const [podOwnerId, setPodOwnerId] = useState<string | null>(null)

  // Fetch members and messages
  useEffect(() => {
    if (boxId && podId) {
      fetchMembers()
      fetchMessages()
      fetchPodOwner()
      // Mark messages as read when chat is opened
      markMessagesAsRead()
      // Poll for new messages every 2 seconds
      const interval = setInterval(fetchMessages, 2000)
      return () => clearInterval(interval)
    }
  }, [boxId, podId])

  const markMessagesAsRead = async () => {
    try {
      await fetch(`/api/blocks/${boxId}/unread`, {
        method: "POST",
      })
    } catch (error) {
      console.error("Error marking messages as read:", error)
    }
  }

  const fetchPodOwner = async () => {
    try {
      if (podId) {
        const response = await fetch(`/api/pods/${podId}`)
        if (response.ok) {
          const data = await response.json()
          setPodOwnerId(data.pod?.creatorId || null)
        }
      }
    } catch (error) {
      console.error("Error fetching pod owner:", error)
    }
  }

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm("Are you sure you want to delete this message?")) {
      return
    }

    try {
      const response = await fetch(`/api/chat/${boxId}/messages/${messageId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchMessages() // Refresh messages
      } else {
        const data = await response.json()
        alert(data.error || "Failed to delete message")
      }
    } catch (error) {
      console.error("Error deleting message:", error)
      alert("Failed to delete message. Please try again.")
    }
  }

  const fetchMembers = async () => {
    try {
      const response = await fetch(`/api/blocks/${boxId}/members`)
      if (response.ok) {
        const data = await response.json()
        setMembers(data.members || [])
      }
    } catch (error) {
      console.error("Error fetching members:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/chat/${boxId}/messages`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      } else if (response.status === 403) {
        // User doesn't have access
        const data = await response.json()
        console.error("Access denied:", data.error)
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageInput.trim() || sending) return

    setSending(true)
    try {
      const response = await fetch(`/api/chat/${boxId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: messageInput.trim() }),
      })

      if (response.ok) {
        setMessageInput("")
        fetchMessages() // Refresh messages
        // Refresh unread counts after sending (will update for other users)
        if (onUnreadUpdate) {
          onUnreadUpdate()
        }
      } else {
        const data = await response.json()
        alert(data.error || "Failed to send message")
      }
    } catch (error) {
      console.error("Error sending message:", error)
      alert("Failed to send message. Please try again.")
    } finally {
      setSending(false)
    }
  }

  const getAvatarColor = (userId: string) => {
    const colors = [
      "bg-purple-500", 
      "bg-blue-500", 
      "bg-pink-500", 
      "bg-green-500", 
      "bg-orange-500",
      "bg-red-500",
      "bg-yellow-500",
      "bg-indigo-500",
      "bg-teal-500",
      "bg-cyan-500"
    ]
    // Use a better hash function to ensure different users get different colors
    let hash = 0
    if (userId) {
      for (let i = 0; i < userId.length; i++) {
        const char = userId.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash // Convert to 32-bit integer
      }
    }
    // Use absolute value and modulo to get a color index
    const colorIndex = Math.abs(hash) % colors.length
    return colors[colorIndex]
  }

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || "U"
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setMessageInput(value)

    // Check for @ mention
    const cursorPosition = e.target.selectionStart || 0
    const textBeforeCursor = value.substring(0, cursorPosition)
    const lastAtIndex = textBeforeCursor.lastIndexOf('@')
    
    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1)
      // Check if there's a space after @ (meaning mention is complete)
      if (!textAfterAt.includes(' ') && !textAfterAt.includes('\n')) {
        const query = textAfterAt.toLowerCase()
        setMentionQuery(query)
        
        // Calculate position for autocomplete
        if (inputRef.current) {
          const rect = inputRef.current.getBoundingClientRect()
          setMentionPosition({
            top: rect.top - 200, // Position above input
            left: rect.left,
          })
        }
        
        setShowMentionAutocomplete(true)
      } else {
        setShowMentionAutocomplete(false)
      }
    } else {
      setShowMentionAutocomplete(false)
    }
  }

  const handleMentionSelect = (member: any) => {
    const cursorPosition = inputRef.current?.selectionStart || 0
    const textBeforeCursor = messageInput.substring(0, cursorPosition)
    const lastAtIndex = textBeforeCursor.lastIndexOf('@')
    
    if (lastAtIndex !== -1) {
      const textAfterAt = messageInput.substring(lastAtIndex + 1)
      const spaceIndex = textAfterAt.indexOf(' ')
      const newText = 
        messageInput.substring(0, lastAtIndex) + 
        `@${member.name} ` + 
        messageInput.substring(cursorPosition)
      
      setMessageInput(newText)
      setShowMentionAutocomplete(false)
      
      // Focus back on input
      setTimeout(() => {
        inputRef.current?.focus()
        const newCursorPos = lastAtIndex + member.name.length + 2
        inputRef.current?.setSelectionRange(newCursorPos, newCursorPos)
      }, 0)
    }
  }

  const handleEmojiSelect = (emoji: string) => {
    const cursorPosition = inputRef.current?.selectionStart || 0
    const newText = 
      messageInput.substring(0, cursorPosition) + 
      emoji + 
      messageInput.substring(cursorPosition)
    setMessageInput(newText)
    setShowEmojiPicker(false)
    
    // Focus back on input
    setTimeout(() => {
      inputRef.current?.focus()
      const newCursorPos = cursorPosition + emoji.length
      inputRef.current?.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  const renderMessageWithMentions = (message: string) => {
    // Split message by @mentions
    const parts = message.split(/(@\w+)/g)
    
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        const mentionName = part.substring(1)
        const member = members.find(m => 
          m.name?.toLowerCase() === mentionName.toLowerCase() ||
          m.name?.toLowerCase().includes(mentionName.toLowerCase())
        )
        
        if (member) {
          return (
            <span
              key={index}
              className="font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-1 rounded"
            >
              {part}
            </span>
          )
        }
      }
      return <span key={index}>{part}</span>
    })
  }

  if (!chatData) return null

  return (
    <>
      <div className="fixed inset-0 bg-black dark:bg-white bg-opacity-20 dark:bg-opacity-20 z-40" onClick={onClose} />

      <div className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[85vh] bg-white dark:bg-black rounded-xl shadow-2xl flex z-50 border border-gray-200 dark:border-white">
        {/* Left Panel - Members Sidebar with Header */}
        <div className="w-64 border-r border-gray-200 dark:border-white flex flex-col bg-white dark:bg-black">
          {/* Header in Sidebar */}
          <div className="p-4 border-b border-gray-200 dark:border-white">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">{chatName}</h3>
                {chatDescription && (
                  <p className="text-xs text-gray-600 dark:text-white mt-1 line-clamp-2">{chatDescription}</p>
                )}
              </div>
              <button onClick={onClose} className="text-gray-400 dark:text-white hover:text-gray-600 dark:hover:text-black transition flex-shrink-0 ml-2">
                <X size={18} />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <Users size={14} className="text-gray-600 dark:text-white" />
              <h4 className="font-semibold text-gray-900 dark:text-white text-xs">{members.length} Members</h4>
            </div>
          </div>

          {/* Members List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-sm text-gray-600 dark:text-white">Loading...</p>
              </div>
            ) : members.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Users size={32} className="text-gray-400 dark:text-white mb-3" />
                <p className="text-sm text-gray-600 dark:text-white font-medium mb-1">No members yet</p>
                <p className="text-xs text-gray-500 dark:text-white">Add members to start chatting</p>
              </div>
            ) : (
              members.map((member: any, i: number) => (
                <div key={member.id || i} className="flex items-center gap-3">
                  {member.profilePicture ? (
                    <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                      <img
                        src={member.profilePicture}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className={`w-10 h-10 ${getAvatarColor(member.id || i.toString())} rounded-full flex items-center justify-center text-white dark:text-black text-sm font-semibold flex-shrink-0`}>
                      {getInitials(member.name)}
                    </div>
                  )}
                  <div className="text-left flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{member.name}</p>
                      {/* Chat Creator Badge in member list */}
                      {member.id === chatData?.creatorId && (
                        <span className="px-1.5 py-0.5 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 rounded text-xs font-medium flex-shrink-0">
                          Creator
                        </span>
                      )}
                      {/* Pod Owner Badge in member list */}
                      {podOwnerId && member.id === podOwnerId && member.id !== chatData?.creatorId && (
                        <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-xs font-medium flex-shrink-0">
                          Owner
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-white truncate">{member.email}</p>
                  </div>
                </div>
              ))
            )}
            {isCreator && podId && (
              <button 
                onClick={() => setShowAddMembersModal(true)}
                className="w-full mt-4 flex items-center gap-2 text-sm text-gray-600 dark:text-white hover:text-gray-900 dark:hover:text-black font-medium px-2 py-2 hover:bg-gray-50 dark:hover:bg-white rounded-lg transition"
              >
                <Users size={16} />
                <span>Add Members</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Panel - Chat (Full Height) */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-black">
            {/* Messages - Full height area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-600 dark:text-white">Loading messages...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <MessageCircle size={48} className="text-gray-300 dark:text-white mb-4" />
                  <p className="text-gray-600 dark:text-white font-medium mb-1">No messages yet</p>
                  <p className="text-sm text-gray-500 dark:text-white">Start the conversation by sending a message</p>
                </div>
              ) : (
                messages.map((msg: any, i: number) => {
                  const isOwn = msg.isOwn
                  const member = members.find((m: any) => m.id === msg.userId)
                  
                  return (
                    <div
                      key={msg.id || i}
                      className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}
                    >
                      {member?.profilePicture ? (
                        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                          <img
                            src={member.profilePicture}
                            alt={member.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className={`w-8 h-8 ${getAvatarColor(msg.userId || i.toString())} rounded-full flex items-center justify-center text-white dark:text-black text-xs font-semibold flex-shrink-0`}>
                          {getInitials(msg.userName || member?.name || "U")}
                        </div>
                      )}
                      <div className={`flex-1 ${isOwn ? "flex flex-col items-end" : ""}`}>
                        <div className={`flex items-center gap-2 mb-1 ${isOwn ? "flex-row-reverse" : ""}`}>
                          <p className={`text-xs text-gray-500 dark:text-white`}>
                            {msg.userName || member?.name || "User"}
                          </p>
                          {/* Chat Creator Badge */}
                          {msg.userId === chatData?.creatorId && (
                            <span className="px-1.5 py-0.5 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 rounded text-xs font-medium">
                              Creator
                            </span>
                          )}
                          {/* Pod Owner Badge */}
                          {podOwnerId && msg.userId === podOwnerId && msg.userId !== chatData?.creatorId && (
                            <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-xs font-medium">
                              Owner
                            </span>
                          )}
                          <p className={`text-xs text-gray-500 dark:text-white`}>
                            • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <div
                          className={`rounded-lg p-3 max-w-[80%] relative group ${
                            isOwn
                              ? "bg-gray-800 dark:bg-white text-white dark:text-black"
                              : "bg-gray-100 dark:bg-white text-gray-900 dark:text-black"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {renderMessageWithMentions(msg.message)}
                          </p>
                          {/* Delete button - only show for own messages */}
                          {isOwn && (
                            <button
                              onClick={() => handleDeleteMessage(msg.id)}
                              className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-10"
                              title="Delete message"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 dark:border-white bg-white dark:bg-black relative">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <div className="relative">
                  <button 
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-white rounded-lg transition"
                  >
                    <Smile size={20} className="text-gray-500 dark:text-white" />
                  </button>
                  {showEmojiPicker && (
                    <EmojiPicker
                      onEmojiSelect={handleEmojiSelect}
                      onClose={() => setShowEmojiPicker(false)}
                    />
                  )}
                </div>
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Message... (use @ to mention)"
                    value={messageInput}
                    onChange={handleInputChange}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setShowMentionAutocomplete(false)
                        setShowEmojiPicker(false)
                      }
                    }}
                    disabled={sending}
                    className="w-full px-4 py-2 bg-gray-100 dark:bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-black transition text-gray-900 dark:text-black"
                  />
                  {showMentionAutocomplete && members.length > 0 && (
                    <MentionAutocomplete
                      members={members}
                      query={mentionQuery}
                      onSelect={handleMentionSelect}
                      onClose={() => setShowMentionAutocomplete(false)}
                      position={mentionPosition}
                    />
                  )}
                </div>
                <button
                  type="submit"
                  disabled={sending || !messageInput.trim()}
                  className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-white transition disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  {sending ? "Sending..." : "Send"}
                </button>
              </form>
            </div>
          </div>
        </div>

      {/* Add Members Modal */}
      {showAddMembersModal && podId && (
        <AddMembersToBlockModal
          open={showAddMembersModal}
          onClose={() => setShowAddMembersModal(false)}
          block={chatData}
          podId={podId as string}
          creatorId={chatData?.creatorId}
          onMemberAdded={() => {
            fetchMembers()
            setShowAddMembersModal(false)
          }}
        />
      )}
    </>
  )
}

function DocModal({ boxId, docData, podId, user, onClose }: {
  boxId: string
  docData: any
  podId?: string
  user?: any
  onClose: () => void
}) {
  const [documents, setDocuments] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showAddMembersModal, setShowAddMembersModal] = useState(false)

  const docName = docData?.label || "Documents"
  const isCreator = user && docData?.creatorId === user.id

  // Fetch documents
  useEffect(() => {
    if (boxId && podId) {
      fetchDocuments()
    }
  }, [boxId, podId])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/documents?blockId=${boxId}`)
      if (response.ok) {
        const data = await response.json()
        setDocuments(data.documents || [])
      } else if (response.status === 403) {
        const data = await response.json()
        console.error("Access denied:", data.error)
      }
    } catch (error) {
      console.error("Error fetching documents:", error)
    } finally {
      setLoading(false)
    }
  }


  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      alert('Only PDF files are allowed')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size too large. Maximum size is 10MB.')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('blockId', boxId)

      const response = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        fetchDocuments() // Refresh documents
        e.target.value = '' // Reset input
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to upload document')
      }
    } catch (error) {
      console.error('Error uploading document:', error)
      alert('Failed to upload document. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleDownload = async (documentId: string, fileName: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}/download`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = fileName
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to download document')
      }
    } catch (error) {
      console.error('Error downloading document:', error)
      alert('Failed to download document. Please try again.')
    }
  }

  const handleDeleteDocument = async (documentId: string, fileName: string) => {
    if (!confirm(`Are you sure you want to delete "${fileName}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchDocuments() // Refresh documents
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to delete document')
      }
    } catch (error) {
      console.error('Error deleting document:', error)
      alert('Failed to delete document. Please try again.')
    }
  }

  const getFileTypeColor = (fileType: string) => {
    if (fileType === 'application/pdf') {
      return "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
    }
    return "bg-gray-100 dark:bg-white text-gray-700 dark:text-black"
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const getAvatarColor = (userId: string) => {
    const colors = [
      "bg-purple-500", 
      "bg-blue-500", 
      "bg-pink-500", 
      "bg-green-500", 
      "bg-orange-500",
      "bg-red-500",
      "bg-yellow-500",
      "bg-indigo-500",
      "bg-teal-500",
      "bg-cyan-500"
    ]
    let hash = 0
    if (userId) {
      for (let i = 0; i < userId.length; i++) {
        const char = userId.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash
      }
    }
    const colorIndex = Math.abs(hash) % colors.length
    return colors[colorIndex]
  }

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || "U"
  }

  const filteredDocuments = documents.filter((doc) =>
    doc.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!docData) return null

  return (
    <>
      <div className="fixed inset-0 bg-black dark:bg-white bg-opacity-20 dark:bg-opacity-20 z-40" onClick={onClose} />

      <div className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[85vh] bg-white dark:bg-black rounded-xl shadow-2xl flex flex-col z-50 border border-gray-200 dark:border-white">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-white bg-white dark:bg-black">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{docName}</h3>
            <div className="flex items-center gap-2">
              {isCreator && podId && (
                <button 
                  onClick={() => setShowAddMembersModal(true)}
                  className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black text-sm rounded-lg hover:bg-gray-800 dark:hover:bg-white transition flex items-center gap-2"
                >
                  <Users size={16} />
                  <span>Add Members</span>
                </button>
              )}
              <label className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black text-sm rounded-lg hover:bg-gray-800 dark:hover:bg-white transition flex items-center gap-2 cursor-pointer">
                <Upload size={16} />
                <span>{uploading ? "Uploading..." : "Upload"}</span>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
              <button onClick={onClose} className="p-2 text-gray-400 dark:text-white hover:text-gray-600 dark:hover:text-black transition">
                <X size={20} />
              </button>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-white" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-black text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Document List */}
        <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-600 dark:text-white">Loading documents...</p>
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <File size={48} className="text-gray-300 dark:text-white mb-4" />
                <p className="text-gray-600 dark:text-white font-medium mb-1">No documents yet</p>
                <p className="text-sm text-gray-500 dark:text-white">Upload your first PDF document</p>
              </div>
            ) : (
              <div className="border border-gray-200 dark:border-white rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-white border-b border-gray-200 dark:border-black">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-black uppercase tracking-wider">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-black uppercase tracking-wider">File Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-black uppercase tracking-wider">Uploaded By</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-black uppercase tracking-wider">Size</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-black uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-black uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-black divide-y divide-gray-200 dark:divide-white">
                    {filteredDocuments.map((doc: any, i: number) => (
                      <tr key={doc.id || i} className="hover:bg-gray-50 dark:hover:bg-white transition">
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getFileTypeColor(doc.fileType)}`}>
                            PDF
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{doc.fileName}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-white">{doc.uploadedBy?.name || "Unknown"}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-white">{formatFileSize(doc.fileSize)}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-white">
                          {new Date(doc.uploadedAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleDownload(doc.id, doc.fileName)}
                              className="p-1.5 hover:bg-gray-100 dark:hover:bg-white rounded transition"
                              title="Download"
                            >
                              <Download size={16} className="text-gray-600 dark:text-white" />
                            </button>
                            {(user?.id === doc.uploadedBy?.id || isCreator) && (
                              <button
                                onClick={() => handleDeleteDocument(doc.id, doc.fileName)}
                                className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900 rounded transition"
                                title="Delete"
                              >
                                <Trash2 size={16} className="text-red-600 dark:text-red-400" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
        </div>

        {/* Add Members Modal */}
        {showAddMembersModal && podId && (
          <AddMembersToBlockModal
            open={showAddMembersModal}
            onClose={() => setShowAddMembersModal(false)}
            block={docData}
            podId={podId as string}
            creatorId={docData?.creatorId}
            onMemberAdded={() => {
              setShowAddMembersModal(false)
            }}
          />
        )}
      </div>
    </>
  )
}

function FeatureUnderDevModal({ open, onClose, featureName }: {
  open: boolean
  onClose: () => void
  featureName: string
}) {
  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 bg-black dark:bg-white bg-opacity-20 dark:bg-opacity-20 z-40" onClick={onClose} />

      <div className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-black rounded-xl shadow-2xl flex flex-col z-50 border border-gray-200 dark:border-white">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Feature Under Development</h2>
            <button onClick={onClose} className="text-gray-400 dark:text-white hover:text-gray-600 dark:hover:text-black transition">
              <X size={20} />
            </button>
          </div>

          <div className="text-center py-8">
            <Video size={64} className="text-gray-300 dark:text-white mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{featureName} Feature</h3>
            <p className="text-gray-600 dark:text-white mb-6">
              This feature is currently under development. We're working hard to bring it to you soon!
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-white transition"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

function MeetingModal({ boxId, meetingData, onClose }: {
  boxId: string
  meetingData: any
  onClose: () => void
}) {
  const meetingName = meetingData?.label || "Meetings"

  return (
    <>
      <div className="fixed inset-0 bg-black dark:bg-white bg-opacity-20 dark:bg-opacity-20 z-40" onClick={onClose} />

      <div className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-black rounded-xl shadow-2xl flex flex-col z-50 border border-gray-200 dark:border-white">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-white bg-white dark:bg-black">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{meetingName}</h3>
            <button onClick={onClose} className="text-gray-400 dark:text-white hover:text-gray-600 dark:hover:text-black transition">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Coming Soon Content */}
        <div className="flex-1 flex items-center justify-center p-12">
          <div className="text-center">
            <Video size={64} className="text-gray-300 dark:text-white mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Coming Soon</h2>
            <p className="text-gray-600 dark:text-white">
              The meetings feature is currently under development. Stay tuned!
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

function CalendarModal({ boxId, calendarData, podId, user, onClose }: {
  boxId: string
  calendarData: any
  podId?: string
  user?: any
  onClose: () => void
}) {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddEventModal, setShowAddEventModal] = useState(false)
  const [showAddMembersModal, setShowAddMembersModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<any>(null)

  const calendarName = calendarData?.label || "Calendar"
  const isCreator = user && calendarData?.creatorId === user.id

  useEffect(() => {
    if (boxId) {
      fetchEvents()
    }
  }, [boxId])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/calendar/events?blockId=${boxId}`)
      if (response.ok) {
        const data = await response.json()
        setEvents(data.events || [])
      } else if (response.status === 403) {
        const data = await response.json()
        console.error("Access denied:", data.error)
      }
    } catch (error) {
      console.error("Error fetching events:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event?")) {
      return
    }

    try {
      const response = await fetch(`/api/calendar/events/${eventId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchEvents()
      } else {
        const data = await response.json()
        alert(data.error || "Failed to delete event")
      }
    } catch (error) {
      console.error("Error deleting event:", error)
      alert("Failed to delete event. Please try again.")
    }
  }

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  if (!calendarData) return null

  return (
    <>
      <div className="fixed inset-0 bg-black dark:bg-white bg-opacity-20 dark:bg-opacity-20 z-40" onClick={onClose} />

      <div className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[85vh] bg-white dark:bg-black rounded-xl shadow-2xl flex flex-col z-50 border border-gray-200 dark:border-white">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-white bg-white dark:bg-black">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{calendarName}</h3>
            <div className="flex items-center gap-2">
              {isCreator && podId && (
                <button 
                  onClick={() => setShowAddMembersModal(true)}
                  className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black text-sm rounded-lg hover:bg-gray-800 dark:hover:bg-white transition flex items-center gap-2"
                >
                  <Users size={16} />
                  <span>Add Members</span>
                </button>
              )}
              <button
                onClick={() => {
                  setEditingEvent(null)
                  setShowAddEventModal(true)
                }}
                className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black text-sm rounded-lg hover:bg-gray-800 dark:hover:bg-white transition flex items-center gap-2"
              >
                <Plus size={16} />
                <span>Add Event</span>
              </button>
              <button onClick={onClose} className="p-2 text-gray-400 dark:text-white hover:text-gray-600 dark:hover:text-black transition">
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Events List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-600 dark:text-white">Loading events...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Calendar size={48} className="text-gray-300 dark:text-white mb-4" />
              <p className="text-gray-600 dark:text-white font-medium mb-1">No events yet</p>
              <p className="text-sm text-gray-500 dark:text-white">Add your first event to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((event: any) => (
                <div
                  key={event.id}
                  className="p-4 rounded-lg border-2 border-gray-200 dark:border-white bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-white transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <Calendar size={20} className="text-gray-600 dark:text-white flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">{event.title}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <p className="text-xs text-gray-600 dark:text-white">
                            {formatDate(event.date)}
                            {event.time && ` • ${event.time}`}
                          </p>
                          {event.createdBy && (
                            <p className="text-xs text-gray-500 dark:text-white">
                              by {event.createdBy.name}
                            </p>
                          )}
                        </div>
                        {event.description && (
                          <p className="text-xs text-gray-600 dark:text-white mt-1">{event.description}</p>
                        )}
                      </div>
                    </div>
                    {user?.id === event.createdBy?.id && (
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900 rounded transition flex-shrink-0"
                        title="Delete"
                      >
                        <Trash2 size={16} className="text-red-600 dark:text-red-400" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Event Modal */}
        {showAddEventModal && (
          <AddEventModal
            open={showAddEventModal}
            onClose={() => {
              setShowAddEventModal(false)
              setEditingEvent(null)
            }}
            blockId={boxId}
            event={editingEvent}
            onEventAdded={fetchEvents}
          />
        )}

        {/* Add Members Modal */}
        {showAddMembersModal && podId && (
          <AddMembersToBlockModal
            open={showAddMembersModal}
            onClose={() => setShowAddMembersModal(false)}
            block={calendarData}
            podId={podId as string}
            creatorId={calendarData?.creatorId}
            onMemberAdded={() => {
              setShowAddMembersModal(false)
            }}
          />
        )}
      </div>
    </>
  )
}

function AddEventModal({ open, onClose, blockId, event, onEventAdded }: {
  open: boolean
  onClose: () => void
  blockId: string
  event?: any
  onEventAdded: () => void
}) {
  const [title, setTitle] = useState(event?.title || "")
  const [date, setDate] = useState(event?.date ? new Date(event.date).toISOString().split('T')[0] : "")
  const [time, setTime] = useState(event?.time || "")
  const [description, setDescription] = useState(event?.description || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (event) {
      setTitle(event.title || "")
      setDate(event.date ? new Date(event.date).toISOString().split('T')[0] : "")
      setTime(event.time || "")
      setDescription(event.description || "")
    } else {
      setTitle("")
      setDate("")
      setTime("")
      setDescription("")
    }
  }, [event, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!title.trim() || !date) {
      setError("Title and date are required")
      return
    }

    setIsSubmitting(true)

    try {
      const url = event ? `/api/calendar/events/${event.id}` : "/api/calendar/events"
      const method = event ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          blockId,
          title: title.trim(),
          date,
          time: time.trim() || undefined,
          description: description.trim() || undefined,
        }),
      })

      if (response.ok) {
        onEventAdded()
        onClose()
      } else {
        const data = await response.json()
        setError(data.error || `Failed to ${event ? 'update' : 'create'} event`)
      }
    } catch (error) {
      console.error(`Error ${event ? 'updating' : 'creating'} event:`, error)
      setError(`Failed to ${event ? 'update' : 'create'} event. Please try again.`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 bg-black dark:bg-white bg-opacity-30 dark:bg-opacity-30 z-50" onClick={onClose} />

      <div className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-black rounded-xl shadow-2xl z-[60] border border-gray-200 dark:border-white">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {event ? "Edit Event" : "Add Event"}
            </h2>
            <button onClick={onClose} className="text-gray-400 dark:text-white hover:text-gray-600 dark:hover:text-black transition">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                Event Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Team Meeting"
                className="w-full px-3 py-2 border border-gray-300 dark:border-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-black text-gray-900 dark:text-white"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-black text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                  Time (Optional)
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-black text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add event description..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-black text-gray-900 dark:text-white resize-none"
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 dark:text-white bg-gray-100 dark:bg-white rounded-lg hover:bg-gray-200 dark:hover:bg-white transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-white transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (event ? "Updating..." : "Adding...") : (event ? "Update Event" : "Add Event")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

function GoalModal({ boxId, goalData, podId, user, onClose }: {
  boxId: string
  goalData: any
  podId?: string
  user?: any
  onClose: () => void
}) {
  const [goals, setGoals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddGoalModal, setShowAddGoalModal] = useState(false)
  const [showAddMembersModal, setShowAddMembersModal] = useState(false)
  const [editingGoal, setEditingGoal] = useState<any>(null)

  const trackerName = goalData?.label || "Goal Tracker"
  const isCreator = user && goalData?.creatorId === user.id

  useEffect(() => {
    if (boxId) {
      fetchGoals()
    }
  }, [boxId])

  const fetchGoals = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/goals?blockId=${boxId}`)
      if (response.ok) {
        const data = await response.json()
        setGoals(data.goals || [])
      } else if (response.status === 403) {
        const data = await response.json()
        console.error("Access denied:", data.error)
      }
    } catch (error) {
      console.error("Error fetching goals:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (goalId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        fetchGoals()
      } else {
        const data = await response.json()
        alert(data.error || "Failed to update goal status")
      }
    } catch (error) {
      console.error("Error updating goal status:", error)
      alert("Failed to update goal status. Please try again.")
    }
  }

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm("Are you sure you want to delete this goal?")) {
      return
    }

    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchGoals()
      } else {
        const data = await response.json()
        alert(data.error || "Failed to delete goal")
      }
    } catch (error) {
      console.error("Error deleting goal:", error)
      alert("Failed to delete goal. Please try again.")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "done":
        return "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
      case "in_progress":
        return "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
      case "not_started":
        return "bg-gray-100 dark:bg-white text-gray-700 dark:text-black"
      default:
        return "bg-gray-100 dark:bg-white text-gray-700 dark:text-black"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "done":
        return "Done"
      case "in_progress":
        return "Ongoing"
      case "not_started":
        return "Not Completed"
      default:
        return status
    }
  }

  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return "No due date"
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  if (!goalData) return null

  return (
    <>
      <div className="fixed inset-0 bg-black dark:bg-white bg-opacity-20 dark:bg-opacity-20 z-40" onClick={onClose} />

      <div className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[85vh] bg-white dark:bg-black rounded-xl shadow-2xl flex flex-col z-50 border border-gray-200 dark:border-white">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-white bg-white dark:bg-black">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{trackerName}</h3>
            <div className="flex items-center gap-2">
              {isCreator && podId && (
                <button 
                  onClick={() => setShowAddMembersModal(true)}
                  className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black text-sm rounded-lg hover:bg-gray-800 dark:hover:bg-white transition flex items-center gap-2"
                >
                  <Users size={16} />
                  <span>Add Members</span>
                </button>
              )}
              <button
                onClick={() => {
                  setEditingGoal(null)
                  setShowAddGoalModal(true)
                }}
                className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black text-sm rounded-lg hover:bg-gray-800 dark:hover:bg-white transition flex items-center gap-2"
              >
                <Plus size={16} />
                <span>Add Goal</span>
              </button>
              <button onClick={onClose} className="p-2 text-gray-400 dark:text-white hover:text-gray-600 dark:hover:text-black transition">
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Goals List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-600 dark:text-white">Loading goals...</p>
            </div>
          ) : goals.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Target size={48} className="text-gray-300 dark:text-white mb-4" />
              <p className="text-gray-600 dark:text-white font-medium mb-1">No goals yet</p>
              <p className="text-sm text-gray-500 dark:text-white">Add your first goal to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {goals.map((goal: any) => (
                <div
                  key={goal.id}
                  className="p-4 rounded-lg border-2 border-gray-200 dark:border-white bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-white transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <button
                        onClick={() => {
                          const nextStatus = goal.status === "not_started" ? "in_progress" : goal.status === "in_progress" ? "done" : "not_started"
                          handleStatusChange(goal.id, nextStatus)
                        }}
                        className="flex-shrink-0 mt-0.5"
                      >
                        {goal.status === "done" ? (
                          <CheckCircle2 size={20} className="text-green-600 dark:text-green-400" />
                        ) : (
                          <Circle size={20} className="text-gray-400 dark:text-white" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">{goal.title}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <p className="text-xs text-gray-600 dark:text-white">
                            Due: {formatDate(goal.dueDate)}
                          </p>
                          {goal.createdBy && (
                            <p className="text-xs text-gray-500 dark:text-white">
                              by {goal.createdBy.name}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={goal.status}
                        onChange={(e) => handleStatusChange(goal.id, e.target.value)}
                        className={`text-xs font-medium px-2 py-1 rounded-full border-0 ${getStatusColor(goal.status)} cursor-pointer`}
                      >
                        <option value="not_started">Not Completed</option>
                        <option value="in_progress">Ongoing</option>
                        <option value="done">Done</option>
                      </select>
                      {user?.id === goal.createdBy?.id && (
                        <button
                          onClick={() => handleDeleteGoal(goal.id)}
                          className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900 rounded transition flex-shrink-0"
                          title="Delete"
                        >
                          <Trash2 size={16} className="text-red-600 dark:text-red-400" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Goal Modal */}
        {showAddGoalModal && (
          <AddGoalModal
            open={showAddGoalModal}
            onClose={() => {
              setShowAddGoalModal(false)
              setEditingGoal(null)
            }}
            blockId={boxId}
            goal={editingGoal}
            onGoalAdded={fetchGoals}
          />
        )}

        {/* Add Members Modal */}
        {showAddMembersModal && podId && (
          <AddMembersToBlockModal
            open={showAddMembersModal}
            onClose={() => setShowAddMembersModal(false)}
            block={goalData}
            podId={podId as string}
            creatorId={goalData?.creatorId}
            onMemberAdded={() => {
              setShowAddMembersModal(false)
            }}
          />
        )}
      </div>
    </>
  )
}

function AddGoalModal({ open, onClose, blockId, goal, onGoalAdded }: {
  open: boolean
  onClose: () => void
  blockId: string
  goal?: any
  onGoalAdded: () => void
}) {
  const [title, setTitle] = useState(goal?.title || "")
  const [dueDate, setDueDate] = useState(goal?.dueDate ? new Date(goal.dueDate).toISOString().split('T')[0] : "")
  const [status, setStatus] = useState(goal?.status || "not_started")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (goal) {
      setTitle(goal.title || "")
      setDueDate(goal.dueDate ? new Date(goal.dueDate).toISOString().split('T')[0] : "")
      setStatus(goal.status || "not_started")
    } else {
      setTitle("")
      setDueDate("")
      setStatus("not_started")
    }
  }, [goal, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!title.trim()) {
      setError("Goal title is required")
      return
    }

    setIsSubmitting(true)

    try {
      const url = goal ? `/api/goals/${goal.id}` : "/api/goals"
      const method = goal ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          blockId,
          title: title.trim(),
          dueDate: dueDate || undefined,
          status,
        }),
      })

      if (response.ok) {
        onGoalAdded()
        onClose()
      } else {
        const data = await response.json()
        setError(data.error || `Failed to ${goal ? 'update' : 'create'} goal`)
      }
    } catch (error) {
      console.error(`Error ${goal ? 'updating' : 'creating'} goal:`, error)
      setError(`Failed to ${goal ? 'update' : 'create'} goal. Please try again.`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 bg-black dark:bg-white bg-opacity-30 dark:bg-opacity-30 z-50" onClick={onClose} />

      <div className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-black rounded-xl shadow-2xl z-[60] border border-gray-200 dark:border-white">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {goal ? "Edit Goal" : "Add Goal"}
            </h2>
            <button onClick={onClose} className="text-gray-400 dark:text-white hover:text-gray-600 dark:hover:text-black transition">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                Task Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Complete project documentation"
                className="w-full px-3 py-2 border border-gray-300 dark:border-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-black text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                Due Date (Optional)
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-black text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-black text-gray-900 dark:text-white"
              >
                <option value="not_started">Not Completed</option>
                <option value="in_progress">Ongoing</option>
                <option value="done">Done</option>
              </select>
            </div>

            {error && (
              <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 dark:text-white bg-gray-100 dark:bg-white rounded-lg hover:bg-gray-200 dark:hover:bg-white transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-white transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (goal ? "Updating..." : "Adding...") : (goal ? "Update Goal" : "Add Goal")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
