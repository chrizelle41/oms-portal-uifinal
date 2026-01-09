import React from "react";
import { FileText, Folder, HardDrive } from "lucide-react";

export default function DataTable({ files = [], loading, onRowClick }) {
  // --- HELPER: CLEAN NESTED PATHS ---
  const getCleanFolderName = (file) => {
    // Priority check for the various keys the backend might send
    const rawPath = file.folder_name || file.building || file.asset_hint || "";

    // If it's a nested Azure path like "Input_Documents/Building_A/file.pdf"
    if (rawPath.includes("Input_Documents/")) {
      const parts = rawPath.split("/");
      // Return the second part (the building name) and replace underscores
      return parts[1] ? parts[1].replace(/_/g, " ") : "Root";
    }

    // Fallback for root files or local CSV data
    return rawPath.replace(/_/g, " ") || "om-root";
  };

  // 1. Loading State
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <div className="w-10 h-10 border-4 border-[#4F6EF7]/20 border-t-[#4F6EF7] rounded-full animate-spin" />
        <div className="text-center">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">
            Querying Azure Blobs...
          </p>
          <p className="text-slate-400 text-[9px] mt-1 italic">
            Establishing secure SAS connection
          </p>
        </div>
      </div>
    );
  }

  // 2. Empty State
  if (!files || files.length === 0) {
    return (
      <div className="p-20 text-center flex flex-col items-center">
        <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-[1.5rem] flex items-center justify-center text-slate-300 mb-4 border border-dashed border-slate-300 dark:border-white/10">
          <HardDrive size={32} />
        </div>
        <h3 className="text-slate-900 dark:text-white font-bold">
          No blobs detected
        </h3>
        <p className="text-slate-500 text-sm mt-1">
          The "om" container appears to be empty or search returned no results.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full relative">
      <table className="w-full text-left border-separate border-spacing-0 table-auto">
        <thead>
          <tr className="sticky top-0 z-20 bg-white dark:bg-[#0B0F1A] border-b border-slate-200 dark:border-white/10">
            <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] min-w-[300px]">
              Cloud Document Name
            </th>
            <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] min-w-[140px]">
              System
            </th>
            <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] min-w-[150px]">
              Asset Folder
            </th>
            <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] min-w-[120px]">
              Size
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
          {files.map((file, index) => {
            // --- SAFE BLOB PROPERTY MAPPING ---
            const fileName = file?.filename || file?.name || "Unnamed Blob";
            const systemLabel = file?.system || file?.cat || "Uncategorized";
            const folderLabel = getCleanFolderName(file);
            const fileSize = file?.size || "N/A";

            return (
              <tr
                key={file?.id || file?.document_id || index}
                onClick={() => onRowClick && onRowClick(file)}
                className="group hover:bg-[#4F6EF7]/5 dark:hover:bg-white/[0.04] transition-all duration-200 cursor-pointer"
              >
                {/* Filename with Icon */}
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-400 group-hover:text-[#4F6EF7] transition-colors">
                      <FileText size={18} />
                    </div>
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-200 truncate max-w-[350px]">
                      {fileName}
                    </span>
                  </div>
                </td>

                {/* System / Category Badge */}
                <td className="px-8 py-6 text-sm">
                  <span
                    className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border transition-colors ${getSystemStyles(
                      systemLabel
                    )}`}
                  >
                    {systemLabel}
                  </span>
                </td>

                {/* Virtual Folder / Asset */}
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 font-medium italic">
                    <Folder size={14} className="text-slate-300" />
                    {folderLabel}
                  </div>
                </td>

                {/* File Size */}
                <td className="px-8 py-6 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  {fileSize}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// System styling helper
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

  return "bg-slate-500/5 text-slate-500 border-slate-500/10";
}
