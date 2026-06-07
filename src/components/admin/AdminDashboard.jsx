"use client"

import { useContext, useState } from "react"
import { Users, Trophy, MessageSquare, Settings, LogOut } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import UserManagement       from "./tabs/UserManagement"
import TournamentManagement from "./tabs/TournamentManagement"
import PrizeDistribution    from "./tabs/PrizeDistribution"
import ChatModeration       from "./tabs/ChatModeration"
import SettingsTab          from "./tabs/Settings"
import MyContext from "@/context/ThemeProvider"

const TABS = [
  {
    id:       "users",
    label:    "Users",
    short:    "Users",
    icon:     <Users className="h-5 w-5" />,
    iconSm:   <Users className="h-[22px] w-[22px]" />,
    activeBg: "bg-primary/10 text-primary border-primary shadow-[0_0_15px_rgba(255,107,0,0.1)]",
    activeMobile: "text-primary",
    activeDot: "bg-primary shadow-[0_0_6px_rgba(255,107,0,0.8)]",
  },
  {
    id:       "tournaments",
    label:    "Tournaments",
    short:    "Tourney",
    icon:     <Trophy className="h-5 w-5" />,
    iconSm:   <Trophy className="h-[22px] w-[22px]" />,
    activeBg: "bg-accent/10 text-accent border-accent shadow-[0_0_15px_rgba(255,170,0,0.1)]",
    activeMobile: "text-accent",
    activeDot: "bg-accent shadow-[0_0_6px_rgba(255,170,0,0.8)]",
  },
  {
    id:       "prizes",
    label:    "Prizes",
    short:    "Prizes",
    icon:     <span className="text-xl leading-none">💰</span>,
    iconSm:   <span className="text-[22px] leading-none">💰</span>,
    activeBg: "bg-accent/10 text-accent border-accent shadow-[0_0_15px_rgba(255,170,0,0.1)]",
    activeMobile: "text-accent",
    activeDot: "bg-accent shadow-[0_0_6px_rgba(255,170,0,0.8)]",
  },
  {
    id:       "chat",
    label:    "Chat Mod",
    short:    "Chat",
    icon:     <MessageSquare className="h-5 w-5" />,
    iconSm:   <MessageSquare className="h-[22px] w-[22px]" />,
    activeBg: "bg-primary/10 text-primary border-primary shadow-[0_0_15px_rgba(255,107,0,0.1)]",
    activeMobile: "text-primary",
    activeDot: "bg-primary shadow-[0_0_6px_rgba(255,107,0,0.8)]",
  },
  {
    id:       "settings",
    label:    "Settings",
    short:    "Config",
    icon:     <Settings className="h-5 w-5" />,
    iconSm:   <Settings className="h-[22px] w-[22px]" />,
    activeBg: "bg-primary/10 text-primary border-primary shadow-[0_0_15px_rgba(255,107,0,0.1)]",
    activeMobile: "text-primary",
    activeDot: "bg-primary shadow-[0_0_6px_rgba(255,107,0,0.8)]",
  },
]

export function AdminDashboard({ user }) {
  const [activeTab, setActiveTab] = useState("users")
  const context = useContext(MyContext)

  const activeTabObj = TABS.find(t => t.id === activeTab)

  const renderTab = () => {
    switch (activeTab) {
      case "users":       return <UserManagement />
      case "tournaments": return <TournamentManagement />
      case "prizes":      return <PrizeDistribution />
      case "chat":        return <ChatModeration />
      case "settings":    return <SettingsTab />
      default:            return null
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative selection:bg-primary/30 selection:text-white font-sans antialiased">

      {/* Ambient Glow */}
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-primary/3 rounded-full blur-[100px] pointer-events-none" />

      {/* ── STICKY HEADER ── */}
      <div className="border-b border-border bg-card/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="flex items-center justify-between gap-3">

            {/* Title — truncate on very small screens */}
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-black font-display tracking-wider bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent uppercase truncate">
                ⚙️ <span className="hidden xs:inline"> </span>Admin Terminal
              </h1>
              <p className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mt-0.5 truncate">
                Op: <span className="text-primary">{context?.user?.username}</span>
                <span className="hidden sm:inline"> // clearance: <span className="text-accent">{user?.role}</span></span>
              </p>
            </div>

            {/* Logout — icon-only on mobile */}
            <Button
              variant="outline"
              onClick={() => (window.location.href = "/")}
              className="border-border text-muted-foreground hover:text-white hover:bg-destructive/20 hover:border-destructive text-xs uppercase font-display tracking-wider rounded-sm h-9 gap-2 cursor-pointer transition-all duration-150 flex-shrink-0"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Terminate Session</span>
            </Button>
          </div>
        </div>
      </div>

      {/* ── DESKTOP NAV GRID (hidden on mobile) ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 hidden md:block">
        <div className="grid grid-cols-5 gap-3 mb-8">
          {TABS.map((tab) => {
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
                <div className={isActive ? "text-inherit" : "text-muted-foreground"}>{tab.icon}</div>
                <span className="font-display text-xs tracking-wider">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── CONTENT ── */}
      {/* pb-24 on mobile to clear the bottom nav bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 md:pb-10 md:pt-0 pt-5">
        <Card className="border-border bg-card/30 backdrop-blur-sm rounded-sm p-4 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
          <div className="mb-5 border-b border-border/40 pb-3 flex items-center justify-between">
            <span className="text-[10px] font-display font-bold tracking-widest text-muted-foreground uppercase">
              SUB-SYSTEM SECTOR // {activeTab}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e] animate-pulse" />
          </div>
          {renderTab()}
        </Card>
      </div>

      {/* ── MOBILE BOTTOM NAV (hidden md+) ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-border bg-card/80 backdrop-blur-xl">
        {/* Active tab indicator bar at top */}
        <div
          className="h-[2px] transition-all duration-300"
          style={{
            background: `linear-gradient(90deg, transparent ${(TABS.findIndex(t => t.id === activeTab) / TABS.length) * 100}%, var(--primary) ${(TABS.findIndex(t => t.id === activeTab) / TABS.length) * 100}%, var(--primary) ${((TABS.findIndex(t => t.id === activeTab) + 1) / TABS.length) * 100}%, transparent ${((TABS.findIndex(t => t.id === activeTab) + 1) / TABS.length) * 100}%)`
          }}
        />

        <div className="flex items-stretch">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 px-1 cursor-pointer transition-all duration-200 relative ${
                  isActive ? tab.activeMobile : "text-muted-foreground"
                }`}
              >
                {/* Active dot */}
                {isActive && (
                  <span className={`absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${tab.activeDot}`} />
                )}

                {/* Icon with scale on active */}
                <span className={`transition-transform duration-200 ${isActive ? "scale-110" : "scale-100"}`}>
                  {tab.iconSm}
                </span>

                {/* Label */}
                <span className={`font-display font-bold tracking-wider transition-all duration-200 ${
                  isActive ? "text-[9px] opacity-100" : "text-[9px] opacity-60"
                } uppercase`}>
                  {tab.short}
                </span>
              </button>
            )
          })}
        </div>

        {/* Safe area spacer for iOS home indicator */}
        <div className="h-safe-bottom" style={{ height: "env(safe-area-inset-bottom)" }} />
      </nav>

    </div>
  )
}