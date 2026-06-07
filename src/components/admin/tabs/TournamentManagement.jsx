"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trophy, Search, Filter, ArrowUpDown, Settings, Trash2, Loader2 } from "lucide-react"
import toast from "react-hot-toast"

const STATUS_STYLE = {
  draft:     "bg-[#ff9a00]/5 border-[#ff9a00]/20 text-[#ff9a00]",
  upcoming:  "bg-blue-500/5 border-blue-500/20 text-blue-400",
  ongoing:   "bg-green-500/5 border-green-500/20 text-green-400",
  completed: "bg-muted-foreground/5 border-muted-foreground/20 text-muted-foreground",
  cancelled: "bg-destructive/5 border-destructive/20 text-destructive",
  paused:    "bg-accent/5 border-accent/20 text-accent",
}
const STATUS_DOT = {
  draft: "bg-[#ff9a00]", upcoming: "bg-blue-400", ongoing: "bg-green-400",
  completed: "bg-muted-foreground", cancelled: "bg-destructive", paused: "bg-accent",
}

export default function TournamentManagement() {
  const [tournaments, setTournaments] = useState([])
  const [loading,     setLoading]     = useState(true)
  const [search,      setSearch]      = useState("")
  const [filterStatus,setFilter]      = useState("all")
  const [typeFilter,  setTypeFilter]  = useState("all")
  const [sortBy,      setSortBy]      = useState("newest")

  const fetchTournaments = async () => {
    setLoading(true)
    try {
      const res  = await fetch("/api/admin/tournaments")
      const data = await res.json()
      if (data.success) setTournaments(data.tournaments)
    } catch { toast.error("Failed to load tournaments") }
    finally   { setLoading(false) }
  }

  useEffect(() => { fetchTournaments() }, [])

  const handleStatusChange = async (id, status) => {
    try {
      const res  = await fetch(`/api/tournaments/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || "Failed"); return }
      toast.success(`Status updated to ${status}`)
      fetchTournaments()
    } catch { toast.error("Something went wrong") }
  }

  const handleDelete = async (id) => {
    if (!confirm("Purge this operation sequence?")) return
    try {
      const res  = await fetch(`/api/tournaments/${id}`, { method: "DELETE" })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || "Failed"); return }
      toast.success("Tournament purged")
      fetchTournaments()
    } catch { toast.error("Something went wrong") }
  }

  const filtered = tournaments
    .filter(t => {
      const matchSearch = t.name?.toLowerCase().includes(search.toLowerCase())
      const matchFilter = filterStatus === "all" || t.status === filterStatus
      const matchType   = typeFilter === "all" || t.tournamentType === typeFilter
      return matchSearch && matchFilter && matchType
    })
    .sort((a, b) => {
      if (sortBy === "prize")   return (b.prizePool || 0) - (a.prizePool || 0)
      if (sortBy === "players") return (b.filledSlots || 0) - (a.filledSlots || 0)
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    })

  return (
    <div className="space-y-6 font-sans text-foreground">

      {/* Header */}
      <div className="flex justify-between items-center border-b border-border pb-4">
        <div>
          <h3 className="text-xl font-bold font-display tracking-wider text-primary flex items-center gap-2 uppercase">
            <Trophy className="h-5 w-5 text-primary shrink-0" />
            Operations Manifest
          </h3>
          <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-widest mt-1">
            Active instances // live configuration pipelines
          </p>
        </div>
        <span className="px-2.5 py-0.5 bg-accent/10 border border-accent/20 text-accent font-display text-[10px] font-black tracking-widest uppercase rounded-sm">
          {filtered.length} Operations
        </span>
      </div>

      {/* Filters */}
      <div className="grid md:grid-cols-4 gap-3 bg-card/40 p-3 border border-border/80 rounded-sm">
        <div className="relative flex items-center md:col-span-2">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground/60 pointer-events-none" />
          <Input
            placeholder="Query operational handles..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 bg-background border border-border rounded-sm text-foreground placeholder-muted-foreground text-sm font-semibold tracking-wide focus-visible:ring-primary/50 focus-visible:border-primary/50 h-9"
          />
        </div>
        <div className="relative flex items-center">
          <Filter className="absolute left-3 h-3.5 w-3.5 text-muted-foreground/60 pointer-events-none z-10" />
          <Select value={filterStatus} onValueChange={setFilter}>
            <SelectTrigger className="bg-background border border-border rounded-sm text-xs font-bold uppercase tracking-wider text-muted-foreground h-9 pl-9 cursor-pointer focus:ring-0">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-card border border-border rounded-sm text-xs uppercase font-display font-bold">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="upcoming">Staged Pipeline</SelectItem>
              <SelectItem value="ongoing">Active Sequence</SelectItem>
              <SelectItem value="completed">Terminated Safe</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="relative flex items-center">
          <ArrowUpDown className="absolute left-3 h-3.5 w-3.5 text-accent pointer-events-none z-10" />
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="bg-background border border-primary/20 rounded-sm text-xs font-bold uppercase tracking-wider text-accent h-9 pl-9 cursor-pointer focus:ring-0">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent className="bg-card border border-border rounded-sm text-xs uppercase font-display font-bold">
              <SelectItem value="newest">Sequence: Generation</SelectItem>
              <SelectItem value="prize">Sequence: Yield Value</SelectItem>
              <SelectItem value="players">Sequence: Core Load</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span className="ml-2 text-xs text-muted-foreground uppercase tracking-widest font-bold">Loading operations...</span>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-sm border border-border/80 bg-card/20">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-background/50 font-display text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                <th className="py-3 px-4">Operation Name</th>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4 text-center">Core Load</th>
                <th className="py-3 px-4">Prize Yield</th>
                <th className="py-3 px-4">Phase</th>
                <th className="py-3 px-4 text-right">Directives</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 text-xs font-semibold">
              {filtered.map(t => (
                <tr key={t._id} className="hover:bg-primary/5 transition-colors duration-150 group">
                  <td className="py-3 px-4 text-white font-display text-sm tracking-wide group-hover:text-primary transition-colors">
                    <div>
                      <p>{t.name}</p>
                      <p className="text-[10px] text-muted-foreground font-sans font-normal mt-0.5">
                        By {t.organizer?.username ?? "Unknown"} • {t.gameMode} {t.teamMode}
                      </p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 border text-[10px] font-black font-mono uppercase rounded-sm ${t.tournamentType === "paid" ? "bg-accent/5 border-accent/20 text-accent" : "bg-green-500/5 border-green-500/20 text-green-400"}`}>
                      {t.tournamentType}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-display text-sm font-bold text-white">
                    {t.filledSlots}/{t.totalSlots} <span className="text-[10px] text-muted-foreground font-sans font-normal">MAX</span>
                  </td>
                  <td className="py-3 px-4 font-display text-sm font-bold text-accent">
                    ₹{t.prizePool?.toLocaleString() ?? "0"}
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={t.status}
                      onChange={e => handleStatusChange(t._id, e.target.value)}
                      className="appearance-none px-2 py-1 bg-background border border-border rounded-sm text-muted-foreground text-[10px] font-bold uppercase tracking-wider focus:outline-none focus:border-primary/50 cursor-pointer"
                    >
                      {["draft","upcoming","ongoing","completed","cancelled"].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        onClick={() => handleDelete(t._id)}
                        className="h-7 bg-destructive/10 border border-destructive/30 text-destructive hover:bg-destructive hover:text-white text-[10px] uppercase font-display tracking-wider rounded-sm cursor-pointer transition-all duration-150 flex items-center gap-1"
                      >
                        <Trash2 className="h-3 w-3" />
                        Purge
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-16 bg-card/20 border border-border rounded-sm">
          <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
            📡 Zero operation sequences matching current parameter vectors
          </p>
        </div>
      )}
    </div>
  )
}