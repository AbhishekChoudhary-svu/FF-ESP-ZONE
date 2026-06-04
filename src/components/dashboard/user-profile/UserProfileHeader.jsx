import { Chip, GhostBtn, LockedFeature } from "../../shared/primitives"

export function UserProfileHeader({
  user,
  player,
  team,
  isGuest,
  hasPlayer,
  hasTeam,
  hasCaptain,
  dialogs,
  openDialog,
}) {
  return (
    <div
      className="relative px-4 sm:px-6 pt-5 sm:pt-6 pb-4 sm:pb-5 border-b border-[#1e2330]"
      style={{ background: "linear-gradient(135deg, #0f1318 0%, #1a1f2e 50%, #0f1318 100%)" }}
    >
      {/* ambient glow */}
      <div
        className="pointer-events-none absolute -top-8 -right-8 w-40 h-40 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(255,107,0,0.10) 0%, transparent 70%)" }}
      />

      {/* ── Desktop layout: avatar+info left, buttons right ── */}
      <div className="hidden sm:flex sm:justify-between sm:items-start gap-6">

        {/* Left: avatar + info */}
        <div className="flex gap-5 items-start">
          <AvatarBlock user={user} player={player} isGuest={isGuest} size="lg" />
          <NameBlock user={user} player={player} isGuest={isGuest} />
        </div>

        {/* Right: 2-col button grid */}
        <div className="grid grid-cols-2 gap-2.5 flex-shrink-0">
          <ActionButtons
            isGuest={isGuest} hasPlayer={hasPlayer} hasTeam={hasTeam}
            hasCaptain={hasCaptain} team={team} openDialog={openDialog}
          />
        </div>
      </div>

      {/* ── Mobile layout ────────────────────────────────────── */}
      <div className="sm:hidden space-y-3">

        {/* Row 1: small avatar + name side by side */}
        <div className="flex gap-3 items-start">
          <AvatarBlock user={user} player={player} isGuest={isGuest} size="sm" />
          <NameBlock user={user} player={player} isGuest={isGuest} mobile />
        </div>

        {/* Row 2: buttons in a 3-col tight grid — all visible, no scroll */}
        <div className="grid grid-cols-3 gap-1.5">
          <ActionButtons
            isGuest={isGuest} hasPlayer={hasPlayer} hasTeam={hasTeam}
            hasCaptain={hasCaptain} team={team} openDialog={openDialog}
            mobile
          />
        </div>
      </div>
    </div>
  )
}

/* ── Name / info block ─────────────────────────────────────── */
function NameBlock({ user, player, isGuest, mobile = false }) {
  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-1 flex-wrap">
        <h2 className={`font-['Orbitron'] font-black text-[#f0f2f5] tracking-wide [text-shadow:0_0_20px_rgba(255,107,0,0.3)] truncate ${
          mobile ? "text-sm" : "text-2xl lg:text-4xl"
        }`}>
          {user?.username ?? "Guest"}
        </h2>
        {isGuest ? (
          <Chip variant="gray">Guest</Chip>
        ) : user?.provider === "google" ? (
          <img src="/google.svg" alt="Google" className={mobile ? "w-4 h-4" : "w-5 h-5 sm:w-7 sm:h-7"} />
        ) : (
          <img src="/gmail.svg"  alt="Email"  className={mobile ? "w-4 h-4" : "w-5 h-5 sm:w-7 sm:h-7"} />
        )}
      </div>

      {!isGuest && user?.ffUid && (
        <p className={`text-[#5a6070] font-['Rajdhani'] ${mobile ? "text-[11px] mb-1" : "text-[16px] mb-2"}`}>
          UID: <span className="text-[#ff8c30] font-bold">{user.ffUid}</span>
        </p>
      )}

      {isGuest && (
        <p className={`text-[#4a5060] italic ${mobile ? "text-[10px]" : "text-[13px] mb-2"}`}>
          Browsing as guest
        </p>
      )}

      {/* Bio — desktop only */}
      {user?.bio && !isGuest && (
        <p className={`${mobile ? "text-[10px]" : "text-[14px]"} text-[#5a6070] italic max-w-lg sm:whitespace-normal`}>
          "{user.bio}"
        </p>
      )}

      {/* Status chips */}
      <div className={`flex flex-wrap gap-1 ${mobile ? "mt-1" : "mt-3 gap-2"}`}>
        {isGuest ? (
          <Chip variant="gray">Limited Access</Chip>
        ) : (
          <>
            {user?.rank        && <Chip variant="orange">{user.rank}</Chip>}
            {user?.playstyle   && <Chip variant="blue">{user.playstyle}</Chip>}
            {!mobile && user?.plan && <Chip variant="yellow">{user.plan}</Chip>}
            {player?.isCaptain && <Chip variant="green">Captain</Chip>}
            {player?.isActive  && (
              <Chip variant="green">
                <span className="inline-block w-1 h-1 bg-[#4ade80] rounded-full mr-1 align-middle animate-pulse" />
                {mobile ? "Active" : "Active"}
              </Chip>
            )}
          </>
        )}
      </div>
    </div>
  )
}

