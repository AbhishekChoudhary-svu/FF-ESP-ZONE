"use client"

import { useState, useEffect } from "react"
import { AlertTriangle, Loader2 } from "lucide-react"
import toast from "react-hot-toast"

/* ── Status options per tournament type ─────────────────────
   Free tournaments always auto-publish as "upcoming".
   Paid tournaments (admin/mod) can start as "draft" or "upcoming".
────────────────────────────────────────────────────────────── */

const PAID_STATUS_OPTIONS = [
  {
    value:   "draft",
    label:   "Save as Draft",
    sub:     "Not visible to players yet",
    color:   "border-[#ff9a00]/40 text-[#ff9a00] bg-[#ff9a00]/5",
    active:  "border-[#ff9a00] bg-[#ff9a00]/15 text-[#ffaa00]",
    icon:    "📝",
  },
  {
    value:   "upcoming",
    label:   "Publish Now",
    sub:     "Visible & open for registration",
    color:   "border-[#4ade80]/30 text-[#4ade80] bg-[#4ade80]/5",
    active:  "border-[#4ade80] bg-[#4ade80]/15 text-[#6aee9f]",
    icon:    "🚀",
  },
]

export function CreateTournamentForm({ onClose, userRole }) {
  const canCreatePaid = ["admin", "moderator"].includes(userRole)

  const [formData, setFormData] = useState({
    name:                 "",
    description:          "",
    rules:                "",
    gameMode:             "BR",
    teamMode:             "Squad",
    tournamentType: "free",
    entryFee:             0,
    prizePool:            0,
    prizeDistribution:    [],
    registrationDeadline: "",
    startDate:            "",
    endDate:              "",
    bannerImage:          "",
    region:               "India",
    // Only relevant for paid tournaments
    initialStatus:        "draft",
  })

  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState("")

  // Lock teamMode to Squad when CS is selected
  useEffect(() => {
    if (formData.gameMode === "CS") {
      setFormData((p) => ({ ...p, teamMode: "Squad" }))
    }
  }, [formData.gameMode])

  

  const getSlotInfo = () => {
    if (formData.gameMode === "CS")         return { slots: 2,  perSlot: 4, total: 8  }
    if (formData.teamMode === "Squad")      return { slots: 12, perSlot: 4, total: 48 }
    if (formData.teamMode === "Duo")        return { slots: 24, perSlot: 2, total: 48 }
    return                                         { slots: 48, perSlot: 1, total: 48 }
  }
  const slotInfo = getSlotInfo()

  const set = (field, value) => setFormData((p) => ({ ...p, [field]: value }))

  const handleChange = (e) => {
    const { name, value } = e.target
    set(name, ["entryFee", "prizePool"].includes(name) ? Number(value) : value)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    // Validation
    if (!formData.registrationDeadline || !formData.startDate || !formData.endDate) {
      setError("All date fields are required"); return
    }
    if (new Date(formData.registrationDeadline) >= new Date(formData.startDate)) {
      setError("Registration deadline must be before start date"); return
    }
    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      setError("Start date must be before end date"); return
    }
    if (formData.tournamentType === "paid" && formData.entryFee <= 0) {
      setError("Paid tournaments must have an entry fee greater than 0"); return
    }

    setLoading(true)
    try {
      const endpoint = formData.tournamentType === "paid"
        ? "/api/tournaments/paid"
        : "/api/tournaments/free"

      const payload = { ...formData }
      // Free tournaments ignore initialStatus (always upcoming on server)
      if (formData.tournamentType === "free") delete payload.initialStatus

      const res  = await fetch(endpoint, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      })
      const data = await res.json()

      if (!res.ok) { setError(data.error || "Failed to create tournament"); return }

      const isPublished = formData.tournamentType === "free" || formData.initialStatus === "upcoming"
      toast.success(
        isPublished
          ? "Tournament published! Players can now register. 🏆"
          : "Tournament saved as draft. Publish it when ready. 📝"
      )
      onClose?.()
    } catch (err) {
      setError(err.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const inputCls  = "w-full px-3 py-2 bg-[#07080b] border border-[#1e2330] rounded text-[#d0d5df] placeholder-[#4e5d78] text-sm font-semibold tracking-wide focus:outline-none focus:border-[#ff6b00]/60 transition-colors"
  const labelCls  = "block text-xs font-bold uppercase tracking-wider text-[#8090a0] mb-2"
  const selectCls = "w-full appearance-none px-3 py-2 bg-[#07080b] border border-[#1e2330] rounded text-[#d0d5df] text-sm font-bold uppercase tracking-wider focus:outline-none focus:border-[#ff6b00]/60 cursor-pointer transition-colors"

  return (
    <div className="p-6 bg-[#0a0c10] border border-[#1e2330] rounded-lg font-['Rajdhani'] shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* ── Tournament Type ─────────────────────────────── */}
        <div>
          <label className={labelCls}>Tournament Type <span className="text-[#ff6b00]">*</span></label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => set("tournamentType", "free")}
              disabled={false}
              className={`py-2.5 rounded border font-['Orbitron'] font-bold text-xs uppercase tracking-widest transition-all ${
                formData.tournamentType === "free"
                  ? "bg-[#4ade80]/10 border-[#4ade80]/50 text-[#4ade80]"
                  : canCreatePaid
                    ? "bg-[#07080b] border-[#1e2330] text-[#2a2e3a] cursor-not-allowed"
                    : "bg-[#07080b] border-[#1e2330] text-[#4e5d78] hover:border-[#4e5d78]"
              }`}
            >
              🎮 Free
            </button>
            <button
              type="button"
              onClick={() => !canCreatePaid ? null : set("tournamentType", "paid")}
              disabled={!canCreatePaid}
              className={`py-2.5 rounded border font-['Orbitron'] font-bold text-xs uppercase tracking-widest transition-all ${
                formData.tournamentType === "paid"
                  ? "bg-[#ff9a00]/10 border-[#ff9a00]/50 text-[#ffaa00]"
                  : canCreatePaid
                    ? "bg-[#07080b] border-[#1e2330] text-[#4e5d78] hover:border-[#4e5d78]"
                    : "bg-[#07080b] border-[#1e2330] text-[#2a2e3a] cursor-not-allowed"
              }`}
            >
              💰 Paid{!canCreatePaid && <span className="text-[9px] ml-1 normal-case">(admin only)</span>}
            </button>
          </div>
        </div>

        {/* ── Initial Status (paid only) ──────────────────── */}
        {formData.tournamentType === "paid" && (
          <div>
            <label className={labelCls}>
              Initial Status <span className="text-[#ff6b00]">*</span>
              <span className="ml-2 text-[#4e5d78] normal-case font-normal">
                — You can change this later
              </span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {PAID_STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => set("initialStatus", opt.value)}
                  className={`flex flex-col items-start px-4 py-3 rounded border transition-all text-left ${
                    formData.initialStatus === opt.value ? opt.active : opt.color
                  }`}
                >
                  <span className="font-['Orbitron'] font-bold text-xs uppercase tracking-widest mb-0.5">
                    {opt.icon} {opt.label}
                  </span>
                  <span className="text-[10px] opacity-70 normal-case tracking-normal font-semibold">
                    {opt.sub}
                  </span>
                </button>
              ))}
            </div>
            {formData.initialStatus === "draft" && (
              <p className="text-[11px] text-[#ff9a00]/70 mt-2 font-semibold">
                ⚠️ Draft tournaments are invisible to players until you publish them via the ⚡ Change Status button on the card.
              </p>
            )}
          </div>
        )}

        {/* Free tournaments always publish immediately — show info badge */}
        {formData.tournamentType === "free" && (
          <div className="flex items-center gap-2 px-3 py-2 bg-[#4ade80]/5 border border-[#4ade80]/20 rounded-lg">
            <span className="text-[#4ade80] text-sm">🚀</span>
            <p className="text-[11px] text-[#4ade80] font-bold uppercase tracking-wider">
              Free tournaments publish immediately and open for registration
            </p>
          </div>
        )}

        {/* ── Name ────────────────────────────────────────── */}
        <div>
          <label className={labelCls}>Tournament Name <span className="text-[#ff6b00]">*</span></label>
          <input
            type="text" name="name" placeholder="e.g., Elite Squad Championship"
            value={formData.name} onChange={handleChange} required
            className={inputCls}
          />
        </div>

        {/* ── Description ─────────────────────────────────── */}
        <div>
          <label className={labelCls}>Description</label>
          <textarea
            name="description" placeholder="Tournament overview, format, rewards..."
            value={formData.description} onChange={handleChange} rows={2}
            className={`${inputCls} resize-none`}
          />
        </div>

        {/* ── Game Mode + Team Mode ───────────────────────── */}
        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <label className={labelCls}>Game Mode <span className="text-[#ff6b00]">*</span></label>
            <select name="gameMode" value={formData.gameMode} onChange={handleChange} className={selectCls}>
              <option value="BR">BR — Battle Royale</option>
              <option value="CS">CS — Clash Squad</option>
            </select>
            <div className="absolute top-[34px] right-3 pointer-events-none text-[10px] text-[#4e5d78]">▼</div>
          </div>
          <div className="relative">
            <label className={labelCls}>Team Mode <span className="text-[#ff6b00]">*</span></label>
            <select
              name="teamMode" value={formData.teamMode} onChange={handleChange}
              disabled={formData.gameMode === "CS"}
              className={`${selectCls} ${formData.gameMode === "CS" ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <option value="Solo">Solo</option>
              <option value="Duo">Duo</option>
              <option value="Squad">Squad</option>
            </select>
            <div className="absolute top-[34px] right-3 pointer-events-none text-[10px] text-[#4e5d78]">▼</div>
          </div>
        </div>

        {/* ── Slot Info ────────────────────────────────────── */}
        <div className="grid grid-cols-4 divide-x divide-[#1e2330] bg-[#07080b] border border-[#1e2330] rounded-lg overflow-hidden">
          {[
            { label: "Slots",   value: slotInfo.slots,   color: "text-[#ffaa00]" },
            { label: "Per Slot",value: slotInfo.perSlot, color: "text-[#d0d5df]" },
            { label: "Players", value: slotInfo.total,   color: "text-[#4ade80]" },
            { label: "Mode",    value: formData.gameMode === "CS" ? "4v4" : formData.teamMode, color: "text-[#63b3ed]" },
          ].map((s, i) => (
            <div key={i} className="flex flex-col items-center justify-center py-3 px-2">
              <p className="text-[9px] text-[#4e5d78] uppercase tracking-wider font-bold mb-1">{s.label}</p>
              <p className={`text-base font-black font-['Orbitron'] ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* ── Entry Fee + Prize Pool ──────────────────────── */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>
              Entry Fee (₹){formData.tournamentType === "paid" && <span className="text-[#ff6b00] ml-1">*</span>}
            </label>
            <input
              type="number" name="entryFee" value={formData.entryFee} onChange={handleChange}
              min="0" disabled={formData.tournamentType === "free"}
              className={`${inputCls} text-[#ff9a00] font-['Orbitron'] font-bold ${formData.tournamentType === "free" ? "opacity-40 cursor-not-allowed" : ""}`}
            />
            {formData.tournamentType === "free" && (
              <p className="text-[10px] text-[#4e5d78] mt-1 uppercase tracking-wide">Free — ₹0 entry</p>
            )}
          </div>
          <div>
            <label className={labelCls}>Prize Pool (₹)</label>
            <input
              type="number" name="prizePool" value={formData.prizePool} onChange={handleChange} min="0"
              className={`${inputCls} text-green-400 font-['Orbitron'] font-bold`}
            />
          </div>
        </div>

        {/* ── Dates ───────────────────────────────────────── */}
        <div>
          <label className={labelCls}>Registration Deadline <span className="text-[#ff6b00]">*</span></label>
          <input
            type="datetime-local" name="registrationDeadline"
            value={formData.registrationDeadline} onChange={handleChange} required
            className={inputCls}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Start Date <span className="text-[#ff6b00]">*</span></label>
            <input type="datetime-local" name="startDate" value={formData.startDate} onChange={handleChange} required className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>End Date <span className="text-[#ff6b00]">*</span></label>
            <input type="datetime-local" name="endDate" value={formData.endDate} onChange={handleChange} required className={inputCls} />
          </div>
        </div>

        {/* ── Rules ───────────────────────────────────────── */}
        <div>
          <label className={labelCls}>Rules & Guidelines</label>
          <textarea
            name="rules" placeholder="Match rules, ping limits, code of conduct..."
            value={formData.rules} onChange={handleChange} rows={3}
            className={`${inputCls} resize-none`}
          />
        </div>

        {/* ── Banner URL ───────────────────────────────────── */}
        <div>
          <label className={labelCls}>Banner Image URL</label>
          <input
            type="url" name="bannerImage" placeholder="https://..."
            value={formData.bannerImage} onChange={handleChange}
            className={inputCls}
          />
        </div>

        {/* ── Region ──────────────────────────────────────── */}
        <div className="relative">
          <label className={labelCls}>Region</label>
          <select name="region" value={formData.region} onChange={handleChange} className={selectCls}>
            <option value="India">India</option>
            <option value="South Asia">South Asia</option>
            <option value="Global">Global</option>
          </select>
          <div className="absolute top-[34px] right-3 pointer-events-none text-[10px] text-[#4e5d78]">▼</div>
        </div>

        {/* ── Error ───────────────────────────────────────── */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-xs font-bold uppercase tracking-wider">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" /> {error}
          </div>
        )}

        {/* ── Summary ─────────────────────────────────────── */}
        <div className="p-4 bg-[#07080b] border border-[#1e2330] rounded-lg">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#4e5d78] mb-3">◆ Summary</p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-[12px]">
            {[
              { label: "Type",      value: formData.tournamentType, color: formData.tournamentType === "paid" ? "text-[#ffaa00]" : "text-[#4ade80]" },
              { label: "Mode",      value: `${formData.gameMode} — ${formData.teamMode}`, color: "text-[#d0d5df]" },
              { label: "Capacity",  value: `${slotInfo.total} players (${slotInfo.slots} slots)`, color: "text-[#d0d5df]" },
              { label: "Entry Fee", value: formData.tournamentType === "free" ? "Free" : `₹${formData.entryFee}`, color: "text-[#ff9a00]" },
              { label: "Prize Pool",value: `₹${formData.prizePool}`, color: "text-green-400" },
              ...(formData.tournamentType === "paid" ? [{ label: "Will be", value: formData.initialStatus === "upcoming" ? "Published" : "Saved as Draft", color: formData.initialStatus === "upcoming" ? "text-[#4ade80]" : "text-[#ff9a00]" }] : []),
            ].map((s, i) => (
              <div key={i} className="contents">
                <span className="text-[#4e5d78] font-semibold">{s.label}</span>
                <span className={`font-bold uppercase ${s.color}`}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Buttons ─────────────────────────────────────── */}
        <div className="flex gap-3 pt-1">
          <button
            type="submit" disabled={loading}
            className="flex-1 py-3 bg-gradient-to-r from-[#ff6b00] to-[#ff9a00] hover:from-[#ff7c1a] hover:to-[#ffa61a] disabled:from-[#1e2330] disabled:to-[#1e2330] text-white disabled:text-[#4e5d78] font-bold text-xs uppercase tracking-widest rounded transition-all disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Creating...
              </span>
            ) : formData.tournamentType === "paid" && formData.initialStatus === "draft"
              ? "📝 Save as Draft"
              : "🏆 Publish Tournament"}
          </button>
          <button
            type="button" onClick={onClose}
            className="px-5 py-3 border border-[#2a2e3a] text-[#8090a0] hover:text-[#d0d5df] hover:bg-[#141822] font-bold text-xs uppercase tracking-widest rounded transition-all"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}