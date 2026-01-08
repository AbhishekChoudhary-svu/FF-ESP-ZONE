"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { TournamentFilters } from "@/components/ui/tournament-filters"
import { TournamentCard } from "@/components/dashboard/TournamentCard"

export function PaidTournamentsTab({ onCreateClick }) {
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
  ])
  const [filtered, setFiltered] = useState(tournaments)

  const handleFilterChange = (filters) => {
    let result = tournaments

    if (filters.searchQuery) {
      result = result.filter((t) => t.name.toLowerCase().includes(filters.searchQuery.toLowerCase()))
    }

    if (filters.gameMode !== "all") {
      result = result.filter((t) => t.type.toLowerCase() === filters.gameMode.toLowerCase())
    }

    if (filters.teamMode !== "all") {
      result = result.filter((t) => t.mode.toLowerCase() === filters.teamMode.toLowerCase())
    }

    setFiltered(result)
  }

  const handleSortChange = (sortBy) => {
    const sorted = [...filtered]

    switch (sortBy) {
      case "newest":
        sorted.sort((a, b) => a.startDate - b.startDate)
        break
      case "popular":
        sorted.sort((a, b) => b.players - a.players)
        break
      case "prize":
        sorted.sort((a, b) => b.prizePool - a.prizePool)
        break
      case "startTime":
        sorted.sort((a, b) => a.startDate - b.startDate)
        break
      default:
        break
    }

    setFiltered(sorted)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold">Paid Tournaments</h3>
        <Button onClick={onCreateClick} className="bg-gradient-to-r from-primary to-accent">
          + Create Tournament
        </Button>
      </div>

      <TournamentFilters onFilterChange={handleFilterChange} onSortChange={handleSortChange} />

      {filtered.length > 0 ? (
        <div className="grid gap-4">
          {filtered.map((tournament) => (
            <TournamentCard key={tournament.id} tournament={tournament} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-foreground/60">No tournaments found</p>
        </div>
      )}
    </div>
  )
}
