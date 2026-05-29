export function PlayerCard({ player }) {
  return (
    <div className="p-4 rounded-md bg-[#0a0c10] border border-[#1e2330] hover:border-[#ff6b00]/50 hover:shadow-[0_0_15px_rgba(255,107,0,0.1)] transition-all duration-200 font-['Rajdhani'] relative overflow-hidden group">
      
      {/* Subtle top corner tech accent line */}
      <div className="absolute top-0 left-0 w-8 h-[2px] bg-[#ff6b00] opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      
      {/* Top Section: Player Identity & Action */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="font-['Orbitron'] font-bold text-sm text-[#d0d5df] tracking-wide mb-1.5 group-hover:text-white transition-colors">
            {player.name}
          </h4>
          <span className="inline-block px-2.5 py-0.5 bg-[#ff6b00]/10 border border-[#ff6b00]/20 text-[#ff8c30] rounded-sm text-[11px] font-bold tracking-wider uppercase">
            {player.role}
          </span>
        </div>
        <button 
          className="text-xl opacity-60 hover:opacity-100 hover:scale-110 active:scale-95 transition-all cursor-pointer filter drop-shadow-[0_0_5px_rgba(255,107,0,0.2)]"
          aria-label="Favorite Player"
        >
          ❤️
        </button>
      </div>

      {/* Middle Section: Statistics Grid */}
      <div className="space-y-2 mb-5 text-sm border-t border-b border-[#141822] py-3">
        <div className="flex justify-between items-center">
          <span className="text-[#8090a0] font-medium uppercase tracking-wider text-xs">K/D Ratio</span>
          <span className="font-['Orbitron'] font-semibold text-[#ff9a00] text-xs">
            {player.kdRatio}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[#8090a0] font-medium uppercase tracking-wider text-xs">Likes</span>
          <span className="font-semibold text-[#d0d5df] text-xs">
            {player.likes}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[#8090a0] font-medium uppercase tracking-wider text-xs">Matches</span>
          <span className="font-semibold text-[#d0d5df] text-xs">
            {player.matches}
          </span>
        </div>
      </div>

      {/* Bottom Section: Primary Action Trigger */}
      <button className="w-full py-2 bg-gradient-to-r from-[#ff6b00] to-[#ff9a00] hover:from-[#ff7c1a] hover:to-[#ffa61a] text-white font-bold text-xs uppercase tracking-widest rounded-sm cursor-pointer active:scale-[0.98] shadow-[0_2px_8px_rgba(255,107,0,0.15)] hover:shadow-[0_4px_12px_rgba(255,107,0,0.3)] transition-all duration-200">
        Send Request
      </button>
    </div>
  );
}