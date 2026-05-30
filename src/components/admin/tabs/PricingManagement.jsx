"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ShieldAlert, Cpu, CircleDollarSign, Coins, TrendingUp } from "lucide-react"

export function PricingManagementTab() {
  const [prices, setPrices] = useState({
    tournament1: { name: "Beginner Tournament", entryFee: 10, prizePool: 500, teamSize: 4 },
    tournament2: { name: "Pro Tournament", entryFee: 50, prizePool: 5000, teamSize: 5 },
    tournament3: { name: "Elite Championship", entryFee: 100, prizePool: 20000, teamSize: 5 },
  })

  const handlePriceChange = (key, field, value) => {
    setPrices({
      ...prices,
      [key]: { ...prices[key], [field]: Number(value) },
    })
  }

  return (
    <div className="space-y-6 font-sans text-foreground">
      
      {/* Sector Control Header */}
      <div className="flex justify-between items-center border-b border-border pb-4">
        <div>
          <h3 className="text-xl font-bold font-display tracking-wider text-primary flex items-center gap-2 uppercase">
            <ShieldAlert className="h-5 w-5 text-primary shrink-0" />
            Pricing Profile Matrix
          </h3>
          <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-widest mt-1">
            Financial variables // Entry configuration and distributed pool metrics
          </p>
        </div>
      </div>

      {/* Pricing Configuration Cards Grid */}
      <div className="grid md:grid-cols-3 gap-4">
        {Object.entries(prices).map(([key, tournament]) => (
          <Card
            key={key}
            className="p-5 border-border/80 bg-card/30 rounded-sm hover:border-primary/30 hover:shadow-[0_4px_20px_rgba(255,107,0,0.02)] group transition-all duration-150 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="pb-3 border-b border-border/40">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-accent/5 border border-accent/20 text-accent font-mono text-[9px] uppercase rounded-sm mb-1.5">
                  Tier // {key}
                </span>
                <h4 className="font-display font-bold text-base text-white group-hover:text-primary transition-colors tracking-wide uppercase">
                  {tournament.name}
                </h4>
              </div>

              <div>
                <Label className="text-[10px] font-display font-bold tracking-widest text-muted-foreground uppercase mb-1.5 block">
                  Entry Ticket Allocation (₹)
                </Label>
                <Input
                  type="number"
                  value={tournament.entryFee}
                  onChange={(e) => handlePriceChange(key, "entryFee", e.target.value)}
                  className="bg-background border border-border rounded-sm text-foreground placeholder-muted-foreground text-sm font-semibold tracking-wide focus-visible:ring-primary/50 focus-visible:border-primary/50 h-9"
                />
              </div>

              <div>
                <Label className="text-[10px] font-display font-bold tracking-widest text-muted-foreground uppercase mb-1.5 block">
                  Distributed Prize Yield (₹)
                </Label>
                <Input
                  type="number"
                  value={tournament.prizePool}
                  onChange={(e) => handlePriceChange(key, "prizePool", e.target.value)}
                  className="bg-background border border-border rounded-sm text-foreground placeholder-muted-foreground text-sm font-semibold tracking-wide focus-visible:ring-primary/50 focus-visible:border-primary/50 h-9"
                />
              </div>

              <div>
                <Label className="text-[10px] font-display font-bold tracking-widest text-muted-foreground uppercase mb-1.5 block">
                  Maximum Unit Capacity
                </Label>
                <Input
                  type="number"
                  value={tournament.teamSize}
                  onChange={(e) => handlePriceChange(key, "teamSize", e.target.value)}
                  className="bg-background border border-border rounded-sm text-foreground placeholder-muted-foreground text-sm font-semibold tracking-wide focus-visible:ring-primary/50 focus-visible:border-primary/50 h-9"
                />
              </div>

              <div className="pt-3 border-t border-border/40">
                <div className="flex justify-between items-baseline">
                  <span className="text-[10px] font-display font-bold tracking-wider text-muted-foreground uppercase">
                    Calculated Operational Ceiling:
                  </span>
                  <span className="font-display font-black text-accent text-base tracking-wide">
                    ₹{(tournament.entryFee * 100).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <Button className="w-full mt-4 h-8 bg-primary/5 border border-primary/20 hover:border-primary text-primary hover:text-white hover:bg-primary/10 font-display font-bold text-xs uppercase tracking-wider rounded-sm transition-all duration-150 cursor-pointer">
              Commit Parameters
            </Button>
          </Card>
        ))}
      </div>

      {/* Aggregate Telemetry Dashboard */}
      <Card className="p-4 border border-border/80 bg-card/20 rounded-sm">
        <div className="mb-3 border-b border-border/40 pb-2 flex items-center justify-between">
          <span className="text-[10px] font-display font-bold tracking-widest text-muted-foreground uppercase flex items-center gap-1">
            <Cpu className="h-3 w-3" />
            Global Financial Telemetry Summary
          </span>
        </div>
        
        <div className="grid md:grid-cols-3 gap-4 py-2">
          <div className="text-center md:text-left border-b md:border-b-0 md:border-r border-border/40 pb-4 md:pb-0 md:pr-4">
            <p className="text-muted-foreground text-[10px] font-display font-bold tracking-widest uppercase mb-1 flex items-center justify-center md:justify-start gap-1">
              <Coins className="h-3 w-3 text-accent" /> Cumulative Buy-In Vectors
            </p>
            <p className="text-2xl font-black font-display text-accent tracking-wide">
              ₹{Object.values(prices).reduce((sum, t) => sum + Number(t.entryFee), 0).toLocaleString()}
            </p>
          </div>
          
          <div className="text-center md:text-left border-b md:border-b-0 md:border-r border-border/40 pb-4 md:pb-0 md:px-4">
            <p className="text-muted-foreground text-[10px] font-display font-bold tracking-widest uppercase mb-1 flex items-center justify-center md:justify-start gap-1">
              <CircleDollarSign className="h-3 w-3 text-primary" /> Aggregated Yield Matrix
            </p>
            <p className="text-2xl font-black font-display text-primary tracking-wide">
              ₹{Object.values(prices).reduce((sum, t) => sum + Number(t.prizePool), 0).toLocaleString()}
            </p>
          </div>
          
          <div className="text-center md:text-left md:pl-4">
            <p className="text-muted-foreground text-[10px] font-display font-bold tracking-widest uppercase mb-1 flex items-center justify-center md:justify-start gap-1">
              <TrendingUp className="h-3 w-3 text-white" /> Instantiated Nodes
            </p>
            <p className="text-2xl font-black font-display text-white tracking-wide">
              {Object.keys(prices).length} <span className="text-xs text-muted-foreground font-sans font-normal">ACTIVE</span>
            </p>
          </div>
        </div>
      </Card>

    </div>
  )
}