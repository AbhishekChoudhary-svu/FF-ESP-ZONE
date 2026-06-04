"use client"

import { useState, useRef, useEffect, useContext, useMemo, useCallback } from "react"
import MyContext from "@/context/ThemeProvider"
import { io } from "socket.io-client"

// ─── Constants ────────────────────────────────────────────────────────────────
const SOCKET_URL = process.env.NEXT_PUBLIC_CHAT_URL || "http://localhost:5000"
const ALLOWED_EMOJIS = ["🔥", "💀", "👏", "😂", "❤️", "🎯", "💯", "👍"]

const RANK_COLORS = {
  Rookie:  "#6b7280",
  Soldier: "#3b82f6",
  Elite:   "#8b5cf6",
  Veteran: "#f59e0b",
  Legend:  "#ef4444",
  Ghost:   "#06b6d4",
}
const ROLE_COLORS = {
  Rusher:  "#ef4444",
  Support: "#22c55e",
  Sniper:  "#3b82f6",
  Nader:   "#f97316",
}
const STATUS_COLORS = {
  online:   "#4ade80",
  away:     "#f59e0b",
  "in-game":"#818cf8",
  offline:  "#4b5563",
}

// ─── Avatar Component ─────────────────────────────────────────────────────────
const Avatar = ({ avatar, username, roleColor, size = "md" }) => {
  const [imgError, setImgError] = useState(false)
  const isUrl = avatar && (avatar.startsWith("http") || avatar.startsWith("/"))
  const dim   = size === "sm" ? "w-6 h-6 text-[9px]"
              : size === "xs" ? "w-5 h-5 text-[8px]"
              : "w-9 h-9 text-sm"

  return (
    <div
      className={`${dim} rounded-md flex items-center justify-center flex-shrink-0 font-bold font-['Orbitron'] border border-white/10 overflow-hidden`}
      style={{
        background: (isUrl && !imgError) ? "transparent"
          : `linear-gradient(135deg, ${roleColor}99, ${roleColor}33)`,
        boxShadow: `0 2px 8px ${roleColor}33`,
        color: "#fff",
      }}
    >
      {isUrl && !imgError
        ? <img src={avatar} alt={username} className="w-full h-full object-cover" onError={() => setImgError(true)} />
        : <span>{(!isUrl && avatar) ? avatar : (username?.charAt(0).toUpperCase() || "?")}</span>
      }
    </div>
  )
}

// ─── Notification Toast ───────────────────────────────────────────────────────
const NotifToast = ({ notif, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 4000)
    return () => clearTimeout(t)
  }, [onClose])
  return (
    <div className="fixed bottom-24 right-4 z-[999] flex items-center gap-3 px-4 py-3 rounded-xl
      bg-[#11141d] border border-[#ff6b00]/30 shadow-[0_0_30px_rgba(255,107,0,0.15)]
      animate-[slideInRight_0.3s_ease_forwards] max-w-[calc(100vw-2rem)]">
      <span className="text-lg flex-shrink-0">{notif.type === "reply" ? "↩" : notif.emoji}</span>
      <div className="min-w-0">
        <p className="text-xs font-bold text-[#ff8c30] uppercase tracking-widest truncate">
          {notif.type === "reply" ? `${notif.fromUsername} replied to you` : `${notif.fromUsername} reacted`}
        </p>
        <p className="text-[11px] text-[#8a92a0] truncate max-w-[180px] mt-0.5">
          {notif.previewText}
        </p>
      </div>
      <button onClick={onClose} className="text-[#5a6070] hover:text-white ml-1 text-xs flex-shrink-0">✕</button>
    </div>
  )
}

