

import { DarkDialog, PrimaryBtn, GhostBtn, Chip } from "../shared/primitives"

export function TeamJoinRequestsDialog({
  open,
  onOpenChange,
  teamRequests = [],
  playerId,
  onSuccess,
}) {
  const handleAccept = async (requestId) => {
    const res = await fetch("/api/team-requests/accept", {
      method:      "PATCH",
      headers:     { "Content-Type": "application/json" },
      credentials: "include",
      body:        JSON.stringify({ requestId, playerId }),
    })
    const data = await res.json()
    if (!data.success) { alert(data.message || "Failed"); return }
    onOpenChange(false)
    onSuccess?.()
  }

  const handleReject = async (requestId) => {
    const res = await fetch("/api/team-requests/reject", {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ requestId, playerId }),
    })
    const data = await res.json()
    if (data.success) {
      onOpenChange(false)
      onSuccess?.()
    }
  }

  return (
    <DarkDialog open={open} onOpenChange={onOpenChange} title="Player Join Requests">
      {teamRequests.length === 0 ? (
        <p className="text-center text-[#4a5060] py-4">No join requests</p>
      ) : (
        <div className="space-y-2">
          {teamRequests.map((req) => (
            <JoinRequestRow
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
function JoinRequestRow({ req, onAccept, onReject }) {
  const isPending  = req.status === "pending"
  const isAccepted = req.status === "accepted"
  const isRejected = req.status === "rejected"

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-[#0f1318] border border-[#1e2330]">
      <div className="flex items-center gap-3">
        <img
          src={req.player?.avatar || "/default-avatar.png"}
          alt=""
          className="w-11 h-11 rounded-lg object-cover border border-[#2a2e3a]"
        />
        <div>
          <p className="text-[13px] font-bold text-[#d0d5df]">
            {req.player?.userId?.username}
          </p>
          <p className="text-[11px] text-[#4a5060]">
            {req.player?.inGameRole} • Wants to join
          </p>
        </div>
      </div>

      <div>
        {isPending && (
          <div className="flex gap-2">
            <PrimaryBtn onClick={onAccept} className="py-1.5 px-3 text-[11px]">
              Accept
            </PrimaryBtn>
            <GhostBtn
              onClick={onReject}
              className="py-1.5 px-3 text-[11px] text-red-400 hover:text-red-400 hover:border-red-500/40"
            >
              Reject
            </GhostBtn>
          </div>
        )}
        {!isPending && isAccepted && <Chip variant="green">✅ Accepted</Chip>}
        {!isPending && isRejected && <Chip variant="red">❌ Rejected</Chip>}
      </div>
    </div>
  )
}