/* ── Action buttons ────────────────────────────────────────── */
function ActionButtons({ isGuest, hasPlayer, hasTeam, hasCaptain, team, openDialog, mobile = false }) {
  // On mobile: ultra-compact — icon emoji + short label, tiny text
  const cls = mobile
    ? "w-full text-[9px] px-1.5 py-1.5 leading-tight text-center"
    : ""

  // Short labels for mobile to fit 3 columns
  const label = mobile
    ? {
        editProfile:  "✏ Profile",
        editPlayer:   hasPlayer ? "⚙ Player" : "⚔ Register",
        viewClips:    "▶ Clips",
        editTeam:     hasTeam ? "🛡 Edit Team" : "🛡 Create",
        teamDetails:  "🛡 Details",
        applications: "📋 Request",
      }
    : {
        editProfile:  "✏ Edit Profile",
        editPlayer:   hasPlayer ? "⚙ Edit Player" : "⚔ Register Player",
        viewClips:    "▶ View Clips",
        editTeam:     hasTeam ? "🛡 Edit Team" : "🛡 Create Team",
        teamDetails:  "🛡 Team Details",
        applications: "📋 Applications",
      }

  return (
    <>
      <LockedFeature isGuest={isGuest}>
        <GhostBtn disabled={isGuest} onClick={() => openDialog("editProfile", true)} className={cls}>
          {label.editProfile}
        </GhostBtn>
      </LockedFeature>

      <LockedFeature isGuest={isGuest}>
        <GhostBtn disabled={isGuest} onClick={() => openDialog("editPlayer", true)} className={cls}>
          {label.editPlayer}
        </GhostBtn>
      </LockedFeature>

      <LockedFeature isGuest={isGuest}>
        <GhostBtn disabled={isGuest} onClick={() => openDialog("viewClips", true)} className={cls}>
          {label.viewClips}
        </GhostBtn>
      </LockedFeature>

      {(!hasTeam || hasCaptain) && (
        <LockedFeature isGuest={isGuest}>
          <GhostBtn disabled={isGuest} onClick={() => openDialog("editTeam", true)} className={cls}>
            {label.editTeam}
          </GhostBtn>
        </LockedFeature>
      )}

      {team && (
        <GhostBtn onClick={() => openDialog("teamDetails", true)} className={cls}>
          {label.teamDetails}
        </GhostBtn>
      )}

      <LockedFeature isGuest={isGuest}>
        <GhostBtn disabled={isGuest} onClick={() => openDialog("applications", true)} className={cls}>
          {label.applications}
        </GhostBtn>
      </LockedFeature>
    </>
  )
}

/* ── Avatar block ──────────────────────────────────────────── */
function AvatarBlock({ user, player, isGuest, size = "lg" }) {
  const dim = size === "sm"
    ? "w-16 h-16"
    : "w-28 h-28 lg:w-40 lg:h-40"

  return (
    <div className={`relative ${dim} rounded-xl overflow-hidden border-2 border-[#ff6b00]/40 shadow-[0_0_16px_rgba(255,107,0,0.25)] flex-shrink-0 bg-[#1a1f2e] flex items-center justify-center`}>
      {player?.avatar ? (
        <img src={player.avatar} className="w-full h-full object-cover rounded-xl" alt="" />
      ) : (
        <span className={`font-['Orbitron'] font-black text-[#ff8c30] ${size === "sm" ? "text-lg" : "text-2xl"}`}>
          {user?.username?.charAt(0)?.toUpperCase() ?? "G"}
        </span>
      )}
      {isGuest && (
        <div className="absolute bottom-0 left-0 right-0 bg-[#ff6b00]/80 py-0.5 text-center">
          <span className="text-[8px] font-black text-white uppercase tracking-wider">Guest</span>
        </div>
      )}
    </div>
  )
}