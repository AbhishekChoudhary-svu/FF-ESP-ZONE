"use client"

import { useCallback, useContext, useRef, useState } from "react"
import {
  BarChart2, Edit, Key, MoreVertical, RefreshCw,
  Trash2, Users, CheckCircle2, Zap,
} from "lucide-react"
import toast from "react-hot-toast"
import MyContext from "@/context/ThemeProvider"


import {StatusBadge, formatDate, STATUS_TRANSITIONS} from "./shared/Shared"
import RazorpayJoinDialog from "./dialogs/RazorpayJoinDialog"
import { StatusDialog } from "./dialogs/Statusdialog"
import { MatchResultsDialog } from "./dialogs/Matchresultsdialog"
import { EditTournamentDialog, RoomCredentialsDialog } from "./dialogs/Managedialogs"
import { JoinDialog } from "./dialogs/Joindialog"
import { ViewDetailsDialog } from "./dialogs/Viewdetailsdialog"




/* ─────────────────────────────────────────────────────────────
   ORGANIZER DROPDOWN MENU
───────────────────────────────────────────────────────────── */

function OrgMenu({ items, onClose, deleteLoading }) {
  return (
    <>
      {/* backdrop */}
      <div className="fixed inset-0 z-[9998]" onClick={onClose} />

      <div
        className="absolute z-[9999] w-56 bg-[#0d0f15] border border-[#2a2e3a] rounded-lg shadow-[0_8px_32px_rgba(0,0,0,0.9)] overflow-hidden"
        style={{ top: 52, right: 12 }}
      >
        <div className="h-[1px] bg-gradient-to-r from-transparent via-[#ff6b00]/50 to-transparent" />
        <div className="px-3 py-2 border-b border-[#1e2330]">
          <p className="text-[9px] font-bold uppercase tracking-widest text-[#4e5d78]">Organizer Actions</p>
        </div>

        {items.map((item, i) => (
          <button
            key={i}
            onClick={item.action}
            disabled={deleteLoading && item.danger}
            className={`
              w-full flex items-center justify-between px-4 py-3
              text-xs font-bold uppercase tracking-wider
              ${item.color} hover:bg-[#1a1f2e] transition-colors
              disabled:opacity-50
              ${item.danger ? "border-t border-[#1e2330]" : ""}
            `}
          >
            <span className="flex items-center gap-2.5">
              {item.icon}
              {item.label}
            </span>
            {item.badge && (
              <span className="text-[9px] px-1.5 py-0.5 bg-[#63b3ed]/20 text-[#63b3ed] rounded font-bold">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    </>
  )
}

/* ─────────────────────────────────────────────────────────────
   TOURNAMENT CARD
───────────────────────────────────────────────────────────── */

export function TournamentCard({ tournament: initialTournament, onJoinSuccess }) {
  const ctx = useContext(MyContext)

  /* ── local state ── */
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

  /* ── auth / role ── */
  const currentUser   = ctx?.user
  const currentPlayer = ctx?.player
  const userRole      = currentUser?.role
  const isPrivileged  = ["admin", "moderator"].includes(userRole)

  // Compare Mongo _id strings (organizer stored as ObjectId, user._id same)
  const organizerId    = tournament?.organizer?._id ?? tournament?.organizer
  const currentMongoId = currentUser?._id ?? currentUser?.mongoId
  const isOrganizer    = !!(organizerId && currentMongoId &&
    organizerId.toString() === currentMongoId.toString())

  const canManage = isOrganizer || isPrivileged

  /* ── derived values ── */
  const filledSlots = tournament?.filledSlots ?? 0
  const totalSlots  = tournament?.totalSlots  ?? 0
  const fillPct     = totalSlots > 0 ? Math.round((filledSlots / totalSlots) * 100) : 0
  const isFull      = filledSlots >= totalSlots
  const isPaid      = tournament?.tournamentType === "paid"
  const canJoin     = !isFull && tournament?.status === "upcoming"

  // Has the current player already joined?
  const currentPlayerId = String(currentPlayer?._id ?? "")
  const hasJoined = !!currentPlayerId && tournament?.participants?.some(
    (p) => String(p.player?._id ?? p.player ?? "") === currentPlayerId
  )

  const nextStatuses = STATUS_TRANSITIONS[tournament?.status] ?? []

  /* ── handlers ── */
  const refreshTournament = useCallback(async () => {
    try {
      const res  = await fetch(`/api/tournaments/${tournament._id}`)
      const data = await res.json()
      if (res.ok && data.success) setTournament(data.tournament)
    } catch {}
    onJoinSuccess?.()
  }, [tournament._id, onJoinSuccess])

  const openJoin = () => {
    if (!currentPlayer) {
      toast.error("You need a player profile to join a tournament")
      return
    }
    if (isPaid) setShowPaidJoin(true)
    else        setShowJoin(true)
  }

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Delete "${tournament.name}"? This cannot be undone.`
    )
    if (!confirmed) return

    setDeleteLoading(true)
    setShowOrgMenu(false)
    try {
      const res  = await fetch(`/api/tournaments/${tournament._id}`, { method: "DELETE" })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || "Failed to delete"); return }
      toast.success("Tournament deleted")
      onJoinSuccess?.()
    } catch {
      toast.error("Something went wrong")
    } finally {
      setDeleteLoading(false)
    }
  }

  /* ── menu items ── */
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
      badge:  nextStatuses.length > 0
        ? `${nextStatuses.length} option${nextStatuses.length > 1 ? "s" : ""}`
        : null,
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
      icon:   <Trash2 className="w-3.5 h-3.5" />,
      label:  "Delete Tournament",
      color:  "text-red-400 hover:text-red-300",
      danger: true,
      action: handleDelete,
    },
  ]

  /* ── join button label ── */
  const joinLabel = hasJoined
    ? <span className="flex items-center justify-center gap-2"><CheckCircle2 className="w-4 h-4" /> Joined</span>
    : isFull
      ? "🔒 Full"
      : tournament?.status === "ongoing"  ? "🔴 Ongoing"
      : tournament?.status !== "upcoming" ? "—"
      : isPaid ? `💳 Pay ₹${tournament?.entryFee} & Join`
               : "⚔ Join Free"

  const joinCls = hasJoined
    ? "bg-[#4ade80]/10 border border-[#4ade80]/30 text-[#4ade80] cursor-not-allowed"
    : !canJoin
      ? "bg-[#1e2330] text-[#4e5d78] cursor-not-allowed"
      : isPaid
        ? "bg-gradient-to-br from-[#edb438] to-[#ff9a00] text-black shadow-[0_4px_15px_rgba(255,154,0,0.3)] hover:-translate-y-0.5"
        : "bg-gradient-to-br from-[#ff6b00] to-[#ff9a00] text-white shadow-[0_4px_15px_rgba(255,107,0,0.3)] hover:-translate-y-0.5"

  /* ── render ── */
  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Orbitron:wght@700;900&display=swap');`}</style>

      <div
        data-card-root
        className="relative w-full bg-[#0a0c10] border border-[#2a2e3a] rounded-xl font-['Rajdhani']"
        style={{ boxShadow: "0 0 30px rgba(255,107,0,0.04)" }}
      >
        {/* corner brackets */}
        {[
          "top-0 left-0   border-t-2 border-l-2 rounded-tl-xl",
          "top-0 right-0  border-t-2 border-r-2 rounded-tr-xl",
          "bottom-0 left-0  border-b-2 border-l-2 rounded-bl-xl",
          "bottom-0 right-0 border-b-2 border-r-2 rounded-br-xl",
        ].map((cls, i) => (
          <div key={i} className={`pointer-events-none absolute z-10 w-3 h-3 ${cls} border-[#ff6b00]`} />
        ))}

        {/* ── HEADER ──────────────────────────────────────── */}
        <div className="relative overflow-hidden px-5 pt-5 pb-4 bg-gradient-to-br from-[#0f1318] via-[#1a1f2e] to-[#0f1318] border-b border-[#1e2330] rounded-t-xl">
          {/* glow line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#ff6b00] to-transparent pointer-events-none" />
          {/* radial glow */}
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(255,107,0,0.08) 0%, transparent 70%)" }} />

          {/* badges row */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex flex-wrap gap-1.5">
              <span className="text-[10px] font-bold tracking-wider px-2.5 py-0.5 rounded uppercase bg-[#ff6b00]/15 text-[#ff8c30] border border-[#ff6b00]/30">
                {tournament?.gameMode}
              </span>
              <span className="text-[10px] font-bold tracking-wider px-2.5 py-0.5 rounded uppercase bg-[#63b3ed]/10 text-[#63b3ed] border border-[#63b3ed]/25">
                {tournament?.teamMode}
              </span>
              <span className={`text-[10px] font-bold tracking-wider px-2.5 py-0.5 rounded uppercase border ${
                isPaid
                  ? "bg-[#edb438]/10 text-[#edb438] border-[#edb438]/30"
                  : "bg-[#4ade80]/10 text-[#4ade80] border-[#4ade80]/20"
              }`}>
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

          {/* title + prize */}
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

        {/* ── STATS ROW ────────────────────────────────────── */}
        <div className="grid grid-cols-3 border-b border-[#1e2330]">
          {[
            { label: "Players",  value: tournament?.totalPlayers ?? 0 },
            { label: "Starting", value: formatDate(tournament?.startDate) },
            { label: "Slots",    value: isFull ? "Full 🔒" : `${totalSlots - filledSlots} left`, accent: isFull },
          ].map((s, i) => (
            <div
              key={i}
              className={`relative px-4 py-3 ${i < 2
                ? "after:content-[''] after:absolute after:right-0 after:top-[20%] after:bottom-[20%] after:w-px after:bg-[#1e2330]"
                : ""}`}
            >
              <p className="text-[11px] text-[#4a5060] uppercase tracking-widest mb-1">{s.label}</p>
              <p className={`text-sm font-bold ${s.accent ? "text-red-400" : "text-[#d0d5df]"}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* ── PROGRESS BAR ─────────────────────────────────── */}
        <div className="px-5 py-3 bg-[#0c0e14] border-b border-[#1e2330]">
          <div className="h-1.5 bg-[#1e2330] rounded-full overflow-hidden mb-1.5">
            <div
              className="h-full bg-gradient-to-r from-[#ff6b00] to-[#ffb300] rounded-full transition-all duration-500"
              style={{ width: `${fillPct}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-[#ff8c30] font-bold">{filledSlots} / {totalSlots} slots filled</span>
            <span className="text-[#4e5d78]">{fillPct}%</span>
          </div>
        </div>

        {/* ── ACTION BUTTONS ───────────────────────────────── */}
        <div className="flex gap-2.5 p-4 bg-[#0a0c10] rounded-b-xl">
          {/* join / status button */}
          <button
            onClick={() => (canJoin && !hasJoined) ? openJoin() : undefined}
            disabled={!canJoin || hasJoined}
            className={`flex-1 py-2.5 text-sm font-bold tracking-wider uppercase rounded transition-all ${joinCls}`}
          >
            {joinLabel}
          </button>

          {/* view details */}
          <button
            onClick={() => setShowDetails(true)}
            className="px-4 py-2.5 rounded border border-[#2a2e3a] text-[#8090a0] text-sm font-semibold tracking-wider uppercase hover:border-[#ff6b00]/30 hover:text-[#ff8c30] hover:bg-[#ff6b00]/5 transition-all"
            title="View Details"
          >
            <Users className="w-4 h-4" />
          </button>

          {/* refresh */}
          <button
            onClick={refreshTournament}
            className="px-3 py-2.5 rounded border border-[#2a2e3a] text-[#4e5d78] hover:text-[#8090a0] transition-all"
            title="Refresh"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ── ORGANIZER DROPDOWN ───────────────────────────── */}
        {showOrgMenu && canManage && (
          <OrgMenu
            items={menuItems}
            onClose={() => setShowOrgMenu(false)}
            deleteLoading={deleteLoading}
          />
        )}
      </div>

      {/* ── DIALOGS (portaled into document.body) ─────────── */}
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