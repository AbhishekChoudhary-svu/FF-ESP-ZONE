"use client";

import { useEffect, useState } from "react";
import { FreeTournamentsTab } from "./tabs/FreeTournament";
import { PaidTournamentsTab } from "./tabs/PaidTournament";
import { PlayerRecruitmentTab } from "./tabs/Recruitment";
import { OfficialEventsTab } from "./tabs/OfficialTournament";
import { WorldChatTab } from "./tabs/WorldChat";
import { UserProfile } from "./UserProfile";
import { useRouter } from "next/navigation";
import Link from 'next/link';

export function DashboardLayout({ user }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("recruitment");
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showCreateTournament, setShowCreateTournament] = useState(false);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Logout failed:", data.error);
        return;
      }

      router.replace("/login");
    } catch (err) {
      console.error("Unexpected error during logout:", err);
    }
  };
   useEffect(() => {
    window.scrollTo({
      top: 450,
      behavior: "smooth", 
    });
  }, [activeTab]);

  const tabs = [
    { id: "recruitment", label: "Recruitment", icon: "👥" },
    { id: "free-tournaments", label: "Free Arena", icon: "🎮" },
    { id: "paid-tournaments", label: "Paid Matches", icon: "💰" },
    { id: "events", label: "Official Events", icon: "🏆" },
    { id: "chat", label: "World Chat", icon: "💬" },
  ];

  const renderTab = () => {
    switch (activeTab) {
      case "recruitment":
        return <PlayerRecruitmentTab />;
      case "free-tournaments":
        return (
          <FreeTournamentsTab
            onCreateClick={() => setShowCreateTournament(true)}
          />
        );
      case "paid-tournaments":
        return (
          <PaidTournamentsTab
            onCreateClick={() => setShowCreateTournament(true)}
          />
        );
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
      {/* Global theme stylesheet configuration */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Orbitron:wght@700;900&display=swap');
        
        .tab-scrollbar::-webkit-scrollbar {
          height: 4px;
        }
        .tab-scrollbar::-webkit-scrollbar-track {
          background: #0a0c10;
        }
        .tab-scrollbar::-webkit-scrollbar-thumb {
          background: #1e2330;
          border-radius: 2px;
        }
      `}</style>

      {/* Main Base Root Container */}
      <div className="min-h-screen bg-[#07080b] text-[#d0d5df] font-['Rajdhani'] selection:bg-[#ff6b00]/30 selection:text-white">
        
        {/* Navigation Sticky Header Header Area */}
        <div className="border-b border-[#1e2330] bg-[#0a0c10]/80 backdrop-blur-md sticky top-0 z-40 before:content-[''] before:absolute before:bottom-0 before:left-0 before:right-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-[#ff6b00]/40 before:to-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
            <Link href='/'>
              <h1 className="font-['Orbitron'] text-xl font-black bg-gradient-to-r from-[#ff6b00] via-[#ff9a00] to-[#ffcc00] bg-clip-text text-transparent tracking-wider [filter:drop-shadow(0_0_10px_rgba(255,107,0,0.2))]">
                FF-ESP-ZONE
              </h1>
            </Link>
            
            {/* Outline Tech Action Trigger */}
            <button 
              onClick={handleLogout}
              className="px-4 py-1.5 rounded bg-transparent border border-[#2a2e3a] text-[#8090a0] text-xs font-bold tracking-wider uppercase cursor-pointer hover:border-[#ff6b00]/40 hover:text-[#ff8c30] hover:bg-[#ff6b00]/5 active:scale-95 transition-all duration-200"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Dashboard Main View Content Wrapper */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          
          {/* Main Context Profile Card Segment */}
          {!showEditProfile && !showCreateTournament && (
            <div className="mb-8 animate-fade-in duration-300">
              <UserProfile
                user={user}
                onEditClick={() => setShowEditProfile(true)}
              />
            </div>
          )}

          {/* Interactive Navigation Menu Panel Grid */}
          {!showEditProfile && !showCreateTournament && (
            <>
              <div className="flex gap-2 mb-8 overflow-x-auto pb-2 tab-scrollbar w-full">
                {tabs.map((tab) => {
                  const isSelected = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 min-w-[140px] sm:min-w-0 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md font-['Rajdhani'] text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-200 border cursor-pointer whitespace-nowrap ${
                        isSelected
                          ? "bg-gradient-to-br from-[#ff6b00] to-[#ff9a00] text-white border-transparent shadow-[0_4px_15px_rgba(255,107,0,0.3)] -translate-y-0.5"
                          : "bg-[#0a0c10] border-[#1e2330] text-[#8090a0] hover:text-[#d0d5df] hover:border-[#2a2e3a] hover:bg-[#11141d]"
                      }`}
                    >
                      <span className={`text-sm ${isSelected ? "scale-110" : "opacity-70"}`}>{tab.icon}</span>
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Sub-tab Panel Block Render */}
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                {renderTab()}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}