"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, Loader2 } from "lucide-react"
import toast from "react-hot-toast"
import { Dialog, toInputDate, cls } from "../shared/Shared"

/* ─────────────────────────────────────────────────────────────
   EDIT TOURNAMENT DIALOG
   Only works for draft / upcoming tournaments.
   Game mode + team mode are locked after creation.
───────────────────────────────────────────────────────────── */

const EDITABLE_STATUSES = ["draft", "upcoming"]

export function EditTournamentDialog({ open, onClose, tournament, onSuccess }) {
  const [form, setForm] = useState({
    name: "", description: "", rules: "", prizePool: 0,
    bannerImage: "", registrationDeadline: "", startDate: "", endDate: "",
  })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState("")

  // Populate form from tournament whenever dialog opens
  useEffect(() => {
    if (!open || !tournament) return
    setError("")
    setForm({
      name:                 tournament.name                ?? "",
      description:          tournament.description         ?? "",
      rules:                tournament.rules               ?? "",
      prizePool:            tournament.prizePool           ?? 0,
      bannerImage:          tournament.bannerImage         ?? "",
      registrationDeadline: toInputDate(tournament.registrationDeadline),
      startDate:            toInputDate(tournament.startDate),
      endDate:              toInputDate(tournament.endDate),
    })
  }, [open, tournament])

  const canEdit = EDITABLE_STATUSES.includes(tournament?.status)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: name === "prizePool" ? Number(value) : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!form.registrationDeadline || !form.startDate || !form.endDate) {
      setError("All date fields are required"); return
    }
    if (new Date(form.registrationDeadline) >= new Date(form.startDate)) {
      setError("Registration deadline must be before start date"); return
    }
    if (new Date(form.startDate) >= new Date(form.endDate)) {
      setError("Start date must be before end date"); return
    }

    setLoading(true)
    try {
      const res  = await fetch(`/api/tournaments/${tournament._id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          name:                 form.name,
          description:          form.description,
          rules:                form.rules,
          prizePool:            form.prizePool,
          bannerImage:          form.bannerImage,
          registrationDeadline: form.registrationDeadline,
          startDate:            form.startDate,
          endDate:              form.endDate,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || "Failed to update"); return }
      toast.success("Tournament updated!")
      onSuccess?.()
      onClose()
    } catch {
      setError("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title="✏ Edit Tournament" maxWidth="max-w-xl">

      {!canEdit ? (
        <div className="p-4 bg-[#07080b] border border-red-900/30 rounded-lg text-center space-y-2">
          <AlertTriangle className="w-6 h-6 text-red-400 mx-auto" />
          <p className="text-sm text-red-400 font-bold uppercase tracking-wider">
            Cannot edit — status: {tournament?.status}
          </p>
          <p className="text-xs text-[#4e5d78]">Only draft and upcoming tournaments can be edited.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* locked fields pill row */}
          <div className="flex flex-wrap gap-2 p-3 bg-[#07080b] border border-[#1e2330] rounded-lg">
            <Pill color="orange">{tournament?.gameMode}</Pill>
            <Pill color="blue">{tournament?.teamMode}</Pill>
            <Pill color="gray">🔒 Game mode locked</Pill>
          </div>

          <Field label="Tournament Name" required>
            <input name="name" value={form.name} onChange={handleChange} required className={cls.input} />
          </Field>

          <Field label="Description">
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} className={`${cls.input} resize-none`} />
          </Field>

          <Field label="Prize Pool (₹)">
            <input type="number" name="prizePool" value={form.prizePool} onChange={handleChange} min="0"
              className={`${cls.input} text-green-400 font-['Orbitron'] font-bold`} />
          </Field>

          <Field label="Registration Deadline" required>
            <input type="datetime-local" name="registrationDeadline" value={form.registrationDeadline} onChange={handleChange} required className={cls.input} />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Start Date" required>
              <input type="datetime-local" name="startDate" value={form.startDate} onChange={handleChange} required className={cls.input} />
            </Field>
            <Field label="End Date" required>
              <input type="datetime-local" name="endDate" value={form.endDate} onChange={handleChange} required className={cls.input} />
            </Field>
          </div>

          <Field label="Rules">
            <textarea name="rules" value={form.rules} onChange={handleChange} rows={3} className={`${cls.input} resize-none`} />
          </Field>

          <Field label="Banner Image URL">
            <input name="bannerImage" value={form.bannerImage} onChange={handleChange} placeholder="https://..." className={cls.input} />
          </Field>

          {error && <ErrorBanner message={error} />}

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className={cls.btnPrimary}>
              {loading
                ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</span>
                : "✏ Save Changes"}
            </button>
            <button type="button" onClick={onClose} className={cls.btnGhost}>Cancel</button>
          </div>
        </form>
      )}
    </Dialog>
  )
}

/* ─────────────────────────────────────────────────────────────
   ROOM CREDENTIALS DIALOG
───────────────────────────────────────────────────────────── */

export function RoomCredentialsDialog({ open, onClose, tournament, onSuccess }) {
  const [roomId,       setRoomId]       = useState("")
  const [roomPassword, setRoomPassword] = useState("")
  const [loading,      setLoading]      = useState(false)

  useEffect(() => {
    if (!open) return
    setRoomId(tournament?.roomId       ?? "")
    setRoomPassword(tournament?.roomPassword ?? "")
  }, [open, tournament])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!roomId.trim() || !roomPassword.trim()) {
      toast.error("Both Room ID and Password are required"); return
    }
    setLoading(true)
    try {
      const res  = await fetch(`/api/tournaments/${tournament._id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ roomId: roomId.trim(), roomPassword: roomPassword.trim() }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || "Failed"); return }
      toast.success("Room credentials published! 🔑")
      onSuccess?.()
      onClose()
    } catch {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const monoCls = `${cls.input} font-['Orbitron'] tracking-widest`

  return (
    <Dialog open={open} onClose={onClose} title="🔑 Publish Room Credentials">
      <form onSubmit={handleSubmit} className="space-y-4">

        <div className="p-4 bg-[#07080b] border border-[#ff9a00]/20 rounded-lg">
          <p className="text-xs text-[#ff9a00] font-bold uppercase tracking-wider">
            ⚠️ Credentials are visible to all registered participants immediately.
          </p>
        </div>

        <Field label="Room ID">
          <input value={roomId} onChange={(e) => setRoomId(e.target.value)} placeholder="Enter room ID..." required className={monoCls} />
        </Field>

        <Field label="Room Password">
          <input value={roomPassword} onChange={(e) => setRoomPassword(e.target.value)} placeholder="Enter room password..." required className={monoCls} />
        </Field>

        {tournament?.roomId && (
          <div className="p-3 bg-[#4ade80]/5 border border-[#4ade80]/20 rounded-lg">
            <p className="text-[11px] text-[#4ade80] font-bold uppercase tracking-wider">
              ✅ Already published — updating will overwrite existing credentials
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className={cls.btnPrimary}>
            {loading
              ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Publishing...</span>
              : "🔑 Publish Credentials"}
          </button>
          <button type="button" onClick={onClose} className={cls.btnGhost}>Cancel</button>
        </div>
      </form>
    </Dialog>
  )
}

/* ─────────────────────────────────────────────────────────────
   LOCAL SUB-COMPONENTS
───────────────────────────────────────────────────────────── */

function Field({ label, required = false, children }) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wider text-[#8090a0] mb-1.5">
        {label}{required && <span className="text-[#ff6b00] ml-1">*</span>}
      </label>
      {children}
    </div>
  )
}

function Pill({ color, children }) {
  const colors = {
    orange: "bg-[#ff6b00]/15 text-[#ff8c30] border-[#ff6b00]/30",
    blue:   "bg-[#63b3ed]/10 text-[#63b3ed] border-[#63b3ed]/25",
    gray:   "bg-[#5a6070]/10 text-[#5a6070] border-[#5a6070]/25",
  }
  return (
    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded border ${colors[color] ?? colors.gray}`}>
      {children}
    </span>
  )
}

export function ErrorBanner({ message }) {
  return (
    <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-xs font-bold uppercase tracking-wider">
      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
      {message}
    </div>
  )
}