"use client";

import Link from "next/link";
import ThemeToggleButton from "../ui/theme-toggle-button";
import { useContext } from "react";
import MyContext from "@/context/ThemeProvider";
import { Shield, ShieldCheck, Trophy, Users, Zap, Radio } from "lucide-react";

export function LandingPage() {
  const context = useContext(MyContext);

  return (
    <div className="min-h-screen bg-[#07080b] text-[#d0d5df] font-['Rajdhani'] selection:bg-[#ff6b00]/30 selection:text-white relative">
      {/* Tactical Ambient Glow Elements */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#ff6b00]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[120vh] right-1/4 w-[600px] h-[600px] bg-[#ffaa00]/3 rounded-full blur-[150px] pointer-events-none" />

      {/* Tactical Navigation Bar */}
      <nav className="sticky top-0 z-50 border-b border-[#141822] bg-[#07080b]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="text-xl font-black font-['Orbitron'] tracking-wider bg-gradient-to-r from-[#ff6b00] to-[#ff9a00] bg-clip-text text-transparent flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-[#ff6b00] animate-ping rounded-full shrink-0" />
            FF-ESP-ZONE
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggleButton variant="circle-blur" />

            {context?.user ? (
              <div className="flex items-center gap-3 bg-[#0a0c10] border border-[#1e2330] p-1.5 pr-4 rounded">
                <div className="h-8 w-8 rounded bg-gradient-to-br from-[#ff6b00] to-[#ff9a00] text-white flex items-center justify-center font-['Orbitron'] text-sm font-black shadow-[0_0_10px_rgba(255,107,0,0.2)]">
                  {context?.user.username.charAt(0).toUpperCase()}
                </div>

                <div className="flex flex-col leading-tight min-w-0">
                  <span className="text-xs font-bold text-white truncate max-w-[120px]">
                    {context?.user.username}
                  </span>
                  <span className="text-[10px] text-[#4e5d78] font-['Orbitron'] font-bold tracking-wider mt-0.5">
                    UID: {context?.user.ffUid}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-1.5 bg-transparent border border-[#2a2e3a] text-[#8090a0] hover:text-white hover:bg-[#141822] hover:border-[#4e5d78] font-bold text-xs uppercase tracking-wider rounded transition-all duration-150 cursor-pointer"
                >
                  Login
                </Link>

                <Link
                  href="/signup"
                  className="px-4 py-1.5 bg-gradient-to-r from-[#ff6b00] to-[#ff9a00] hover:from-[#ff7c1a] hover:to-[#ffa61a] text-white font-bold text-xs uppercase tracking-wider rounded shadow-[0_2px_8px_rgba(255,107,0,0.15)] transition-all duration-150 cursor-pointer"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Core Sector */}
      <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden px-4 py-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,107,0,0.07),transparent_50%)] pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#07080b] to-transparent pointer-events-none" />

        {/* Background Grid & Tactical Detail Overlays */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#141822_1px,transparent_1px),linear-gradient(to_bottom,#141822_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40" />
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#ffaa00]/30 to-transparent" />

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <span className="inline-block px-3 py-1 bg-[#ff6b00]/10 border border-[#ff6b00]/20 text-[#ff6b00] font-['Orbitron'] text-xs font-bold tracking-widest uppercase rounded-sm mb-6 animate-pulse">
            ⚡ NEXT-GEN ESPORTS INFRASTRUCTURE
          </span>

          <h1 className="mb-6 text-balance text-5xl font-black font-['Orbitron'] tracking-tight text-white sm:text-7xl uppercase leading-[1.05]">
            Dominate the{" "}
            <span className="bg-gradient-to-r from-[#ff6b00] via-[#ff9a00] to-[#ffaa00] bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(255,107,0,0.1)]">
              Free Fire
            </span>{" "}
            Esports Arena
          </h1>

          <p className="mb-10 mx-auto max-w-2xl text-balance text-base text-[#8090a0] sm:text-lg font-medium tracking-wide">
            Deploy open custom brackets, lock down top-tier tournament prize
            modules, and source competitive roster units based on historical
            data analytics.
          </p>

          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            {context?.user ? (
              <Link
                href="/dashboard"
                className="px-8 py-3 bg-gradient-to-r from-[#ff6b00] to-[#ff9a00] hover:from-[#ff7c1a] hover:to-[#ffa61a] text-white font-['Orbitron'] font-bold text-sm uppercase tracking-widest rounded shadow-[0_4px_15px_rgba(255,107,0,0.2)] transition-all duration-200 active:scale-98 text-center"
              >
                Enter Command Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="px-8 py-3 bg-gradient-to-r from-[#ff6b00] to-[#ff9a00] hover:from-[#ff7c1a] hover:to-[#ffa61a] text-white font-['Orbitron'] font-bold text-sm uppercase tracking-widest rounded shadow-[0_4px_15px_rgba(255,107,0,0.2)] transition-all duration-200 active:scale-98 text-center"
                >
                  Initialize Profile
                </Link>

                <Link
                  href="/login"
                  className="px-8 py-3 bg-transparent border border-[#2a2e3a] text-[#8090a0] hover:text-white hover:bg-[#141822] hover:border-[#4e5d78] font-['Orbitron'] font-bold text-sm uppercase tracking-widest rounded transition-all duration-200 active:scale-98 text-center"
                >
                  Access Grid
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Live Active Tournaments Grid Feed */}
      <section className="px-4 py-16 mx-auto max-w-6xl">
        <div className="flex items-center justify-between mb-8 border-b border-[#141822] pb-4">
          <div className="flex items-center gap-2">
            <Radio className="text-[#ff6b00] h-4 w-4 animate-pulse" />
            <h2 className="text-xl font-bold font-['Orbitron'] tracking-wider text-white uppercase">
              Live Tournament Matrix Feed
            </h2>
          </div>
          <span className="text-[10px] font-['Orbitron'] text-[#4e5d78] tracking-widest uppercase hidden sm:inline">
            Status: Synchronized // Live
          </span>
        </div>

        <div className="overflow-x-auto rounded border border-[#1e2330] bg-[#0a0c10]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#141822] bg-[#07080b] text-[11px] font-['Orbitron'] font-bold tracking-wider text-[#4e5d78] uppercase">
                <th className="p-4">Tournament Title</th>
                <th className="p-4">Format</th>
                <th className="p-4">Prize Pool</th>
                <th className="p-4">Slots Filled</th>
                <th className="p-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="text-xs font-semibold">
              {[
                {
                  title: "Titan Championship Cup",
                  format: "Squad BR",
                  prize: "₹50,000",
                  slots: "42/48",
                  status: "Registration Open",
                  live: true,
                },
                {
                  title: "Clash Squad Core Shock",
                  format: "4v4 CS",
                  prize: "₹15,000",
                  slots: "16/16",
                  status: "In Progress",
                  live: false,
                },
                {
                  title: "Alpha Skirmish Arena",
                  format: "Solo BR",
                  prize: "₹5,000",
                  slots: "89/100",
                  status: "Registration Open",
                  live: true,
                },
              ].map((item, idx) => (
                <tr
                  key={idx}
                  className="border-b border-[#141822]/60 hover:bg-[#141822]/20 transition-colors"
                >
                  <td className="p-4 font-bold text-white uppercase tracking-wide">
                    {item.title}
                  </td>
                  <td className="p-4 text-[#8090a0] font-['Orbitron'] text-[11px]">
                    {item.format}
                  </td>
                  <td className="p-4 text-[#ffaa00] font-['Orbitron'] font-bold">
                    {item.prize}
                  </td>
                  <td className="p-4 text-[#8090a0]">{item.slots}</td>
                  <td className="p-4 text-right">
                    <span
                      className={`inline-block px-2 py-0.5 border text-[10px] font-['Orbitron'] font-bold uppercase rounded-sm ${
                        item.live
                          ? "bg-[#ff6b00]/10 border-[#ff6b00]/30 text-[#ff6b00]"
                          : "bg-[#ffaa00]/10 border-[#ffaa00]/30 text-[#ffaa00]"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Interactive Bracket visual showcase placeholder header */}
      <section className="px-4 py-12 mx-auto max-w-6xl text-center">
        <h2 className="text-2xl font-bold font-['Orbitron'] tracking-wider text-white uppercase mb-2">
          Dynamic Arena Visualization
        </h2>
        <p className="text-xs text-[#8090a0] uppercase tracking-widest mb-6">
          Adjust sandbox parameters to simulate competitive team progression
          pathways
        </p>
      </section>

      {/* Features System Deck */}
      <section className="bg-[#0a0c10] border-y border-[#141822] px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold font-['Orbitron'] tracking-wider text-white uppercase">
              Operational Protocols
            </h2>
            <div className="h-0.5 w-12 bg-[#ff6b00] mx-auto mt-3" />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Free Tournaments",
                description:
                  "Deploy and compete within regional battle grounds with completely neutralized entry-ticket constraints.",
                icon: <Users className="h-5 w-5 text-[#ff6b00]" />,
              },
              {
                title: "Paid Tournaments",
                description:
                  "High-stakes high-yield parameters structured for verified profiles seeking locked prize allocations.",
                icon: <Trophy className="h-5 w-5 text-[#ffaa00]" />,
              },
              {
                title: "Team Recruitment",
                description:
                  "Incorporate targeted search functions to filter prospective squads by position and tactical KDA indices.",
                icon: <Zap className="h-5 w-5 text-[#ff6b00]" />,
              },
              {
                title: "Anti-Cheat Guard",
                description:
                  "Real-time verification handshakes paired with dynamic coordinate telemetry tracking infrastructure.",
                icon: <ShieldCheck className="h-5 w-5 text-emerald-500" />,
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-lg border border-[#1e2330] bg-[#07080b] p-6 hover:border-[#ff6b00]/30 transition-all duration-200 group shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="text-[10px] font-['Orbitron'] font-bold tracking-widest text-[#4e5d78] uppercase">
                    PROTOCOL // MODULE
                  </div>
                  {feature.icon}
                </div>
                <h3 className="mb-3 text-lg font-['Orbitron'] font-bold text-white group-hover:text-[#ff9a00] transition-colors uppercase">
                  {feature.title}
                </h3>
                <p className="text-xs text-[#8090a0] leading-relaxed font-semibold">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tournament Division Matrices & Prize Pool Split */}
      <section className="px-4 py-20 bg-[#07080b]">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-3">
            {/* Formats Card */}
            <div className="md:col-span-2 rounded-lg border bg-[#0a0c10] border-[#1e2330] p-6 flex flex-col justify-between shadow-inner">
              <div>
                <div className="text-[10px] font-['Orbitron'] font-bold tracking-widest text-[#4e5d78] uppercase mb-2">
                  CONFIGURATION SYSTEM
                </div>
                <h3 className="mb-4 text-xl font-['Orbitron'] font-bold text-white tracking-wide uppercase">
                  Supported Combat Configurations
                </h3>
                <p className="text-xs text-[#8090a0] mb-6 font-semibold">
                  Deploy matches across multiple standard configurations
                  natively linked to automatic custom room handlers.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-[11px] font-['Orbitron'] font-bold text-white mb-2 tracking-wider">
                    BATTLE ROYALE (BR)
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {["Solo Matrix", "Duo Sync", "Squad Deployment"].map(
                      (mode) => (
                        <span
                          key={mode}
                          className="rounded-sm px-2.5 py-1 text-xs font-['Orbitron'] font-bold border uppercase tracking-wider bg-[#ff6b00]/5 border-[#ff6b00]/20 text-[#ff6b00]"
                        >
                          {mode}
                        </span>
                      ),
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-['Orbitron'] font-bold text-white mb-2 tracking-wider">
                    CLASH SQUAD (CS)
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {["1v1 Terminal", "2v2 Skirmish", "4v4 Core Shock"].map(
                      (mode) => (
                        <span
                          key={mode}
                          className="rounded-sm px-2.5 py-1 text-xs font-['Orbitron'] font-bold border uppercase tracking-wider bg-[#ffaa00]/5 border-[#ffaa00]/20 text-[#ffaa00]"
                        >
                          {mode}
                        </span>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Prize Multipliers Profile */}
            <div className="rounded-lg border bg-[#0a0c10] border-[#1e2330] p-6 flex flex-col justify-between shadow-inner">
              <div>
                <div className="text-[10px] font-['Orbitron'] font-bold tracking-widest text-[#4e5d78] uppercase mb-2">
                  ALLOCATION ALGORITHM
                </div>
                <h3 className="mb-4 text-xl font-['Orbitron'] font-bold text-white tracking-wide uppercase">
                  Prize Pools
                </h3>
                <p className="text-xs text-[#8090a0] mb-4 font-semibold">
                  Decentralized liquidity scaling criteria for standard battle
                  units:
                </p>
              </div>

              <div className="space-y-3 border-t border-[#141822]/60 pt-4 text-xs font-semibold uppercase tracking-wider">
                <div className="flex justify-between items-center">
                  <span className="text-white">Champion Bracket</span>
                  <span className="text-[#ff9a00] font-['Orbitron'] font-bold">
                    50% Share
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#8090a0]">Runner-Up Unit</span>
                  <span className="text-white font-['Orbitron']">
                    30% Share
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#8090a0]">Third Place Squad</span>
                  <span className="text-white font-['Orbitron']">
                    20% Share
                  </span>
                </div>
                <div className="pt-2 border-t border-[#141822]/40 flex justify-between items-center text-[10px] text-[#4e5d78]">
                  <span>KDA Multiplier Add-on</span>
                  <span>Active Token Allocation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grid Network Statistics Metrics */}
      <section className="bg-[#0a0c10] border-y border-[#141822] px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 text-center md:grid-cols-3">
            {[
              { stat: "10K+", label: "Verified Active Players" },
              { stat: "500+", label: "Monthly Brackets Deployed" },
              { stat: "₹1M+", label: "Distributed Prize Pools" },
            ].map((item) => (
              <div
                key={item.label}
                className="p-4 border border-[#141822] bg-[#07080b]/50 rounded"
              >
                <div className="mb-1 text-3xl font-black font-['Orbitron'] text-[#ff9a00] tracking-wider">
                  {item.stat}
                </div>
                <div className="text-xs font-bold text-[#4e5d78] uppercase tracking-widest">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Terminal Call to Action */}
      <section className="px-4 py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,107,0,0.03),transparent_60%)] pointer-events-none" />
        <div className="mx-auto max-w-2xl text-center relative z-10">
          <h2 className="mb-4 text-3xl font-bold font-['Orbitron'] text-white uppercase tracking-wider">
            Ready to Initialize Registration?
          </h2>
          <p className="mb-8 text-sm text-[#8090a0] font-semibold max-w-md mx-auto leading-relaxed uppercase tracking-wide">
            Integrate your terminal credentials with thousands of regional teams
            active over live network interfaces.
          </p>

          <div className="flex flex-col justify-center gap-3 sm:flex-row max-w-sm mx-auto">
            <Link
              href="/signup"
              className="flex-1 py-2.5 bg-gradient-to-r from-[#ff6b00] to-[#ff9a00] hover:from-[#ff7c1a] hover:to-[#ffa61a] text-white font-['Orbitron'] font-bold text-xs uppercase tracking-widest rounded transition-all duration-150 shadow-[0_4px_12px_rgba(255,107,0,0.15)] text-center"
            >
              Sign Up Now
            </Link>

            <button
              type="button"
              className="flex-1 py-2.5 bg-transparent border border-[#2a2e3a] text-[#8090a0] hover:text-white hover:bg-[#141822] hover:border-[#4e5d78] font-['Orbitron'] font-bold text-xs uppercase tracking-widest rounded transition-all duration-150 text-center cursor-pointer"
            >
              System Data Summary
            </button>
          </div>
        </div>
      </section>

      {/* Global Grid Footer */}
      <footer className="border-t border-[#141822] bg-[#030406] px-4 py-12 text-[#8090a0]">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 grid gap-8 grid-cols-2 md:grid-cols-4">
            <div className="col-span-2 md:col-span-1">
              <div className="mb-3 font-['Orbitron'] font-black text-white tracking-wider text-sm">
                FF-ESP-ZONE
              </div>
              <p className="text-xs text-[#4e5d78] font-semibold uppercase leading-relaxed tracking-wide">
                The absolute standard for decentralized custom Free Fire
                competition modules.
              </p>
            </div>

            {[
              {
                title: "Product Core",
                links: ["Tournaments", "Recruitment", "Chat Grid"],
              },
              {
                title: "Network",
                links: ["About Hub", "System Blog", "Contact Vector"],
              },
              {
                title: "Regulatory",
                links: ["Privacy Clause", "Terms Instance", "System Rules"],
              },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="mb-4 text-xs font-bold text-white uppercase tracking-widest">
                  {col.title}
                </h4>
                <ul className="space-y-2 text-xs font-semibold uppercase tracking-wider">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-[#4e5d78] hover:text-[#ff9a00] transition-colors"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-[#141822]/60 pt-6 text-center text-[10px] font-bold uppercase tracking-widest text-[#4e5d78]">
            © 2026 FF-ESP-ZONE. Free Fire is a trademark of Garena. All internal
            interfaces compiled over decentralized server grids.
          </div>
        </div>
      </footer>
    </div>
  );
}
