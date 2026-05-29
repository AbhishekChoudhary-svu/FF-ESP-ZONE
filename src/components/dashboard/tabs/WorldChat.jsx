"use client"

import { useState, useRef, useEffect, useContext, useMemo } from "react"
import MyContext from "@/context/ThemeProvider"
import { io } from "socket.io-client"

export function WorldChatTab() {
  const context = useContext(MyContext)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [typingUser, setTypingUser] = useState("")
  const [onlineCount, setOnlineCount] = useState(0)
  
  const messagesEnd = useRef(null)
  const typingTimeoutRef = useRef(null)

  // 1. Stable Socket Initialization
  const socket = useMemo(() => io("http://localhost:5000", {
    transports: ["websocket"],
    withCredentials: true
  }), [])

  useEffect(() => {
    // Debugging connection
    socket.on("connect", () => console.log("✅ Socket Connected:", socket.id))
    socket.on("connect_error", (err) => console.log("❌ Socket Error:", err))

    // 2. Listeners
    socket.on("user_count_update", (count) => {
      console.log("📈 User count updated:", count)
      setOnlineCount(count)
    })

    socket.on("receive_message", (msg) => {
      setMessages((prev) => [...prev, { ...msg, timestamp: new Date(msg.timestamp) }])
    })

    socket.on("display_typing", (data) => {
      const currentUsername = context?.user?.username || "Player"
      if (data.username !== currentUsername) {
        setTypingUser(data.username)
        setIsTyping(data.typing)
      }
    })

    // 3. Fetch History
    const fetchChatHistory = async () => {
      try {
        const response = await fetch("/api/chat/history")
        const data = await response.json()
        if (data.success && data.messages) {
          setMessages(data.messages.map(m => ({ ...m, timestamp: new Date(m.timestamp) })))
        }
      } catch (err) {
        console.error("❌ History Load Error:", err)
      }
    }
    fetchChatHistory()

    // 4. Cleanup
    return () => {
      socket.off("user_count_update")
      socket.off("receive_message")
      socket.off("display_typing")
      socket.off("connect")
      socket.off("connect_error")
    }
  }, [socket, context?.user?.username])

  // Auto-scroll
  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const username = context?.user?.username || "Player"
    socket.emit("send_message", { username, text: newMessage })

    socket.emit("typing", { username, typing: false })
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    setNewMessage("")
  }

  const handleInputChange = (e) => {
    setNewMessage(e.target.value)
    const username = context?.user?.username || "Player"

    socket.emit("typing", { username, typing: true })

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing", { username, typing: false })
    }, 2000)
  }

  return (
    <>
      {/* Injecting fonts and scrollbar configurations */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Orbitron:wght@700;900&display=swap');
        
        .ff-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .ff-scrollbar::-webkit-scrollbar-track {
          background: #0c0e14;
        }
        .ff-scrollbar::-webkit-scrollbar-thumb {
          background: #2a2e3a;
          border-radius: 3px;
        }
        .ff-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #ff6b00;
        }
      `}</style>

      {/* Main Container Wrapper */}
      <div className="space-y-4 font-['Rajdhani']">
        
        {/* Header Block */}
        <div className="flex justify-between items-center">
          <h3 className="font-['Orbitron'] text-2xl font-bold tracking-wider text-[#f0f2f5] uppercase [text-shadow:0_0_15px_rgba(255,107,0,0.25)]">
            World Chat
          </h3>
          
          {/* Online Counter Badge */}
          <div className="flex items-center gap-2 bg-[#ff6b00]/10 px-4 py-1.5 rounded-full border border-[#ff6b00]/20 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4ade80] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4ade80] shadow-[0_0_6px_#4ade80]"></span>
            </span>
            <span className="text-xs font-bold text-[#ff8c30] tracking-widest uppercase">
              {onlineCount} Online
            </span>
          </div>
        </div>

        {/* Custom Terminal Chat Log Container */}
        <div className="relative h-96 overflow-y-auto p-5 border border-[#2a2e3a] rounded-xl bg-[#0a0c10] space-y-4 ff-scrollbar before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-[2px] before:bg-gradient-to-r before:from-transparent before:via-[#ff6b00] before:to-transparent before:z-20">
          
          {/* Tech Decorative Corners */}
          <div className="absolute w-2.5 h-2.5 top-0 left-0 border-t-2 border-l-2 border-[#ff6b00] z-10" />
          <div className="absolute w-2.5 h-2.5 top-0 right-0 border-t-2 border-r-2 border-[#ff6b00] z-10" />
          <div className="absolute w-2.5 h-2.5 bottom-0 left-0 border-b-2 border-l-2 border-[#ff6b00] z-10" />
          <div className="absolute w-2.5 h-2.5 bottom-0 right-0 border-b-2 border-r-2 border-[#ff6b00] z-10" />

          {/* Messages Map Loop */}
          {messages.map((msg, index) => (
            <div key={msg._id || index} className="flex gap-3 items-start animate-fade-in duration-300">
              
              {/* User Avatar Circle */}
              <div className="w-9 h-9 rounded-md bg-gradient-to-br from-[#ff6b00] to-[#ffb300] flex items-center justify-center flex-shrink-0 text-white font-bold font-['Orbitron'] border border-white/10 shadow-[0_2px_10px_rgba(255,107,0,0.2)]">
                {msg.username?.charAt(0).toUpperCase()}
              </div>

              {/* Message Structure Body */}
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <p className="text-sm font-bold text-[#ff8c30] uppercase tracking-wide">{msg.username}</p>
                  <p className="text-[10px] text-[#5a6070] font-semibold">
                    {msg.timestamp instanceof Date ? msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                  </p>
                </div>
                <p className="text-sm text-[#d0d5df] bg-[#11141d] px-3 py-2 rounded-lg rounded-tl-none mt-1 inline-block border border-[#1e2330] max-w-[85%] leading-relaxed">
                  {msg.text}
                </p>
              </div>
            </div>
          ))}

          {/* Typing Notification Event Overlay */}
          {isTyping && (
            <div className="flex gap-3 items-center ml-0.5 animate-pulse">
              <div className="w-7 h-7 rounded bg-[#11141d] flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-[#5a6070] border border-[#1e2330]">
                {typingUser?.charAt(0).toUpperCase()}
              </div>
              <div className="bg-[#11141d] px-3 py-1.5 rounded-lg rounded-tl-none flex gap-1 items-center border border-[#1e2330]">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-[#ff6b00] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-[#ff6b00] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-[#ff6b00] rounded-full animate-bounce"></span>
                </div>
              </div>
              <span className="text-[11px] text-[#5a6070] font-medium tracking-wide uppercase italic">{typingUser} is typing...</span>
            </div>
          )}
          <div ref={messagesEnd} />
        </div>

        {/* Input Interactive Submissions Area */}
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input 
            type="text"
            placeholder="Write a message..." 
            value={newMessage} 
            onChange={handleInputChange}
            className="flex-1 font-['Rajdhani'] text-[15px] font-semibold text-[#d0d5df] bg-[#11141d] border border-[#1e2330] rounded-md px-4 py-2.5 outline-none focus:border-[#ff6b00]/50 focus:shadow-[0_0_10px_rgba(255,107,0,0.15)] transition-all duration-200"
          />
          <button 
            type="submit" 
            className="px-6 font-['Rajdhani'] text-[15px] font-bold text-white uppercase tracking-wider rounded-md bg-gradient-to-br from-[#ff6b00] to-[#ff9a00] cursor-pointer shadow-[0_4px_15px_rgba(255,107,0,0.35)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(255,107,0,0.5)] active:scale-[0.98] transition-all duration-200"
          >
            SEND
          </button>
        </form>

      </div>
    </>
  )
}