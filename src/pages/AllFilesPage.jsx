import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Info } from "lucide-react";
import DataTable from "../components/DataTable";

export default function AllFilesPage({
  files = [], // Default to empty array to prevent .filter errors
  loading,
  isDarkMode,
  onPreview,
  globalSearch,
}) {
  const [activeFilter, setActiveFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Reset to page 1 if search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [globalSearch, activeFilter]);

  // Filtering Logic
  const filteredFiles = files.filter((file) => {
    // Safety check for missing properties
    const filename = file.filename || "";
    const system = file.system || "";
    const assetHint = file.asset_hint || "";

    const matchesFilter = activeFilter === "All" || system === activeFilter;

    const searchLower = globalSearch.toLowerCase();
    const matchesSearch =
      filename.toLowerCase().includes(searchLower) ||
      assetHint.toLowerCase().includes(searchLower) ||
      system.toLowerCase().includes(searchLower);

    return matchesFilter && matchesSearch;
  });

  const totalPages = Math.ceil(filteredFiles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedFiles = filteredFiles.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 min-w-0">
      {/* 1. Header & Quick Info */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {["All", "HVAC", "Electrical", "Fire", "Plumbing"].map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-6 py-2 rounded-full text-sm font-semibold border whitespace-nowrap transition-all ${
                activeFilter === f
                  ? "bg-[#4F6EF7] text-white border-[#4F6EF7] shadow-lg shadow-blue-500/20"
                  : isDarkMode
                  ? "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                  : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Backend Status Indicator */}
        {!loading && (
          <div className="hidden md:flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            <Info size={12} />
            Live Sync: {files.length} Docs
          </div>
        )}
      </div>

      {/* 2. Table Container */}
      <div
        className={`flex-1 min-h-0 border rounded-[2rem] overflow-hidden shadow-2xl flex flex-col ${
          isDarkMode
            ? "bg-white/[0.02] border-white/10"
            : "bg-white border-slate-200 shadow-xl"
        }`}
      >
        <div className="flex-1 overflow-auto custom-scrollbar">
          <DataTable
            files={paginatedFiles}
            loading={loading}
            onRowClick={onPreview}
          />
        </div>

        {/* 3. Pagination Footer */}
        <div
          className={`p-4 border-t flex items-center justify-between shrink-0 ${
            isDarkMode
              ? "border-white/10 bg-white/[0.02]"
              : "border-slate-100 bg-slate-50/50"
          }`}
        >
          <span className="text-xs text-slate-500 font-medium ml-4">
            Showing {filteredFiles.length > 0 ? startIndex + 1 : 0} to{" "}
            {Math.min(startIndex + itemsPerPage, filteredFiles.length)} of{" "}
            {filteredFiles.length}
          </span>

          <div className="flex items-center gap-2 mr-4">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className={`p-2 rounded-xl border transition-all disabled:opacity-30 ${
                isDarkMode
                  ? "border-white/10 hover:bg-white/5 text-white"
                  : "border-slate-200 hover:bg-slate-100 text-slate-600"
              }`}
            >
              <ChevronLeft size={20} />
            </button>
            <span
              className={`text-sm font-bold px-4 ${
                isDarkMode ? "text-white" : "text-slate-900"
              }`}
            >
              {currentPage}{" "}
              <span className="text-slate-500 font-medium">
                / {totalPages || 1}
              </span>
            </span>
            <button
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className={`p-2 rounded-xl border transition-all disabled:opacity-30 ${
                isDarkMode
                  ? "border-white/10 hover:bg-white/5 text-white"
                  : "border-slate-200 hover:bg-slate-100 text-slate-600"
              }`}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
