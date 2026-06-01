"use client"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import toast from "react-hot-toast"

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email")
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [timer, setTimer] = useState(600)

  useEffect(() => {
    if (timer === 0) return
    const interval = setInterval(() => {
      setTimer((prev) => (prev <= 1 ? 0 : prev - 1))
    }, 1000)
    return () => clearInterval(interval)
  }, [timer])

  const handleVerify = async () => {
    if (!otp || otp.length !== 6) {
      toast.error("Enter the 6-digit OTP")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/auth/verifyEmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, action: "verify", otp }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Verification failed")
        return
      }
      toast.success("Email verified! Redirecting...")
      router.replace("/login")
    } catch (err) {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResendLoading(true)
    try {
      const res = await fetch("/api/auth/verifyEmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, action: "resend" }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Failed to resend")
        return
      }
      toast.success("New OTP sent!")
      setTimer(60)
    } catch {
      toast.error("Something went wrong")
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#07080b] flex items-center justify-center px-4 font-['Rajdhani']">
      <div className="w-full max-w-md p-6 bg-[#0a0c10] border border-[#1e2330] rounded-lg">

        <h1 className="text-2xl font-black font-['Orbitron'] text-white uppercase tracking-tight mb-1">
          Verify Email
        </h1>
        <p className="text-xs text-[#4e5d78] uppercase tracking-wider mb-6">
          Enter the 6-digit code sent to{" "}
          <span className="text-[#ffaa00]">{email}</span>
        </p>

        {/* OTP Input */}
        <div className="space-y-1.5 mb-4">
          <label className="block text-xs font-bold font-['Orbitron'] uppercase tracking-widest text-[#8090a0]">
            OTP Code
          </label>
          <input
            type="text"
            maxLength={6}
            placeholder="000000"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            className="w-full px-4 py-3 bg-[#07080b] border border-[#1e2330] rounded text-white placeholder-[#4e5d78]/60 text-xl font-bold tracking-[0.5em] text-center focus:outline-none focus:border-[#ff9a00]/50 transition-colors"
          />
        </div>

        {/* Verify Button */}
        <button
          onClick={handleVerify}
          disabled={loading}
          className="w-full flex justify-center items-center h-10 bg-[#ff9a00]/5 border border-[#ff9a00]/30 hover:border-[#ff9a00] text-[#ffaa00] hover:text-white hover:bg-[#ff9a00]/15 font-['Orbitron'] font-black text-xs uppercase tracking-widest rounded transition-all duration-200 disabled:opacity-50 mb-3"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Verifying...
            </span>
          ) : (
            "Verify OTP"
          )}
        </button>

        {/* Resend */}
        <button
          onClick={handleResend}
          disabled={resendLoading || timer > 0}
          className="w-full flex justify-center items-center h-9 bg-[#07080b] border border-[#1e2330] text-[#8090a0] hover:text-white font-['Orbitron'] font-bold text-[10px] uppercase tracking-wider rounded transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {resendLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : timer > 0 ? (
            `Resend in ${timer}s`
          ) : (
            "Resend OTP"
          )}
        </button>

      </div>
    </div>
  )
}