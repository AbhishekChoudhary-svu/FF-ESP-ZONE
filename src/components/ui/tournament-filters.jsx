"use client"

import { useState } from "react"

export function TournamentFilters({ onFilterChange, onSortChange }) {
  const [filters, setFilters] = useState({
    searchQuery: "",
    gameMode: "all",
    teamMode: "all",
    priceRange: "all",
  })
  const [sortBy, setSortBy] = useState("newest")

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    const newFilters = { ...filters, [name]: value }
    setFilters(newFilters)
    onFilterChange?.(newFilters)
  }

  const handleSortChange = (e) => {
    setSortBy(e.target.value)
    onSortChange?.(e.target.value)
  }

  // Shared classes to keep the dropdowns and inputs completely uniform
  const inputClasses = 
    "w-full font-['Rajdhani'] text-[15px] font-semibold text-[#d0d5df] bg-[#11141d] " +
    "border border-[#1e2330] rounded-md px-3.5 py-2.5 outline-none " +
    "focus:border-[#ff6b00]/50 focus:shadow-[0_0_10px_rgba(255,107,0,0.15)] " +
    "transition-all duration-200"

  const selectClasses = `${inputClasses} cursor-pointer appearance-none bg-no-repeat bg-[right_12px_center] bg-[length:14px] pr-9 ` +
    "bg-[url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23ff8c30' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e\")]"

  return (
    <>
      {/* Injecting fonts globally since Tailwind utilities require them to be loaded */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Orbitron:wght@700;900&display=swap');`}</style>

      {/* Main Filter Wrapper Container */}
      <div className="relative w-full p-6 my-4 rounded-xl bg-[#0a0c10] border border-[#2a2e3a] overflow-hidden font-['Rajdhani'] before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-[2px] before:bg-gradient-to-r before:from-transparent before:via-[#ff6b00] before:to-transparent">
        
        {/* Absolute Cyberpunk Corner Brackets */}
        <div className="absolute w-3 h-3 top-0 left-0 border-t-2 border-l-2 border-[#ff6b00]" />
        <div className="absolute w-3 h-3 top-0 right-0 border-t-2 border-r-2 border-[#ff6b00]" />
        <div className="absolute w-3 h-3 bottom-0 left-0 border-b-2 border-l-2 border-[#ff6b00]" />
        <div className="absolute w-3 h-3 bottom-0 right-0 border-b-2 border-r-2 border-[#ff6b00]" />

        {/* Section Header */}
        <h3 className="flex items-center gap-2 mb-5 font-['Orbitron'] text-lg font-bold text-[#f0f2f5] tracking-wide uppercase [text-shadow:0_0_15px_rgba(255,107,0,0.25)] before:content-[''] before:inline-block before:w-1 before:h-4 before:bg-[#ff6b00] before:shadow-[0_0_8px_#ff6b00]">
          Filters & Sort
        </h3>

        {/* Grid System for Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* Search Field */}
          <div className="flex flex-col">
            <label className="text-xs font-bold text-[#5a6070] uppercase tracking-widest mb-2">Search</label>
            <input
              type="text"
              name="searchQuery"
              placeholder="Tournament name..."
              value={filters.searchQuery}
              onChange={handleFilterChange}
              className={inputClasses}
            />
          </div>

          {/* Game Mode Selector */}
          <div className="flex flex-col">
            <label className="text-xs font-bold text-[#5a6070] uppercase tracking-widest mb-2">Game Mode</label>
            <div className="relative">
              <select
                name="gameMode"
                value={filters.gameMode}
                onChange={handleFilterChange}
                className={selectClasses}
              >
                <option value="all" className="bg-[#0a0c10] text-[#d0d5df]">All Modes</option>
                <option value="BR" className="bg-[#0a0c10] text-[#d0d5df]">BR</option>
                <option value="CS" className="bg-[#0a0c10] text-[#d0d5df]">CS</option>
                <option value="mixed" className="bg-[#0a0c10] text-[#d0d5df]">Mixed</option>
              </select>
            </div>
          </div>

          {/* Team Mode Selector */}
          <div className="flex flex-col">
            <label className="text-xs font-bold text-[#5a6070] uppercase tracking-widest mb-2">Team Mode</label>
            <div className="relative">
              <select
                name="teamMode"
                value={filters.teamMode}
                onChange={handleFilterChange}
                className={selectClasses}
              >
                <option value="all" className="bg-[#0a0c10] text-[#d0d5df]">All Teams</option>
                <option value="solo" className="bg-[#0a0c10] text-[#d0d5df]">Solo</option>
                <option value="duo" className="bg-[#0a0c10] text-[#d0d5df]">Duo</option>
                <option value="squad" className="bg-[#0a0c10] text-[#d0d5df]">Squad</option>
              </select>
            </div>
          </div>

          {/* Price Range Selector */}
          <div className="flex flex-col">
            <label className="text-xs font-bold text-[#5a6070] uppercase tracking-widest mb-2">Price</label>
            <div className="relative">
              <select
                name="priceRange"
                value={filters.priceRange}
                onChange={handleFilterChange}
                className={selectClasses}
              >
                <option value="all" className="bg-[#0a0c10] text-[#d0d5df]">All Prices</option>
                <option value="free" className="bg-[#0a0c10] text-[#d0d5df]">Free</option>
                <option value="paid" className="bg-[#0a0c10] text-[#d0d5df]">Paid</option>
              </select>
            </div>
          </div>

          {/* Sort Menu */}
          <div className="flex flex-col">
            <label className="text-xs font-bold text-[#5a6070] uppercase tracking-widest mb-2">Sort By</label>
            <div className="relative">
              <select
                value={sortBy}
                onChange={handleSortChange}
                className={selectClasses}
              >
                <option value="newest" className="bg-[#0a0c10] text-[#d0d5df]">Newest</option>
                <option value="popular" className="bg-[#0a0c10] text-[#d0d5df]">Most Popular</option>
                <option value="prize" className="bg-[#0a0c10] text-[#d0d5df]">Highest Prize</option>
                <option value="startTime" className="bg-[#0a0c10] text-[#d0d5df]">Starting Soon</option>
              </select>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}