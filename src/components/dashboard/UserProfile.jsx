"use client";

import { useContext, useEffect, useState } from "react";
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

/* ─── Reusable Design Primitives ─────────────────────────────────────── */

/** Dark panel with orange top-bar accent + corner brackets */
function GamingCard({ children, className = "" }) {
  return (
    <div
      className={`relative bg-[#0a0c10] border border-[#2a2e3a] rounded-xl overflow-hidden font-['Rajdhani'] ${className}`}
      style={{
        boxShadow: "0 0 40px rgba(255,107,0,0.06)",
      }}
    >
      {/* top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{
          background:
            "linear-gradient(90deg, transparent, #ff6b00 30%, #ffb300 50%, #ff6b00 70%, transparent)",
        }}
      />
      {/* corner brackets */}
      <div className="absolute z-10 w-3 h-3 top-0 left-0 border-t-2 border-l-2 border-[#ff6b00]" />
      <div className="absolute z-10 w-3 h-3 top-0 right-0 border-t-2 border-r-2 border-[#ff6b00]" />
      <div className="absolute z-10 w-3 h-3 bottom-0 left-0 border-b-2 border-l-2 border-[#ff6b00]" />
      <div className="absolute z-10 w-3 h-3 bottom-0 right-0 border-b-2 border-r-2 border-[#ff6b00]" />
      {children}
    </div>
  );
}

/** Stat cell used in the stats grid */
function StatCell({ label, value, accent = false }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] text-[#4a5060] uppercase tracking-widest">
        {label}
      </span>
      <span
        className={`text-[15px] font-bold ${
          accent ? "text-[#ff8c30]" : "text-[#d0d5df]"
        }`}
      >
        {value ?? "—"}
      </span>
    </div>
  );
}

/** Orange-gradient primary action button */
function PrimaryBtn({ children, onClick, type = "button", className = "", disabled = false }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-5 py-2.5 rounded-md font-bold tracking-wider uppercase text-sm text-white
        bg-gradient-to-br from-[#ff6b00] to-[#ff9a00]
        shadow-[0_4px_15px_rgba(255,107,0,0.35)]
        hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(255,107,0,0.5)]
        active:scale-[0.98] transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}`}
    >
      {children}
    </button>
  );
}

/** Ghost border button (secondary) */
function GhostBtn({ children, onClick, type = "button", className = "", disabled = false }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-5 py-2.5 rounded-md font-semibold tracking-wider uppercase text-sm
        bg-transparent border border-[#2a2e3a] text-[#8090a0]
        hover:border-[#ff6b00]/40 hover:text-[#ff8c30] hover:bg-[#ff6b00]/5
        active:scale-[0.98] transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}`}
    >
      {children}
    </button>
  );
}

/** Badge chip (type / status) */
function Chip({ children, variant = "orange" }) {
  const styles = {
    orange: "bg-[#ff6b00]/15 text-[#ff8c30] border-[#ff6b00]/30",
    blue:   "bg-[#63b3ed]/10 text-[#63b3ed] border-[#63b3ed]/25",
    green:  "bg-[#4ade80]/10 text-[#4ade80] border-[#4ade80]/30",
    yellow: "bg-[#edb438]/12 text-[#edb438] border-[#edb438]/30",
    red:    "bg-red-500/10 text-red-400 border-red-500/30",
  };
  return (
    <span
      className={`text-[11px] font-bold tracking-wider px-2.5 py-0.5 rounded-[3px] uppercase border ${styles[variant]}`}
    >
      {children}
    </span>
  );
}

