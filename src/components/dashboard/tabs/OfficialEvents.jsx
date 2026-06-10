"use client";

import { useState, useEffect, useContext } from "react";
import {
  Loader2,
  X,
  Eye,
  Trophy,
  Megaphone,
  Wrench,
  Zap,
  Calendar,
  Pencil,
  Trash2,
} from "lucide-react";
import MyContext from "@/context/ThemeProvider";
import { useToast } from "@/components/ui/GameToast";

/* ── helpers ─────────────────────────────────────────────── */

function statusStyle(status) {
  switch (status) {
    case "ongoing":
      return "bg-[#4ade80]/10 text-[#4ade80] border-[#4ade80]/20";
    case "upcoming":
      return "bg-[#63b3ed]/10 text-[#63b3ed] border-[#63b3ed]/25";
    case "ended":
      return "bg-[#5a6070]/10 text-[#5a6070] border-[#5a6070]/25";
    case "cancelled":
      return "bg-red-500/10 text-red-400 border-red-500/20";
    default:
      return "bg-[#5a6070]/10 text-[#5a6070] border-[#5a6070]/25";
  }
}

function typeIcon(type) {
  switch (type) {
    case "tournament":
      return <Trophy className="w-4 h-4" />;
    case "announcement":
      return <Megaphone className="w-4 h-4" />;
    case "maintenance":
      return <Wrench className="w-4 h-4" />;
    case "update":
      return <Zap className="w-4 h-4" />;
    default:
      return <Calendar className="w-4 h-4" />;
  }
}

function formatDate(date) {
  if (!date) return "TBA";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toInputDate(date) {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d)) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/* ── Delete Confirm Dialog ───────────────────────────────── */

