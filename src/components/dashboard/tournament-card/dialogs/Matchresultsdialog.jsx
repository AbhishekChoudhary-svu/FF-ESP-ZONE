"use client";

import { useEffect, useState, useContext } from "react";
import { Loader2 } from "lucide-react";
import MyContext from "@/context/ThemeProvider";
import { useToast } from "@/components/ui/GameToast";

// ── Point tables (mirrors server) ────────────────────────────

const BR_SQUAD_DUO_TABLE = {
  1: 12,
  2: 9,
  3: 8,
  4: 7,
  5: 6,
  6: 5,
  7: 4,
  8: 3,
  9: 2,
  10: 1,
};
const BR_SOLO_TABLE = {
  1: 15,
  2: 12,
  3: 10,
  4: 8,
  5: 7,
  6: 6,
  7: 5,
  8: 4,
  9: 3,
  10: 2,
};

function calcPoints(gameMode, teamMode, row) {
  if (gameMode === "CS") {
    const matchPts = (Number(row.matchWins) || 0) * 3;
    const roundPts = Number(row.roundsWon) || 0;
    return {
      placementPoints: matchPts,
      killPoints: roundPts,
      total: matchPts + roundPts,
    };
  }
  const table = teamMode === "Solo" ? BR_SOLO_TABLE : BR_SQUAD_DUO_TABLE;
  const placementPoints = table[Number(row.placement)] ?? 0;
  const killPoints = (Number(row.kills) || 0) * 1;
  return { placementPoints, killPoints, total: placementPoints + killPoints };
}

// ── Dialog wrapper ────────────────────────────────────────────

function Dialog({ open, onClose, title, children, maxWidth = "max-w-2xl" }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div
        className={`relative w-full ${maxWidth} bg-[#0a0c10] border border-[#2a2e3a] rounded-xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.7)] font-['Rajdhani']`}
      >
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#ff6b00] to-transparent" />
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#141822] bg-[#0d0f15]">
          <h3 className="font-['Orbitron'] font-bold text-sm text-white tracking-widest uppercase">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-[#4e5d78] hover:text-red-400 transition-colors text-lg leading-none"
          >
            ✕
          </button>
        </div>
        <div className="px-6 py-5 max-h-[80vh] overflow-y-auto tab-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}

// ── Point System Reference Card ───────────────────────────────

function PointSystemCard({ gameMode, teamMode }) {
  if (gameMode === "CS") {
    return (
      <div className="p-4 bg-[#07080b] border border-[#1e2330] rounded-lg">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#4e5d78] mb-3">
          ◆ CS Point System
        </p>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex justify-between">
            <span className="text-[#8090a0]">Match Win</span>
            <span className="font-black font-['Orbitron'] text-[#4ade80]">
              3 pts
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8090a0]">Match Loss</span>
            <span className="font-black font-['Orbitron'] text-red-400">
              0 pts
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8090a0]">Each Round Won</span>
            <span className="font-black font-['Orbitron'] text-[#ffaa00]">
              +1 pt
            </span>
          </div>
        </div>
      </div>
    );
  }

  const table = teamMode === "Solo" ? BR_SOLO_TABLE : BR_SQUAD_DUO_TABLE;
  const entries = Object.entries(table);

  return (
    <div className="p-4 bg-[#07080b] border border-[#1e2330] rounded-lg">
      <p className="text-[10px] font-bold uppercase tracking-widest text-[#4e5d78] mb-3">
        ◆ {gameMode} {teamMode} Point System
      </p>
      <div className="grid grid-cols-2 gap-x-6 gap-y-1">
        {entries.map(([place, pts]) => (
          <div key={place} className="flex justify-between text-xs">
            <span className="text-[#8090a0]">#{place} Place</span>
            <span className="font-black font-['Orbitron'] text-[#ffaa00]">
              {pts} pts
            </span>
          </div>
        ))}
        <div className="flex justify-between text-xs col-span-2 border-t border-[#1e2330] pt-1 mt-1">
          <span className="text-[#8090a0]">Each Kill</span>
          <span className="font-black font-['Orbitron'] text-[#63b3ed]">
            +1 pt
          </span>
        </div>
      </div>
    </div>
  );
}

