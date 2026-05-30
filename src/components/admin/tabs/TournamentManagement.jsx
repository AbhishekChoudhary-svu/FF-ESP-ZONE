"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trophy, Plus, Search, Filter, ArrowUpDown, Settings, Trash2 } from "lucide-react"

export function TournamentManagementTab() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [sortBy, setSortBy] = useState("newest")

  // Mock tournament data
  const tournaments = [
    {
      id: 1,
      name: "Battle Royale Championship",
      type: "BR",
      players: 128,
      status: "active",
      prizePool: 10000,
      created: "2024-02-15",
    },
    {
      id: 2,
      name: "CS:GO Pro League",
      type: "CS",
      players: 64,
      status: "active",
      prizePool: 25000,
      created: "2024-02-10",
    },
    {
      id: 3,
      name: "Casual Weekend",
      type: "BR",
      players: 32,
      status: "upcoming",
      prizePool: 2000,
      created: "2024-02-01",
    },
    {
      id: 4,
      name: "Elite Tournament",
      type: "CS",
      players: 256,
      status: "completed",
      prizePool: 50000,
      created: "2024-01-20",
    },
    { id: 5, name: "Rookie Cup", type: "BR", players: 16, status: "paused", prizePool: 1000, created: "2024-01-15" },
  ]

  const filteredTournaments = tournaments.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === "all" || t.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const sortedTournaments = [...filteredTournaments].sort((a, b) => {
    if (sortBy === "newest") return new Date(b.created).getTime() - new Date(a.created).getTime()
    if (sortBy === "prize") return b.prizePool - a.prizePool
    if (sortBy === "players") return b.players - a.players
    return a.name.localeCompare(b.name)
  })

  return (
    <div className="space-y-6 font-sans text-foreground">
      
      {/* Sector Control Header */}
      <div className="flex justify-between items-center border-b border-border pb-4">
        <div>
          <h3 className="text-xl font-bold font-display tracking-wider text-primary flex items-center gap-2 uppercase">
            <Trophy className="h-5 w-5 text-primary shrink-0" />
            Operations Manifest
          </h3>
          <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-widest mt-1">
            Active instances // live instance configuration pipelines
          </p>
        </div>
        
        <Button className="h-9 px-4 bg-primary/5 border border-primary/20 hover:border-primary text-primary hover:text-white hover:bg-primary/10 font-display font-bold text-xs uppercase tracking-wider rounded-sm transition-all duration-150 cursor-pointer active:scale-95 flex items-center gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          Create Tournament
        </Button>
      </div>

      {/* Embedded Filtering System Deck */}
      <div className="grid md:grid-cols-3 gap-3 bg-card/40 p-3 border border-border/80 rounded-sm">
        <div className="relative flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground/60 pointer-events-none" />
          <Input
            placeholder="Query operational handles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-sm text-foreground placeholder-muted-foreground text-sm font-semibold tracking-wide focus-visible:ring-primary/50 focus-visible:border-primary/50 h-9"
          />
        </div>

        <div className="relative flex items-center">
          <Filter className="absolute left-3 h-3.5 w-3.5 text-muted-foreground/60 pointer-events-none z-10" />
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="bg-background border border-border rounded-sm text-xs font-bold uppercase tracking-wider text-muted-foreground h-9 pl-9 cursor-pointer focus:ring-0 focus:ring-offset-0">
              <SelectValue placeholder="Filter Pipeline Status" />
            </SelectTrigger>
            <SelectContent className="bg-card border border-border rounded-sm text-xs uppercase font-display font-bold">
              <SelectItem value="all" className="cursor-pointer">All Status Matrices</SelectItem>
              <SelectItem value="active" className="cursor-pointer">Active Sequence</SelectItem>
              <SelectItem value="upcoming" className="cursor-pointer">Staged Pipeline</SelectItem>
              <SelectItem value="completed" className="cursor-pointer">Terminated Safe</SelectItem>
              <SelectItem value="paused" className="cursor-pointer">Halted Sequence</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="relative flex items-center">
          <ArrowUpDown className="absolute left-3 h-3.5 w-3.5 text-accent pointer-events-none z-10" />
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="bg-background border border-primary/20 rounded-sm text-xs font-bold uppercase tracking-wider text-accent h-9 pl-9 cursor-pointer focus:ring-0 focus:ring-offset-0">
              <SelectValue placeholder="Sort Parameters" />
            </SelectTrigger>
            <SelectContent className="bg-card border border-border rounded-sm text-xs uppercase font-display font-bold">
              <SelectItem value="newest" className="cursor-pointer">Sequence: Generation</SelectItem>
              <SelectItem value="prize" className="cursor-pointer">Sequence: Yield Value</SelectItem>
              <SelectItem value="players" className="cursor-pointer">Sequence: Core Load</SelectItem>
              <SelectItem value="name" className="cursor-pointer">Sequence: Alpha</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tournaments Data Deck */}
      <div className="overflow-x-auto rounded-sm border border-border/80 bg-card/20">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-background/50 font-display text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
              <th className="py-3 px-4">Operation Identifier</th>
              <th className="py-3 px-4">Class</th>
              <th className="py-3 px-4 text-center">Core Load</th>
              <th className="py-3 px-4">Matrix Allocation</th>
              <th className="py-3 px-4">Status Phase</th>
              <th className="py-3 px-4 text-right">Operational Directives</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40 text-xs font-semibold">
            {sortedTournaments.map((tournament) => (
              <tr
                key={tournament.id}
                className="hover:bg-primary/5 transition-colors duration-150 group"
              >
                <td className="py-3 px-4 text-white font-display text-sm tracking-wide group-hover:text-primary transition-colors">
                  {tournament.name}
                </td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 bg-primary/5 border border-primary/20 text-accent font-mono text-[10px] uppercase rounded-sm">
                    {tournament.type}
                  </span>
                </td>
                <td className="py-3 px-4 text-center font-display text-sm font-bold text-white">
                  {tournament.players} <span className="text-[10px] text-muted-foreground font-sans font-normal">MAX</span>
                </td>
                <td className="py-3 px-4 font-display text-sm font-bold text-accent">
                  ₹{tournament.prizePool.toLocaleString()}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 border text-[10px] font-black font-display tracking-widest uppercase rounded-sm ${
                      tournament.status === "active"
                        ? "bg-success/5 border-success/20 text-success"
                        : tournament.status === "upcoming"
                          ? "bg-info/5 border-info/20 text-info"
                          : tournament.status === "completed"
                            ? "bg-muted-foreground/5 border-muted-foreground/20 text-muted-foreground"
                            : "bg-destructive/5 border-destructive/20 text-accent"
                    }`}
                  >
                    <span className={`w-1 h-1 rounded-full ${
                      tournament.status === "active" 
                        ? "bg-success" 
                        : tournament.status === "upcoming" 
                          ? "bg-info" 
                          : tournament.status === "completed"
                            ? "bg-muted-foreground"
                            : "bg-accent"
                    }`} />
                    {tournament.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-2 justify-end">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-7 border-border text-muted-foreground hover:text-white hover:bg-card text-[10px] uppercase font-display tracking-wider rounded-sm cursor-pointer flex items-center gap-1"
                    >
                      <Settings className="h-3 w-3" />
                      Configure
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
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

      {/* Empty State Manifest Block */}
      {sortedTournaments.length === 0 && (
        <div className="text-center py-16 bg-card/20 border border-border rounded-sm">
          <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
            📡 Zero operation sequences matching current parameter vectors
          </p>
          <p className="text-xs text-muted-foreground/60 uppercase tracking-wider mt-1">
            Alter target tracking parameters or pipeline filter states to update mapping index
          </p>
        </div>
      )}
    </div>
  )
}