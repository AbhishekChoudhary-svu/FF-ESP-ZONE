import { useEffect, useState } from "react"
import { Play, X, CloudUpload } from "lucide-react"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { DarkDialog, PrimaryBtn, UploadZone, labelCls } from "../shared/primitives"
import {
  useAvatarUpload,
  useClipPhotosUpload,
  useClipVideoUpload,
} from "../shared/useUploads"

const ROLES = ["Rusher", "Support", "Sniper", "Nader"]

export function EditPlayerDialog({ open, onOpenChange, hasPlayer, player, userId, onSuccess }) {
  const [role, setRole]           = useState("Rusher")
  const [isCaptain, setIsCaptain] = useState(false)
  const [isActive, setIsActive]   = useState(false)

  const {
    avatar, avatarPreview,
    handleAvatarChange, handleDeleteAvatar,
    resetAvatar,                           // ← use reset
  } = useAvatarUpload()

  const {
    clipPhotos, clipPhotoPreviews,
    handleClipPhotosChange, handleDeletePhoto,
    resetClipPhotos,                       // ← use reset
  } = useClipPhotosUpload()

  const {
    clipVideo, clipVideoPreview,
    handleClipVideoChange, handleDeleteVideo,
    resetClipVideo,                        // ← use reset
  } = useClipVideoUpload()

  // Sync ALL state when player data arrives or dialog opens
  useEffect(() => {
    if (!player) return
    setRole(player.inGameRole || "Rusher")
    setIsCaptain(player.isCaptain || false)
    setIsActive(player.isActive || false)
    resetAvatar(player.avatar || null)             // ← sync avatar
    resetClipPhotos(player.clipPhotos || [])       // ← sync photos
    resetClipVideo(player.clipVideo || null)       // ← sync video
  }, [player, open]) // ← re-run when dialog opens too

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!avatar) { alert("Avatar is required"); return }

    const payload = { avatar, inGameRole: role, isCaptain, isActive, clipPhotos, clipVideo }
    const res = await fetch(`/api/players/${userId}`, {
      method:  hasPlayer ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (!res.ok) { alert(data.message || "Operation failed"); return }

    onOpenChange(false)
    onSuccess?.()
  }

  return (
    <DarkDialog
      open={open}
      onOpenChange={onOpenChange}
      title={hasPlayer ? "Edit Player Details" : "Register Player Profile"}
    >
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Avatar */}
        <div>
          <span className={labelCls}>Avatar</span>
          <div className="flex items-center gap-4">
            <UploadZone
              preview={avatarPreview}
              accept="image/*"
              label="Upload avatar"
              circle
              onFile={handleAvatarChange}
              onRemove={handleDeleteAvatar}
            />
            <p className="text-[11px] text-[#4a5060]">Square image<br />JPG / PNG</p>
          </div>
        </div>

        {/* Role + toggles */}
        <div className="flex items-center gap-5 flex-wrap">
          <div>
            <span className={labelCls}>In-Game Role</span>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="bg-[#0f1318] border border-[#2a2e3a] text-[#d0d5df] text-sm w-36 font-['Rajdhani']">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#0f1318] border border-[#2a2e3a] text-[#d0d5df] font-['Rajdhani']">
                {ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <CheckboxField checked={isCaptain} onChange={(v) => setIsCaptain(Boolean(v))} label="Captain" checkedColor="bg-[#ff6b00] border-[#ff6b00]" />
          <CheckboxField checked={isActive}  onChange={(v) => setIsActive(Boolean(v))}  label="Active"  checkedColor="bg-[#4ade80] border-[#4ade80]" />
        </div>

        {/* Photo Clips */}
        <div>
          <span className={labelCls}>Photo Clips <span className="normal-case">(max 2)</span></span>
          <div className="grid grid-cols-2 gap-3">
            <MultiPhotoZone disabled={clipPhotos.length >= 2} onChange={handleClipPhotosChange} />
            {clipPhotoPreviews.length > 0 && (
              <div className="flex gap-2">
                {clipPhotoPreviews.map((img, i) => (
                  <div key={i} className="relative rounded-lg overflow-hidden h-[100px] flex-1">
                    <img src={img} className="w-full h-full object-cover" alt="" />
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

        {/* Video */}
        <div>
          <span className={labelCls}>Highlight Video</span>
          <div className="grid grid-cols-2 gap-3">
            <VideoZone disabled={!!clipVideo} onChange={handleClipVideoChange} />
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
  )
}

function CheckboxField({ checked, onChange, label, checkedColor }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <Checkbox checked={checked} onCheckedChange={onChange}
        className={`border-[#2a2e3a] data-[state=checked]:${checkedColor}`} />
      <span className="text-[13px] text-[#8090a0] uppercase tracking-wider">{label}</span>
    </label>
  )
}

function MultiPhotoZone({ disabled, onChange }) {
  return (
    <div className="relative flex flex-col items-center justify-center border-2 border-dashed border-[#2a2e3a] rounded-lg p-5 cursor-pointer hover:border-[#ff6b00]/50 transition bg-[#0f1318]">
      <CloudUpload className="w-7 h-7 text-[#4a5060] mb-1" />
      <p className="text-[10px] text-[#4a5060] text-center">Upload images</p>
      <input type="file" accept="image/*" multiple disabled={disabled}
        onChange={(e) => e.target.files && onChange(e.target.files)}
        className="absolute inset-0 opacity-0 cursor-pointer" />
    </div>
  )
}

function VideoZone({ disabled, onChange }) {
  return (
    <div className="relative flex flex-col items-center justify-center border-2 border-dashed border-[#2a2e3a] rounded-lg p-5 cursor-pointer hover:border-[#ff6b00]/50 transition bg-[#0f1318]">
      <CloudUpload className="w-7 h-7 text-[#4a5060] mb-1" />
      <p className="text-[10px] text-[#4a5060] text-center">Upload video</p>
      <input type="file" accept="video/*" disabled={disabled}
        onChange={(e) => e.target.files && onChange(e.target.files[0])}
        className="absolute inset-0 opacity-0 cursor-pointer" />
    </div>
  )
}