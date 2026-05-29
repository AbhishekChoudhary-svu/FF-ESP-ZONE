import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#07080b] flex items-center justify-center px-4 py-2 font-['Rajdhani'] relative overflow-hidden selection:bg-[#ff6b00]/30 selection:text-white">
      
      {/* Background Grid & Tactical Detail Overlays */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#141822_1px,transparent_1px),linear-gradient(to_bottom,#141822_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40" />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#ff6b00]/30 to-transparent" />

      <div className="w-full max-w-md relative z-10">
        
        {/* Main Header System Terminal Info */}
        <div className="mb-6 text-center">
          <div className="inline-block px-2.5 py-0.5 bg-[#ff6b00]/10 border border-[#ff6b00]/20 text-[#ff6b00] font-['Orbitron'] text-[10px] font-bold tracking-widest uppercase rounded-sm mb-3">
            SECURE LINK TERMINAL
          </div>
          
          <h1 className="text-3xl font-black font-['Orbitron'] text-white uppercase tracking-tight mb-1.5">
            Welcome Back, Operator
          </h1>
          
          <p className="text-xs font-bold text-[#4e5d78] uppercase tracking-wider">
            Establish uplink connection with the FF-ESP-ZONE mainframe
          </p>
        </div>

        {/* Form Container Wrapper with Cyberpunk Glow */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-b from-[#ff6b00]/10 to-transparent rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-1000" />
          
          <div className="relative">
            <LoginForm />
          </div>
        </div>

        {/* Security Matrix Subtext */}
        <div className="mt-6 text-center text-[10px] font-bold uppercase tracking-widest text-[#1e2330] select-none">
          ENC_MODE // SHA-256 SECURED GRID OVERLAY
        </div>
      </div>

      {/* Ambient Corner Crosshairs / Frame Anchors */}
      <div className="absolute top-4 left-4 w-4 h-4 border-t border-l border-[#141822]" />
      <div className="absolute top-4 right-4 w-4 h-4 border-t border-r border-[#141822]" />
      <div className="absolute bottom-4 left-4 w-4 h-4 border-b border-l border-[#141822]" />
      <div className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-[#141822]" />
    </div>
  );
}