"use client";

import Link from "next/link";
import ThemeToggleButton from "../../components/ui/theme-toggle-button";
import { useContext, useEffect, useRef, useState } from "react";
import MyContext from "@/context/ThemeProvider";
import { Shield, ShieldCheck, Trophy, Users, Zap, Radio, ChevronRight, Crosshair, Target, Flame } from "lucide-react";

/* ── Animated counter hook ── */
function useCounter(end, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration, start]);
  return count;
}

/* ── Intersection observer hook ── */
function useInView(threshold = 0.2) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

/* ── Stat counter component ── */
function StatCounter({ value, suffix, label, delay = 0 }) {
  const [ref, inView] = useInView(0.3);
  const num = useCounter(value, 1800, inView);
  return (
    <div ref={ref} className="p-5 sm:p-6 border border-[#141822] bg-[#07080b]/50 rounded relative overflow-hidden group hover:border-[#ff6b00]/30 transition-all duration-300"
      style={{ animationDelay: `${delay}ms` }}>
      <div className="absolute inset-0 bg-gradient-to-br from-[#ff6b00]/0 to-[#ff6b00]/0 group-hover:from-[#ff6b00]/5 group-hover:to-transparent transition-all duration-500" />
      <div className="mb-1 text-3xl sm:text-4xl font-black font-['Orbitron'] text-[#ff9a00] tracking-wider">
        {inView ? num.toLocaleString() : "0"}{suffix}
      </div>
      <div className="text-[10px] sm:text-xs font-bold text-[#4e5d78] uppercase tracking-widest">{label}</div>
    </div>
  );
}

/* ── Scanline overlay ── */
function Scanlines() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.015]"
      style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.5) 2px, rgba(255,255,255,0.5) 4px)" }} />
  );
}

/* ── Floating particle ── */
function Particle({ style }) {
  return <div className="absolute w-0.5 h-0.5 bg-[#ff6b00]/40 rounded-full animate-ping" style={style} />;
}

