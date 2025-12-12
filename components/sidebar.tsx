"use client"

import Image from "next/image"
import { Home, Compass, Plus, Sparkles, Settings, ShoppingBag } from "lucide-react"

export default function Sidebar({ activeView, onNavigate, pods = [], user = null }) {
  return (
    <div className="w-64 bg-white dark:bg-black text-gray-900 dark:text-white flex flex-col h-screen border-r border-gray-200 dark:border-white/20 shadow-sm">
      {/* Brand */}
      <div className="p-6 border-b border-gray-200 dark:border-white/20">
        <div className="flex items-start gap-3">
          <div className="relative">
            <Image 
              src="/logo.png" 
              alt="WACE Logo" 
              width={48} 
              height={48}
              className="rounded-lg shadow-sm"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xl text-gray-900 dark:text-white">WACE</span>
            <p className="text-xs text-gray-500 dark:text-white mt-0.5">Build. Connect. Dominate</p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="px-4 py-6 space-y-1">
        <NavItem 
          icon={Home} 
          label="Dashboard" 
          active={activeView === "dashboard"}
          onClick={() => onNavigate("dashboard")}
        />
        <NavItem 
          icon={Compass} 
          label="Explore" 
          active={activeView === "explore"}
          onClick={() => onNavigate("explore")}
        />
        <NavItem 
          icon={Plus} 
          label="Create Pod" 
          active={activeView === "create-pod"}
          onClick={() => onNavigate("create-pod")}
        />
        <NavItem 
          icon={Sparkles} 
          label="Personal Assistant" 
          active={activeView === "personal-assistant"}
          onClick={() => onNavigate("personal-assistant")}
        />
      </nav>

      {/* Your Pods */}
      <div className="flex-1 px-4 py-4 border-t border-gray-200 dark:border-white/20 overflow-y-auto">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-white uppercase tracking-wider mb-3 px-2">Your Pods</h3>
        <div className="space-y-1">
          {pods.length === 0 ? (
            <div className="px-2 py-6 text-center">
              <p className="text-xs text-gray-500 dark:text-white mb-1">
                No pods yet
              </p>
              <p className="text-xs text-gray-400 dark:text-white">
                Create your first pod!
              </p>
            </div>
          ) : (
            pods.map((pod, index) => (
              <PodItem
                key={pod.id}
                pod={pod}
                index={index}
                onClick={() => onNavigate("pod", pod)}
              />
            ))
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="px-4 py-4 border-t border-gray-200 dark:border-white/20 space-y-1">
        <NavItem 
          icon={ShoppingBag} 
          label="Marketplace" 
          active={activeView === "marketplace"}
          onClick={() => onNavigate("marketplace")}
        />
        <NavItem 
          icon={Settings} 
          label="Settings" 
          active={activeView === "settings"}
          onClick={() => onNavigate("settings")}
        />
      </div>
    </div>
  )
}

function NavItem({ icon: Icon, label, active = false, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
        active 
          ? "bg-gray-100 dark:bg-white text-black dark:text-black shadow-sm" 
          : "text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-white hover:text-gray-900 dark:hover:text-black"
      }`}
    >
      <Icon size={18} className={active ? "text-black dark:text-black" : ""} />
      <span>{label}</span>
    </button>
  )
}

function PodItem({ pod, onClick, index = 0 }) {
  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : "?"
  }

  const getColorClass = (idx) => {
    const colors = [
      "bg-gray-700 dark:bg-white text-white dark:text-black",
      "bg-orange-500 dark:bg-white text-white dark:text-black",
      "bg-green-500 dark:bg-white text-white dark:text-black",
      "bg-blue-500 dark:bg-white text-white dark:text-black",
      "bg-purple-500 dark:bg-white text-white dark:text-black",
    ]
    return colors[idx % colors.length]
  }

  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white transition-all duration-200 text-sm group"
    >
      {pod.logoUrl ? (
        <div className="w-7 h-7 rounded-md overflow-hidden flex-shrink-0 ring-1 ring-gray-200 dark:ring-white/20 group-hover:ring-gray-300 dark:group-hover:ring-white/30 transition-all">
          <Image
            src={pod.logoUrl}
            alt={pod.name}
            width={28}
            height={28}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-semibold shadow-sm transition-all group-hover:scale-105 ${getColorClass(index)}`}>
          {getInitial(pod.name)}
        </div>
      )}
      <span className="text-gray-700 dark:text-white font-medium truncate group-hover:text-gray-900 dark:group-hover:text-black transition-colors">{pod.name}</span>
    </button>
  )
}
