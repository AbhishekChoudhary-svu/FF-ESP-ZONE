"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export function TournamentCard({ tournament }) {
  return (
    <Card className="p-6 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 border-border/50">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="text-xl font-bold mb-2">{tournament.name}</h4>
          <div className="flex gap-4 text-sm text-foreground/70">
            <span className="bg-primary/20 px-3 py-1 rounded-full">{tournament.type}</span>
            <span className="bg-accent/20 px-3 py-1 rounded-full">{tournament.mode}</span>
            {tournament.entryFee && (
              <span className="bg-orange-500/20 px-3 py-1 rounded-full">${tournament.entryFee}</span>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-accent">
            {typeof tournament.prizePool === "number"
              ? `$${tournament.prizePool.toLocaleString()}`
              : tournament.prizePool}
          </p>
          <p className="text-xs text-foreground/60">Prize Pool</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 py-4 border-y border-border/30">
        <div>
          <p className="text-sm text-foreground/60">Players</p>
          <p className="text-lg font-semibold">{tournament.players}</p>
        </div>
        <div>
          <p className="text-sm text-foreground/60">Starting</p>
          <p className="text-lg font-semibold">
            {tournament.startDate ? new Date(tournament.startDate).toLocaleDateString() : "TBA"}
          </p>
        </div>
        <div>
          <p className="text-sm text-foreground/60">Status</p>
          <p className="text-lg font-semibold text-green-500">Open</p>
        </div>
      </div>

      <div className="flex gap-3 mt-4">
        <Button className="flex-1 bg-gradient-to-r from-primary to-accent">Join Tournament</Button>
        <Button variant="outline">View Details</Button>
      </div>
    </Card>
  )
}
