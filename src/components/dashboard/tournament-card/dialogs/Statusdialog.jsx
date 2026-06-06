"use client"

import { useState } from "react"
import { ChevronRight, Loader2 } from "lucide-react"
import toast from "react-hot-toast"
import { Dialog, StatusBadge, STATUS_TRANSITIONS, STATUS_LABELS, ALL_STATUSES } from "../shared/Shared"

/**
 * Organizer / admin dialog to transition tournament status.
 * Admins (isPrivileged) can jump to any status.
 * Organizers follow the allowed transition chain.
 */
export function StatusDialog({ open, onClose, tournament, isPrivileged, onSuccess }) {
  const [loading, setLoading] = useState(false)

  const availableNext = isPrivileged
    ? ALL_STATUSES.filter((s) => s !== tournament?.status)
    : STATUS_TRANSITIONS[tournament?.status] ?? []

  const handleChange = async (newStatus) => {
    setLoading(true)
    try {
      const res  = await fetch(`/api/tournaments/${tournament._id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ status: newStatus }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || "Failed to change status"); return }
      toast.success(`Status updated to "${newStatus}"`)
      onSuccess?.()
      onClose()
    } catch {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title="⚡ Change Status">
      <div className="space-y-4">

        {/* current */}
        <div className="flex items-center gap-3 p-3 bg-[#07080b] border border-[#1e2330] rounded-lg">
          <span className="text-[10px] text-[#4e5d78] uppercase tracking-wider font-bold">Current:</span>
          <StatusBadge status={tournament?.status} />
        </div>

        {availableNext.length === 0 ? (
          <div className="p-4 bg-[#07080b] border border-[#1e2330] rounded-lg text-center">
            <p className="text-sm text-[#4e5d78] font-bold uppercase tracking-wider">
              No further transitions available
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#4e5d78]">◆ Move to:</p>
            {availableNext.map((s) => {
              const meta = STATUS_LABELS[s]
              return (
                <button
                  key={s}
                  onClick={() => handleChange(s)}
                  disabled={loading}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded border font-bold text-sm uppercase tracking-wider transition-all disabled:opacity-50 ${meta.color}`}
                >
                  <span>{meta.label}</span>
                  {loading
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <ChevronRight className="w-4 h-4" />}
                </button>
              )
            })}
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-2 border border-[#2a2e3a] text-[#8090a0] hover:text-white font-bold text-xs uppercase tracking-widest rounded transition-all"
        >
          Cancel
        </button>
      </div>
    </Dialog>
  )
}