"use client";

import { useState } from "react";
import { CreateTournamentForm } from "@/components/forms/CreateTournament";

export function PaidTournamentsTab() {
  const [tournaments, setTournaments] = useState([
    {
      id: 1,
      name: "Pro Squad Championship",
      type: "CS",
      mode: "Squad",
      players: 64,
      prizePool: 5000,
      entryFee: 50,
      startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
    {
      id: 2,
      name: "Elite Solo BR",
      type: "BR",
      mode: "Solo",
      players: 256,
      prizePool: 10000,
      entryFee: 20,
      startDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    },
    {
      id: 3,
      name: "Diamond Duo Challenge",
      type: "BR",
      mode: "Duo",
      players: 128,
      prizePool: 8000,
      entryFee: 35,
      startDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [gameMode, setGameMode] = useState("all");
  const [teamMode, setTeamMode] = useState("all");
  const [sortBy, setSortBy] = useState("prize");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Synchronized Processing Pipeline (Filtering + Sorting)
  const processedTournaments = tournaments
    .filter((t) => {
      const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGame = gameMode === "all" || t.type.toLowerCase() === gameMode.toLowerCase();
      const matchesTeam = teamMode === "all" || t.mode.toLowerCase() === teamMode.toLowerCase();
      return matchesSearch && matchesGame && matchesTeam;
    })
    .sort((a, b) => {
      if (sortBy === "prize") return b.prizePool - a.prizePool;
      if (sortBy === "popular") return b.players - a.players;
      return a.startDate.getTime() - b.startDate.getTime(); // default: newest / startTime
    });

  return (
    <div className="space-y-6 font-['Rajdhani'] text-[#d0d5df]">
      
      {/* Premium Content Header Control Row */}
      <div className="flex justify-between items-center border-b border-[#141822] pb-3">
        <div>
          <h3 className="text-xl font-bold font-['Orbitron'] tracking-wider text-[#ffaa00] uppercase">
            💎 High-Stakes Stakes Arenas
          </h3>
          <p className="text-xs text-[#4e5d78] font-bold uppercase tracking-wide mt-0.5">
            Premium buy-in operations with distributed network prize matrices
          </p>
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-[#ff9a00]/5 border border-[#ff9a00]/20 hover:border-[#ff9a00]/60 text-[#ff9a00] hover:text-white hover:bg-[#ff9a00]/10 font-['Orbitron'] font-bold text-xs uppercase tracking-wider rounded transition-all duration-200 cursor-pointer active:scale-95"
        >
          + Provision Match
        </button>
      </div>

      {/* Embedded Filtering System Deck */}
      <div className="flex flex-col md:flex-row gap-3 bg-[#0a0c10] p-3 border border-[#1e2330] rounded-md">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Filter premium pools by operational layout..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 bg-[#07080b] border border-[#1e2330] rounded text-[#d0d5df] placeholder-[#4e5d78] text-sm font-semibold tracking-wide focus:outline-none focus:border-[#ff9a00]/50 transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
          {/* Game Format Filters */}
          <div className="relative">
            <select
              value={gameMode}
              onChange={(e) => setGameMode(e.target.value)}
              className="w-full sm:w-36 appearance-none px-3 py-2 bg-[#07080b] border border-[#1e2330] rounded text-xs font-bold uppercase tracking-wider text-[#8090a0] focus:outline-none focus:border-[#ff9a00]/50 cursor-pointer pr-8 transition-colors"
            >
              <option value="all">🕹️ All Modes</option>
              <option value="br">Battle Royale</option>
              <option value="cs">Clash Squad</option>
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-[9px] text-[#4e5d78]">▼</div>
          </div>

          {/* Bracket Allocation Sizes */}
          <div className="relative">
            <select
              value={teamMode}
              onChange={(e) => setTeamMode(e.target.value)}
              className="w-full sm:w-36 appearance-none px-3 py-2 bg-[#07080b] border border-[#1e2330] rounded text-xs font-bold uppercase tracking-wider text-[#8090a0] focus:outline-none focus:border-[#ff9a00]/50 cursor-pointer pr-8 transition-colors"
            >
              <option value="all">👥 All Sizes</option>
              <option value="solo">Solo</option>
              <option value="duo">Duo</option>
              <option value="squad">Squad</option>
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-[9px] text-[#4e5d78]">▼</div>
          </div>

          {/* Multi-tier Vector Sorting Options */}
          <div className="relative col-span-2 sm:col-span-1">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full sm:w-40 appearance-none px-3 py-2 bg-[#07080b] border border-[#ff9a00]/20 rounded text-xs font-bold uppercase tracking-wider text-[#ffaa00] focus:outline-none focus:border-[#ff9a00]/60 cursor-pointer pr-8 transition-colors"
            >
              <option value="prize">💰 Prize Value</option>
              <option value="popular">⚡ Entry Load</option>
              <option value="startTime">⏱ Launch Pipeline</option>
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-[9px] text-[#4e5d78]">▼</div>
          </div>
        </div>
      </div>

      {/* Grid Dashboard Metric Displays */}
      {processedTournaments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {processedTournaments.map((tournament) => (
            <div
              key={tournament.id}
              className="bg-[#0a0c10] border border-[#1e2330] hover:border-[#ff9a00]/30 rounded-lg p-4 flex flex-col justify-between hover:shadow-[0_4px_20px_rgba(255,154,0,0.05)] group transition-all duration-200"
            >
              <div className="flex justify-between items-start gap-4 mb-3">
                <div className="min-w-0">
                  <span className="inline-block px-2 py-0.5 bg-[#ff9a00]/10 border border-[#ff9a00]/20 text-[#ffaa00] font-['Orbitron'] text-[10px] font-black tracking-widest uppercase rounded-sm mb-1.5">
                    {tournament.type} // {tournament.mode}
                  </span>
                  <h4 className="text-base font-['Orbitron'] font-bold text-white truncate tracking-wide group-hover:text-[#ff9a00] transition-colors">
                    {tournament.name}
                  </h4>
                </div>
                
                <div className="text-right shrink-0">
                  <span className="block text-[10px] text-[#4e5d78] font-bold uppercase tracking-wider">Prize Pool</span>
                  <span className="text-sm font-black font-['Orbitron'] text-[#ffaa00] tracking-wide">
                    ₹{tournament.prizePool.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="border-t border-[#141822] pt-3 mt-2 flex justify-between items-center text-xs">
                <div className="space-y-0.5">
                  <span className="block text-[10px] text-[#4e5d78] font-bold uppercase tracking-wider">Operational Window</span>
                  <span className="font-semibold text-[#8090a0]">
                    {tournament.startDate.toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })} • {tournament.startDate.toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <div className="text-right flex items-center gap-4">
                  <div className="space-y-0.5">
                    <span className="block text-[10px] text-[#4e5d78] font-bold uppercase tracking-wider">Slot Allocation</span>
                    <span className="font-['Orbitron'] font-bold text-white text-right block">
                      {tournament.players} Max
                  </span>
                  </div>
                  
                  <div className="space-y-0.5 border-l border-[#141822] pl-3">
                    <span className="block text-[10px] text-[#4e5d78] font-bold uppercase tracking-wider">Ticket Fee</span>
                    <span className="font-bold text-red-400 font-['Orbitron']">
                      ₹{tournament.entryFee}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-[#0a0c10] border border-[#1e2330] rounded-lg">
          <p className="text-sm font-bold uppercase tracking-widest text-[#4e5d78]">
            📡 No Premium Operations Registered Inside Parameters
          </p>
          <p className="text-xs text-[#4e5d78]/60 uppercase tracking-wider mt-1">
            Verify filter state indicators to reset local queries
          </p>
        </div>
      )}

      {/* Structural Native Overlay Portal View */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0a0c10] border border-[#2a2e3a] w-full max-w-2xl rounded-lg overflow-hidden relative shadow-[0_10px_40px_rgba(0,0,0,0.75)]">
            <div className="p-4 border-b border-[#141822] flex justify-between items-center bg-[#0d0f15]">
              <h3 className="font-['Orbitron'] font-bold text-sm text-[#ff9a00] tracking-widest uppercase">
                ⚡ Initialize Premium High-Stakes Bracket
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#4e5d78] hover:text-red-400 text-xs font-bold uppercase tracking-widest cursor-pointer transition-colors"
              >
                ✕ Terminal Close
              </button>
            </div>
            
            <div className="p-4 max-h-[75vh] overflow-y-auto tab-scrollbar bg-[#07080b]">
              <CreateTournamentForm onClose={() => setIsModalOpen(false)} />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}