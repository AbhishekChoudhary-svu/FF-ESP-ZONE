"use client"

import { useState, useEffect, useContext } from "react"
import { CreateTournamentForm } from "@/components/forms/CreateTournament"
import { TournamentCard } from "../TournamentCard"
import MyContext from "@/context/ThemeProvider"
import { Loader2 } from "lucide-react"

export function FreeTournamentsTab() {
  const ctx = useContext(MyContext)

  const isGuest    = ctx?.user?.role === "guest"
  const isCaptain  = ctx?.player?.isCaptain
  const userRole   = ctx?.user?.role
  const canCreate  = isCaptain && !isGuest

  const [tournaments, setTournaments]   = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState("")
  const [searchQuery, setSearchQuery]   = useState("")
  const [gameMode, setGameMode]         = useState("all")
  const [teamMode, setTeamMode]         = useState("all")
  const [sortBy, setSortBy]             = useState("startTime")
  const [isModalOpen, setIsModalOpen]   = useState(false)

  const fetchTournaments = async () => {
    setLoading(true)
    setError("")
    try {
      const params = new URLSearchParams({ status: "upcoming" })
      if (gameMode !== "all") params.set("gameMode", gameMode.toUpperCase())
      if (teamMode !== "all") params.set("teamMode", teamMode.charAt(0).toUpperCase() + teamMode.slice(1))

      const res  = await fetch(`/api/tournaments/free?${params}`)
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to load tournaments")
        return
      }
      setTournaments(data.tournaments || [])
    } catch (err) {
      console.error(err)
      setError("Failed to connect to server")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTournaments()
  }, [gameMode, teamMode])

  // Client-side search + sort
  const processed = tournaments
    .filter((t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "popular") return b.filledSlots - a.filledSlots
      if (sortBy === "prize")   return b.prizePool - a.prizePool
      return new Date(a.startDate) - new Date(b.startDate)
    })

  return (
    <div className="space-y-6 font-['Rajdhani'] text-[#d0d5df]">

      {/* Header */}
      <div className="flex flex-col md:flex-row gap-2 justify-between items-start border-b border-[#141822] pb-3">
        <div>
          <h3 className="text-xl font-bold font-['Orbitron'] tracking-wider text-white uppercase">
            🏆 Free Arenas
          </h3>
          <p className="text-xs text-[#4e5d78] font-bold uppercase tracking-wide mt-0.5">
            Zero-cost open bracket deployments live on the regional grid
          </p>
        </div>

        {canCreate && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-[#141822] w-full md:w-fit  border border-[#1e2330] hover:border-[#ff6b00]/40 text-[#8090a0] hover:text-[#ff8c30] hover:bg-[#ff6b00]/5 font-['Orbitron'] font-bold text-xs uppercase tracking-wider rounded transition-all duration-200 cursor-pointer active:scale-95"
          >
            + Host Match
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 bg-[#0a0c10] p-3 border border-[#1e2330] rounded-md">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search arenas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 bg-[#07080b] border border-[#1e2330] rounded text-[#d0d5df] placeholder-[#4e5d78] text-sm font-semibold tracking-wide focus:outline-none focus:border-[#ff6b00]/60 transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
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

          <div className="relative col-span-2 sm:col-span-1">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full sm:w-40 appearance-none px-3 py-2 bg-[#07080b] border border-[#1e2330] rounded text-xs font-bold uppercase tracking-wider text-[#ff9a00] focus:outline-none focus:border-[#ff6b00]/60 cursor-pointer pr-8 transition-colors"
            >
              <option value="startTime">⏱ Chronology</option>
              <option value="popular">⚡ Most Players</option>
              <option value="prize">💎 Prize Pool</option>
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-[9px] text-[#4e5d78]">▼</div>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-[#ff6b00]" />
          <span className="ml-3 text-sm font-bold uppercase tracking-widest text-[#4e5d78]">
            Loading Arenas...
          </span>
        </div>
      ) : error ? (
        <div className="text-center py-16 bg-[#0a0c10] border border-red-900/30 rounded-lg">
          <p className="text-sm font-bold uppercase tracking-widest text-red-400">
            ⚠️ {error}
          </p>
          <button
            onClick={fetchTournaments}
            className="mt-4 px-4 py-2 bg-[#141822] border border-[#1e2330] text-[#8090a0] font-bold text-xs uppercase tracking-wider rounded hover:border-[#ff6b00]/40 hover:text-[#ff8c30] transition-all"
          >
            Retry
          </button>
        </div>
      ) : processed.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {processed.map((tournament) => (
            <TournamentCard
              key={tournament._id}
              tournament={tournament}
              onJoinSuccess={fetchTournaments}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-[#0a0c10] border border-[#1e2330] rounded-lg">
          <p className="text-sm font-bold uppercase tracking-widest text-[#4e5d78]">
            📡 No Free Arenas Found
          </p>
          <p className="text-xs text-[#4e5d78]/60 uppercase tracking-wider mt-1">
            Adjust filters or check back later
          </p>
        </div>
      )}

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0a0c10] border border-[#2a2e3a] w-full max-w-2xl rounded-lg overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
            <div className="p-4 border-b border-[#141822] flex justify-between items-center bg-[#0d0f15]">
              <h3 className="font-['Orbitron'] font-bold text-sm text-white tracking-widest uppercase">
                ⚡ Create Free Tournament
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#4e5d78] hover:text-[#ff6b00] text-xs font-bold uppercase tracking-widest cursor-pointer transition-colors"
              >
                ✕ Close
              </button>
            </div>
            <div className="p-4 max-h-[75vh] overflow-y-auto tab-scrollbar bg-[#07080b]">
              <CreateTournamentForm
                onClose={() => {
                  setIsModalOpen(false)
                  fetchTournaments()
                }}
                userRole={userRole}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}