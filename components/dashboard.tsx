"use client"

import { useState, useEffect } from "react"
import Sidebar from "./sidebar"
import MainContent from "./main-content"
import ExplorePage from "./explore-page"
import CreatePodModal from "./create-pod-modal"
import PersonalAssistantPage from "./personal-assistant-page"
import SettingsPage from "./settings-page"
import MarketplacePage from "./marketplace-page"

export default function Dashboard() {
  const [activeView, setActiveView] = useState("dashboard") // "dashboard", "canvas", "explore", "create-pod", "personal-assistant", "settings", "marketplace"
  const [activePod, setActivePod] = useState(null)
  const [showCreatePodModal, setShowCreatePodModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState(null)
  const [pods, setPods] = useState([])

  // Fetch user data and pods on mount
  useEffect(() => {
    fetchUserData()
    fetchPods()
  }, [])

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/user")
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
    }
  }

  const fetchPods = async () => {
    try {
      const response = await fetch("/api/pods")
      if (response.ok) {
        const data = await response.json()
        setPods(data.pods || [])
      }
    } catch (error) {
      console.error("Error fetching pods:", error)
    }
  }

  const [isNavigating, setIsNavigating] = useState(false)

  const handlePodClick = (pod) => {
    if (isNavigating || isLoading) return // Prevent multiple clicks
    
    setIsNavigating(true)
    setActivePod(pod)
    setActiveView("canvas")
    setIsLoading(true)
    
    // Small delay to show loading state, then load
    setTimeout(() => {
      setIsLoading(false)
      setIsNavigating(false)
    }, 300)
  }

  const handleBackToDashboard = () => {
    setActiveView("dashboard")
    setActivePod(null)
  }

  const handleNavigate = (view, podName = null) => {
    if (view === "create-pod") {
      setShowCreatePodModal(true)
    } else if (view === "pod" && podName) {
      handlePodClick(podName)
    } else {
      setActiveView(view)
    }
  }

  const handleCreatePod = async (podData) => {
    try {
      const response = await fetch("/api/pods", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: podData.name,
          tagline: podData.tagline,
          logoUrl: podData.logoUrl,
        }),
      })

      if (response.ok) {
        // Refresh pods list
        await fetchPods()
        setShowCreatePodModal(false)
      } else {
        const error = await response.json()
        alert(error.error || "Failed to create pod")
      }
    } catch (error) {
      console.error("Error creating pod:", error)
      alert("Failed to create pod")
    }
  }

  const shouldShowSidebar = !["explore", "canvas"].includes(activeView)

  return (
    <div className="flex h-screen bg-white dark:bg-black">
      {shouldShowSidebar && (
        <Sidebar 
          activeView={activeView} 
          onNavigate={handleNavigate}
          pods={pods}
          user={user}
        />
      )}
      {activeView === "dashboard" && (
        <MainContent
          activeView={activeView}
          activePod={activePod}
          onPodClick={handlePodClick}
          onBackToDashboard={handleBackToDashboard}
          onNavigate={handleNavigate}
          pods={pods}
          user={user}
          onPodsUpdate={fetchPods}
        />
      )}
      {activeView === "explore" && (
        <ExplorePage onBack={() => handleNavigate("dashboard")} />
      )}
      {activeView === "personal-assistant" && <PersonalAssistantPage />}
      {activeView === "settings" && (
        <SettingsPage user={user} onUserUpdate={fetchUserData} />
      )}
      {activeView === "marketplace" && <MarketplacePage />}
      {activeView === "canvas" && (
        <MainContent
          activeView={activeView}
          activePod={activePod}
          onPodClick={handlePodClick}
          onBackToDashboard={handleBackToDashboard}
          onNavigate={handleNavigate}
          isLoading={isLoading}
          pods={pods}
          user={user}
          onPodsUpdate={fetchPods}
        />
      )}
      <CreatePodModal
        open={showCreatePodModal}
        onClose={() => setShowCreatePodModal(false)}
        onCreate={handleCreatePod}
      />
    </div>
  )
}
