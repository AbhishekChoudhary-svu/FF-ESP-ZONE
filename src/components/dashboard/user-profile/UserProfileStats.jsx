import { StatCell } from "./shared/primitives"

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
      { label: "Rank",        value: dash(user?.rank),                                              accent: !isGuest },
      { label: "Playstyle",   value: dash(user?.playstyle) },
      { label: "Tournaments", value: dash(user?.tournamentsJoined) },
      { label: "Plan",        value: isGuest ? "Guest" : user?.plan?.toUpperCase() },
      { label: "User Type",   value: isGuest ? "Guest" : user?.role === "user" ? "Player" : "Moderator" },
    ],
    /* ── Row 2: player / team ──────────────────────────────── */
    [
      { label: "Team",          value: dash(team?.teamName    || "No Team") },
      { label: "Role",          value: dash(player?.inGameRole || "N/A") },
      { label: "Likes",         value: dash(player?.likes      || "0") },
      { label: "Captain / IGL", value: dash(player?.isCaptain ? "Yes" : "No") },
      { label: "Status",        value: dash(player?.isActive   ? "Active" : "Inactive"),
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

  const rowBg    = ["bg-[#0c0e14]", "bg-[#0a0c10]", "bg-[#0c0e14]"]
  const rowLabel = ["Account", "Player & Team", "Match Stats"]

  return (
    <>
      {rows.map((cells, ri) => (
        <div
          key={ri}
          className={`${ri < rows.length - 1 ? "border-b border-[#1e2330]" : ""} ${rowBg[ri]}`}
        >
          {/* Mobile: section label */}
          <p className="sm:hidden px-4 pt-2.5 pb-0.5 text-[9px] font-black uppercase tracking-[0.15em] text-[#3a4050]">
            {rowLabel[ri]}
          </p>

          {/* Grid: 2-col on mobile, 5-col on sm+ */}
          <div className="grid grid-cols-2 sm:grid-cols-5">
            {cells.map((cell, ci) => (
              <div
                key={ci}
                className={[
                  "relative px-4 sm:px-5 py-3 sm:py-3.5",
                  // desktop vertical dividers
                  ci < 4
                    ? "sm:after:content-[''] sm:after:absolute sm:after:right-0 sm:after:top-[20%] sm:after:bottom-[20%] sm:after:w-px sm:after:bg-[#1e2330]"
                    : "",
                  // mobile: bottom border for all except last row's last two cells
                  "border-b border-[#1e2330] sm:border-b-0",
                  // mobile: right border on odd-indexed (left column) cells
                  ci % 2 === 0 ? "border-r border-[#1e2330] sm:border-r-0" : "",
                  // last row on mobile: hide bottom border on final 2 cells
                  ri === rows.length - 1 && ci >= cells.length - 2
                    ? "border-b-0"
                    : "",
                ].join(" ")}
              >
                <StatCell label={cell.label} value={cell.value} accent={cell.accent} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  )
}