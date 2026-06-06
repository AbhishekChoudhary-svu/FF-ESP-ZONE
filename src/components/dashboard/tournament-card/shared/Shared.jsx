"use client"

import { useEffect } from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"

/* ─────────────────────────────────────────────────────────────
   DATE HELPERS
───────────────────────────────────────────────────────────── */

export function formatDate(date) {
  if (!date) return "TBA"
  return new Date(date).toLocaleDateString("en-IN", {
    month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}

export function toInputDate(date) {
  if (!date) return ""
  const d = new Date(date)
  if (isNaN(d)) return ""
  const pad = (n) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/* ─────────────────────────────────────────────────────────────
   STATUS BADGE
───────────────────────────────────────────────────────────── */

const STATUS_STYLES = {
  upcoming:  "bg-[#63b3ed]/10 text-[#63b3ed] border-[#63b3ed]/25",
  ongoing:   "bg-[#4ade80]/10 text-[#4ade80] border-[#4ade80]/20",
  completed: "bg-[#5a6070]/10 text-[#5a6070] border-[#5a6070]/25",
  cancelled: "bg-red-500/10  text-red-400   border-red-500/20",
  draft:     "bg-[#ff9a00]/10 text-[#ff9a00] border-[#ff9a00]/20",
}

export function StatusBadge({ status }) {
  return (
    <span
      className={`text-[10px] font-bold tracking-widest px-2.5 py-0.5 rounded border uppercase ${
        STATUS_STYLES[status] ?? STATUS_STYLES.upcoming
      }`}
    >
      {status === "ongoing" && (
        <span className="inline-block w-1.5 h-1.5 bg-[#4ade80] rounded-full mr-1 align-middle animate-pulse" />
      )}
      {status}
    </span>
  )
}

/* ─────────────────────────────────────────────────────────────
   STATUS TRANSITION MAP
───────────────────────────────────────────────────────────── */

export const STATUS_TRANSITIONS = {
  draft:     ["upcoming", "cancelled"],
  upcoming:  ["ongoing",  "cancelled"],
  ongoing:   ["completed","cancelled"],
  completed: [],
  cancelled: [],
}

export const STATUS_LABELS = {
  upcoming:  { label: "Publish (Upcoming)", color: "border-[#63b3ed]/40 text-[#63b3ed] hover:bg-[#63b3ed]/10" },
  ongoing:   { label: "Mark Ongoing",       color: "border-[#4ade80]/40 text-[#4ade80] hover:bg-[#4ade80]/10" },
  completed: { label: "Mark Completed",     color: "border-[#5a6070]/40 text-[#5a6070] hover:bg-[#5a6070]/10" },
  cancelled: { label: "Cancel Tournament",  color: "border-red-500/40  text-red-400   hover:bg-red-500/10"   },
}

// All reachable statuses (admins can jump to any)
export const ALL_STATUSES = ["upcoming", "ongoing", "completed", "cancelled"]

/* ─────────────────────────────────────────────────────────────
   SHARED CSS TOKENS
───────────────────────────────────────────────────────────── */

export const cls = {
  input:  "w-full px-3 py-2 bg-[#07080b] border border-[#1e2330] rounded text-[#d0d5df] placeholder-[#4e5d78] text-sm font-semibold focus:outline-none focus:border-[#ff6b00]/60 transition-colors",
  label:  "block text-xs font-bold uppercase tracking-wider text-[#8090a0] mb-1.5",
  btnPrimary: "flex-1 py-2.5 bg-gradient-to-r from-[#ff6b00] to-[#ff9a00] text-white font-bold text-xs uppercase tracking-widest rounded disabled:opacity-50 transition-all",
  btnGhost:   "px-5 py-2.5 border border-[#2a2e3a] text-[#8090a0] hover:text-white font-bold text-xs uppercase tracking-widest rounded transition-all",
}

/* ─────────────────────────────────────────────────────────────
   BASE PORTAL DIALOG
───────────────────────────────────────────────────────────── */

/**
 * @param {{ open: boolean, onClose: () => void, title: string,
 *           children: React.ReactNode, maxWidth?: string }} props
 */
export function Dialog({ open, onClose, title, children, maxWidth = "max-w-lg" }) {
  useEffect(() => {
    if (!open) return
    const handle = (e) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", handle)
    return () => window.removeEventListener("keydown", handle)
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className={`relative w-full ${maxWidth} bg-[#0a0c10] border border-[#2a2e3a] rounded-xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.7)] font-['Rajdhani']`}
      >
        {/* top gradient line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#ff6b00] to-transparent" />

        {/* corner brackets */}
        <div className="pointer-events-none">
          <span className="absolute top-0    left-0  w-3 h-3 border-t-2 border-l-2 border-[#ff6b00]" />
          <span className="absolute top-0    right-0 w-3 h-3 border-t-2 border-r-2 border-[#ff6b00]" />
          <span className="absolute bottom-0 left-0  w-3 h-3 border-b-2 border-l-2 border-[#ff6b00]" />
          <span className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#ff6b00]" />
        </div>

        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#141822] bg-[#0d0f15]">
          <h3 className="font-['Orbitron'] font-bold text-sm text-white tracking-widest uppercase">
            {title}
          </h3>
          <button onClick={onClose} className="text-[#4e5d78] hover:text-red-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* scrollable body */}
        <div className="px-6 py-5 max-h-[80vh] overflow-y-auto tab-scrollbar">
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}