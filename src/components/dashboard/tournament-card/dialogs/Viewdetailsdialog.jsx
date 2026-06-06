"use client"

import { useEffect, useState } from "react"
import { Lock, Loader2, Trophy } from "lucide-react"

function formatDate(date) {
  if (!date) return "TBA"
  return new Date(date).toLocaleDateString("en-IN", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  })
}

function Dialog({ open, onClose, title, children, maxWidth = "max-w-2xl" }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className={`relative w-full ${maxWidth} bg-[#0a0c10] border border-[#2a2e3a] rounded-xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.7)] font-['Rajdhani']`}>
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#ff6b00] to-transparent" />
        <div className="absolute top-0 left-0   w-3 h-3 border-t-2 border-l-2 border-[#ff6b00]" />
        <div className="absolute top-0 right-0  w-3 h-3 border-t-2 border-r-2 border-[#ff6b00]" />
        <div className="absolute bottom-0 left-0  w-3 h-3 border-b-2 border-l-2 border-[#ff6b00]" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#ff6b00]" />
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#141822] bg-[#0d0f15]">
          <h3 className="font-['Orbitron'] font-bold text-sm text-white tracking-widest uppercase">{title}</h3>
          <button onClick={onClose} className="text-[#4e5d78] hover:text-red-400 transition-colors text-lg leading-none">✕</button>
        </div>
        <div className="px-6 py-5 max-h-[80vh] overflow-y-auto tab-scrollbar">
          {children}
        </div>
      </div>
    </div>
  )
}

// ── Placement medal color ─────────────────────────────────────
function placementColor(rank) {
  if (rank === 1) return "text-[#ffaa00]"
  if (rank === 2) return "text-[#c0c0c0]"
  if (rank === 3) return "text-[#cd7f32]"
  return "text-[#4e5d78]"
}

