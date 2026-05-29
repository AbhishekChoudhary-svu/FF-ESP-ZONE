"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [ffUid, setFfUid] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingGuest, setLoadingGuest] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("PASSWORDS DO NOT MATCH");
      return;
    }

    if (password.length < 6) {
      setError("PASSWORD MUST BE AT LEAST 6 CHARACTERS");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          username,
          ffUid,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Profile initialization failed");
        return;
      }

      toast.success(data.message || "Registration sequence successful");
      router.push(`/verifyEmail?email=${encodeURIComponent(email)}`);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Uplink configuration failure");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoadingGoogle(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const idToken = await user.getIdToken(true);

      const res = await fetch("/api/auth/googleAuth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Cross-platform authorization dropped");
        return;
      }

      toast.success("Google registration linked successfully");
      window.location.href = "/dashboard";
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Google routing system bypass terminated");
    } finally {
      setLoadingGoogle(false);
    }
  };

  const handleGuestLogin = async () => {
    setLoadingGuest(true);
    try {
      const res = await fetch("/api/auth/guest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to issue localized guest variables");
        return;
      }

      toast.success("Temporary sandbox profile allocated");
      window.location.href = "/dashboard";
    } catch (err) {
      console.error(err);
      toast.error("Sandbox authentication pipeline error");
    } finally {
      setLoadingGuest(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-5 bg-[#0a0c10] border border-[#1e2330] rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.4)] font-['Rajdhani'] text-[#d0d5df]">
      
      {/* Tactical Registration Header */}
      <div className="border-b border-[#141822] pb-4 mb-5">
        <h3 className="text-lg font-bold font-['Orbitron'] tracking-wider text-[#ffaa00] uppercase">
          🛠️ Profile Provisioning
        </h3>
        <p className="text-[11px] text-[#4e5d78] font-bold uppercase tracking-wide mt-0.5">
          Deploy node attributes to register your identification within the network
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Username Field */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold font-['Orbitron'] uppercase tracking-widest text-[#8090a0]">
            Handle Indicator // Username
          </label>
          <input
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading || loadingGoogle || loadingGuest}
            className="w-full px-4 py-2 bg-[#07080b] border border-[#1e2330] rounded text-[#d0d5df] placeholder-[#4e5d78]/60 text-sm font-semibold tracking-wide focus:outline-none focus:border-[#ff9a00]/50 transition-colors disabled:opacity-50"
            required
          />
        </div>

        {/* Email Field */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold font-['Orbitron'] uppercase tracking-widest text-[#8090a0]">
            Identity Matrix // Email
          </label>
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading || loadingGoogle || loadingGuest}
            className="w-full px-4 py-2 bg-[#07080b] border border-[#1e2330] rounded text-[#d0d5df] placeholder-[#4e5d78]/60 text-sm font-semibold tracking-wide focus:outline-none focus:border-[#ff9a00]/50 transition-colors disabled:opacity-50"
            required
          />
        </div>

        {/* Free Fire UID Field */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold font-['Orbitron'] uppercase tracking-widest text-[#ffaa00]">
            Target Core // Free Fire UID
          </label>
          <input
            type="text"
            placeholder="Your Free Fire ID"
            value={ffUid}
            onChange={(e) => setFfUid(e.target.value)}
            disabled={loading || loadingGoogle || loadingGuest}
            className="w-full px-4 py-2 bg-[#07080b] border border-[#ff9a00]/20 rounded text-white placeholder-[#4e5d78]/60 text-sm font-semibold tracking-wide focus:outline-none focus:border-[#ff9a00] transition-colors disabled:opacity-50"
            required
          />
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold font-['Orbitron'] uppercase tracking-widest text-[#8090a0]">
            Access Key // Password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading || loadingGoogle || loadingGuest}
            className="w-full px-4 py-2 bg-[#07080b] border border-[#1e2330] rounded text-[#d0d5df] placeholder-[#4e5d78]/60 text-sm font-semibold tracking-wide focus:outline-none focus:border-[#ff9a00]/50 transition-colors disabled:opacity-50"
            required
          />
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold font-['Orbitron'] uppercase tracking-widest text-[#8090a0]">
            Verify Key // Confirm Password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading || loadingGoogle || loadingGuest}
            className="w-full px-4 py-2 bg-[#07080b] border border-[#1e2330] rounded text-[#d0d5df] placeholder-[#4e5d78]/60 text-sm font-semibold tracking-wide focus:outline-none focus:border-[#ff9a00]/50 transition-colors disabled:opacity-50"
            required
          />
        </div>

        {/* Error Pipeline Feedback Block */}
        {error && (
          <div className="text-red-400 text-xs font-bold font-['Orbitron'] uppercase tracking-wider bg-red-950/20 border border-red-900/40 p-3 rounded">
            ⚠️ Exception: {error}
          </div>
        )}

        {/* Primary Submission Button */}
        <button
          type="submit"
          disabled={loading || loadingGoogle || loadingGuest}
          className="w-full flex justify-center items-center h-10 bg-[#ff9a00]/5 border border-[#ff9a00]/30 hover:border-[#ff9a00] text-[#ffaa00] hover:text-white hover:bg-[#ff9a00]/15 font-['Orbitron'] font-black text-xs uppercase tracking-widest rounded transition-all duration-200 cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center gap-2 tracking-widest">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-[#ffaa00]" /> Generating Account Instance...
            </span>
          ) : (
            "Deploy System Profile"
          )}
        </button>

        {/* Cross Platform Divider System */}
        <div className="relative my-6 py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#141822]" />
          </div>
          <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest">
            <span className="px-3 bg-[#0a0c10] text-[#4e5d78]">
              Cross-Platform Uplink Vectors
            </span>
          </div>
        </div>

        {/* Alternative Processing Options */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading || loadingGoogle || loadingGuest}
            className="flex justify-center items-center h-9 bg-[#07080b] border border-[#1e2330] hover:border-[#8090a0]/40 text-[#8090a0] hover:text-white font-['Orbitron'] font-bold text-[10px] uppercase tracking-wider rounded transition-all duration-150 cursor-pointer disabled:opacity-50"
          >
            {loadingGoogle ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              "Google Link"
            )}
          </button>

          <button
            type="button"
            onClick={handleGuestLogin}
            disabled={loading || loadingGoogle || loadingGuest}
            className="flex justify-center items-center h-9 bg-[#ff6b00]/5 border border-[#ff6b00]/15 hover:border-[#ff6b00]/40 text-red-400 font-['Orbitron'] font-bold text-[10px] uppercase tracking-wider rounded transition-all duration-150 cursor-pointer disabled:opacity-50"
          >
            {loadingGuest ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              "Guest Instance"
            )}
          </button>
        </div>

        {/* Return Routing Sequence Footer */}
        <div className="text-center pt-3 border-t border-[#141822]/60 mt-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#4e5d78]">
            Registered operator verified?{" "}
            <Link 
              href="/login" 
              className="text-[#ffaa00] hover:text-white underline underline-offset-4 transition-colors ml-1 font-extrabold"
            >
              Access Identity Node
            </Link>
          </p>
        </div>

      </form>
    </div>
  );
}