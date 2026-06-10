"use client";

// src/components/dashboard/NotificationBell.jsx  (Next.js)
//
// Displays the bell icon + unread badge in your navbar.
// Polls every 30 seconds for the count.
// Also listens on the Socket.IO connection for real-time "notification"
// events — increments the badge instantly when a toast fires.

import { useState, useEffect, useRef, useContext, useCallback } from "react";
import { Bell, X, Check, Trash2 } from "lucide-react";
import MyContext from "@/context/ThemeProvider";
import { getSocket } from "@/lib/socket"; 

const TYPE_ICON = {
  tournament: "🎮",
  payment: "✅",
  room: "🔑",
  result: "🏆",
  announcement: "📣",
  prize: "💰",
  team: "🛡️",
};

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function NotificationBell() {
  const ctx = useContext(MyContext);

  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const ref = useRef(null);

  // ── Close on outside click ─────────────────────────────────────────────
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Poll unread count every 30 s ───────────────────────────────────────
  const fetchCount = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications?count=1");
      const data = await res.json();
      if (data.success) setUnreadCount(data.unreadCount);
    } catch {}
  }, []);

  useEffect(() => {
    if (!ctx?.user || ctx.user.role === "guest") return;
    fetchCount();
    const id = setInterval(fetchCount, 30000);
    return () => clearInterval(id);
  }, [ctx?.user, fetchCount]);

  // ── Real-time badge increment via Socket.IO ────────────────────────────
  // When a "notification" event arrives the GameToastProvider shows the
  // toast. This listener increments the badge at the same moment so both
  // stay in sync without waiting for the 30 s poll.
  useEffect(() => {
    if (!ctx?.user || ctx.user.role === "guest") return;

    let socket;
    try {
      socket = getSocket();
    } catch {
      return;
    }

    const handler = () => setUnreadCount((c) => c + 1);
    socket.on("notification", handler);
    return () => socket.off("notification", handler);
  }, [ctx?.user]);

  // ── Fetch full list when dropdown opens ───────────────────────────────
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    const next = !open;
    setOpen(next);
    if (next) fetchNotifications();
  };

  const markAllRead = async () => {
    await fetch("/api/notifications", { method: "PATCH" });
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAll = async () => {
    await fetch("/api/notifications", { method: "DELETE" });
    setNotifications([]);
    setUnreadCount(0);
  };

  if (!ctx?.user || ctx.user.role === "guest") return null;

  return (
    <div ref={ref} className="relative">
      {/* ── Bell button ──────────────────────────────────────────────── */}
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-lg text-[#4e5d78] hover:text-[#ff8c30] hover:bg-[#ff6b00]/5 transition-all"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center px-1 bg-[#ff6b00] text-white text-[10px] font-black rounded-full font-['Orbitron']">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* ── Dropdown ─────────────────────────────────────────────────── */}
      {open && (
        <div className="absolute right-0 top-12 w-80 sm:w-96 bg-[#0a0c10] border border-[#2a2e3a] rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] z-[9999] overflow-hidden font-['Rajdhani']">
          {/* Top accent line */}
          <div className="h-[2px] bg-gradient-to-r from-transparent via-[#ff6b00] to-transparent" />

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#141822] bg-[#0d0f15]">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#ff8c30]" />
              <span className="font-['Orbitron'] font-bold text-xs text-white uppercase tracking-wider">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-[#ff6b00]/15 border border-[#ff6b00]/20 text-[#ff8c30] text-[10px] font-black rounded uppercase">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-[10px] font-bold text-[#4ade80] uppercase tracking-wider hover:text-[#4ade80]/80 transition-colors"
                >
                  <Check className="w-3 h-3" /> Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="p-1 text-[#4e5d78] hover:text-red-400 transition-colors"
                  title="Clear all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1 text-[#4e5d78] hover:text-red-400 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-[400px] overflow-y-auto tab-scrollbar">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-5 h-5 border-2 border-[#ff6b00]/20 border-t-[#ff6b00] rounded-full animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-8 h-8 text-[#2a2e3a] mx-auto mb-3" />
                <p className="text-xs font-bold text-[#4e5d78] uppercase tracking-wider">
                  No notifications yet
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  className={`flex items-start gap-3 px-4 py-3 border-b border-[#141822]/60 transition-all hover:bg-[#0d0f15] ${
                    !n.read ? "bg-[#ff6b00]/[0.03]" : ""
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-base ${
                      !n.read
                        ? "bg-[#ff6b00]/10 border border-[#ff6b00]/20"
                        : "bg-[#1a1f2e] border border-[#2a2e3a]"
                    }`}
                  >
                    {TYPE_ICON[n.type] ?? "🔔"}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={`text-xs font-bold leading-tight ${
                          !n.read ? "text-white" : "text-[#8090a0]"
                        }`}
                      >
                        {n.title}
                      </p>
                      {!n.read && (
                        <div className="w-1.5 h-1.5 rounded-full bg-[#ff6b00] flex-shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-[11px] text-[#4e5d78] mt-0.5 leading-relaxed">
                      {n.message}
                    </p>
                    <p className="text-[10px] text-[#2a2e3a] font-bold uppercase tracking-wider mt-1">
                      {timeAgo(n.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-[#141822] bg-[#0d0f15] text-center">
              <p className="text-[10px] text-[#2a2e3a] font-bold uppercase tracking-wider">
                Showing last 50 notifications
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
