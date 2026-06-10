"use client";

// src/components/ui/GameToast.jsx  (Next.js)
//
// Usage:
//   1. Wrap your dashboard layout with <GameToastProvider>
//   2. Toasts appear automatically on Socket.IO "notification" events
//   3. Call useToast() anywhere for manual triggers
//
// Requires: src/lib/socket.js exporting getSocket()

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { getSocket } from "@/lib/socket";

const AUTO_DISMISS_MS = 5000;
const MAX_TOASTS = 4;

// Find TYPE_CONFIG and add this line:


const TYPE_CONFIG = {
  tournament: { icon: "🎮", accent: "#ff6b00", label: "TOURNAMENT" },
  payment: { icon: "✅", accent: "#4ade80", label: "PAYMENT" },
  room: { icon: "🔑", accent: "#facc15", label: "ROOM CREDS" },
  result: { icon: "🏆", accent: "#a78bfa", label: "RESULTS" },
  announcement: { icon: "📣", accent: "#38bdf8", label: "ANNOUNCEMENT" },
  prize: { icon: "💰", accent: "#fbbf24", label: "PRIZE" },
  team: { icon: "🛡️", accent: "#34d399", label: "TEAM" },
  auth: { icon: "🔐", accent: "#60a5fa", label: "AUTH" }, // ← add
  error: { icon: "❌", accent: "#f87171", label: "ERROR" }, // ← add
  default: { icon: "🔔", accent: "#ff6b00", label: "ALERT" },
  
  
};

// ── Context ──────────────────────────────────────────────────────────────────
const ToastCtx = createContext(null);

export function useGameToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx)
    throw new Error("useGameToast must be used inside <GameToastProvider>");
  return ctx;
}

// ── Single toast ─────────────────────────────────────────────────────────────
function ToastItem({ toast, onDismiss }) {
  const cfg = TYPE_CONFIG[toast.type] ?? TYPE_CONFIG.default;
  const [exit, setExit] = useState(false);
  const timerRef = useRef(null);
  const barRef = useRef(null);

  const dismiss = useCallback(() => {
    setExit(true);
    clearTimeout(timerRef.current);
    setTimeout(() => onDismiss(toast.id), 320);
  }, [toast.id, onDismiss]);

  useEffect(() => {
    // Animate progress bar
    if (barRef.current) {
      barRef.current.style.transition = `width ${AUTO_DISMISS_MS}ms linear`;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (barRef.current) barRef.current.style.width = "0%";
        });
      });
    }
    timerRef.current = setTimeout(dismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(timerRef.current);
  }, [dismiss]);

  return (
    <div
      style={{
        animation: exit
          ? "gtOut 0.3s cubic-bezier(0.4,0,1,1) forwards"
          : "gtIn 0.35s cubic-bezier(0,0,0.2,1) forwards",
        boxShadow: `0 0 0 1px rgba(255,255,255,0.04), 0 4px 24px rgba(0,0,0,0.7), 0 0 20px ${cfg.accent}44`,
      }}
      className="relative w-80 sm:w-96 overflow-hidden rounded-xl bg-[#080a0f] border border-[#1e2330] pointer-events-auto select-none"
    >
      {/* Top accent line */}
      <div
        className="h-[2px]"
        style={{
          background: `linear-gradient(90deg, transparent, ${cfg.accent}, transparent)`,
        }}
      />

      {/* Scan-line texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(255,255,255,0.012) 2px,rgba(255,255,255,0.012) 4px)",
        }}
      />

      {/* Body */}
      <div className="flex items-start gap-3 px-4 pt-3 pb-3.5 relative">
        {/* Icon bubble */}
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-lg"
          style={{
            background: `radial-gradient(circle at 40% 40%, ${cfg.accent}22, ${cfg.accent}08)`,
            border: `1px solid ${cfg.accent}33`,
          }}
        >
          {cfg.icon}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0 pt-0.5">
          <span
            className="text-[9px] font-black uppercase mb-0.5 block"
            style={{
              fontFamily: "'Orbitron', sans-serif",
              color: cfg.accent,
              letterSpacing: "0.18em",
            }}
          >
            {cfg.label}
          </span>
          <p
            className="text-[13px] font-bold text-white leading-snug"
            style={{ fontFamily: "'Rajdhani', sans-serif" }}
          >
            {toast.title}
          </p>
          {toast.message && (
            <p
              className="text-[11px] text-[#6b7a99] mt-0.5 leading-relaxed truncate"
              style={{ fontFamily: "'Rajdhani', sans-serif" }}
            >
              {toast.message}
            </p>
          )}
        </div>

        {/* Close */}
        <button
          onClick={dismiss}
          className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded text-[#3a4460] hover:text-[#ff4444] transition-colors mt-0.5"
          aria-label="Dismiss"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path
              d="M1 1L9 9M9 1L1 9"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-[2px] w-full bg-[#1e2330]">
        <div
          ref={barRef}
          className="h-full w-full"
          style={{
            background: `linear-gradient(90deg, ${cfg.accent}, ${cfg.accent}88)`,
          }}
        />
      </div>
    </div>
  );
}

// ── Provider ─────────────────────────────────────────────────────────────────
export function GameToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const show = useCallback((opts) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [{ id, ...opts }, ...prev].slice(0, MAX_TOASTS));
    return id;
  }, []);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ── Listen for Socket.IO notification events ──────────────────────────
  useEffect(() => {
    let socket;
    try {
      socket = getSocket();
    } catch {
      return;
    }

    const handler = (notification) => {
      show({
        title: notification.title,
        message: notification.message,
        type: notification.type ?? "default",
      });
    };

    socket.on("notification", handler);
    return () => socket.off("notification", handler);
  }, [show]);

  return (
    <ToastCtx.Provider value={{ show, dismiss }}>
      {children}

      {/* Fixed toast stack — top right */}
      <div
        className="fixed top-4 right-4 z-[99999] flex flex-col gap-2.5 pointer-events-none"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>

      <style>{`
        @keyframes gtIn  { from{opacity:0;transform:translateX(calc(100% + 16px))} to{opacity:1;transform:translateX(0)} }
        @keyframes gtOut { from{opacity:1;transform:translateX(0)} to{opacity:0;transform:translateX(calc(100% + 16px))} }
      `}</style>
    </ToastCtx.Provider>
  );
}

// ── Convenience hook ──────────────────────────────────────────────────────────
export function useToast() {
  const { show } = useGameToast();
  return {
    tournament: (title, message) =>
      show({ title, message, type: "tournament" }),
    payment: (title, message) => show({ title, message, type: "payment" }),
    room: (title, message) => show({ title, message, type: "room" }),
    result: (title, message) => show({ title, message, type: "result" }),
    announcement: (title, message) =>
      show({ title, message, type: "announcement" }),
    prize: (title, message) => show({ title, message, type: "prize" }),
    team: (title, message) => show({ title, message, type: "team" }),
    info: (title, message) => show({ title, message, type: "default" }),

    signup: (title, message) => show({ title, message, type: "auth" }),
    verifyEmail: (title, message) => show({ title, message, type: "auth" }),
    resendEmail: (title, message) => show({ title, message, type: "auth" }),

    login: (title, message) => show({ title, message, type: "auth" }), // ← add
    logout: (title, message) => show({ title, message, type: "auth" }), // ← add
    error: (title, message) => show({ title, message, type: "error" }), // ← add
  };
}
