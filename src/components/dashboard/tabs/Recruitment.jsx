"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export function PlayerRecruitmentTab() {
  const [players] = useState([
    { id: 1, username: "ProPlayer1", rank: "Professional", playstyle: "Aggressive", wins: 45, avgKill: 8.5 },
    { id: 2, username: "EliteSniper", rank: "Advanced", playstyle: "Sniper", wins: 32, avgKill: 6.2 },
    { id: 3, username: "DuoMaster", rank: "Advanced", playstyle: "Balanced", wins: 28, avgKill: 5.8 },
  ])
  const [searchTerm, setSearchTerm] = useState("")

  const filtered = players.filter(
    (p) =>
      p.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.rank.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold">Find Players</h3>
      </div>

      <Input
        placeholder="Search by username or rank..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4"
      />

      <div className="grid gap-4">
        {filtered.map((player) => (
          <Card key={player.id} className="p-6 hover:border-primary/50 transition-all">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-lg font-bold mb-2">{player.username}</h4>
                <div className="flex gap-4 text-sm text-foreground/70">
                  <span className="bg-primary/20 px-3 py-1 rounded-full">{player.rank}</span>
                  <span className="bg-accent/20 px-3 py-1 rounded-full">{player.playstyle}</span>
                </div>
              </div>
              <div className="text-right space-y-1 mr-4">
                <p className="text-sm text-foreground/60">
                  Wins: <span className="font-bold text-foreground">{player.wins}</span>
                </p>
                <p className="text-sm text-foreground/60">
                  Avg Kill: <span className="font-bold text-foreground">{player.avgKill}</span>
                </p>
              </div>
              <Button className="bg-gradient-to-r from-primary to-accent">Send Invite</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
