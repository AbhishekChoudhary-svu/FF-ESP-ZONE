"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
    if (sortBy === "newest") return new Date(b.created) - new Date(a.created)
    if (sortBy === "prize") return b.prizePool - a.prizePool
    if (sortBy === "players") return b.players - a.players
    return a.name.localeCompare(b.name)
  })

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold">Tournament Management</h3>
        <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90">+ Create Tournament</Button>
      </div>

      {/* Filters and Search */}
      <div className="grid md:grid-cols-3 gap-4 p-4 bg-card/50 rounded-lg border border-border/50">
        <Input
          placeholder="Search tournaments..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-background/50"
        />
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="bg-background/50">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="bg-background/50">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="prize">Highest Prize</SelectItem>
            <SelectItem value="players">Most Players</SelectItem>
            <SelectItem value="name">Name (A-Z)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tournaments Table */}
      <div className="overflow-x-auto rounded-lg border border-border/50">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 bg-secondary/10">
              <th className="text-left py-3 px-4 font-semibold">Tournament Name</th>
              <th className="text-left py-3 px-4 font-semibold">Type</th>
              <th className="text-left py-3 px-4 font-semibold">Players</th>
              <th className="text-left py-3 px-4 font-semibold">Prize Pool</th>
              <th className="text-left py-3 px-4 font-semibold">Status</th>
              <th className="text-left py-3 px-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedTournaments.map((tournament) => (
              <tr
                key={tournament.id}
                className="border-b border-border/50 hover:bg-secondary/5 transition-colors duration-200"
              >
                <td className="py-3 px-4 font-medium">{tournament.name}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 bg-accent/20 text-accent rounded text-xs font-semibold">
                    {tournament.type}
                  </span>
                </td>
                <td className="py-3 px-4 font-semibold">{tournament.players}</td>
                <td className="py-3 px-4 text-accent font-bold">${tournament.prizePool.toLocaleString()}</td>
                <td className="py-3 px-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      tournament.status === "active"
                        ? "bg-blue-900/30 text-blue-400"
                        : tournament.status === "upcoming"
                          ? "bg-purple-900/30 text-purple-400"
                          : tournament.status === "completed"
                            ? "bg-green-900/30 text-green-400"
                            : "bg-orange-900/30 text-orange-400"
                    }`}
                  >
                    {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
                  </span>
                </td>
                <td className="py-3 px-4 flex gap-2">
                  <Button size="sm" variant="outline" className="hover:bg-primary/20 bg-transparent">
                    Edit
                  </Button>
                  <Button size="sm" variant="destructive" className="hover:bg-destructive/80">
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sortedTournaments.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No tournaments found matching your filters</p>
        </div>
      )}
    </div>
  )
}
