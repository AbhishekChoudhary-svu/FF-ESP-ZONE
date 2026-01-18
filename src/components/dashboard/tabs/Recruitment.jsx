"use client";

import { useContext, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import MyContext from "@/context/ThemeProvider";

export function PlayerRecruitmentTab() {
  const context = useContext(MyContext);

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
        throw new Error(data.message || "Failed to send invite");
      }

      return data; // contains request object
    } catch (error) {
      console.error("INVITE PLAYER ERROR:", error);
      return { success: false, message: error.message };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold">Player Recruitment</h3>
      </div>

      <div className="flex gap-3">
        <Input
          placeholder="Search player or team..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          className="border rounded px-3 py-2 bg-background"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="recent">Recent</option>
          <option value="name">Name</option>
          <option value="active">Active</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {players.map((player) => (
          <Card
            key={player._id}
            className="bg-gradient-to-br from-primary/15 to-accent/15
              border border-primary/30 backdrop-blur-md
              rounded-xl p-4 flex flex-col items-center
              justify-between hover:scale-[1.02] transition"
          >
            {/* Avatar */}
            <div className="w-36 h-36 rounded-xl overflow-hidden shadow-lg mb-1">
              <img
                src={player.avatar}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Info */}
            <div className="text-center space-y-1">
              <h4 className="text-lg font-bold truncate">
                {player.userId?.username}
              </h4>

              <p className="text-xs text-foreground/60">
                FFUID: {player.userId?.ffUid}
              </p>

              <p className="text-sm text-foreground/70">
                {player.inGameRole} + {player.userId?.playstyle}
              </p>

              <p className="text-sm font-semibold text-primary">
                Rank: {player.userId?.rank}
              </p>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap justify-center gap-2 mt-1">
              {player.isCaptain && <Badge variant="secondary">IGL</Badge>}
              <Badge variant="outline">❤️ {player.likes}</Badge>
              {player.isActive ? (
                <Badge className="bg-green-600">Active</Badge>
              ) : (
                <Badge variant="destructive">Inactive</Badge>
              )}
            </div>

            <Button
              variant="secondary"
              size="sm"
              className="mt-1 w-full"
              onClick={() => openDetails(player)}
            >
              View Details
            </Button>
          </Card>
        ))}

        {/* Teams */}
        {teams.map((team) => (
          <Card
            key={team._id}
            className="bg-gradient-to-br from-blue-500/15 to-cyan-500/15
      border border-blue-500/30 backdrop-blur-md
      rounded-xl p-4 flex flex-col items-center
      justify-between hover:scale-[1.02] transition"
          >
            {/* Team Logo */}
            <div className="w-36 h-36 rounded-xl overflow-hidden shadow-lg mb-1">
              {team.logo ? (
                <img
                  src={team.logo}
                  alt={team.teamName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center
          bg-blue-600 text-white text-4xl font-bold"
                >
                  {team.teamName?.charAt(0)}
                </div>
              )}
            </div>

            {/* Team Info */}
            <div className="text-center space-y-1">
              <h4 className="text-lg font-bold truncate">{team.teamName}</h4>

              <p className="text-xs text-foreground/60">TAG: {team.tag}</p>

              <p className="text-sm text-foreground/70">
                Region: {team.region}
              </p>

              <p className="text-sm font-semibold text-primary">
                Tier: {team.tier}
              </p>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap justify-center gap-2 mt-1">
              {team.teamCaptain && <Badge variant="secondary">Captain</Badge>}

              <Badge variant="outline">👥 {team.players?.length || 0}</Badge>

              {team.status === "active" ? (
                <Badge className="bg-green-600">Active</Badge>
              ) : (
                <Badge variant="destructive">Inactive</Badge>
              )}
            </div>

            {/* Action */}
            <Button
              variant="secondary"
              size="sm"
              className="mt-1 w-full"
              onClick={() => openTeamDetails(team)}
            >
              View Details
            </Button>
          </Card>
        ))}
      </div>

      {/* Player Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl">
          {selectedPlayer && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {selectedPlayer.userId?.username} — Profile
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-5 gap-4 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground">Matches</p>
                    <p className="font-bold">
                      {selectedPlayer.stats?.matchesPlayed ?? 0}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">Kills</p>
                    <p className="font-bold">
                      {selectedPlayer.stats?.kills ?? 0}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">Deaths</p>
                    <p className="font-bold">
                      {selectedPlayer.stats?.deaths ?? 0}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">Assists</p>
                    <p className="font-bold">
                      {selectedPlayer.stats?.assists ?? 0}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">Win Rate</p>
                    <p className="font-bold">
                      {selectedPlayer.stats?.winRate ?? 0}%
                    </p>
                  </div>
                </div>

                {/* Photos */}
                {selectedPlayer.clipPhotos?.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Photo Clips</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedPlayer.clipPhotos.map((photo, i) => (
                        <img
                          key={i}
                          src={photo}
                          className="h-28 w-full rounded object-cover"
                          alt="clip"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Video */}
                {selectedPlayer.clipVideo && (
                  <div>
                    <h4 className="font-semibold mb-2">Video Clip</h4>
                    <video
                      src={selectedPlayer.clipVideo}
                      controls
                      className="w-full rounded h-[30vh]"
                    />
                  </div>
                )}

                <Button
                  className="w-full bg-gradient-to-r from-primary to-accent"
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
                >
                  {invitedPlayers.has(selectedPlayer._id)
                    ? "✔ Invited"
                    : "Send Team Invite"}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={teamDetailOpen} onOpenChange={setTeamDetailOpen}>
        <DialogContent className="max-w-2xl">
          {selectedTeam ? (
            <>
              <DialogHeader>
                <DialogTitle>{selectedTeam.teamName} — Team Info</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {/* Team Logo + Basic Info */}
                <div className="grid grid-cols-3 gap-4 items-center">
                  {selectedTeam.logo ? (
                    <img
                      src={selectedTeam.logo}
                      alt={selectedTeam.teamName}
                      className="w-32 h-32 rounded-full object-cover border-2 border-primary"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gray-700 flex items-center justify-center text-white text-xl">
                      {selectedTeam.teamName?.charAt(0) || "T"}
                    </div>
                  )}

                  <div className="flex flex-col gap-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Team Name</p>
                      <p className="font-semibold text-lg">
                        {selectedTeam.teamName}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">Team Tag</p>
                      <p className="font-semibold text-lg">
                        {selectedTeam.tag}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Region</p>
                      <p className="font-semibold text-lg">
                        {selectedTeam.region}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">Tier</p>
                      <p className="font-semibold text-lg">
                        {selectedTeam.tier}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Meta Info */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Team Captain
                    </p>
                    <p className="font-semibold text-lg">
                      {selectedTeam.teamCaptain?.userId?.username ||
                        "Not Assigned"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Team Status</p>
                    <p className="font-semibold text-lg">
                      {selectedTeam.status
                        ? selectedTeam.status.charAt(0).toUpperCase() +
                          selectedTeam.status.slice(1)
                        : "Inactive"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Created By</p>
                    <p className="font-semibold text-lg">
                      {selectedTeam.createdBy?.username || "Unknown"}
                    </p>
                  </div>
                </div>

                {/* Team Members */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Team Members
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    {selectedTeam.players && selectedTeam.players.length > 0 ? (
                      selectedTeam.players.map((member) => (
                        <div
                          key={member._id}
                          className="flex items-center gap-2 p-2 rounded"
                        >
                          <img
                            src={member.avatar || "/default-avatar.png"}
                            alt={member.userId?.username}
                            className="w-10 h-10 rounded-full object-cover"
                          />

                          <div className="flex flex-col">
                            <span className="text-sm font-medium">
                              {member.userId?.username}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ID: {member.userId?.ffUid}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground">No members yet</p>
                    )}
                  </div>
                </div>
              </div>
              <Button className="w-full bg-gradient-to-r from-primary to-accent">
                {" "}
                Send Join Request
              </Button>
            </>
          ) : (
            <p className="text-center text-muted-foreground">
              No team selected.
            </p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
