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
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  
  const filtered =
    context?.activePlayer?.filter(
      (p) =>
        p.userId?.username
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        p.inGameRole
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase())
    ) || [];

  const openDetails = (player) => {
    setSelectedPlayer(player);
    setDetailOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold">Player Recruitment</h3>
      </div>

      {/* Search */}
      <Input
        placeholder="Search by username or role..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Player Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
  {filtered.map((player) => (
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

        {/* Rank */}
        <p className="text-sm font-semibold text-primary">
          Rank: {player.userId?.rank}
        </p>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap justify-center gap-2 mt-1">
        {player.isCaptain && (
          <Badge variant="secondary">IGL</Badge>
        )}

        <Badge variant="outline">❤️ {player.likes}</Badge>

        {player.isActive ? (
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
        onClick={() => openDetails(player)}
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

                <Button className="w-full bg-gradient-to-r from-primary to-accent">
                  Send Team Invite
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
