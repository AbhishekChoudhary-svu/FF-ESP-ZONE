"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

export function CreateTournamentForm({ onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    gameMode: "BR",
    teamMode: "Solo",
    totalPlayers: 64,
    entryFee: 0,
    prizePool: 0,
    startDate: "",
    endDate: "",
    rules: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name.includes("Fee") || name.includes("Pool") || name.includes("Players") ? Number(value) : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/tournaments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to create tournament")
      }

      onClose?.()
      window.location.reload()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-6 border-border max-h-[80vh] overflow-y-auto">
      <h2 className="text-2xl font-bold mb-6">Create Tournament</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Tournament Name</label>
          <Input
            name="name"
            placeholder="e.g., Elite Squad Championship"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            name="description"
            placeholder="Tournament description"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground"
            rows="3"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Game Mode</label>
            <select
              name="gameMode"
              value={formData.gameMode}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground"
            >
              <option>BR</option>
              <option>CS</option>
              <option>Mixed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Team Mode</label>
            <select
              name="teamMode"
              value={formData.teamMode}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground"
            >
              <option>Solo</option>
              <option>Duo</option>
              <option>Squad</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Total Players</label>
            <Input type="number" name="totalPlayers" value={formData.totalPlayers} onChange={handleChange} required />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Entry Fee ($)</label>
            <Input type="number" name="entryFee" value={formData.entryFee} onChange={handleChange} step="0.01" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Prize Pool ($)</label>
          <Input
            type="number"
            name="prizePool"
            value={formData.prizePool}
            onChange={handleChange}
            step="0.01"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Start Date</label>
            <Input type="datetime-local" name="startDate" value={formData.startDate} onChange={handleChange} required />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">End Date</label>
            <Input type="datetime-local" name="endDate" value={formData.endDate} onChange={handleChange} required />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Rules</label>
          <textarea
            name="rules"
            placeholder="Tournament rules"
            value={formData.rules}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground"
            rows="3"
          />
        </div>

        {error && <div className="text-red-500 text-sm">{error}</div>}

        <div className="flex gap-3">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? "Creating..." : "Create Tournament"}
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  )
}
