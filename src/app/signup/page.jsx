import { SignupForm } from "@/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#05070a] px-4 py-20 relative overflow-hidden font-['Rajdhani']">
      
      {/* Background Grid & Tactical Detail Overlays */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#141822_1px,transparent_1px),linear-gradient(to_bottom,#141822_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40" />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#ff9a00]/30 to-transparent" />
      
      <div className="w-full max-w-md relative z-10">
        {/* Tactical Header */}
        <div className="mb-8 text-center space-y-1">
          <div className="text-[10px] font-['Orbitron'] font-bold tracking-[0.3em] text-[#ffaa00] bg-[#ff9a00]/5 border border-[#ff9a00]/10 px-2 py-0.5 rounded inline-block mb-3 uppercase">
            System Initialization // Security Uplink
          </div>
          <h1 className="text-3xl font-black font-['Orbitron'] tracking-wider text-white uppercase drop-shadow-[0_2px_10px_rgba(255,255,255,0.05)]">
            Join FF-ESP-ZONE
          </h1>
          <p className="text-xs font-bold uppercase tracking-widest text-[#4e5d78]">
            Authorize core identity node to enter combat database
          </p>
        </div>

        {/* Form Container Wrapper */}
        <div className="relative group">
          {/* Subtle Ambient Glow behind the card */}
          <div className="absolute -inset-0.5 bg-gradient-to-b from-[#ff9a00]/10 to-transparent rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-1000" />
          
          <div className="relative">
            <SignupForm />
          </div>
        </div>

        {/* Ambient Corner Crosshairs/Tech Accents */}
        <div className="absolute -top-4 -left-4 w-3 h-3 border-t-2 border-l-2 border-[#1e2330]" />
        <div className="absolute -top-4 -right-4 w-3 h-3 border-t-2 border-r-2 border-[#1e2330]" />
        <div className="absolute -bottom-4 -left-4 w-3 h-3 border-b-2 border-l-2 border-[#1e2330]" />
        <div className="absolute -bottom-4 -right-4 w-3 h-3 border-b-2 border-r-2 border-[#1e2330]" />
      </div>
    </div>
  );
}