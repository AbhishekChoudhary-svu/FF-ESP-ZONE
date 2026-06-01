"use client";

import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingGuest, setLoadingGuest] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.status === 403) {
        toast.error(data.error || "Verification sequence incomplete");
        window.location.href = `/verifyEmail?email=${encodeURIComponent(email)}`;
        return;
      }

      if (!response.ok) {
        toast.error(data.error || "Authentication module failure");
        return;
      }

      toast.success(data.message || "Access clearance granted");
      window.location.href = "/dashboard";
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Network grid connection error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoadingGoogle(true);
    try {
      const res = await fetch("/api/auth/googleAuth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: credentialResponse.credential }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Cross-platform authentication failure");
        return;
      }

      toast.success("Google link sequence authorized");
      window.location.href = "/dashboard";
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Google routing system bypass terminated");
    } finally {
      setLoadingGoogle(false);
    }
  };

  const handleGoogleError = () => {
    toast.error("Google login was cancelled or failed");
    setLoadingGoogle(false);
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
        toast.error(data.error || "Failed to provision localized terminal credentials");
        return;
      }

      toast.success("Temporary baseline credentials deployed");
      window.location.href = "/dashboard";
    } catch (err) {
      console.error(err);
      toast.error("An error occurred during sandbox profile initialization");
    } finally {
      setLoadingGuest(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-5 bg-[#0a0c10] border border-[#1e2330] rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.4)] font-['Rajdhani'] text-[#d0d5df]">

      {/* Header */}
      <div className="border-b border-[#141822] pb-4 mb-5">
        <h3 className="text-lg font-bold font-['Orbitron'] tracking-wider text-[#ffaa00] uppercase">
          🔒 Sector Authentication
        </h3>
        <p className="text-[11px] text-[#4e5d78] font-bold uppercase tracking-wide mt-0.5">
          Provide baseline operator access keys to link account profiles
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Email */}
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

        {/* Password */}
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

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || loadingGoogle || loadingGuest}
          className="w-full flex justify-center items-center h-10 bg-[#ff9a00]/5 border border-[#ff9a00]/30 hover:border-[#ff9a00] text-[#ffaa00] hover:text-white hover:bg-[#ff9a00]/15 font-['Orbitron'] font-black text-xs uppercase tracking-widest rounded transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center gap-2 tracking-widest">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-[#ffaa00]" /> Processing Clearance...
            </span>
          ) : (
            "Initialize Connection"
          )}
        </button>

        {/* Divider */}
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

        {/* Google + Guest buttons */}
        <div className="grid grid-cols-2 gap-3">

          {/* Google — styled button with invisible GoogleLogin overlay */}
          <div className="relative">
            <button
              type="button"
              disabled={loading || loadingGoogle || loadingGuest}
              className="w-full flex justify-center items-center h-9 bg-[#07080b] border border-[#1e2330] hover:border-[#8090a0]/40 text-[#8090a0] hover:text-white font-['Orbitron'] font-bold text-[10px] uppercase tracking-wider rounded transition-all duration-150 pointer-events-none disabled:opacity-50"
            >
              {loadingGoogle ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                "Google Link"
              )}
            </button>
            {/* Invisible GoogleLogin sits on top and captures the click */}
            {!loading && !loadingGoogle && !loadingGuest && (
              <div className="absolute inset-0 opacity-0 overflow-hidden rounded cursor-pointer">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap={false}
                  type="standard"
                  size="large"
                  width="300"
                />
              </div>
            )}
          </div>

          {/* Guest */}
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

        {/* Footer */}
        <div className="text-center pt-3 border-t border-[#141822]/60 mt-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#4e5d78]">
            Unregistered Identity Module?{" "}
            <Link
              href="/signup"
              className="text-[#ffaa00] hover:text-white underline underline-offset-4 transition-colors ml-1 font-extrabold"
            >
              Provision Account Profile
            </Link>
          </p>
        </div>

      </form>
    </div>
  );
}