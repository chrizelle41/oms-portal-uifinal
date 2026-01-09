import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Search, X, Zap, Cloud } from "lucide-react";

export default function Topbar({
  isAiOpen,
  setIsAiOpen,
  isDarkMode,
  searchQuery,
  setSearchQuery,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine the search placeholder based on the current page context
  const isPortfolio = location.pathname.includes("portfolio");

  // Refined placeholder to match your nested Azure structure
  const placeholder = isPortfolio
    ? "Search Assets in Input_Documents..."
    : "Search all Cloud Documents...";

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && searchQuery.trim() !== "") {
      // Navigate to All Files if not already there to show filtered results
      if (!location.pathname.includes("all-files")) {
        navigate("/all-files");
      }
    }
  };

  return (
    <header
      className={`h-20 flex items-center justify-between px-8 shrink-0 border-b transition-all duration-300 z-50 ${
        isDarkMode
          ? "bg-[#030712]/80 border-white/10 backdrop-blur-md"
          : "bg-white border-slate-200 shadow-sm"
      }`}
    >
      {/* Search Bar Container */}
      <div className="flex-1 max-w-xl relative group">
        <Search
          className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${
            searchQuery
              ? "text-[#4F6EF7]"
              : isDarkMode
              ? "text-slate-500"
              : "text-slate-400"
          }`}
          size={18}
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full pl-12 pr-10 py-3 rounded-2xl outline-none border text-sm font-semibold transition-all duration-300 ${
            isDarkMode
              ? "bg-white/5 border-white/10 text-white focus:bg-white/10 focus:border-[#4F6EF7]/50 placeholder:text-slate-600"
              : "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-[#4F6EF7] placeholder:text-slate-400"
          }`}
        />

        {/* Status Indicators & Clear Action */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery("")}
              className="p-1.5 hover:bg-slate-500/10 rounded-full transition-colors group"
              title="Clear search"
            >
              <X
                size={14}
                className="text-slate-400 group-hover:text-[#4F6EF7]"
              />
            </button>
          ) : (
            <div className="flex items-center gap-1.5 opacity-40 group-focus-within:opacity-100 transition-opacity">
              <span className="text-[9px] font-black uppercase tracking-tighter text-slate-500">
                Azure
              </span>
              <Cloud
                size={14}
                className={isDarkMode ? "text-slate-500" : "text-slate-400"}
              />
            </div>
          )}
        </div>
      </div>

      {/* Actions Section */}
      <div className="ml-6 flex items-center gap-6">
        {/* AI Toggle Button */}
        {!isAiOpen && (
          <button
            onClick={() => setIsAiOpen(true)}
            className="flex items-center gap-2 bg-[#4F6EF7] text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-600 hover:shadow-blue-500/40 active:scale-95 transition-all animate-in fade-in zoom-in duration-500"
          >
            <Zap size={16} className="fill-current" />
            Ask AI
          </button>
        )}
      </div>
    </header>
  );
}
