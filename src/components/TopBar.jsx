import React from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Zap } from "lucide-react";

export default function Topbar({
  isAiOpen,
  setIsAiOpen,
  isDarkMode,
  searchQuery,
  setSearchQuery,
}) {
  const navigate = useNavigate();

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && searchQuery.trim() !== "") {
      navigate("/all-files");
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
      {/* Search Bar */}
      <div className="flex-1 max-w-xl relative group">
        <Search
          className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
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
          placeholder="Search for Documents..."
          className={`w-full pl-12 pr-10 py-3 rounded-2xl outline-none border text-sm font-semibold transition-all ${
            isDarkMode
              ? "bg-white/5 border-white/10 text-white focus:bg-white/10 focus:border-[#4F6EF7]/50"
              : "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-[#4F6EF7]"
          }`}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-slate-500/10 rounded-full transition-colors"
          >
            <X size={14} className="text-slate-400" />
          </button>
        )}
      </div>

      {/* Actions */}
      <div className="ml-6 flex items-center gap-6">
        {/* AI Toggle Button */}
        {!isAiOpen && (
          <button
            onClick={() => setIsAiOpen(true)}
            className="flex items-center gap-2 bg-[#4F6EF7] text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-600 active:scale-95 transition-all animate-in fade-in zoom-in duration-500"
          >
            <Zap size={16} className="fill-current" />
            Ask AI
          </button>
        )}
      </div>
    </header>
  );
}
