"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UserManagementTab } from "./tabs/UserManagement"
import { TournamentManagementTab } from "./tabs/TournamentManagement"
import { ChatModerationTab } from "./tabs/ChatModeration"
import { PricingManagementTab } from "./tabs/PricingManagement"
import { Users, Trophy, MessageSquare, ShieldAlert, LogOut } from "lucide-react"

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("users")

  const tabs = [
    { 
      id: "users", 
      label: "Users", 
      icon: <Users className="h-5 w-5" />, 
      activeBg: "bg-primary/10 text-primary border-primary shadow-[0_0_15px_rgba(255,107,0,0.1)]" 
    },
    { 
      id: "tournaments", 
      label: "Tournaments", 
      icon: <Trophy className="h-5 w-5" />, 
      activeBg: "bg-accent/10 text-accent border-accent shadow-[0_0_15px_rgba(255,170,0,0.1)]" 
    },
    { 
      id: "chat", 
      label: "Chat Moderation", 
      icon: <MessageSquare className="h-5 w-5" />, 
      activeBg: "bg-primary/10 text-primary border-primary shadow-[0_0_15px_rgba(255,107,0,0.1)]" 
    },
    { 
      id: "pricing", 
      label: "Pricing Profile", 
      icon: <ShieldAlert className="h-5 w-5" />, 
      activeBg: "bg-accent/10 text-accent border-accent shadow-[0_0_15px_rgba(255,170,0,0.1)]" 
    },
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
    <div className="min-h-screen bg-background text-foreground relative selection:bg-primary/30 selection:text-white font-sans antialiased">
      {/* Structural Subtle Glow Matrix */}
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-primary/3 rounded-full blur-[100px] pointer-events-none" />

      {/* Cyber tactical Header Sector */}
      <div className="border-b border-border bg-card/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black font-display tracking-wider bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent uppercase">
                Admin Control Terminal
              </h1>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mt-1">
                Security clearance level // active matrix handler
              </p>
            </div>
            
            <Button 
              variant="outline" 
              onClick={() => (window.location.href = "/")} 
              className="border-border text-muted-foreground hover:text-white hover:bg-destructive/20 hover:border-destructive text-xs uppercase font-display tracking-wider rounded-sm h-9 gap-2 cursor-pointer transition-all duration-150"
            >
              <LogOut className="h-3.5 w-3.5" />
              Terminate Session
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Grid Deck */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`p-4 rounded-sm border flex flex-col items-center justify-center text-center gap-2 transition-all duration-150 cursor-pointer uppercase ${
                  isActive
                    ? `${tab.activeBg} font-black scale-[1.02]`
                    : "border-border/60 bg-card/40 text-muted-foreground hover:bg-card/80 hover:text-foreground hover:border-border"
                }`}
              >
                <div className={isActive ? "text-inherit" : "text-muted-foreground"}>
                  {tab.icon}
                </div>
                <span className="font-display text-xs tracking-wider">
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>

        {/* Tab Content Display Port */}
        <div className="animate-fadeIn">
          <Card className="border-border bg-card/30 backdrop-blur-sm rounded-sm p-6 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
            <div className="mb-6 border-b border-border/40 pb-3 flex items-center justify-between">
              <span className="text-[10px] font-display font-bold tracking-widest text-muted-foreground uppercase">
                SUB-SYSTEM SECTOR // {activeTab}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-success anonymity-pulse shadow-[0_0_8px_var(--success)] animate-pulse" />
            </div>
            {renderTab()}
          </Card>
        </div>
      </div>
    </div>
  )
}