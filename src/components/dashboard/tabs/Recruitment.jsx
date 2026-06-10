"use client";

import { useContext, useState } from "react";
import MyContext from "@/context/ThemeProvider";
import { useToast } from "@/components/ui/GameToast";

function PlayerCard({ player, onInspect, onInvite, isInvited, isCaptain }) {
  return (
    <div className="bg-[#0a0c10] border border-[#1e2330] hover:border-[#ff6b00]/40 rounded-lg p-3 sm:p-4 flex flex-col items-center justify-between hover:shadow-[0_4px_20px_rgba(255,107,0,0.08)] group transition-all duration-200 relative overflow-hidden">
      {/* Top-left corner accent */}
      <div className="absolute top-0 left-0 w-8 h-[2px] bg-[#ff6b00] opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

      {/* Avatar */}
      <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-md overflow-hidden border border-[#141822] bg-[#07080b] mb-3 flex-shrink-0">
        <img
          src={player.avatar || "/default-avatar.png"}
          alt={player.userId?.username}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Identity block */}
      <div className="text-center w-full space-y-0.5 mb-3">
        <h4 className="text-xs sm:text-sm font-['Orbitron'] font-bold text-white truncate px-1 group-hover:text-[#ff8c30] transition-colors">
          {player.userId?.username}
        </h4>
        <p className="text-[10px] text-[#4e5d78] font-semibold tracking-wider uppercase">
          UID: {player.userId?.ffUid || "N/A"}
        </p>
        <p className="text-[10px] sm:text-xs text-[#8090a0] font-medium truncate">
          {player.inGameRole} • {player.userId?.playstyle || "All-Rounder"}
        </p>
        <p className="font-bold text-[11px] text-[#ff9a00] pt-0.5">
          {player.userId?.rank || "Platinum"}
        </p>
      </div>

      {/* Tags row */}
      <div className="flex flex-wrap justify-center gap-2 w-full mb-3">
        {player.isCaptain && (
          <span className="px-1.5 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-black tracking-widest uppercase rounded-sm">
            IGL
          </span>
        )}

        <span
          className={`px-1.5 py-0.5 text-[9px] font-black tracking-widest uppercase rounded-sm border ${
            player.teamId == null
              ? "bg-[#ff9a00]/10 border-[#ff9a00]/20 text-[#ff9a00]"
              : "bg-[#1e2330] border-[#1e2330] text-[#4e5d78]"
          }`}
        >
          {player.teamId == null ? "Free Agent" : "In Squad"}
        </span>
        {player.isActive ? (
          <span className="px-1.5 py-0.5 bg-green-500/10 border border-green-500/20 text-green-400 text-[9px] font-black tracking-widest uppercase rounded-sm">
            ● Online
          </span>
        ) : (
          <span className="px-1.5 py-0.5 bg-[#1e2330] border border-[#1e2330] text-[#3a4555] text-[9px] font-black tracking-widest uppercase rounded-sm">
            Away
          </span>
        )}

        <span className="px-1.5 py-0.5 bg-[#1e2330] text-[#8090a0] text-[9px] font-bold rounded-sm">
          ❤️ {player.likes}
        </span>
      </div>

      {/* Actions */}
      <div className="w-full  space-y-1.5">
        <button
          onClick={() => onInspect?.(player)}
          className="w-full py-1.5 text-center text-[10px] font-bold uppercase tracking-wider rounded bg-[#141822] border border-[#1e2330] text-[#8090a0] hover:text-[#ff8c30] hover:border-[#ff6b00]/30 hover:bg-[#ff6b00]/5 transition-all cursor-pointer"
        >
          Inspect Profile
        </button>

        {isCaptain && (
          <button
            disabled={isInvited}
            onClick={() => onInvite?.(player)}
            className={`w-full py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-sm border transition-all cursor-pointer ${
              isInvited
                ? "bg-[#141822] border-[#2a2e3a] text-green-400 cursor-default"
                : "bg-gradient-to-r from-[#ff6b00] to-[#ff9a00] border-transparent text-white hover:from-[#ff7c1a] active:scale-[0.99]"
            }`}
          >
            {isInvited ? "✓ Invited" : "Invite to Team"}
          </button>
        )}
      </div>
    </div>
  );
}

