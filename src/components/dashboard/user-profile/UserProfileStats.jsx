

import { StatCell } from "../../shared/primitives"

/**
 * @param {object}  props.user
 * @param {object}  props.player
 * @param {object}  props.team
 * @param {boolean} props.isGuest
 */
export function UserProfileStats({ user, player, team, isGuest }) {
  const dash = (v) => (isGuest ? "—" : v)

  const rows = [
    /* ── Row 1: account-level ─────────────────────────────── */
    [
      { label: "Rank",      value: dash(user?.rank),                          accent: !isGuest },
      { label: "Playstyle", value: dash(user?.playstyle) },
      { label: "Tournaments", value: dash(user?.tournamentsJoined) },
      { label: "Plan",      value: isGuest ? "Guest" : user?.plan?.toUpperCase() },
      { label: "User Type", value: isGuest ? "Guest" : user?.role === "user" ? "Player" : "Moderator" },
    ],
    /* ── Row 2: player / team ──────────────────────────────── */
    [
      { label: "Team",         value: dash(team?.teamName || "No Team") },
      { label: "Role",         value: dash(player?.inGameRole  || "N/A") },
      { label: "Likes",        value: dash(player?.likes       || "0") },
      { label: "Captain / IGL", value: dash(player?.isCaptain ? "Yes" : "No") },
      { label: "Status",       value: dash(player?.isActive    ? "Active" : "Inactive"),
        accent: !isGuest && player?.isActive },
    ],
    /* ── Row 3: match stats ────────────────────────────────── */
    [
      { label: "Matches",  value: dash(player?.stats?.matchesPlayed || "0") },
      { label: "Win Rate", value: dash(player?.stats?.winRate ? `${player.stats.winRate}%` : "0%") },
      { label: "Kills",    value: dash(player?.stats?.kills   || "0"), accent: !isGuest },
      { label: "Assists",  value: dash(player?.stats?.assists || "0") },
      { label: "Deaths",   value: dash(player?.stats?.deaths  || "0") },
    ],
  ]

  const rowBg = ["bg-[#0c0e14]", "bg-[#0a0c10]", "bg-[#0c0e14]"]

  return (
    <>
      {rows.map((cells, ri) => (
        <div
          key={ri}
          className={`grid grid-cols-5 ${ri < rows.length - 1 ? "border-b border-[#1e2330]" : ""} ${rowBg[ri]}`}
        >
          {cells.map((cell, ci) => (
            <div
              key={ci}
              className={`relative px-5 py-3.5 ${
                ci < 4
                  ? "after:content-[''] after:absolute after:right-0 after:top-[20%] after:bottom-[20%] after:w-px after:bg-[#1e2330]"
                  : ""
              }`}
            >
              <StatCell label={cell.label} value={cell.value} accent={cell.accent} />
            </div>
          ))}
        </div>
      ))}
    </>
  )
}