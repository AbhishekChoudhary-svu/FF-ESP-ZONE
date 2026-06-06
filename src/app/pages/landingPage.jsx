"use client";

import Link from "next/link";
import { useContext, useEffect, useRef, useState } from "react";
import MyContext from "@/context/ThemeProvider";
import {
  ShieldCheck,
  Trophy,
  Users,
  Zap,
  Radio,
  ChevronRight,
  Target,
  Flame,
  ArrowRight,
} from "lucide-react";

/* ─── Fonts ─── */
const FontLoader = () => (
  <style>{`@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Orbitron:wght@700;900&display=swap');`}</style>
);

/* ─── Animated counter ─── */
function useCounter(end, duration = 1800, active = false) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!active) return;
    let t0 = null;
    const tick = (ts) => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / duration, 1);
      setN(Math.floor((1 - Math.pow(1 - p, 3)) * end));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [end, duration, active]);
  return n;
}

/* ─── Intersection observer ─── */
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setInView(true);
      },
      { threshold },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

/* ─── Starburst SVG ─── */
function Starburst({ size = 80, opacity = 0.15, className = "" }) {
  const r = size / 2;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={`pointer-events-none absolute ${className}`}
      aria-hidden
    >
      <g stroke="#ff6b00" strokeWidth="1" opacity={opacity} fill="none">
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i * Math.PI) / 4;
          return (
            <line
              key={i}
              x1={r}
              y1={r}
              x2={r + Math.cos(a) * r}
              y2={r + Math.sin(a) * r}
            />
          );
        })}
        <circle cx={r} cy={r} r={r * 0.1} />
      </g>
    </svg>
  );
}

/* ─── Stat card ─── */
function StatCard({ value, suffix = "", prefix = "", label, delay = 0 }) {
  const [ref, inView] = useInView(0.3);
  const n = useCounter(value, 1800, inView);
  return (
    <div
      ref={ref}
      className="relative px-10 py-12 border-r border-[#141822] last:border-r-0 overflow-hidden group"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#ff6b00] to-transparent" />
      <div className="font-['Orbitron'] font-black text-[#ff9a00] text-5xl leading-none tracking-tight mb-3">
        {prefix}
        {inView ? n.toLocaleString() : "0"}
        {suffix}
      </div>
      <div className="font-['Orbitron'] text-[9px] font-bold tracking-[.18em] uppercase text-[#4e5d78]">
        {label}
      </div>
    </div>
  );
}

/* ─── Tournament row ─── */
function TRow({ name, format, prize, filled, total, status, hot }) {
  const pct = Math.round((filled / total) * 100);

  return (
    <div className="grid grid-cols-[1fr_80px_80px] md:grid-cols-[1fr_100px_160px_90px] border-b border-[#141822] last:border-b-0 bg-[#07080b] hover:bg-[#0a0c10] transition-colors cursor-pointer group">
      {/* name */}
      <div className="px-3 md:px-5 py-4 flex flex-col gap-1 relative pl-6 md:pl-8 min-w-0">
        {hot && (
          <span className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#ff6b00] animate-ping" />
        )}

        <span className="text-[11px] md:text-[13px] font-bold text-[#d0d5df] uppercase tracking-[.04em] truncate">
          {name}
        </span>

        <span className="font-['Orbitron'] text-[8px] md:text-[9px] text-[#4e5d78] tracking-[.1em] truncate">
          {format}
        </span>
      </div>

      {/* prize */}
      <div className="px-2 md:px-4 py-4 flex items-center font-['Orbitron'] font-black text-[11px] md:text-[13px] text-[#ffaa00]">
        {prize}
      </div>

      {/* slots - desktop only */}
      <div className="hidden md:flex px-4 py-4 flex-col justify-center gap-1.5">
        <div className="h-[3px] bg-[#1e2330] overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#ff6b00] to-[#ffaa00] transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>

        <span className="font-['Orbitron'] text-[9px] text-[#4e5d78]">
          {filled}/{total}
        </span>
      </div>

      {/* status */}
      <div className="px-2 md:px-4 py-4 flex items-center justify-end">
        <span
          className={`font-['Orbitron'] text-[8px] md:text-[9px] font-bold tracking-[.15em] px-2 py-1 border ${
            status === "open"
              ? "bg-[#ff6b00]/10 text-[#ff6b00] border-[#ff6b00]/25"
              : "bg-[#4ade80]/10 text-[#4ade80] border-[#4ade80]/20"
          }`}
        >
          {status === "open" ? "OPEN" : "LIVE"}
        </span>
      </div>
    </div>
  );
}

