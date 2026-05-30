"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageSquare, ShieldAlert, Search, Filter, Check, Trash2, Clock } from "lucide-react"

export function ChatModerationTab() {
  const [filterStatus, setFilterStatus] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  // Mock flagged messages
  const messages = [
    {
      id: 1,
      user: "Player123",
      content: "This is offensive language...",
      reason: "Inappropriate",
      status: "flagged",
      severity: "high",
    },
    {
      id: 2,
      user: "ProGamer",
      content: "Spam message repeated",
      reason: "Spam",
      status: "flagged",
      severity: "medium",
    },
    {
      id: 3,
      user: "Newbie",
      content: "Can someone help me?",
      reason: "Incorrectly flagged",
      status: "flagged",
      severity: "low",
    },
  ]

  const filteredMessages = messages.filter((msg) => {
    const matchesSearch =
      msg.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.reason.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === "all" || msg.status === filterStatus
    return matchesSearch && matchesFilter
  })

  return (
    <div className="space-y-6 font-sans text-foreground">
      
      {/* Sector Control Header */}
      <div className="flex justify-between items-center border-b border-border pb-4">
        <div>
          <h3 className="text-xl font-bold font-display tracking-wider text-primary flex items-center gap-2 uppercase">
            <MessageSquare className="h-5 w-5 text-primary shrink-0" />
            Comms Moderation Queue
          </h3>
          <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-widest mt-1">
            Intercepted telemetry streams // anomaly enforcement protocols
          </p>
        </div>
        
        <span className="px-2.5 py-0.5 bg-destructive/10 border border-destructive/20 text-destructive font-display text-[10px] font-black tracking-widest uppercase rounded-sm animate-pulse">
          {filteredMessages.length} Threats Flagged
        </span>
      </div>

      {/* Embedded Filtering System Deck */}
      <div className="grid md:grid-cols-2 gap-3 bg-card/40 p-3 border border-border/80 rounded-sm">
        <div className="relative flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground/60 pointer-events-none" />
          <Input
            placeholder="Query violator moniker or infraction key..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-sm text-foreground placeholder-muted-foreground text-sm font-semibold tracking-wide focus-visible:ring-primary/50 focus-visible:border-primary/50 h-9"
          />
        </div>

        <div className="relative flex items-center">
          <Filter className="absolute left-3 h-3.5 w-3.5 text-muted-foreground/60 pointer-events-none z-10" />
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="bg-background border border-border rounded-sm text-xs font-bold uppercase tracking-wider text-muted-foreground h-9 pl-9 cursor-pointer focus:ring-0 focus:ring-offset-0">
              <SelectValue placeholder="Filter Operational State" />
            </SelectTrigger>
            <SelectContent className="bg-card border border-border rounded-sm text-xs uppercase font-display font-bold">
              <SelectItem value="all" className="cursor-pointer">All Intercepts</SelectItem>
              <SelectItem value="flagged" className="cursor-pointer">Awaiting Review</SelectItem>
              <SelectItem value="reviewed" className="cursor-pointer">Cleared Safe</SelectItem>
              <SelectItem value="removed" className="cursor-pointer">Purged Matrix</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Flagged Telemetry Stream List */}
      <div className="space-y-3">
        {filteredMessages.map((msg) => (
          <Card
            key={msg.id}
            className="p-4 border-border/80 bg-card/30 rounded-sm hover:border-primary/20 transition-all duration-150 group"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-display font-bold text-sm text-white group-hover:text-primary transition-colors tracking-wide uppercase">
                    {msg.user}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest mt-0.5">
                    Trigger Vector: <span className="text-accent font-black">{msg.reason}</span>
                  </p>
                </div>
                
                <div className="flex gap-2 items-center">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 border text-[9px] font-black font-display tracking-widest uppercase rounded-sm ${
                      msg.severity === "high"
                        ? "bg-destructive/5 border-destructive/20 text-destructive"
                        : msg.severity === "medium"
                          ? "bg-secondary/5 border-secondary/20 text-accent"
                          : "bg-info/5 border-info/20 text-info"
                    }`}
                  >
                    Threat: {msg.severity}
                  </span>
                  <span className="px-2 py-0.5 bg-destructive/10 border border-destructive/20 text-destructive font-mono text-[9px] font-black tracking-widest uppercase rounded-sm">
                    Flagged
                  </span>
                </div>
              </div>

              {/* Intercepted Content Block */}
              <div className="bg-background/80 p-3 border border-border/50 rounded-sm font-mono text-xs text-foreground/90 relative">
                <span className="absolute right-2 top-1 text-[8px] text-muted-foreground/40 uppercase tracking-widest select-none">
                  Raw Feed
                </span>
                <p className="italic">"{msg.content}"</p>
              </div>

              {/* Tactical Enforcement Directives */}
              <div className="flex gap-2 pt-1">
                <Button 
                  size="sm" 
                  className="h-7 bg-success/10 border border-success/30 text-success hover:bg-success hover:text-white text-[10px] uppercase font-display tracking-wider rounded-sm cursor-pointer transition-all duration-150 flex items-center gap-1"
                >
                  <Check className="h-3 w-3" />
                  Dismiss / Clear
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive" 
                  className="h-7 bg-destructive/10 border border-destructive/30 text-destructive hover:bg-destructive hover:text-white text-[10px] uppercase font-display tracking-wider rounded-sm cursor-pointer transition-all duration-150 flex items-center gap-1"
                >
                  <ShieldAlert className="h-3 w-3" />
                  Purge & Warn
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-7 border-border text-muted-foreground hover:text-white hover:bg-card text-[10px] uppercase font-display tracking-wider rounded-sm cursor-pointer flex items-center gap-1"
                >
                  <Clock className="h-3 w-3" />
                  Hold Sequence
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty Queue State Block */}
      {filteredMessages.length === 0 && (
        <div className="text-center py-16 bg-card/20 border border-border rounded-sm">
          <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
            📡 Comms channels absolute zero anomalies reported
          </p>
          <p className="text-xs text-muted-foreground/60 uppercase tracking-wider mt-1">
            No dynamic packets match current validation filters or search vectors
          </p>
        </div>
      )}
    </div>
  )
}