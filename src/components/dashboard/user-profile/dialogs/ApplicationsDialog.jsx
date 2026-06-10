

import { useToast } from "@/components/ui/GameToast"
import { DarkDialog, PrimaryBtn, GhostBtn, Chip } from "../shared/primitives"

export function ApplicationsDialog({
  open,
  onOpenChange,
  playerRequests = [],
  playerId,
  onSuccess,
}) {
  const toast = useToast();
  const handleAccept = async (requestId) => {
  try {
    const res = await fetch("/api/team-requests/accept", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        requestId,
        playerId,
      }),
    })

    const data = await res.json()

    if (!data.success) {
      toast.error(
        "Join Request Failed",
        data.message || "Failed to accept invitation"
      )
      return
    }

    toast.team(
      "Team Joined",
      "You have successfully joined the team"
    )

    onOpenChange(false)
    onSuccess?.()

  } catch (err) {
    console.error(err)

    toast.error(
      "System Error",
      "Something went wrong"
    )
  }
}

const handleReject = async (requestId) => {
  try {
    const res = await fetch("/api/team-requests/reject", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        requestId,
        playerId,
      }),
    })

    const data = await res.json()

    if (!data.success) {
      toast.error(
        "Reject Failed",
        data.message || "Failed to reject invitation"
      )
      return
    }

    toast.team(
      "Invitation Rejected",
      "Team invitation declined successfully"
    )

    onOpenChange(false)
    onSuccess?.()

  } catch (err) {
    console.error(err)

    toast.error(
      "System Error",
      "Something went wrong"
    )
  }
}

  return (
    <DarkDialog open={open} onOpenChange={onOpenChange} title="Team Requests">
      {playerRequests.length === 0 ? (
        <p className="text-center text-[#4a5060] py-4">No team requests</p>
      ) : (
        <div className="space-y-2">
          {playerRequests.map((req) => (
            <RequestRow
              key={req._id}
              req={req}
              onAccept={() => handleAccept(req._id)}
              onReject={() => handleReject(req._id)}
            />
          ))}
        </div>
      )}
    </DarkDialog>
  )
}

/* ── Row ───────────────────────────────────────────────────── */
function RequestRow({ req, onAccept, onReject }) {
  const isInvite   = req.type === "invite"
  const isPending  = req.status === "pending"
  const isAccepted = req.status === "accepted"
  const isRejected = req.status === "rejected"

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-[#0f1318] border border-[#1e2330]">
      {/* Team info */}
      <div className="flex items-center gap-3">
        <img
          src={req.team?.logo || "/team-placeholder.png"}
          alt=""
          className="w-11 h-11 rounded-lg object-cover border border-[#2a2e3a]"
        />
        <div>
          <p className="text-[13px] font-bold text-[#d0d5df]">{req.team?.teamName}</p>
          <p className="text-[11px] text-[#4a5060]">
            {req.team?.tag}
            {isInvite && <span> • {isPending ? "Invited you" : req.status}</span>}
          </p>
        </div>
      </div>

      {/* Action / status */}
      <div>
        {isInvite && isPending && (
          <div className="flex gap-2">
            <PrimaryBtn onClick={onAccept} className="py-1.5 px-3 text-[11px]">Accept</PrimaryBtn>
            <GhostBtn
              onClick={onReject}
              className="py-1.5 px-3 text-[11px] text-red-400 hover:text-red-400 hover:border-red-500/40"
            >
              Reject
            </GhostBtn>
          </div>
        )}
        {!isInvite && isPending  && <Chip variant="yellow">⏳ Pending</Chip>}
        {isAccepted              && <Chip variant="green">✅ Accepted</Chip>}
        {isRejected              && <Chip variant="red">❌ Rejected</Chip>}
      </div>
    </div>
  )
}