export function LandingPage() {
  const context = useContext(MyContext);
  const [navScrolled, setNavScrolled] = useState(false);
  const [heroRef, heroInView] = useInView(0.1);
  const [featRef, featInView] = useInView(0.1);

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const particles = [
    { top: "15%", left: "8%",  animationDelay: "0s",    animationDuration: "2.1s" },
    { top: "35%", left: "92%", animationDelay: "0.7s",  animationDuration: "3.3s" },
    { top: "60%", left: "5%",  animationDelay: "1.4s",  animationDuration: "2.7s" },
    { top: "75%", left: "88%", animationDelay: "0.3s",  animationDuration: "2.4s" },
    { top: "50%", left: "50%", animationDelay: "1.8s",  animationDuration: "3.6s" },
    { top: "20%", left: "72%", animationDelay: "0.9s",  animationDuration: "2.9s" },
  ];

  return (
    <div className="min-h-screen bg-[#07080b] text-[#d0d5df] font-['Rajdhani'] selection:bg-[#ff6b00]/30 selection:text-white relative overflow-x-hidden">

      <style>{`
        @keyframes flicker { 0%,100%{opacity:1} 92%{opacity:1} 93%{opacity:0.8} 94%{opacity:1} 97%{opacity:0.9} 98%{opacity:1} }
        @keyframes slideDown { from{transform:translateY(-20px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes slideUp { from{transform:translateY(30px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes slideLeft { from{transform:translateX(40px);opacity:0} to{transform:translateX(0);opacity:1} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes glitch {
          0%,100%{clip-path:inset(0 0 98% 0);transform:translateX(0)}
          10%{clip-path:inset(10% 0 85% 0);transform:translateX(-4px)}
          20%{clip-path:inset(40% 0 55% 0);transform:translateX(4px)}
          30%{clip-path:inset(70% 0 20% 0);transform:translateX(-2px)}
          40%{clip-path:inset(90% 0 5% 0);transform:translateX(0)}
          50%{clip-path:inset(20% 0 70% 0);transform:translateX(3px)}
          60%{clip-path:inset(60% 0 30% 0);transform:translateX(-3px)}
          70%{clip-path:inset(80% 0 10% 0);transform:translateX(2px)}
          80%{clip-path:inset(5% 0 90% 0);transform:translateX(-1px)}
          90%{clip-path:inset(30% 0 65% 0);transform:translateX(1px)}
        }
        @keyframes borderPulse {
          0%,100%{border-color:rgba(255,107,0,0.2)}
          50%{border-color:rgba(255,107,0,0.6)}
        }
        @keyframes scanMove {
          0%{transform:translateY(-100%)}
          100%{transform:translateY(100vh)}
        }
        @keyframes hueShift {
          0%,100%{filter:hue-rotate(0deg)}
          50%{filter:hue-rotate(20deg)}
        }
        @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }

        .hero-in { animation: slideUp 0.8s cubic-bezier(0.22,1,0.36,1) both; }
        .hero-in-2 { animation: slideUp 0.8s cubic-bezier(0.22,1,0.36,1) 0.15s both; }
        .hero-in-3 { animation: slideUp 0.8s cubic-bezier(0.22,1,0.36,1) 0.3s both; }
        .hero-in-4 { animation: slideUp 0.8s cubic-bezier(0.22,1,0.36,1) 0.45s both; }

        .glitch-text { position:relative; }
        .glitch-text::before,.glitch-text::after {
          content:attr(data-text); position:absolute; top:0; left:0; width:100%; height:100%;
        }
        .glitch-text::before { color:#ff6b00; animation:glitch 4s infinite linear; animation-delay:0.5s; }
        .glitch-text::after  { color:#ffaa00; animation:glitch 4s infinite linear; animation-delay:1s; left:2px; }

        .card-hover { transition: transform 0.25s cubic-bezier(0.22,1,0.36,1), border-color 0.25s, box-shadow 0.25s; }
        .card-hover:hover { transform:translateY(-4px); box-shadow:0 12px 32px rgba(255,107,0,0.12); }

        .btn-glow:hover { box-shadow: 0 0 20px rgba(255,107,0,0.4), 0 0 40px rgba(255,107,0,0.15); }

        .border-pulse { animation: borderPulse 2.5s ease-in-out infinite; }
        .flicker { animation: flicker 8s infinite; }

        .scan-line {
          position:absolute; top:0; left:0; right:0; height:2px;
          background:linear-gradient(90deg,transparent,rgba(255,107,0,0.15),transparent);
          animation:scanMove 6s linear infinite;
          pointer-events:none; z-index:1;
        }

        .marquee-inner { animation: marquee 20s linear infinite; }
        .marquee-inner:hover { animation-play-state: paused; }

        .feat-card {
          opacity:0; transform:translateY(20px);
          transition:opacity 0.5s ease, transform 0.5s ease;
        }
        .feat-card.visible { opacity:1; transform:translateY(0); }
      `}</style>

      {/* Ambient glows */}
      <div className="fixed top-0 left-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-[#ff6b00]/5 rounded-full blur-[100px] sm:blur-[120px] pointer-events-none z-0" />
      <div className="fixed top-[50vh] right-0 w-[200px] sm:w-[400px] h-[200px] sm:h-[400px] bg-[#ffaa00]/3 rounded-full blur-[100px] sm:blur-[150px] pointer-events-none z-0" />

      {/* Particles */}
      {particles.map((p, i) => <Particle key={i} style={p} />)}

      {/* ── NAV ── */}
      <nav className={`sticky top-0 z-50 border-b transition-all duration-300 ${navScrolled ? "border-[#1e2330] bg-[#07080b]/95 backdrop-blur-lg shadow-[0_4px_30px_rgba(0,0,0,0.5)]" : "border-[#141822] bg-[#07080b]/80 backdrop-blur-md"}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:py-4 sm:px-6 lg:px-8">
          <div className="text-base sm:text-xl font-black font-['Orbitron'] tracking-wider bg-gradient-to-r from-[#ff6b00] to-[#ff9a00] bg-clip-text text-transparent flex items-center gap-2 flicker">
            <span className="inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#ff6b00] animate-ping rounded-full shrink-0" />
            FF-ESP-ZONE
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeToggleButton variant="circle-blur" />
            {context?.user ? (
              <div className="flex items-center gap-2 sm:gap-3 bg-[#0a0c10] border border-[#1e2330] p-1.5 sm:pr-4 rounded">
                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded bg-gradient-to-br from-[#ff6b00] to-[#ff9a00] text-white flex items-center justify-center font-['Orbitron'] text-xs sm:text-sm font-black shadow-[0_0_10px_rgba(255,107,0,0.2)]">
                  {context.user.username.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:flex flex-col leading-tight min-w-0">
                  <span className="text-xs font-bold text-white truncate max-w-[120px]">{context.user.username}</span>
                  <span className="text-[10px] text-[#4e5d78] font-['Orbitron'] font-bold tracking-wider mt-0.5">UID: {context.user.ffUid}</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Link href="/login" className="px-3 sm:px-4 py-1.5 bg-transparent border border-[#2a2e3a] text-[#8090a0] hover:text-white hover:bg-[#141822] hover:border-[#4e5d78] font-bold text-[10px] sm:text-xs uppercase tracking-wider rounded transition-all duration-150">
                  Login
                </Link>
                <Link href="/signup" className="px-3 sm:px-4 py-1.5 bg-gradient-to-r from-[#ff6b00] to-[#ff9a00] hover:from-[#ff7c1a] hover:to-[#ffa61a] text-white font-bold text-[10px] sm:text-xs uppercase tracking-wider rounded shadow-[0_2px_8px_rgba(255,107,0,0.2)] transition-all duration-150 btn-glow">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section ref={heroRef} className="relative flex min-h-[92vh] sm:min-h-[90vh] items-center justify-center overflow-hidden px-4 py-16">
        <div className="scan-line" />
        <Scanlines />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,107,0,0.08),transparent_50%)] pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-32 sm:h-40 bg-gradient-to-t from-[#07080b] to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#141822_1px,transparent_1px),linear-gradient(to_bottom,#141822_1px,transparent_1px)] bg-[size:3rem_3rem] sm:bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#ffaa00]/40 to-transparent" />

        {/* Corner crosshair decorations — hidden on very small screens */}
        {[
          "top-6 left-6 sm:top-10 sm:left-10",
          "top-6 right-6 sm:top-10 sm:right-10",
          "bottom-6 left-6 sm:bottom-10 sm:left-10",
          "bottom-6 right-6 sm:bottom-10 sm:right-10",
        ].map((cls, i) => (
          <div key={i} className={`absolute ${cls} opacity-20 hidden sm:block`}>
            <Crosshair className="w-5 h-5 text-[#ff6b00]" />
          </div>
        ))}

        <div className="relative z-10 mx-auto max-w-4xl text-center w-full">
          <div className={`${heroInView ? "hero-in" : "opacity-0"}`}>
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-[#ff6b00]/10 border border-[#ff6b00]/25 text-[#ff6b00] font-['Orbitron'] text-[10px] sm:text-xs font-bold tracking-widest uppercase rounded-sm mb-5 sm:mb-6">
              <Zap className="w-3 h-3" />
              NEXT-GEN ESPORTS INFRASTRUCTURE
            </span>
          </div>

          <h1 className={`mb-5 sm:mb-6 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black font-['Orbitron'] tracking-tight text-white uppercase leading-[1.05] ${heroInView ? "hero-in-2" : "opacity-0"}`}>
            Dominate the{" "}
            <span
              className="bg-gradient-to-r from-[#ff6b00] via-[#ff9a00] to-[#ffaa00] bg-clip-text text-transparent glitch-text"
              data-text="Free Fire"
            >
              Free Fire
            </span>{" "}
            <br className="hidden sm:block" />
            Esports Arena
          </h1>

          <p className={`mb-8 sm:mb-10 mx-auto max-w-2xl text-sm sm:text-base text-[#8090a0] font-medium tracking-wide leading-relaxed px-2 ${heroInView ? "hero-in-3" : "opacity-0"}`}>
            Deploy open custom brackets, lock down top-tier tournament prize modules, and source competitive roster units based on historical data analytics.
          </p>

          <div className={`flex flex-col justify-center gap-3 sm:flex-row ${heroInView ? "hero-in-4" : "opacity-0"}`}>
            {context?.user ? (
              <Link href="/dashboard" className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-gradient-to-r from-[#ff6b00] to-[#ff9a00] hover:from-[#ff7c1a] hover:to-[#ffa61a] text-white font-['Orbitron'] font-bold text-xs sm:text-sm uppercase tracking-widest rounded shadow-[0_4px_15px_rgba(255,107,0,0.25)] transition-all duration-200 text-center btn-glow flex items-center justify-center gap-2">
                Enter Command Dashboard <ChevronRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link href="/signup" className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-gradient-to-r from-[#ff6b00] to-[#ff9a00] hover:from-[#ff7c1a] hover:to-[#ffa61a] text-white font-['Orbitron'] font-bold text-xs sm:text-sm uppercase tracking-widest rounded shadow-[0_4px_15px_rgba(255,107,0,0.25)] transition-all duration-200 text-center btn-glow flex items-center justify-center gap-2">
                  Initialize Profile <ChevronRight className="w-4 h-4" />
                </Link>
                <Link href="/login" className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-transparent border border-[#2a2e3a] text-[#8090a0] hover:text-white hover:bg-[#141822] hover:border-[#4e5d78] font-['Orbitron'] font-bold text-xs sm:text-sm uppercase tracking-widest rounded transition-all duration-200 text-center">
                  Access Grid
                </Link>
              </>
            )}
          </div>

          {/* Live indicators */}
          <div className={`mt-10 sm:mt-14 flex flex-wrap items-center justify-center gap-4 sm:gap-8 ${heroInView ? "hero-in-4" : "opacity-0"}`}>
            {[
              { icon: <Radio className="w-3 h-3" />, text: "247 LIVE NOW", color: "text-[#ff6b00]", dot: "bg-[#ff6b00]" },
              { icon: <Target className="w-3 h-3" />, text: "10K+ PLAYERS", color: "text-[#ffaa00]", dot: "bg-[#ffaa00]" },
              { icon: <Flame className="w-3 h-3" />, text: "₹1M+ DISTRIBUTED", color: "text-[#4ade80]", dot: "bg-[#4ade80]" },
            ].map((item, i) => (
              <div key={i} className={`flex items-center gap-1.5 text-[10px] sm:text-[11px] font-['Orbitron'] font-bold ${item.color} opacity-80`}>
                <span className={`w-1.5 h-1.5 rounded-full ${item.dot} animate-pulse`} />
                {item.icon}
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MARQUEE TICKER ── */}
      <div className="border-y border-[#141822] bg-[#0a0c10] py-2.5 overflow-hidden">
        <div className="marquee-inner flex gap-0 whitespace-nowrap" style={{ width: "200%" }}>
          {[...Array(2)].map((_, ri) => (
            <div key={ri} className="flex gap-6 sm:gap-10 px-3 sm:px-5" style={{ width: "50%" }}>
              {["SQUAD TOURNAMENTS LIVE", "PRIZE POOLS UP TO ₹50K", "ANTI-CHEAT VERIFIED", "SOLO • DUO • SQUAD", "CLASH SQUAD 4v4", "REGISTER NOW", "BGMI ARENA LIVE"].map((t, i) => (
                <span key={i} className="inline-flex items-center gap-2 text-[10px] sm:text-xs font-['Orbitron'] font-bold uppercase tracking-widest text-[#4e5d78]">
                  <span className="text-[#ff6b00]">◆</span> {t}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── LIVE TOURNAMENT TABLE ── */}
      <section className="px-4 py-12 sm:py-16 mx-auto max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 border-b border-[#141822] pb-4 gap-3">
          <div className="flex items-center gap-2">
            <Radio className="text-[#ff6b00] h-4 w-4 animate-pulse shrink-0" />
            <h2 className="text-base sm:text-xl font-bold font-['Orbitron'] tracking-wider text-white uppercase">Live Tournament Matrix</h2>
          </div>
          <span className="text-[10px] font-['Orbitron'] text-[#4e5d78] tracking-widest uppercase">Status: Synchronized // Live</span>
        </div>

        <div className="overflow-x-auto rounded border border-[#1e2330] bg-[#0a0c10] border-pulse">
          <table className="w-full text-left border-collapse min-w-[480px]">
            <thead>
              <tr className="border-b border-[#141822] bg-[#07080b] text-[10px] sm:text-[11px] font-['Orbitron'] font-bold tracking-wider text-[#4e5d78] uppercase">
                <th className="p-3 sm:p-4">Tournament</th>
                <th className="p-3 sm:p-4 hidden sm:table-cell">Format</th>
                <th className="p-3 sm:p-4">Prize</th>
                <th className="p-3 sm:p-4 hidden xs:table-cell">Slots</th>
                <th className="p-3 sm:p-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="text-xs font-semibold">
              {[
                { title: "Titan Championship Cup", format: "Squad BR", prize: "₹50,000", slots: "42/48", status: "Registration Open", live: true },
                { title: "Clash Squad Core Shock",  format: "4v4 CS",   prize: "₹15,000", slots: "16/16", status: "In Progress",       live: false },
                { title: "Alpha Skirmish Arena",    format: "Solo BR",  prize: "₹5,000",  slots: "89/100",status: "Registration Open", live: true },
              ].map((item, idx) => (
                <tr key={idx} className="border-b border-[#141822]/60 hover:bg-[#141822]/30 transition-colors duration-150 group">
                  <td className="p-3 sm:p-4">
                    <span className="font-bold text-white uppercase tracking-wide text-[11px] sm:text-xs">{item.title}</span>
                  </td>
                  <td className="p-3 sm:p-4 text-[#8090a0] font-['Orbitron'] text-[10px] hidden sm:table-cell">{item.format}</td>
                  <td className="p-3 sm:p-4 text-[#ffaa00] font-['Orbitron'] font-bold text-[11px] sm:text-xs">{item.prize}</td>
                  <td className="p-3 sm:p-4 text-[#8090a0] text-[11px] hidden xs:table-cell">{item.slots}</td>
                  <td className="p-3 sm:p-4 text-right">
                    <span className={`inline-block px-1.5 sm:px-2 py-0.5 border text-[9px] sm:text-[10px] font-['Orbitron'] font-bold uppercase rounded-sm ${item.live ? "bg-[#ff6b00]/10 border-[#ff6b00]/30 text-[#ff6b00]" : "bg-[#ffaa00]/10 border-[#ffaa00]/30 text-[#ffaa00]"}`}>
                      {item.live && <span className="inline-block w-1 h-1 bg-[#ff6b00] rounded-full mr-1 animate-pulse" />}
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section ref={featRef} className="bg-[#0a0c10] border-y border-[#141822] px-4 py-14 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-10 sm:mb-16">
            <div className="text-[10px] font-['Orbitron'] font-bold tracking-widest text-[#4e5d78] uppercase mb-3">SYSTEM MODULES</div>
            <h2 className="text-2xl sm:text-3xl font-bold font-['Orbitron'] tracking-wider text-white uppercase">Operational Protocols</h2>
            <div className="h-0.5 w-10 sm:w-12 bg-[#ff6b00] mx-auto mt-3" />
          </div>

          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Free Tournaments", description: "Deploy and compete within regional battle grounds with completely neutralized entry-ticket constraints.", icon: <Users className="h-5 w-5 text-[#ff6b00]" />, delay: 0 },
              { title: "Paid Tournaments", description: "High-stakes high-yield parameters structured for verified profiles seeking locked prize allocations.", icon: <Trophy className="h-5 w-5 text-[#ffaa00]" />, delay: 100 },
              { title: "Team Recruitment", description: "Incorporate targeted search functions to filter prospective squads by position and tactical KDA indices.", icon: <Zap className="h-5 w-5 text-[#ff6b00]" />, delay: 200 },
              { title: "Anti-Cheat Guard", description: "Real-time verification handshakes paired with dynamic coordinate telemetry tracking infrastructure.", icon: <ShieldCheck className="h-5 w-5 text-emerald-500" />, delay: 300 },
            ].map((feature, i) => (
              <div
                key={feature.title}
                className={`feat-card card-hover rounded-lg border border-[#1e2330] bg-[#07080b] p-5 sm:p-6 hover:border-[#ff6b00]/30 group shadow-[0_4px_12px_rgba(0,0,0,0.2)] ${featInView ? "visible" : ""}`}
                style={{ transitionDelay: `${feature.delay}ms` }}
              >
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="text-[9px] sm:text-[10px] font-['Orbitron'] font-bold tracking-widest text-[#4e5d78] uppercase">PROTOCOL // MODULE</div>
                  <div className="p-1.5 bg-[#141822] rounded border border-[#1e2330] group-hover:border-[#ff6b00]/20 transition-colors">{feature.icon}</div>
                </div>
                <h3 className="mb-2 sm:mb-3 text-base sm:text-lg font-['Orbitron'] font-bold text-white group-hover:text-[#ff9a00] transition-colors uppercase">{feature.title}</h3>
                <p className="text-xs text-[#8090a0] leading-relaxed font-semibold">{feature.description}</p>
                <div className="mt-3 sm:mt-4 flex items-center gap-1 text-[10px] font-['Orbitron'] font-bold text-[#ff6b00] opacity-0 group-hover:opacity-100 transition-opacity">
                  LEARN MORE <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FORMATS + PRIZE SPLIT ── */}
      <section className="px-4 py-14 sm:py-20 bg-[#07080b]">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-4 sm:gap-8 grid-cols-1 md:grid-cols-3">
            {/* Formats */}
            <div className="md:col-span-2 rounded-lg border bg-[#0a0c10] border-[#1e2330] p-5 sm:p-6 flex flex-col justify-between card-hover">
              <div>
                <div className="text-[10px] font-['Orbitron'] font-bold tracking-widest text-[#4e5d78] uppercase mb-2">CONFIGURATION SYSTEM</div>
                <h3 className="mb-3 sm:mb-4 text-lg sm:text-xl font-['Orbitron'] font-bold text-white tracking-wide uppercase">Supported Combat Configurations</h3>
                <p className="text-xs text-[#8090a0] mb-5 sm:mb-6 font-semibold">Deploy matches across multiple standard configurations natively linked to automatic custom room handlers.</p>
              </div>
              <div className="space-y-4">
                {[
                  { label: "BATTLE ROYALE (BR)", modes: ["Solo Matrix", "Duo Sync", "Squad Deployment"], color: "bg-[#ff6b00]/5 border-[#ff6b00]/20 text-[#ff6b00]" },
                  { label: "CLASH SQUAD (CS)",   modes: ["1v1 Terminal","2v2 Skirmish","4v4 Core Shock"],  color: "bg-[#ffaa00]/5 border-[#ffaa00]/20 text-[#ffaa00]" },
                ].map((group) => (
                  <div key={group.label}>
                    <div className="text-[10px] sm:text-[11px] font-['Orbitron'] font-bold text-white mb-2 tracking-wider">{group.label}</div>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {group.modes.map((mode) => (
                        <span key={mode} className={`rounded-sm px-2 sm:px-2.5 py-1 text-[10px] sm:text-xs font-['Orbitron'] font-bold border uppercase tracking-wider ${group.color}`}>{mode}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Prize */}
            <div className="rounded-lg border bg-[#0a0c10] border-[#1e2330] p-5 sm:p-6 flex flex-col justify-between card-hover">
              <div>
                <div className="text-[10px] font-['Orbitron'] font-bold tracking-widest text-[#4e5d78] uppercase mb-2">ALLOCATION ALGORITHM</div>
                <h3 className="mb-3 sm:mb-4 text-lg sm:text-xl font-['Orbitron'] font-bold text-white tracking-wide uppercase">Prize Pools</h3>
                <p className="text-xs text-[#8090a0] mb-4 font-semibold">Decentralized liquidity scaling criteria for standard battle units:</p>
              </div>
              <div className="space-y-3 border-t border-[#141822]/60 pt-4 text-xs font-semibold uppercase tracking-wider">
                {[
                  { rank: "Champion Bracket", share: "50% Share", color: "text-[#ff9a00]", bar: "w-full", barColor: "bg-[#ff9a00]" },
                  { rank: "Runner-Up Unit",   share: "30% Share", color: "text-white",     bar: "w-3/5",  barColor: "bg-[#ff6b00]" },
                  { rank: "Third Place",      share: "20% Share", color: "text-[#8090a0]", bar: "w-2/5",  barColor: "bg-[#4e5d78]" },
                ].map((item) => (
                  <div key={item.rank}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[#8090a0]">{item.rank}</span>
                      <span className={`font-['Orbitron'] font-bold ${item.color}`}>{item.share}</span>
                    </div>
                    <div className="h-0.5 bg-[#141822] rounded-full overflow-hidden">
                      <div className={`h-full ${item.bar} ${item.barColor} rounded-full opacity-60`} />
                    </div>
                  </div>
                ))}
                <div className="pt-2 border-t border-[#141822]/40 flex justify-between items-center text-[10px] text-[#4e5d78]">
                  <span>KDA Multiplier</span>
                  <span>Active Token</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-[#0a0c10] border-y border-[#141822] px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-3 sm:gap-8 grid-cols-3">
            <StatCounter value={10000} suffix="+" label="Verified Active Players" delay={0} />
            <StatCounter value={500}   suffix="+" label="Monthly Brackets Deployed" delay={150} />
            <StatCounter value={1}     suffix="M+" label="Prize Pool Distributed ₹" delay={300} />
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-4 py-16 sm:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,107,0,0.05),transparent_60%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#141822_1px,transparent_1px),linear-gradient(to_bottom,#141822_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_60%,transparent_100%)] opacity-20" />

        <div className="mx-auto max-w-2xl text-center relative z-10 px-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#ff6b00]/10 border border-[#ff6b00]/20 text-[#ff6b00] font-['Orbitron'] text-[10px] font-bold tracking-widest uppercase rounded-sm mb-5 sm:mb-6">
            <Flame className="w-3 h-3" /> INITIALIZE SEQUENCE
          </div>
          <h2 className="mb-4 text-2xl sm:text-3xl font-bold font-['Orbitron'] text-white uppercase tracking-wider leading-tight">
            Ready to Initialize<br className="hidden sm:block" /> Registration?
          </h2>
          <p className="mb-7 sm:mb-8 text-xs sm:text-sm text-[#8090a0] font-semibold max-w-md mx-auto leading-relaxed uppercase tracking-wide">
            Integrate your terminal credentials with thousands of regional teams active over live network interfaces.
          </p>

          <div className="flex flex-col justify-center gap-3 sm:flex-row max-w-xs sm:max-w-sm mx-auto">
            <Link href="/signup" className="flex-1 py-2.5 sm:py-3 bg-gradient-to-r from-[#ff6b00] to-[#ff9a00] hover:from-[#ff7c1a] hover:to-[#ffa61a] text-white font-['Orbitron'] font-bold text-xs uppercase tracking-widest rounded transition-all duration-150 shadow-[0_4px_12px_rgba(255,107,0,0.2)] text-center btn-glow flex items-center justify-center gap-1.5">
              Sign Up Now <ChevronRight className="w-3.5 h-3.5" />
            </Link>
            <button type="button" className="flex-1 py-2.5 sm:py-3 bg-transparent border border-[#2a2e3a] text-[#8090a0] hover:text-white hover:bg-[#141822] hover:border-[#4e5d78] font-['Orbitron'] font-bold text-xs uppercase tracking-widest rounded transition-all duration-150 text-center cursor-pointer">
              System Summary
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-[#141822] bg-[#030406] px-4 py-10 sm:py-12 text-[#8090a0]">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 sm:mb-10 grid gap-6 sm:gap-8 grid-cols-2 md:grid-cols-4">
            <div className="col-span-2 md:col-span-1">
              <div className="mb-2 sm:mb-3 font-['Orbitron'] font-black text-white tracking-wider text-sm">FF-ESP-ZONE</div>
              <p className="text-xs text-[#4e5d78] font-semibold uppercase leading-relaxed tracking-wide">
                The absolute standard for decentralized custom Free Fire competition modules.
              </p>
            </div>
            {[
              { title: "Product Core", links: ["Tournaments", "Recruitment", "Chat Grid"] },
              { title: "Network",      links: ["About Hub", "System Blog", "Contact Vector"] },
              { title: "Regulatory",   links: ["Privacy Clause", "Terms Instance", "System Rules"] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="mb-3 sm:mb-4 text-[10px] sm:text-xs font-bold text-white uppercase tracking-widest">{col.title}</h4>
                <ul className="space-y-1.5 sm:space-y-2 text-[10px] sm:text-xs font-semibold uppercase tracking-wider">
                  {col.links.map((link) => (
                    <li key={link}><a href="#" className="text-[#4e5d78] hover:text-[#ff9a00] transition-colors">{link}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-[#141822]/60 pt-5 sm:pt-6 text-center text-[10px] font-bold uppercase tracking-widest text-[#4e5d78]">
            © 2026 FF-ESP-ZONE. Free Fire is a trademark of Garena. All internal interfaces compiled over decentralized server grids.
          </div>
        </div>
      </footer>
    </div>
  );
}