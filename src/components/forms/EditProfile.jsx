"use client";

import { useState } from "react";

export function EditProfileForm({ user, onClose }) {
  const [formData, setFormData] = useState({
    username: user?.username || "",
    ffUid: user?.ffUid || "",
    bio: user?.bio || "",
    rank: user?.rank || "Beginner",
    playstyle: user?.playstyle || "Primary Rusher",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Update failed");

      onClose();
      window.location.reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-[#0a0c10] border border-[#1e2330] rounded-lg font-['Rajdhani'] shadow-[0_10px_30px_rgba(0,0,0,0.5)] max-w-xl mx-auto">
      
      {/* Profile Section Header */}
      <div className="mb-5 border-b border-[#141822] pb-3">
        <h3 className="text-lg font-['Orbitron'] font-bold text-white tracking-wider uppercase">
          👤 Update Player Dossier
        </h3>
        <p className="text-xs text-[#4e5d78] font-semibold uppercase tracking-wide mt-0.5">
          Modify operational handles, tracking parameters, and combat playstyle options
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Username */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#8090a0] mb-2">
            Username / Handle
          </label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Username..."
            className="w-full px-3 py-2 bg-[#07080b] border border-[#1e2330] rounded text-[#d0d5df] placeholder-[#4e5d78] text-sm font-semibold tracking-wide focus:outline-none focus:border-[#ff6b00]/60 transition-colors"
          />
        </div>

        {/* Free Fire UID */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#8090a0] mb-2">
            Free Fire UID Signature
          </label>
          <input
            type="text"
            name="ffUid"
            value={formData.ffUid}
            onChange={handleChange}
            placeholder="123456789..."
            className="w-full px-3 py-2 bg-[#07080b] border border-[#1e2330] rounded text-[#d0d5df] placeholder-[#4e5d78] text-sm font-['Orbitron'] tracking-wide focus:outline-none focus:border-[#ff6b00]/60 transition-colors"
          />
        </div>

        {/* Bio Description Box */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#8090a0] mb-2">
            Personal Operational Bio
          </label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={3}
            placeholder="Tell us about your squad experience, competitive historical benchmarks, or schedule availability..."
            className="w-full px-3 py-2 bg-[#07080b] border border-[#1e2330] rounded text-[#d0d5df] placeholder-[#4e5d78] text-sm font-semibold tracking-wide focus:outline-none focus:border-[#ff6b00]/60 resize-none transition-colors"
          />
        </div>

        {/* Custom Competitive Specifications Dropdowns Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#8090a0] mb-2">
              Verified Tier Rank
            </label>
            <select
              name="rank"
              value={formData.rank}
              onChange={handleChange}
              className="w-full appearance-none px-3 py-2 bg-[#07080b] border border-[#1e2330] rounded text-[#ff9a00] text-sm font-bold uppercase tracking-wider focus:outline-none focus:border-[#ff6b00]/60 cursor-pointer pr-8 transition-colors"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Professional">Professional</option>
            </select>
            <div className="absolute top-[34px] right-3 pointer-events-none text-[10px] text-[#4e5d78]">▼</div>
          </div>

          <div className="relative">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#8090a0] mb-2">
              Strategic Tactical Playstyle
            </label>
            <select
              name="playstyle"
              value={formData.playstyle}
              onChange={handleChange}
              className="w-full appearance-none px-3 py-2 bg-[#07080b] border border-[#1e2330] rounded text-[#d0d5df] text-sm font-bold uppercase tracking-wider focus:outline-none focus:border-[#ff6b00]/60 cursor-pointer pr-8 transition-colors"
            >
              <option value="Primary Rusher">Primary Rusher</option>
              <option value="Secondary Rusher">Secondary Rusher</option>
              <option value="Assaulter / Nader">Assaulter / Nader</option>
              <option value="Sniper">Sniper</option>
            </select>
            <div className="absolute top-[34px] right-3 pointer-events-none text-[10px] text-[#4e5d78]">▼</div>
          </div>
        </div>

        {/* Exception Output Message Block */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-xs font-bold uppercase tracking-wider">
            ⚠️ Modification Error: {error}
          </div>
        )}

        {/* Panel Action Execution Array */}
        <div className="flex gap-3 pt-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-2.5 bg-gradient-to-r from-[#ff6b00] to-[#ff9a00] hover:from-[#ff7c1a] hover:to-[#ffa61a] disabled:from-[#1e2330] disabled:to-[#1e2330] text-white disabled:text-[#4e5d78] font-bold text-xs uppercase tracking-widest rounded shadow-[0_4px_12px_rgba(255,107,0,0.15)] transition-all duration-200 cursor-pointer disabled:cursor-not-allowed active:scale-[0.99]"
          >
            {loading ? "Committing Core Parameters..." : "Commit Modifications"}
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