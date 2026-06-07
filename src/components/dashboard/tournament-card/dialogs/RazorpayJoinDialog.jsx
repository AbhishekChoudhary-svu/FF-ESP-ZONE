"use client";

/**
 * RazorpayJoinDialog.jsx
 *
 * Drop-in replacement for the RazorpayJoinDialog used in TournamentCard.
 *
 * Fixes:
 *  1. step resets to "confirm" on every open — no stale state between sessions
 *  2. If user dismisses the Razorpay modal, step resets cleanly (no stuck "processing")
 *  3. A post-payment polling loop catches the case where the browser-side PUT verify
 *     fails but the webhook has already joined the player — avoids false "failed" toasts
 *  4. Verify fetch failures show a specific, actionable error message
 *  5. Loading state is split so the Razorpay SDK loading and the verify call
 *     both give distinct feedback to the user
 */

import { useState, useContext, useEffect, useCallback } from "react";
import {
  X,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { createPortal } from "react-dom";
import MyContext from "@/context/ThemeProvider";
import toast from "react-hot-toast";

/* ─── tiny helpers ────────────────────────────────────────── */

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/** Load the Razorpay checkout script once */
function loadRazorpaySDK() {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

/**
 * Poll the tournament endpoint to check if the current player has joined.
 * Used as a fallback when the client-side verify PUT fails but the webhook
 * may have already processed the payment.
 */
async function pollForJoin(tournamentId, playerId, { maxAttempts = 6, intervalMs = 2000 } = {}) {
  for (let i = 0; i < maxAttempts; i++) {
    await sleep(intervalMs);
    try {
      const res = await fetch(`/api/tournaments/${tournamentId}`);
      if (!res.ok) continue;
      const data = await res.json();
      if (!data.success) continue;
      const joined = data.tournament?.participants?.some(
        (p) => (p.player?._id ?? p.player)?.toString() === playerId
      );
      if (joined) return true;
    } catch {
      // network blip — keep polling
    }
  }
  return false;
}

/* ─── Dialog shell (portal) ───────────────────────────────── */

function Dialog({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return;
    const handle = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [open, onClose]);

  if (!open) return null;
  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-lg bg-[#0a0c10] border border-[#2a2e3a] rounded-xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.7)] font-['Rajdhani']">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#ff6b00] to-transparent" />
        {[
          "top-0    left-0  border-t-2 border-l-2",
          "top-0    right-0 border-t-2 border-r-2",
          "bottom-0 left-0  border-b-2 border-l-2",
          "bottom-0 right-0 border-b-2 border-r-2",
        ].map((cls, i) => (
          <div key={i} className={`absolute w-3 h-3 ${cls} border-[#ff6b00]`} />
        ))}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#141822] bg-[#0d0f15]">
          <h3 className="font-['Orbitron'] font-bold text-sm text-white tracking-widest uppercase">
            {title}
          </h3>
          <button onClick={onClose} className="text-[#4e5d78] hover:text-red-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 py-5 max-h-[80vh] overflow-y-auto tab-scrollbar">{children}</div>
      </div>
    </div>,
    document.body
  );
}

/* ─── Main component ──────────────────────────────────────── */

export default function RazorpayJoinDialog({ open, onClose, tournament, onSuccess }) {
  const ctx = useContext(MyContext);

  const [step, setStep]       = useState("confirm");
  const [errMsg, setErrMsg]   = useState("");
  const [upiId, setUpiId]     = useState("");       // ← ADD
  const [upiError, setUpiError] = useState("");     // ← ADD
  // ── UPI validation regex (mirrors the server-side check) ──
const UPI_RE = /^[\w.\-]{2,}@[\w]{2,}$/;

  const player  = ctx?.player;
  const team    = ctx?.team;
  const members = team?.players ?? [];
  const teamMode  = tournament?.teamMode;
  const isSquad   = teamMode === "Squad";
  const isDuo     = teamMode === "Duo";
  const joiningMembers = isSquad ? members.slice(0, 4) : isDuo ? members.slice(0, 2) : [player];

  // Reset state every time the dialog opens
  useEffect(() => {
    if (open) {
      setStep("confirm");
      setErrMsg("");
      setUpiId(ctx?.player?.upiId ?? "");   // ← pre-fill if already saved
      setUpiError("");
    }
  }, [open, ctx?.player?.upiId]);

  const handleClose = useCallback(() => {
    if (step === "verifying" || step === "polling") return;
    onClose();
  }, [step, onClose]);

  const handlePay = useCallback(async () => {
    // ── Validate UPI before touching Razorpay ─────────────────────────────
    const trimmed = upiId.trim();
    if (!trimmed) {
      setUpiError("UPI ID is required to receive prize money");
      return;
    }
    if (!UPI_RE.test(trimmed)) {
      setUpiError("Invalid format — try yourname@upi or 9876543210@paytm");
      return;
    }
    setUpiError("");

    setStep("processing");
    setErrMsg("");

    try {
      // ── Save UPI first ────────────────────────────────────────────────────
      const upiRes = await fetch("/api/players/upi", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ upiId: trimmed }),
      });
      if (!upiRes.ok) {
        const d = await upiRes.json();
        setErrMsg(d.error || "Failed to save UPI ID");
        setStep("error");
        return;
      }

      // ── Step 1: Create order ──────────────────────────────────────────────
      const orderRes = await fetch("/api/payments/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tournamentId: tournament._id }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        setErrMsg(orderData.error || "Could not create payment order");
        setStep("error");
        return;
      }

      // ── Step 2: Load SDK ──────────────────────────────────────────────────
      const sdkLoaded = await loadRazorpaySDK();
      if (!sdkLoaded) {
        setErrMsg("Razorpay checkout could not be loaded. Check your connection.");
        setStep("error");
        return;
      }

      // ── Step 3: Open checkout ─────────────────────────────────────────────
      await new Promise((resolve, reject) => {
        const rzp = new window.Razorpay({
          key:         orderData.keyId,
          amount:      orderData.amount,
          currency:    orderData.currency,
          name:        "Tournament Arena",
          description: `Entry Fee — ${orderData.tournamentName}`,
          order_id:    orderData.orderId,
          prefill:     orderData.prefill,
          theme:       { color: "#ff6b00" },
          modal: {
            ondismiss: () => reject(new DOMException("User dismissed checkout", "AbortError")),
          },
          handler: async (response) => {
            setStep("verifying");
            try {
              const verifyRes = await fetch("/api/payments/razorpay", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_order_id:   response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature:  response.razorpay_signature,
                  tournamentId:        tournament._id,
                }),
              });
              const verifyData = await verifyRes.json();
              if (verifyRes.ok && verifyData.success) { resolve(verifyData); return; }

              setStep("polling");
              const joinedViaWebhook = await pollForJoin(
                tournament._id, String(player?._id), { maxAttempts: 5, intervalMs: 2000 }
              );
              joinedViaWebhook
                ? resolve({ fromWebhook: true })
                : reject(new Error(verifyData.error || "Payment verification failed"));
            } catch (verifyErr) {
              setStep("polling");
              const joinedViaWebhook = await pollForJoin(
                tournament._id, String(player?._id), { maxAttempts: 6, intervalMs: 2500 }
              );
              joinedViaWebhook ? resolve({ fromWebhook: true }) : reject(verifyErr);
            }
          },
        });
        rzp.open();
      });

      setStep("done");
      toast.success("Payment verified! You've joined the tournament 🎮");
      onSuccess?.();
      setTimeout(onClose, 1800);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setStep("confirm");   // user dismissed — reset quietly
      } else {
        setErrMsg(err?.message || "Payment failed — please try again");
        setStep("error");
        toast.error(err?.message || "Payment failed");
      }
    }
  }, [tournament, player, upiId, onSuccess, onClose]);   // ← upiId in deps

  const stepLabel = {
    confirm:    `💳 Pay ₹${tournament?.entryFee} & Join`,
    processing: "Opening Checkout…",
    verifying:  "Verifying Payment…",
    polling:    "Confirming Join…",
    done:       "Joined!",
    error:      "Try Again",
  };
  const isWorking = ["processing", "verifying", "polling"].includes(step);

  return (
    <Dialog open={open} onClose={handleClose} title={`💳 Join — ${tournament?.name}`}>
      <div className="space-y-5">

        {/* stats row — unchanged */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Mode",  value: `${tournament?.gameMode} ${tournament?.teamMode}`, color: "text-[#63b3ed]" },
            { label: "Prize", value: `₹${tournament?.prizePool?.toLocaleString() ?? 0}`, color: "text-green-400" },
            { label: "Entry", value: `₹${tournament?.entryFee}`, color: "text-[#ff9a00]" },
          ].map((s, i) => (
            <div key={i} className="p-3 bg-[#07080b] border border-[#1e2330] rounded-lg text-center">
              <p className="text-[10px] text-[#4e5d78] uppercase tracking-wider font-bold mb-1">{s.label}</p>
              <p className={`text-sm font-black font-['Orbitron'] ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* members — unchanged */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#4e5d78] mb-3">
            ◆ {isSquad ? "Squad Members" : isDuo ? "Duo Members" : "Joining As"}
          </p>
          <div className="space-y-2">
            {joiningMembers.length > 0 ? joiningMembers.map((m, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-[#07080b] border border-[#1e2330] rounded-lg">
                <div className="w-8 h-8 rounded-lg overflow-hidden border border-[#2a2e3a] bg-[#1a1f2e] flex items-center justify-center flex-shrink-0">
                  {m?.avatar
                    ? <img src={m.avatar} className="w-full h-full object-cover" alt="" />
                    : <span className="text-xs font-black text-[#ff8c30]">{m?.userId?.username?.charAt(0) ?? "?"}</span>
                  }
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-[#d0d5df]">{m?.userId?.username ?? "Unknown"}</p>
                  <p className="text-[11px] text-[#4e5d78]">{m?.inGameRole}{m?.isCaptain ? " • Captain" : ""}</p>
                </div>
              </div>
            )) : (
              <div className="p-4 bg-[#07080b] border border-red-900/30 rounded-lg text-center">
                <p className="text-sm text-red-400 font-bold">
                  {isSquad || isDuo ? "Your team needs more members" : "No player profile found"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── UPI ID field ── */}
        <div className="p-4 bg-[#07080b] border border-[#1e2330] rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#4e5d78]">
              ◆ Prize Payout UPI ID
            </p>
            <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 bg-red-900/10 border border-red-900/20 text-red-400 rounded">
              Required
            </span>
          </div>
          <p className="text-[11px] text-[#4e5d78]">
            {isSquad || isDuo
              ? "Prize money will be sent to the captain's UPI ID if your team wins."
              : "Prize money will be sent to this UPI ID if you win."}
          </p>
          <input
            type="text"
            value={upiId}
            onChange={(e) => { setUpiId(e.target.value); setUpiError(""); }}
            onBlur={() => {
              if (upiId && !UPI_RE.test(upiId.trim()))
                setUpiError("Invalid format — try yourname@upi or 9876543210@paytm");
            }}
            placeholder="yourname@upi  or  9876543210@paytm"
            disabled={isWorking}
            className={`w-full bg-[#030405] border rounded-lg px-3 py-2.5 text-[13px] font-mono text-[#d0d5df] placeholder-[#2a2e3a] outline-none transition-colors disabled:opacity-50 ${
              upiError
                ? "border-red-500/50 focus:border-red-400"
                : "border-[#2a2e3a] focus:border-[#5f2eea]"
            }`}
          />
          {upiError
            ? <p className="text-[11px] text-red-400">{upiError}</p>
            : <p className="text-[11px] text-[#4e5d78]">
                Format: <span className="text-[#a78bfa]">name@bankhandle</span> or <span className="text-[#a78bfa]">mobile@upi</span>
              </p>
          }
        </div>

        {/* payment breakdown — unchanged */}
        <div className="p-4 bg-[#07080b] border border-[#ff9a00]/20 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#8090a0] font-semibold">Entry Fee</span>
            <span className="font-['Orbitron'] font-black text-[#ffaa00]">₹{tournament?.entryFee}</span>
          </div>
          <div className="border-t border-[#1e2330] pt-3">
            <p className="text-[11px] text-[#4e5d78] leading-relaxed">
              Secured payment via <span className="text-[#ff9a00] font-bold">Razorpay</span>. UPI, Net Banking, Cards &amp; Wallets accepted.
            </p>
          </div>
        </div>

        {/* status messages — unchanged */}
        {step === "done" && (
          <div className="flex items-center justify-center gap-3 py-4 bg-[#4ade80]/10 border border-[#4ade80]/30 rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-[#4ade80]" />
            <span className="text-[#4ade80] font-bold uppercase tracking-wider text-sm">Successfully Joined!</span>
          </div>
        )}
        {step === "polling" && (
          <div className="flex items-center justify-center gap-3 py-3 bg-[#63b3ed]/10 border border-[#63b3ed]/20 rounded-lg">
            <RefreshCw className="w-4 h-4 text-[#63b3ed] animate-spin" />
            <span className="text-[#63b3ed] font-bold uppercase tracking-wider text-xs">Confirming with server…</span>
          </div>
        )}
        {step === "error" && errMsg && (
          <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-400 font-bold leading-relaxed">{errMsg}</p>
          </div>
        )}

        {/* actions — unchanged */}
        {step !== "done" && (
          <div className="flex gap-3">
            <button
              onClick={handlePay}
              disabled={isWorking || joiningMembers.length === 0}
              className="flex-1 py-3 bg-gradient-to-r from-[#ff6b00] to-[#ff9a00] text-white font-bold text-xs uppercase tracking-widest rounded disabled:opacity-50 transition-all hover:brightness-110"
            >
              {isWorking
                ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin" />{stepLabel[step]}</span>
                : stepLabel[step]
              }
            </button>
            <button
              onClick={handleClose}
              disabled={isWorking}
              className="px-5 py-3 border border-[#2a2e3a] text-[#8090a0] hover:text-white font-bold text-xs uppercase tracking-widest rounded transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {step === "error" ? "Close" : "Cancel"}
            </button>
          </div>
        )}
      </div>
    </Dialog>
  );
}