export function PlayerRecruitmentTab() {
  const context = useContext(MyContext);

  const toast = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recent");

  const [detailOpen, setDetailOpen] = useState(false);
  const [teamDetailOpen, setTeamDetailOpen] = useState(false);

  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);

  const [invitedPlayers, setInvitedPlayers] = useState(new Set());

  const openTeamDetails = (team) => {
    setSelectedTeam(team);
    setTeamDetailOpen(true);
  };

  const openDetails = (player) => {
    setSelectedPlayer(player);
    setDetailOpen(true);
  };

  const filteredPlayers =
    context?.activePlayer?.filter(
      (p) =>
        p.userId?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.inGameRole?.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || [];

  const filteredTeams =
    context?.activeTeam?.filter(
      (t) =>
        t.teamName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.tag?.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || [];

  const sortItems = (arr) => {
    if (sortBy === "name") {
      return [...arr].sort((a, b) =>
        (a.teamName || a.userId?.username).localeCompare(
          b.teamName || b.userId?.username,
        ),
      );
    }

    if (sortBy === "active") {
      return [...arr].sort((a, b) => {
        const aActive = a.status === "active" || a.isActive;
        const bActive = b.status === "active" || b.isActive;
        return bActive - aActive;
      });
    }

    return arr;
  };

  const players = sortItems(filteredPlayers);
  const teams = sortItems(filteredTeams);

  const invitePlayer = async ({ teamId, playerId, userId }) => {
    try {
      const res = await fetch("/api/team-requests/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          teamId,
          playerId,
          userId,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(
          "Invitation Failed",
          data.message || "Failed to send invite",
        );

        throw new Error(data.message || "Failed to send invite");
      }

      toast.team("Invitation Sent", "Team invitation sent successfully");

      return data;
    } catch (error) {
      console.error("INVITE PLAYER ERROR:", error);

      toast.error("System Error", error.message || "Something went wrong");

      return {
        success: false,
        message: error.message,
      };
    }
  };

  const handleJoinRequest = async (teamId) => {
    try {
      if (!context?.player?._id || !context?.user?.id) {
        toast.login(
          "Login Required",
          "Please login before sending a join request",
        );
        return;
      }

      const res = await fetch("/api/team-requests/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teamId,
          playerId: context.player._id,
          userId: context.user.id,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        toast.error(
          "Request Failed",
          data.message || "Failed to send join request",
        );
        return;
      }

      toast.team("Request Sent", "Join request sent successfully");
    } catch (err) {
      console.error("JOIN REQUEST ERROR:", err);

      toast.error("System Error", "Something went wrong");
    }
  };

  const hasCaptain =
    String(context?.team?.teamCaptain._id) === String(context?.player?._id);

  return (
    <div className="space-y-6 font-['Rajdhani']">
      {/* Tab View Header Block */}
      <div className="flex justify-between items-center border-b border-[#141822] pb-3">
        <h3 className="text-xl font-bold font-['Orbitron'] tracking-wider text-white uppercase">
          Player Recruitment
        </h3>
      </div>

      {/* Interactive Controls Segment */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search roster or team tag..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-[#0a0c10] border border-[#1e2330] rounded text-[#d0d5df] placeholder-[#4e5d78] text-sm font-semibold tracking-wide focus:outline-none focus:border-[#ff6b00]/60 transition-colors"
          />
        </div>

        <div className="relative">
          <select
            className="w-full sm:w-40 appearance-none px-4 py-2 bg-[#0a0c10] border border-[#1e2330] rounded text-[#d0d5df] text-sm font-bold uppercase tracking-wider focus:outline-none focus:border-[#ff6b00]/60 cursor-pointer pr-10 transition-colors"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="recent">⏱ Recent</option>
            <option value="name">🔤 Alphabetical</option>
            <option value="active">⚡ Active State</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-xs text-[#4e5d78]">
            ▼
          </div>
        </div>
      </div>

      {/* Main Roster Overview Card Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
        {/* Active Player Card Render loops */}
        {players.map((player) => (
          <PlayerCard
            key={player._id}
            player={player}
            onInspect={openDetails}
            onInvite={async (p) => {
              const res = await invitePlayer({
                teamId: context.team?._id,
                playerId: p._id,
                userId: context.player?._id,
              });
              if (res.success) {
                setInvitedPlayers((prev) => new Set([...prev, p._id]));
              } else {
                alert(res.message);
              }
            }}
            isInvited={invitedPlayers.has(player._id)}
            isCaptain={hasCaptain}
          />
        ))}

        {/* Registered Team Card Render loops */}
        {teams.map((team) => (
          <div
            key={team._id}
            className="bg-[#0a0c10] border border-[#1e2330] hover:border-blue-500/40 rounded-lg p-4 flex flex-col items-center justify-between hover:shadow-[0_4px_20px_rgba(59,130,246,0.08)] group transition-all duration-200"
          >
            <div className="w-28 h-28 rounded-md overflow-hidden border border-[#141822] bg-[#07080b] flex items-center justify-center mb-3">
              {team.logo ? (
                <img
                  src={team.logo}
                  alt={team.teamName}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600/20 to-cyan-600/20 text-blue-400 font-['Orbitron'] text-3xl font-black uppercase">
                  {team.teamName?.charAt(0)}
                </div>
              )}
            </div>

            <div className="text-center w-full space-y-1 mb-3">
              <h4 className="text-base font-['Orbitron'] font-bold text-white truncate px-1">
                {team.teamName}
              </h4>
              <p className="text-[11px] text-blue-400 font-black tracking-widest uppercase">
                TAG: [{team.tag}]
              </p>
              <p className="text-xs text-[#8090a0] font-medium">
                Region: {team.region || "Global"}
              </p>
              <p className="text-xs font-bold text-cyan-400 pt-1">
                Tier: {team.tier || "Tier 3"}
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-1.5 w-full mb-4">
              <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black tracking-widest uppercase rounded-sm">
                SQUAD
              </span>
              <span className="px-2 py-0.5 bg-[#1e2330] text-[#8090a0] text-[10px] font-bold rounded-sm">
                👥 {team.players?.length || 0}/4
              </span>
              {team.status === "active" ? (
                <span className="px-2 py-0.5 bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-black tracking-widest uppercase rounded-sm">
                  ACTIVE
                </span>
              ) : (
                <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black tracking-widest uppercase rounded-sm">
                  DISBANDED
                </span>
              )}
            </div>

            <button
              onClick={() => openTeamDetails(team)}
              className="w-full py-1.5 text-center text-xs font-bold uppercase tracking-wider rounded bg-[#141822] border border-[#1e2330] text-[#8090a0] hover:text-blue-400 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all cursor-pointer"
            >
              Inspect Squad
            </button>
          </div>
        ))}

        {/* ── Empty state — shown only when both lists are empty ── */}
        {players.length === 0 && teams.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 px-6 border border-dashed border-[#1e2330] rounded-lg bg-[#07080b]">
            <div className="w-16 h-16 rounded-full bg-[#0f1318] border border-[#1e2330] flex items-center justify-center mb-4">
              <span className="text-2xl">👾</span>
            </div>
            <p className="font-['Orbitron'] font-bold text-sm text-[#d0d5df] uppercase tracking-wider mb-1">
              No Players Online
            </p>
            <p className="text-xs text-[#4e5d78] font-semibold uppercase tracking-wider text-center max-w-xs">
              No active players or squads are registered in the current
              recruitment pool. Check back later.
            </p>
            {/* Optional: show differently based on search */}
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="mt-4 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest border border-[#1e2330] rounded text-[#8090a0] hover:text-[#ff8c30] hover:border-[#ff6b00]/30 transition-all cursor-pointer"
              >
                ✕ Clear Search
              </button>
            )}
          </div>
        )}
      </div>

      {/* ================= MODAL PROFILE OVERLAYS ================= */}

      {/* Player Detail Dialog Modal */}
      {detailOpen && selectedPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0a0c10] border border-[#2a2e3a] w-full max-w-xl rounded-lg overflow-hidden relative shadow-[0_10px_40px_rgba(0,0,0,0.5)] max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-[#141822] flex justify-between items-center bg-[#0d0f15]">
              <h3 className="font-['Orbitron'] font-bold text-base text-white tracking-wide uppercase">
                ⚔️ {selectedPlayer.userId?.username} // Dossier
              </h3>
              <button
                onClick={() => setDetailOpen(false)}
                className="text-[#4e5d78] hover:text-[#ff6b00] text-sm font-bold uppercase cursor-pointer tracking-wider transition-colors"
              >
                ✕ Close
              </button>
            </div>

            <div className="p-5 space-y-6">
              {/* Performance Stats Dashboard Grid */}
              <div className="grid grid-cols-5 gap-2 bg-[#07080b] p-3 border border-[#141822] rounded">
                <div className="text-center border-r border-[#141822]/60 last:border-0">
                  <p className="text-[10px] text-[#4e5d78] uppercase font-bold tracking-wider">
                    Matches
                  </p>
                  <p className="font-['Orbitron'] text-sm font-bold text-white mt-0.5">
                    {selectedPlayer.stats?.matchesPlayed ?? 0}
                  </p>
                </div>
                <div className="text-center border-r border-[#141822]/60 last:border-0">
                  <p className="text-[10px] text-[#4e5d78] uppercase font-bold tracking-wider">
                    Kills
                  </p>
                  <p className="font-['Orbitron'] text-sm font-bold text-[#ff6b00] mt-0.5">
                    {selectedPlayer.stats?.kills ?? 0}
                  </p>
                </div>
                <div className="text-center border-r border-[#141822]/60 last:border-0">
                  <p className="text-[10px] text-[#4e5d78] uppercase font-bold tracking-wider">
                    Deaths
                  </p>
                  <p className="font-['Orbitron'] text-sm font-bold text-white mt-0.5">
                    {selectedPlayer.stats?.deaths ?? 0}
                  </p>
                </div>
                <div className="text-center border-r border-[#141822]/60 last:border-0">
                  <p className="text-[10px] text-[#4e5d78] uppercase font-bold tracking-wider">
                    Assists
                  </p>
                  <p className="font-['Orbitron'] text-sm font-bold text-white mt-0.5">
                    {selectedPlayer.stats?.assists ?? 0}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-[#4e5d78] uppercase font-bold tracking-wider">
                    Win Rate
                  </p>
                  <p className="font-['Orbitron'] text-sm font-bold text-green-400 mt-0.5">
                    {selectedPlayer.stats?.winRate ?? 0}%
                  </p>
                </div>
              </div>

              {/* Photo Clips Render Section */}
              {selectedPlayer.clipPhotos?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#8090a0]">
                    📸 Proof Matrix / Screen Caps
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedPlayer.clipPhotos.map((photo, i) => (
                      <div
                        key={i}
                        className="h-28 rounded overflow-hidden border border-[#1c212e] bg-[#07080b]"
                      >
                        <img
                          src={photo}
                          className="h-full w-full object-cover"
                          alt="Combat Media Clip"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Video Highlight Render Frame */}
              {selectedPlayer.clipVideo && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#8090a0]">
                    📹 Gameplay VOD Highlight
                  </h4>
                  <div className="border border-[#1c212e] rounded overflow-hidden bg-black">
                    <video
                      src={selectedPlayer.clipVideo}
                      controls
                      className="w-full h-48 object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Recruitment Captain Request Dispatch Engine */}
              {hasCaptain && (
                <button
                  disabled={invitedPlayers.has(selectedPlayer._id)}
                  onClick={async () => {
                    const res = await invitePlayer({
                      teamId: context.team?._id,
                      playerId: selectedPlayer._id,
                      userId: context.player?._id,
                    });

                    if (res.success) {
                      setInvitedPlayers((prev) => {
                        const updated = new Set(prev);
                        updated.add(selectedPlayer._id);
                        return updated;
                      });
                    } else {
                      alert(res.message);
                    }
                  }}
                  className={`w-full py-2.5 font-bold text-xs uppercase tracking-widest rounded-sm transition-all duration-200 border cursor-pointer ${
                    invitedPlayers.has(selectedPlayer._id)
                      ? "bg-[#141822] border-[#2a2e3a] text-green-400"
                      : "bg-gradient-to-r from-[#ff6b00] to-[#ff9a00] border-transparent text-white shadow-[0_4px_12px_rgba(255,107,0,0.2)] hover:from-[#ff7c1a] active:scale-[0.99]"
                  }`}
                >
                  {invitedPlayers.has(selectedPlayer._id)
                    ? "✓ Request Dispatched"
                    : "Send Team Invite"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Team Detail Dialog Modal */}
      {teamDetailOpen && selectedTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0a0c10] border border-[#2a2e3a] w-full max-w-xl rounded-lg overflow-hidden relative shadow-[0_10px_40px_rgba(0,0,0,0.5)] max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-[#141822] flex justify-between items-center bg-[#0d0f15]">
              <h3 className="font-['Orbitron'] font-bold text-base text-white tracking-wide uppercase">
                🛡️ {selectedTeam.teamName} // Clan Profile
              </h3>
              <button
                onClick={() => setTeamDetailOpen(false)}
                className="text-[#4e5d78] hover:text-blue-400 text-sm font-bold uppercase cursor-pointer tracking-wider transition-colors"
              >
                ✕ Close
              </button>
            </div>

            <div className="p-5 space-y-6">
              {/* Primary Identity Row */}
              <div className="flex flex-col sm:flex-row items-center gap-5 bg-[#07080b] p-4 border border-[#141822] rounded-md">
                <div className="w-20 h-20 rounded-md overflow-hidden border-2 border-blue-500/30 flex items-center justify-center bg-[#0d0f15] shrink-0">
                  {selectedTeam.logo ? (
                    <img
                      src={selectedTeam.logo}
                      alt={selectedTeam.teamName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-['Orbitron'] font-black text-blue-400">
                      {selectedTeam.teamName?.charAt(0)}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-x-6 gap-y-2 w-full text-center sm:text-left">
                  <div>
                    <p className="text-[10px] text-[#4e5d78] font-bold uppercase tracking-wider">
                      Clan Label
                    </p>
                    <p className="text-base font-bold text-white truncate">
                      {selectedTeam.teamName}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#4e5d78] font-bold uppercase tracking-wider">
                      Faction Signature
                    </p>
                    <p className="text-base font-['Orbitron'] font-bold text-blue-400">
                      [{selectedTeam.tag}]
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#4e5d78] font-bold uppercase tracking-wider">
                      Operational Area
                    </p>
                    <p className="text-sm font-semibold text-[#8090a0]">
                      {selectedTeam.region || "Global"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#4e5d78] font-bold uppercase tracking-wider">
                      Competition Bracket
                    </p>
                    <p className="text-sm font-black text-cyan-400 uppercase">
                      {selectedTeam.tier || "Tier 3"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Clan Meta Row Summary Block */}
              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div className="bg-[#0d0f15] p-2.5 rounded border border-[#141822]">
                  <span className="block text-[10px] text-[#4e5d78] font-bold uppercase">
                    Squad Leader
                  </span>
                  <span className="block font-bold text-white truncate mt-0.5">
                    {selectedTeam.teamCaptain?.userId?.username || "Vacant"}
                  </span>
                </div>
                <div className="bg-[#0d0f15] p-2.5 rounded border border-[#141822]">
                  <span className="block text-[10px] text-[#4e5d78] font-bold uppercase">
                    Status Spectrum
                  </span>
                  <span className="block font-bold text-green-400 mt-0.5 uppercase tracking-wide">
                    {selectedTeam.status || "Active"}
                  </span>
                </div>
                <div className="bg-[#0d0f15] p-2.5 rounded border border-[#141822]">
                  <span className="block text-[10px] text-[#4e5d78] font-bold uppercase">
                    Founder Identity
                  </span>
                  <span className="block font-bold text-[#8090a0] truncate mt-0.5">
                    {selectedTeam.createdBy?.username || "System"}
                  </span>
                </div>
              </div>

              {/* Active Sub-Roster Members Matrix Block */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#8090a0]">
                  👥 Registered Squad Members
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedTeam.players && selectedTeam.players.length > 0 ? (
                    selectedTeam.players.map((member) => (
                      <div
                        key={member._id}
                        className="flex items-center gap-3 p-2 rounded bg-[#07080b] border border-[#141822]"
                      >
                        <img
                          src={member.avatar || "/default-avatar.png"}
                          alt={member.userId?.username}
                          className="w-8 h-8 rounded object-cover border border-[#1e2330]"
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-[#d0d5df] truncate">
                            {member.userId?.username}
                          </span>
                          <span className="text-[10px] text-[#4e5d78] tracking-wider">
                            UID: {member.userId?.ffUid || "---"}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-[#4e5d78] font-bold uppercase italic py-2">
                      No active personnel assigned to this squad ledger.
                    </p>
                  )}
                </div>
              </div>

              {/* Action Intent Trigger */}
              <button
                onClick={() => handleJoinRequest(selectedTeam._id)}
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs uppercase tracking-widest rounded-sm transition-all duration-200 active:scale-[0.99] shadow-[0_4px_12px_rgba(59,130,246,0.2)] cursor-pointer"
              >
                Apply to Join Team
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
