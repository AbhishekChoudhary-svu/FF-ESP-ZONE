"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield, ShieldAlert, User, Search, Filter, ArrowUpDown } from "lucide-react"

export function UserManagementTab() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [sortBy, setSortBy] = useState("newest")

  // Mock user data
  const users = [
    { id: 1001, name: "Alex Gamer", email: "alex@email.com", status: "active", joined: "2024-01-15", tournaments: 5 },
    { id: 1002, name: "Pro Player", email: "pro@email.com", status: "active", joined: "2024-01-20", tournaments: 12 },
    { id: 1003, name: "Rookie User", email: "rookie@email.com", status: "active", joined: "2024-02-01", tournaments: 2 },
    { id: 1004, name: "Banned User", email: "banned@email.com", status: "banned", joined: "2023-12-01", tournaments: 0 },
    { id: 1005, name: "Inactive Pro", email: "inactive@email.com", status: "inactive", joined: "2024-01-10", tournaments: 8 },
  ]

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === "all" || user.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (sortBy === "newest") return new Date(b.joined).getTime() - new Date(a.joined).getTime()
    if (sortBy === "tournaments") return b.tournaments - a.tournaments
    return a.name.localeCompare(b.name)
  })

  return (
    <div className="space-y-6 font-sans text-foreground">
      
      {/* Control Header Row */}
      <div className="flex justify-between items-center border-b border-border pb-4">
        <div>
          <h3 className="text-xl font-bold font-display tracking-wider text-primary flex items-center gap-2 uppercase">
            <Shield className="h-5 w-5 text-primary shrink-0" />
            Identity Directory
          </h3>
          <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-widest mt-1">
            Real-time verification indices // platform node registry
          </p>
        </div>
        
        <span className="px-2.5 py-0.5 bg-primary/10 border border-primary/20 text-accent font-display text-[10px] font-black tracking-widest uppercase rounded-sm">
          {sortedUsers.length} Nodes Loaded
        </span>
      </div>

      {/* Embedded Filtering System Deck */}
      <div className="grid md:grid-cols-3 gap-3 bg-card/40 p-3 border border-border/80 rounded-sm">
        <div className="relative flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground/60 pointer-events-none" />
          <Input
            placeholder="Search network moniker or hash..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-sm text-foreground placeholder-muted-foreground text-sm font-semibold tracking-wide focus-visible:ring-primary/50 focus-visible:border-primary/50 h-9"
          />
        </div>

        <div className="relative flex items-center">
          <Filter className="absolute left-3 h-3.5 w-3.5 text-muted-foreground/60 pointer-events-none z-10" />
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="bg-background border border-border rounded-sm text-xs font-bold uppercase tracking-wider text-muted-foreground h-9 pl-9 cursor-pointer focus:ring-0 focus:ring-offset-0">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent className="bg-card border border-border rounded-sm text-xs uppercase font-display font-bold">
              <SelectItem value="all" className="cursor-pointer">All Statuses</SelectItem>
              <SelectItem value="active" className="cursor-pointer">Active Node</SelectItem>
              <SelectItem value="inactive" className="cursor-pointer">Dormant Node</SelectItem>
              <SelectItem value="banned" className="cursor-pointer">Blacklisted</SelectItem>
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
              <SelectItem value="newest" className="cursor-pointer">Sequence: Newest</SelectItem>
              <SelectItem value="tournaments" className="cursor-pointer">Sequence: Most Active</SelectItem>
              <SelectItem value="name" className="cursor-pointer">Sequence: Alpha</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Users Matrix Deck */}
      <div className="overflow-x-auto rounded-sm border border-border/80 bg-card/20">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-background/50 font-display text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
              <th className="py-3 px-4">Registry ID</th>
              <th className="py-3 px-4">Operator Moniker</th>
              <th className="py-3 px-4">Network Route</th>
              <th className="py-3 px-4">Status Class</th>
              <th className="py-3 px-4 text-center">Engagement Load</th>
              <th className="py-3 px-4 text-right">Operational Directives</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40 text-xs font-semibold">
            {sortedUsers.map((user) => (
              <tr 
                key={user.id} 
                className="hover:bg-primary/5 transition-colors duration-150 group"
              >
                <td className="py-3 px-4 font-mono text-accent">
                  #{user.id}
                </td>
                <td className="py-3 px-4 text-white font-display text-sm tracking-wide group-hover:text-primary transition-colors">
                  {user.name}
                </td>
                <td className="py-3 px-4 text-muted-foreground font-mono">
                  {user.email}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 border text-[10px] font-black font-display tracking-widest uppercase rounded-sm ${
                      user.status === "active"
                        ? "bg-success/5 border-success/20 text-success"
                        : user.status === "banned"
                          ? "bg-destructive/5 border-destructive/20 text-destructive"
                          : "bg-secondary/5 border-secondary/20 text-accent"
                    }`}
                  >
                    <span className={`w-1 h-1 rounded-full ${
                      user.status === "active" ? "bg-success" : user.status === "banned" ? "bg-destructive" : "bg-accent"
                    }`} />
                    {user.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-center font-display text-sm font-bold text-white">
                  {user.tournaments} <span className="text-[10px] text-muted-foreground font-sans font-normal">MTCH</span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-2 justify-end">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-7 border-border text-muted-foreground hover:text-white hover:bg-card text-[10px] uppercase font-display tracking-wider rounded-sm cursor-pointer"
                    >
                      Inspect
                    </Button>
                    {user.status !== "banned" && (
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        className="h-7 bg-destructive/10 border border-destructive/30 text-destructive hover:bg-destructive hover:text-white text-[10px] uppercase font-display tracking-wider rounded-sm cursor-pointer transition-all duration-150"
                      >
                        <ShieldAlert className="h-3 w-3 mr-1" />
                        Blacklist
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State Vector Block */}
      {sortedUsers.length === 0 && (
        <div className="text-center py-16 bg-card/20 border border-border rounded-sm">
          <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
            📡 Zero matching identities found inside current parameter indices
          </p>
          <p className="text-xs text-muted-foreground/60 uppercase tracking-wider mt-1">
            Alter tracking strings or status toggle switches to rebuild directory mapping
          </p>
        </div>
      )}
    </div>
  )
}