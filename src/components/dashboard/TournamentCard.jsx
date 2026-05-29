"use client"

export function TournamentCard({ tournament = {
  name: "Garena World Series",
  type: "Battle Royale",
  mode: "Squad",
  entryFee: 5,
  prizePool: 10000,
  players: 64,
  startDate: "2025-06-15",
  slotsJoined: 47,
} }) {
  const startLabel = tournament.startDate
    ? new Date(tournament.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : "TBA"

  const prizeLabel =
    typeof tournament.prizePool === "number"
      ? `$${tournament.prizePool.toLocaleString()}`
      : tournament.prizePool

  const slotsJoined = tournament.slotsJoined ?? Math.floor(tournament.players * 0.73)
  const slotsLeft = tournament.players - slotsJoined
  const fillPct = Math.round((slotsJoined / tournament.players) * 100)

  return (
    <>
      {/* Injecting fonts globally since Tailwind requires them to be loaded */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Orbitron:wght@700;900&display=swap');`}</style>

      {/* Main Tournament Card Container */}
      <div className="relative w-full my-4 mx-auto bg-[#0a0c10] border border-[#2a2e3a] rounded-xl overflow-hidden font-['Rajdhani'] before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-[2px] before:bg-gradient-to-r before:from-transparent before:via-[#ff6b00] before:to-[#ffb300] before:via-[#ff6b00] before:to-transparent">
        
        {/* Absolute Glowing Corner Brackets */}
        <div className="absolute z-10 w-3 h-3 top-0 left-0 border-t-2 border-l-2 border-[#ff6b00]" />
        <div className="absolute z-10 w-3 h-3 top-0 right-0 border-t-2 border-r-2 border-[#ff6b00]" />
        <div className="absolute z-10 w-3 h-3 bottom-0 left-0 border-b-2 border-l-2 border-[#ff6b00]" />
        <div className="absolute z-10 w-3 h-3 bottom-0 right-0 border-b-2 border-r-2 border-[#ff6b00]" />

        {/* Header Section */}
        <div className="relative flex justify-between items-start px-5 pt-4.5 pb-3.5 bg-gradient-to-br from-[#0f1318] via-[#1a1f2e] to-[#0f1318] border-b border-[#1e2330] overflow-hidden after:content-[''] after:absolute after:-top-[30px] after:-right-[30px] after:w-[120px] after:h-[120px] after:bg-[radial-gradient(circle,rgba(255,107,0,0.08)_0%,transparent_70%)] after:pointer-events-none">
          <div>
            {/* Badges Row */}
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {tournament.type && (
                <span className="text-[11px] font-bold tracking-wider px-2.5 py-0.5 rounded-[3px] uppercase bg-[#ff6b00]/15 text-[#ff8c30] border border-[#ff6b00]/30">
                  {tournament.type}
                </span>
              )}
              {tournament.mode && (
                <span className="text-[11px] font-bold tracking-wider px-2.5 py-0.5 rounded-[3px] uppercase bg-[#63b3ed]/10 text-[#63b3ed] border border-[#63b3ed]/25">
                  {tournament.mode}
                </span>
              )}
              {tournament.entryFee && (
                <span className="text-[11px] font-bold tracking-wider px-2.5 py-0.5 rounded-[3px] uppercase bg-[#edb438]/12 text-[#edb438] border border-[#edb438]/30">
                  ${tournament.entryFee} Entry
                </span>
              )}
            </div>
            {/* Title */}
            <div className="font-['Orbitron'] text-[17px] font-bold text-[#f0f2f5] tracking-wide leading-tight [text-shadow:0_0_20px_rgba(255,107,0,0.3)]">
              {tournament.name}
            </div>
          </div>

          {/* Prize Section */}
          <div className="text-right flex-shrink-0">
            <div className="font-['Orbitron'] text-2xl font-black bg-gradient-to-br from-[#ff8c00] to-[#ffcc00] bg-clip-text text-transparent leading-none">
              {prizeLabel}
            </div>
            <div className="text-[11px] text-[#5a6070] tracking-widest uppercase mt-[3px]">
              Prize Pool
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 border-b border-[#1e2330]">
          {/* Players Stat */}
          <div className="relative px-5 py-3.5 after:content-[''] after:absolute after:right-0 after:top-[20%] after:bottom-[20%] after:w-[1px] after:bg-[#1e2330]">
            <div className="text-[11px] text-[#4a5060] uppercase tracking-widest mb-1">Players</div>
            <div className="text-[17px] font-bold text-[#d0d5df]">{tournament.players}</div>
          </div>
          {/* Starting Stat */}
          <div className="relative px-5 py-3.5 after:content-[''] after:absolute after:right-0 after:top-[20%] after:bottom-[20%] after:w-[1px] after:bg-[#1e2330]">
            <div className="text-[11px] text-[#4a5060] uppercase tracking-widest mb-1">Starting</div>
            <div className="text-[17px] font-bold text-[#d0d5df]">{startLabel}</div>
          </div>
          {/* Status Stat */}
          <div className="px-5 py-3.5">
            <div className="text-[11px] text-[#4a5060] uppercase tracking-widest mb-1">Status</div>
            <div className="flex items-center gap-1.5 text-[17px] font-bold text-[#4ade80]">
              <span className="inline-block w-1.5 h-1.5 bg-[#4ade80] rounded-full shadow-[0_0_6px_#4ade80] animate-pulse" />
              Open
            </div>
          </div>
        </div>

        {/* Slots Tracker Bar */}
        <div className="px-5 py-3 bg-[#0c0e14] border-b border-[#1e2330]">
          <div className="text-[11px] text-[#4a5060] uppercase tracking-widest mb-1.5">Slots Filled</div>
          <div className="h-1.5 bg-[#1e2330] rounded-sm overflow-hidden mb-1">
            <div 
              className="h-full bg-gradient-to-r from-[#ff6b00] to-[#ffb300] rounded-sm transition-[width] duration-600 ease-out" 
              style={{ width: `${fillPct}%` }} 
            />
          </div>
          <div className="flex justify-between text-xs text-[#5a6070]">
            <span className="text-[#ff8c30] font-bold">{slotsJoined} / {tournament.players} joined</span>
            <span>{slotsLeft} slots left</span>
          </div>
        </div>

        {/* Action Elements Footer */}
        <div className="flex gap-2.5 p-5 bg-[#0a0c10]">
          <button className="flex-1 py-2.5 border-none rounded-md bg-gradient-to-br from-[#ff6b00] to-[#ff9a00] text-white text-md font-bold tracking-wider uppercase cursor-pointer relative overflow-hidden shadow-[0_4px_15px_rgba(255,107,0,0.35)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(255,107,0,0.5)] active:scale-[0.98] transition-all duration-200">
            ⚔ Join Tournament
          </button>
          <button className="px-4.5 py-2.5 rounded-md bg-transparent border border-[#2a2e3a] text-[#8090a0] text-md font-semibold tracking-wider uppercase cursor-pointer hover:border-[#ff6b00]/30 hover:text-[#ff8c30] hover:bg-[#ff6b00]/5 transition-all duration-200">
            Details
          </button>
        </div>

      </div>
    </>
  )
}