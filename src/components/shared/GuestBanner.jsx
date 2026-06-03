

import { Lock } from "lucide-react"
import { PrimaryBtn, GhostBtn } from "./primitives"

export function GuestBanner({ onSignup, onLogin }) {
  return (
    <div
      className="mx-6 mt-5 p-4 rounded-lg border border-[#ff6b00]/30 bg-[#ff6b00]/5
        flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
    >
      <div className="flex items-start gap-3">
        <Lock className="w-5 h-5 text-[#ff8c30] mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-[13px] font-bold text-[#ff8c30] uppercase tracking-wider mb-0.5">
            Guest Session Active
          </p>
          <p className="text-[12px] text-[#4a5060] leading-relaxed">
            You're browsing as a guest. Create an account to join tournaments,
            register as a player, and save your progress.
          </p>
        </div>
      </div>

      <div className="flex gap-2 flex-shrink-0">
        <GhostBtn onClick={onLogin}  className="py-1.5 px-3 text-[11px]">Login</GhostBtn>
        <PrimaryBtn onClick={onSignup} className="py-1.5 px-3 text-[11px]">Sign Up Free</PrimaryBtn>
      </div>
    </div>
  )
}