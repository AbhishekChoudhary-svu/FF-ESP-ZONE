"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold">Chat Moderation</h3>
        <span className="px-3 py-1 bg-red-900/30 text-red-400 rounded-full text-sm font-semibold">
          {filteredMessages.length} Flagged
        </span>
      </div>

      {/* Filters */}
      <div className="grid md:grid-cols-2 gap-4 p-4 bg-card/50 rounded-lg border border-border/50">
        <Input
          placeholder="Search by user or reason..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-background/50"
        />
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="bg-background/50">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Messages</SelectItem>
            <SelectItem value="flagged">Flagged</SelectItem>
            <SelectItem value="reviewed">Reviewed</SelectItem>
            <SelectItem value="removed">Removed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Flagged Messages Cards */}
      <div className="space-y-4">
        {filteredMessages.map((msg) => (
          <Card
            key={msg.id}
            className="p-4 border-border/50 bg-card/50 hover:bg-card/70 transition-colors duration-200"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-lg">{msg.user}</p>
                  <p className="text-xs text-muted-foreground">
                    Flagged for: <span className="text-orange-400 font-semibold">{msg.reason}</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      msg.severity === "high"
                        ? "bg-red-900/30 text-red-400"
                        : msg.severity === "medium"
                          ? "bg-orange-900/30 text-orange-400"
                          : "bg-yellow-900/30 text-yellow-400"
                    }`}
                  >
                    {msg.severity.toUpperCase()}
                  </span>
                  <span className="px-2 py-1 bg-red-900/20 text-red-400 rounded text-xs font-semibold">FLAGGED</span>
                </div>
              </div>

              <div className="bg-background/50 p-3 rounded border border-border/50">
                <p className="text-sm text-foreground/90 italic">"{msg.content}"</p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  Approve
                </Button>
                <Button size="sm" variant="destructive">
                  Remove & Warn User
                </Button>
                <Button size="sm" variant="outline">
                  Review Later
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredMessages.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No flagged messages in this view</p>
        </div>
      )}
    </div>
  )
}
