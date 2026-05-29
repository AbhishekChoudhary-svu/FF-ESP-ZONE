"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [verified, setVerified] = useState(false);

  // Cooldown Countdown Clock Sequence
  useEffect(() => {
    if (timer === 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  // Automated Verification Matrix Status Polling
  useEffect(() => {
    if (verified || !email) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/auth/verifyEmail", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            action: "check",
          }),
        });

        const data = await res.json();

        if (data.verified) {
          clearInterval(interval);
          setVerified(true);
          toast.success("Security token authorized. Entry granted.");
          router.replace("/dashboard");
        }
      } catch (err) {
        console.error("Verification matrix polling trace down:", err);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [email, verified, router]);

  // Request Token Dispatch Pipeline
  const resendVerification = async () => {
    if (!email) {
      toast.error("Identity token missing from context string");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/auth/verifyEmail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          action: "resend",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Token distribution system error");
        return;
      }

      toast.success(data.message || "Fresh verification matrix dispatched");
      setTimer(60);
    } catch (err) {
      toast.error(err.message || "Uplink queue saturated. Retry later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07080b] flex items-center justify-center px-4 py-2 font-['Rajdhani'] relative overflow-hidden selection:bg-[#ff6b00]/30 selection:text-white">
      
      {/* Background Grid & Tactical Detail Overlays */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#141822_1px,transparent_1px),linear-gradient(to_bottom,#141822_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40" />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#ffaa00]/30 to-transparent" />

      <div className="w-full max-w-md relative z-10">
        
        {/* Main Terminal Header */}
        <div className="mb-6 text-center">
          <div className="inline-block px-2.5 py-0.5 bg-[#ffaa00]/10 border border-[#ffaa00]/20 text-[#ffaa00] font-['Orbitron'] text-[10px] font-bold tracking-widest uppercase rounded-sm mb-3">
            VERIFICATION PIPELINE ACTIVE
          </div>
          
          <h1 className="text-3xl font-black font-['Orbitron'] text-white uppercase tracking-tight mb-1.5">
            Verify Identity Token
          </h1>
          
          <p className="text-xs font-bold text-[#4e5d78] uppercase tracking-wider">
            Confirming profile parameters for secure system clearance
          </p>
        </div>

        {/* Central Component Card */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-b from-[#ffaa00]/10 to-transparent rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-1000" />
          
          <div className="relative p-6 bg-[#0a0c10] border border-[#1e2330] rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.4)] text-center space-y-5">
            <div className="flex justify-center py-2">
              <div className="h-12 w-12 rounded-full bg-[#ffaa00]/5 border border-[#ffaa00]/20 flex items-center justify-center animate-pulse">
                <span className="text-[#ffaa00] font-['Orbitron'] font-black text-lg">!</span>
              </div>
            </div>

            <p className="text-sm font-semibold tracking-wide text-[#d0d5df]">
              A localized validation matrix link has been dispatched to:
              <span className="block text-[#ffaa00] font-bold font-['Orbitron'] text-xs tracking-wider mt-2 px-3 py-1.5 bg-[#07080b] border border-[#141822] rounded break-all select-all">
                {email || "UNKNOWN_IDENTITY_VARIABLE"}
              </span>
            </p>

            {/* Action Control Button */}
            <button
              onClick={resendVerification}
              disabled={loading || timer > 0 || verified || !email}
              className="w-full flex justify-center items-center h-10 bg-[#ff9a00]/5 border border-[#ff9a00]/30 hover:border-[#ff9a00] text-[#ffaa00] hover:text-white hover:bg-[#ff9a00]/15 font-['Orbitron'] font-black text-xs uppercase tracking-widest rounded transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2 tracking-widest">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> DISPATCHING LOG...
                </span>
              ) : timer > 0 ? (
                `LINK COOLDOWN // RESEND IN ${timer}S`
              ) : (
                "REQUEST NEW IDENTITY LINK"
              )}
            </button>

            {/* Automatic Synchronization Notice */}
            <div className="pt-2 border-t border-[#141822]/60 flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#4e5d78]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
              <span>Awaiting remote verification callback handshake...</span>
            </div>
          </div>
        </div>

        {/* Security Subtext Info */}
        <div className="mt-6 text-center text-[10px] font-bold uppercase tracking-widest text-[#1e2330] select-none">
          POLLING_FREQUENCY // 10000MS INTERVAL SEQUENCE
        </div>
      </div>

      {/* Frame Anchors */}
      <div className="absolute top-4 left-4 w-4 h-4 border-t border-l border-[#141822]" />
      <div className="absolute top-4 right-4 w-4 h-4 border-t border-r border-[#141822]" />
      <div className="absolute bottom-4 left-4 w-4 h-4 border-b border-l border-[#141822]" />
      <div className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-[#141822]" />
    </div>
  );
}