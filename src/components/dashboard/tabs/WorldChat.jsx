"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

export function WorldChatTab() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      username: "ProPlayer1",
      message: "Who wants to team up?",
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
    },
    {
      id: 2,
      username: "EliteSniper",
      message: "Looking for squad mates",
      timestamp: new Date(Date.now() - 3 * 60 * 1000),
    },
    {
      id: 3,
      username: "DuoMaster",
      message: "Free tournament starts in 2 hours!",
      timestamp: new Date(Date.now() - 1 * 60 * 1000),
    },
  ])
  const [newMessage, setNewMessage] = useState("")
  const messagesEnd = useRef(null)

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const message = {
      id: messages.length + 1,
      username: "You",
      message: newMessage,
      timestamp: new Date(),
    }

    setMessages([...messages, message])
    setNewMessage("")
  }

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-bold">World Chat</h3>

      <Card className="h-96 overflow-y-auto p-4 border-border/50 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
              {msg.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">{msg.username}</p>
              <p className="text-sm text-foreground/70">{msg.message}</p>
              <p className="text-xs text-foreground/50 mt-1">{msg.timestamp.toLocaleTimeString()}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEnd} />
      </Card>

      <form onSubmit={handleSendMessage} className="flex gap-2">
        <Input placeholder="Type your message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
        <Button type="submit" className="bg-gradient-to-r from-primary to-accent">
          Send
        </Button>
      </form>
    </div>
  )
}
