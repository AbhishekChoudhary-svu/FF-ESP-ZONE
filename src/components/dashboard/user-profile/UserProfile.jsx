

"use client"

import { useCallback, useContext, useState } from "react"
import { useRouter } from "next/navigation"

import MyContext from "@/context/ThemeProvider"
import { EditProfileForm } from "@/components/forms/EditProfile"

import { GamingCard, DarkDialog, FONTS } from "./shared/primitives"
import { GuestBanner }            from "./shared/GuestBanner"
import { UserProfileHeader }      from "./UserProfileHeader"
import { UserProfileStats }       from "./UserProfileStats"

import { EditPlayerDialog }       from "./dialogs/EditPlayerDialog"
import { EditTeamDialog }         from "./dialogs/EditTeamDialog"
import { ViewClipsDialog }        from "./dialogs/ViewClipsDialog"
import { ApplicationsDialog }     from "./dialogs/ApplicationsDialog"
import { TeamDetailsDialog }     from "./dialogs/TeamDetailsDialog"
import { TeamJoinRequestsDialog } from "./dialogs/TeamJoinRequestsDialog"

/* ── Initial dialog-open state ─────────────────────────────── */
const INITIAL_DIALOGS = {
  editProfile:      false,
  editPlayer:       false,
  editTeam:         false,
  viewClips:        false,
  applications:     false,
  teamDetails:      false,
  teamJoinRequests: false,
}

export function UserProfile() {
  const ctx    = useContext(MyContext)
  const router = useRouter()

  /* ── Derived flags ─────────────────────────────────────── */
  const isGuest   = ctx?.user?.isGuest || ctx?.user?.role === "guest"
  const hasPlayer = Boolean(ctx?.player?._id)
  const hasTeam   = Boolean(ctx?.team?._id)
  const hasCaptain =
    String(ctx?.team?.teamCaptain?._id) === String(ctx?.player?._id)

  /* ── Dialog state ──────────────────────────────────────── */
  const [dialogs, setDialogs] = useState(INITIAL_DIALOGS)

  const openDialog = useCallback((key, value) => {
    setDialogs((prev) => ({ ...prev, [key]: value }))
  }, [])

  /* ── Mutations ─────────────────────────────────────────── */
  const [isLeaving, setIsLeaving] = useState(false)

  const refreshContext = useCallback(async () => {
    await ctx.fetchUser?.()
    await ctx.fetchPlayer?.(ctx.user?.id)
    await ctx.fetchTeam?.(ctx.player?._id)
    await ctx.fetchActivePlayers?.()
    await ctx.fetchActiveTeams?.()
    await ctx.fetchPlayerRequests?.()
  }, [ctx])

  const handleLeave = async () => {
    if (!ctx?.team?._id || !ctx?.player?._id) return
    setIsLeaving(true)
    try {
      const res  = await fetch("/api/team-requests/leave", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ teamId: ctx.team._id, playerId: ctx.player._id }),
      })
      const data = await res.json()
      if (!data.success) return
      await refreshContext()
    } finally {
      setIsLeaving(false)
    }
  }

  const handleKick = async (targetPlayerId) => {
    const res  = await fetch("/api/team-requests/kick", {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        teamId:         ctx.team._id,
        captainId:      ctx.player._id,
        targetPlayerId,
      }),
    })
    const data = await res.json()
    if (!data.success) return
    await refreshContext()
  }

  const handleDisband = async () => {
    const res  = await fetch("/api/team-requests/disband", {
      method:  "DELETE",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ teamId: ctx.team._id, captainId: ctx.player._id }),
    })
    const data = await res.json()
    if (!data.success) return
    openDialog("teamDetails", false)
    await refreshContext()
  }

  /* ── Render ────────────────────────────────────────────── */
  return (
    <>
      <style>{FONTS}</style>

      <GamingCard>

        {/* Header: avatar, name, action buttons */}
        <UserProfileHeader
          user={ctx?.user}
          player={ctx?.player}
          team={ctx?.team}
          isGuest={isGuest}
          hasPlayer={hasPlayer}
          hasTeam={hasTeam}
          hasCaptain={hasCaptain}
          dialogs={dialogs}
          openDialog={openDialog}
        />

        {/* Guest CTA strip */}
        {isGuest && (
          <GuestBanner
            onSignup={() => router.push("/signup")}
            onLogin={() => router.push("/login")}
          />
        )}

        {/* Stat rows */}
        <UserProfileStats
          user={ctx?.user}
          player={ctx?.player}
          team={ctx?.team}
          isGuest={isGuest}
        />

      </GamingCard>

      {/* ── Dialogs ──────────────────────────────────────────
          Rendered outside GamingCard so they're not clipped.   */}

      {/* Edit Profile */}
      <DarkDialog
        open={dialogs.editProfile}
        onOpenChange={(v) => openDialog("editProfile", v)}
        title="Edit Profile"
      >
        <EditProfileForm
          user={ctx?.user}
          onClose={() => openDialog("editProfile", false)}
        />
      </DarkDialog>

      {/* Register / Edit Player */}
      <EditPlayerDialog
        open={dialogs.editPlayer}
        onOpenChange={(v) => openDialog("editPlayer", v)}
        hasPlayer={hasPlayer}
        player={ctx?.player}
        userId={ctx?.user?.id}
        onSuccess={refreshContext}
      />

      {/* View Clips */}
      <ViewClipsDialog
        open={dialogs.viewClips}
        onOpenChange={(v) => openDialog("viewClips", v)}
        player={ctx?.player}
      />

      {/* Create / Edit Team */}
      {(!hasTeam || hasCaptain) && (
        <EditTeamDialog
          open={dialogs.editTeam}
          onOpenChange={(v) => openDialog("editTeam", v)}
          hasTeam={hasTeam}
          team={ctx?.team}
          playerId={ctx?.player?._id}
          onSuccess={refreshContext}
        />
      )}

      {/* Team Details */}
      {ctx?.team && (
        <TeamDetailsDialog
          open={dialogs.teamDetails}
          onOpenChange={(v) => openDialog("teamDetails", v)}
          team={ctx.team}
          currentPlayerId={ctx?.player?._id}
          isCaptain={hasCaptain}
          isLeaving={isLeaving}
          onLeave={handleLeave}
          onKick={handleKick}
          onDisband={handleDisband}
          onOpenJoinRequests={() => {
            openDialog("teamDetails", false)
            openDialog("teamJoinRequests", true)
          }}
        />
      )}

      {/* Applications (player's own requests / invites) */}
      {ctx?.playerRequests && (
        <ApplicationsDialog
          open={dialogs.applications}
          onOpenChange={(v) => openDialog("applications", v)}
          playerRequests={ctx.playerRequests}
          playerId={ctx?.player?._id}
          onSuccess={refreshContext}
        />
      )}

      {/* Team Join Requests (captain view) */}
      {ctx?.teamRequests && hasCaptain && (
        <TeamJoinRequestsDialog
          open={dialogs.teamJoinRequests}
          onOpenChange={(v) => openDialog("teamJoinRequests", v)}
          teamRequests={ctx.teamRequests}
          playerId={ctx?.player?._id}
          onSuccess={refreshContext}
        />
      )}
    </>
  )
}