/* ─── Feature card ─── */
function FeatCard({ icon, title, body, accent, index }) {
  const [ref, inView] = useInView(0.1);
  return (
    <div
      ref={ref}
      className="relative bg-[#07080b] p-8 hover:bg-[#0a0c10] transition-all duration-300 group"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(28px)",
        transition: `opacity .55s ease ${index * 90}ms, transform .55s ease ${index * 90}ms, background .2s`,
      }}
    >
      {/* large bg number */}
      <span className="absolute top-5 right-5 font-['Orbitron'] font-black text-[42px] text-[#0d0f15] leading-none select-none">
        0{index + 1}
      </span>
      <div className="mb-5" style={{ color: accent }}>
        {icon}
      </div>
      <h3 className="font-['Orbitron'] font-black text-[12px] uppercase tracking-[.05em] text-white mb-3">
        {title}
      </h3>
      <p className="text-[12px] text-[#8090a0] leading-[1.7] font-semibold">
        {body}
      </p>
      <div className="h-[2px] w-8 mt-5" style={{ background: accent }} />
    </div>
  );
}

/* ─── Clip-corner button ─── */
const clipPath =
  "polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px))";

/* ════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════ */
export function LandingPage() {
  const ctx = useContext(MyContext);
  const user = ctx?.user;
  const [scrolled, setScrolled] = useState(false);
  const [heroRef, heroInView] = useInView(0.05);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  /* data */
  const tournaments = [
    {
      name: "TITAN CHAMPIONSHIP",
      format: "BR · Squad",
      prize: "₹50,000",
      filled: 42,
      total: 48,
      status: "open",
      hot: true,
    },
    {
      name: "CORE SHOCK 4v4",
      format: "CS · Squad",
      prize: "₹15,000",
      filled: 16,
      total: 16,
      status: "live",
      hot: false,
    },
    {
      name: "ALPHA SOLO GRID",
      format: "BR · Solo",
      prize: "₹8,000",
      filled: 89,
      total: 100,
      status: "open",
      hot: true,
    },
    {
      name: "MIDNIGHT DUO BLITZ",
      format: "BR · Duo",
      prize: "₹20,000",
      filled: 22,
      total: 24,
      status: "live",
      hot: false,
    },
  ];

  const features = [
    {
      icon: <Trophy size={22} />,
      title: "Free Tournaments",
      body: "Any captain can host open BR or CS brackets — zero entry cost, full competitive structure with auto-managed room IDs.",
      accent: "#ff9a00",
    },
    {
      icon: <Trophy size={22} />,
      title: "Paid Arenas",
      body: "High-stakes events with Razorpay checkout. Payment verified server-side before a slot is confirmed.",
      accent: "#ffcc00",
    },
    {
      icon: <Users size={22} />,
      title: "Squad Recruitment",
      body: "Browse players by KDA, role and region. Captains post openings — players apply in one tap.",
      accent: "#ff6b00",
    },
    {
      icon: <ShieldCheck size={22} />,
      title: "Anti-Cheat Guard",
      body: "Real-time UID verification and match telemetry keep every bracket clean and competition fair.",
      accent: "#4ade80",
    },
    {
      icon: <Radio size={22} />,
      title: "Live Room Creds",
      body: "Organizers publish Room ID and password directly to registered participants — hidden from everyone else.",
      accent: "#63b3ed",
    },
    {
      icon: <Zap size={22} />,
      title: "Instant Results",
      body: "Submit placements, kills and prizes post-match. Player stats update automatically across all leaderboards.",
      accent: "#ff9a00",
    },
  ];

  return (
    <div className="min-h-screen bg-[#07080b] text-[#d0d5df] font-['Rajdhani'] overflow-x-hidden relative selection:bg-[#ff6b00]/30 selection:text-white">
      <FontLoader />

      {/* Grid overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-100"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,107,0,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,107,0,0.025) 1px,transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage:
            "radial-gradient(ellipse 80% 80% at 50% 40%,#000 40%,transparent 100%)",
        }}
      />

      {/* Ambient glows */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-[#ff6b00]/[0.05] rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed top-1/2 right-0 w-[350px] h-[350px] bg-[#ffaa00]/[0.03] rounded-full blur-[120px] pointer-events-none z-0" />

      {/* ══════════ NAV ══════════ */}
      <nav
        className={`sticky top-0 z-50 border-b transition-all duration-300 ${
          scrolled
            ? "border-[#1e2330] bg-[#07080b]/95 backdrop-blur-xl shadow-[0_4px_40px_rgba(0,0,0,0.6)]"
            : "border-[#141822] bg-[#07080b]/80 backdrop-blur-md"
        }`}
      >
        <div className="flex items-stretch max-w-7xl mx-auto">
          {/* brand column — editorial left block */}
          <div className="flex items-center gap-2.5 px-6 py-[15px] border-r border-[#141822] min-w-[210px]">
            <span className="w-2 h-2 rounded-full bg-[#ff6b00] animate-ping flex-shrink-0" />
            <span className="font-['Orbitron'] font-black text-[15px] tracking-[.08em] bg-gradient-to-r from-[#ff6b00] to-[#ffaa00] bg-clip-text text-transparent">
              FF‑ESP‑ZONE
            </span>
          </div>

          {/* center links */}
          <div className="hidden md:flex items-center flex-1 px-0">
            {[ "Features", "Formats"].map((l) => (
              <a
                key={l}
                href={`#${l.toLowerCase()}`}
                className="flex items-center h-full px-5 font-['Orbitron'] text-[10px] font-bold tracking-[.12em] uppercase text-[#4e5d78] border-r border-[#0d0f15] hover:text-[#ff9a00] hover:bg-[#ff6b00]/[0.04] transition-colors"
              >
                {l}
              </a>
            ))}
          </div>

          {/* right auth */}
          <div className="flex items-center border-l border-[#141822] ml-auto">
            {user ? (
              <div className="flex items-center gap-2.5 px-5 py-3">
                <div className="w-8 h-8 rounded-[3px] bg-gradient-to-br from-[#ff6b00] to-[#ff9a00] flex items-center justify-center font-['Orbitron'] font-black text-[13px] text-white">
                  {user.username?.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:flex flex-col leading-tight">
                  <span className="text-[12px] font-bold text-white">
                    {user.username}
                  </span>
                  <span className="font-['Orbitron'] text-[9px] text-[#4e5d78]">
                    UID: {user.ffUid}
                  </span>
                </div>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="flex items-center h-full px-5 font-['Orbitron'] text-[10px] font-bold tracking-[.1em] uppercase text-[#8090a0] border-r border-[#141822] hover:text-white hover:bg-[#0d0f15] transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="flex items-center h-full px-5 font-['Orbitron'] text-[10px] font-bold tracking-[.1em] uppercase text-white bg-[#ff6b00] hover:bg-[#ff7c1a] transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ══════════ HERO ══════════ */}
      <section
        ref={heroRef}
        className="relative min-h-[92vh] border-b border-[#141822] overflow-hidden"
      >
        {/* bg radial */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_55%_65%_at_15%_50%,rgba(255,107,0,0.07)_0%,transparent_60%)]" />
        {/* right vertical accent */}
        <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-transparent via-[#ff6b00]/20 to-transparent" />

        {/* starbursts */}
        <Starburst size={130} opacity={0.12} className="top-[10%] left-[2%]" />
        <Starburst
          size={70}
          opacity={0.08}
          className="bottom-[15%] left-[6%]"
        />
        <Starburst size={90} opacity={0.09} className="top-[8%] right-[4%]" />
        <Starburst
          size={55}
          opacity={0.07}
          className="bottom-[10%] right-[8%]"
        />

        {/* two-column grid matching editorial reference */}
        <div className="grid md:grid-cols-2 min-h-[92vh] max-w-7xl mx-auto relative z-10">
          {/* LEFT — typography */}
          <div className="flex flex-col justify-center px-8 md:px-11 py-20 border-r border-[#141822] relative">
            {/* eyebrow */}
            <div
              className="flex items-center gap-3 font-['Orbitron'] text-[9px] font-bold tracking-[.2em] uppercase text-[#ff6b00] mb-7"
              style={{
                opacity: heroInView ? 1 : 0,
                transform: heroInView ? "none" : "translateY(20px)",
                transition: "opacity .7s .1s, transform .7s .1s",
              }}
            >
              <span className="w-8 h-px bg-[#ff6b00]/40 flex-shrink-0" />
              Next-Gen Esports Platform
            </div>

            {/* headline */}
            <h1
              className="font-['Orbitron'] font-black uppercase leading-[.92] tracking-[-0.01em] text-white mb-8"
              style={{
                fontSize: "clamp(52px,6vw,88px)",
                opacity: heroInView ? 1 : 0,
                transform: heroInView ? "none" : "translateY(24px)",
                transition: "opacity .8s .2s, transform .8s .2s",
              }}
            >
              WIN
              <br />
              <span className="text-[#ff6b00]">EVERY</span>
              <br />
              <span className="text-[#ffaa00]">BATTLE</span>
            </h1>

            {/* desc */}
            <p
              className="text-[14px] text-[#8090a0] font-semibold leading-[1.7] tracking-[.02em] max-w-[380px] mb-10"
              style={{
                opacity: heroInView ? 1 : 0,
                transform: heroInView ? "none" : "translateY(20px)",
                transition: "opacity .8s .35s, transform .8s .35s",
              }}
            >
              The definitive Free Fire tournament platform. Host brackets, join
              paid arenas, recruit squads — all in one tactical command center.
            </p>

            {/* CTAs */}
            <div
              className="flex flex-wrap gap-3 mb-14"
              style={{
                opacity: heroInView ? 1 : 0,
                transform: heroInView ? "none" : "translateY(20px)",
                transition: "opacity .8s .5s, transform .8s .5s",
              }}
            >
              {user ? (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#ff6b00] hover:bg-[#ff7c1a] text-white font-['Orbitron'] font-bold text-[11px] tracking-[.1em] uppercase transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(255,107,0,0.35)]"
                  style={{ clipPath }}
                >
                  Enter Dashboard <ArrowRight size={13} />
                </Link>
              ) : (
                <>
                  <Link
                    href="/signup"
                    className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#ff6b00] hover:bg-[#ff7c1a] text-white font-['Orbitron'] font-bold text-[11px] tracking-[.1em] uppercase transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(255,107,0,0.35)]"
                    style={{ clipPath }}
                  >
                    Start Free <ArrowRight size={13} />
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 px-7 py-3.5 bg-transparent border border-[#2a2e3a] text-[#8090a0] hover:text-white hover:bg-[#0d0f15] hover:border-[#4e5d78] font-['Orbitron'] font-bold text-[11px] tracking-[.1em] uppercase transition-all"
                    style={{ clipPath }}
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>

            {/* live indicators */}
            <div
              className="flex flex-wrap gap-6"
              style={{
                opacity: heroInView ? 1 : 0,
                transition: "opacity .8s .65s",
              }}
            >
              {[
                {
                  color: "bg-[#ff6b00]",
                  text: "text-[#ff6b00]",
                  label: "247 Live",
                  icon: <Radio size={10} />,
                  ping: true,
                },
                {
                  color: "bg-[#ffaa00]",
                  text: "text-[#ffaa00]",
                  label: "10K+ Players",
                  icon: <Target size={10} />,
                },
                {
                  color: "bg-[#4ade80]",
                  text: "text-[#4ade80]",
                  label: "₹1M+ Paid",
                  icon: <Flame size={10} />,
                },
              ].map((ind) => (
                <div
                  key={ind.label}
                  className={`flex items-center gap-1.5 font-['Orbitron'] text-[9px] font-bold tracking-[.1em] uppercase ${ind.text}`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${ind.color} ${ind.ping ? "animate-ping" : ""}`}
                  />
                  {ind.icon}
                  {ind.label}
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — live bracket panel */}
          <div className="flex flex-col bg-[#030406]">
            {/* top metric */}
            <div className="flex-1 px-12 pt-12 pb-8 border-b border-[#141822] relative flex flex-col justify-end">
              {/* ghost large number */}
              <span
                className="absolute top-8 right-10 font-['Orbitron'] font-black text-[#141822] leading-none select-none"
                style={{ fontSize: "clamp(64px,8vw,120px)" }}
              >
                48
              </span>
              <div className="font-['Orbitron'] text-[9px] font-bold tracking-[.2em] uppercase text-[#4e5d78] mb-2">
                Active Tonight
              </div>
              <div
                className="font-['Orbitron'] font-black text-[#ff9a00] leading-none mb-1"
                style={{ fontSize: "clamp(32px,4vw,48px)" }}
              >
                ₹1,35,000
              </div>
              <div className="font-['Orbitron'] text-[9px] text-[#4e5d78] tracking-[.15em] uppercase">
                Total Prize Pool Live
              </div>
            </div>

            {/* live brackets */}
            <div className="px-12 py-10">
              <div className="flex items-center gap-2 font-['Orbitron'] text-[9px] font-bold tracking-[.2em] uppercase text-[#4e5d78] mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff6b00] animate-ping" />
                Live Brackets
              </div>
              <div className="flex flex-col gap-1.5">
                {[
                  {
                    name: "Titan Championship",
                    meta: "BR · Squad · 48 slots",
                    prize: "₹50K",
                  },
                  {
                    name: "Core Shock 4v4",
                    meta: "CS · Squad · FULL",
                    prize: "₹15K",
                  },
                  {
                    name: "Alpha Solo Grid",
                    meta: "BR · Solo · 100 slots",
                    prize: "₹8K",
                  },
                ].map((b) => (
                  <div
                    key={b.name}
                    className="flex items-center justify-between px-4 py-3 border border-[#1e2330] bg-[#07080b] hover:border-[#ff6b00]/40 transition-colors relative"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#ff6b00]" />
                    <div>
                      <div className="text-[11px] font-bold text-[#d0d5df] uppercase tracking-[.04em]">
                        {b.name}
                      </div>
                      <div className="font-['Orbitron'] text-[9px] text-[#4e5d78] mt-0.5">
                        {b.meta}
                      </div>
                    </div>
                    <div className="font-['Orbitron'] font-black text-[13px] text-[#ffaa00]">
                      {b.prize}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

     

       {/* ══════════ TICKER ══════════ */}
      <div className="border-t border-b border-[#141822] bg-[#030406] py-2.5 pt-10 overflow-hidden">
        <div
          className="flex"
          style={{ width: "200%", animation: "ticker 28s linear infinite" }}
        >
          <style>{`@keyframes ticker{from{transform:translateX(0)}to{transform:translateX(-50%)}}`}</style>
          {[0, 1].map((ri) => (
            <div key={ri} className="flex flex-1">
              {[
                "SQUAD TOURNAMENTS LIVE",
                "PRIZE POOLS UP TO ₹50K",
                "ANTI-CHEAT VERIFIED",
                "SOLO · DUO · SQUAD",
                "CLASH SQUAD 4v4",
                "FREE REGISTRATION",
                "RAZORPAY SECURED",
                "REAL-TIME ROOM CREDS",
              ].map((t, i) => (
                <div
                  key={i}
                  className="inline-flex items-center gap-2.5 px-8 font-['Orbitron'] text-[9px] font-bold tracking-[.15em] uppercase text-[#4e5d78] border-r border-[#1e2330] whitespace-nowrap"
                >
                  <span className="text-[#ff6b00] text-[8px]">◆</span> {t}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ══════════ STATS ══════════ */}
      <div className="border-t border-b pt-10 border-[#141822] bg-[#030406]">
        <div className="grid grid-cols-1 md:grid-cols-3 max-w-7xl mx-auto px-6">
          <StatCard
            value={10000}
            suffix="+"
            label="Verified Active Players"
            delay={0}
          />
          <StatCard
            value={500}
            suffix="+"
            label="Monthly Brackets Deployed"
            delay={150}
          />
          <StatCard
            value={1}
            prefix="₹"
            suffix="M+"
            label="Prize Pool Distributed"
            delay={300}
          />
        </div>
      </div>

      {/* ══════════ FEATURES ══════════ */}
      <section
        className="py-20 bg-[#030406] border-b border-[#141822] relative z-10"
        id="features"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-12 pb-5 border-b border-[#141822]">
            <div>
              <div className="font-['Orbitron'] text-[9px] font-bold tracking-[.2em] uppercase text-[#ff6b00] mb-2">
                Platform Modules
              </div>
              <h2 className="font-['Orbitron'] font-black uppercase text-white text-[clamp(22px,3vw,36px)] tracking-tight">
                What You Get
              </h2>
            </div>
          </div>

          {/* 3×2 grid separated by 1px #141822 lines */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#141822] border border-[#141822]">
            {features.map((f, i) => (
              <FeatCard key={i} {...f} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ FORMATS ══════════ */}
      <section className="py-20 relative z-10" id="formats">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12 pb-5 border-b border-[#141822]">
            <div className="font-['Orbitron'] text-[9px] font-bold tracking-[.2em] uppercase text-[#ff6b00] mb-2">
              Game Modes
            </div>
            <h2 className="font-['Orbitron'] font-black uppercase text-white text-[clamp(22px,3vw,36px)] tracking-tight">
              Combat Configurations
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* left — BR + CS blocks */}
            <div className="flex flex-col gap-6">
              {[
                {
                  label: "Mode 01 — Battle Royale",
                  title: "Battle Royale",
                  desc: "Drop in, survive, dominate. Auto-calculated slots — 48 solo, 24 duo, 12 squad per bracket.",
                  tags: [
                    ["Solo · 48 Players", "br"],
                    ["Duo · 48 Players", "br"],
                    ["Squad · 48 Players", "br"],
                  ],
                },
                {
                  label: "Mode 02 — Clash Squad",
                  title: "Clash Squad",
                  desc: "Intense 4v4 format. Two squads, eight players, one winner. Custom room auto-manages the bracket.",
                  tags: [
                    ["4v4 · 8 Players", "cs"],
                    ["Squad Only", "cs"],
                  ],
                },
              ].map((block) => (
                <div
                  key={block.title}
                  className="border border-[#1e2330] p-12 bg-[#07080b]"
                >
                  <div className="font-['Orbitron'] text-[9px] font-bold tracking-[.2em] uppercase text-[#ff6b00] mb-3">
                    {block.label}
                  </div>
                  <h3 className="font-['Orbitron'] font-black uppercase text-white text-[22px] mb-2 tracking-[.02em]">
                    {block.title}
                  </h3>
                  <p className="text-[12px] text-[#8090a0] font-semibold leading-[1.6] mb-6">
                    {block.desc}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {block.tags.map(([t, type]) => (
                      <span
                        key={t}
                        className={`font-['Orbitron'] text-[9px] font-bold tracking-[.12em] uppercase px-3 py-1.5 border ${
                          type === "br"
                            ? "border-[#ff6b00]/30 text-[#ff8c30] bg-[#ff6b00]/[0.06]"
                            : "border-[#ffaa00]/30 text-[#ffaa00] bg-[#ffaa00]/[0.06]"
                        }`}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* right — prize block */}
            <div className="border border-[#1e2330] p-8 bg-[#030406] flex flex-col">
              <div className="font-['Orbitron'] text-[9px] font-bold tracking-[.2em] uppercase text-[#ff6b00] mb-3">
                Prize Structure
              </div>
              <h3 className="font-['Orbitron'] font-black uppercase text-white text-[22px] mb-2 tracking-[.02em]">
                Payout Matrix
              </h3>
              <p className="text-[12px] text-[#8090a0] font-semibold leading-[1.6] mb-8">
                Standard prize distribution for all brackets:
              </p>

              <div className="flex-1 flex flex-col justify-center gap-0 divide-y divide-[#0d0f15]">
                {[
                  {
                    rank: "1st — Champion",
                    pct: "50%",
                    w: "100%",
                    color: "text-[#ffaa00]",
                  },
                  {
                    rank: "2nd — Runner Up",
                    pct: "30%",
                    w: "60%",
                    color: "text-[#d0d5df]",
                  },
                  {
                    rank: "3rd — Third",
                    pct: "20%",
                    w: "40%",
                    color: "text-[#8090a0]",
                  },
                ].map((p) => (
                  <div key={p.rank} className="flex items-center gap-4 py-4">
                    <div className="text-[12px] font-bold text-[#4e5d78] uppercase tracking-[.04em] w-36 flex-shrink-0">
                      {p.rank}
                    </div>
                    <div className="flex-1 h-[2px] bg-[#1e2330]">
                      <div
                        className="h-full bg-[#ff6b00]"
                        style={{ width: p.w }}
                      />
                    </div>
                    <div
                      className={`font-['Orbitron'] font-black text-[18px] flex-shrink-0 ${p.color}`}
                    >
                      {p.pct}
                    </div>
                  </div>
                ))}
              </div>

              {/* entry fee chips */}
              <div className="grid grid-cols-2 gap-3 mt-8 pt-6 border-t border-[#141822]">
                <div className="p-4 bg-[#07080b] border border-[#1e2330]">
                  <div className="font-['Orbitron'] text-[9px] text-[#4e5d78] tracking-[.15em] uppercase mb-1.5">
                    Free Entry
                  </div>
                  <div className="font-['Orbitron'] font-black text-[22px] text-[#4ade80]">
                    ₹0
                  </div>
                </div>
                <div className="p-4 bg-[#07080b] border border-[#ff6b00]/20">
                  <div className="font-['Orbitron'] text-[9px] text-[#4e5d78] tracking-[.15em] uppercase mb-1.5">
                    Paid — Up To
                  </div>
                  <div className="font-['Orbitron'] font-black text-[22px] text-[#ffaa00]">
                    ₹50K
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ CTA ══════════ */}
      <section className="py-28 relative overflow-hidden border-t border-b border-[#141822]">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_50%_80%_at_50%_50%,rgba(255,107,0,0.05)_0%,transparent_70%)]" />
        <Starburst
          size={220}
          opacity={0.06}
          className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        />

        <div className="max-w-[600px] mx-auto px-6 text-center relative z-10">
          <div className="font-['Orbitron'] text-[9px] font-bold tracking-[.2em] uppercase text-[#ff6b00] mb-5">
            Initialize Sequence
          </div>
          <h2
            className="font-['Orbitron'] font-black uppercase text-white leading-[.92] tracking-[-0.01em] mb-5"
            style={{ fontSize: "clamp(36px,5vw,64px)" }}
          >
            Ready to
            <br />
            <span className="text-[#ff6b00]">Compete?</span>
          </h2>
          <p className="text-[13px] text-[#8090a0] font-semibold leading-[1.7] tracking-[.02em] mb-10 max-w-[440px] mx-auto">
            Join thousands of Free Fire players competing in verified,
            anti-cheat tournaments. Free to enter, free to host — paid arenas
            with real prize pools.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#ff6b00] hover:bg-[#ff7c1a] text-white font-['Orbitron'] font-bold text-[11px] tracking-[.1em] uppercase transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(255,107,0,0.35)]"
              style={{ clipPath }}
            >
              Create Account <ArrowRight size={13} />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-3.5 border border-[#2a2e3a] text-[#8090a0] hover:text-white hover:bg-[#0d0f15] hover:border-[#4e5d78] font-['Orbitron'] font-bold text-[11px] tracking-[.1em] uppercase transition-all"
              style={{ clipPath }}
            >
              View Live Arenas
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer className="bg-[#030406] border-t border-[#141822] pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-14">
            <div className="col-span-2 md:col-span-1">
              <div className="font-['Orbitron'] font-black text-[16px] text-white tracking-[.08em] mb-3">
                FF‑ESP‑ZONE
              </div>
              <p className="text-[11px] text-[#4e5d78] font-semibold uppercase leading-[1.7] tracking-[.04em]">
                The definitive platform for Free Fire tournament management.
                Compete, host, recruit.
              </p>
            </div>
            {[
              {
                title: "Platform",
                links: [
                  "Tournaments",
                  "Recruitment",
                  "World Chat",
                  "Dashboard",
                ],
              },
              {
                title: "Company",
                links: ["About Us", "Blog", "Contact", "Press Kit"],
              },
              {
                title: "Legal",
                links: [
                  "Privacy Policy",
                  "Terms of Use",
                  "Game Rules",
                  "Refund Policy",
                ],
              },
            ].map((col) => (
              <div key={col.title}>
                <div className="font-['Orbitron'] text-[9px] font-bold tracking-[.2em] uppercase text-[#8090a0] mb-4">
                  {col.title}
                </div>
                <ul className="flex flex-col gap-2.5">
                  {col.links.map((l) => (
                    <li key={l}>
                      <a
                        href="#"
                        className="text-[11px] text-[#4e5d78] font-bold uppercase tracking-[.05em] hover:text-[#ff9a00] transition-colors"
                      >
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-[#141822]">
            <div className="font-['Orbitron'] text-[9px] text-[#2a2e3a] tracking-[.12em] uppercase">
              © 2026 FF‑ESP‑ZONE · Free Fire™ is a trademark of Garena
            </div>
            <div className="flex items-center gap-2 font-['Orbitron'] text-[9px] text-[#2a2e3a] tracking-[.1em] uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff6b00]" />
              Systems Operational
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