// ── BR Result Row ─────────────────────────────────────────────

function BRRow({ row, index, onUpdate, totalParticipants, teamMode }) {
  const pts = calcPoints("BR", teamMode, row);

  const inputCls =
    "w-full px-2 py-1.5 bg-[#07080b] border border-[#1e2330] rounded text-[#d0d5df] text-xs font-bold focus:outline-none focus:border-[#ff6b00]/60 transition-colors font-['Orbitron'] text-center";

  return (
    <div
      className={`p-3 bg-[#07080b] border rounded-lg space-y-3 ${row.isDisqualified ? "border-red-900/40 opacity-60" : "border-[#1e2330]"}`}
    >
      {/* Name + DQ toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {row.teamLogo || row.avatar ? (
            <img
              src={row.teamLogo || row.avatar}
              className="w-7 h-7 rounded object-cover border border-[#2a2e3a]"
              alt=""
            />
          ) : (
            <div className="w-7 h-7 rounded bg-[#1a1f2e] border border-[#2a2e3a] flex items-center justify-center">
              <span className="text-[10px] font-black text-[#ff8c30]">
                {row.name?.charAt(0)}
              </span>
            </div>
          )}
          <div>
            <p className="text-xs font-bold text-[#d0d5df]">{row.name}</p>
            <p className="text-[10px] text-[#4e5d78]">Slot #{index + 1}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-['Orbitron'] font-black text-sm text-[#ffaa00]">
            {pts.total} pts
          </span>
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={row.isDisqualified}
              onChange={(e) =>
                onUpdate(index, "isDisqualified", e.target.checked)
              }
              className="w-3.5 h-3.5 accent-red-500"
            />
            <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider">
              DQ
            </span>
          </label>
        </div>
      </div>

      {/* Input grid */}
      <div className="grid grid-cols-5 gap-2">
        <div>
          <p className="text-[9px] text-[#4e5d78] uppercase tracking-wider font-bold mb-1 text-center">
            Place
          </p>
          <input
            type="number"
            min="1"
            max={totalParticipants}
            placeholder="#"
            value={row.placement}
            onChange={(e) => onUpdate(index, "placement", e.target.value)}
            className={inputCls}
            disabled={row.isDisqualified}
          />
        </div>
        <div>
          <p className="text-[9px] text-[#4e5d78] uppercase tracking-wider font-bold mb-1 text-center">
            Kills
          </p>
          <input
            type="number"
            min="0"
            value={row.kills}
            onChange={(e) => onUpdate(index, "kills", e.target.value)}
            className={inputCls}
            disabled={row.isDisqualified}
          />
        </div>
        <div>
          <p className="text-[9px] text-[#4e5d78] uppercase tracking-wider font-bold mb-1 text-center">
            Assists
          </p>
          <input
            type="number"
            min="0"
            value={row.assists}
            onChange={(e) => onUpdate(index, "assists", e.target.value)}
            className={inputCls}
            disabled={row.isDisqualified}
          />
        </div>
        <div>
          <p className="text-[9px] text-[#4e5d78] uppercase tracking-wider font-bold mb-1 text-center">
            Deaths
          </p>
          <input
            type="number"
            min="0"
            value={row.deaths}
            onChange={(e) => onUpdate(index, "deaths", e.target.value)}
            className={inputCls}
            disabled={row.isDisqualified}
          />
        </div>
        <div>
          <p className="text-[9px] text-[#4e5d78] uppercase tracking-wider font-bold mb-1 text-center">
            Prize ₹
          </p>
          <input
            type="number"
            min="0"
            value={row.prize}
            onChange={(e) => onUpdate(index, "prize", e.target.value)}
            className={`${inputCls} text-green-400`}
          />
        </div>
      </div>

      {/* Points breakdown */}
      <div className="flex gap-3 text-[10px] font-bold">
        <span className="text-[#4e5d78]">
          Place:{" "}
          <span className="text-[#ffaa00]">{pts.placementPoints}pts</span>
        </span>
        <span className="text-[#4e5d78]">
          Kills: <span className="text-[#63b3ed]">{pts.killPoints}pts</span>
        </span>
        <span className="text-[#4e5d78]">
          Total: <span className="text-white font-black">{pts.total}pts</span>
        </span>
      </div>

      {/* DQ reason */}
      {row.isDisqualified && (
        <input
          placeholder="Disqualification reason..."
          value={row.disqualifyReason}
          onChange={(e) => onUpdate(index, "disqualifyReason", e.target.value)}
          className="w-full px-3 py-1.5 bg-red-950/20 border border-red-900/40 rounded text-red-300 text-xs font-semibold focus:outline-none"
        />
      )}
    </div>
  );
}

