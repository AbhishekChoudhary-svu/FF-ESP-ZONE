"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CloudUpload, X, Play ,User } from "lucide-react";

export function PlayerRecruitmentTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);


  const [role, setRole] = useState("Rusher");
  const [isCaptain, setIsCaptain] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const [clipPhotos, setClipPhotos] = useState([]);
  const [clipPhotoPreviews, setClipPhotoPreviews] = useState([]);

  const [clipVideo, setClipVideo] = useState(null);
  const [clipVideoPreview, setClipVideoPreview] = useState(null);


  const players = [
    {
      id: "1",
      username: "ProIGL",
      inGameRole: "IGL",
      stats: { wins: 42, kills: 380, winRate: 68 },
      likes: 120,
      clipPhotos: [
        "https://res.cloudinary.com/demo/image/upload/sample.jpg",
        "https://res.cloudinary.com/demo/image/upload/balloons.jpg",
      ],
      clipVideo: "https://res.cloudinary.com/demo/video/upload/dog.mp4",
    },
    {
      id: "2",
      username: "Deadshot",
      inGameRole: "Sniper",
      stats: { wins: 31, kills: 290, winRate: 61 },
      likes: 78,
      clipPhotos: [],
      clipVideo: "",
    },
  ];

  /* ---------------- handlers ---------------- */

  const filtered = players.filter(
    (p) =>
      p.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.inGameRole.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAvatarChange = (file) => {
    setAvatar(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleClipPhotosChange = (files) => {
    const selected = Array.from(files).slice(0, 2);
    setClipPhotos(selected);
    setClipPhotoPreviews(selected.map((f) => URL.createObjectURL(f)));
  };

  const handleClipVideoChange = (file) => {
    setClipVideo(file);
    setClipVideoPreview(URL.createObjectURL(file));
  };

  const handleRegister = (e) => {
    e.preventDefault();

    // ready for backend
    const formData = new FormData();
    formData.append("inGameRole", role);
    formData.append("isCaptain", String(isCaptain));
    if (avatar) formData.append("avatar", avatar);
    clipPhotos.forEach((p) => formData.append("clipPhotos", p));
    if (clipVideo) formData.append("clipVideo", clipVideo);

    setOpen(false);
  };

  const openDetails = (player) => {
    setSelectedPlayer(player);
    setDetailOpen(true);
  };

 

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold">Player Recruitment</h3>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">Register Player</Button>
          </DialogTrigger>

          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Register Player Profile</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleRegister} className="space-y-4 p-4 bg-zinc-950 rounded-xl">
              {/* Avatar */}
              <div className="space-y-3">
                <Label className="font-semibold">Avatar</Label>

                <div className="flex items-center gap-4">
                  {/* Upload Box */}
                  <div className="relative flex items-center justify-center w-28 h-28 rounded-full border-2 border-dashed border-muted-foreground/40 bg-muted/20 cursor-pointer hover:border-primary transition">
                    {!avatarPreview ? (
                      <div className="flex flex-col items-center text-center">
                        <User className="w-6 h-6 text-muted-foreground mb-1" />
                        <p className="text-[10px] text-muted-foreground">
                          Upload avatar
                        </p>
                      </div>
                    ) : (
                      <img
                        src={avatarPreview}
                        className="w-full h-full rounded-full object-cover"
                      />
                    )}

                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        e.target.files && handleAvatarChange(e.target.files[0])
                      }
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />

                    {/* Remove Button */}
                    {avatarPreview && (
                      <button
                        type="button"
                        onClick={() => {
                          setAvatar(null);
                          setAvatarPreview(null);
                        }}
                        className="absolute -top-2 -right-2 bg-black/80 text-white rounded-full p-1 hover:bg-red-500 transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Info */}
                  <div className="text-xs text-muted-foreground leading-relaxed">
                    <p>Square image recommended</p>
                    <p>JPG / PNG</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-6">
                {/* Role */}
                <div className="flex gap-2 ">
                  <Label>In-Game Role</Label>
                  <Select value={role} onValueChange={setRole} >
                    <SelectTrigger className={" border-2 border-black"}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Rusher">Rusher</SelectItem>
                      <SelectItem value="Support">Support</SelectItem>
                      <SelectItem value="Sniper">Sniper</SelectItem>
                      <SelectItem value="Nader">Nader</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Captain */}
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={isCaptain}
                    onCheckedChange={(v) => setIsCaptain(Boolean(v))}
                    className={"bg-black border-2 border-black"}
                  />
                  <Label>Team Captain</Label>
                </div>
                {/* isActive */}
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={isActive}
                    onCheckedChange={(v) => setIsActive(Boolean(v))}
                    className={"bg-black border-2 border-black"}
                  />
                  <Label>Active</Label>
                </div>
              </div>

              {/* Photos */}
              <div className="space-y-3">
                <Label className="font-semibold">
                  Photo Clips{" "}
                  <span className="text-sm text-muted-foreground">(max 2)</span>
                </Label>

                <div className="grid grid-cols-2 gap-2">
                  {/* Upload Box */}
                  <div className="relative flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/40 rounded-lg p-6 cursor-pointer hover:border-primary transition bg-muted/20">
                    <CloudUpload className="w-8 h-8 text-muted-foreground mb-2" />
                    <p className="text-xs text-muted-foreground">
                      Upload images here
                    </p>
                    <p className="text-xs text-muted-foreground">
                      or click to browse
                    </p>

                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      disabled={clipPhotos.length >= 2}
                      onChange={(e) =>
                        e.target.files && handleClipPhotosChange(e.target.files)
                      }
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>

                  {/* Preview Grid */}
                  {clipPhotoPreviews.length > 0 && (
                    <div className="flex w-full gap-3">
                      {clipPhotoPreviews.map((img, idx) => (
                        <div
                          key={idx}
                          className="relative rounded-lg overflow-hidden bg-muted h-[140px]"
                        >
                          <img
                            src={img}
                            alt={`clip-${idx}`}
                            className="w-full h-full object-cover"
                          />

                          {/* Remove Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setClipPhotos((prev) =>
                                prev.filter((_, i) => i !== idx)
                              );
                              setClipPhotoPreviews((prev) =>
                                prev.filter((_, i) => i !== idx)
                              );
                            }}
                            className="absolute top-2 right-2 bg-black/70 text-white rounded-full p-1 hover:bg-red-500 transition"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Video */}
              <div className="space-y-3">
                <Label className="font-semibold">Highlight Video</Label>

                <div className="grid grid-cols-2 gap-2">
                  {/* Upload Box */}
                  <div className="relative flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/40 rounded-lg p-6 cursor-pointer hover:border-primary transition bg-muted/20">
                    <CloudUpload className="w-8 h-8 text-muted-foreground mb-2" />
                    <p className="text-xs text-muted-foreground">
                      Upload highlight video
                    </p>
                    <p className="text-xs text-muted-foreground">
                      or click to browse
                    </p>

                    <input
                      type="file"
                      accept="video/*"
                      disabled={!!clipVideo}
                      onChange={(e) =>
                        e.target.files &&
                        handleClipVideoChange(e.target.files[0])
                      }
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>

                  {/* Preview */}
                  {clipVideoPreview && (
                    <div className="relative rounded-lg overflow-hidden bg-muted h-[140px]">
                      <video
                        src={clipVideoPreview}
                        className="w-full h-full object-cover"
                      />

                      {/* Play Icon Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Play className="w-8 h-8 text-white" />
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setClipVideo(null);
                          setClipVideoPreview(null);
                        }}
                        className="absolute top-2 right-2 bg-black/70 text-white rounded-full p-1 hover:bg-red-500 transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <Button type="submit" className="w-full">
                Create Player
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Input
        placeholder="Search by username or role..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Player Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map((player) => (
          <Card key={player.id} className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-bold">{player.username}</h4>
                <div className="flex gap-2 mt-2">
                  <Badge>{player.inGameRole}</Badge>
                  <Badge variant="outline">❤️ {player.likes}</Badge>
                </div>
              </div>

              <Button variant="secondary" onClick={() => openDetails(player)}>
                View Details
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Player Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl">
          {selectedPlayer && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedPlayer.username} — Profile</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Wins</p>
                    <p className="font-bold">{selectedPlayer.stats.wins}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Kills</p>
                    <p className="font-bold">{selectedPlayer.stats.kills}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Win Rate</p>
                    <p className="font-bold">{selectedPlayer.stats.winRate}%</p>
                  </div>
                </div>

                {/* Photos */}
                {selectedPlayer.clipPhotos.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Photo Clips</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedPlayer.clipPhotos.map((photo, i) => (
                        <img
                          key={i}
                          src={photo}
                          className="h-40 w-full rounded object-cover"
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
                      className="w-full rounded"
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
