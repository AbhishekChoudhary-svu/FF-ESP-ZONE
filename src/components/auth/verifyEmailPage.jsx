"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useToast } from "../ui/GameToast";

// Format seconds as MM:SS
function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(600); // 10 minutes for initial OTP

  useEffect(() => {
    if (timer === 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const toast = useToast();
  const router = useRouter();

  const handleVerify = async () => {
    if (!otp || otp.length !== 6) {
      toast.error("Invalid OTP", "Enter the 6-digit verification code");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/verifyEmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          action: "verify",
          otp,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(
          "Verification Failed",
          data.error || "Email verification failed",
        );
        return;
      }

      toast.verifyEmail("Email Verified", "Your account is now active");

      setTimeout(() => {
        router.replace("/login");
      }, 1500);
    } catch (err) {
      console.error(err);

      toast.error("Verification Error", "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);

    try {
      const res = await fetch("/api/auth/verifyEmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          action: "resend",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error("Resend Failed", data.error || "Failed to resend OTP");
        return;
      }

      toast.resendEmail("OTP Sent", "A new verification code has been sent");

      setTimer(60);
    } catch (err) {
      console.error(err);

      toast.error("Resend Error", "Something went wrong");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07080b] flex items-center justify-center px-4 py-10 font-['Rajdhani'] relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#141822_1px,transparent_1px),linear-gradient(to_bottom,#141822_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40" />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#ffaa00]/30 to-transparent" />

      {/* Corner brackets */}
      <div className="absolute top-4 left-4 w-4 h-4 border-t border-l border-[#141822]" />
      <div className="absolute top-4 right-4 w-4 h-4 border-t border-r border-[#141822]" />
      <div className="absolute bottom-4 left-4 w-4 h-4 border-b border-l border-[#141822]" />
      <div className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-[#141822]" />

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="inline-block px-2.5 py-0.5 bg-[#ffaa00]/10 border border-[#ffaa00]/20 text-[#ffaa00] font-['Orbitron'] text-[10px] font-bold tracking-widest uppercase rounded-sm mb-3">
            ◆ VERIFICATION REQUIRED
          </div>
          <h1 className="text-3xl font-black font-['Orbitron'] text-white uppercase tracking-tight mb-1.5">
            Verify Identity
          </h1>
          <p className="text-xs font-bold text-[#4e5d78] uppercase tracking-wider">
            Enter the 6-digit code sent to{" "}
            <span className="text-[#ffaa00]">{email ?? "your email"}</span>
          </p>
        </div>

        {/* Card */}
        <div className="p-6 bg-[#0a0c10] border border-[#1e2330] rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.4)] space-y-5">
          {/* OTP Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold font-['Orbitron'] uppercase tracking-widest text-[#8090a0]">
              Access Code // OTP
            </label>
            <input
              type="text"
              maxLength={6}
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className="w-full px-4 py-3 bg-[#07080b] border border-[#1e2330] rounded text-white placeholder-[#4e5d78]/60 text-2xl font-bold tracking-[0.6em] text-center focus:outline-none focus:border-[#ff9a00]/50 transition-colors font-mono"
            />
          </div>

          {/* Expiry countdown */}
          <div className="flex items-center justify-between px-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#4e5d78]">
              Code expires in
            </p>
            <p
              className={`text-[13px] font-black font-['Orbitron'] tracking-widest ${
                timer <= 60 ? "text-red-400" : "text-[#ffaa00]"
              }`}
            >
              {timer > 0 ? (
                formatTime(timer)
              ) : (
                <span className="text-red-400">EXPIRED</span>
              )}
            </p>
          </div>

          {/* Expired warning */}
          {timer === 0 && (
            <div className="px-4 py-3 bg-red-950/20 border border-red-900/40 rounded text-xs font-bold font-['Orbitron'] uppercase tracking-wider text-red-400">
              ⚠ Code expired — request a new one below
            </div>
          )}

          {/* Verify Button */}
          <button
            onClick={handleVerify}
            disabled={loading || timer === 0}
            className="w-full flex justify-center items-center h-10 bg-[#ff9a00]/5 border border-[#ff9a00]/30 hover:border-[#ff9a00] text-[#ffaa00] hover:text-white hover:bg-[#ff9a00]/15 font-['Orbitron'] font-black text-xs uppercase tracking-widest rounded transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Verifying...
              </span>
            ) : (
              "Verify OTP"
            )}
          </button>

          {/* Divider */}
          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#141822]" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-[#0a0c10] text-[10px] font-bold uppercase tracking-widest text-[#4e5d78]">
                Didn't receive it?
              </span>
            </div>
          </div>

          {/* Resend Button */}
          <button
            onClick={handleResend}
            disabled={resendLoading || timer > 0}
            className="w-full flex justify-center items-center h-9 bg-[#07080b] border border-[#1e2330] hover:border-[#8090a0]/40 text-[#8090a0] hover:text-white font-['Orbitron'] font-bold text-[10px] uppercase tracking-wider rounded transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {resendLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : timer > 0 ? (
              `Resend available in ${formatTime(timer)}`
            ) : (
              "Request New Code"
            )}
          </button>
        </div>

        <p className="mt-6 text-center text-[10px] font-bold uppercase tracking-widest text-[#1e2330]">
          FF-ESP-ZONE // SECURE VERIFICATION PIPELINE
        </p>
      </div>
    </div>
  );
}