/** Dark-themed dialog wrapper */
function DarkDialog({ open, onOpenChange, trigger, title, children }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-lg bg-[#0a0c10] border border-[#2a2e3a] text-[#d0d5df] font-['Rajdhani'] p-0 overflow-hidden">
        {/* accent top */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{
            background:
              "linear-gradient(90deg, transparent, #ff6b00 30%, #ffb300 50%, #ff6b00 70%, transparent)",
          }}
        />
        <div className="px-6 py-5">
          <DialogHeader>
            <DialogTitle className="font-['Orbitron'] text-[15px] font-bold text-[#f0f2f5] tracking-wide">
              {title}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">{children}</div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Upload helpers (shared styles) ─────────────────────────────────── */

function UploadZone({ preview, onFile, accept, label, circle = false, disabled = false, onRemove }) {
  const shape = circle ? "rounded-full w-28 h-28" : "rounded-lg p-6 w-full";
  return (
    <div className={`relative flex flex-col items-center justify-center border-2 border-dashed border-[#2a2e3a] ${shape} cursor-pointer hover:border-[#ff6b00]/50 transition bg-[#0f1318]`}>
      {!preview ? (
        <>
          {circle ? (
            <User className="w-6 h-6 text-[#4a5060] mb-1" />
          ) : (
            <CloudUpload className="w-8 h-8 text-[#4a5060] mb-2" />
          )}
          <p className="text-[10px] text-[#4a5060] text-center">{label}</p>
        </>
      ) : (
        circle
          ? <img src={preview} className="w-full h-full rounded-full object-cover" />
          : <img src={preview} className="w-full h-full rounded-lg object-cover" />
      )}
      <input
        type="file"
        accept={accept}
        disabled={disabled}
        onChange={(e) => e.target.files && onFile(e.target.files[0] ?? e.target.files)}
        className="absolute inset-0 opacity-0 cursor-pointer"
      />
      {preview && onRemove && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="absolute -top-2 -right-2 bg-[#0a0c10] border border-[#2a2e3a] text-[#8090a0] rounded-full p-1 hover:bg-red-500 hover:text-white hover:border-red-500 transition"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────── */

export function UserProfile() {
  const context = useContext(MyContext);

  const [open, setOpen]           = useState(false);
  const [open1, setOpen1]         = useState(false);
  const [openTeam, setOpenTeam]   = useState(false);
  const [open3, setOpen3]         = useState(false);
  const [open4, setOpen4]         = useState(false);
  const [detailOpen, setDetailOpen]       = useState(false);
  const [teamDetailOpen, setTeamDetailOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const [role, setRole]           = useState("Rusher");
  const [isCaptain, setIsCaptain] = useState(false);
  const [isActive, setIsActive]   = useState(false);

  const [avatar, setAvatar]               = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [clipPhotos, setClipPhotos]             = useState([]);
  const [clipPhotoPreviews, setClipPhotoPreviews] = useState([]);
  const [clipVideo, setClipVideo]               = useState(null);
  const [clipVideoPreview, setClipVideoPreview] = useState(null);
  const [logo, setLogo]               = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const [teamName, setTeamName] = useState("");
  const [tag, setTag]           = useState("");
  const [status, setStatus]     = useState("active");
  const [tier, setTier]         = useState("Amateur");
  const [leaving, setLeaving]   = useState(false);

  /* ── upload handlers (unchanged logic, same API calls) ── */
  const handleAvatarChange = async (file) => {
    setAvatarPreview(URL.createObjectURL(file));
    const fd = new FormData(); fd.append("avatar", file);
    const { success, url } = await (await fetch("/api/uploads/avatar", { method: "POST", body: fd })).json();
    if (success) setAvatar(url);
  };
  const handleClipPhotosChange = async (files) => {
    const sel = Array.from(files).slice(0, 2);
    setClipPhotoPreviews(sel.map(f => URL.createObjectURL(f)));
    const fd = new FormData(); sel.forEach(f => fd.append("photos", f));
    const { success, urls } = await (await fetch("/api/uploads/photo", { method: "POST", body: fd })).json();
    if (success) setClipPhotos(urls);
  };
  const handleClipVideoChange = async (file) => {
    setClipVideoPreview(URL.createObjectURL(file));
    const fd = new FormData(); fd.append("video", file);
    const { success, url } = await (await fetch("/api/uploads/video", { method: "POST", body: fd })).json();
    if (success) setClipVideo(url);
  };
  const handleLogoChange = async (file) => {
    setLogoPreview(URL.createObjectURL(file));
    const fd = new FormData(); fd.append("logo", file);
    const res = await fetch("/api/uploads/logo", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) { alert(data.message || "Logo upload failed"); return; }
    setLogo(data.logoUrl);
  };
  const handleDeleteAvatar = async () => {
    if (!avatar) return;
    await fetch("/api/uploads/avatar", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ avatarUrl: avatar }) });
    setAvatar(null); setAvatarPreview(null);
  };
  const handleDeletePhoto = async (i) => {
    await fetch("/api/uploads/photo", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ photoUrls: [clipPhotos[i]] }) });
    setClipPhotos(p => p.filter((_, idx) => idx !== i));
    setClipPhotoPreviews(p => p.filter((_, idx) => idx !== i));
  };
  const handleDeleteVideo = async () => {
    if (!clipVideo) return;
    await fetch("/api/uploads/video", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ videoUrl: clipVideo }) });
    setClipVideo(null); setClipVideoPreview(null);
  };
  const removeLogo = async () => {
    if (!logo) return;
    await fetch("/api/uploads/logo", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ logoUrl: logo }) });
    setLogo(null); setLogoPreview(null);
  };

  const hasPlayer = Boolean(context?.player?._id);
  const hasTeam   = Boolean(context?.team?._id);

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
    if (!avatar) { alert("Avatar is required"); return; }
    const payload = { avatar, inGameRole: role, isCaptain, isActive, clipPhotos, clipVideo };
    const res = await fetch(`/api/players/${context.user.id}`, {
      method: hasPlayer ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) { alert(data.message || "Operation failed"); return; }
    setOpen1(false);
    await context.fetchUser();
    await context.fetchActivePlayers();
  };

  const handleSubmitTeam = async (e) => {
    e.preventDefault();
    const payload = { teamName, tag, logo, status, tier };
    const res = await fetch(`/api/teams/${context?.player?._id}`, {
      method: hasTeam ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.success) setOpenTeam(false);
  };

  const handleAccept = async (requestId) => {
    const res = await fetch("/api/team-requests/accept", {
      method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include",
      body: JSON.stringify({ requestId, playerId: context.player._id }),
    });
    const data = await res.json();
    if (!data.success) { alert(data.message || "Failed"); return; }
    setOpen3(false); setOpen4(false);
    context.fetchTeam(context.player._id);
    context.fetchPlayer(context.user.id);
    context.fetchPlayerRequests?.();
  };

  const handleReject = async (requestId) => {
    const res = await fetch("/api/team-requests/reject", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId, playerId: context.player._id }),
    });
    const data = await res.json();
    if (data.success) { setOpen3(false); setOpen4(false); }
  };

  const handleLeave = async () => {
    if (!context?.team?._id || !context?.player?._id) return;
    setLeaving(true);
    try {
      const res = await fetch("/api/team-requests/leave", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId: context.team._id, playerId: context.player._id }),
      });
      const data = await res.json();
      if (!data.success) return;
      await context.fetchPlayer(context.user.id);
      await context.fetchTeam(context.player._id);
      await context.fetchActiveTeams();
    } finally { setLeaving(false); }
  };

  const handleKick = async (targetPlayerId) => {
    const res = await fetch("/api/team-requests/kick", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamId: context.team._id, captainId: context.player._id, targetPlayerId }),
    });
    const data = await res.json();
    if (!data.success) return;
    await context.fetchPlayer(context.user.id);
    await context.fetchTeam(context.player._id);
    await context.fetchActiveTeams();
  };

  const handleDisband = async () => {
    const res = await fetch("/api/team-requests/disband", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamId: context.team._id, captainId: context.player._id }),
    });
    const data = await res.json();
    if (!data.success) return;
    await context.fetchPlayer(context.user.id);
    await context.fetchTeam(context.player._id);
    await context.fetchActiveTeams();
    setTeamDetailOpen(false);
  };

  const hasCaptain =
    String(context?.team?.teamCaptain._id) === String(context?.player?._id);

  /* ── shared dark form field styles ── */
  const inputCls =
    "w-full bg-[#0f1318] border border-[#2a2e3a] text-[#d0d5df] rounded-md px-3 py-2 text-sm placeholder-[#4a5060] focus:border-[#ff6b00]/50 focus:outline-none transition font-['Rajdhani']";
  const labelCls = "text-[11px] text-[#4a5060] uppercase tracking-widest mb-1 block";

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Orbitron:wght@700;900&display=swap');`}</style>

      <GamingCard>
        {/* ── HEADER SECTION ─────────────────────────────────────── */}
        <div
          className="relative flex justify-between items-start gap-6 px-6 pt-6 pb-5 border-b border-[#1e2330]"
          style={{
            background: "linear-gradient(135deg, #0f1318 0%, #1a1f2e 50%, #0f1318 100%)",
          }}
        >
          {/* radial glow top-right */}
          <div
            className="pointer-events-none absolute -top-8 -right-8 w-40 h-40 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(255,107,0,0.10) 0%, transparent 70%)" }}
          />

          {/* Avatar + Name */}
          <div className="flex gap-5 items-start">
            <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-[#ff6b00]/40 shadow-[0_0_16px_rgba(255,107,0,0.25)] flex-shrink-0">
              <img
                src={context?.player?.avatar || context?.user?.username?.charAt(0)}
                className="w-full h-full object-cover rounded-xl"
                alt=""
              />
            </div>

            <div>
              {/* username row */}
              <div className="flex items-center gap-3 mb-1">
                <h2 className="font-['Orbitron'] text-xl font-black text-[#f0f2f5] tracking-wide [text-shadow:0_0_20px_rgba(255,107,0,0.3)]">
                  {context?.user?.username}
                </h2>
                {context?.user?.provider === "google"
                  ? <img src="/google.svg" alt="Google" className="w-5 h-5" />
                  : <img src="/gmail.svg" alt="Email" className="w-5 h-5" />}
              </div>

              {/* UID */}
              <p className="text-[13px] text-[#5a6070] mb-2 font-['Rajdhani']">
                Free Fire UID:{" "}
                <span className="text-[#ff8c30] font-bold">{context?.user?.ffUid}</span>
              </p>

              {/* Bio */}
              {context?.user?.bio && (
                <p className="text-[13px] text-[#5a6070] italic max-w-lg">
                  "{context.user.bio}"
                </p>
              )}

              {/* badges */}
              <div className="flex flex-wrap gap-2 mt-3">
                {context?.user?.rank && <Chip variant="orange">{context.user.rank}</Chip>}
                {context?.user?.playstyle && <Chip variant="blue">{context.user.playstyle}</Chip>}
                {context?.user?.plan && <Chip variant="yellow">{context.user.plan}</Chip>}
                {context?.player?.isCaptain && <Chip variant="green">Captain</Chip>}
                {context?.player?.isActive && (
                  <Chip variant="green">
                    <span className="inline-block w-1.5 h-1.5 bg-[#4ade80] rounded-full mr-1 align-middle animate-pulse" />
                    Active
                  </Chip>
                )}
              </div>
            </div>
          </div>

          {/* Right-side action buttons */}
          <div className="flex flex-col gap-2.5 flex-shrink-0">
            {/* Edit Profile */}
            <DarkDialog
              open={open} onOpenChange={setOpen}
              trigger={<GhostBtn>✏ Edit Profile</GhostBtn>}
              title="Edit Profile"
            >
              <EditProfileForm user={context?.user} onClose={() => setOpen(false)} />
            </DarkDialog>

            {/* Register / Edit Player */}
            <DarkDialog
              open={open1} onOpenChange={setOpen1}
              trigger={<GhostBtn>{hasPlayer ? "⚙ Edit Player" : "⚔ Register Player"}</GhostBtn>}
              title={hasPlayer ? "Edit Player Details" : "Register Player Profile"}
            >
              <form onSubmit={handleSubmitPlayer} className="space-y-5">
                {/* Avatar */}
                <div>
                  <span className={labelCls}>Avatar</span>
                  <div className="flex items-center gap-4">
                    <UploadZone
                      preview={avatarPreview} accept="image/*" label="Upload avatar"
                      circle onFile={handleAvatarChange} onRemove={handleDeleteAvatar}
                    />
                    <p className="text-[11px] text-[#4a5060]">Square image<br/>JPG / PNG</p>
                  </div>
                </div>

                {/* Role / Captain / Active */}
                <div className="flex items-center gap-5 flex-wrap">
                  <div>
                    <span className={labelCls}>In-Game Role</span>
                    <Select value={role} onValueChange={setRole}>
                      <SelectTrigger className="bg-[#0f1318] border border-[#2a2e3a] text-[#d0d5df] text-sm w-36 font-['Rajdhani']">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0f1318] border border-[#2a2e3a] text-[#d0d5df] font-['Rajdhani']">
                        {["Rusher","Support","Sniper","Nader"].map(r => (
                          <SelectItem key={r} value={r}>{r}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={isCaptain} onCheckedChange={v => setIsCaptain(Boolean(v))}
                      className="border-[#2a2e3a] data-[state=checked]:bg-[#ff6b00] data-[state=checked]:border-[#ff6b00]"
                    />
                    <span className="text-[13px] text-[#8090a0] uppercase tracking-wider">Captain</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={isActive} onCheckedChange={v => setIsActive(Boolean(v))}
                      className="border-[#2a2e3a] data-[state=checked]:bg-[#4ade80] data-[state=checked]:border-[#4ade80]"
                    />
                    <span className="text-[13px] text-[#8090a0] uppercase tracking-wider">Active</span>
                  </label>
                </div>

                {/* Photo Clips */}
                <div>
                  <span className={labelCls}>Photo Clips <span className="normal-case">(max 2)</span></span>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative flex flex-col items-center justify-center border-2 border-dashed border-[#2a2e3a] rounded-lg p-5 cursor-pointer hover:border-[#ff6b00]/50 transition bg-[#0f1318]">
                      <CloudUpload className="w-7 h-7 text-[#4a5060] mb-1" />
                      <p className="text-[10px] text-[#4a5060] text-center">Upload images</p>
                      <input type="file" accept="image/*" multiple disabled={clipPhotos.length >= 2}
                        onChange={e => e.target.files && handleClipPhotosChange(e.target.files)}
                        className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                    {clipPhotoPreviews.length > 0 && (
                      <div className="flex gap-2">
                        {clipPhotoPreviews.map((img, i) => (
                          <div key={i} className="relative rounded-lg overflow-hidden h-[100px] flex-1">
                            <img src={img} className="w-full h-full object-cover" />
                            <button type="button" onClick={() => handleDeletePhoto(i)}
                              className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-0.5 hover:bg-red-500 transition">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Highlight Video */}
                <div>
                  <span className={labelCls}>Highlight Video</span>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative flex flex-col items-center justify-center border-2 border-dashed border-[#2a2e3a] rounded-lg p-5 cursor-pointer hover:border-[#ff6b00]/50 transition bg-[#0f1318]">
                      <CloudUpload className="w-7 h-7 text-[#4a5060] mb-1" />
                      <p className="text-[10px] text-[#4a5060] text-center">Upload video</p>
                      <input type="file" accept="video/*" disabled={!!clipVideo}
                        onChange={e => e.target.files && handleClipVideoChange(e.target.files[0])}
                        className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                    {clipVideoPreview && (
                      <div className="relative rounded-lg overflow-hidden h-[100px]">
                        <video src={clipVideoPreview} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <Play className="w-7 h-7 text-white" />
                        </div>
                        <button type="button" onClick={handleDeleteVideo}
                          className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-0.5 hover:bg-red-500 transition">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <PrimaryBtn type="submit" className="w-full">
                  {hasPlayer ? "⚙ Update Player" : "⚔ Create Player"}
                </PrimaryBtn>
              </form>
            </DarkDialog>

            {/* View Clips */}
            <DarkDialog
              open={detailOpen} onOpenChange={setDetailOpen}
              trigger={
                <GhostBtn onClick={() => { setSelectedPlayer(context?.player); setDetailOpen(true); }}>
                  ▶ View Clips
                </GhostBtn>
              }
              title={selectedPlayer ? `${selectedPlayer.userId?.username} — Clips` : "Clips"}
            >
              {selectedPlayer && (
                <div className="space-y-4">
                  {selectedPlayer.clipPhotos?.length > 0 && (
                    <div>
                      <span className={labelCls}>Photo Clips</span>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedPlayer.clipPhotos.map((p, i) => (
                          <img key={i} src={p} className="h-40 w-full rounded-lg object-cover border border-[#2a2e3a]" />
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedPlayer.clipVideo && (
                    <div>
                      <span className={labelCls}>Video Clip</span>
                      <video src={selectedPlayer.clipVideo} controls className="w-full h-[28vh] rounded-lg border border-[#2a2e3a]" />
                    </div>
                  )}
                </div>
              )}
            </DarkDialog>

            {/* Create / Edit Team */}
            {(!hasTeam || hasCaptain) && (
              <DarkDialog
                open={openTeam} onOpenChange={setOpenTeam}
                trigger={<GhostBtn>{hasTeam ? "🛡 Edit Team" : "🛡 Create Team"}</GhostBtn>}
                title={hasTeam ? "Edit Team Details" : "Create Team"}
              >
                <form onSubmit={handleSubmitTeam} className="space-y-4">
                  <div>
                    <span className={labelCls}>Team Logo</span>
                    <div className="flex items-center gap-4">
                      <UploadZone preview={logoPreview} accept="image/*" label="Upload Logo"
                        circle onFile={handleLogoChange} onRemove={removeLogo} />
                      <p className="text-[11px] text-[#4a5060]">PNG / JPG<br/>Square recommended</p>
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Team Name</label>
                    <Input value={teamName} onChange={e => setTeamName(e.target.value)}
                      placeholder="Enter team name" required className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Team Tag</label>
                    <Input value={tag} onChange={e => setTag(e.target.value.toUpperCase())}
                      maxLength={5} placeholder="TSM" required className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Status</label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger className="bg-[#0f1318] border border-[#2a2e3a] text-[#d0d5df] font-['Rajdhani']">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0f1318] border border-[#2a2e3a] text-[#d0d5df] font-['Rajdhani']">
                        {["active","inactive","disbanded"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className={labelCls}>Tier</label>
                    <Select value={tier} onValueChange={setTier}>
                      <SelectTrigger className="bg-[#0f1318] border border-[#2a2e3a] text-[#d0d5df] font-['Rajdhani']">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0f1318] border border-[#2a2e3a] text-[#d0d5df] font-['Rajdhani']">
                        {["Amateur","Semi-Pro","Pro"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <PrimaryBtn type="submit" className="w-full">
                    {hasTeam ? "⚙ Update Team" : "🛡 Create Team"}
                  </PrimaryBtn>
                </form>
              </DarkDialog>
            )}

            {/* Team Details */}
            {context?.team && (
              <DarkDialog
                open={teamDetailOpen} onOpenChange={setTeamDetailOpen}
                trigger={<GhostBtn>🛡 Team Details</GhostBtn>}
                title={`${context.team.teamName} — Team Info`}
              >
                {context?.team ? (
                  <div className="space-y-5">
                    {/* Team logo + info */}
                    <div className="flex gap-5 items-center">
                      {context.team.logo ? (
                        <img src={context.team.logo} alt={context.team.teamName}
                          className="w-20 h-20 rounded-xl object-cover border-2 border-[#ff6b00]/40 shadow-[0_0_16px_rgba(255,107,0,0.2)]" />
                      ) : (
                        <div className="w-20 h-20 rounded-xl bg-[#1a1f2e] border border-[#2a2e3a] flex items-center justify-center font-['Orbitron'] text-2xl text-[#ff8c30]">
                          {context.team.teamName?.charAt(0)}
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                        <StatCell label="Team Name" value={context.team.teamName} accent />
                        <StatCell label="Tag" value={context.team.tag} />
                        <StatCell label="Region" value={context.team.region} />
                        <StatCell label="Tier" value={context.team.tier} />
                        <StatCell label="Captain" value={context.team.teamCaptain?.userId?.username || "N/A"} />
                        <StatCell label="Status" value={context.team.status} />
                      </div>
                    </div>

                    {/* Members */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className={labelCls}>Team Members ({context.team.players?.length ?? 0})</span>
                        {hasCaptain && (
                          <button onClick={() => setOpen4(true)}
                            className="text-[11px] text-[#ff8c30] uppercase tracking-wider hover:text-[#ffb300] transition">
                            + Requests
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {context.team.players?.length > 0 ? context.team.players.map(m => (
                          <div key={m._id} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-[#0f1318] border border-[#1e2330]">
                            <div className="flex items-center gap-2">
                              <img src={m.avatar || "/default-avatar.png"} alt=""
                                className="w-9 h-9 rounded-lg object-cover border border-[#2a2e3a]" />
                              <div>
                                <p className="text-[13px] font-bold text-[#d0d5df]">{m.userId.username}</p>
                                <p className="text-[10px] text-[#4a5060]">UID: {m.userId.ffUid}</p>
                              </div>
                            </div>
                            {hasCaptain && m._id !== context?.player?._id && (
                              <button onClick={() => handleKick(m._id)}
                                className="text-[#4a5060] hover:text-red-500 transition">
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        )) : (
                          <p className="text-[13px] text-[#4a5060]">No members yet</p>
                        )}
                      </div>
                    </div>

                    {hasCaptain
                      ? <GhostBtn onClick={handleDisband} className="w-full text-red-400 hover:text-red-400 hover:border-red-500/40">
                          💀 Disband Team
                        </GhostBtn>
                      : <GhostBtn onClick={handleLeave} disabled={leaving} className="w-full">
                          {leaving ? "Leaving..." : "🚪 Leave Team"}
                        </GhostBtn>
                    }
                  </div>
                ) : (
                  <p className="text-center text-[#4a5060]">No team details available.</p>
                )}
              </DarkDialog>
            )}

            {/* Applications */}
            {context?.playerRequests && (
              <DarkDialog
                open={open3} onOpenChange={setOpen3}
                trigger={<GhostBtn>📋 Applications</GhostBtn>}
                title="Team Requests"
              >
                {context.playerRequests.length === 0 ? (
                  <p className="text-center text-[#4a5060] py-4">No team requests</p>
                ) : (
                  <div className="space-y-2">
                    {context.playerRequests.map(req => {
                      const isInvite   = req.type === "invite";
                      const isPending  = req.status === "pending";
                      const isAccepted = req.status === "accepted";
                      const isRejected = req.status === "rejected";
                      return (
                        <div key={req._id} className="flex items-center justify-between p-3 rounded-lg bg-[#0f1318] border border-[#1e2330]">
                          <div className="flex items-center gap-3">
                            <img src={req.team?.logo || "/team-placeholder.png"} alt=""
                              className="w-11 h-11 rounded-lg object-cover border border-[#2a2e3a]" />
                            <div>
                              <p className="text-[13px] font-bold text-[#d0d5df]">{req.team?.teamName}</p>
                              <p className="text-[11px] text-[#4a5060]">
                                {req.team?.tag}
                                {isInvite && <span> • {isPending ? "Invited you" : req.status}</span>}
                              </p>
                            </div>
                          </div>
                          <div>
                            {isInvite && isPending && (
                              <div className="flex gap-2">
                                <PrimaryBtn onClick={() => handleAccept(req._id)} className="py-1.5 px-3 text-[11px]">Accept</PrimaryBtn>
                                <GhostBtn onClick={() => handleReject(req._id)} className="py-1.5 px-3 text-[11px] text-red-400 hover:text-red-400 hover:border-red-500/40">Reject</GhostBtn>
                              </div>
                            )}
                            {!isInvite && isPending && <Chip variant="yellow">⏳ Pending</Chip>}
                            {isAccepted && <Chip variant="green">✅ Accepted</Chip>}
                            {isRejected && <Chip variant="red">❌ Rejected</Chip>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </DarkDialog>
            )}

            {/* Team Join Requests (captain) */}
            {context?.teamRequests && (
              <Dialog open={open4} onOpenChange={setOpen4}>
                <DialogContent className="max-w-lg bg-[#0a0c10] border border-[#2a2e3a] text-[#d0d5df] font-['Rajdhani'] p-0 overflow-hidden">
                  <div
                    className="absolute top-0 left-0 right-0 h-[2px]"
                    style={{ background: "linear-gradient(90deg, transparent, #ff6b00 30%, #ffb300 50%, #ff6b00 70%, transparent)" }}
                  />
                  <div className="px-6 py-5">
                    <DialogHeader>
                      <DialogTitle className="font-['Orbitron'] text-[15px] font-bold text-[#f0f2f5] tracking-wide">
                        Player Join Requests
                      </DialogTitle>
                    </DialogHeader>
                    <div className="mt-4">
                      {context.teamRequests.length === 0 ? (
                        <p className="text-center text-[#4a5060] py-4">No join requests</p>
                      ) : (
                        <div className="space-y-2">
                          {context.teamRequests.map(req => {
                            const isPending  = req.status === "pending";
                            const isAccepted = req.status === "accepted";
                            const isRejected = req.status === "rejected";
                            return (
                              <div key={req._id} className="flex items-center justify-between p-3 rounded-lg bg-[#0f1318] border border-[#1e2330]">
                                <div className="flex items-center gap-3">
                                  <img src={req.player?.avatar || "/default-avatar.png"} alt=""
                                    className="w-11 h-11 rounded-lg object-cover border border-[#2a2e3a]" />
                                  <div>
                                    <p className="text-[13px] font-bold text-[#d0d5df]">{req.player?.userId?.username}</p>
                                    <p className="text-[11px] text-[#4a5060]">{req.player?.inGameRole} • Wants to join</p>
                                  </div>
                                </div>
                                <div>
                                  {isPending && (
                                    <div className="flex gap-2">
                                      <PrimaryBtn onClick={() => handleAccept(req._id)} className="py-1.5 px-3 text-[11px]">Accept</PrimaryBtn>
                                      <GhostBtn onClick={() => handleReject(req._id)} className="py-1.5 px-3 text-[11px] text-red-400 hover:text-red-400 hover:border-red-500/40">Reject</GhostBtn>
                                    </div>
                                  )}
                                  {!isPending && isAccepted && <Chip variant="green">✅ Accepted</Chip>}
                                  {!isPending && isRejected && <Chip variant="red">❌ Rejected</Chip>}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* ── STATS SECTION ──────────────────────────────────────── */}
        {/* Row 1: user stats */}
        <div className="grid grid-cols-5 border-b border-[#1e2330] bg-[#0c0e14]">
          {[
            { label: "Rank",          value: context?.user?.rank },
            { label: "Playstyle",     value: context?.user?.playstyle },
            { label: "Tournaments",   value: context?.user?.tournamentsJoined },
            { label: "Plan",          value: context?.user?.plan?.toUpperCase() },
            { label: "User Type",     value: context?.user?.role === "user" ? "Player" : "Moderator" },
          ].map((s, i) => (
            <div
              key={i}
              className={`relative px-5 py-3.5 ${i < 4 ? "after:content-[''] after:absolute after:right-0 after:top-[20%] after:bottom-[20%] after:w-px after:bg-[#1e2330]" : ""}`}
            >
              <StatCell label={s.label} value={s.value} accent={i === 0} />
            </div>
          ))}
        </div>

        {/* Row 2: team / player info */}
        <div className="grid grid-cols-5 border-b border-[#1e2330] bg-[#0a0c10]">
          {[
            { label: "Team",          value: context?.team?.teamName || "No Team" },
            { label: "Role",          value: context?.player?.inGameRole || "N/A" },
            { label: "Likes",         value: context?.player?.likes || "0" },
            { label: "Captain / IGL", value: context?.player?.isCaptain ? "Yes" : "No" },
            { label: "Status",        value: context?.player?.isActive ? "Active" : "Inactive" },
          ].map((s, i) => (
            <div
              key={i}
              className={`relative px-5 py-3.5 ${i < 4 ? "after:content-[''] after:absolute after:right-0 after:top-[20%] after:bottom-[20%] after:w-px after:bg-[#1e2330]" : ""}`}
            >
              <StatCell label={s.label} value={s.value} accent={i === 4 && context?.player?.isActive} />
            </div>
          ))}
        </div>

        {/* Row 3: combat stats */}
        <div className="grid grid-cols-5 bg-[#0c0e14]">
          {[
            { label: "Matches",   value: context?.player?.stats?.matchesPlayed || "0" },
            { label: "Win Rate",  value: context?.player?.stats?.winRate ? `${context.player.stats.winRate}%` : "0%" },
            { label: "Kills",     value: context?.player?.stats?.kills || "0" },
            { label: "Assists",   value: context?.player?.stats?.assists || "0" },
            { label: "Deaths",    value: context?.player?.stats?.deaths || "0" },
          ].map((s, i) => (
            <div
              key={i}
              className={`relative px-5 py-3.5 ${i < 4 ? "after:content-[''] after:absolute after:right-0 after:top-[20%] after:bottom-[20%] after:w-px after:bg-[#1e2330]" : ""}`}
            >
              <StatCell label={s.label} value={s.value} accent={i === 2} />
            </div>
          ))}
        </div>
      </GamingCard>
    </>
  );
}