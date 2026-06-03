

import { Chip, GhostBtn, LockedFeature } from "../../shared/primitives"


/**
 * @param {object} props
 * @param {object}   props.user
 * @param {object}   props.player
 * @param {object}   props.team
 * @param {boolean}  props.isGuest
 * @param {boolean}  props.hasPlayer
 * @param {boolean}  props.hasTeam
 * @param {boolean}  props.hasCaptain
 * @param {object}   props.dialogs      — { editProfile, editPlayer, … } open booleans
 * @param {object}   props.openDialog   — setters keyed by same names
 */
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
      className="relative flex justify-between items-start gap-6 px-6 pt-6 pb-5 border-b border-[#1e2330]"
      style={{ background: "linear-gradient(135deg, #0f1318 0%, #1a1f2e 50%, #0f1318 100%)" }}
    >
      {/* ambient glow */}
      <div
        className="pointer-events-none absolute -top-8 -right-8 w-40 h-40 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(255,107,0,0.10) 0%, transparent 70%)" }}
      />

      {/* ── Left: Avatar + info ─────────────────────────────── */}
      <div className="flex gap-5 items-start">
        <AvatarBlock user={user} player={player} isGuest={isGuest} />

        <div>
          {/* Username + provider */}
          <div className="flex items-center gap-3 mb-1">
            <h2 className="font-['Orbitron'] text-2xl sm:text-4xl font-black text-[#f0f2f5] tracking-wide [text-shadow:0_0_20px_rgba(255,107,0,0.3)]">
              {user?.username ?? "Guest"}
            </h2>
            {isGuest ? (
              <Chip variant="gray">Guest</Chip>
            ) : user?.provider === "google" ? (
              <img src="/google.svg" alt="Google" className="w-7 h-7" />
            ) : (
              <img src="/gmail.svg"  alt="Email"  className="w-7 h-7" />
            )}
          </div>

          {/* FF UID */}
          {!isGuest && user?.ffUid && (
            <p className="text-[20px] text-[#5a6070] mb-2 font-['Rajdhani']">
              Free Fire UID:{" "}
              <span className="text-[#ff8c30] font-bold">{user.ffUid}</span>
            </p>
          )}

          {isGuest && (
            <p className="text-[13px] text-[#4a5060] mb-2 italic">
              Browsing as guest — progress won't be saved
            </p>
          )}

          {/* Bio */}
          {user?.bio && !isGuest && (
            <p className="text-[14px] text-[#5a6070] italic max-w-lg">"{user.bio}"</p>
          )}

          {/* Status chips */}
          <div className="flex flex-wrap gap-2 mt-3">
            {isGuest ? (
              <Chip variant="gray">Limited Access</Chip>
            ) : (
              <>
                {user?.rank      && <Chip variant="orange">{user.rank}</Chip>}
                {user?.playstyle && <Chip variant="blue">{user.playstyle}</Chip>}
                {user?.plan      && <Chip variant="yellow">{user.plan}</Chip>}
                {player?.isCaptain && <Chip variant="green">Captain</Chip>}
                {player?.isActive  && (
                  <Chip variant="green">
                    <span className="inline-block w-1.5 h-1.5 bg-[#4ade80] rounded-full mr-1 align-middle animate-pulse" />
                    Active
                  </Chip>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Right: Action buttons ───────────────────────────── */}
      <div className="grid grid-cols-2 gap-2.5 flex-shrink-0">

        {/* Edit Profile */}
        <LockedFeature isGuest={isGuest}>
          <GhostBtn disabled={isGuest} onClick={() => openDialog("editProfile", true)}>
            ✏ Edit Profile
          </GhostBtn>
        </LockedFeature>

        {/* Register / Edit Player */}
        <LockedFeature isGuest={isGuest}>
          <GhostBtn disabled={isGuest} onClick={() => openDialog("editPlayer", true)}>
            {hasPlayer ? "⚙ Edit Player" : "⚔ Register Player"}
          </GhostBtn>
        </LockedFeature>

        {/* View Clips */}
        <LockedFeature isGuest={isGuest}>
          <GhostBtn disabled={isGuest} onClick={() => openDialog("viewClips", true)}>
            ▶ View Clips
          </GhostBtn>
        </LockedFeature>

        {/* Create / Edit Team (only if no team OR user is captain) */}
        {(!hasTeam || hasCaptain) && (
          <LockedFeature isGuest={isGuest}>
            <GhostBtn disabled={isGuest} onClick={() => openDialog("editTeam", true)}>
              {hasTeam ? "🛡 Edit Team" : "🛡 Create Team"}
            </GhostBtn>
          </LockedFeature>
        )}

        {/* Team Details */}
        {team && (
          <GhostBtn onClick={() => openDialog("teamDetails", true)}>
            🛡 Team Details
          </GhostBtn>
        )}

        {/* Applications (player requests) */}
        <LockedFeature isGuest={isGuest}>
          <GhostBtn disabled={isGuest} onClick={() => openDialog("applications", true)}>
            📋 Applications
          </GhostBtn>
        </LockedFeature>

      </div>
    </div>
  )
}

/* ── Avatar block ──────────────────────────────────────────── */
function AvatarBlock({ user, player, isGuest }) {
  return (
    <div className="relative w-40 h-40 rounded-xl overflow-hidden border-2 border-[#ff6b00]/40 shadow-[0_0_16px_rgba(255,107,0,0.25)] flex-shrink-0 bg-[#1a1f2e] flex items-center justify-center">
      {player?.avatar ? (
        <img src={player.avatar} className="w-full h-full object-cover rounded-xl" alt="" />
      ) : (
        <span className="font-['Orbitron'] text-2xl font-black text-[#ff8c30]">
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