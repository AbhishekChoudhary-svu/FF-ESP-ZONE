"use client"

import { useState, useEffect } from "react"
import toast from "react-hot-toast"

export function CreateTournamentForm({ onClose, userRole }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    rules: "",
    gameMode: "BR",
    teamMode: "Squad",
    tournamentType: "free",
    entryFee: 0,
    prizePool: 0,
    prizeDistribution: [],
    registrationDeadline: "",
    startDate: "",
    endDate: "",
    bannerImage: "",
    region: "India",
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Auto-lock teamMode to Squad when CS is selected
  useEffect(() => {
    if (formData.gameMode === "CS") {
      setFormData((prev) => ({ ...prev, teamMode: "Squad" }))
    }
  }, [formData.gameMode])

  // Auto-lock tournamentType to paid if user is admin/moderator
  useEffect(() => {
    if (["admin", "moderator"].includes(userRole)) {
      setFormData((prev) => ({ ...prev, tournamentType: "paid" }))
    }
  }, [userRole])

  // Compute slot info for display
  const getSlotInfo = () => {
    if (formData.gameMode === "CS") return { slots: 2, perSlot: 4, total: 8 }
    if (formData.teamMode === "Squad") return { slots: 12, perSlot: 4, total: 48 }
    if (formData.teamMode === "Duo")   return { slots: 24, perSlot: 2, total: 48 }
    return { slots: 48, perSlot: 1, total: 48 }
  }

  const slotInfo = getSlotInfo()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: ["entryFee", "prizePool"].includes(name) ? Number(value) : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    // Validate date order
    if (new Date(formData.registrationDeadline) >= new Date(formData.startDate)) {
      setError("Registration deadline must be before start date")
      return
    }
    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      setError("Start date must be before end date")
      return
    }
    if (formData.tournamentType === "paid" && formData.entryFee <= 0) {
      setError("Paid tournaments must have an entry fee greater than 0")
      return
    }

    setLoading(true)

    try {
      const endpoint = formData.tournamentType === "paid"
        ? "/api/tournaments/paid"
        : "/api/tournaments/free"

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to create tournament")
        return
      }

      toast.success("Tournament created successfully")
      onClose?.()
    } catch (err) {
      setError(err.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const inputCls = "w-full px-3 py-2 bg-[#07080b] border border-[#1e2330] rounded text-[#d0d5df] placeholder-[#4e5d78] text-sm font-semibold tracking-wide focus:outline-none focus:border-[#ff6b00]/60 transition-colors"
  const labelCls = "block text-xs font-bold uppercase tracking-wider text-[#8090a0] mb-2"
  const selectCls = "w-full appearance-none px-3 py-2 bg-[#07080b] border border-[#1e2330] rounded text-[#d0d5df] text-sm font-bold uppercase tracking-wider focus:outline-none focus:border-[#ff6b00]/60 cursor-pointer transition-colors"

  const canCreatePaid = ["admin", "moderator"].includes(userRole)

  return (
    <div className="p-6 bg-[#0a0c10] border border-[#1e2330] rounded-lg font-['Rajdhani'] shadow-[0_10px_30px_rgba(0,0,0,0.5)]">

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* ── Tournament Type ─────────────────────────────── */}
        <div>
          <label className={labelCls}>Tournament Type <span className="text-[#ff6b00]">*</span></label>
          <div className="grid grid-cols-2 gap-3">
            {/* Free — always available */}
            <button
              type="button"
              onClick={() => setFormData((p) => ({ ...p, tournamentType: "free", entryFee: 0 }))}
              className={`py-2.5 rounded border font-['Orbitron'] font-bold text-xs uppercase tracking-widest transition-all ${
                formData.tournamentType === "free"
                  ? "bg-[#4ade80]/10 border-[#4ade80]/50 text-[#4ade80]"
                  : "bg-[#07080b] border-[#1e2330] text-[#4e5d78] hover:border-[#4e5d78]"
              }`}
            >
              🎮 Free
            </button>

            {/* Paid — only admin/moderator */}
            <button
              type="button"
              disabled={!canCreatePaid}
              onClick={() => canCreatePaid && setFormData((p) => ({ ...p, tournamentType: "paid" }))}
              className={`py-2.5 rounded border font-['Orbitron'] font-bold text-xs uppercase tracking-widest transition-all ${
                formData.tournamentType === "paid"
                  ? "bg-[#ff9a00]/10 border-[#ff9a00]/50 text-[#ffaa00]"
                  : canCreatePaid
                    ? "bg-[#07080b] border-[#1e2330] text-[#4e5d78] hover:border-[#4e5d78]"
                    : "bg-[#07080b] border-[#1e2330] text-[#2a2e3a] cursor-not-allowed"
              }`}
            >
              💰 Paid {!canCreatePaid && <span className="text-[9px] normal-case">(admin only)</span>}
            </button>
          </div>
        </div>

        {/* ── Tournament Name ─────────────────────────────── */}
        <div>
          <label className={labelCls}>
            Tournament Name <span className="text-[#ff6b00]">*</span>
          </label>
          <input
            type="text"
            name="name"
            placeholder="e.g., Elite Squad Championship"
            value={formData.name}
            onChange={handleChange}
            required
            className={inputCls}
          />
        </div>

        {/* ── Description ────────────────────────────────── */}
        <div>
          <label className={labelCls}>Description</label>
          <textarea
            name="description"
            placeholder="Tournament overview, format details, rewards..."
            value={formData.description}
            onChange={handleChange}
            rows={3}
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
              name="teamMode"
              value={formData.teamMode}
              onChange={handleChange}
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

        {/* ── Slot Info Banner ────────────────────────────── */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#07080b] border border-[#1e2330] rounded-lg">
          <div className="text-center">
            <p className="text-[10px] text-[#4e5d78] uppercase tracking-wider font-bold">Total Slots</p>
            <p className="text-lg font-black font-['Orbitron'] text-[#ffaa00]">{slotInfo.slots}</p>
          </div>
          <div className="w-px h-8 bg-[#1e2330]" />
          <div className="text-center">
            <p className="text-[10px] text-[#4e5d78] uppercase tracking-wider font-bold">Per Slot</p>
            <p className="text-lg font-black font-['Orbitron'] text-[#d0d5df]">{slotInfo.perSlot}</p>
          </div>
          <div className="w-px h-8 bg-[#1e2330]" />
          <div className="text-center">
            <p className="text-[10px] text-[#4e5d78] uppercase tracking-wider font-bold">Total Players</p>
            <p className="text-lg font-black font-['Orbitron'] text-[#4ade80]">{slotInfo.total}</p>
          </div>
          <div className="w-px h-8 bg-[#1e2330]" />
          <div className="text-center">
            <p className="text-[10px] text-[#4e5d78] uppercase tracking-wider font-bold">Mode</p>
            <p className="text-lg font-black font-['Orbitron'] text-[#63b3ed]">
              {formData.gameMode === "CS" ? "4v4" : formData.teamMode}
            </p>
          </div>
        </div>

        {/* ── Entry Fee + Prize Pool ──────────────────────── */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>
              Entry Fee (₹)
              {formData.tournamentType === "paid" && <span className="text-[#ff6b00] ml-1">*</span>}
            </label>
            <input
              type="number"
              name="entryFee"
              value={formData.entryFee}
              onChange={handleChange}
              min="0"
              disabled={formData.tournamentType === "free"}
              className={`${inputCls} text-[#ff9a00] font-['Orbitron'] font-bold ${
                formData.tournamentType === "free" ? "opacity-50 cursor-not-allowed" : ""
              }`}
            />
            {formData.tournamentType === "free" && (
              <p className="text-[10px] text-[#4e5d78] mt-1 uppercase tracking-wide">Free — no entry fee</p>
            )}
          </div>

          <div>
            <label className={labelCls}>Prize Pool (₹) <span className="text-[#ff6b00]">*</span></label>
            <input
              type="number"
              name="prizePool"
              value={formData.prizePool}
              onChange={handleChange}
              min="0"
              required
              className={`${inputCls} text-green-400 font-['Orbitron'] font-bold`}
            />
          </div>
        </div>

        {/* ── Registration Deadline ───────────────────────── */}
        <div>
          <label className={labelCls}>
            Registration Deadline <span className="text-[#ff6b00]">*</span>
          </label>
          <input
            type="datetime-local"
            name="registrationDeadline"
            value={formData.registrationDeadline}
            onChange={handleChange}
            required
            className={inputCls}
          />
          <p className="text-[10px] text-[#4e5d78] mt-1 uppercase tracking-wide">
            Must be before start date
          </p>
        </div>

        {/* ── Start + End Date ────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Start Date <span className="text-[#ff6b00]">*</span></label>
            <input
              type="datetime-local"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>End Date <span className="text-[#ff6b00]">*</span></label>
            <input
              type="datetime-local"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              required
              className={inputCls}
            />
          </div>
        </div>

        {/* ── Rules ───────────────────────────────────────── */}
        <div>
          <label className={labelCls}>Rules & Guidelines</label>
          <textarea
            name="rules"
            placeholder="Match rules, emulator restrictions, ping limits, code of conduct..."
            value={formData.rules}
            onChange={handleChange}
            rows={4}
            className={`${inputCls} resize-none`}
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
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-xs font-bold uppercase tracking-wider">
            ⚠️ {error}
          </div>
        )}

        {/* ── Summary before submit ───────────────────────── */}
        <div className="p-4 bg-[#07080b] border border-[#1e2330] rounded-lg space-y-1.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#4e5d78] mb-2">
            ◆ Tournament Summary
          </p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-[12px]">
            <span className="text-[#4e5d78]">Type</span>
            <span className={`font-bold uppercase ${formData.tournamentType === "paid" ? "text-[#ffaa00]" : "text-[#4ade80]"}`}>
              {formData.tournamentType}
            </span>
            <span className="text-[#4e5d78]">Mode</span>
            <span className="text-[#d0d5df] font-bold">{formData.gameMode} — {formData.teamMode}</span>
            <span className="text-[#4e5d78]">Capacity</span>
            <span className="text-[#d0d5df] font-bold">{slotInfo.total} players ({slotInfo.slots} slots)</span>
            <span className="text-[#4e5d78]">Entry Fee</span>
            <span className="text-[#ff9a00] font-bold">
              {formData.tournamentType === "free" ? "Free" : `₹${formData.entryFee}`}
            </span>
            <span className="text-[#4e5d78]">Prize Pool</span>
            <span className="text-green-400 font-bold">₹{formData.prizePool}</span>
          </div>
        </div>

        {/* ── Buttons ─────────────────────────────────────── */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-2.5 bg-gradient-to-r from-[#ff6b00] to-[#ff9a00] hover:from-[#ff7c1a] hover:to-[#ffa61a] disabled:from-[#1e2330] disabled:to-[#1e2330] text-white disabled:text-[#4e5d78] font-bold text-xs uppercase tracking-widest rounded shadow-[0_4px_12px_rgba(255,107,0,0.15)] transition-all duration-200 cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? "Creating Tournament..." : "🏆 Publish Tournament"}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-transparent border border-[#2a2e3a] text-[#8090a0] hover:text-[#d0d5df] hover:bg-[#141822] hover:border-[#4e5d78] font-bold text-xs uppercase tracking-widest rounded transition-all duration-200 cursor-pointer"
          >
            Cancel
          </button>
        </div>

      </form>
    </div>
  )
}