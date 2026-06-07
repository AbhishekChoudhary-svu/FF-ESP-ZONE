"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Loader2, Cpu, CircleDollarSign, Coins } from "lucide-react"

export default function PrizeDistribution() {
  const [tournaments, setTournaments] = useState([])
  const [loading,     setLoading]     = useState(true)
  const [selected,    setSelected]    = useState(null)
  const [result,      setResult]      = useState(null)
  const [fetching,    setFetching]    = useState(false)

  useEffect(() => {
    fetch("/api/admin/tournaments?status=completed")
      .then(r => r.json())
      .then(d => { if (d.success) setTournaments(d.tournaments) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const loadResult = async (tournament) => {
    setSelected(tournament)
    setResult(null)
    setFetching(true)
    try {
      const res  = await fetch(`/api/tournaments/${tournament._id}/results`)
      const data = await res.json()
      if (data.success) setResult(data.result)
    } catch {} finally { setFetching(false) }
  }

  const sortedResults = result?.results
    ?.filter(r => !r.isDisqualified)
    .sort((a, b) => b.totalPoints - a.totalPoints) ?? []

  const totalDistributed = sortedResults.reduce((s, r) => s + (r.prize || 0), 0)

  return (
    <div className="space-y-6 font-sans text-foreground">

      {/* Header */}
      <div className="flex justify-between items-center border-b border-border pb-4">
        <div>
          <h3 className="text-xl font-bold font-display tracking-wider text-accent flex items-center gap-2 uppercase">
            <span className="text-xl">💰</span>
            Prize Yield Matrix
          </h3>
          <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-widest mt-1">
            Distributed pool telemetry // financial allocation indices
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-6">

          {/* Tournament List */}
          <div className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
              <Cpu className="h-3 w-3" /> Completed Operations
            </p>
            {tournaments.filter(t => t.status === "completed").length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-xs font-bold uppercase tracking-wider border border-border rounded-sm bg-card/20">
                📡 No terminated operations detected
              </div>
            ) : (
              tournaments.filter(t => t.status === "completed").map(t => (
                <button
                  key={t._id}
                  onClick={() => loadResult(t)}
                  className={`w-full text-left p-4 rounded-sm border transition-all duration-150 ${
                    selected?._id === t._id
                      ? "border-primary/50 bg-primary/5 shadow-[0_0_12px_rgba(255,107,0,0.08)]"
                      : "border-border/60 bg-card/30 hover:bg-card/60 hover:border-border"
                  }`}
                >
                  <p className="text-sm font-bold font-display text-white tracking-wide">{t.name}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {t.gameMode} {t.teamMode} •{" "}
                    <span className="text-accent font-bold">₹{t.prizePool?.toLocaleString()}</span> yield
                  </p>
                </button>
              ))
            )}
          </div>

          {/* Results Panel */}
          <div className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
              <CircleDollarSign className="h-3 w-3" /> Allocation Distribution
            </p>

            {!selected ? (
              <div className="text-center py-16 text-muted-foreground text-xs font-bold uppercase tracking-wider border border-border rounded-sm bg-card/20">
                Select an operation to load allocation matrix
              </div>
            ) : fetching ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              </div>
            ) : !result ? (
              <div className="text-center py-16 text-muted-foreground text-xs font-bold uppercase tracking-wider border border-border rounded-sm bg-card/20">
                No results submitted for this operation
              </div>
            ) : (
              <div className="space-y-2">
                {/* Total pool */}
                <Card className="p-3 border border-accent/20 bg-accent/5 rounded-sm flex justify-between items-center">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <Coins className="h-3 w-3 text-accent" /> Total Prize Pool
                  </span>
                  <span className="font-display font-black text-accent text-base">₹{selected.prizePool?.toLocaleString()}</span>
                </Card>

                {sortedResults.map((r, i) => {
                  const name  = r.team?.teamName ?? r.player?.userId?.username ?? `Slot ${i + 1}`
                  const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : null
                  return (
                    <div
                      key={i}
                      className={`flex items-center gap-3 p-3 rounded-sm border ${
                        i < 3
                          ? "border-accent/20 bg-accent/5"
                          : "border-border/60 bg-card/20"
                      }`}
                    >
                      <span className="font-display font-black text-sm w-8 text-center">
                        {medal ?? <span className="text-muted-foreground text-[10px]">#{i + 1}</span>}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold font-display text-white tracking-wide">{name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {result.gameMode === "CS"
                            ? `${r.matchWins}W ${r.roundsWon}R`
                            : `Placement #${r.placement} • ${r.kills}K`
                          } • <span className="text-primary">{r.totalPoints}pts</span>
                        </p>
                      </div>
                      <span className={`font-display font-black text-sm ${r.prize > 0 ? "text-green-400" : "text-muted-foreground"}`}>
                        {r.prize > 0 ? `₹${r.prize.toLocaleString()}` : "—"}
                      </span>
                    </div>
                  )
                })}

                {/* Summary */}
                <Card className="p-3 border border-border/60 bg-card/20 rounded-sm flex justify-between items-center">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Aggregated Yield Distributed</span>
                  <span className="font-display font-black text-green-400 text-base">₹{totalDistributed.toLocaleString()}</span>
                </Card>

                {result.notes && (
                  <Card className="p-3 border border-border/60 bg-card/20 rounded-sm">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-1">Admin Notes</p>
                    <p className="text-xs text-foreground/80">{result.notes}</p>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}