// ── Results leaderboard ───────────────────────────────────────
function ResultsLeaderboard({ results, gameMode }) {
  const isCS = gameMode === "CS"

  const sorted = [...results]
    .filter(r => !r.isDisqualified)
    .sort((a, b) => b.totalPoints - a.totalPoints)

  const dqd = results.filter(r => r.isDisqualified)

  return (
    <div className="space-y-2">
      {/* Column headers */}
      <div className={`grid gap-2 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#4e5d78] ${isCS ? "grid-cols-12" : "grid-cols-12"}`}>
        <span className="col-span-1">#</span>
        <span className="col-span-4">Team / Player</span>
        {isCS ? (
          <>
            <span className="col-span-2 text-center">Wins</span>
            <span className="col-span-2 text-center">Rnd Won</span>
          </>
        ) : (
          <>
            <span className="col-span-1 text-center">Place</span>
            <span className="col-span-2 text-center">Kills</span>
          </>
        )}
        <span className="col-span-2 text-center">Pts</span>
        <span className="col-span-2 text-right">Prize</span>
      </div>

      {/* Result rows */}
      {sorted.map((r, i) => {
        const name   = r.team?.teamName ?? r.player?.userId?.username ?? `Slot ${i + 1}`
        const avatar = r.player?.avatar ?? null
        const logo   = r.team?.logo ?? null
        const rank   = i + 1

        return (
          <div
            key={i}
            className={`grid grid-cols-12 gap-2 items-center px-3 py-3 rounded-lg border transition-all ${
              rank === 1
                ? "bg-[#ffaa00]/5 border-[#ffaa00]/20"
                : rank === 2
                ? "bg-[#c0c0c0]/5 border-[#c0c0c0]/10"
                : rank === 3
                ? "bg-[#cd7f32]/5 border-[#cd7f32]/10"
                : "bg-[#07080b] border-[#1e2330]"
            }`}
          >
            {/* Rank */}
            <div className="col-span-1">
              <span className={`font-['Orbitron'] font-black text-sm ${placementColor(rank)}`}>
                {rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `#${rank}`}
              </span>
            </div>

            {/* Name + avatar */}
            <div className="col-span-4 flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-[#1a1f2e] border border-[#2a2e3a] flex-shrink-0 flex items-center justify-center overflow-hidden">
                {logo || avatar
                  ? <img src={logo || avatar} className="w-full h-full object-cover" alt="" />
                  : <span className="text-[10px] font-black text-[#ff8c30]">{name?.charAt(0)}</span>
                }
              </div>
              <p className="text-xs font-bold text-[#d0d5df] truncate">{name}</p>
            </div>

            {/* Stats */}
            {isCS ? (
              <>
                <div className="col-span-2 text-center">
                  <span className="font-['Orbitron'] font-bold text-xs text-[#4ade80]">{r.matchWins ?? 0}</span>
                  <span className="text-[#4e5d78] text-[10px]">W</span>
                </div>
                <div className="col-span-2 text-center">
                  <span className="font-['Orbitron'] font-bold text-xs text-[#63b3ed]">{r.roundsWon ?? 0}</span>
                </div>
              </>
            ) : (
              <>
                <div className="col-span-1 text-center">
                  <span className={`font-['Orbitron'] font-bold text-xs ${placementColor(r.placement)}`}>
                    #{r.placement}
                  </span>
                </div>
                <div className="col-span-2 text-center">
                  <span className="font-['Orbitron'] font-bold text-xs text-[#63b3ed]">{r.kills ?? 0}</span>
                  <span className="text-[#4e5d78] text-[10px]">K</span>
                </div>
              </>
            )}

            {/* Points */}
            <div className="col-span-2 text-center">
              <span className="font-['Orbitron'] font-black text-sm text-white">{r.totalPoints ?? 0}</span>
              <span className="text-[#4e5d78] text-[10px] ml-0.5">pts</span>
            </div>

            {/* Prize */}
            <div className="col-span-2 text-right">
              {r.prize > 0
                ? <span className="font-['Orbitron'] font-bold text-xs text-green-400">₹{r.prize.toLocaleString()}</span>
                : <span className="text-[#2a2e3a] text-xs">—</span>
              }
            </div>
          </div>
        )
      })}

      {/* Disqualified */}
      {dqd.length > 0 && (
        <div className="mt-3 space-y-1.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-red-400/60">◆ Disqualified</p>
          {dqd.map((r, i) => {
            const name = r.team?.teamName ?? r.player?.userId?.username ?? "Unknown"
            return (
              <div key={i} className="flex items-center justify-between px-3 py-2 bg-red-950/10 border border-red-900/20 rounded-lg opacity-60">
                <p className="text-xs font-bold text-red-400 line-through">{name}</p>
                {r.disqualifyReason && (
                  <p className="text-[10px] text-red-400/60">{r.disqualifyReason}</p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Participants list (pre-results) ───────────────────────────
function ParticipantsList({ participants }) {
  return (
    <div className="space-y-2 max-h-56 overflow-y-auto tab-scrollbar">
      {participants.map((p, i) => {
        const name        = p.team?.teamName ?? p.player?.userId?.username ?? `Slot ${i + 1}`
        const memberCount = p.members?.length ?? 1
        const avatar      = p.player?.avatar ?? null

        return (
          <div key={i} className="flex items-center gap-3 p-3 bg-[#07080b] border border-[#1e2330] rounded-lg">
            <div className="w-8 h-8 rounded-lg bg-[#1a1f2e] border border-[#2a2e3a] flex-shrink-0 flex items-center justify-center overflow-hidden">
              {avatar
                ? <img src={avatar} className="w-full h-full object-cover" alt="" />
                : <span className="text-xs font-black text-[#ff8c30]">{name?.charAt(0)}</span>
              }
            </div>
            <span className="font-['Orbitron'] font-black text-xs text-[#ffaa00] w-6 flex-shrink-0">
              #{i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[#d0d5df] truncate">{name}</p>
              <p className="text-[11px] text-[#4e5d78]">
                {memberCount} member{memberCount > 1 ? "s" : ""} • Joined {formatDate(p.joinedAt)}
              </p>
            </div>
            {p.placement ? (
              <span className={`text-[10px] font-black font-['Orbitron'] ${placementColor(p.placement)}`}>
                #{p.placement}
              </span>
            ) : null}
            {p.paymentStatus === "confirmed" && p.paymentId && (
              <span className="text-[9px] font-bold px-2 py-0.5 bg-[#4ade80]/10 border border-[#4ade80]/20 text-[#4ade80] rounded uppercase">
                Paid
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Main dialog ───────────────────────────────────────────────

export function ViewDetailsDialog({ open, onClose, tournament }) {
  const [rich,        setRich]        = useState(null)
  const [matchResult, setMatchResult] = useState(null)
  const [fetching,    setFetching]    = useState(false)
  const [activeTab,   setActiveTab]   = useState("info") // "info" | "participants" | "results"

  useEffect(() => {
    if (!open || !tournament?._id) return
    setFetching(true)
    setRich(null)
    setMatchResult(null)

    Promise.all([
      fetch(`/api/tournaments/${tournament._id}`).then(r => r.json()),
      fetch(`/api/tournaments/${tournament._id}/results`).then(r => r.json()).catch(() => ({ success: false })),
    ]).then(([tData, rData]) => {
      if (tData.success) setRich(tData.tournament)
      if (rData.success) setMatchResult(rData.result)
    }).catch(() => {})
    .finally(() => setFetching(false))
  }, [open, tournament?._id])

  const t            = rich ?? tournament
  const filledSlots  = t?.filledSlots ?? 0
  const totalSlots   = t?.totalSlots  ?? 0
  const fillPct      = totalSlots > 0 ? Math.round((filledSlots / totalSlots) * 100) : 0
  const hasRoom      = !!(t?.roomId && t?.roomPassword)
  const participants = t?.participants ?? []
  const isCompleted  = t?.status === "completed"
  const hasResults   = matchResult?.results?.length > 0

  const tabs = [
    { id: "info",         label: "Info" },
    { id: "participants", label: `Participants (${participants.length})` },
    ...(hasResults ? [{ id: "results", label: "🏆 Results" }] : []),
  ]

  return (
    <Dialog open={open} onClose={onClose} title={`🏆 ${t?.name ?? "Tournament"}`} maxWidth="max-w-2xl">

      {fetching ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-5 h-5 animate-spin text-[#ff6b00]" />
          <span className="ml-2 text-xs text-[#4e5d78] uppercase tracking-widest font-bold">Loading...</span>
        </div>
      ) : (
        <div className="space-y-5">

          {/* Banner */}
          {t?.bannerImage && (
            <img src={t.bannerImage} alt="" className="w-full h-32 object-cover rounded-lg border border-[#1e2330]" />
          )}

          {/* Tabs */}
          <div className="flex gap-1 bg-[#07080b] border border-[#1e2330] rounded-lg p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2 text-[11px] font-bold uppercase tracking-wider rounded transition-all ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-[#ff6b00] to-[#ff9a00] text-white shadow-[0_2px_8px_rgba(255,107,0,0.3)]"
                    : "text-[#4e5d78] hover:text-[#8090a0]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── Info Tab ─────────────────────────────────────── */}
          {activeTab === "info" && (
            <div className="space-y-4">

              {/* Stat chips */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Mode",   value: `${t?.gameMode} ${t?.teamMode}`, color: "text-[#63b3ed]" },
                  { label: "Prize",  value: `₹${t?.prizePool?.toLocaleString() ?? 0}`, color: "text-green-400" },
                  { label: "Entry",  value: t?.tournamentType === "paid" ? `₹${t?.entryFee}` : "Free", color: t?.tournamentType === "paid" ? "text-[#ff9a00]" : "text-[#4ade80]" },
                  { label: "Region", value: t?.region ?? "India", color: "text-[#d0d5df]" },
                ].map((s, i) => (
                  <div key={i} className="p-3 bg-[#07080b] border border-[#1e2330] rounded-lg text-center">
                    <p className="text-[10px] text-[#4e5d78] uppercase tracking-wider font-bold mb-1">{s.label}</p>
                    <p className={`text-xs font-black font-['Orbitron'] ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Slots progress */}
              <div className="p-4 bg-[#07080b] border border-[#1e2330] rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#4e5d78]">◆ Slots Filled</p>
                  <p className="text-xs font-black font-['Orbitron'] text-[#ffaa00]">{filledSlots} / {totalSlots}</p>
                </div>
                <div className="h-2 bg-[#1e2330] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#ff6b00] to-[#ffb300] rounded-full transition-all" style={{ width: `${fillPct}%` }} />
                </div>
                <p className="text-[11px] text-[#4e5d78] mt-1">{totalSlots - filledSlots} slots remaining</p>
              </div>

              {/* Room credentials */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#4e5d78] mb-3">◆ Room Credentials</p>
                {hasRoom ? (
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Room ID",  value: t.roomId },
                      { label: "Password", value: t.roomPassword },
                    ].map((c, i) => (
                      <div key={i} className="p-3 bg-[#07080b] border border-[#4ade80]/20 rounded-lg">
                        <p className="text-[10px] text-[#4e5d78] uppercase tracking-wider font-bold mb-1">{c.label}</p>
                        <p className="font-['Orbitron'] font-black text-[#4ade80] text-sm tracking-widest select-all">{c.value}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-[#07080b] border border-[#1e2330] rounded-lg flex items-center gap-3">
                    <Lock className="w-4 h-4 text-[#4e5d78]" />
                    <p className="text-sm text-[#4e5d78] font-semibold">Room credentials not published yet</p>
                  </div>
                )}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { label: "Registration Closes", value: formatDate(t?.registrationDeadline) },
                  { label: "Starts",              value: formatDate(t?.startDate) },
                  { label: "Ends",                value: formatDate(t?.endDate) },
                ].map((d, i) => (
                  <div key={i} className="p-3 bg-[#07080b] border border-[#1e2330] rounded-lg">
                    <p className="text-[10px] text-[#4e5d78] uppercase tracking-wider font-bold mb-1">{d.label}</p>
                    <p className="text-xs font-bold text-[#d0d5df]">{d.value}</p>
                  </div>
                ))}
              </div>

              {/* Rules */}
              {t?.rules && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#4e5d78] mb-2">◆ Rules</p>
                  <div className="p-4 bg-[#07080b] border border-[#1e2330] rounded-lg">
                    <p className="text-sm text-[#8090a0] leading-relaxed whitespace-pre-wrap">{t.rules}</p>
                  </div>
                </div>
              )}

              {/* Organizer */}
              <div className="pt-2 border-t border-[#141822]">
                <p className="text-[11px] text-[#4e5d78] font-bold uppercase tracking-wider">
                  Organized by {t?.organizer?.username ?? "Unknown"}
                </p>
              </div>
            </div>
          )}

          {/* ── Participants Tab ──────────────────────────────── */}
          {activeTab === "participants" && (
            <div className="space-y-3">
              {participants.length === 0 ? (
                <div className="text-center py-10 text-[#4e5d78] text-sm font-bold uppercase tracking-wider">
                  No participants yet
                </div>
              ) : (
                <ParticipantsList participants={participants} />
              )}
            </div>
          )}

          {/* ── Results Tab ───────────────────────────────────── */}
          {activeTab === "results" && hasResults && (
            <div className="space-y-4">

              {/* Result meta */}
              <div className="flex items-center justify-between p-3 bg-[#07080b] border border-[#ffaa00]/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-[#ffaa00]" />
                  <span className="text-xs font-bold text-[#ffaa00] uppercase tracking-wider">
                    Final Results — {matchResult.gameMode} {matchResult.teamMode}
                  </span>
                </div>
                <span className="text-[10px] text-[#4e5d78] font-bold uppercase tracking-wider">
                  {formatDate(matchResult.submittedAt)}
                </span>
              </div>

              {/* Leaderboard */}
              <ResultsLeaderboard
                results={matchResult.results}
                gameMode={matchResult.gameMode}
              />

              {/* Notes */}
              {matchResult.notes && (
                <div className="p-3 bg-[#07080b] border border-[#1e2330] rounded-lg">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#4e5d78] mb-1">Admin Notes</p>
                  <p className="text-xs text-[#8090a0]">{matchResult.notes}</p>
                </div>
              )}

              {/* Point system used */}
              <div className="p-3 bg-[#07080b] border border-[#1e2330] rounded-lg">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#4e5d78] mb-2">◆ Point System Used</p>
                {matchResult.gameMode === "CS" ? (
                  <div className="flex gap-4 text-xs">
                    <span className="text-[#8090a0]">Match Win = <span className="text-[#4ade80] font-black font-['Orbitron']">3 pts</span></span>
                    <span className="text-[#8090a0]">Round Won = <span className="text-[#63b3ed] font-black font-['Orbitron']">1 pt</span></span>
                  </div>
                ) : (
                  <div className="flex gap-4 text-xs flex-wrap">
                    <span className="text-[#8090a0]">1st = <span className="text-[#ffaa00] font-black font-['Orbitron']">{matchResult.teamMode === "Solo" ? 15 : 12} pts</span></span>
                    <span className="text-[#8090a0]">2nd = <span className="text-[#ffaa00] font-black font-['Orbitron']">{matchResult.teamMode === "Solo" ? 12 : 9} pts</span></span>
                    <span className="text-[#8090a0]">Each Kill = <span className="text-[#63b3ed] font-black font-['Orbitron']">1 pt</span></span>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      )}
    </Dialog>
  )
}