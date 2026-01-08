import React from "react";

export default function DataTable({ files = [], loading, onRowClick }) {
  // Loading State
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <div className="w-8 h-8 border-4 border-[#4F6EF7]/20 border-t-[#4F6EF7] rounded-full animate-spin" />
        <p className="text-slate-500 text-xs font-black uppercase tracking-[0.3em] animate-pulse">
          Syncing files...
        </p>
      </div>
    );
  }

  // Empty State
  if (!files || files.length === 0) {
    return (
      <div className="p-20 text-center flex flex-col items-center">
        <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center text-slate-300 mb-4">
          <svg
            className="w-8 h-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 7h18M3 12h18M3 17h18"
            />
          </svg>
        </div>
        <p className="text-slate-500 font-bold">
          No records found in current scope.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <table className="w-full text-left border-separate border-spacing-0 table-auto">
        <thead>
          <tr className="sticky top-0 z-20 bg-white dark:bg-[#0B0F1A] border-b border-slate-200 dark:border-white/10">
            <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] min-w-[280px]">
              Filename
            </th>
            <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] min-w-[140px]">
              System
            </th>
            <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] min-w-[150px]">
              Asset Hint
            </th>
            <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] min-w-[120px]">
              Building
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
          {files.map((file, index) => (
            <tr
              key={file.document_id || index}
              onClick={() => onRowClick && onRowClick(file)}
              className="hover:bg-[#4F6EF7]/5 dark:hover:bg-white/[0.04] transition-all duration-200 cursor-pointer"
            >
              {/* Filename */}
              <td className="px-8 py-6 text-sm font-bold text-slate-900 dark:text-blue-400/90 hover:text-[#4F6EF7] break-all max-w-[400px]">
                {file.filename}
              </td>

              {/* System */}
              <td className="px-8 py-6 text-sm">
                <span
                  className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getSystemStyles(
                    file.system
                  )}`}
                >
                  {file.system || "Uncategorized"}
                </span>
              </td>

              {/* Asset Hint */}
              <td className="px-8 py-6 text-sm font-mono text-slate-400 italic">
                {file.asset_hint || "—"}
              </td>

              {/* Building */}
              <td className="px-8 py-6 text-sm text-slate-500 dark:text-slate-400 font-medium">
                {file.building || "Main Block"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// System styling
function getSystemStyles(system) {
  const sys = system?.toUpperCase() || "";
  if (sys.includes("HVAC"))
    return "bg-orange-500/10 text-orange-500 border-orange-500/20";
  if (sys.includes("ELECTRICAL"))
    return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20";
  if (sys.includes("FIRE"))
    return "bg-red-500/10 text-red-500 border-red-500/20";
  if (sys.includes("PLUMBING"))
    return "bg-blue-500/10 text-blue-500 border-blue-500/20";

  return "bg-slate-500/10 text-slate-500 border-slate-500/20";
}
