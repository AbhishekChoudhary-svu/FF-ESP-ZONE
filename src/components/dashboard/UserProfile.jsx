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
import { Input } from "@/components/ui/input";

export function UserProfile() {
  const context = useContext(MyContext);
  const [open, setOpen] = useState(false);
  const [open1, setOpen1] = useState(false);
  const [openTeam, setOpenTeam] = useState(false);

  const [open3, setOpen3] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [teamDetailOpen, setTeamDetailOpen] = useState(false);
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

  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const [teamName, setTeamName] = useState("");
  const [tag, setTag] = useState("");

  const [status, setStatus] = useState("active");
  const [tier, setTier] = useState("Amateur");

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

  const handleLogoChange = async (file) => {
    // instant preview
    setLogoPreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("logo", file);

    try {
      const res = await fetch("/api/uploads/logo", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Logo upload failed");
        return;
      }

      setLogo(data.logoUrl);
    } catch (err) {
      console.error("Logo upload error:", err);
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

  const removeLogo = async () => {
    if (!logo) return;

    try {
      await fetch("/api/uploads/logo", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logoUrl: logo }),
      });

      setLogo(null);
      setLogoPreview(null);
    } catch (err) {
      console.error("Delete logo error:", err);
    }
  };

  const openDetails = (player) => {
    setSelectedPlayer(player);
    setDetailOpen(true);
  };
  const openRequest = (req) => {
    setSelectedRequest(req);
    setOpen3(true);
  };

  const hasPlayer = Boolean(context?.player?._id);
  const hasTeam = Boolean(context?.team?._id);

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

  useEffect(() => {
    if (hasTeam) {
      setTeamName(context.team.teamName || "");
      setTag(context.team.tag || "");
      setLogo(context.team.logo || "");
      setLogoPreview(context.team.logo || "");
      setStatus(context.team.status || "active");
      setTier(context.team.tier || "Amateur");
    }
  }, [hasTeam]);

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

  const handleSubmitTeam = async (e) => {
    e.preventDefault();

    const payload = {
      teamName,
      tag,
      logo,
      status,
      tier,
    };

    const res = await fetch(
      hasTeam
        ? `/api/teams/${context?.player?._id}`
        : `/api/teams/${context?.player?._id}`,
      {
        method: hasTeam ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    const data = await res.json();

    if (data.success) {
      setOpenTeam(false);
    }
  };

  const handleAccept = async (requestId) => {
  try {
    const res = await fetch("/api/team-requests/accept", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        requestId,
        playerId: context.player._id, // IMPORTANT
      }),
    });

    const data = await res.json();

    if (!data.success) {
      alert(data.message || "Failed to accept request");
      return;
    }

    alert("Request accepted successfully 🎉");

    // 🔄 Refresh data
    setOpen3(false)
    context.fetchTeam(context.player._id);
    context.fetchPlayer(context.user.id);
    context.fetchPlayerRequests?.(); // if you added this in context
  } catch (error) {
    console.error("ACCEPT REQUEST ERROR:", error);
    alert("Something went wrong");
  }
};


  const handleReject = async (requestId) => {
  try {
    const res = await fetch("/api/team-requests/reject", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ requestId, playerId: context.player._id }),
    });

    const data = await res.json();

    if (data.success) {
      setOpen(false)
      console.log("Request rejected successfully:", data.message);
    } else {
      console.error("Failed to reject request:", data.message);
    }
  } catch (error) {
    console.error("Error rejecting request:", error);
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
                <p className="text-lg font-semibold">
                  {context?.team?.teamName || "Not Joined Yet"}
                </p>
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
                  {context?.player?.likes || "0"}
                </p>
              </div>
              <div>
                <p className="text-sm text-foreground/60">Captain/IGL</p>
                <p className="text-lg font-semibold">
                  {context?.player?.isCaptain === true ? "Yes" : "No"}
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
                  {context?.player?.stats?.matchesPlayed || "0"}
                </p>
              </div>

              <div>
                <p className="text-sm text-foreground/60">Win Rate</p>
                <p className="text-lg font-semibold">
                  {context?.player?.stats?.winRate || "0"}
                </p>
              </div>

              <div>
                <p className="text-sm text-foreground/60">Kills</p>
                <p className="text-lg font-semibold">
                  {context?.player?.stats?.kills || "0"}
                </p>
              </div>

              <div>
                <p className="text-sm text-foreground/60">Assists</p>
                <p className="text-lg font-semibold">
                  {context?.player?.stats?.assists || "0"}
                </p>
              </div>

              <div>
                <p className="text-sm text-foreground/60">Deaths</p>
                <p className="text-lg font-semibold">
                  {context?.player?.stats?.deaths || "0"}
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
                  <DialogTitle>
                    {" "}
                    {hasPlayer
                      ? "Edit Player Details"
                      : "Register Player Profile"}
                  </DialogTitle>
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

            <Dialog open={openTeam} onOpenChange={setOpenTeam}>
              <DialogTrigger asChild>
                <Button variant="secondary">
                  {hasTeam ? "Edit Team" : "Create Team"}
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>
                    {hasTeam ? "Edit Team Details" : "Create Team"}
                  </DialogTitle>
                </DialogHeader>

                <form
                  onSubmit={handleSubmitTeam}
                  className="space-y-4 p-4 bg-zinc-950 rounded-xl"
                >
                  {/* Team Logo */}
                  <div className="space-y-3">
                    <Label className="font-semibold">Team Logo</Label>

                    <div className="flex items-center gap-4">
                      <div className="relative flex items-center justify-center w-28 h-28 rounded-full border-2 border-dashed border-muted-foreground/40 bg-muted/20 cursor-pointer">
                        {!logoPreview ? (
                          <p className="text-xs text-muted-foreground">
                            Upload Logo
                          </p>
                        ) : (
                          <img
                            src={logoPreview}
                            className="w-full h-full rounded-full object-cover"
                            alt="Team Logo"
                          />
                        )}

                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            e.target.files &&
                            handleLogoChange(e.target.files[0])
                          }
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />

                        {logoPreview && (
                          <button
                            type="button"
                            onClick={removeLogo}
                            className="absolute -top-2 -right-2 bg-black text-white rounded-full p-1"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      <div className="text-xs text-muted-foreground">
                        PNG / JPG
                        <br />
                        Square recommended
                      </div>
                    </div>
                  </div>

                  {/* Team Name */}
                  <div className="space-y-2">
                    <Label>Team Name</Label>
                    <Input
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      placeholder="Enter team name"
                      required
                    />
                  </div>

                  {/* Team Tag */}
                  <div className="space-y-2">
                    <Label>Team Tag</Label>
                    <Input
                      value={tag}
                      onChange={(e) => setTag(e.target.value.toUpperCase())}
                      maxLength={5}
                      placeholder="TSM"
                      required
                    />
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <Label>Team Status</Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="disbanded">Disbanded</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Tier */}
                  <div className="space-y-2">
                    <Label>Tier</Label>
                    <Select value={tier} onValueChange={setTier}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Amateur">Amateur</SelectItem>
                        <SelectItem value="Semi-Pro">Semi-Pro</SelectItem>
                        <SelectItem value="Pro">Pro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" className="w-full">
                    {hasTeam ? "Update Team" : "Create Team"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            {context?.team && (
              <Dialog open={teamDetailOpen} onOpenChange={setTeamDetailOpen}>
                <DialogTrigger asChild>
                  <Button variant="secondary">Team Details</Button>
                </DialogTrigger>

                <DialogContent className="max-w-2xl">
                  {context?.team ? (
                    <>
                      <DialogHeader>
                        <DialogTitle>
                          {context.team.teamName} — Team Info
                        </DialogTitle>
                      </DialogHeader>

                      <div className="space-y-4">
                        {/* Team Logo */}
                        <div className="grid grid-cols-3">
                          {context.team.logo ? (
                            <img
                              src={context.team.logo}
                              alt={context.team.teamName}
                              className="w-32 h-32 rounded-full object-cover border-2 border-primary"
                            />
                          ) : (
                            <div className="w-32 h-32 rounded-full bg-gray-700 flex items-center justify-center text-white text-xl">
                              {context.team.teamName?.charAt(0) || "T"}
                            </div>
                          )}
                          <div className="flex flex-col gap-3">
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Team Name
                              </p>
                              <p className="font-semibold text-lg">
                                {context.team.teamName}
                              </p>
                            </div>

                            <div>
                              <p className="text-sm text-muted-foreground">
                                Team Tag
                              </p>
                              <p className="font-semibold text-lg">
                                {context.team.tag}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col gap-3">
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Region
                              </p>
                              <p className="font-semibold text-lg">
                                {context.team.region}
                              </p>
                            </div>

                            <div>
                              <p className="text-sm text-muted-foreground">
                                Tier
                              </p>
                              <p className="font-semibold text-lg">
                                {context.team.tier}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3">
                          {/* Captain */}
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Team Captain
                            </p>
                            <p className="font-semibold text-lg">
                              {context.team.teamCaptain?.userId?.username ||
                                "Not Assigned"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Team Status
                            </p>
                            <p className="font-semibold text-lg">
                              {context.team.status.charAt(0).toUpperCase() +
                                context.team.status.slice(1) || "InActive"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Created By
                            </p>
                            <p className="font-semibold text-lg">
                              {context.team.createdBy.username}
                            </p>
                          </div>
                        </div>

                        {/* Members List */}
                        <div>
                          <div className="flex justify-between">
                            <p className="text-sm text-muted-foreground mb-2">
                              Team Members
                            </p>
                            <Button
                              className={"mr-12"}
                              variant="secondary"
                              onClick={() => openDetails()}
                            >
                              Request
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {context.team.players &&
                            context.team.players.length > 0 ? (
                              context.team.players.map((member) => (
                                <div
                                  key={member._id}
                                  className="flex items-center gap-2 p-2  rounded"
                                >
                                  <img
                                    src={member.avatar || "/default-avatar.png"}
                                    alt={member.userId.username}
                                    className="w-10 h-10 rounded-full object-cover"
                                  />
                                  <div className="flex flex-col ">
                                    <span className="text-sm">
                                      {member.userId.username}
                                    </span>
                                    <span className="text-xs">
                                      ID :{member.userId.ffUid}
                                    </span>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-muted-foreground">
                                No members yet
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-center text-muted-foreground">
                      No team details available.
                    </p>
                  )}
                </DialogContent>
              </Dialog>
            )}

            {context?.playerRequests && (
              <Dialog open={open3} onOpenChange={setOpen3}>
                <DialogTrigger asChild>
                  <Button variant="secondary">Application</Button>
                </DialogTrigger>

                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Team Requests</DialogTitle>
                  </DialogHeader>

                  {context.playerRequests.length === 0 ? (
                    <p className="text-center text-muted-foreground">
                      No team requests
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {context.playerRequests.map((request) => {
                        const isInvite = request.type === "invite";
                        const isPending = request.status === "pending";
                        const isAccepted = request.status === "accepted";
                        const isRejected = request.status === "rejected";

                        return (
                          <div
                            key={request._id}
                            className="flex items-center justify-between border rounded-lg p-3"
                          >
                            {/* LEFT: TEAM INFO */}
                            <div className="flex items-center gap-3">
                              <img
                                src={
                                  request.team?.logo || "/team-placeholder.png"
                                }
                                alt={request.team?.teamName}
                                className="w-12 h-12 rounded-full object-cover"
                              />

                              <div>
                                <p className="font-semibold text-sm">
                                  {request.team?.teamName}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {request.team?.tag}

                                  {request.type === "invite" && (
                                    <span className="">
                                     {" "} •{" "}
                                      {request.status === "pending" &&
                                        "Invited you to Join Team"}
                                      {request.status === "accepted" &&
                                        "request accepted"}
                                      {request.status === "rejected" &&
                                        "request rejected"}
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>

                            {/* RIGHT: ACTION / STATUS */}
                            <div>
                              {/* TEAM INVITED PLAYER */}
                              {isInvite && isPending && (
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={() => handleAccept(request._id)}
                                  >
                                    Accept
                                  </Button>

                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleReject(request._id)}
                                  >
                                    Reject
                                  </Button>
                                </div>
                              )}

                              {/* PLAYER SENT REQUEST */}
                              {!isInvite && (
                                <>
                                  {isPending && (
                                    <Badge variant="outline">⏳ Pending</Badge>
                                  )}
                                  {isAccepted && (
                                    <Badge className="bg-green-600">
                                      ✅ Accepted
                                    </Badge>
                                  )}
                                  {isRejected && (
                                    <Badge variant="destructive">
                                      ❌ Rejected
                                    </Badge>
                                  )}
                                </>
                              )}

                              {/* INVITE ACCEPTED / REJECTED */}
                              {isInvite && !isPending && (
                                <>
                                  {isAccepted && (
                                    <Badge className="bg-green-600">
                                      ✅ Accepted
                                    </Badge>
                                  )}
                                  {isRejected && (
                                    <Badge variant="destructive">
                                      ❌ Rejected
                                    </Badge>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </Card>
    </>
  );
}