export function WorldChatTab() {
  const context         = useContext(MyContext)
  const userId          = context?.user?._id || context?.user?.id
  const sessionUsername = context?.user?.username || context?.user?.displayName

  // ─── State ──────────────────────────────────────────────────────────────────
  const [messages,      setMessages]      = useState([])
  const [newMessage,    setNewMessage]    = useState("")
  const [typingUsers,   setTypingUsers]   = useState({})
  const [onlineCount,   setOnlineCount]   = useState(0)
  const [roomMembers,   setRoomMembers]   = useState([])
  const [playerProfile, setPlayerProfile] = useState(null)
  const [xpToast,       setXpToast]       = useState(null)
  const [replyTo,       setReplyTo]       = useState(null)
  const [currentRoom,   setCurrentRoom]   = useState("global")
  const [showReactions, setShowReactions] = useState(null)
  const [showMembers,   setShowMembers]   = useState(false)
  const [notification,  setNotification]  = useState(null)
  // Track which message has its action bar open (for mobile tap-to-reveal)
  const [activeActionMsg, setActiveActionMsg] = useState(null)

  const messagesEndRef    = useRef(null)
  const typingTimeoutRef  = useRef(null)
  const inputRef          = useRef(null)
  const chatLogRef        = useRef(null)

  // ─── Socket ──────────────────────────────────────────────────────────────────
  const socket = useMemo(() => io(SOCKET_URL, {
    transports: ["websocket"],
    withCredentials: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1500,
  }), [])

  // ─── Socket Events ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!userId) return

    socket.on("connect", () => {
      socket.emit("join", { userId, room: currentRoom, status: "online" })
    })
    socket.on("connect_error", (err) => console.error("❌ Socket:", err.message))
    socket.on("user_count_update", setOnlineCount)

    socket.on("history", ({ messages: msgs }) => {
      setMessages(msgs.map(m => ({ ...m, timestamp: new Date(m.timestamp) })))
    })
    socket.on("receive_message", (msg) => {
      setMessages(prev => [...prev, { ...msg, timestamp: new Date(msg.timestamp) }])
    })
    socket.on("display_typing", ({ username: who, isTyping }) => {
      setTypingUsers(prev => {
        const next = { ...prev }
        isTyping ? (next[who] = true) : delete next[who]
        return next
      })
    })
    socket.on("room_presence", ({ members, count }) => {
      setRoomMembers(members)
      setOnlineCount(count)
    })
    socket.on("system_event", (ev) => {
      const text =
        ev.type === "join"    ? `${ev.username}${ev.inGameRole ? ` [${ev.inGameRole}]` : ""}${ev.isCaptain ? " ©" : ""} entered the zone` :
        ev.type === "leave"   ? `🚪 ${ev.username} left` :
        ev.type === "rank_up" ? `🏆 ${ev.username} ranked up to ${ev.newRank}!` : null
      if (!text) return
      setMessages(prev => [...prev, { _id: `sys_${Date.now()}`, system: true, text, timestamp: new Date(ev.timestamp) }])
    })
    socket.on("xp_update", (data) => {
      setPlayerProfile(prev => prev ? { ...prev, chatXp: data.xp, chatRank: data.newRank || prev.chatRank } : null)
      setXpToast({ text: data.rankUp ? `Ranked up to ${data.newRank}! 🏆` : `+10 XP`, rankUp: !!data.rankUp })
      setTimeout(() => setXpToast(null), 2500)
    })
    socket.on("player_profile", (profile) => setPlayerProfile(profile))
    socket.on("reaction_update", ({ messageId, reactions }) => {
      setMessages(prev => prev.map(m => m._id === messageId ? { ...m, reactions } : m))
    })
    socket.on("message_deleted", ({ messageId }) => {
      setMessages(prev => prev.map(m => m._id === messageId ? { ...m, deleted: true } : m))
    })
    socket.on("reply_notification", (data) => {
      setNotification({ ...data, type: "reply" })
    })
    socket.on("reaction_notification", (data) => {
      setNotification({ ...data, type: "reaction" })
    })
    socket.on("error_event", ({ message: msg }) => console.error("Chat error:", msg))

    return () => {
      ["connect","connect_error","user_count_update","history","receive_message",
       "display_typing","room_presence","system_event","xp_update","player_profile",
       "reaction_update","message_deleted","reply_notification","reaction_notification",
       "error_event"].forEach(e => socket.off(e))
    }
  }, [socket, userId, currentRoom])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, typingUsers])

  // Close reaction picker when clicking/tapping outside
  useEffect(() => {
    if (!showReactions) return
    const handler = (e) => {
      if (!e.target.closest("[data-reaction-root]")) setShowReactions(null)
    }
    document.addEventListener("mousedown", handler)
    document.addEventListener("touchstart", handler)
    return () => {
      document.removeEventListener("mousedown", handler)
      document.removeEventListener("touchstart", handler)
    }
  }, [showReactions])

  // Close action bar when tapping outside on mobile
  useEffect(() => {
    if (!activeActionMsg) return
    const handler = (e) => {
      if (!e.target.closest("[data-msg-id]")) setActiveActionMsg(null)
    }
    document.addEventListener("touchstart", handler)
    return () => document.removeEventListener("touchstart", handler)
  }, [activeActionMsg])

  // ─── iOS keyboard: keep input visible ─────────────────────────────────────
  useEffect(() => {
    const handleResize = () => {
      // When keyboard opens on iOS, scroll chat log to bottom
      if (chatLogRef.current) {
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
        }, 300)
      }
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // ─── Actions ──────────────────────────────────────────────────────────────────
  const handleSendMessage = useCallback((e) => {
    e.preventDefault()
    if (!newMessage.trim()) return
    const replyPayload = replyTo
      ? { messageId: replyTo._id, username: replyTo.username, text: replyTo.text, avatar: replyTo.avatar || "" }
      : null
    socket.emit("send_message", { text: newMessage.trim(), replyTo: replyPayload })
    socket.emit("typing", { isTyping: false })
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    setNewMessage("")
    setReplyTo(null)
    setActiveActionMsg(null)
    inputRef.current?.focus()
  }, [socket, newMessage, replyTo])

  const handleInputChange = useCallback((e) => {
    setNewMessage(e.target.value)
    socket.emit("typing", { isTyping: true })
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => socket.emit("typing", { isTyping: false }), 2000)
  }, [socket])

  const handleReact  = useCallback((messageId, emoji) => {
    socket.emit("react", { messageId, emoji })
    setShowReactions(null)
    setActiveActionMsg(null)
  }, [socket])

  const handleDelete = useCallback((messageId) => {
    socket.emit("delete_message", { messageId })
    setActiveActionMsg(null)
  }, [socket])

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Escape") setReplyTo(null)
    if (e.key === "Enter" && !e.shiftKey) handleSendMessage(e)
  }, [handleSendMessage])

  // Mobile: tap message to reveal action bar
  const handleMsgTap = useCallback((msgId) => {
    setActiveActionMsg(prev => prev === msgId ? null : msgId)
    setShowReactions(null)
  }, [])

  const typingList = Object.keys(typingUsers).filter(u => u !== sessionUsername)

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Orbitron:wght@700;900&display=swap');

        .ff-scrollbar::-webkit-scrollbar { width: 4px; }
        .ff-scrollbar::-webkit-scrollbar-track { background: #080a0f; }
        .ff-scrollbar::-webkit-scrollbar-thumb { background: #1e2330; border-radius: 3px; }
        .ff-scrollbar::-webkit-scrollbar-thumb:hover { background: #ff6b00; }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes xpPop {
          0%   { opacity: 0; transform: translateY(0) scale(0.85); }
          20%  { opacity: 1; transform: translateY(-6px) scale(1.05); }
          80%  { opacity: 1; transform: translateY(-10px) scale(1); }
          100% { opacity: 0; transform: translateY(-18px) scale(0.95); }
        }

        .msg-row { animation: slideUp 0.2s ease forwards; }
        .xp-toast {
          position: absolute; right: 12px; top: 8px;
          animation: xpPop 2.5s ease forwards;
          pointer-events: none; z-index: 50;
        }

        /* ── Desktop: show action-bar on hover ── */
        @media (hover: hover) and (pointer: fine) {
          .msg-group .action-bar-desktop {
            opacity: 0;
            transition: opacity 0.15s;
            pointer-events: none;
          }
          .msg-group:hover .action-bar-desktop {
            opacity: 1;
            pointer-events: auto;
          }
        }

        /* ── Mobile: action bar always laid out in flow (tap-to-show via JS) ── */
        @media (hover: none) or (pointer: coarse) {
          .action-bar-desktop { display: none !important; }
        }

        .reaction-picker {
          position: absolute;
          bottom: calc(100% + 6px);
          left: 0;
          background: #11141d;
          border: 1px solid #2a2e3a;
          border-radius: 12px;
          padding: 6px 8px;
          gap: 2px;
          z-index: 40;
          white-space: nowrap;
          display: flex;
          box-shadow: 0 8px 24px rgba(0,0,0,0.5);
        }

        /* Reaction picker: flip to right-anchored on narrow screens to avoid overflow */
        @media (max-width: 400px) {
          .reaction-picker {
            left: auto;
            right: 0;
            flex-wrap: wrap;
            max-width: 192px;
            white-space: normal;
          }
        }

        /* Members panel: scrollable on mobile */
        .members-panel {
          max-height: 160px;
          overflow-y: auto;
        }

        /* Chat log: dynamic height using svh (small viewport height — excludes mobile browser chrome) */
        .chat-log-height {
          height: clamp(260px, 45svh, 420px);
        }

        /* Input area: sticky to bottom, above bottom-nav on mobile */
        .input-area {
          position: sticky;
          bottom: 0;
          background: #07080b;
          padding-top: 8px;
          padding-bottom: env(safe-area-inset-bottom, 4px);
          z-index: 10;
        }
      `}</style>

      {/* Notification toast */}
      {notification && (
        <NotifToast notif={notification} onClose={() => setNotification(null)} />
      )}

      <div className="flex flex-col gap-3 font-['Rajdhani']">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex justify-between items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            <h3 className="font-['Orbitron'] text-lg sm:text-xl font-bold tracking-wider text-[#f0f2f5] uppercase [text-shadow:0_0_15px_rgba(255,107,0,0.25)] truncate">
              World Chat
            </h3>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#ff6b00]/70 border border-[#ff6b00]/20 px-2 py-0.5 rounded-full flex-shrink-0">
              #{currentRoom}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Player profile pill — hidden on very small screens to save space */}
            {playerProfile && (
              <div className="hidden xs:flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold uppercase tracking-widest"
                style={{
                  borderColor: RANK_COLORS[playerProfile.chatRank] + "40",
                  color:       RANK_COLORS[playerProfile.chatRank],
                  background:  RANK_COLORS[playerProfile.chatRank] + "10",
                }}>
                <Avatar
                  avatar={playerProfile.avatar}
                  username={playerProfile.username}
                  roleColor={ROLE_COLORS[playerProfile.inGameRole] || "#6b7280"}
                  size="xs"
                />
                {playerProfile.inGameRole && (
                  <span style={{ color: ROLE_COLORS[playerProfile.inGameRole] }}>{playerProfile.inGameRole}</span>
                )}
                {playerProfile.isCaptain && <span className="text-[#fbbf24]">©</span>}
                <span className="opacity-40">·</span>
                <span>{playerProfile.chatRank}</span>
                <span className="opacity-40">·</span>
                <span>{playerProfile.chatXp} XP</span>
              </div>
            )}
            <button
              onClick={() => setShowMembers(v => !v)}
              className="flex items-center gap-1.5 bg-[#ff6b00]/10 px-3 py-1.5 rounded-full border border-[#ff6b00]/20 hover:border-[#ff6b00]/40 active:scale-95 transition-all cursor-pointer"
            >
              <span className="relative flex h-2 w-2 flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4ade80] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4ade80] shadow-[0_0_6px_#4ade80]" />
              </span>
              <span className="text-xs font-bold text-[#ff8c30] tracking-widest uppercase">{onlineCount} Online</span>
            </button>
          </div>
        </div>

        {/* ── Members panel ────────────────────────────────────────────────── */}
        {showMembers && roomMembers.length > 0 && (
          <div className="members-panel ff-scrollbar flex flex-wrap gap-2 p-3 bg-[#0a0c10] border border-[#1e2330] rounded-xl">
            {roomMembers.map(m => {
              const rc = ROLE_COLORS[m.inGameRole] || "#6b7280"
              return (
                <div key={m.username} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#11141d] border border-[#1e2330]">
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: STATUS_COLORS[m.status] || "#4b5563" }} />
                  <Avatar avatar={m.avatar} username={m.username} roleColor={rc} size="sm" />
                  <span className="text-[11px] font-bold text-[#d0d5df] max-w-[80px] truncate">{m.username}</span>
                  {m.inGameRole && (
                    <span className="text-[10px] font-bold px-1 rounded hidden sm:inline" style={{ color: rc, background: rc + "15" }}>{m.inGameRole}</span>
                  )}
                  {m.isCaptain && <span className="text-[10px] text-[#fbbf24] font-bold">©</span>}
                  <span className="text-[10px] font-bold hidden sm:inline" style={{ color: RANK_COLORS[m.chatRank] || "#6b7280" }}>{m.chatRank}</span>
                </div>
              )
            })}
          </div>
        )}

        {/* ── Chat log ─────────────────────────────────────────────────────── */}
        <div
          ref={chatLogRef}
          className="chat-log-height relative overflow-y-auto p-3 sm:p-4 border border-[#2a2e3a] rounded-xl bg-[#0a0c10] space-y-3 ff-scrollbar
            before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-[2px]
            before:bg-gradient-to-r before:from-transparent before:via-[#ff6b00] before:to-transparent before:z-20"
        >
          {/* Corner accents */}
          <div className="absolute w-2.5 h-2.5 top-0 left-0 border-t-2 border-l-2 border-[#ff6b00] z-10 pointer-events-none" />
          <div className="absolute w-2.5 h-2.5 top-0 right-0 border-t-2 border-r-2 border-[#ff6b00] z-10 pointer-events-none" />
          <div className="absolute w-2.5 h-2.5 bottom-0 left-0 border-b-2 border-l-2 border-[#ff6b00] z-10 pointer-events-none" />
          <div className="absolute w-2.5 h-2.5 bottom-0 right-0 border-b-2 border-r-2 border-[#ff6b00] z-10 pointer-events-none" />

          {xpToast && (
            <div className="xp-toast">
              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                xpToast.rankUp
                  ? "text-[#fbbf24] border-[#fbbf24]/40 bg-[#fbbf24]/10"
                  : "text-[#4ade80] border-[#4ade80]/30 bg-[#4ade80]/10"
              }`}>{xpToast.text}</span>
            </div>
          )}

          {messages.map((msg, index) => {

            // ── System message ─────────────────────────────────────────────
            if (msg.system) return (
              <div key={msg._id || index} className="text-center msg-row">
                <span className="text-[11px] text-[#5a6070] italic bg-[#0d0f16] px-3 py-1 rounded-full border border-[#1e2330]">
                  {msg.text}
                </span>
              </div>
            )

            // ── Deleted message ────────────────────────────────────────────
            if (msg.deleted) return (
              <div key={msg._id || index} className="flex gap-2 sm:gap-3 items-start msg-row opacity-30">
                <div className="w-9 h-9 rounded-md bg-[#1a1d26] flex items-center justify-center flex-shrink-0 text-sm border border-[#1e2330] text-[#5a6070]">
                  {msg.username?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-[11px] text-[#5a6070] font-semibold uppercase tracking-wide">{msg.username}</p>
                  <p className="text-xs text-[#5a6070] italic mt-1">[ message deleted ]</p>
                </div>
              </div>
            )

            const rankColor = RANK_COLORS[msg.chatRank] || "#6b7280"
            const roleColor = ROLE_COLORS[msg.inGameRole] || "#6b7280"
            const isOwn = msg.username === sessionUsername ||
                          (playerProfile?.playerId && String(msg.playerId) === String(playerProfile.playerId))

            const reactionEntries = msg.reactions ? Object.entries(msg.reactions) : []
            const hasReactions    = reactionEntries.some(([, users]) => Array.isArray(users) && users.length > 0)
            const replySnap       = msg.replyTo?.messageId ? msg.replyTo : null
            const msgId           = String(msg._id || index)
            const isActionOpen    = activeActionMsg === msgId

            return (
              <div
                key={msgId}
                className="msg-group msg-row flex gap-2 sm:gap-3 items-start relative"
                data-msg-id={msgId}
              >
                {/* Avatar */}
                <Avatar avatar={msg.avatar} username={msg.username} roleColor={roleColor} size="md" />

                <div className="flex-1 min-w-0">

                  {/* ── Reply preview ─────────────────────────────────── */}
                  {replySnap && (
                    <div className="flex items-center gap-2 mb-1 px-2 py-1 rounded-md bg-[#0d0f16] border-l-2 border-[#ff6b00]/50 max-w-[90%]">
                      {replySnap.avatar && (
                        <Avatar
                          avatar={replySnap.avatar}
                          username={replySnap.username}
                          roleColor={ROLE_COLORS[msg.inGameRole] || "#6b7280"}
                          size="xs"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-[#ff8c30] uppercase tracking-wide leading-none truncate">
                          {replySnap.username}
                        </p>
                        <p className="text-[11px] text-[#5a6070] truncate leading-tight">
                          {replySnap.text}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Name row */}
                  <div className="flex items-baseline gap-1 sm:gap-1.5 flex-wrap">
                    <p className="text-xs sm:text-sm font-bold uppercase tracking-wide truncate max-w-[120px]" style={{ color: rankColor }}>
                      {msg.username}
                    </p>
                    {msg.inGameRole && (
                      <span className="text-[9px] sm:text-[10px] font-bold px-1 sm:px-1.5 py-px rounded tracking-widest uppercase"
                        style={{ color: roleColor, background: roleColor + "15", border: `1px solid ${roleColor}30` }}>
                        {msg.inGameRole}
                      </span>
                    )}
                    {msg.isCaptain && (
                      <span className="text-[9px] sm:text-[10px] font-bold text-[#fbbf24] px-1 sm:px-1.5 py-px rounded border border-[#fbbf24]/30 bg-[#fbbf24]/10">
                        Cap
                      </span>
                    )}
                    {msg.chatRank && msg.chatRank !== "Rookie" && (
                      <span className="hidden sm:inline text-[10px] font-bold px-1.5 py-px rounded tracking-widest uppercase"
                        style={{ color: rankColor, background: rankColor + "15", border: `1px solid ${rankColor}30` }}>
                        {msg.chatRank}
                      </span>
                    )}
                    <p className="text-[10px] text-[#5a6070] font-semibold">
                      {msg.timestamp instanceof Date
                        ? msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                        : ""}
                    </p>
                  </div>

                  {/* Bubble + action area */}
                  <div
                    className="relative mt-1 inline-flex flex-col max-w-[92%] sm:max-w-[85%]"
                    data-reaction-root
                  >
                    {/* Message bubble — tap on mobile to open action bar */}
                    <p
                      className="text-sm text-[#d0d5df] bg-[#11141d] px-3 py-2 rounded-lg rounded-tl-none border border-[#1e2330] leading-relaxed break-words cursor-default select-text"
                      onTouchEnd={(e) => {
                        // Only trigger tap-to-open if not selecting text
                        if (window.getSelection()?.toString()) return
                        e.stopPropagation()
                        handleMsgTap(msgId)
                      }}
                    >
                      {msg.text}
                    </p>

                    {/* ── DESKTOP hover action bar ── */}
                    <div className="action-bar-desktop absolute left-full top-0 ml-1 flex flex-row gap-1">
                      <button
                        onClick={() => setShowReactions(p => p === msgId ? null : msgId)}
                        className="text-[13px] w-7 h-7 flex items-center justify-center rounded bg-[#11141d] border border-[#1e2330] hover:border-[#ff6b00]/40 text-[#5a6070] hover:text-[#ff6b00] transition-colors cursor-pointer"
                        title="React"
                      >😄</button>
                      <button
                        onClick={() => { setReplyTo(msg); inputRef.current?.focus() }}
                        className="text-[11px] w-7 h-7 flex items-center justify-center rounded bg-[#11141d] border border-[#1e2330] hover:border-[#ff6b00]/40 text-[#5a6070] hover:text-[#ff6b00] transition-colors cursor-pointer"
                        title="Reply"
                      >↩</button>
                      {isOwn && (
                        <button
                          onClick={() => handleDelete(msgId)}
                          className="text-[11px] w-7 h-7 flex items-center justify-center rounded bg-[#11141d] border border-[#1e2330] hover:border-red-500/40 text-[#5a6070] hover:text-red-400 transition-colors cursor-pointer"
                          title="Delete"
                        >🗑</button>
                      )}
                    </div>

                    {/* ── MOBILE tap-to-reveal action bar ── */}
                    {isActionOpen && (
                      <div className="sm:hidden flex flex-row gap-1.5 mt-1.5">
                        <button
                          onTouchEnd={(e) => { e.stopPropagation(); setShowReactions(p => p === msgId ? null : msgId) }}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#11141d] border border-[#1e2330] text-[#5a6070] active:border-[#ff6b00]/40 active:text-[#ff6b00] transition-colors text-xs font-bold"
                        >
                          😄 <span className="text-[10px] uppercase tracking-wider">React</span>
                        </button>
                        <button
                          onTouchEnd={(e) => {
                            e.stopPropagation()
                            setReplyTo(msg)
                            setActiveActionMsg(null)
                            setTimeout(() => inputRef.current?.focus(), 100)
                          }}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#11141d] border border-[#1e2330] text-[#5a6070] active:border-[#ff6b00]/40 active:text-[#ff6b00] transition-colors text-xs font-bold"
                        >
                          ↩ <span className="text-[10px] uppercase tracking-wider">Reply</span>
                        </button>
                        {isOwn && (
                          <button
                            onTouchEnd={(e) => { e.stopPropagation(); handleDelete(msgId) }}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#11141d] border border-red-500/20 text-[#5a6070] active:border-red-500/40 active:text-red-400 transition-colors text-xs font-bold"
                          >
                            🗑 <span className="text-[10px] uppercase tracking-wider">Del</span>
                          </button>
                        )}
                      </div>
                    )}

                    {/* Reactions display */}
                    {hasReactions && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {reactionEntries.map(([emoji, users]) =>
                          Array.isArray(users) && users.length > 0 && (
                            <button key={emoji}
                              onClick={() => handleReact(msgId, emoji)}
                              className={`flex items-center gap-1 px-2 py-px rounded-full text-xs border transition-all cursor-pointer active:scale-95 ${
                                users.includes(sessionUsername)
                                  ? "bg-[#ff6b00]/20 border-[#ff6b00]/40 text-[#ff8c30]"
                                  : "bg-[#11141d] border-[#1e2330] text-[#5a6070] hover:border-[#ff6b00]/30"
                              }`}>
                              {emoji} <span>{users.length}</span>
                            </button>
                          )
                        )}
                      </div>
                    )}

                    {/* Reaction picker */}
                    {showReactions === msgId && (
                      <div className="reaction-picker" data-reaction-root>
                        {ALLOWED_EMOJIS.map(emoji => (
                          <button key={emoji}
                            onClick={() => handleReact(msgId, emoji)}
                            onTouchEnd={(e) => { e.stopPropagation(); handleReact(msgId, emoji) }}
                            className="text-lg hover:scale-125 active:scale-110 transition-transform p-1 rounded hover:bg-[#1e2330] cursor-pointer">
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}

          {/* Typing indicator */}
          {typingList.length > 0 && (
            <div className="flex gap-2 sm:gap-3 items-center ml-0.5 msg-row">
              <div className="w-7 h-7 rounded bg-[#11141d] flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-[#5a6070] border border-[#1e2330]">
                {typingList[0]?.charAt(0).toUpperCase()}
              </div>
              <div className="bg-[#11141d] px-3 py-1.5 rounded-lg rounded-tl-none flex gap-1 items-center border border-[#1e2330]">
                <span className="w-1.5 h-1.5 bg-[#ff6b00] rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 bg-[#ff6b00] rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 bg-[#ff6b00] rounded-full animate-bounce" />
              </div>
              <span className="text-[11px] text-[#5a6070] font-medium tracking-wide uppercase italic truncate max-w-[140px]">
                {typingList.length === 1
                  ? `${typingList[0]} typing…`
                  : `${typingList.slice(0, 2).join(", ")} typing…`}
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Input area (sticky on mobile) ────────────────────────────────── */}
        <div className="input-area space-y-2">

          {/* Reply bar */}
          {replyTo && (
            <div className="flex items-center justify-between px-3 py-2 bg-[#11141d] border border-[#ff6b00]/20 rounded-lg">
              <div className="flex items-center gap-2 min-w-0">
                {replyTo.avatar && (
                  <Avatar
                    avatar={replyTo.avatar}
                    username={replyTo.username}
                    roleColor={ROLE_COLORS[replyTo.inGameRole] || "#6b7280"}
                    size="xs"
                  />
                )}
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-[#ff8c30] uppercase tracking-wide leading-none">
                    ↩ {replyTo.username}
                  </p>
                  <p className="text-[11px] text-[#5a6070] truncate">
                    {replyTo.text?.slice(0, 55)}{replyTo.text?.length > 55 ? "…" : ""}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setReplyTo(null)}
                className="text-[#5a6070] hover:text-red-400 active:text-red-400 transition-colors px-2 flex-shrink-0 text-sm"
              >✕</button>
            </div>
          )}

          {/* Input + Send */}
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              placeholder={replyTo ? `Replying to ${replyTo.username}…` : "Write a message…"}
              value={newMessage}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              // inputmode="text" keeps the numeric keyboard from showing on mobile
              inputMode="text"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="sentences"
              className="flex-1 font-['Rajdhani'] text-[15px] font-semibold text-[#d0d5df] bg-[#11141d] border border-[#1e2330] rounded-md px-4 py-2.5 outline-none focus:border-[#ff6b00]/50 focus:shadow-[0_0_10px_rgba(255,107,0,0.15)] transition-all duration-200 min-w-0"
            />
            <button
              type="submit"
              className="px-4 sm:px-6 font-['Rajdhani'] text-[14px] sm:text-[15px] font-bold text-white uppercase tracking-wider rounded-md bg-gradient-to-br from-[#ff6b00] to-[#ff9a00] cursor-pointer shadow-[0_4px_15px_rgba(255,107,0,0.35)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(255,107,0,0.5)] active:scale-[0.96] transition-all duration-200 flex-shrink-0"
            >
              SEND
            </button>
          </form>

          {/* Status switcher */}
          <div className="flex items-center gap-1.5 sm:gap-2 pb-1 flex-wrap">
            <span className="text-[10px] text-[#5a6070] uppercase tracking-widest font-bold">Status:</span>
            {["online", "away", "in-game"].map(s => (
              <button key={s}
                onClick={() => socket.emit("set_status", { status: s })}
                className="flex items-center gap-1 sm:gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2 sm:px-2.5 py-1 rounded-full border transition-all cursor-pointer active:scale-95"
                style={{ borderColor: STATUS_COLORS[s] + "40", color: STATUS_COLORS[s], background: STATUS_COLORS[s] + "10" }}>
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: STATUS_COLORS[s] }} />
                {s}
              </button>
            ))}
          </div>

        </div>
      </div>
    </>
  )
}