"use client"

import { useState, useContext, useRef, useEffect, useCallback } from "react"
import { createPortal } from "react-dom"
import {
  X, MoreVertical, Users, Lock, Edit, Trash2, BarChart2,
  Loader2, Key, CheckCircle2, AlertTriangle, RefreshCw,
  ChevronRight, Zap,
} from "lucide-react"
import MyContext from "@/context/ThemeProvider"
import toast from "react-hot-toast"
import Script from "next/script"

/* ─────────────────────── helpers ─────────────────────────── */

function formatDate(date) {
  if (!date) return "TBA"
  return new Date(date).toLocaleDateString("en-IN", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  })
}

function toInputDate(date) {
  if (!date) return ""
  const d = new Date(date)
  if (isNaN(d)) return ""
  const pad = (n) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function StatusBadge({ status }) {
  const styles = {
    upcoming:  "bg-[#63b3ed]/10 text-[#63b3ed] border-[#63b3ed]/25",
    ongoing:   "bg-[#4ade80]/10 text-[#4ade80] border-[#4ade80]/20",
    completed: "bg-[#5a6070]/10 text-[#5a6070] border-[#5a6070]/25",
    cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
    draft:     "bg-[#ff9a00]/10 text-[#ff9a00] border-[#ff9a00]/20",
  }
  return (
    <span className={`text-[10px] font-bold tracking-widest px-2.5 py-0.5 rounded border uppercase ${styles[status] || styles.upcoming}`}>
      {status === "ongoing" && (
        <span className="inline-block w-1.5 h-1.5 bg-[#4ade80] rounded-full mr-1 align-middle animate-pulse" />
      )}
      {status}
    </span>
  )
}

/* ─────────────────────── Portal Dialog ───────────────────── */

function Dialog({ open, onClose, title, children, maxWidth = "max-w-lg" }) {
  // Close on Escape
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
      <div className={`relative w-full ${maxWidth} bg-[#0a0c10] border border-[#2a2e3a] rounded-xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.7)] font-['Rajdhani']`}>
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#ff6b00] to-transparent" />
        <div className="absolute top-0    left-0  w-3 h-3 border-t-2 border-l-2 border-[#ff6b00]" />
        <div className="absolute top-0    right-0 w-3 h-3 border-t-2 border-r-2 border-[#ff6b00]" />
        <div className="absolute bottom-0 left-0  w-3 h-3 border-b-2 border-l-2 border-[#ff6b00]" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#ff6b00]" />
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#141822] bg-[#0d0f15]">
          <h3 className="font-['Orbitron'] font-bold text-sm text-white tracking-widest uppercase">{title}</h3>
          <button onClick={onClose} className="text-[#4e5d78] hover:text-red-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 py-5 max-h-[80vh] overflow-y-auto tab-scrollbar">
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}

/* ─────────────────── Status Change Dialog ────────────────── */

const STATUS_TRANSITIONS = {
  draft:     ["upcoming", "cancelled"],
  upcoming:  ["ongoing",  "cancelled"],
  ongoing:   ["completed","cancelled"],
  completed: [],
  cancelled: [],
}
const ALL_STATUSES = [
  "upcoming",
  "ongoing",
  "completed",
  "cancelled",
]

const STATUS_LABELS = {
  upcoming:  { label: "Publish (Upcoming)", color: "border-[#63b3ed]/40 text-[#63b3ed] hover:bg-[#63b3ed]/10" },
  ongoing:   { label: "Mark Ongoing",       color: "border-[#4ade80]/40 text-[#4ade80] hover:bg-[#4ade80]/10" },
  completed: { label: "Mark Completed",     color: "border-[#5a6070]/40 text-[#5a6070] hover:bg-[#5a6070]/10" },
  cancelled: { label: "Cancel Tournament",  color: "border-red-500/40  text-red-400   hover:bg-red-500/10" },
}

function StatusDialog({ open, onClose, tournament,isPrivileged, onSuccess }) {
  const [loading, setLoading] = useState(false)
  

const next =
  isPrivileged
    ? ALL_STATUSES.filter(s => s !== tournament?.status)
    : STATUS_TRANSITIONS[tournament?.status] ?? [];

  const handleChange = async (newStatus) => {
    setLoading(true)
    try {
      const res  = await fetch(`/api/tournaments/${tournament._id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ status: newStatus }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || "Failed"); return }
      toast.success(`Status changed to "${newStatus}"`)
      onSuccess?.()
      onClose()
    } catch { toast.error("Something went wrong") }
    finally   { setLoading(false) }
  }

  return (
    <Dialog open={open} onClose={onClose} title="⚡ Change Status">
      <div className="space-y-4">
        <div className="p-3 bg-[#07080b] border border-[#1e2330] rounded-lg flex items-center gap-3">
          <span className="text-[10px] text-[#4e5d78] uppercase tracking-wider font-bold">Current:</span>
          <StatusBadge status={tournament?.status} />
        </div>

        {next.length === 0 ? (
          <div className="p-4 bg-[#07080b] border border-[#1e2330] rounded-lg text-center">
            <p className="text-sm text-[#4e5d78] font-bold uppercase tracking-wider">
              No further transitions available
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#4e5d78] mb-2">◆ Move to:</p>
            {next.map((s) => {
              const meta = STATUS_LABELS[s]
              return (
                <button
                  key={s}
                  onClick={() => handleChange(s)}
                  disabled={loading}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded border ${meta.color} font-bold text-sm uppercase tracking-wider transition-all disabled:opacity-50`}
                >
                  <span>{meta.label}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )
            })}
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-2 border border-[#2a2e3a] text-[#8090a0] font-bold text-xs uppercase tracking-widest rounded transition-all hover:text-white"
        >
          Cancel
        </button>
      </div>
    </Dialog>
  )
}

/* ───────────────────── Razorpay Join Dialog ──────────────── */

