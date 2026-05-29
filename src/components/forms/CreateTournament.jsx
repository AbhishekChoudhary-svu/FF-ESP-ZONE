"use client";

import { useState } from "react";

export function CreateTournamentForm({ onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    gameMode: "BR",
    teamMode: "Squad",
    totalPlayers: 48,
    entryFee: 0,
    prizePool: 0,
    startDate: "",
    endDate: "",
    rules: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name.includes("Fee") || name.includes("Pool") || name.includes("Players") ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/tournaments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to create tournament");
      }

      onClose?.();
      window.location.reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-[#0a0c10] border border-[#1e2330] rounded-lg max-h-[80vh] overflow-y-auto font-['Rajdhani'] tab-scrollbar shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
      
      {/* Form Context Identity */}
      <div className="mb-6 border-b border-[#141822] pb-3">
        <h3 className="text-lg font-['Orbitron'] font-bold text-white tracking-wider uppercase">
          🏆 Initialize New Bracket
        </h3>
        <p className="text-xs text-[#4e5d78] font-semibold uppercase tracking-wide mt-0.5">
          Fill configuration fields to deploy arena database instance
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Tournament Title */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#8090a0] mb-2">
            Tournament Name <span className="text-[#ff6b00]">*</span>
          </label>
          <input
            type="text"
            name="name"
            placeholder="e.g., Elite Squad Championship"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 bg-[#07080b] border border-[#1e2330] rounded text-[#d0d5df] placeholder-[#4e5d78] text-sm font-semibold tracking-wide focus:outline-none focus:border-[#ff6b00]/60 transition-colors"
          />
        </div>

        {/* Description Field */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#8090a0] mb-2">
            Brief Overview Description
          </label>
          <textarea
            name="description"
            placeholder="Provide dynamic rewards details or bracket format details..."
            value={formData.description}
            onChange={handleChange}
            rows="3"
            className="w-full px-3 py-2 bg-[#07080b] border border-[#1e2330] rounded text-[#d0d5df] placeholder-[#4e5d78] text-sm font-semibold tracking-wide focus:outline-none focus:border-[#ff6b00]/60 resize-none transition-colors"
          />
        </div>

        {/* Dual Select Options Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#8090a0] mb-2">
              Game Mode Mode
            </label>
            <select
              name="gameMode"
              value={formData.gameMode}
              onChange={handleChange}
              className="w-full appearance-none px-3 py-2 bg-[#07080b] border border-[#1e2330] rounded text-[#d0d5df] text-sm font-bold uppercase tracking-wider focus:outline-none focus:border-[#ff6b00]/60 cursor-pointer pr-8 transition-colors"
            >
              <option value="BR">BR (Battle Royale)</option>
              <option value="CS">CS (Clash Squad)</option>
            </select>
            <div className="absolute top-[34px] right-3 pointer-events-none text-[10px] text-[#4e5d78]">▼</div>
          </div>

          <div className="relative">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#8090a0] mb-2">
              Team Size Configuration
            </label>
            <select
              name="teamMode"
              value={formData.teamMode}
              onChange={handleChange}
              className="w-full appearance-none px-3 py-2 bg-[#07080b] border border-[#1e2330] rounded text-[#d0d5df] text-sm font-bold uppercase tracking-wider focus:outline-none focus:border-[#ff6b00]/60 cursor-pointer pr-8 transition-colors"
            >
              <option value="Solo">Solo (1v1)</option>
              <option value="Duo">Duo (2v2)</option>
              <option value="Squad">Squad (4v4)</option>
            </select>
            <div className="absolute top-[34px] right-3 pointer-events-none text-[10px] text-[#4e5d78]">▼</div>
          </div>
        </div>

        {/* Numeric Limits Inputs Row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#8090a0] mb-2">
              Total Max Slots <span className="text-[#ff6b00]">*</span>
            </label>
            <input
              type="number"
              name="totalPlayers"
              value={formData.totalPlayers}
              onChange={handleChange}
              required
              min="1"
              className="w-full px-3 py-2 bg-[#07080b] border border-[#1e2330] rounded text-[#d0d5df] text-sm font-['Orbitron'] font-bold tracking-wide focus:outline-none focus:border-[#ff6b00]/60 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#8090a0] mb-2">
              Entry Fee ($)
            </label>
            <input
              type="number"
              name="entryFee"
              value={formData.entryFee}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="w-full px-3 py-2 bg-[#07080b] border border-[#1e2330] rounded text-[#ff9a00] text-sm font-['Orbitron'] font-bold tracking-wide focus:outline-none focus:border-[#ff6b00]/60 transition-colors"
            />
          </div>
        </div>

        {/* Prize Pool Allocation Field */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#8090a0] mb-2">
            Total Guarantee Prize Pool ($) <span className="text-[#ff6b00]">*</span>
          </label>
          <input
            type="number"
            name="prizePool"
            value={formData.prizePool}
            onChange={handleChange}
            step="0.01"
            min="0"
            required
            className="w-full px-3 py-2 bg-[#07080b] border border-[#1e2330] rounded text-green-400 text-sm font-['Orbitron'] font-bold tracking-wide focus:outline-none focus:border-[#ff6b00]/60 transition-colors"
          />
        </div>

        {/* Chronology Dates Inputs Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#8090a0] mb-2">
              Launch Phase Start Date <span className="text-[#ff6b00]">*</span>
            </label>
            <input
              type="datetime-local"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-[#07080b] border border-[#1e2330] rounded text-[#d0d5df] text-sm font-semibold focus:outline-none focus:border-[#ff6b00]/60 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#8090a0] mb-2">
              Final Closure End Date <span className="text-[#ff6b00]">*</span>
            </label>
            <input
              type="datetime-local"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-[#07080b] border border-[#1e2330] rounded text-[#d0d5df] text-sm font-semibold focus:outline-none focus:border-[#ff6b00]/60 transition-colors"
            />
          </div>
        </div>

        {/* Regulatory Rules Matrix text box */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#8090a0] mb-2">
            Regulatory Guidelines & Rules
          </label>
          <textarea
            name="rules"
            placeholder="Specify matching parameters, blacklist constraints, or emulator locks..."
            value={formData.rules}
            onChange={handleChange}
            rows="3"
            className="w-full px-3 py-2 bg-[#07080b] border border-[#1e2330] rounded text-[#d0d5df] placeholder-[#4e5d78] text-sm font-semibold tracking-wide focus:outline-none focus:border-[#ff6b00]/60 resize-none transition-colors"
          />
        </div>

        {/* Dynamic Exception Notice Error Banner */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-xs font-bold uppercase tracking-wider">
            ⚠️ Exception: {error}
          </div>
        )}

        {/* Operations Execution Control Panel Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-2.5 bg-gradient-to-r from-[#ff6b00] to-[#ff9a00] hover:from-[#ff7c1a] hover:to-[#ffa61a] disabled:from-[#1e2330] disabled:to-[#1e2330] text-white disabled:text-[#4e5d78] font-bold text-xs uppercase tracking-widest rounded shadow-[0_4px_12px_rgba(255,107,0,0.15)] transition-all duration-200 cursor-pointer disabled:cursor-not-allowed active:scale-[0.99]"
          >
            {loading ? "Syncing Grid Database..." : "Publish Tournament"}
          </button>
          
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-transparent border border-[#2a2e3a] text-[#8090a0] hover:text-[#d0d5df] hover:bg-[#141822] hover:border-[#4e5d78] font-bold text-xs uppercase tracking-widest rounded transition-all duration-200 cursor-pointer active:scale-95"
          >
            Abort
          </button>
        </div>
      </form>
    </div>
  );
}