// ── CS Result Row ─────────────────────────────────────────────

function CSRow({ row, index, onUpdate }) {
  const pts = calcPoints("CS", "Squad", row);

  const inputCls =
    "w-full px-2 py-1.5 bg-[#07080b] border border-[#1e2330] rounded text-[#d0d5df] text-xs font-bold focus:outline-none focus:border-[#ff6b00]/60 transition-colors font-['Orbitron'] text-center";

  return (
    <div
      className={`p-3 bg-[#07080b] border rounded-lg space-y-3 ${row.isDisqualified ? "border-red-900/40 opacity-60" : "border-[#1e2330]"}`}
    >
      {/* Name + points */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {row.teamLogo ? (
            <img
              src={row.teamLogo}
              className="w-7 h-7 rounded object-cover border border-[#2a2e3a]"
              alt=""
            />
          ) : (
            <div className="w-7 h-7 rounded bg-[#1a1f2e] border border-[#2a2e3a] flex items-center justify-center">
              <span className="text-[10px] font-black text-[#ff8c30]">
                {row.name?.charAt(0)}
              </span>
            </div>
          )}
          <p className="text-xs font-bold text-[#d0d5df]">{row.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-['Orbitron'] font-black text-sm text-[#ffaa00]">
            {pts.total} pts
          </span>
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={row.isDisqualified}
              onChange={(e) =>
                onUpdate(index, "isDisqualified", e.target.checked)
              }
              className="w-3.5 h-3.5 accent-red-500"
            />
            <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider">
              DQ
            </span>
          </label>
        </div>
      </div>

      {/* CS inputs */}
      <div className="grid grid-cols-5 gap-2">
        {[
          { label: "Wins", field: "matchWins", color: "text-[#4ade80]" },
          { label: "Losses", field: "matchLosses", color: "text-red-400" },
          { label: "Rnd Won", field: "roundsWon", color: "text-[#63b3ed]" },
          { label: "Rnd Lost", field: "roundsLost", color: "text-[#8090a0]" },
          { label: "Prize ₹", field: "prize", color: "text-green-400" },
        ].map((f, fi) => (
          <div key={fi}>
            <p className="text-[9px] text-[#4e5d78] uppercase tracking-wider font-bold mb-1 text-center">
              {f.label}
            </p>
            <input
              type="number"
              min="0"
              value={row[f.field]}
              onChange={(e) => onUpdate(index, f.field, e.target.value)}
              className={`${inputCls} ${f.color}`}
              disabled={row.isDisqualified}
            />
          </div>
        ))}
      </div>

      {/* Points breakdown */}
      <div className="flex gap-3 text-[10px] font-bold">
        <span className="text-[#4e5d78]">
          Match pts:{" "}
          <span className="text-[#ffaa00]">{pts.placementPoints}pts</span>
        </span>
        <span className="text-[#4e5d78]">
          Round pts: <span className="text-[#63b3ed]">{pts.killPoints}pts</span>
        </span>
        <span className="text-[#4e5d78]">
          Total: <span className="text-white font-black">{pts.total}pts</span>
        </span>
      </div>

      {row.isDisqualified && (
        <input
          placeholder="Disqualification reason..."
          value={row.disqualifyReason}
          onChange={(e) => onUpdate(index, "disqualifyReason", e.target.value)}
          className="w-full px-3 py-1.5 bg-red-950/20 border border-red-900/40 rounded text-red-300 text-xs font-semibold focus:outline-none"
        />
      )}
    </div>
  );
}

// ── Main MatchResultsDialog ───────────────────────────────────

export function MatchResultsDialog({ open, onClose, tournament, onSuccess }) {
  const [fetching, setFetching] = useState(false);
  const [rows, setRows] = useState([]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [existing, setExisting] = useState(null);

  const toast = useToast();

  const gameMode = tournament?.gameMode;
  const teamMode = tournament?.teamMode;
  const isCS = gameMode === "CS";

  // Fetch populated participants + any existing result
  useEffect(() => {
    if (!open || !tournament?._id) return;
    setFetching(true);
    setRows([]);

    Promise.all([
      fetch(`/api/tournaments/${tournament._id}`).then((r) => r.json()),
      fetch(`/api/tournaments/${tournament._id}/results`)
        .then((r) => r.json())
        .catch(() => ({ success: false })),
    ])
      .then(([tData, rData]) => {
        const participants = tData.tournament?.participants ?? [];

        // Build base rows from participants
        const baseRows = participants.map((p, i) => ({
          playerId: p.player?._id ?? p.player ?? null,
          teamId: p.team?._id ?? p.team ?? null,
          name:
            p.team?.teamName ?? p.player?.userId?.username ?? `Slot ${i + 1}`,
          teamLogo: p.team?.logo ?? null,
          avatar: p.player?.avatar ?? null,
          // BR fields
          placement: p.placement ?? "",
          kills: p.kills ?? 0,
          assists: 0,
          deaths: 0,
          // CS fields
          matchWins: 0,
          matchLosses: 0,
          roundsWon: 0,
          roundsLost: 0,
          // Common
          prize: 0,
          isDisqualified: false,
          disqualifyReason: "",
        }));

        // If existing results, overlay them
        if (rData.success && rData.result?.results?.length > 0) {
          setExisting(rData.result);
          setNotes(rData.result.notes ?? "");
          const resultMap = {};
          rData.result.results.forEach((r) => {
            if (r.player?._id || r.player) {
              resultMap[(r.player?._id ?? r.player).toString()] = r;
            }
          });
          baseRows.forEach((row, i) => {
            const key = row.playerId?.toString();
            if (key && resultMap[key]) {
              const ex = resultMap[key];
              baseRows[i] = {
                ...row,
                placement: ex.placement ?? "",
                kills: ex.kills ?? 0,
                assists: ex.assists ?? 0,
                deaths: ex.deaths ?? 0,
                matchWins: ex.matchWins ?? 0,
                matchLosses: ex.matchLosses ?? 0,
                roundsWon: ex.roundsWon ?? 0,
                roundsLost: ex.roundsLost ?? 0,
                prize: ex.prize ?? 0,
                isDisqualified: ex.isDisqualified ?? false,
                disqualifyReason: ex.disqualifyReason ?? "",
              };
            }
          });
        }

        setRows(baseRows);
      })
      .catch(() => {})
      .finally(() => setFetching(false));
  }, [open, tournament?._id]);

  const updateRow = (index, field, value) => {
    setRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)),
    );
  };

  // Auto-sort by total points for leaderboard preview
  const sortedByPoints = [...rows]
    .filter((r) => !r.isDisqualified)
    .sort(
      (a, b) =>
        calcPoints(gameMode, teamMode, b).total -
        calcPoints(gameMode, teamMode, a).total,
    );

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate — all non-DQ rows must have placement for BR
    if (!isCS) {
      const missing = rows.filter((r) => !r.isDisqualified && !r.placement);

      if (missing.length > 0) {
        toast.error(
          "Validation Failed",
          "Enter placement for all non-disqualified participants",
        );
        return;
      }
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/tournaments/${tournament._id}/results`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rows,
          notes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(
          "Submission Failed",
          data.error || "Failed to submit results",
        );
        return;
      }

      toast.result(
        "Results Published",
        "Tournament results submitted and player statistics updated",
      );

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error(err);

      toast.error("System Error", "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="📊 Submit Match Results"
      maxWidth="max-w-3xl"
    >
      {fetching ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-[#ff6b00]" />
          <span className="ml-3 text-sm font-bold uppercase tracking-widest text-[#4e5d78]">
            Loading participants...
          </span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Info banner */}
          <div className="p-3 bg-[#07080b] border border-[#63b3ed]/20 rounded-lg">
            <p className="text-xs text-[#63b3ed] font-bold uppercase tracking-wider">
              ℹ️{" "}
              {existing
                ? "Updating existing results."
                : "First time submitting."}{" "}
              Submitting marks tournament completed and auto-updates all player
              stats, win rates and tournament history.
            </p>
          </div>

          {/* Point system reference */}
          <PointSystemCard gameMode={gameMode} teamMode={teamMode} />

          {/* Tournament info */}
          <div className="flex gap-3">
            <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 bg-[#ff6b00]/15 text-[#ff8c30] border border-[#ff6b00]/30 rounded">
              {gameMode}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 bg-[#63b3ed]/10 text-[#63b3ed] border border-[#63b3ed]/25 rounded">
              {teamMode}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 bg-[#1e2330] text-[#4e5d78] border border-[#2a2e3a] rounded">
              {rows.length} Participants
            </span>
          </div>

          {/* Result rows */}
          {rows.length === 0 ? (
            <div className="text-center py-10 text-[#4e5d78] text-sm font-bold uppercase tracking-wider">
              No participants registered yet
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#4e5d78]">
                ◆ Enter Results
              </p>
              {rows.map((row, i) =>
                isCS ? (
                  <CSRow key={i} row={row} index={i} onUpdate={updateRow} />
                ) : (
                  <BRRow
                    key={i}
                    row={row}
                    index={i}
                    onUpdate={updateRow}
                    totalParticipants={rows.length}
                    teamMode={teamMode}
                  />
                ),
              )}
            </div>
          )}

          {/* Live leaderboard preview */}
          {sortedByPoints.length > 0 && (
            <div className="p-4 bg-[#07080b] border border-[#1e2330] rounded-lg">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#4e5d78] mb-3">
                ◆ Live Leaderboard Preview
              </p>
              <div className="space-y-1.5">
                {sortedByPoints.map((row, i) => {
                  const pts = calcPoints(gameMode, teamMode, row);
                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between px-3 py-2 bg-[#0a0c10] border border-[#1e2330] rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`font-['Orbitron'] font-black text-sm w-6 ${
                            i === 0
                              ? "text-[#ffaa00]"
                              : i === 1
                                ? "text-[#8090a0]"
                                : i === 2
                                  ? "text-[#cd7f32]"
                                  : "text-[#4e5d78]"
                          }`}
                        >
                          #{i + 1}
                        </span>
                        <span className="text-sm font-bold text-[#d0d5df]">
                          {row.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs font-bold">
                        {!isCS && (
                          <>
                            <span className="text-[#4e5d78]">
                              Place{" "}
                              <span className="text-[#ffaa00]">
                                {pts.placementPoints}p
                              </span>
                            </span>
                            <span className="text-[#4e5d78]">
                              Kills{" "}
                              <span className="text-[#63b3ed]">
                                {pts.killPoints}p
                              </span>
                            </span>
                          </>
                        )}
                        <span className="font-['Orbitron'] font-black text-white">
                          {pts.total} pts
                        </span>
                        {row.prize > 0 && (
                          <span className="text-green-400">
                            ₹{Number(row.prize).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#4e5d78] mb-2">
              Admin Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any notes about the match, disputes, etc..."
              rows={2}
              className="w-full px-3 py-2 bg-[#07080b] border border-[#1e2330] rounded text-[#d0d5df] placeholder-[#4e5d78] text-sm font-semibold focus:outline-none focus:border-[#ff6b00]/60 transition-colors resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading || rows.length === 0}
              className="flex-1 py-2.5 bg-gradient-to-r from-[#ff6b00] to-[#ff9a00] text-white font-bold text-xs uppercase tracking-widest rounded disabled:opacity-50 transition-all"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Submitting...
                </span>
              ) : existing ? (
                "📊 Update Results"
              ) : (
                "📊 Submit Final Results"
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-[#2a2e3a] text-[#8090a0] hover:text-white font-bold text-xs uppercase tracking-widest rounded transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </Dialog>
  );
}
