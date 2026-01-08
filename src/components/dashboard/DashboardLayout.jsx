"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FreeTournamentsTab } from "./tabs/FreeTournament"
import { PaidTournamentsTab } from "./tabs/PaidTournament"
import { PlayerRecruitmentTab } from "./tabs/Recruitment"
import { OfficialEventsTab } from "./tabs/OfficialTournament"
import { WorldChatTab } from "./tabs/WorldChat"
import { UserProfile } from "./UserProfile"
import { EditProfileForm } from "@/components/forms/EditProfile"
import { CreateTournamentForm } from "@/components/forms/CreateTournament"

export function DashboardLayout({ user }) {
  const [activeTab, setActiveTab] = useState("free-tournaments")
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [showCreateTournament, setShowCreateTournament] = useState(false)

  const tabs = [
    { id: "free-tournaments", label: "Free Tournaments", icon: "🎮" },
    { id: "paid-tournaments", label: "Paid Tournaments", icon: "💰" },
    { id: "recruitment", label: "Player Recruitment", icon: "👥" },
    { id: "events", label: "Official Events", icon: "🏆" },
    { id: "chat", label: "World Chat", icon: "💬" },
  ]

  const renderTab = () => {
    switch (activeTab) {
      case "free-tournaments":
        return <FreeTournamentsTab onCreateClick={() => setShowCreateTournament(true)} />
      case "paid-tournaments":
        return <PaidTournamentsTab onCreateClick={() => setShowCreateTournament(true)} />
      case "recruitment":
        return <PlayerRecruitmentTab />
      case "events":
        return <OfficialEventsTab />
      case "chat":
        return <WorldChatTab />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="border-b border-border bg-card/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary/60 to-accent/60 bg-clip-text text-transparent ">FF-ESP-ZONE Dashboard</h1>
          <Button variant="outline" onClick={() => (window.location.href = "/")}>
            Logout
          </Button>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* User Profile Section */}
        {!showEditProfile && !showCreateTournament && (
          <div className="mb-8">
            <UserProfile user={user} onEditClick={() => setShowEditProfile(true)} />
          </div>
        )}

        {/* Edit Profile Modal */}
        {showEditProfile && (
          <div className="mb-8">
            <EditProfileForm user={user} onClose={() => setShowEditProfile(false)} />
          </div>
        )}

        {/* Create Tournament Modal */}
        {showCreateTournament && (
          <div className="mb-8">
            <CreateTournamentForm onClose={() => setShowCreateTournament(false)} />
          </div>
        )}

        {/* Tabs Navigation */}
        {!showEditProfile && !showCreateTournament && (
          <>
            <div className="flex flex-wrap gap-2 mb-8 overflow-x-auto pb-2">
              {tabs.map((tab) => (
                <Button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  variant={activeTab === tab.id ? "default" : "outline"}
                  className="whitespace-nowrap"
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </Button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="animate-fadeIn">{renderTab()}</div>
          </>
        )}
      </div>
    </div>
  )
}
