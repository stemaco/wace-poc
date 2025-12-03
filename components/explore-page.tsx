"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Building2, Users, MapPin, Globe, TrendingUp, Search, Heart, Star, Plus, X, Calendar, Mail, Phone, Linkedin, Twitter, Github, ExternalLink, Upload, Trash2 } from "lucide-react"

export default function ExplorePage({ onBack }: { onBack?: () => void }) {
  const router = useRouter()
  const [profiles, setProfiles] = useState<any[]>([])
  const [featuredProfiles, setFeaturedProfiles] = useState<any[]>([])
  const [selectedProfile, setSelectedProfile] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<"all" | "startup" | "agency">("all")
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [showShowcaseModal, setShowShowcaseModal] = useState(false)
  const [pods, setPods] = useState<any[]>([])

  useEffect(() => {
    fetchProfiles()
    checkAuth()
  }, [filterType])

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/user")
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        if (data.user) {
          fetchPods()
        }
      }
    } catch (error) {
      console.error("Error checking auth:", error)
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

  const fetchProfiles = async () => {
    setIsLoading(true)
    try {
      // Fetch featured profiles
      const featuredResponse = await fetch("/api/explore?featured=true")
      if (featuredResponse.ok) {
        const featuredData = await featuredResponse.json()
        setFeaturedProfiles(featuredData.profiles || [])
      }

      // Fetch all profiles
      const allResponse = await fetch(`/api/explore${filterType !== "all" ? `?type=${filterType}` : ""}`)
      if (allResponse.ok) {
        const allData = await allResponse.json()
        setProfiles(allData.profiles || [])
      }
    } catch (error) {
      console.error("Error fetching profiles:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleProfileClick = async (profile: any) => {
    try {
      const response = await fetch(`/api/explore/${profile.id}`)
      if (response.ok) {
        const data = await response.json()
        setSelectedProfile(data.profile)
      }
    } catch (error) {
      console.error("Error fetching profile details:", error)
    }
  }

  const handleLike = async (profileId: string, isLiked: boolean) => {
    if (!user) {
      // Redirect to login if not authenticated
      router.push("/login")
      return
    }

    try {
      const response = await fetch(`/api/explore/${profileId}/like`, {
        method: "POST",
      })
      if (response.ok) {
        // Update local state
        const updateProfile = (p: any) => {
          if (p.id === profileId) {
            return {
              ...p,
              isLiked: !isLiked,
              likesCount: isLiked ? p.likesCount - 1 : p.likesCount + 1,
            }
          }
          return p
        }
        setProfiles(profiles.map(updateProfile))
        setFeaturedProfiles(featuredProfiles.map(updateProfile))
        if (selectedProfile?.id === profileId) {
          setSelectedProfile(updateProfile(selectedProfile))
        }
      }
    } catch (error) {
      console.error("Error liking profile:", error)
    }
  }

  const handleDeleteProfile = async (profileId: string) => {
    if (!user) {
      return
    }

    if (!confirm("Are you sure you want to delete this profile? This action cannot be undone.")) {
      return
    }

    try {
      const response = await fetch(`/api/explore/${profileId}`, {
        method: "DELETE",
      })
      if (response.ok) {
        // Remove from local state
        setProfiles(profiles.filter((p: any) => p.id !== profileId))
        setFeaturedProfiles(featuredProfiles.filter((p: any) => p.id !== profileId))
        if (selectedProfile?.id === profileId) {
          setSelectedProfile(null)
        }
      } else {
        const error = await response.json()
        alert(error.error || "Failed to delete profile")
      }
    } catch (error) {
      console.error("Error deleting profile:", error)
      alert("Failed to delete profile. Please try again.")
    }
  }

  const filteredProfiles = profiles.filter((profile) => {
    const matchesSearch =
      profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.tagline?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.description?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const filteredFeatured = featuredProfiles.filter((profile) => {
    const matchesSearch =
      profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.tagline?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.description?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  if (selectedProfile) {
    return (
      <ProfileDetailView
        profile={selectedProfile}
        onBack={() => setSelectedProfile(null)}
        onLike={handleLike}
        onDelete={handleDeleteProfile}
        user={user}
      />
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-black">
      {/* Header - Fixed at top */}
      <div className="bg-white dark:bg-black border-b border-gray-200 dark:border-white px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4 flex-1">
          {onBack ? (
            <button
              onClick={onBack}
              className="p-2 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-black rounded-lg transition"
              title="Back to Dashboard"
            >
              <ArrowLeft size={20} />
            </button>
          ) : (
            <button
              onClick={() => router.push("/dashboard")}
              className="p-2 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-black rounded-lg transition"
              title="Back to Dashboard"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Explore</h1>
            <p className="text-sm text-gray-500 dark:text-white">
              Discover innovative startups and agencies
            </p>
          </div>
        </div>
        {user && (
          <button
            onClick={() => setShowShowcaseModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition"
          >
            <Plus size={18} />
            <span>Showcase Pod</span>
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-black border-b border-gray-200 dark:border-white px-8 py-4">
        <div className="flex gap-4 items-center">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-white" size={18} />
            <input
              type="text"
              placeholder="Search profiles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-white bg-white dark:bg-black text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-white"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterType("all")}
              className={`px-4 py-2 rounded-lg transition ${
                filterType === "all"
                  ? "bg-black dark:bg-white text-white dark:text-black"
                  : "bg-gray-100 dark:bg-black text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-800"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType("startup")}
              className={`px-4 py-2 rounded-lg transition ${
                filterType === "startup"
                  ? "bg-black dark:bg-white text-white dark:text-black"
                  : "bg-gray-100 dark:bg-black text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-800"
              }`}
            >
              Startups
            </button>
            <button
              onClick={() => setFilterType("agency")}
              className={`px-4 py-2 rounded-lg transition ${
                filterType === "agency"
                  ? "bg-black dark:bg-white text-white dark:text-black"
                  : "bg-gray-100 dark:bg-black text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-800"
              }`}
            >
              Agencies
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-gray-50 dark:bg-black">
        <div className="w-full px-8 py-8">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-white">Loading profiles...</p>
            </div>
          ) : (
            <>
              {/* Featured Section */}
              {filteredFeatured.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="text-yellow-500" size={20} />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Featured</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredFeatured.map((profile) => (
                      <ProfileCard
                        key={profile.id}
                        profile={profile}
                        onClick={() => handleProfileClick(profile)}
                        onLike={handleLike}
                        onDelete={handleDeleteProfile}
                        user={user}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* All Profiles Section */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  {filterType === "all" ? "All Profiles" : filterType === "startup" ? "Startups" : "Agencies"}
                </h2>
                {filteredProfiles.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProfiles.map((profile) => (
                      <ProfileCard
                        key={profile.id}
                        profile={profile}
                        onClick={() => handleProfileClick(profile)}
                        onLike={handleLike}
                        onDelete={handleDeleteProfile}
                        user={user}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-white">
                      {searchQuery ? "No profiles found matching your search." : "No profiles available yet."}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Showcase Modal */}
      {showShowcaseModal && user && (
        <ShowcaseModal
          open={showShowcaseModal}
          onClose={() => setShowShowcaseModal(false)}
          onSuccess={() => {
            setShowShowcaseModal(false)
            fetchProfiles()
          }}
          user={user}
          pods={pods}
        />
      )}
    </div>
  )
}

function ProfileCard({ profile, onClick, onLike, onDelete, user }: any) {
  const isCreator = user && profile.userId === user.id
  return (
    <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-gray-200 dark:border-white p-6 hover:shadow-md transition cursor-pointer">
      <div className="flex items-start gap-4 mb-4" onClick={onClick}>
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
          {profile.logoUrl ? (
            <img src={profile.logoUrl} alt={profile.name} className="w-full h-full object-cover rounded-lg" />
          ) : (
            <Building2 size={32} className="text-white" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 truncate">
                {profile.name}
              </h3>
              {profile.tagline && (
                <p className="text-sm text-gray-600 dark:text-white line-clamp-1 mb-2">{profile.tagline}</p>
              )}
              {profile.description && (
                <p className="text-sm text-gray-500 dark:text-white line-clamp-3">{profile.description}</p>
              )}
            </div>
            {profile.isFeatured && (
              <Star className="text-yellow-500 flex-shrink-0" size={16} />
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-white mb-4" onClick={onClick}>
        {profile.location && (
          <div className="flex items-center gap-1">
            <MapPin size={12} />
            <span>{profile.location}</span>
          </div>
        )}
        {profile.fundingStage && (
          <div className="flex items-center gap-1">
            <TrendingUp size={12} />
            <span className="capitalize">{profile.fundingStage.replace("-", " ")}</span>
          </div>
        )}
        {profile.type === "agency" && profile.yearsOfExperience && (
          <div className="flex items-center gap-1">
            <Calendar size={12} />
            <span>{profile.yearsOfExperience} years</span>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-white">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onLike(profile.id, profile.isLiked)
          }}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition ${
            profile.isLiked
              ? "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300"
              : "bg-gray-100 dark:bg-black text-gray-600 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-800"
          }`}
        >
          <Heart size={16} className={profile.isLiked ? "fill-current" : ""} />
          <span>{profile.likesCount || 0}</span>
        </button>
        <div className="flex items-center gap-2">
          <div className="text-xs text-gray-500 dark:text-white">
            {profile.viewCount || 0} views
          </div>
          {isCreator && onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete(profile.id)
              }}
              className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition"
              title="Delete profile"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function ProfileDetailView({ profile, onBack, onLike, onDelete, user }: any) {
  const isCreator = user && profile.userId === user.id
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-black">
      {/* Header */}
      <div className="bg-white dark:bg-black border-b border-gray-200 dark:border-white px-8 py-4 flex items-center gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-black rounded-lg transition"
        >
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-gray-50 dark:bg-black">
        <div className="max-w-4xl mx-auto p-8">
          {/* Profile Header */}
          <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-gray-200 dark:border-white p-8 mb-6">
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                {profile.logoUrl ? (
                  <img src={profile.logoUrl} alt={profile.name} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <Building2 size={48} className="text-white" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {profile.name}
                    </h1>
                    {profile.tagline && (
                      <p className="text-lg text-gray-600 dark:text-white mb-4">{profile.tagline}</p>
                    )}
                  </div>
                  {profile.isFeatured && (
                    <Star className="text-yellow-500" size={24} />
                  )}
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-white mb-4">
                  {profile.location && (
                    <div className="flex items-center gap-2">
                      <MapPin size={16} />
                      <span>{profile.location}</span>
                    </div>
                  )}
                  {profile.fundingStage && (
                    <div className="flex items-center gap-2">
                      <TrendingUp size={16} />
                      <span className="capitalize">{profile.fundingStage.replace("-", " ")}</span>
                    </div>
                  )}
                  {profile.type === "agency" && profile.yearsOfExperience && (
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span>{profile.yearsOfExperience} years of experience</span>
                    </div>
                  )}
                  {profile.dateStarted && (
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span>Started {new Date(profile.dateStarted).getFullYear()}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => onLike(profile.id, profile.isLiked)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                      profile.isLiked
                        ? "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300"
                        : "bg-gray-100 dark:bg-black text-gray-600 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-800"
                    }`}
                  >
                    <Heart size={18} className={profile.isLiked ? "fill-current" : ""} />
                    <span>{profile.likesCount || 0} likes</span>
                  </button>
                  <div className="text-sm text-gray-500 dark:text-white">
                    {profile.viewCount || 0} views
                  </div>
                  {isCreator && onDelete && (
                    <button
                      onClick={() => onDelete(profile.id)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg transition bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800"
                      title="Delete profile"
                    >
                      <Trash2 size={18} />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {profile.description && (
            <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-gray-200 dark:border-white p-8 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">About</h2>
              <p className="text-gray-700 dark:text-white leading-relaxed">{profile.description}</p>
            </div>
          )}

          {/* Startup Specific Info */}
          {profile.type === "startup" && (
            <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-gray-200 dark:border-white p-8 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Startup Details</h2>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {profile.dateStarted && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-white mb-1">Date Started</p>
                    <p className="text-gray-900 dark:text-white">
                      {new Date(profile.dateStarted).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {profile.fundingStage && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-white mb-1">Funding Stage</p>
                    <p className="text-gray-900 dark:text-white capitalize">
                      {profile.fundingStage.replace("-", " ")}
                    </p>
                  </div>
                )}
              </div>
              {profile.founders && profile.founders.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Founders</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {profile.founders.map((founder: any, i: number) => (
                      <div key={i} className="p-4 bg-gray-50 dark:bg-black rounded-lg">
                        <p className="font-semibold text-gray-900 dark:text-white">{founder.name}</p>
                        {founder.role && (
                          <p className="text-sm text-gray-600 dark:text-white">{founder.role}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Agency Specific Info */}
          {profile.type === "agency" && (
            <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-gray-200 dark:border-white p-8 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Agency Details</h2>
              {profile.services && profile.services.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500 dark:text-white mb-2">Services</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.services.map((service: string, i: number) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-gray-100 dark:bg-black text-gray-700 dark:text-white rounded-full text-sm"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {profile.clients && profile.clients.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm text-gray-500 dark:text-white mb-2">Notable Clients</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.clients.map((client: string, i: number) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-gray-100 dark:bg-black text-gray-700 dark:text-white rounded-full text-sm"
                      >
                        {client}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Team Members Section (for both types) */}
          {profile.teamMembers && profile.teamMembers.length > 0 && (
            <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-gray-200 dark:border-white p-8 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Team</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {profile.teamMembers.map((member: any, i: number) => (
                  <div key={i} className="p-4 bg-gray-50 dark:bg-black rounded-lg">
                    <p className="font-semibold text-gray-900 dark:text-white">{member.name}</p>
                    {member.role && (
                      <p className="text-sm text-gray-600 dark:text-white">{member.role}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact Information */}
          {(profile.contactEmail || profile.contactPhone || profile.socialLinks || profile.website) && (
            <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-gray-200 dark:border-white p-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Contact</h2>
              <div className="space-y-3">
                {profile.contactEmail && (
                  <div className="flex items-center gap-3">
                    <Mail size={18} className="text-gray-500 dark:text-white" />
                    <a
                      href={`mailto:${profile.contactEmail}`}
                      className="text-gray-700 dark:text-white hover:underline"
                    >
                      {profile.contactEmail}
                    </a>
                  </div>
                )}
                {profile.contactPhone && (
                  <div className="flex items-center gap-3">
                    <Phone size={18} className="text-gray-500 dark:text-white" />
                    <a
                      href={`tel:${profile.contactPhone}`}
                      className="text-gray-700 dark:text-white hover:underline"
                    >
                      {profile.contactPhone}
                    </a>
                  </div>
                )}
                {profile.website && (
                  <div className="flex items-center gap-3">
                    <Globe size={18} className="text-gray-500 dark:text-white" />
                    <a
                      href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-700 dark:text-white hover:underline flex items-center gap-1"
                    >
                      {profile.website}
                      <ExternalLink size={14} />
                    </a>
                  </div>
                )}
                {profile.socialLinks && (
                  <div className="flex items-center gap-4 pt-2">
                    {profile.socialLinks.linkedin && (
                      <a
                        href={profile.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-700 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        <Linkedin size={20} />
                      </a>
                    )}
                    {profile.socialLinks.twitter && (
                      <a
                        href={profile.socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-700 dark:text-white hover:text-blue-400"
                      >
                        <Twitter size={20} />
                      </a>
                    )}
                    {profile.socialLinks.github && (
                      <a
                        href={profile.socialLinks.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-700 dark:text-white hover:text-gray-600 dark:hover:text-gray-400"
                      >
                        <Github size={20} />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Showcase Modal Component
function ShowcaseModal({ open, onClose, onSuccess, user, pods }: any) {
  const [step, setStep] = useState<"select" | "form">("select")
  const [selectedPod, setSelectedPod] = useState<string>("")
  const [profileType, setProfileType] = useState<"startup" | "agency">("startup")
  const [formData, setFormData] = useState<any>({
    name: "",
    logoUrl: "",
    tagline: "",
    description: "",
    dateStarted: "",
    location: "",
    fundingStage: "",
    website: "",
    services: [],
    clients: [],
    yearsOfExperience: "",
    founders: [],
    teamMembers: [],
    contactEmail: "",
    contactPhone: "",
    socialLinks: {
      linkedin: "",
      twitter: "",
      github: "",
      website: "",
    },
    isPublished: false,
  })
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (selectedPod && step === "form") {
      const pod = pods.find((p: any) => p.id === selectedPod)
      if (pod) {
        setFormData({
          ...formData,
          name: pod.name || "",
          logoUrl: pod.logoUrl || "",
          tagline: pod.tagline || "",
        })
        // Set preview if pod has logo
        if (pod.logoUrl) {
          setLogoPreview(pod.logoUrl)
        }
      }
    }
  }, [selectedPod, step])

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        setError('Invalid file type. Only images (JPEG, PNG, WebP) are allowed.')
        return
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        setError('File size too large. Maximum size is 5MB.')
        return
      }

      setLogoFile(file)
      setError("")
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeLogo = () => {
    setLogoFile(null)
    setLogoPreview(null)
    setFormData({ ...formData, logoUrl: "" })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    try {
      let logoUrl = formData.logoUrl

      // Upload logo if a new file is selected
      if (logoFile) {
        setIsUploading(true)
        try {
          const uploadFormData = new FormData()
          uploadFormData.append("file", logoFile)
          uploadFormData.append("type", "explore-profile-logo")

          const uploadResponse = await fetch("/api/upload", {
            method: "POST",
            body: uploadFormData,
          })

          if (uploadResponse.ok) {
            const uploadData = await uploadResponse.json()
            logoUrl = uploadData.url
          } else {
            const uploadError = await uploadResponse.json()
            setError(uploadError.error || "Failed to upload logo")
            setIsUploading(false)
            setIsSubmitting(false)
            return
          }
        } catch (uploadError) {
          console.error("Upload error:", uploadError)
          setError("Failed to upload logo. Please try again.")
          setIsUploading(false)
          setIsSubmitting(false)
          return
        }
        setIsUploading(false)
      }

      const payload = {
        podId: selectedPod || undefined,
        type: profileType,
        ...formData,
        logoUrl: logoUrl || undefined,
        services: formData.services.filter((s: string) => s.trim()),
        clients: formData.clients.filter((c: string) => c.trim()),
        yearsOfExperience: formData.yearsOfExperience ? parseInt(formData.yearsOfExperience) : undefined,
      }

      const response = await fetch("/api/explore", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        // Reset form
        setFormData({
          name: "",
          logoUrl: "",
          tagline: "",
          description: "",
          dateStarted: "",
          location: "",
          fundingStage: "",
          website: "",
          services: [],
          clients: [],
          yearsOfExperience: "",
          founders: [],
          teamMembers: [],
          contactEmail: "",
          contactPhone: "",
          socialLinks: {
            linkedin: "",
            twitter: "",
            github: "",
            website: "",
          },
          isPublished: false,
        })
        setLogoFile(null)
        setLogoPreview(null)
        setSelectedPod("")
        setStep("select")
        onSuccess()
      } else {
        const data = await response.json()
        setError(data.error || "Failed to create profile")
      }
    } catch (error) {
      console.error("Error creating profile:", error)
      setError("Failed to create profile. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!open) return null

  if (step === "select") {
    return (
      <>
        <div
          className="fixed inset-0 bg-black dark:bg-white bg-opacity-20 dark:bg-opacity-20 z-40"
          onClick={onClose}
        />
        <div className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-black rounded-xl shadow-2xl z-50 border border-gray-200 dark:border-white">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Showcase Your Pod</h2>
              <button
                onClick={onClose}
                className="text-gray-400 dark:text-white hover:text-gray-600 dark:hover:text-black transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                  Profile Type
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setProfileType("startup")}
                    className={`flex-1 px-4 py-2 rounded-lg transition ${
                      profileType === "startup"
                        ? "bg-black dark:bg-white text-white dark:text-black"
                        : "bg-gray-100 dark:bg-black text-gray-700 dark:text-white"
                    }`}
                  >
                    Startup
                  </button>
                  <button
                    type="button"
                    onClick={() => setProfileType("agency")}
                    className={`flex-1 px-4 py-2 rounded-lg transition ${
                      profileType === "agency"
                        ? "bg-black dark:bg-white text-white dark:text-black"
                        : "bg-gray-100 dark:bg-black text-gray-700 dark:text-white"
                    }`}
                  >
                    Agency
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                  Select Pod (Optional)
                </label>
                <select
                  value={selectedPod}
                  onChange={(e) => setSelectedPod(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-white bg-white dark:bg-black text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  <option value="">Create New Profile</option>
                  {pods.map((pod: any) => (
                    <option key={pod.id} value={pod.id}>
                      {pod.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setStep("form")}
                className="w-full px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black dark:bg-white bg-opacity-20 dark:bg-opacity-20 z-40"
        onClick={onClose}
      />
      <div className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-black rounded-xl shadow-2xl z-50 border border-gray-200 dark:border-white">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create Profile</h2>
            <button
              onClick={onClose}
              className="text-gray-400 dark:text-white hover:text-gray-600 dark:hover:text-black transition"
            >
              <X size={20} />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-white bg-white dark:bg-black text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                Logo
              </label>
              {logoPreview ? (
                <div className="relative mb-2">
                  <div className="w-32 h-32 border border-gray-300 dark:border-white rounded-lg overflow-hidden">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 dark:border-white rounded-lg p-6 text-center">
                  <input
                    type="file"
                    id="logo-upload"
                    accept="image/jpeg,image/png,image/jpg,image/webp"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="logo-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="text-gray-400 dark:text-white" size={24} />
                    <span className="text-sm text-gray-600 dark:text-white">
                      Click to upload logo
                    </span>
                    <span className="text-xs text-gray-500 dark:text-white">
                      PNG, JPG, WebP up to 5MB
                    </span>
                  </label>
                </div>
              )}
              {!logoPreview && (
                <button
                  type="button"
                  onClick={() => document.getElementById("logo-upload")?.click()}
                  className="mt-2 w-full px-4 py-2 border border-gray-300 dark:border-white text-gray-700 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-black transition flex items-center justify-center gap-2"
                >
                  <Upload size={18} />
                  Choose File
                </button>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                Tagline
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-white bg-white dark:bg-black text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 dark:border-white bg-white dark:bg-black text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
            </div>

            {profileType === "startup" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                      Date Started
                    </label>
                    <input
                      type="date"
                      value={formData.dateStarted}
                      onChange={(e) => setFormData({ ...formData, dateStarted: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-white bg-white dark:bg-black text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                      Funding Stage
                    </label>
                    <select
                      value={formData.fundingStage}
                      onChange={(e) => setFormData({ ...formData, fundingStage: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-white bg-white dark:bg-black text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      <option value="">Select stage</option>
                      <option value="pre-seeded">Pre-seeded</option>
                      <option value="seeded">Seeded</option>
                      <option value="series-a">Series A</option>
                      <option value="series-b">Series B</option>
                      <option value="series-c">Series C</option>
                      <option value="bootstrapped">Bootstrapped</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-white bg-white dark:bg-black text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                </div>
              </>
            )}

            {profileType === "agency" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    value={formData.yearsOfExperience}
                    onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-white bg-white dark:bg-black text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                    Services (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.services.join(", ")}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        services: e.target.value.split(",").map((s) => s.trim()),
                      })
                    }
                    placeholder="Web Development, Design, Marketing"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-white bg-white dark:bg-black text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                    Notable Clients (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.clients.join(", ")}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        clients: e.target.value.split(",").map((c) => c.trim()),
                      })
                    }
                    placeholder="Company A, Company B"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-white bg-white dark:bg-black text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                </div>
              </>
            )}

            {/* Team Members Section */}
            {profileType === "startup" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                  Founders
                </label>
                <div className="space-y-3 mb-3">
                  {formData.founders.map((founder: any, index: number) => (
                    <div key={index} className="flex gap-2 items-end">
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Founder Name"
                          value={founder.name || ""}
                          onChange={(e) => {
                            const newFounders = [...formData.founders]
                            newFounders[index] = { ...newFounders[index], name: e.target.value }
                            setFormData({ ...formData, founders: newFounders })
                          }}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-white bg-white dark:bg-black text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 mb-2"
                        />
                        <input
                          type="text"
                          placeholder="Role (e.g., CEO, CTO)"
                          value={founder.role || ""}
                          onChange={(e) => {
                            const newFounders = [...formData.founders]
                            newFounders[index] = { ...newFounders[index], role: e.target.value }
                            setFormData({ ...formData, founders: newFounders })
                          }}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-white bg-white dark:bg-black text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newFounders = formData.founders.filter((_: any, i: number) => i !== index)
                          setFormData({ ...formData, founders: newFounders })
                        }}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, founders: [...formData.founders, { name: "", role: "", linkedin: "" }] })
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-white text-gray-700 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-black transition"
                >
                  + Add Founder
                </button>
              </div>
            )}

            {/* Team Members for both types */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                Team Members
              </label>
              <div className="space-y-3 mb-3">
                {formData.teamMembers.map((member: any, index: number) => (
                  <div key={index} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Member Name"
                        value={member.name || ""}
                        onChange={(e) => {
                          const newMembers = [...formData.teamMembers]
                          newMembers[index] = { ...newMembers[index], name: e.target.value }
                          setFormData({ ...formData, teamMembers: newMembers })
                        }}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-white bg-white dark:bg-black text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 mb-2"
                      />
                      <input
                        type="text"
                        placeholder="Role"
                        value={member.role || ""}
                        onChange={(e) => {
                          const newMembers = [...formData.teamMembers]
                          newMembers[index] = { ...newMembers[index], role: e.target.value }
                          setFormData({ ...formData, teamMembers: newMembers })
                        }}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-white bg-white dark:bg-black text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newMembers = formData.teamMembers.filter((_: any, i: number) => i !== index)
                        setFormData({ ...formData, teamMembers: newMembers })
                      }}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  setFormData({ ...formData, teamMembers: [...formData.teamMembers, { name: "", role: "", linkedin: "" }] })
                }}
                className="px-4 py-2 border border-gray-300 dark:border-white text-gray-700 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-black transition"
              >
                + Add Team Member
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                Website
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-white bg-white dark:bg-black text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-white bg-white dark:bg-black text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-white bg-white dark:bg-black text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                Social Links
              </label>
              <div className="space-y-2">
                <input
                  type="url"
                  placeholder="LinkedIn URL"
                  value={formData.socialLinks.linkedin}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, linkedin: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-white bg-white dark:bg-black text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                />
                <input
                  type="url"
                  placeholder="Twitter URL"
                  value={formData.socialLinks.twitter}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, twitter: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-white bg-white dark:bg-black text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                />
                <input
                  type="url"
                  placeholder="GitHub URL"
                  value={formData.socialLinks.github}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, github: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-white bg-white dark:bg-black text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="publish"
                checked={formData.isPublished}
                onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="publish" className="text-sm text-gray-700 dark:text-white">
                Publish immediately
              </label>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep("select")}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-white text-gray-700 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-black transition"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isUploading}
                className="flex-1 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition disabled:opacity-50"
              >
                {isUploading ? "Uploading..." : isSubmitting ? "Creating..." : "Create Profile"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
