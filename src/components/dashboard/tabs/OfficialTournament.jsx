"use client"

export function OfficialEventsTab() {
  const events = [
    { id: 1, name: "Monthly Championship", status: "Ongoing", prize: 50000 },
    { id: 2, name: "Season Finale", status: "Coming Soon", prize: 100000 },
    { id: 3, name: "Qualifier Round", status: "Ended", prize: 25000 },
  ]

  return (
    <>
      {/* Injecting fonts globally since Tailwind requires them to be loaded */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Orbitron:wght@700;900&display=swap');`}</style>

      {/* Main Container Wrapper */}
      <div className="space-y-6 font-['Rajdhani']">
        <h3 className="font-['Orbitron'] text-2xl font-bold tracking-wider text-[#f0f2f5] uppercase [text-shadow:0_0_15px_rgba(255,107,0,0.25)]">
          Official Events
        </h3>

        {/* Stacked Layout for Event Rows */}
        <div className="grid gap-4">
          {events.map((event) => (
            <div 
              key={event.id} 
              className="relative p-6 bg-[#0a0c10] border border-[#2a2e3a] rounded-xl overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-[2px] before:bg-gradient-to-r before:from-transparent before:via-[#ff6b00] before:to-transparent"
            >
              {/* Absolute Glowing Corner Brackets */}
              <div className="absolute z-10 w-2.5 h-2.5 top-0 left-0 border-t-2 border-l-2 border-[#ff6b00]" />
              <div className="absolute z-10 w-2.5 h-2.5 top-0 right-0 border-t-2 border-r-2 border-[#ff6b00]" />
              <div className="absolute z-10 w-2.5 h-2.5 bottom-0 left-0 border-b-2 border-l-2 border-[#ff6b00]" />
              <div className="absolute z-10 w-2.5 h-2.5 bottom-0 right-0 border-b-2 border-r-2 border-[#ff6b00]" />

              {/* Flex Wrapper for Row Content */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                
                {/* Event Information Block */}
                <div>
                  <h4 className="font-['Orbitron'] text-xl font-bold text-[#f0f2f5] tracking-wide mb-1 [text-shadow:0_0_15px_rgba(255,107,0,0.15)]">
                    {event.name}
                  </h4>
                  <p className="text-md font-semibold text-[#5a6070] uppercase tracking-wider">
                    Prize Pool: <span className="text-[#ff8c30] font-bold font-['Orbitron']">${event.prize.toLocaleString()}</span>
                  </p>
                </div>

                {/* Status Indicator & Action Buttons Block */}
                <div className="flex flex-col items-start sm:items-end gap-3 w-full sm:w-auto">
                  <span
                    className={`text-[11px] font-bold tracking-widest px-3.5 py-1 rounded-[3px] uppercase border ${
                      event.status === "Ongoing"
                        ? "bg-[#4ade80]/10 text-[#4ade80] border-[#4ade80]/20"
                        : event.status === "Coming Soon"
                          ? "bg-[#63b3ed]/10 text-[#63b3ed] border-[#63b3ed]/25"
                          : "bg-[#5a6070]/10 text-[#5a6070] border-[#5a6070]/25"
                    }`}
                  >
                    {event.status}
                  </span>
                  
                  {event.status === "Ongoing" && (
                    <button className="w-full sm:w-auto px-5 py-2 font-['Rajdhani'] text-[14px] font-bold text-white uppercase tracking-wider rounded-md bg-gradient-to-br from-[#ff6b00] to-[#ff9a00] cursor-pointer shadow-[0_4px_15px_rgba(255,107,0,0.35)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(255,107,0,0.5)] active:scale-[0.98] transition-all duration-200">
                      Participate
                    </button>
                  )}
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}