function RazorpayJoinDialog({ open, onClose, tournament, onSuccess }) {
  const ctx     = useContext(MyContext)
  const [loading, setLoading] = useState(false)
  const [step,    setStep]    = useState("confirm") // "confirm" | "processing" | "done"

  const player  = ctx?.player
  const team    = ctx?.team
  const members = team?.players ?? []

  const teamMode  = tournament?.teamMode
  const isSquad   = teamMode === "Squad"
  const isDuo     = teamMode === "Duo"

  const joiningMembers = isSquad
    ? members.slice(0, 4)
    : isDuo
    ? members.slice(0, 2)
    : [player]

  // Load Razorpay script dynamically
  const loadRazorpay = () =>
    new Promise((resolve) => {
      if (window.Razorpay) { resolve(true); return }
      const s = document.createElement("script")
      s.src = "https://checkout.razorpay.com/v1/checkout.js"
      s.onload  = () => resolve(true)
      s.onerror = () => resolve(false)
      document.body.appendChild(s)
    })

  const handlePay = async () => {
    setLoading(true)
    setStep("processing")

    try {
      // 1. Create order on server
      const orderRes  = await fetch("/api/payments/razorpay", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ tournamentId: tournament._id }),
      })
      const orderData = await orderRes.json()
      if (!orderRes.ok) { toast.error(orderData.error || "Order creation failed"); setStep("confirm"); return }

      // 2. Load Razorpay SDK
      const loaded = await loadRazorpay()
      if (!loaded) { toast.error("Razorpay SDK failed to load"); setStep("confirm"); return }

      // 3. Open Razorpay checkout
      await new Promise((resolve, reject) => {
        const rzp = new window.Razorpay({
          key:         orderData.keyId,
          amount:      orderData.amount,
          currency:    orderData.currency,
          name:        "Tournament Arena",
          description: `Entry Fee — ${orderData.tournamentName}`,
          order_id:    orderData.orderId,
          prefill:     orderData.prefill,
          theme:       { color: "#ff6b00" },
          modal: {
            ondismiss: () => reject(new Error("dismissed")),
          },
          handler: async (response) => {
            try {
              // 4. Verify on server + join
              const verifyRes  = await fetch("/api/payments/razorpay", {
                method:  "PUT",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify({
                  razorpay_order_id:   response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature:  response.razorpay_signature,
                  tournamentId:        tournament._id,
                }),
              })
              const verifyData = await verifyRes.json()
              if (!verifyRes.ok) { toast.error(verifyData.error || "Verification failed"); reject(new Error(verifyData.error)); return }
              setStep("done")
              resolve()
            } catch (e) { reject(e) }
          },
        })
        rzp.open()
      })

      toast.success("Payment verified! You've joined the tournament 🎮")
      onSuccess?.()
      setTimeout(onClose, 1500)
    } catch (err) {
      if (err?.message !== "dismissed") {
        toast.error(err?.message || "Payment failed")
      }
      setStep("confirm")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title={`💳 Join — ${tournament?.name}`}>
      <div className="space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Mode",  value: `${tournament?.gameMode} ${tournament?.teamMode}`, color: "text-[#63b3ed]" },
            { label: "Prize", value: `₹${tournament?.prizePool?.toLocaleString() ?? 0}`, color: "text-green-400" },
            { label: "Entry", value: `₹${tournament?.entryFee}`, color: "text-[#ff9a00]" },
          ].map((s, i) => (
            <div key={i} className="p-3 bg-[#07080b] border border-[#1e2330] rounded-lg text-center">
              <p className="text-[10px] text-[#4e5d78] uppercase tracking-wider font-bold mb-1">{s.label}</p>
              <p className={`text-sm font-black font-['Orbitron'] ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Members joining */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#4e5d78] mb-3">
            ◆ {isSquad ? "Squad Members" : isDuo ? "Duo Members" : "Joining As"}
          </p>
          <div className="space-y-2">
            {joiningMembers.map((m, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-[#07080b] border border-[#1e2330] rounded-lg">
                <div className="w-8 h-8 rounded-lg overflow-hidden border border-[#2a2e3a] bg-[#1a1f2e] flex items-center justify-center flex-shrink-0">
                  {m?.avatar
                    ? <img src={m.avatar} className="w-full h-full object-cover" alt="" />
                    : <span className="text-xs font-black text-[#ff8c30]">{m?.userId?.username?.charAt(0) ?? "?"}</span>
                  }
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-[#d0d5df]">{m?.userId?.username ?? "Unknown"}</p>
                  <p className="text-[11px] text-[#4e5d78]">{m?.inGameRole}{m?.isCaptain ? " • Captain" : ""}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment breakdown */}
        <div className="p-4 bg-[#07080b] border border-[#ff9a00]/20 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#8090a0] font-semibold">Entry Fee</span>
            <span className="font-['Orbitron'] font-black text-[#ffaa00]">₹{tournament?.entryFee}</span>
          </div>
          <div className="border-t border-[#1e2330] pt-3">
            <p className="text-[11px] text-[#4e5d78] leading-relaxed">
              Secured payment via <span className="text-[#ff9a00] font-bold">Razorpay</span>. UPI, Net Banking, Cards & Wallets accepted.
            </p>
          </div>
        </div>

        {step === "done" ? (
          <div className="flex items-center justify-center gap-3 py-4 bg-[#4ade80]/10 border border-[#4ade80]/30 rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-[#4ade80]" />
            <span className="text-[#4ade80] font-bold uppercase tracking-wider text-sm">Successfully Joined!</span>
          </div>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={handlePay}
              disabled={loading || joiningMembers.length === 0}
              className="flex-1 py-3 bg-gradient-to-r from-[#ff6b00] to-[#ff9a00] text-white font-bold text-xs uppercase tracking-widest rounded disabled:opacity-50 transition-all"
            >
              {loading
                ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Processing...</span>
                : `💳 Pay ₹${tournament?.entryFee} & Join`}
            </button>
            <button onClick={onClose} className="px-5 py-3 border border-[#2a2e3a] text-[#8090a0] hover:text-white font-bold text-xs uppercase tracking-widest rounded transition-all">
              Cancel
            </button>
          </div>
        )}
      </div>
    </Dialog>
  )
}

/* ─────────────────────── Free Join Dialog ────────────────── */

function JoinDialog({ open, onClose, tournament, onSuccess }) {
  const ctx = useContext(MyContext)
  const [loading, setLoading] = useState(false)

  const teamMode = tournament?.teamMode
  const isSquad  = teamMode === "Squad"
  const isDuo    = teamMode === "Duo"

  const team    = ctx?.team
  const player  = ctx?.player
  const members = team?.players ?? []

  const joiningMembers = isSquad
    ? members.slice(0, 4)
    : isDuo
    ? members.slice(0, 2)
    : [player]

  const handleJoin = async () => {
    setLoading(true)
    try {
      const res  = await fetch("/api/tournaments/join", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ tournamentId: tournament._id }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || "Failed to join"); return }
      toast.success("Successfully joined! 🎮")
      onSuccess?.()
      onClose()
    } catch { toast.error("Something went wrong") }
    finally   { setLoading(false) }
  }

  return (
    <Dialog open={open} onClose={onClose} title={`⚔ Join — ${tournament?.name}`}>
      <div className="space-y-5">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Mode",  value: `${tournament?.gameMode} ${tournament?.teamMode}`, color: "text-[#63b3ed]" },
            { label: "Prize", value: `₹${tournament?.prizePool?.toLocaleString() ?? 0}`, color: "text-green-400" },
            { label: "Entry", value: "Free", color: "text-[#4ade80]" },
          ].map((s, i) => (
            <div key={i} className="p-3 bg-[#07080b] border border-[#1e2330] rounded-lg text-center">
              <p className="text-[10px] text-[#4e5d78] uppercase tracking-wider font-bold mb-1">{s.label}</p>
              <p className={`text-sm font-black font-['Orbitron'] ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#4e5d78] mb-3">
            ◆ {isSquad ? "Squad Members Joining" : isDuo ? "Duo Members Joining" : "Joining As"}
          </p>
          <div className="space-y-2">
            {joiningMembers.length > 0 ? joiningMembers.map((m, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-[#07080b] border border-[#1e2330] rounded-lg">
                <div className="w-8 h-8 rounded-lg overflow-hidden border border-[#2a2e3a] bg-[#1a1f2e] flex items-center justify-center flex-shrink-0">
                  {m?.avatar
                    ? <img src={m.avatar} className="w-full h-full object-cover" alt="" />
                    : <span className="text-xs font-black text-[#ff8c30]">{m?.userId?.username?.charAt(0) ?? "?"}</span>
                  }
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-[#d0d5df]">{m?.userId?.username ?? "Unknown"}</p>
                  <p className="text-[11px] text-[#4e5d78]">{m?.inGameRole}{m?.isCaptain ? " • Captain" : ""}</p>
                </div>
                {i === 0 && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[#ff6b00]/10 border border-[#ff6b00]/20 text-[#ff8c30] rounded">
                    Lead
                  </span>
                )}
              </div>
            )) : (
              <div className="p-4 bg-[#07080b] border border-red-900/30 rounded-lg text-center">
                <p className="text-sm text-red-400 font-bold">
                  {isSquad || isDuo ? "Your team needs more members" : "No player profile found"}
                </p>
              </div>
            )}
          </div>
        </div>

        {tournament?.registrationDeadline && (
          <div className="p-3 bg-[#ff9a00]/5 border border-[#ff9a00]/20 rounded-lg">
            <p className="text-[11px] text-[#ff9a00] font-bold uppercase tracking-wider">
              ⏱ Registration closes: {formatDate(tournament.registrationDeadline)}
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleJoin}
            disabled={loading || joiningMembers.length === 0}
            className="flex-1 py-2.5 bg-gradient-to-r from-[#ff6b00] to-[#ff9a00] text-white font-bold text-xs uppercase tracking-widest rounded disabled:opacity-50 transition-all"
          >
            {loading
              ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Joining...</span>
              : "⚔ Confirm Join"}
          </button>
          <button onClick={onClose} className="px-5 py-2.5 border border-[#2a2e3a] text-[#8090a0] hover:text-white font-bold text-xs uppercase tracking-widest rounded transition-all">
            Cancel
          </button>
        </div>
      </div>
    </Dialog>
  )
}

/* ─────────────────── View Details Dialog ─────────────────── */

function ViewDetailsDialog({ open, onClose, tournament }) {
  const [rich,     setRich]     = useState(null)
  const [fetching, setFetching] = useState(false)

  useEffect(() => {
    if (!open || !tournament?._id) return
    setFetching(true)
    setRich(null)
    fetch(`/api/tournaments/${tournament._id}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setRich(d.tournament) })
      .catch(() => {})
      .finally(() => setFetching(false))
  }, [open, tournament?._id])

  const t = rich ?? tournament

  const filledSlots  = t?.filledSlots ?? 0
  const totalSlots   = t?.totalSlots  ?? 0
  const fillPct      = totalSlots > 0 ? Math.round((filledSlots / totalSlots) * 100) : 0
  const hasRoom      = t?.roomId && t?.roomPassword
  const participants = t?.participants ?? []

  return (
    <Dialog open={open} onClose={onClose} title={`🏆 ${t?.name}`} maxWidth="max-w-2xl">
      {fetching && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-[#ff6b00]" />
          <span className="ml-2 text-xs text-[#4e5d78] uppercase tracking-widest font-bold">Loading...</span>
        </div>
      )}

      {!fetching && (
        <div className="space-y-5">
          {t?.bannerImage && (
            <img src={t.bannerImage} alt="" className="w-full h-36 object-cover rounded-lg border border-[#1e2330]" />
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Mode",   value: `${t?.gameMode} ${t?.teamMode}`, color: "text-[#63b3ed]" },
              { label: "Prize",  value: `₹${t?.prizePool?.toLocaleString() ?? 0}`, color: "text-green-400" },
              { label: "Entry",  value: t?.tournamentType === "paid" ? `₹${t?.entryFee}` : "Free", color: t?.tournamentType === "paid" ? "text-[#ff9a00]" : "text-[#4ade80]" },
              { label: "Region", value: t?.region ?? "India", color: "text-[#d0d5df]" },
            ].map((s, i) => (
              <div key={i} className="p-3 bg-[#07080b] border border-[#1e2330] rounded-lg text-center">
                <p className="text-[10px] text-[#4e5d78] uppercase tracking-wider font-bold mb-1">{s.label}</p>
                <p className={`text-xs font-black font-['Orbitron'] ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Slots progress */}
          <div className="p-4 bg-[#07080b] border border-[#1e2330] rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#4e5d78]">◆ Slots Filled</p>
              <p className="text-xs font-black font-['Orbitron'] text-[#ffaa00]">{filledSlots} / {totalSlots}</p>
            </div>
            <div className="h-2 bg-[#1e2330] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#ff6b00] to-[#ffb300] rounded-full transition-all" style={{ width: `${fillPct}%` }} />
            </div>
            <p className="text-[11px] text-[#4e5d78] mt-1">{totalSlots - filledSlots} slots remaining</p>
          </div>

          {/* Room credentials */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#4e5d78] mb-3">◆ Room Credentials</p>
            {hasRoom ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[#07080b] border border-[#4ade80]/20 rounded-lg">
                  <p className="text-[10px] text-[#4e5d78] uppercase tracking-wider font-bold mb-1">Room ID</p>
                  <p className="font-['Orbitron'] font-black text-[#4ade80] text-sm tracking-widest select-all">{t.roomId}</p>
                </div>
                <div className="p-3 bg-[#07080b] border border-[#4ade80]/20 rounded-lg">
                  <p className="text-[10px] text-[#4e5d78] uppercase tracking-wider font-bold mb-1">Password</p>
                  <p className="font-['Orbitron'] font-black text-[#4ade80] text-sm tracking-widest select-all">{t.roomPassword}</p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-[#07080b] border border-[#1e2330] rounded-lg flex items-center gap-3">
                <Lock className="w-4 h-4 text-[#4e5d78]" />
                <p className="text-sm text-[#4e5d78] font-semibold">Room credentials not published yet</p>
              </div>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: "Registration Closes", value: formatDate(t?.registrationDeadline) },
              { label: "Starts",              value: formatDate(t?.startDate) },
              { label: "Ends",                value: formatDate(t?.endDate) },
            ].map((d, i) => (
              <div key={i} className="p-3 bg-[#07080b] border border-[#1e2330] rounded-lg">
                <p className="text-[10px] text-[#4e5d78] uppercase tracking-wider font-bold mb-1">{d.label}</p>
                <p className="text-xs font-bold text-[#d0d5df]">{d.value}</p>
              </div>
            ))}
          </div>

          {/* Rules */}
          {t?.rules && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#4e5d78] mb-2">◆ Rules</p>
              <div className="p-4 bg-[#07080b] border border-[#1e2330] rounded-lg">
                <p className="text-sm text-[#8090a0] leading-relaxed whitespace-pre-wrap">{t.rules}</p>
              </div>
            </div>
          )}

          {/* Participants */}
          {participants.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#4e5d78] mb-3">
                ◆ Participants ({participants.length})
              </p>
              <div className="space-y-2 max-h-56 overflow-y-auto tab-scrollbar">
                {participants.map((p, i) => {
                  const name =
                    p.team?.teamName ??
                    p.player?.userId?.username ??
                    p.player?.userId?.ffUid ??
                    `Slot ${i + 1}`

                  const memberCount = p.members?.length ?? 1
                  const avatar = p.player?.avatar ?? null
                  const initial = name.charAt(0).toUpperCase()

                  return (
                    <div key={i} className="flex items-center gap-3 p-3 bg-[#07080b] border border-[#1e2330] rounded-lg">
                      <div className="w-8 h-8 rounded-lg bg-[#1a1f2e] border border-[#2a2e3a] flex-shrink-0 flex items-center justify-center overflow-hidden">
                        {avatar
                          ? <img src={avatar} className="w-full h-full object-cover" alt="" />
                          : <span className="text-xs font-black text-[#ff8c30]">{initial}</span>
                        }
                      </div>
                      <span className="font-['Orbitron'] font-black text-xs text-[#ffaa00] w-6 flex-shrink-0">#{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[#d0d5df] truncate">{name}</p>
                        <p className="text-[11px] text-[#4e5d78]">
                          {memberCount} member{memberCount > 1 ? "s" : ""} • Joined {formatDate(p.joinedAt)}
                        </p>
                      </div>
                      {p.placement && (
                        <span className="text-[10px] font-black font-['Orbitron'] text-[#ffaa00] flex-shrink-0">
                          #{p.placement}
                        </span>
                      )}
                      {p.paymentStatus === "confirmed" && p.paymentId && (
                        <span className="text-[9px] font-bold px-2 py-0.5 bg-[#4ade80]/10 border border-[#4ade80]/20 text-[#4ade80] rounded uppercase">Paid</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-[#141822]">
            <p className="text-[11px] text-[#4e5d78] font-bold uppercase tracking-wider">
              Organized by {t?.organizer?.username ?? "Unknown"}
            </p>
          </div>
        </div>
      )}
    </Dialog>
  )
}

/* ─────────────────── Edit Tournament Dialog ──────────────── */

function EditTournamentDialog({ open, onClose, tournament, onSuccess }) {
  const [form, setForm] = useState({
    name:                 "",
    description:          "",
    rules:                "",
    prizePool:            0,
    bannerImage:          "",
    registrationDeadline: "",
    startDate:            "",
    endDate:              "",
  })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState("")

  // Reset form whenever tournament changes or dialog opens
  useEffect(() => {
    if (!open || !tournament) return
    setError("")
    setForm({
      name:                 tournament.name                ?? "",
      description:          tournament.description         ?? "",
      rules:                tournament.rules               ?? "",
      prizePool:            tournament.prizePool           ?? 0,
      bannerImage:          tournament.bannerImage         ?? "",
      registrationDeadline: toInputDate(tournament.registrationDeadline),
      startDate:            toInputDate(tournament.startDate),
      endDate:              toInputDate(tournament.endDate),
    })
  }, [open, tournament])

  const canEdit = ["draft", "upcoming"].includes(tournament?.status)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: name === "prizePool" ? Number(value) : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!form.registrationDeadline || !form.startDate || !form.endDate) {
      setError("All date fields are required"); return
    }
    if (new Date(form.registrationDeadline) >= new Date(form.startDate)) {
      setError("Registration deadline must be before start date"); return
    }
    if (new Date(form.startDate) >= new Date(form.endDate)) {
      setError("Start date must be before end date"); return
    }

    setLoading(true)
    try {
      const res  = await fetch(`/api/tournaments/${tournament._id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          name:                 form.name,
          description:          form.description,
          rules:                form.rules,
          prizePool:            form.prizePool,
          bannerImage:          form.bannerImage,
          registrationDeadline: form.registrationDeadline,
          startDate:            form.startDate,
          endDate:              form.endDate,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || "Failed to update"); return }
      toast.success("Tournament updated!")
      onSuccess?.()
      onClose()
    } catch { setError("Something went wrong") }
    finally { setLoading(false) }
  }

  const inputCls = "w-full px-3 py-2 bg-[#07080b] border border-[#1e2330] rounded text-[#d0d5df] placeholder-[#4e5d78] text-sm font-semibold focus:outline-none focus:border-[#ff6b00]/60 transition-colors"
  const labelCls = "block text-xs font-bold uppercase tracking-wider text-[#8090a0] mb-1.5"

  return (
    <Dialog open={open} onClose={onClose} title="✏ Edit Tournament" maxWidth="max-w-xl">
      {!canEdit ? (
        <div className="p-4 bg-[#07080b] border border-red-900/30 rounded-lg text-center space-y-2">
          <AlertTriangle className="w-6 h-6 text-red-400 mx-auto" />
          <p className="text-sm text-red-400 font-bold uppercase tracking-wider">
            Cannot edit — status: {tournament?.status}
          </p>
          <p className="text-xs text-[#4e5d78]">Only draft and upcoming tournaments can be edited.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Locked fields indicator */}
          <div className="flex flex-wrap gap-2 p-3 bg-[#07080b] border border-[#1e2330] rounded-lg">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 bg-[#ff6b00]/15 text-[#ff8c30] border border-[#ff6b00]/30 rounded">{tournament?.gameMode}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 bg-[#63b3ed]/10 text-[#63b3ed] border border-[#63b3ed]/25 rounded">{tournament?.teamMode}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 bg-[#5a6070]/10 text-[#5a6070] border border-[#5a6070]/25 rounded">🔒 Game mode locked</span>
          </div>

          <div>
            <label className={labelCls}>Tournament Name <span className="text-[#ff6b00]">*</span></label>
            <input name="name" value={form.name} onChange={handleChange} required className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} className={`${inputCls} resize-none`} />
          </div>

          <div>
            <label className={labelCls}>Prize Pool (₹)</label>
            <input type="number" name="prizePool" value={form.prizePool} onChange={handleChange} min="0" className={`${inputCls} text-green-400 font-['Orbitron'] font-bold`} />
          </div>

          <div>
            <label className={labelCls}>Registration Deadline <span className="text-[#ff6b00]">*</span></label>
            <input type="datetime-local" name="registrationDeadline" value={form.registrationDeadline} onChange={handleChange} required className={inputCls} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Start Date <span className="text-[#ff6b00]">*</span></label>
              <input type="datetime-local" name="startDate" value={form.startDate} onChange={handleChange} required className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>End Date <span className="text-[#ff6b00]">*</span></label>
              <input type="datetime-local" name="endDate" value={form.endDate} onChange={handleChange} required className={inputCls} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Rules</label>
            <textarea name="rules" value={form.rules} onChange={handleChange} rows={3} className={`${inputCls} resize-none`} />
          </div>

          <div>
            <label className={labelCls}>Banner Image URL</label>
            <input name="bannerImage" value={form.bannerImage} onChange={handleChange} placeholder="https://..." className={inputCls} />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" /> {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-gradient-to-r from-[#ff6b00] to-[#ff9a00] text-white font-bold text-xs uppercase tracking-widest rounded disabled:opacity-50 transition-all">
              {loading ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</span> : "✏ Save Changes"}
            </button>
            <button type="button" onClick={onClose} className="px-5 py-2.5 border border-[#2a2e3a] text-[#8090a0] hover:text-white font-bold text-xs uppercase tracking-widest rounded transition-all">
              Cancel
            </button>
          </div>
        </form>
      )}
    </Dialog>
  )
}

/* ─────────────────── Room Credentials Dialog ─────────────── */

function RoomCredentialsDialog({ open, onClose, tournament, onSuccess }) {
  const [roomId,       setRoomId]       = useState("")
  const [roomPassword, setRoomPassword] = useState("")
  const [loading,      setLoading]      = useState(false)

  useEffect(() => {
    if (!open) return
    setRoomId(tournament?.roomId ?? "")
    setRoomPassword(tournament?.roomPassword ?? "")
  }, [open, tournament])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!roomId.trim() || !roomPassword.trim()) { toast.error("Both Room ID and Password are required"); return }
    setLoading(true)
    try {
      const res  = await fetch(`/api/tournaments/${tournament._id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ roomId: roomId.trim(), roomPassword: roomPassword.trim() }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || "Failed to update"); return }
      toast.success("Room credentials published! 🔑")
      onSuccess?.()
      onClose()
    } catch { toast.error("Something went wrong") }
    finally { setLoading(false) }
  }

  const inputCls = "w-full px-3 py-2 bg-[#07080b] border border-[#1e2330] rounded text-[#d0d5df] placeholder-[#4e5d78] text-sm font-semibold focus:outline-none focus:border-[#ff6b00]/60 transition-colors font-['Orbitron'] tracking-widest"

  return (
    <Dialog open={open} onClose={onClose} title="🔑 Publish Room Credentials">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-4 bg-[#07080b] border border-[#ff9a00]/20 rounded-lg">
          <p className="text-xs text-[#ff9a00] font-bold uppercase tracking-wider">
            ⚠️ Credentials will be visible to all registered participants immediately.
          </p>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#8090a0] mb-2">Room ID</label>
          <input value={roomId} onChange={(e) => setRoomId(e.target.value)} placeholder="Enter room ID..." required className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#8090a0] mb-2">Room Password</label>
          <input value={roomPassword} onChange={(e) => setRoomPassword(e.target.value)} placeholder="Enter room password..." required className={inputCls} />
        </div>
        {tournament?.roomId && (
          <div className="p-3 bg-[#4ade80]/5 border border-[#4ade80]/20 rounded-lg">
            <p className="text-[11px] text-[#4ade80] font-bold uppercase tracking-wider">
              ✅ Already published — updating will overwrite existing credentials
            </p>
          </div>
        )}
        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-gradient-to-r from-[#ff6b00] to-[#ff9a00] text-white font-bold text-xs uppercase tracking-widest rounded disabled:opacity-50 transition-all">
            {loading ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Publishing...</span> : "🔑 Publish Credentials"}
          </button>
          <button type="button" onClick={onClose} className="px-5 py-2.5 border border-[#2a2e3a] text-[#8090a0] hover:text-white font-bold text-xs uppercase tracking-widest rounded transition-all">Cancel</button>
        </div>
      </form>
    </Dialog>
  )
}

/* ─────────────────── Match Results Dialog ────────────────── */

function MatchResultsDialog({ open, onClose, tournament, onSuccess }) {
  const [rich,     setRich]     = useState(null)
  const [fetching, setFetching] = useState(false)
  const [results,  setResults]  = useState([])
  const [loading,  setLoading]  = useState(false)

  // Always fetch fresh populated tournament so names are correct
  useEffect(() => {
    if (!open || !tournament?._id) return
    setFetching(true)
    fetch(`/api/tournaments/${tournament._id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setRich(d.tournament)
          const participants = d.tournament.participants ?? []
          setResults(participants.map((p, i) => ({
            playerId:  p.player?._id  ?? p.player,
            teamId:    p.team?._id    ?? p.team ?? null,
            name:      p.team?.teamName ?? p.player?.userId?.username ?? `Slot ${i + 1}`,
            placement: p.placement ?? "",
            kills:     p.kills     ?? 0,
            prize:     p.prize     ?? 0,
          })))
        }
      })
      .catch(() => {})
      .finally(() => setFetching(false))
  }, [open, tournament?._id])

  const update = (i, field, val) =>
    setResults((prev) => prev.map((r, idx) => idx === i ? { ...r, [field]: val } : r))

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate placements are filled
    const hasEmpty = results.some((r) => !r.placement)
    if (hasEmpty) { toast.error("Fill in placement for all participants"); return }

    setLoading(true)
    try {
      const res  = await fetch(`/api/tournaments/${tournament._id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          status:  "completed",
          results: results.map((r) => ({
            placement: Number(r.placement),
            player:    r.playerId,
            team:      r.teamId,
            kills:     Number(r.kills),
            prize:     Number(r.prize),
          })),
        }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || "Failed to submit results"); return }
      toast.success("Results submitted! Tournament marked completed. 🏆")
      onSuccess?.()
      onClose()
    } catch { toast.error("Something went wrong") }
    finally { setLoading(false) }
  }

  const inputCls = "w-full px-2 py-1.5 bg-[#07080b] border border-[#1e2330] rounded text-[#d0d5df] text-xs font-bold focus:outline-none focus:border-[#ff6b00]/60 font-['Orbitron']"

  return (
    <Dialog open={open} onClose={onClose} title="📊 Submit Match Results" maxWidth="max-w-2xl">
      {fetching ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-[#ff6b00]" />
          <span className="ml-2 text-xs text-[#4e5d78] uppercase tracking-widest font-bold">Loading participants...</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3 bg-[#07080b] border border-[#63b3ed]/20 rounded-lg">
            <p className="text-xs text-[#63b3ed] font-bold uppercase tracking-wider">
              ℹ️ Submitting marks the tournament completed and auto-updates all player stats.
            </p>
          </div>

          {results.length === 0 ? (
            <div className="text-center py-10 text-[#4e5d78] text-sm font-bold uppercase tracking-wider">
              No participants registered yet
            </div>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-2 px-3 py-1">
                {["Team / Player", "Placement #", "Kills", "Prize (₹)"].map((h, i) => (
                  <span key={i} className={`text-[10px] text-[#4e5d78] uppercase tracking-wider font-bold ${i === 0 ? "col-span-4" : i === 1 ? "col-span-3" : i === 2 ? "col-span-2" : "col-span-3"}`}>{h}</span>
                ))}
              </div>
              {results.map((r, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center p-3 bg-[#07080b] border border-[#1e2330] rounded-lg">
                  <div className="col-span-4">
                    <p className="text-xs font-bold text-[#d0d5df] truncate">{r.name}</p>
                  </div>
                  <div className="col-span-3">
                    <input type="number" min="1" max={results.length} placeholder="#" value={r.placement} onChange={(e) => update(i, "placement", e.target.value)} className={inputCls} required />
                  </div>
                  <div className="col-span-2">
                    <input type="number" min="0" value={r.kills} onChange={(e) => update(i, "kills", e.target.value)} className={inputCls} />
                  </div>
                  <div className="col-span-3">
                    <input type="number" min="0" value={r.prize} onChange={(e) => update(i, "prize", e.target.value)} className={inputCls} />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading || results.length === 0} className="flex-1 py-2.5 bg-gradient-to-r from-[#ff6b00] to-[#ff9a00] text-white font-bold text-xs uppercase tracking-widest rounded disabled:opacity-50 transition-all">
              {loading ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Submitting...</span> : "📊 Submit Results"}
            </button>
            <button type="button" onClick={onClose} className="px-5 py-2.5 border border-[#2a2e3a] text-[#8090a0] hover:text-white font-bold text-xs uppercase tracking-widest rounded transition-all">Cancel</button>
          </div>
        </form>
      )}
    </Dialog>
  )
}

/* ──────────────────── Main Tournament Card ───────────────── */

export function TournamentCard({ tournament: initialTournament, onJoinSuccess }) {
  const ctx = useContext(MyContext)

  const [tournament,    setTournament]    = useState(initialTournament)
  const [showJoin,      setShowJoin]      = useState(false)
  const [showPaidJoin,  setShowPaidJoin]  = useState(false)
  const [showDetails,   setShowDetails]   = useState(false)
  const [showEdit,      setShowEdit]      = useState(false)
  const [showRoomCreds, setShowRoomCreds] = useState(false)
  const [showResults,   setShowResults]   = useState(false)
  const [showStatus,    setShowStatus]    = useState(false)
  const [showOrgMenu,   setShowOrgMenu]   = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const menuBtnRef = useRef(null)

  const currentUser   = ctx?.user
  const currentPlayer = ctx?.player
  const userRole      = currentUser?.role
  const isPrivileged  = ["admin", "moderator"].includes(userRole)

  // Fix: compare organizer._id (Mongo ObjectId) vs user._id (Mongo ObjectId)
  // Both come from the DB so both are hex strings once serialised via .lean()
  const organizerId = tournament?.organizer?._id ?? tournament?.organizer
  const currentMongoId = currentUser?._id ?? currentUser?.mongoId   // however your context exposes it
  const isOrganizer = organizerId && currentMongoId &&
    organizerId.toString() === currentMongoId.toString()

  const canManage = isOrganizer || isPrivileged

  // Detect if current player already joined
  const currentPlayerId = String(currentPlayer?._id ?? "")
  const hasJoined = currentPlayerId
    ? tournament?.participants?.some((p) => {
        const pid = String(p.player?._id ?? p.player ?? "")
        return pid === currentPlayerId
      })
    : false

  const filledSlots = tournament?.filledSlots ?? 0
  const totalSlots  = tournament?.totalSlots  ?? 0
  const fillPct     = totalSlots > 0 ? Math.round((filledSlots / totalSlots) * 100) : 0
  const isFull      = filledSlots >= totalSlots
  const isPaid      = tournament?.tournamentType === "paid"
  const startLabel  = formatDate(tournament?.startDate)
  const canJoin     = !hasJoined && !isFull && tournament?.status === "upcoming"
  const nextStatuses = STATUS_TRANSITIONS[tournament?.status] ?? []

  const refreshTournament = useCallback(async () => {
    try {
      const res  = await fetch(`/api/tournaments/${tournament._id}`)
      const data = await res.json()
      if (res.ok && data.success) setTournament(data.tournament)
    } catch {}
    onJoinSuccess?.()
  }, [tournament._id, onJoinSuccess])

  const handleDelete = async () => {
    setDeleteLoading(true)
    setShowOrgMenu(false)
    try {
      const res  = await fetch(`/api/tournaments/${tournament._id}`, { method: "DELETE" })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || "Failed to delete"); return }
      toast.success("Tournament deleted")
      onJoinSuccess?.()
    } catch { toast.error("Something went wrong") }
    finally { setDeleteLoading(false) }
  }

  const openJoin = () => {
    if (isPaid) setShowPaidJoin(true)
    else        setShowJoin(true)
  }

  const menuItems = [
    {
      icon:   <Edit className="w-3.5 h-3.5" />,
      label:  "Edit Tournament",
      color:  "text-[#8090a0] hover:text-white",
      action: () => { setShowOrgMenu(false); setShowEdit(true) },
    },
    {
      icon:   <Zap className="w-3.5 h-3.5" />,
      label:  "Change Status",
      color:  "text-[#63b3ed] hover:text-[#93c5fd]",
      badge:  nextStatuses.length > 0 ? `${nextStatuses.length} option${nextStatuses.length > 1 ? "s" : ""}` : null,
      action: () => { setShowOrgMenu(false); setShowStatus(true) },
    },
    {
      icon:   <Key className="w-3.5 h-3.5" />,
      label:  "Publish Room Creds",
      color:  "text-[#4ade80] hover:text-[#6aee9f]",
      action: () => { setShowOrgMenu(false); setShowRoomCreds(true) },
    },
    {
      icon:   <BarChart2 className="w-3.5 h-3.5" />,
      label:  "Submit Results",
      color:  "text-[#ffaa00] hover:text-[#ffc14d]",
      action: () => { setShowOrgMenu(false); setShowResults(true) },
    },
    {
      icon:    <Trash2 className="w-3.5 h-3.5" />,
      label:   "Delete Tournament",
      color:   "text-red-400 hover:text-red-300",
      danger:  true,
      action:  handleDelete,
    },
  ]

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Orbitron:wght@700;900&display=swap');`}</style>

      <div
        data-card-root
        className="relative w-full bg-[#0a0c10] border border-[#2a2e3a] rounded-xl font-['Rajdhani']"
        style={{ boxShadow: "0 0 30px rgba(255,107,0,0.04)" }}
      >
        {/* Corner brackets */}
        {["top-0 left-0 border-t-2 border-l-2 rounded-tl-xl","top-0 right-0 border-t-2 border-r-2 rounded-tr-xl","bottom-0 left-0 border-b-2 border-l-2 rounded-bl-xl","bottom-0 right-0 border-b-2 border-r-2 rounded-br-xl"].map((cls, i) => (
          <div key={i} className={`pointer-events-none absolute z-10 w-3 h-3 ${cls} border-[#ff6b00]`} />
        ))}

        {/* ── Header ──────────────────────────────────────── */}
        <div className="relative overflow-hidden px-5 pt-5 pb-4 bg-gradient-to-br from-[#0f1318] via-[#1a1f2e] to-[#0f1318] border-b border-[#1e2330] rounded-t-xl">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#ff6b00] to-transparent pointer-events-none" />
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(255,107,0,0.08) 0%, transparent 70%)" }} />

          <div className="flex items-start justify-between mb-3">
            <div className="flex flex-wrap gap-1.5">
              <span className="text-[10px] font-bold tracking-wider px-2.5 py-0.5 rounded uppercase bg-[#ff6b00]/15 text-[#ff8c30] border border-[#ff6b00]/30">{tournament?.gameMode}</span>
              <span className="text-[10px] font-bold tracking-wider px-2.5 py-0.5 rounded uppercase bg-[#63b3ed]/10 text-[#63b3ed] border border-[#63b3ed]/25">{tournament?.teamMode}</span>
              <span className={`text-[10px] font-bold tracking-wider px-2.5 py-0.5 rounded uppercase border ${isPaid ? "bg-[#edb438]/10 text-[#edb438] border-[#edb438]/30" : "bg-[#4ade80]/10 text-[#4ade80] border-[#4ade80]/20"}`}>
                {isPaid ? `₹${tournament?.entryFee} Entry` : "Free"}
              </span>
              <StatusBadge status={tournament?.status} />
            </div>

            {canManage && (
              <button
                ref={menuBtnRef}
                onClick={() => setShowOrgMenu((p) => !p)}
                className="relative z-20 p-1.5 rounded text-[#4e5d78] hover:text-[#ff8c30] hover:bg-[#ff6b00]/5 transition-all flex-shrink-0"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex justify-between items-start gap-4">
            <h4 className="font-['Orbitron'] text-base font-bold text-[#f0f2f5] tracking-wide leading-tight [text-shadow:0_0_15px_rgba(255,107,0,0.2)]">
              {tournament?.name}
            </h4>
            <div className="text-right flex-shrink-0">
              <p className="font-['Orbitron'] text-xl font-black bg-gradient-to-br from-[#ff8c00] to-[#ffcc00] bg-clip-text text-transparent leading-none">
                ₹{tournament?.prizePool?.toLocaleString() ?? 0}
              </p>
              <p className="text-[10px] text-[#5a6070] tracking-widest uppercase mt-0.5">Prize Pool</p>
            </div>
          </div>
        </div>

        {/* ── Stats row ───────────────────────────────────── */}
        <div className="grid grid-cols-3 border-b border-[#1e2330]">
          {[
            { label: "Players",  value: tournament?.totalPlayers ?? 0 },
            { label: "Starting", value: startLabel },
            { label: "Slots",    value: isFull ? "Full 🔒" : `${totalSlots - filledSlots} left`, accent: isFull },
          ].map((s, i) => (
            <div key={i} className={`relative px-4 py-3 ${i < 2 ? "after:content-[''] after:absolute after:right-0 after:top-[20%] after:bottom-[20%] after:w-px after:bg-[#1e2330]" : ""}`}>
              <p className="text-[11px] text-[#4a5060] uppercase tracking-widest mb-1">{s.label}</p>
              <p className={`text-sm font-bold ${s.accent ? "text-red-400" : "text-[#d0d5df]"}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* ── Progress bar ────────────────────────────────── */}
        <div className="px-5 py-3 bg-[#0c0e14] border-b border-[#1e2330]">
          <div className="h-1.5 bg-[#1e2330] rounded-full overflow-hidden mb-1.5">
            <div className="h-full bg-gradient-to-r from-[#ff6b00] to-[#ffb300] rounded-full transition-all duration-500" style={{ width: `${fillPct}%` }} />
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-[#ff8c30] font-bold">{filledSlots} / {totalSlots} slots filled</span>
            <span className="text-[#4e5d78]">{fillPct}%</span>
          </div>
        </div>

        {/* ── Action buttons ───────────────────────────────── */}
        <div className="flex gap-2.5 p-4 bg-[#0a0c10] rounded-b-xl">
          <button
            onClick={() => canJoin && openJoin()}
            disabled={!canJoin}
            className={`flex-1 py-2.5 text-sm font-bold tracking-wider uppercase rounded transition-all
              ${hasJoined
                ? "bg-[#4ade80]/10 border border-[#4ade80]/30 text-[#4ade80] cursor-not-allowed"
                : canJoin
                  ? isPaid
                    ? "bg-gradient-to-br from-[#edb438] to-[#ff9a00] text-black shadow-[0_4px_15px_rgba(255,154,0,0.3)] hover:-translate-y-0.5"
                    : "bg-gradient-to-br from-[#ff6b00] to-[#ff9a00] text-white shadow-[0_4px_15px_rgba(255,107,0,0.3)] hover:-translate-y-0.5"
                  : "bg-[#1e2330] text-[#4e5d78] cursor-not-allowed"
              }`}
          >
            {hasJoined
              ? <span className="flex items-center justify-center gap-2"><CheckCircle2 className="w-4 h-4" /> Joined</span>
              : isFull
                ? "🔒 Full"
                : tournament?.status !== "upcoming"
                  ? tournament?.status === "ongoing" ? "🔴 Ongoing" : "–"
                  : isPaid
                    ? `💳 Pay ₹${tournament?.entryFee} & Join`
                    : "⚔ Join Free"}
          </button>

          <button
            onClick={() => setShowDetails(true)}
            className="px-4 py-2.5 rounded border border-[#2a2e3a] text-[#8090a0] text-sm font-semibold tracking-wider uppercase hover:border-[#ff6b00]/30 hover:text-[#ff8c30] hover:bg-[#ff6b00]/5 transition-all"
            title="View Details"
          >
            <Users className="w-4 h-4" />
          </button>

          <button
            onClick={refreshTournament}
            className="px-3 py-2.5 rounded border border-[#2a2e3a] text-[#4e5d78] hover:text-[#8090a0] transition-all"
            title="Refresh"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ── Organizer dropdown menu ─────────────────────── */}
        {showOrgMenu && canManage && (
          <>
            <div className="fixed inset-0 z-[9998]" onClick={() => setShowOrgMenu(false)} />
            <div className="absolute z-[9999] w-56 bg-[#0d0f15] border border-[#2a2e3a] rounded-lg shadow-[0_8px_32px_rgba(0,0,0,0.9)] overflow-hidden"
              style={{ top: 52, right: 12 }}
            >
              <div className="h-[1px] bg-gradient-to-r from-transparent via-[#ff6b00]/50 to-transparent" />
              <div className="px-3 py-2 border-b border-[#1e2330]">
                <p className="text-[9px] font-bold uppercase tracking-widest text-[#4e5d78]">Organizer Actions</p>
              </div>
              {menuItems.map((item, i) => (
                <button
                  key={i}
                  onClick={item.action}
                  disabled={deleteLoading && item.danger}
                  className={`w-full flex items-center justify-between px-4 py-3 text-xs font-bold uppercase tracking-wider ${item.color} hover:bg-[#1a1f2e] transition-colors disabled:opacity-50 ${item.danger ? "border-t border-[#1e2330]" : ""}`}
                >
                  <span className="flex items-center gap-2.5">{item.icon} {item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] px-1.5 py-0.5 bg-[#63b3ed]/20 text-[#63b3ed] rounded font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Dialogs (portaled into body) ────────────────────── */}
      <JoinDialog
        open={showJoin}
        onClose={() => setShowJoin(false)}
        tournament={tournament}
        onSuccess={refreshTournament}
      />
      <RazorpayJoinDialog
        open={showPaidJoin}
        onClose={() => setShowPaidJoin(false)}
        tournament={tournament}
        onSuccess={refreshTournament}
      />
      <ViewDetailsDialog
        open={showDetails}
        onClose={() => setShowDetails(false)}
        tournament={tournament}
      />
      <EditTournamentDialog
        open={showEdit}
        onClose={() => setShowEdit(false)}
        tournament={tournament}
        onSuccess={refreshTournament}
      />
      <RoomCredentialsDialog
        open={showRoomCreds}
        onClose={() => setShowRoomCreds(false)}
        tournament={tournament}
        onSuccess={refreshTournament}
      />
      <MatchResultsDialog
        open={showResults}
        onClose={() => setShowResults(false)}
        tournament={tournament}
        onSuccess={refreshTournament}
      />
      <StatusDialog
        open={showStatus}
        onClose={() => setShowStatus(false)}
        tournament={tournament}
        isPrivileged={isPrivileged}
        onSuccess={refreshTournament}
      />
    </>
  )
}