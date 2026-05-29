"use client";

import { useState } from "react";
import { CreateTournamentForm } from "@/components/forms/CreateTournament";

export function FreeTournamentsTab() {
  const [tournaments, setTournaments] = useState([
    {
      id: 1,
      name: "Solo BR Championship",
      type: "BR",
      mode: "Solo",
      players: 256,
      prizePool: "Free",
      startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: 2,
      name: "Squad CS Battle",
      type: "CS",
      mode: "Squad",
      players: 128,
      prizePool: "Free",
      startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
    {
      id: 3,
      name: "Duo BR Challenge",
      type: "BR",
      mode: "Duo",
      players: 64,
      prizePool: "Free",
      startDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    },
    {
      id: 4,
      name: "Elite BR Tournament",
      type: "BR",
      mode: "Solo",
      players: 512,
      prizePool: "Free",
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [gameMode, setGameMode] = useState("all");
  const [teamMode, setTeamMode] = useState("all");
  const [sortBy, setSortBy] = useState("startTime");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter and Sort Processing Pipeline
  const processedTournaments = tournaments
    .filter((t) => {
      const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGame = gameMode === "all" || t.type.toLowerCase() === gameMode.toLowerCase();
      const matchesTeam = teamMode === "all" || t.mode.toLowerCase() === teamMode.toLowerCase();
      return matchesSearch && matchesGame && matchesTeam;
    })
    .sort((a, b) => {
      if (sortBy === "popular") return b.players - a.players;
      if (sortBy === "prize") {
        const aVal = typeof a.prizePool === "number" ? a.prizePool : 0;
        const bVal = typeof b.prizePool === "number" ? b.prizePool : 0;
        return bVal - aVal;
      }
      // default: newest/startTime
      return a.startDate.getTime() - b.startDate.getTime();
    });

  return (
    <div className="space-y-6 font-['Rajdhani'] text-[#d0d5df]">
      
      {/* Header Panel Control Deck */}
      <div className="flex justify-between items-center border-b border-[#141822] pb-3">
        <div>
          <h3 className="text-xl font-bold font-['Orbitron'] tracking-wider text-white uppercase">
            🏆 Free Arenas
          </h3>
          <p className="text-xs text-[#4e5d78] font-bold uppercase tracking-wide mt-0.5">
            Zero-cost open bracket deployments live on the regional grid
          </p>
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-[#141822] border border-[#1e2330] hover:border-[#ff6b00]/40 text-[#8090a0] hover:text-[#ff8c30] hover:bg-[#ff6b00]/5 font-['Orbitron'] font-bold text-xs uppercase tracking-wider rounded transition-all duration-200 cursor-pointer active:scale-95"
        >
          + Host Match
        </button>
      </div>

      {/* Integrated Filtration Infrastructure */}
      <div className="flex flex-col md:flex-row gap-3 bg-[#0a0c10] p-3 border border-[#1e2330] rounded-md">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search active arenas by label signature..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 bg-[#07080b] border border-[#1e2330] rounded text-[#d0d5df] placeholder-[#4e5d78] text-sm font-semibold tracking-wide focus:outline-none focus:border-[#ff6b00]/60 transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
          {/* Game Mode Filters */}
          <div className="relative">
            <select
              value={gameMode}
              onChange={(e) => setGameMode(e.target.value)}
              className="w-full sm:w-36 appearance-none px-3 py-2 bg-[#07080b] border border-[#1e2330] rounded text-xs font-bold uppercase tracking-wider text-[#8090a0] focus:outline-none focus:border-[#ff6b00]/60 cursor-pointer pr-8 transition-colors"
            >
              <option value="all">🕹️ All Modes</option>
              <option value="br">Battle Royale</option>
              <option value="cs">Clash Squad</option>
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-[9px] text-[#4e5d78]">▼</div>
          </div>

          {/* Team Mode Filters */}
          <div className="relative">
            <select
              value={teamMode}
              onChange={(e) => setTeamMode(e.target.value)}
              className="w-full sm:w-36 appearance-none px-3 py-2 bg-[#07080b] border border-[#1e2330] rounded text-xs font-bold uppercase tracking-wider text-[#8090a0] focus:outline-none focus:border-[#ff6b00]/60 cursor-pointer pr-8 transition-colors"
            >
              <option value="all">👥 All Sizes</option>
              <option value="solo">Solo</option>
              <option value="duo">Duo</option>
              <option value="squad">Squad</option>
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-[9px] text-[#4e5d78]">▼</div>
          </div>

          {/* Sort Vectors */}
          <div className="relative col-span-2 sm:col-span-1">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full sm:w-40 appearance-none px-3 py-2 bg-[#07080b] border border-[#1e2330] rounded text-xs font-bold uppercase tracking-wider text-[#ff9a00] focus:outline-none focus:border-[#ff6b00]/60 cursor-pointer pr-8 transition-colors"
            >
              <option value="startTime">⏱ Chronology</option>
              <option value="popular">⚡ Player Density</option>
              <option value="prize">💎 Reward Weights</option>
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-[9px] text-[#4e5d78]">▼</div>
          </div>
        </div>
      </div>

      {/* Grid Dashboard Array */}
      {processedTournaments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {processedTournaments.map((tournament) => (
            <div
              key={tournament.id}
              className="bg-[#0a0c10] border border-[#1e2330] hover:border-[#ff6b00]/30 rounded-lg p-4 flex flex-col justify-between hover:shadow-[0_4px_20px_rgba(255,107,0,0.06)] group transition-all duration-200"
            >
              <div className="flex justify-between items-start gap-4 mb-3">
                <div className="min-w-0">
                  <span className="inline-block px-2 py-0.5 bg-[#ff6b00]/10 border border-[#ff6b00]/20 text-[#ff6b00] font-['Orbitron'] text-[10px] font-black tracking-widest uppercase rounded-sm mb-1.5">
                    {tournament.type} // {tournament.mode}
                  </span>
                  <h4 className="text-base font-['Orbitron'] font-bold text-white truncate tracking-wide group-hover:text-[#ff9a00] transition-colors">
                    {tournament.name}
                  </h4>
                </div>
                
                <div className="text-right shrink-0">
                  <span className="block text-[10px] text-[#4e5d78] font-bold uppercase tracking-wider">Entry Fee</span>
                  <span className="text-xs font-black text-green-400 uppercase tracking-widest bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-sm">
                    {tournament.prizePool}
                  </span>
                </div>
              </div>

              <div className="border-t border-[#141822] pt-3 mt-2 flex justify-between items-center text-xs">
                <div className="space-y-0.5">
                  <span className="block text-[10px] text-[#4e5d78] font-bold uppercase tracking-wider">Launch Vector</span>
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

                <div className="text-right space-y-0.5">
                  <span className="block text-[10px] text-[#4e5d78] font-bold uppercase tracking-wider">Registered Units</span>
                  <span className="font-['Orbitron'] font-bold text-white">
                    👥 {tournament.players} Max
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-[#0a0c10] border border-[#1e2330] rounded-lg">
          <p className="text-sm font-bold uppercase tracking-widest text-[#4e5d78]">
            📡 No Matching Operational Arenas Located
          </p>
          <p className="text-xs text-[#4e5d78]/60 uppercase tracking-wider mt-1">
            Adjust network filtering protocols to view backlogs
          </p>
        </div>
      )}

      {/* Pure Tailwind Dialog Portal Layer */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0a0c10] border border-[#2a2e3a] w-full max-w-2xl rounded-lg overflow-hidden relative shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
            <div className="p-4 border-b border-[#141822] flex justify-between items-center bg-[#0d0f15]">
              <h3 className="font-['Orbitron'] font-bold text-sm text-white tracking-widest uppercase">
                ⚡ Initialize Grid Tournament
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#4e5d78] hover:text-[#ff6b00] text-xs font-bold uppercase tracking-widest cursor-pointer transition-colors"
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