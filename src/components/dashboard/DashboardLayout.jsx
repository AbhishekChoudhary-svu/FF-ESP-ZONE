"use client";

import { useEffect, useRef, useState } from "react";
import { FreeTournamentsTab } from "./tabs/FreeTournament";
import { PaidTournamentsTab } from "./tabs/PaidTournament";
import { PlayerRecruitmentTab } from "./tabs/Recruitment";
import { OfficialEventsTab } from "./tabs/OfficialEvents";
import { WorldChatTab } from "./tabs/WorldChat";
import { UserProfile } from "./user-profile/UserProfile";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { NotificationBell } from "./NotificationBell";
import { useToast } from "../ui/GameToast";

export function DashboardLayout({ user }) {
  const router = useRouter();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState("recruitment");

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error("Logout Failed", data.error || "Failed to logout");

        console.error("Logout failed:", data.error);
        return;
      }

      toast.logout("Logged Out", "You have been signed out successfully");

      router.replace("/login");
    } catch (err) {
      console.error("Unexpected error during logout:", err);

      toast.error("Logout Error", "Something went wrong while logging out");
    }
  };

  // On mobile the bottom nav is fixed, so scroll to top of content on tab change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeTab]);

  const tabContentRef = useRef(null);

  useEffect(() => {
    tabContentRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [activeTab]);

  const tabs = [
    {
      id: "recruitment",
      label: "Recruit",
      fullLabel: "Recruitment",
      icon: "👥",
    },
    {
      id: "free-tournaments",
      label: "Free",
      fullLabel: "Free Arena",
      icon: "🎮",
    },
    {
      id: "paid-tournaments",
      label: "Paid",
      fullLabel: "Paid Matches",
      icon: "💰",
    },
    { id: "events", label: "Events", fullLabel: "Official Events", icon: "🏆" },
    { id: "chat", label: "Chat", fullLabel: "World Chat", icon: "💬" },
  ];

  const renderTab = () => {
    switch (activeTab) {
      case "recruitment":
        return <PlayerRecruitmentTab />;
      case "free-tournaments":
        return <FreeTournamentsTab />;
      case "paid-tournaments":
        return <PaidTournamentsTab />;
      case "events":
        return <OfficialEventsTab />;
      case "chat":
        return <WorldChatTab />;
      default:
        return null;
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Orbitron:wght@700;900&display=swap');

        .tab-scrollbar::-webkit-scrollbar { height: 4px; }
        .tab-scrollbar::-webkit-scrollbar-track { background: #0a0c10; }
        .tab-scrollbar::-webkit-scrollbar-thumb { background: #1e2330; border-radius: 2px; }

        /* safe area padding for phones with home bar */
        .bottom-nav-safe { padding-bottom: env(safe-area-inset-bottom, 0px); }
      `}</style>

      <div className="min-h-screen bg-[#07080b] text-[#d0d5df] font-['Rajdhani'] selection:bg-[#ff6b00]/30 selection:text-white">
        {/* ── Sticky top nav ───────────────────────────────── */}
        <div
          className="border-b border-[#1e2330] bg-[#0a0c10]/80 backdrop-blur-md sticky top-0 z-40
          before:content-[''] before:absolute before:bottom-0 before:left-0 before:right-0
          before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-[#ff6b00]/40 before:to-transparent"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5 border-r border-[#141822] min-w-[210px]">
              <span className="w-2 h-2 rounded-full bg-[#ff6b00] animate-ping flex-shrink-0" />
              <Link href="/">
                <span className="font-['Orbitron'] font-black text-[15px] tracking-[.08em] bg-gradient-to-r from-[#ff6b00] to-[#ffaa00] bg-clip-text text-transparent">
                  FF‑ESP‑ZONE
                </span>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <NotificationBell />
              <button
                onClick={handleLogout}
                className="px-4 py-1.5 rounded bg-transparent border border-[#2a2e3a] text-[#8090a0] text-xs font-bold tracking-wider uppercase cursor-pointer hover:border-[#ff6b00]/40 hover:text-[#ff8c30] hover:bg-[#ff6b00]/5 active:scale-95 transition-all duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* ── Page content
             pb-20 on mobile so content isn't hidden behind the fixed bottom nav ── */}
        <div className="max-w-7xl mx-auto px-4 py-8 pb-24 sm:pb-8">
          {/* Profile card */}
          {/* Profile card — always visible on desktop, only on recruitment tab on mobile */}
          <div
            className={`mb-8 ${activeTab !== "recruitment" ? "hidden sm:block" : ""}`}
          >
            <UserProfile user={user} />
          </div>

          {/* ── Desktop tab bar (hidden on mobile) ─────────── */}
          <div className="hidden sm:flex gap-2 mb-8">
            {tabs.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md font-['Rajdhani'] text-sm font-bold uppercase tracking-wider transition-all duration-200 border cursor-pointer ${
                    active
                      ? "bg-gradient-to-br from-[#ff6b00] to-[#ff9a00] text-white border-transparent shadow-[0_4px_15px_rgba(255,107,0,0.3)] -translate-y-0.5"
                      : "bg-[#0a0c10] border-[#1e2330] text-[#8090a0] hover:text-[#d0d5df] hover:border-[#2a2e3a] hover:bg-[#11141d]"
                  }`}
                >
                  <span
                    className={`text-sm ${active ? "scale-110" : "opacity-70"}`}
                  >
                    {tab.icon}
                  </span>
                  {tab.fullLabel}
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          <div
            ref={tabContentRef}
            className="animate-in fade-in slide-in-from-bottom-2 duration-300"
          >
            {renderTab()}
          </div>
        </div>

        {/* ── Mobile bottom nav (hidden on sm+) ──────────────
             Fixed to bottom, full width, 5 equal columns.       */}
        <nav
          className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bottom-nav-safe
          bg-[#0a0c10]/95 backdrop-blur-md
          border-t border-[#1e2330]
          before:content-[''] before:absolute before:top-0 before:left-0 before:right-0
          before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-[#ff6b00]/40 before:to-transparent"
        >
          <div className="grid grid-cols-5 h-18">
            {tabs.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex flex-col items-center justify-center gap-0.5 transition-all duration-200 cursor-pointer ${
                    active ? "text-[#ff8c30]" : "text-[#4e5d78]"
                  }`}
                >
                  {/* Active indicator bar at top */}
                  {active && (
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px] rounded-full bg-gradient-to-r from-[#ff6b00] to-[#ff9a00]" />
                  )}

                  {/* Icon */}
                  <span
                    className={`text-lg leading-none transition-transform duration-200 ${active ? "scale-125" : ""}`}
                  >
                    {tab.icon}
                  </span>

                  {/* Short label */}
                  <span
                    className={`text-[9px] font-black uppercase tracking-wider leading-none ${
                      active ? "text-[#ff8c30]" : "text-[#3a4555]"
                    }`}
                  >
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </>
  );
}
