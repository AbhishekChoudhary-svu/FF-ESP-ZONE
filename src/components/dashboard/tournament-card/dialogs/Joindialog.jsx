"use client"

import { useContext, useState } from "react"
import { Loader2 } from "lucide-react"
import toast from "react-hot-toast"
import MyContext from "@/context/ThemeProvider"
import { Dialog, formatDate, cls } from "../shared/Shared"

const UPI_RE = /^[\w.\-]{2,}@[\w]{2,}$/

export function JoinDialog({ open, onClose, tournament, onSuccess }) {
  const ctx    = useContext(MyContext)
  const [loading, setLoading] = useState(false)
  const [upiId, setUpiId]     = useState(ctx?.player?.upiId ?? "")
  const [upiError, setUpiError] = useState("")

  const teamMode = tournament?.teamMode
  const isSquad  = teamMode === "Squad"
  const isDuo    = teamMode === "Duo"

  const player  = ctx?.player
  const members = ctx?.team?.players ?? []

  const joiningMembers = isSquad
    ? members.slice(0, 4)
    : isDuo
    ? members.slice(0, 2)
    : [player]

  const validateUpi = (val) => {
    if (!val.trim()) return "UPI ID is required to receive prize money"
    if (!UPI_RE.test(val.trim())) return "Invalid format — try yourname@upi or 9876543210@paytm"
    return ""
  }

  const handleJoin = async () => {
    const err = validateUpi(upiId)
    if (err) { setUpiError(err); return }
    setUpiError("")
    setLoading(true)

    try {
      // 1. Save UPI ID to player profile
      const upiRes = await fetch("/api/players/upi", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ upiId: upiId.trim() }),
      })
      const upiData = await upiRes.json()
      if (!upiRes.ok) { toast.error(upiData.error || "Failed to save UPI ID"); return }

      // 2. Join the tournament
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
    } catch {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title={`⚔ Join — ${tournament?.name}`}>
      <div className="space-y-5">

        {/* stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Mode",  value: `${tournament?.gameMode} ${tournament?.teamMode}`, color: "text-[#63b3ed]"  },
            { label: "Prize", value: `₹${tournament?.prizePool?.toLocaleString() ?? 0}`, color: "text-green-400" },
            { label: "Entry", value: "Free",                                              color: "text-[#4ade80]"  },
          ].map((s, i) => (
            <div key={i} className="p-3 bg-[#07080b] border border-[#1e2330] rounded-lg text-center">
              <p className="text-[10px] text-[#4e5d78] uppercase tracking-wider font-bold mb-1">{s.label}</p>
              <p className={`text-sm font-black font-['Orbitron'] ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* members */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#4e5d78] mb-3">
            ◆ {isSquad ? "Squad Members Joining" : isDuo ? "Duo Members Joining" : "Joining As"}
          </p>
          <div className="space-y-2">
            {joiningMembers.length > 0 ? joiningMembers.map((m, i) => (
              <MemberRow key={i} member={m} isLead={i === 0} />
            )) : (
              <div className="p-4 bg-[#07080b] border border-red-900/30 rounded-lg text-center">
                <p className="text-sm text-red-400 font-bold">
                  {isSquad || isDuo ? "Your team needs more members" : "No player profile found"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── UPI ID ── */}
        <div className="p-4 bg-[#07080b] border border-[#1e2330] rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#4e5d78]">
              ◆ Prize Payout UPI ID
            </p>
            <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 bg-red-900/10 border border-red-900/20 text-red-400 rounded">
              Required
            </span>
          </div>
          <p className="text-[11px] text-[#4e5d78]">
            {isSquad || isDuo
              ? "Prize money will be sent to the captain's UPI ID if your team wins."
              : "Prize money will be sent to this UPI ID if you win."}
          </p>
          <input
            type="text"
            value={upiId}
            onChange={(e) => { setUpiId(e.target.value); setUpiError("") }}
            onBlur={() => setUpiError(validateUpi(upiId))}
            placeholder="yourname@upi  or  9876543210@paytm"
            className={`w-full bg-[#030405] border rounded-lg px-3 py-2.5 text-[13px] font-mono text-[#d0d5df] placeholder-[#2a2e3a] outline-none transition-colors ${
              upiError
                ? "border-red-500/50 focus:border-red-400"
                : "border-[#2a2e3a] focus:border-[#5f2eea]"
            }`}
          />
          {upiError
            ? <p className="text-[11px] text-red-400">{upiError}</p>
            : <p className="text-[11px] text-[#4e5d78]">
                Format: <span className="text-[#a78bfa]">name@bankhandle</span> or <span className="text-[#a78bfa]">mobile@upi</span>
              </p>
          }
        </div>

        {/* deadline */}
        {tournament?.registrationDeadline && (
          <div className="p-3 bg-[#ff9a00]/5 border border-[#ff9a00]/20 rounded-lg">
            <p className="text-[11px] text-[#ff9a00] font-bold uppercase tracking-wider">
              ⏱ Registration closes: {formatDate(tournament.registrationDeadline)}
            </p>
          </div>
        )}

        {/* actions */}
        <div className="flex gap-3">
          <button
            onClick={handleJoin}
            disabled={loading || joiningMembers.length === 0}
            className={cls.btnPrimary}
          >
            {loading
              ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Joining...</span>
              : "⚔ Confirm Join"}
          </button>
          <button onClick={onClose} className={cls.btnGhost}>Cancel</button>
        </div>

      </div>
    </Dialog>
  )
}

export function MemberRow({ member: m, isLead = false }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-[#07080b] border border-[#1e2330] rounded-lg">
      <div className="w-8 h-8 rounded-lg overflow-hidden border border-[#2a2e3a] bg-[#1a1f2e] flex items-center justify-center flex-shrink-0">
        {m?.avatar
          ? <img src={m.avatar} className="w-full h-full object-cover" alt="" />
          : <span className="text-xs font-black text-[#ff8c30]">{m?.userId?.username?.charAt(0) ?? "?"}</span>
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-[#d0d5df] truncate">{m?.userId?.username ?? "Unknown"}</p>
        <p className="text-[11px] text-[#4e5d78]">
          {m?.inGameRole}{m?.isCaptain ? " • Captain" : ""}
        </p>
      </div>
      {isLead && (
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[#ff6b00]/10 border border-[#ff6b00]/20 text-[#ff8c30] rounded flex-shrink-0">
          Lead
        </span>
      )}
    </div>
  )
}