function DeleteConfirmDialog({ event, onClose, onConfirm, loading }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
      <div className="relative w-full max-w-sm bg-[#0a0c10] border border-red-900/40 rounded-xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.8)] font-['Rajdhani']">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent" />
        <div className="absolute top-0 left-0  w-3 h-3 border-t-2 border-l-2 border-red-500" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-red-500" />
        <div className="absolute bottom-0 left-0  w-3 h-3 border-b-2 border-l-2 border-red-500" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-red-500" />

        <div className="px-5 py-6 text-center space-y-4">
          <div className="w-12 h-12 mx-auto bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <p className="font-['Orbitron'] font-bold text-sm text-white tracking-wide">
              Delete Event?
            </p>
            <p className="text-xs text-[#8090a0] mt-1 font-semibold px-2">
              "{event.title}" will be permanently removed.
            </p>
          </div>
          <div className="flex gap-3 pt-1">
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white font-bold text-xs uppercase tracking-widest rounded-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Deleting...
                </>
              ) : (
                "🗑️ Delete"
              )}
            </button>
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3 border border-[#2a2e3a] text-[#8090a0] active:text-white active:border-[#4e5d78] font-bold text-xs uppercase tracking-widest rounded-lg transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Event Detail Dialog ─────────────────────────────────── */

function EventDetailDialog({ event, onClose }) {
  if (!event) return null;

  return (
    <div className="fixed inset-0 z-50 p-4 pb-19 flex items-end sm:items-center justify-center sm:p-4 bg-black/85 backdrop-blur-sm">
      {/* Bottom sheet on mobile, centered modal on sm+ */}
      <div className="relative w-full max-w-2xl bg-[#0a0c10] border border-[#2a2e3a] sm:rounded-xl rounded-t-2xl overflow-hidden shadow-[0_-4px_40px_rgba(0,0,0,0.7)] sm:shadow-[0_10px_40px_rgba(0,0,0,0.7)] font-['Rajdhani']">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#ff6b00] to-transparent" />
        {/* Corner accents — only on sm+ */}
        <div className="hidden sm:block absolute top-0 left-0   w-3 h-3 border-t-2 border-l-2 border-[#ff6b00]" />
        <div className="hidden sm:block absolute top-0 right-0  w-3 h-3 border-t-2 border-r-2 border-[#ff6b00]" />
        <div className="hidden sm:block absolute bottom-0 left-0  w-3 h-3 border-b-2 border-l-2 border-[#ff6b00]" />
        <div className="hidden sm:block absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#ff6b00]" />

        {/* Mobile drag handle */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-[#2a2e3a] rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-4 sm:px-6 pt-3 sm:pt-6 pb-4 border-b border-[#141822]">
          <div className="flex items-start gap-3 min-w-0">
            <div className="p-2 bg-[#ff6b00]/10 border border-[#ff6b00]/20 rounded-lg text-[#ff8c30] flex-shrink-0 mt-0.5">
              {typeIcon(event.type)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                {event.isPinned && (
                  <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-[#ff9a00]/15 border border-[#ff9a00]/30 text-[#ffaa00] rounded">
                    📌 Pinned
                  </span>
                )}
                <span
                  className={`text-[10px] font-bold tracking-widest px-2.5 py-0.5 rounded border uppercase ${statusStyle(event.status)}`}
                >
                  {event.status}
                </span>
              </div>
              <h2 className="font-['Orbitron'] text-base sm:text-lg font-black text-white tracking-wide leading-tight">
                {event.title}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#4e5d78] hover:text-red-400 active:text-red-400 transition-colors flex-shrink-0 p-1 -mr-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 max-h-[65svh] overflow-y-auto space-y-4 ff-event-scroll">
          {event.bannerImage && (
            <img
              src={event.bannerImage}
              alt={event.title}
              className="w-full h-36 sm:h-40 object-cover rounded-lg border border-[#1e2330]"
            />
          )}

          {/* Stats grid — 2 cols on mobile, 3 on sm */}
          {(event.prizePool > 0 || event.entryFee > 0 || event.startDate) && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
              {event.prizePool > 0 && (
                <div className="p-3 bg-[#07080b] border border-[#1e2330] rounded-lg text-center">
                  <p className="text-[9px] sm:text-[10px] text-[#4e5d78] uppercase tracking-wider font-bold mb-1">
                    Prize Pool
                  </p>
                  <p className="text-sm sm:text-base font-black font-['Orbitron'] text-green-400">
                    ₹{event.prizePool.toLocaleString()}
                  </p>
                </div>
              )}
              {event.entryFee > 0 && (
                <div className="p-3 bg-[#07080b] border border-[#1e2330] rounded-lg text-center">
                  <p className="text-[9px] sm:text-[10px] text-[#4e5d78] uppercase tracking-wider font-bold mb-1">
                    Entry Fee
                  </p>
                  <p className="text-sm sm:text-base font-black font-['Orbitron'] text-[#ff9a00]">
                    ₹{event.entryFee.toLocaleString()}
                  </p>
                </div>
              )}
              {event.startDate && (
                <div className="col-span-2 sm:col-span-1 p-3 bg-[#07080b] border border-[#1e2330] rounded-lg text-center">
                  <p className="text-[9px] sm:text-[10px] text-[#4e5d78] uppercase tracking-wider font-bold mb-1">
                    Starts
                  </p>
                  <p className="text-[11px] sm:text-xs font-bold text-[#d0d5df]">
                    {formatDate(event.startDate)}
                  </p>
                </div>
              )}
            </div>
          )}

          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#4e5d78] mb-2">
              ◆ Details
            </p>
            <p className="text-sm text-[#8090a0] leading-relaxed whitespace-pre-wrap">
              {event.description}
            </p>
          </div>

          {event.rules && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#4e5d78] mb-2">
                ◆ Rules
              </p>
              <div className="p-3 sm:p-4 bg-[#07080b] border border-[#1e2330] rounded-lg">
                <p className="text-sm text-[#8090a0] leading-relaxed whitespace-pre-wrap">
                  {event.rules}
                </p>
              </div>
            </div>
          )}

          {event.prizeDistribution?.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#4e5d78] mb-2">
                ◆ Prize Breakdown
              </p>
              <div className="space-y-2">
                {event.prizeDistribution.map((p, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 bg-[#07080b] border border-[#1e2330] rounded-lg"
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className="font-['Orbitron'] font-black text-sm text-[#ffaa00]">
                        #{p.placement}
                      </span>
                      <span className="text-xs sm:text-sm text-[#8090a0] font-semibold truncate max-w-[120px]">
                        {p.description}
                      </span>
                    </div>
                    <span className="font-['Orbitron'] font-black text-sm text-green-400 flex-shrink-0">
                      ₹{p.prize?.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(event.startDate || event.endDate) && (
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {event.startDate && (
                <div className="p-3 bg-[#07080b] border border-[#1e2330] rounded-lg">
                  <p className="text-[9px] sm:text-[10px] text-[#4e5d78] uppercase tracking-wider font-bold mb-1">
                    Start Date
                  </p>
                  <p className="text-[11px] sm:text-xs font-bold text-[#d0d5df]">
                    {formatDate(event.startDate)}
                  </p>
                </div>
              )}
              {event.endDate && (
                <div className="p-3 bg-[#07080b] border border-[#1e2330] rounded-lg">
                  <p className="text-[9px] sm:text-[10px] text-[#4e5d78] uppercase tracking-wider font-bold mb-1">
                    End Date
                  </p>
                  <p className="text-[11px] sm:text-xs font-bold text-[#d0d5df]">
                    {formatDate(event.endDate)}
                  </p>
                </div>
              )}
            </div>
          )}

          {event.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {event.tags.map((tag, i) => (
                <span
                  key={i}
                  className="text-[10px] font-bold uppercase tracking-wider px-2 sm:px-2.5 py-1 bg-[#ff6b00]/10 border border-[#ff6b00]/20 text-[#ff8c30] rounded"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-[#141822] text-[11px] text-[#4e5d78] font-bold uppercase tracking-wider flex-wrap gap-2">
            <span className="truncate">
              By {event.organizerName || event.organizer?.username}
            </span>
            <span className="flex items-center gap-1 flex-shrink-0">
              <Eye className="w-3.5 h-3.5" /> {event.viewCount} views
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-[#141822] flex gap-2 sm:gap-3">
          {event.registrationLink && event.status !== "ended" && (
            <a
              href={event.registrationLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 text-center bg-gradient-to-r from-[#ff6b00] to-[#ff9a00] text-white font-bold text-xs uppercase tracking-widest rounded-lg shadow-[0_4px_12px_rgba(255,107,0,0.2)] active:scale-95 transition-all"
            >
              Register Now →
            </a>
          )}
          <button
            onClick={onClose}
            className="px-4 sm:px-5 py-3 bg-transparent border border-[#2a2e3a] text-[#8090a0] active:text-white active:border-[#4e5d78] font-bold text-xs uppercase tracking-widest rounded-lg transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Shared Event Form (Create & Edit) ───────────────────── */

function EventFormDialog({ initial, onClose, onSuccess, mode = "create" }) {
  const isEdit = mode === "edit";

  const [form, setForm] = useState({
    title: initial?.title ?? "",
    summary: initial?.summary ?? "",
    description: initial?.description ?? "",
    type: initial?.type ?? "tournament",
    status: initial?.status ?? "upcoming",
    prizePool: initial?.prizePool ?? 0,
    entryFee: initial?.entryFee ?? 0,
    rules: initial?.rules ?? "",
    bannerImage: initial?.bannerImage ?? "",
    registrationLink: initial?.registrationLink ?? "",
    startDate: toInputDate(initial?.startDate),
    endDate: toInputDate(initial?.endDate),
    tags: initial?.tags?.join(", ") ?? "",
    isPublished: initial?.isPublished ?? true,
    isPinned: initial?.isPinned ?? false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type: t, checked } = e.target;
    setForm((p) => ({
      ...p,
      [name]:
        t === "checkbox"
          ? checked
          : ["prizePool", "entryFee"].includes(name)
            ? Number(value)
            : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = {
        ...form,
        tags: form.tags
          ? form.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
        startDate: form.startDate || null,
        endDate: form.endDate || null,
      };
      const url = isEdit
        ? `/api/official-events/${initial._id}`
        : "/api/official-events";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(
          data.error || `Failed to ${isEdit ? "update" : "create"} event`,
        );
        return;
      }
      onSuccess?.();
      onClose();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full px-3 py-2.5 bg-[#07080b] border border-[#1e2330] rounded-lg text-[#d0d5df] placeholder-[#4e5d78] text-sm font-semibold focus:outline-none focus:border-[#ff6b00]/60 transition-colors";
  const labelCls =
    "block text-xs font-bold uppercase tracking-wider text-[#8090a0] mb-1.5";
  const selectCls =
    "w-full appearance-none px-3 py-2.5 bg-[#07080b] border border-[#1e2330] rounded-lg text-[#d0d5df] text-sm font-bold uppercase tracking-wider focus:outline-none focus:border-[#ff6b00]/60 cursor-pointer transition-colors";

  return (
    <div className="fixed inset-0 z-50 p-4 pb-19 flex items-end sm:items-center justify-center sm:p-4 bg-black/85 backdrop-blur-sm">
      {/* Bottom sheet on mobile */}
      <div className="relative w-full max-w-2xl bg-[#0a0c10] border border-[#2a2e3a] sm:rounded-xl rounded-t-2xl overflow-hidden shadow-[0_-4px_40px_rgba(0,0,0,0.7)] sm:shadow-[0_10px_40px_rgba(0,0,0,0.7)] font-['Rajdhani']">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#ff6b00] to-transparent" />

        {/* Mobile drag handle */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-[#2a2e3a] rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-[#141822] bg-[#0d0f15]">
          <h3 className="font-['Orbitron'] font-bold text-xs sm:text-sm text-[#ffaa00] tracking-widest uppercase">
            {isEdit ? "✏️ Edit Event" : "📣 Create Official Event"}
          </h3>
          <button
            onClick={onClose}
            className="text-[#4e5d78] hover:text-red-400 active:text-red-400 transition-colors p-1 -mr-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="px-4 sm:px-6 py-4 sm:py-5 max-h-[80svh] overflow-y-auto ff-event-scroll space-y-4"
        >
          {/* Type + Status row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Event Type</label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className={selectCls}
              >
                <option value="tournament">🏆 Tournament</option>
                <option value="announcement">📣 Announcement</option>
                <option value="maintenance">🔧 Maintenance</option>
                <option value="update">⚡ Update</option>
                <option value="event">🎉 Event</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className={selectCls}
              >
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="ended">Ended</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className={labelCls}>
              Title <span className="text-[#ff6b00]">*</span>
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              placeholder="Event title..."
              className={inputCls}
            />
          </div>

          {/* Summary */}
          <div>
            <label className={labelCls}>
              Summary <span className="text-[#ff6b00]">*</span>{" "}
              <span className="normal-case text-[#4e5d78]">
                (shown on card)
              </span>
            </label>
            <input
              name="summary"
              value={form.summary}
              onChange={handleChange}
              required
              placeholder="One line summary..."
              maxLength={200}
              className={inputCls}
            />
          </div>

          {/* Description */}
          <div>
            <label className={labelCls}>
              Full Description <span className="text-[#ff6b00]">*</span>
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              placeholder="Full details..."
              rows={3}
              className={`${inputCls} resize-none`}
            />
          </div>

          {/* Prize + Entry */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Prize Pool (₹)</label>
              <input
                type="number"
                name="prizePool"
                value={form.prizePool}
                onChange={handleChange}
                min="0"
                inputMode="numeric"
                className={`${inputCls} text-green-400 font-['Orbitron'] font-bold`}
              />
            </div>
            <div>
              <label className={labelCls}>Entry Fee (₹)</label>
              <input
                type="number"
                name="entryFee"
                value={form.entryFee}
                onChange={handleChange}
                min="0"
                inputMode="numeric"
                className={`${inputCls} text-[#ff9a00] font-['Orbitron'] font-bold`}
              />
            </div>
          </div>

          {/* Dates — stacked on mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Start Date</label>
              <input
                type="datetime-local"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>End Date</label>
              <input
                type="datetime-local"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                className={inputCls}
              />
            </div>
          </div>

          {/* Rules */}
          <div>
            <label className={labelCls}>Rules</label>
            <textarea
              name="rules"
              value={form.rules}
              onChange={handleChange}
              placeholder="Match rules, restrictions..."
              rows={3}
              className={`${inputCls} resize-none`}
            />
          </div>

          {/* Banner + Registration */}
          <div>
            <label className={labelCls}>Banner Image URL</label>
            <input
              name="bannerImage"
              value={form.bannerImage}
              onChange={handleChange}
              placeholder="https://..."
              className={inputCls}
              inputMode="url"
              autoCapitalize="none"
            />
          </div>

          <div>
            <label className={labelCls}>Registration Link</label>
            <input
              name="registrationLink"
              value={form.registrationLink}
              onChange={handleChange}
              placeholder="https://..."
              className={inputCls}
              inputMode="url"
              autoCapitalize="none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className={labelCls}>
              Tags{" "}
              <span className="normal-case text-[#4e5d78]">
                (comma separated)
              </span>
            </label>
            <input
              name="tags"
              value={form.tags}
              onChange={handleChange}
              placeholder="freeFire, tournament, squad"
              className={inputCls}
            />
          </div>

          {/* Toggles */}
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="isPublished"
                checked={form.isPublished}
                onChange={handleChange}
                className="w-4 h-4 accent-[#ff6b00]"
              />
              <span className="text-xs font-bold uppercase tracking-wider text-[#8090a0]">
                Publish
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="isPinned"
                checked={form.isPinned}
                onChange={handleChange}
                className="w-4 h-4 accent-[#ffaa00]"
              />
              <span className="text-xs font-bold uppercase tracking-wider text-[#8090a0]">
                Pin to Top
              </span>
            </label>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs font-bold uppercase tracking-wider">
              ⚠️ {error}
            </div>
          )}

          <div className="flex gap-3 pt-1 pb-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-gradient-to-r from-[#ff6b00] to-[#ff9a00] text-white font-bold text-xs uppercase tracking-widest rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />{" "}
                  {isEdit ? "Saving..." : "Creating..."}
                </>
              ) : isEdit ? (
                "✏️ Save Changes"
              ) : (
                "📣 Publish Event"
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 sm:px-5 py-3 border border-[#2a2e3a] text-[#8090a0] active:text-white active:border-[#4e5d78] font-bold text-xs uppercase tracking-widest rounded-lg transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Main Tab ────────────────────────────────────────────── */

export function OfficialEventsTab() {
  const ctx = useContext(MyContext);

  const currentUser = ctx?.user;
  const userRole = currentUser?.role;
  const canCreate = ["admin", "moderator"].includes(userRole);

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [deletingEvent, setDeletingEvent] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const toast = useToast();

  const fetchEvents = async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();

      if (statusFilter !== "all") {
        params.set("status", statusFilter);
      }

      if (typeFilter !== "all") {
        params.set("type", typeFilter);
      }

      const res = await fetch(`/api/official-events?${params}`);
      const data = await res.json();

      if (!res.ok) {
        const message = data.error || "Failed to load events";

        setError(message);

        toast.error("Load Failed", message);

        return;
      }

      setEvents(data.events || []);
    } catch (err) {
      console.error(err);

      setError("Failed to connect to server");

      toast.error("Connection Error", "Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [statusFilter, typeFilter]);

  const handleViewDetail = async (event) => {
    try {
      const res = await fetch(`/api/official-events/${event._id}`);
      const data = await res.json();

      if (res.ok) {
        setSelectedEvent(data.event);
      } else {
        setSelectedEvent(event);

        toast.error("Event Load Failed", "Unable to load full event details");
      }
    } catch (err) {
      console.error(err);

      setSelectedEvent(event);

      toast.error("Connection Error", "Unable to load event details");
    }
  };

  const handleDelete = async () => {
    if (!deletingEvent) return;

    setDeleteLoading(true);

    try {
      const res = await fetch(`/api/official-events/${deletingEvent._id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error("Delete Failed", data.error || "Failed to delete event");
        return;
      }

      toast.announcement(
        "Event Removed",
        "Official event deleted successfully",
      );

      setDeletingEvent(null);

      fetchEvents();
    } catch (err) {
      console.error(err);

      toast.error("System Error", "Something went wrong");
    } finally {
      setDeleteLoading(false);
    }
  };

  const canManageEvent = (event) => {
    if (!currentUser) return false;
    if (currentUser.role === "admin") return true;
    const organizerId = event.organizer?._id ?? event.organizer;
    return String(organizerId) === String(currentUser._id);
  };

  const selectCls =
    "appearance-none px-3 py-2 bg-[#07080b] border border-[#1e2330] rounded-lg text-xs font-bold uppercase tracking-wider text-[#8090a0] focus:outline-none focus:border-[#ff6b00]/60 cursor-pointer transition-colors";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Orbitron:wght@700;900&display=swap');
        .ff-event-scroll::-webkit-scrollbar { width: 4px; }
        .ff-event-scroll::-webkit-scrollbar-track { background: #080a0f; }
        .ff-event-scroll::-webkit-scrollbar-thumb { background: #1e2330; border-radius: 3px; }
        .ff-event-scroll::-webkit-scrollbar-thumb:hover { background: #ff6b00; }
      `}</style>

      <div className="space-y-4 sm:space-y-6 font-['Rajdhani'] text-[#d0d5df]">
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between border-b border-[#141822] pb-3">
          <div>
            <h3 className="text-lg sm:text-xl font-bold font-['Orbitron'] tracking-wider text-white uppercase">
              🏅 Official Events
            </h3>
            <p className="text-[10px] sm:text-xs text-[#4e5d78] font-bold uppercase tracking-wide mt-0.5">
              Official announcements, tournaments and updates from FF-ESP-ZONE
            </p>
          </div>
          {canCreate && (
            <button
              onClick={() => setShowCreate(true)}
              className="w-full sm:w-auto px-4 py-2.5 bg-[#ff9a00]/5 border border-[#ff9a00]/20 hover:border-[#ff9a00]/60 active:border-[#ff9a00]/60 text-[#ff9a00] font-['Orbitron'] font-bold text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer active:scale-95"
            >
              + Post Event
            </button>
          )}
        </div>

        {/* ── Filters ────────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-2 sm:gap-3 bg-[#0a0c10] p-3 border border-[#1e2330] rounded-xl">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`${selectCls} flex-1 min-w-[130px]`}
          >
            <option value="all">📡 All Status</option>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="ended">Ended</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className={`${selectCls} flex-1 min-w-[130px]`}
          >
            <option value="all">🕹️ All Types</option>
            <option value="tournament">Tournament</option>
            <option value="announcement">Announcement</option>
            <option value="maintenance">Maintenance</option>
            <option value="update">Update</option>
            <option value="event">Event</option>
          </select>
        </div>

        {/* ── Content ────────────────────────────────────────────────── */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-[#ff6b00]" />
            <span className="ml-3 text-sm font-bold uppercase tracking-widest text-[#4e5d78]">
              Loading Events...
            </span>
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-[#0a0c10] border border-red-900/30 rounded-xl">
            <p className="text-sm font-bold uppercase tracking-widest text-red-400">
              ⚠️ {error}
            </p>
            <button
              onClick={fetchEvents}
              className="mt-4 px-4 py-2.5 bg-[#141822] border border-[#1e2330] text-[#8090a0] font-bold text-xs uppercase tracking-wider rounded-lg hover:border-[#ff6b00]/40 hover:text-[#ff8c30] active:scale-95 transition-all"
            >
              Retry
            </button>
          </div>
        ) : events.length > 0 ? (
          <div className="grid gap-3 sm:gap-4">
            {events.map((event) => (
              <div
                key={event._id}
                className="relative p-4 pb-16 sm:p-5 bg-[#0a0c10] border border-[#2a2e3a] rounded-xl overflow-hidden"
                style={{ boxShadow: "0 0 30px rgba(255,107,0,0.04)" }}
              >
                {/* Top gradient line */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#ff6b00] to-transparent" />
                {/* Corner accents */}
                <div className="absolute top-0 left-0   w-2.5 h-2.5 border-t-2 border-l-2 border-[#ff6b00]" />
                <div className="absolute top-0 right-0  w-2.5 h-2.5 border-t-2 border-r-2 border-[#ff6b00]" />
                <div className="absolute bottom-0 left-0  w-2.5 h-2.5 border-b-2 border-l-2 border-[#ff6b00]" />
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-[#ff6b00]" />

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                  {/* ── Card body ── */}
                  <div className="flex items-start gap-3">
                    {/* Type icon */}
                    <div className="p-2 bg-[#ff6b00]/10 border border-[#ff6b00]/20 rounded-lg text-[#ff8c30] flex-shrink-0 mt-0.5">
                      {typeIcon(event.type)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      {/* Badges */}
                      <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                        {event.isPinned && (
                          <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 bg-[#ff9a00]/15 border border-[#ff9a00]/30 text-[#ffaa00] rounded">
                            📌 Pinned
                          </span>
                        )}
                        <span
                          className={`text-[9px] sm:text-[10px] font-bold tracking-widest px-2 py-0.5 rounded border uppercase ${statusStyle(event.status)}`}
                        >
                          {event.status}
                        </span>
                        <span className="text-[9px] sm:text-[10px] font-bold tracking-widest px-2 py-0.5 rounded border uppercase bg-[#1e2330] text-[#4e5d78] border-[#2a2e3a]">
                          {event.type}
                        </span>
                      </div>

                      {/* Title */}
                      <h4 className="font-['Orbitron'] text-sm sm:text-base font-bold text-[#f0f2f5] tracking-wide mb-1 leading-snug">
                        {event.title}
                      </h4>

                      {/* Summary */}
                      <p className="text-xs sm:text-sm text-[#5a6070] leading-relaxed line-clamp-2">
                        {event.summary}
                      </p>

                      {/* Meta row */}
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        {event.prizePool > 0 && (
                          <span className="text-xs font-bold text-green-400">
                            🏆 ₹{event.prizePool.toLocaleString()}
                          </span>
                        )}
                        {event.startDate && (
                          <span className="text-xs font-semibold text-[#4e5d78]">
                            📅 {formatDate(event.startDate)}
                          </span>
                        )}
                        <span className="text-xs text-[#4e5d78] flex items-center gap-1">
                          <Eye className="w-3 h-3" /> {event.viewCount}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ── Action buttons (full width row below on mobile) ── */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {/* View Details */}
                    <button
                      onClick={() => handleViewDetail(event)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-[#141822] border border-[#1e2330] hover:border-[#ff6b00]/40 active:border-[#ff6b00]/40 text-[#8090a0] hover:text-[#ff8c30] active:text-[#ff8c30] font-['Orbitron'] font-bold text-[10px] uppercase tracking-wider rounded-lg transition-all cursor-pointer active:scale-95"
                    >
                      <Eye className="w-3.5 h-3.5" /> View
                    </button>

                    {/* Participate */}
                    {event.status === "ongoing" && event.registrationLink && (
                      <a
                        href={event.registrationLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center px-3 py-2 bg-gradient-to-r from-[#ff6b00] to-[#ff9a00] text-white font-['Orbitron'] font-bold text-[10px] uppercase tracking-wider rounded-lg shadow-[0_4px_12px_rgba(255,107,0,0.2)] active:scale-95 transition-all"
                      >
                        Participate →
                      </a>
                    )}

                    {/* Edit / Delete */}
                    {canManageEvent(event) && (
                      <>
                        <button
                          onClick={() => setEditingEvent(event)}
                          className="flex items-center gap-1.5 px-3 py-2 bg-[#141822] border border-[#1e2330] hover:border-[#78ff30]/40 active:border-[#78ff30]/40 text-[#8090a0] hover:text-[#78ff30] active:text-[#78ff30] font-['Orbitron'] font-bold text-[10px] uppercase tracking-wider rounded-lg transition-all cursor-pointer active:scale-95"
                        >
                          <Pencil className="w-3 h-3" /> Edit
                        </button>
                        <button
                          onClick={() => setDeletingEvent(event)}
                          className="flex items-center gap-1.5 px-3 py-2 bg-[#141822] border border-[#1e2330] hover:border-red-500/40 active:border-red-500/40 text-[#8090a0] hover:text-red-400 active:text-red-400 font-['Orbitron'] font-bold text-[10px] uppercase tracking-wider rounded-lg transition-all cursor-pointer active:scale-95"
                        >
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-[#0a0c10] border border-[#1e2330] rounded-xl">
            <p className="text-sm font-bold uppercase tracking-widest text-[#4e5d78]">
              📡 No Official Events Found
            </p>
            <p className="text-xs text-[#4e5d78]/60 uppercase tracking-wider mt-1">
              Check back later for announcements
            </p>
          </div>
        )}
      </div>

      {/* Dialogs */}
      {selectedEvent && (
        <EventDetailDialog
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
      {showCreate && (
        <EventFormDialog
          mode="create"
          onClose={() => setShowCreate(false)}
          onSuccess={fetchEvents}
        />
      )}
      {editingEvent && (
        <EventFormDialog
          mode="edit"
          initial={editingEvent}
          onClose={() => setEditingEvent(null)}
          onSuccess={fetchEvents}
        />
      )}
      {deletingEvent && (
        <DeleteConfirmDialog
          event={deletingEvent}
          loading={deleteLoading}
          onClose={() => setDeletingEvent(null)}
          onConfirm={handleDelete}
        />
      )}
    </>
  );
}
