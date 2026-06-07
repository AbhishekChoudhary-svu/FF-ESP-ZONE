"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageSquare, ShieldAlert, Search, Filter, Check, Trash2, Clock, Loader2, Ban } from "lucide-react"
import toast from "react-hot-toast"

export default function ChatModeration() {
  const [messages,    setMessages]  = useState([])
  const [loading,     setLoading]   = useState(true)
  const [search,      setSearch]    = useState("")
  const [filterStatus,setFilter]    = useState("all")
  const [actionId,    setActionId]  = useState(null)

  const fetchMessages = async () => {
    setLoading(true)
    try {
      const res  = await fetch("/api/admin/chat")
      const data = await res.json()
      if (data.success) setMessages(data.messages)
    } catch { toast.error("Failed to load messages") }
    finally   { setLoading(false) }
  }

  useEffect(() => { fetchMessages() }, [])

  const handleDelete = async (id) => {
    setActionId(id)
    try {
      const res  = await fetch("/api/admin/chat", {
        method: "DELETE", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId: id }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || "Failed"); return }
      toast.success("Message purged")
      fetchMessages()
    } catch { toast.error("Something went wrong") }
    finally   { setActionId(null) }
  }

  const handleBanUser = async (uid) => {
    setActionId(uid)
    try {
      const res  = await fetch("/api/admin/users", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, action: "ban", banReason: "Banned via chat moderation" }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || "Failed"); return }
      toast.success("User blacklisted")
      fetchMessages()
    } catch { toast.error("Something went wrong") }
    finally   { setActionId(null) }
  }

  const filtered = messages.filter(m =>
    m.content?.toLowerCase().includes(search.toLowerCase()) ||
    m.sender?.username?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 font-sans text-foreground">

      {/* Header */}
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
          {filtered.length} Packets Queued
        </span>
      </div>

      {/* Filters */}
      <div className="grid md:grid-cols-2 gap-3 bg-card/40 p-3 border border-border/80 rounded-sm">
        <div className="relative flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground/60 pointer-events-none" />
          <Input
            placeholder="Query violator moniker or intercept key..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 bg-background border border-border rounded-sm text-foreground placeholder-muted-foreground text-sm font-semibold tracking-wide focus-visible:ring-primary/50 focus-visible:border-primary/50 h-9"
          />
        </div>
        <div className="relative flex items-center">
          <Filter className="absolute left-3 h-3.5 w-3.5 text-muted-foreground/60 pointer-events-none z-10" />
          <Select value={filterStatus} onValueChange={setFilter}>
            <SelectTrigger className="bg-background border border-border rounded-sm text-xs font-bold uppercase tracking-wider text-muted-foreground h-9 pl-9 cursor-pointer focus:ring-0">
              <SelectValue placeholder="Filter State" />
            </SelectTrigger>
            <SelectContent className="bg-card border border-border rounded-sm text-xs uppercase font-display font-bold">
              <SelectItem value="all">All Intercepts</SelectItem>
              <SelectItem value="flagged">Awaiting Review</SelectItem>
              <SelectItem value="reviewed">Cleared Safe</SelectItem>
              <SelectItem value="removed">Purged Matrix</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span className="ml-2 text-xs text-muted-foreground uppercase tracking-widest font-bold">Loading intercepts...</span>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(msg => (
            <Card key={msg._id} className="p-4 border-border/80 bg-card/30 rounded-sm hover:border-primary/20 transition-all duration-150 group">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-display font-bold text-sm text-white group-hover:text-primary transition-colors tracking-wide uppercase">
                      {msg.sender?.username ?? "Unknown"}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {msg.sender?.role && msg.sender.role !== "user" && (
                        <span className="text-[9px] font-black font-display tracking-widest uppercase px-1.5 py-0.5 rounded-sm bg-accent/10 border border-accent/20 text-accent">
                          {msg.sender.role}
                        </span>
                      )}
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(msg.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-destructive/10 border border-destructive/20 text-destructive font-mono text-[9px] font-black tracking-widest uppercase rounded-sm">
                    Flagged
                  </span>
                </div>

                {/* Intercepted content */}
                <div className="bg-background/80 p-3 border border-border/50 rounded-sm font-mono text-xs text-foreground/90 relative">
                  <span className="absolute right-2 top-1 text-[8px] text-muted-foreground/40 uppercase tracking-widest select-none">
                    Raw Feed
                  </span>
                  <p className="italic break-words">"{msg.content}"</p>
                  {msg.imageUrl && (
                    <img src={msg.imageUrl} alt="" className="mt-2 max-h-24 rounded-sm border border-border object-cover" />
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-1 flex-wrap">
                  <Button
                    size="sm"
                    onClick={() => handleDelete(msg._id)}
                    disabled={actionId === msg._id}
                    className="h-7 bg-destructive/10 border border-destructive/30 text-destructive hover:bg-destructive hover:text-white text-[10px] uppercase font-display tracking-wider rounded-sm cursor-pointer transition-all duration-150 flex items-center gap-1 disabled:opacity-50"
                  >
                    {actionId === msg._id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                    Purge Message
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleBanUser(msg.sender?.uid)}
                    disabled={actionId === msg.sender?.uid || !msg.sender?.uid}
                    className="h-7 bg-[#ff9a00]/10 border border-[#ff9a00]/30 text-[#ff9a00] hover:bg-[#ff9a00] hover:text-white text-[10px] uppercase font-display tracking-wider rounded-sm cursor-pointer transition-all duration-150 flex items-center gap-1 disabled:opacity-50"
                  >
                    <ShieldAlert className="h-3 w-3" />
                    Blacklist Node
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-16 bg-card/20 border border-border rounded-sm">
          <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
            📡 Comms channels reporting zero anomalies
          </p>
          <p className="text-xs text-muted-foreground/60 uppercase tracking-wider mt-1">
            No dynamic packets match current validation filters
          </p>
        </div>
      )}
    </div>
  )
}