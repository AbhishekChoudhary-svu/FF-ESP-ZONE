"use client";

import { useContext, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EditProfileForm } from "@/components/forms/EditProfile";
import MyContext from "@/context/ThemeProvider";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CloudUpload, X, Play, User } from "lucide-react";

export function UserProfile() {
  const context = useContext(MyContext);
  const [open, setOpen] = useState(false);
  const [open1, setOpen1] = useState(false);

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

  const handleAvatarChange = async (file) => {
    setAvatarPreview(URL.createObjectURL(file)); // instant preview

    const formData = new FormData();
    formData.append("avatar", file);

    const res = await fetch("/api/uploads/avatar", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (data.success) {
      // store URL for Create Player API later
      setAvatar(data.url);
    }
  };

  const handleClipPhotosChange = async (files) => {
    const selectedFiles = Array.from(files).slice(0, 2);

    // instant preview
    setClipPhotoPreviews(selectedFiles.map((f) => URL.createObjectURL(f)));

    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append("photos", file));

    const res = await fetch("/api/uploads/photo", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (data.success) {
      // store Cloudinary URLs
      setClipPhotos(data.urls);
    }
  };

  const handleClipVideoChange = async (file) => {
    // instant preview
    setClipVideoPreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("video", file);

    const res = await fetch("/api/uploads/video", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (data.success) {
      // store Cloudinary URL (string)
      setClipVideo(data.url);
    }
  };


  const handleDeleteAvatar = async () => {
    if (!avatar) return;

    try {
      await fetch("/api/uploads/avatar", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl: avatar }),
      });

      setAvatar(null);
      setAvatarPreview(null);
    } catch (err) {
      console.error("Delete avatar error:", err);
    }
  };

  const handleDeletePhoto = async (index) => {
    const photoUrl = clipPhotos[index];

    try {
      await fetch("/api/uploads/photo", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoUrls: [photoUrl] }),
      });

      setClipPhotos((prev) => prev.filter((_, i) => i !== index));
      setClipPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
    } catch (err) {
      console.error("Delete photo error:", err);
    }
  };

  const handleDeleteVideo = async () => {
    if (!clipVideo) return;

    try {
      await fetch("/api/uploads/video", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl: clipVideo }),
      });

      setClipVideo(null);
      setClipVideoPreview(null);
    } catch (err) {
      console.error("Delete video error:", err);
    }
  };

  const openDetails = (player) => {
    setSelectedPlayer(player);
    setDetailOpen(true);
  };

  const hasPlayer = Boolean(context?.player?._id);

  useEffect(() => {
    if (hasPlayer) {
      setRole(context.player.inGameRole || "Rusher");
      setIsCaptain(context.player.isCaptain || false);
      setIsActive(context.player.isActive || false);
      setAvatar(context.player.avatar || null);
      setAvatarPreview(context.player.avatar || null);
      setClipPhotos(context.player.clipPhotos || []);
      setClipPhotoPreviews(context.player.clipPhotos || []);
      setClipVideo(context.player.clipVideo || null);
      setClipVideoPreview(context.player.clipVideo || null);
    }
  }, [hasPlayer]);

  const handleSubmitPlayer = async (e) => {
  e.preventDefault();

  if (!avatar) {
    alert("Avatar is required");
    return;
  }

  const payload = {
    avatar,
    inGameRole: role,
    isCaptain,
    isActive,
    clipPhotos,
    clipVideo,
  };

  try {
    const res = await fetch(`/api/players/${context.user.id}`, {
      method: hasPlayer ? "PATCH" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload), 
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Operation failed");
      return;
    }

    console.log("Player saved:", data.player);

    setOpen1(false);

    // refresh context
    await context.fetchUser();
    await context.fetchActivePlayers();
  } catch (err) {
    console.error("Player submit error:", err);
    alert("Something went wrong");
  }
};


  return (
    <>
      <Card className="bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 p-8 backdrop-blur-md">
        <div className="flex justify-between items-start gap-6">
          {/* LEFT */}
          <div className="flex flex-col gap-4">
            <div className="flex gap-6">
              <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center  text-3xl font-bold text-white shadow-lg">
                <img
                  src={
                    context?.player?.avatar ||
                    context?.user?.username?.charAt(0)
                  }
                  className="rounded-xl"
                  alt={""}
                />
              </div>

              <div>
                {/* Username + Provider */}
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-3xl font-bold">
                    {context?.user?.username}
                  </h2>

                  {/* Provider */}
                  {context?.user?.provider === "google" ? (
                    <img src="/google.svg" alt="Google" className="w-6 h-6" />
                  ) : (
                    <img src="/gmail.svg" alt="Google" className="w-6 h-6" />
                  )}
                </div>

                {/* UID */}
                <p className="text-foreground/70 mb-3">
                  Free Fire UID:{" "}
                  <span className="font-medium">{context?.user?.ffUid}</span>
                </p>

                {/* Bio */}
                {context?.user?.bio && (
                  <p className="text-sm text-foreground/70 mt-4 italic max-w-xl">
                    “{context?.user.bio}”
                  </p>
                )}
              </div>
            </div>
            {/* Stats */}
            <div className="grid grid-cols-5 gap-6">
              <div>
                <p className="text-sm text-foreground/60">Rank</p>
                <p className="text-lg font-semibold">{context?.user?.rank}</p>
              </div>

              <div>
                <p className="text-sm text-foreground/60">Playstyle</p>
                <p className="text-lg font-semibold">
                  {context?.user?.playstyle}
                </p>
              </div>

              <div>
                <p className="text-sm text-foreground/60">Tournaments</p>
                <p className="text-lg font-semibold">
                  {context?.user?.tournamentsJoined}
                </p>
              </div>
              <div>
                <p className="text-sm text-foreground/60">Plans</p>
                <p className="text-lg font-semibold">
                  {context?.user?.plan?.toUpperCase()}
                </p>
              </div>
              <div>
                <p className="text-sm text-foreground/60">User's Type</p>
                <p className="text-lg font-semibold">
                  {context?.user?.role === "user" ? "Player" : "Moderator"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-6">
              <div>
                <p className="text-sm text-foreground/60">Team Name</p>
                <p className="text-lg font-semibold">{"Not Joined Yet"}</p>
              </div>

              <div>
                <p className="text-sm text-foreground/60">Secondary Role</p>
                <p className="text-lg font-semibold">
                  {context?.player?.inGameRole || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-sm text-foreground/60">Likes</p>
                <p className="text-lg font-semibold">
                  {context?.player?.likes ||  "0"}
                </p>
              </div>
              <div>
                <p className="text-sm text-foreground/60">Captain/IGL</p>
                <p className="text-lg font-semibold">
                  {context?.player?.isCaptain === true ? "Yes" : "No" }
                </p>
              </div>
              <div>
                <p className="text-sm text-foreground/60">Active Status</p>
                <p className="text-lg font-semibold">
                  {context?.player?.isActive === true ? "Active" : "InActive"}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-5 gap-6">
              <div>
                <p className="text-sm text-foreground/60">Match Played</p>
                <p className="text-lg font-semibold">
                  {context?.player?.stats?.matchesPlayed  || "0"}
                </p>
              </div>

              <div>
                <p className="text-sm text-foreground/60">Win Rate</p>
                <p className="text-lg font-semibold">
                  {context?.player?.stats?.winRate  || "0"}
                </p>
              </div>

              <div>
                <p className="text-sm text-foreground/60">Kills</p>
                <p className="text-lg font-semibold">
                  {context?.player?.stats?.kills  || "0"}
                </p>
              </div>

              <div>
                <p className="text-sm text-foreground/60">Assists</p>
                <p className="text-lg font-semibold">
                  {context?.player?.stats?.assists  || "0"}
                </p>
              </div>

              <div>
                <p className="text-sm text-foreground/60">Deaths</p>
                <p className="text-lg font-semibold">
                  {context?.player?.stats?.deaths  || "0"}
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex flex-col gap-5">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary">Edit Profile</Button>
              </DialogTrigger>

              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
                </DialogHeader>

                <EditProfileForm
                  user={context?.user}
                  onClose={() => setOpen(false)}
                />
              </DialogContent>
            </Dialog>

            <Dialog open={open1} onOpenChange={setOpen1}>
              <DialogTrigger asChild>
                <Button variant="secondary">
                  {hasPlayer ? "Edit Player Details" : "Register Player"}
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle> {hasPlayer ? "Edit Player Details" : "Register Player Profile"}</DialogTitle>
                </DialogHeader>

                <form
                  onSubmit={handleSubmitPlayer}
                  className="space-y-4 p-4 bg-zinc-950 rounded-xl"
                >
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
                            e.target.files &&
                            handleAvatarChange(e.target.files[0])
                          }
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />

                        {/* Remove Button */}
                        {avatarPreview && (
                          <button
                            type="button"
                            onClick={handleDeleteAvatar}
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
                      <Select value={role} onValueChange={setRole}>
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
                      <span className="text-sm text-muted-foreground">
                        (max 2)
                      </span>
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
                            e.target.files &&
                            handleClipPhotosChange(e.target.files)
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
                                onClick={() => handleDeletePhoto(idx)}
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
                            onClick={handleDeleteVideo}
                            className="absolute top-2 right-2 bg-black/70 text-white rounded-full p-1 hover:bg-red-500 transition"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button type="submit" className="w-full">
                    {hasPlayer ? "Update Player" : "Create Player"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="secondary"
                  onClick={() => openDetails(context?.player)}
                >
                  View Clips
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                {selectedPlayer && (
                  <>
                    <DialogHeader>
                      <DialogTitle>
                        {selectedPlayer.userId.username} — Clips and Highlights
                      </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
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
                            className="w-full h-[30vh] rounded"
                          />
                        </div>
                      )}
                    </div>
                  </>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </Card>
    </>
  );
}
