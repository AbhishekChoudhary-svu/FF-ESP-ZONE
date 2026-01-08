"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"

export function TournamentFilters({ onFilterChange, onSortChange }) {
  const [filters, setFilters] = useState({
    searchQuery: "",
    gameMode: "all",
    teamMode: "all",
    priceRange: "all",
  })
  const [sortBy, setSortBy] = useState("newest")

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    const newFilters = { ...filters, [name]: value }
    setFilters(newFilters)
    onFilterChange?.(newFilters)
  }

  const handleSortChange = (e) => {
    setSortBy(e.target.value)
    onSortChange?.(e.target.value)
  }

  return (
    <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-6 space-y-4">
      <h3 className="text-lg font-semibold mb-4">Filters & Sort</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Search</label>
          <Input
            name="searchQuery"
            placeholder="Tournament name..."
            value={filters.searchQuery}
            onChange={handleFilterChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Game Mode</label>
          <select
            name="gameMode"
            value={filters.gameMode}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground"
          >
            <option value="all">All Modes</option>
            <option value="BR">BR</option>
            <option value="CS">CS</option>
            <option value="mixed">Mixed</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Team Mode</label>
          <select
            name="teamMode"
            value={filters.teamMode}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground"
          >
            <option value="all">All Teams</option>
            <option value="solo">Solo</option>
            <option value="duo">Duo</option>
            <option value="squad">Squad</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Price</label>
          <select
            name="priceRange"
            value={filters.priceRange}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground"
          >
            <option value="all">All Prices</option>
            <option value="free">Free</option>
            <option value="paid">Paid</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Sort By</label>
          <select
            value={sortBy}
            onChange={handleSortChange}
            className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground"
          >
            <option value="newest">Newest</option>
            <option value="popular">Most Popular</option>
            <option value="prize">Highest Prize</option>
            <option value="startTime">Starting Soon</option>
          </select>
        </div>
      </div>
    </div>
  )
}
