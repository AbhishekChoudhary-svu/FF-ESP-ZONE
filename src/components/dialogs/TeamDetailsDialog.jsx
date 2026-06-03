

import { X } from "lucide-react"
import {
  DarkDialog,
  GhostBtn,
  StatCell,
  labelCls,
} from "../shared/primitives"

export function TeamDetailsDialog({
  open,
  onOpenChange,
  team,
  currentPlayerId,
  isCaptain,
  isLeaving,
  onLeave,
  onKick,
  onDisband,
  onOpenJoinRequests,
}) {
  if (!team) return null

  return (
    <DarkDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`${team.teamName} — Team Info`}
    >
      <div className="space-y-5">

        {/* Logo + key stats */}
        <div className="flex gap-5 items-center">
          <TeamLogo team={team} />
          <div className="grid grid-cols-2 gap-x-8 gap-y-2">
            <StatCell label="Team Name" value={team.teamName} accent />
            <StatCell label="Tag"       value={team.tag} />
            <StatCell label="Region"    value={team.region} />
            <StatCell label="Tier"      value={team.tier} />
            <StatCell label="Captain"   value={team.teamCaptain?.userId?.username || "N/A"} />
            <StatCell label="Status"    value={team.status} />
          </div>
        </div>

        {/* Members */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className={labelCls}>Team Members ({team.players?.length ?? 0})</span>
            {isCaptain && (
              <button
                onClick={onOpenJoinRequests}
                className="text-[11px] text-[#ff8c30] uppercase tracking-wider hover:text-[#ffb300] transition"
              >
                + Requests
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            {team.players?.length > 0 ? (
              team.players.map((member) => (
                <MemberRow
                  key={member._id}
                  member={member}
                  isCaptain={isCaptain}
                  isCurrentPlayer={String(member._id) === String(currentPlayerId)}
                  onKick={() => onKick(member._id)}
                />
              ))
            ) : (
              <p className="text-[13px] text-[#4a5060]">No members yet</p>
            )}
          </div>
        </div>

        {/* Disband / Leave */}
        {isCaptain ? (
          <GhostBtn
            onClick={onDisband}
            className="w-full text-red-400 hover:text-red-400 hover:border-red-500/40"
          >
            💀 Disband Team
          </GhostBtn>
        ) : (
          <GhostBtn onClick={onLeave} disabled={isLeaving} className="w-full">
            {isLeaving ? "Leaving…" : "🚪 Leave Team"}
          </GhostBtn>
        )}
      </div>
    </DarkDialog>
  )
}

/* ── Inner helpers ─────────────────────────────────────────── */

function TeamLogo({ team }) {
  return team.logo ? (
    <img
      src={team.logo}
      alt={team.teamName}
      className="w-20 h-20 rounded-xl object-cover border-2 border-[#ff6b00]/40 shadow-[0_0_16px_rgba(255,107,0,0.2)]"
    />
  ) : (
    <div className="w-20 h-20 rounded-xl bg-[#1a1f2e] border border-[#2a2e3a] flex items-center justify-center font-['Orbitron'] text-2xl text-[#ff8c30]">
      {team.teamName?.charAt(0)}
    </div>
  )
}

function MemberRow({ member, isCaptain, isCurrentPlayer, onKick }) {
  return (
    <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-[#0f1318] border border-[#1e2330]">
      <div className="flex items-center gap-2">
        <img
          src={member.avatar || "/default-avatar.png"}
          alt=""
          className="w-9 h-9 rounded-lg object-cover border border-[#2a2e3a]"
        />
        <div>
          <p className="text-[13px] font-bold text-[#d0d5df]">{member.userId.username}</p>
          <p className="text-[10px] text-[#4a5060]">UID: {member.userId.ffUid}</p>
        </div>
      </div>

      {/* Captain can kick anyone except themselves */}
      {isCaptain && !isCurrentPlayer && (
        <button
          onClick={onKick}
          className="text-[#4a5060] hover:text-red-500 transition"
          title="Kick player"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}