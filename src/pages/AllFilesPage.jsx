import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Info, Cloud } from "lucide-react";
import DataTable from "../components/DataTable";

export default function AllFilesPage({
  files = [], // Now receiving blobs from Azure via App.jsx
  loading,
  isDarkMode,
  onPreview,
  globalSearch,
}) {
  const [activeFilter, setActiveFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Reset to page 1 if search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [globalSearch, activeFilter]);

  // --- BLOB-AWARE FILTERING LOGIC ---
  const filteredFiles = files.filter((file) => {
    // Azure Blob data property mapping (handles both local CSV and direct Blob names)
    const filename = file.filename || file.name || "";
    const system = file.system || file.cat || "Uncategorized";
    const assetHint = file.asset_hint || file.folder_name || "";

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
      {/* 1. Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 shrink-0">
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {["All", "HVAC", "Electrical", "Fire", "Plumbing"].map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest border whitespace-nowrap transition-all active:scale-95 ${
                activeFilter === f
                  ? "bg-[#4F6EF7] text-white border-[#4F6EF7] shadow-lg shadow-blue-500/20"
                  : isDarkMode
                  ? "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                  : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 shadow-sm"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Azure Blob Storage Status */}
        {!loading && (
          <div className="flex items-center gap-3 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
            <Cloud size={16} className="text-emerald-500 animate-pulse" />
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.15em] leading-none">
                Azure Blob Sync
              </span>
              <span className="text-[10px] font-bold text-slate-500 leading-tight">
                {files.length} Live Blobs in "om"
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 2. Data Table Container */}
      <div
        className={`flex-1 min-h-0 border rounded-[3rem] overflow-hidden flex flex-col transition-all duration-500 ${
          isDarkMode
            ? "bg-white/[0.02] border-white/10 shadow-2xl"
            : "bg-white border-slate-200 shadow-xl"
        }`}
      >
        <div className="flex-1 overflow-auto custom-scrollbar">
          <DataTable
            files={paginatedFiles}
            loading={loading}
            // Passing the Azure SAS preview link through to the previewer
            onRowClick={(file) =>
              onPreview({
                ...file,
                previewUrl: file.previewUrl, // This is the temporary link from main.py
              })
            }
          />

          {!loading && paginatedFiles.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full p-20 text-center">
              <div className="w-16 h-16 bg-slate-500/10 rounded-2xl flex items-center justify-center text-slate-500 mb-4">
                <Info size={32} />
              </div>
              <h3 className="text-lg font-bold">No documents found</h3>
              <p className="text-sm text-slate-500">
                Try adjusting your search or filters.
              </p>
            </div>
          )}
        </div>

        {/* 3. Pagination Footer */}
        <div
          className={`p-6 border-t flex items-center justify-between shrink-0 ${
            isDarkMode
              ? "border-white/10 bg-black/20"
              : "border-slate-100 bg-slate-50/50"
          }`}
        >
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Audit Inventory
            </span>
            <span className="text-xs text-slate-400 font-bold">
              Showing {filteredFiles.length > 0 ? startIndex + 1 : 0} -{" "}
              {Math.min(startIndex + itemsPerPage, filteredFiles.length)} of{" "}
              {filteredFiles.length} records
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className={`p-3 rounded-2xl border transition-all disabled:opacity-20 active:scale-90 ${
                isDarkMode
                  ? "border-white/10 hover:bg-white/5 text-white"
                  : "border-slate-200 hover:bg-white text-slate-600 shadow-sm"
              }`}
            >
              <ChevronLeft size={20} />
            </button>

            <div
              className={`px-5 py-2 rounded-2xl text-sm font-black border ${
                isDarkMode
                  ? "bg-white/5 border-white/10"
                  : "bg-white border-slate-200 shadow-sm"
              }`}
            >
              <span className={isDarkMode ? "text-white" : "text-slate-900"}>
                {currentPage}
              </span>
              <span className="text-slate-500 mx-2">/</span>
              <span className="text-slate-500">{totalPages || 1}</span>
            </div>

            <button
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className={`p-3 rounded-2xl border transition-all disabled:opacity-20 active:scale-90 ${
                isDarkMode
                  ? "border-white/10 hover:bg-white/5 text-white"
                  : "border-slate-200 hover:bg-white text-slate-600 shadow-sm"
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
