"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UserManagementTab } from "./tabs/UserManagement"
import { TournamentManagementTab } from "./tabs/TournamentManagement"
import { ChatModerationTab } from "./tabs/ChatModeration"
import { PricingManagementTab } from "./tabs/PricingManagement"

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("users")

  const tabs = [
    { id: "users", label: "Users", icon: "👥", color: "from-blue-600 to-cyan-600" },
    { id: "tournaments", label: "Tournaments", icon: "🏆", color: "from-purple-600 to-pink-600" },
    { id: "chat", label: "Chat Moderation", icon: "💬", color: "from-orange-600 to-red-600" },
    { id: "pricing", label: "Pricing", icon: "💰", color: "from-green-600 to-emerald-600" },
  ]

  const renderTab = () => {
    switch (activeTab) {
      case "users":
        return <UserManagementTab />
      case "tournaments":
        return <TournamentManagementTab />
      case "chat":
        return <ChatModerationTab />
      case "pricing":
        return <PricingManagementTab />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header with gradient background */}
      <div className="border-b border-border/50 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                Admin Control Panel
              </h1>
              <p className="text-muted-foreground mt-1">Manage tournaments, users, and platform content</p>
            </div>
            <Button variant="outline" onClick={() => (window.location.href = "/")} className="hover:bg-destructive/20">
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation with gradient backgrounds */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative p-4 rounded-lg border-2 transition-all duration-300 ${
                activeTab === tab.id
                  ? `border-primary bg-gradient-to-br ${tab.color} shadow-lg scale-105`
                  : "border-border/50 bg-card/50 hover:bg-card/80 hover:border-border"
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <span className="text-2xl">{tab.icon}</span>
                <span className={`font-semibold text-sm ${activeTab === tab.id ? "text-white" : "text-foreground"}`}>
                  {tab.label}
                </span>
              </div>
              {activeTab === tab.id && <div className="absolute inset-0 rounded-lg bg-gradient-to-br opacity-10" />}
            </button>
          ))}
        </div>

        {/* Tab Content with smooth animation */}
        <div className="animate-fadeIn">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-lg">{renderTab()}</Card>
        </div>
      </div>
    </div>
  )
}
