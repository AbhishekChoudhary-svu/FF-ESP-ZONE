

import { X, CloudUpload, User } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

/* ── Typography tokens ─────────────────────────────────────── */
export const FONTS =
  "@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Orbitron:wght@700;900&display=swap');"

export const labelCls =
  "text-[11px] text-[#4a5060] uppercase tracking-widest mb-1 block"

export const inputCls =
  "w-full bg-[#0f1318] border border-[#2a2e3a] text-[#d0d5df] rounded-md px-3 py-2 text-sm placeholder-[#4a5060] focus:border-[#ff6b00]/50 focus:outline-none transition font-['Rajdhani']"

/* ── Card ──────────────────────────────────────────────────── */
export function GamingCard({ children, className = "" }) {
  return (
    <div
      className={`relative bg-[#0a0c10] border border-[#2a2e3a] rounded-xl overflow-hidden font-['Rajdhani'] ${className}`}
      style={{ boxShadow: "0 0 40px rgba(255,107,0,0.06)" }}
    >
      {/* top accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{
          background:
            "linear-gradient(90deg, transparent, #ff6b00 30%, #ffb300 50%, #ff6b00 70%, transparent)",
        }}
      />
      {/* corner marks */}
      <div className="absolute z-10 w-3 h-3 top-0 left-0   border-t-2 border-l-2 border-[#ff6b00]" />
      <div className="absolute z-10 w-3 h-3 top-0 right-0  border-t-2 border-r-2 border-[#ff6b00]" />
      <div className="absolute z-10 w-3 h-3 bottom-0 left-0  border-b-2 border-l-2 border-[#ff6b00]" />
      <div className="absolute z-10 w-3 h-3 bottom-0 right-0 border-b-2 border-r-2 border-[#ff6b00]" />
      {children}
    </div>
  )
}

/* ── Stat cell ─────────────────────────────────────────────── */
export function StatCell({ label, value, accent = false }) {
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
  )
}

/* ── Buttons ───────────────────────────────────────────────── */
export function PrimaryBtn({
  children,
  onClick,
  type = "button",
  className = "",
  disabled = false,
}) {
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
        disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  )
}

export function GhostBtn({
  children,
  onClick,
  type = "button",
  className = "",
  disabled = false,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-5 py-2.5 rounded-md font-semibold tracking-wider uppercase text-sm
        bg-transparent border border-[#2a2e3a] text-[#8090a0]
        hover:border-[#ff6b00]/40 hover:text-[#ff8c30] hover:bg-[#ff6b00]/5
        active:scale-[0.98] transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  )
}

/* ── Chip ──────────────────────────────────────────────────── */
const chipStyles = {
  orange: "bg-[#ff6b00]/15 text-[#ff8c30] border-[#ff6b00]/30",
  blue:   "bg-[#63b3ed]/10 text-[#63b3ed] border-[#63b3ed]/25",
  green:  "bg-[#4ade80]/10 text-[#4ade80] border-[#4ade80]/30",
  yellow: "bg-[#edb438]/12 text-[#edb438] border-[#edb438]/30",
  red:    "bg-red-500/10 text-red-400 border-red-500/30",
  gray:   "bg-[#2a2e3a]/50 text-[#8090a0] border-[#2a2e3a]",
}

export function Chip({ children, variant = "orange" }) {
  return (
    <span
      className={`text-[12px] font-bold tracking-wider px-3 py-0.5 rounded-[3px] uppercase border ${chipStyles[variant]}`}
    >
      {children}
    </span>
  )
}

/* ── Dark dialog shell ─────────────────────────────────────── */
export function DarkDialog({ open, onOpenChange, trigger, title, children }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-lg bg-[#0a0c10] border border-[#2a2e3a] text-[#d0d5df] font-['Rajdhani'] p-0 overflow-hidden">
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
  )
}

/* ── Upload zone ───────────────────────────────────────────── */
export function UploadZone({
  preview,
  onFile,
  accept,
  label,
  circle = false,
  disabled = false,
  onRemove,
}) {
  const shape = circle
    ? "rounded-full w-28 h-28"
    : "rounded-lg p-6 w-full"

  return (
    <div
      className={`relative flex flex-col items-center justify-center border-2 border-dashed border-[#2a2e3a]
        ${shape} cursor-pointer hover:border-[#ff6b00]/50 transition bg-[#0f1318]`}
    >
      {!preview ? (
        <>
          {circle ? (
            <User className="w-6 h-6 text-[#4a5060] mb-1" />
          ) : (
            <CloudUpload className="w-8 h-8 text-[#4a5060] mb-2" />
          )}
          <p className="text-[10px] text-[#4a5060] text-center">{label}</p>
        </>
      ) : circle ? (
        <img src={preview} className="w-full h-full rounded-full object-cover" alt="" />
      ) : (
        <img src={preview} className="w-full h-full rounded-lg object-cover" alt="" />
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
          onClick={(e) => { e.stopPropagation(); onRemove() }}
          className="absolute -top-2 -right-2 bg-[#0a0c10] border border-[#2a2e3a] text-[#8090a0]
            rounded-full p-1 hover:bg-red-500 hover:text-white hover:border-red-500 transition"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  )
}

/* ── Locked feature wrapper ────────────────────────────────── */
import { Lock } from "lucide-react"

export function LockedFeature({
  children,
  isGuest,
  message = "Create an account to use this feature",
}) {
  if (!isGuest) return children
  return (
    <div className="relative group cursor-not-allowed">
      <div className="opacity-40 pointer-events-none select-none">{children}</div>
      <div
        className="absolute inset-0 flex items-center justify-center
          bg-[#07080b]/60 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0a0c10] border border-[#2a2e3a] rounded-lg">
          <Lock className="w-3.5 h-3.5 text-[#ff8c30]" />
          <span className="text-[11px] text-[#8090a0] font-bold uppercase tracking-wider">
            {message}
          </span>
        </div>
      </div>
    </div>
  )
}