"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function PricingManagementTab() {
  const [prices, setPrices] = useState({
    tournament1: { name: "Beginner Tournament", entryFee: 10, prizePool: 500, teamSize: 4 },
    tournament2: { name: "Pro Tournament", entryFee: 50, prizePool: 5000, teamSize: 5 },
    tournament3: { name: "Elite Championship", entryFee: 100, prizePool: 20000, teamSize: 5 },
  })

  const handlePriceChange = (key, field, value) => {
    setPrices({
      ...prices,
      [key]: { ...prices[key], [field]: value },
    })
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h3 className="text-2xl font-bold mb-2">Pricing Management</h3>
        <p className="text-muted-foreground">Configure tournament entry fees and prize pools</p>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {Object.entries(prices).map(([key, tournament]) => (
          <Card
            key={key}
            className="p-6 border-border/50 bg-gradient-to-br from-card/50 to-card/30 hover:shadow-lg transition-all duration-300"
          >
            <div className="space-y-4">
              <div className="pb-4 border-b border-border/50">
                <h4 className="font-bold text-lg text-white">{tournament.name}</h4>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground mb-2 block">Entry Fee ($)</Label>
                <Input
                  type="number"
                  value={tournament.entryFee}
                  onChange={(e) => handlePriceChange(key, "entryFee", e.target.value)}
                  className="bg-background/50 border-border/50"
                />
              </div>

              <div>
                <Label className="text-sm text-muted-foreground mb-2 block">Prize Pool ($)</Label>
                <Input
                  type="number"
                  value={tournament.prizePool}
                  onChange={(e) => handlePriceChange(key, "prizePool", e.target.value)}
                  className="bg-background/50 border-border/50"
                />
              </div>

              <div>
                <Label className="text-sm text-muted-foreground mb-2 block">Team Size</Label>
                <Input
                  type="number"
                  value={tournament.teamSize}
                  onChange={(e) => handlePriceChange(key, "teamSize", e.target.value)}
                  className="bg-background/50 border-border/50"
                />
              </div>

              <div className="pt-4 mt-4 border-t border-border/50">
                <p className="text-sm mb-3">
                  <span className="text-muted-foreground">Total Potential Revenue: </span>
                  <span className="font-bold text-accent text-lg">${(tournament.entryFee * 100).toLocaleString()}</span>
                </p>
              </div>

              <Button className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90">Save Changes</Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Summary Stats */}
      <Card className="p-6 border-border/50 bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-muted-foreground text-sm mb-1">Total Entry Fees</p>
            <p className="text-2xl font-bold text-accent">
              ${Object.values(prices).reduce((sum, t) => sum + Number(t.entryFee), 0)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground text-sm mb-1">Total Prize Pool</p>
            <p className="text-2xl font-bold text-primary">
              $
              {Object.values(prices)
                .reduce((sum, t) => sum + Number(t.prizePool), 0)
                .toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground text-sm mb-1">Active Tournaments</p>
            <p className="text-2xl font-bold text-secondary">{Object.keys(prices).length}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
