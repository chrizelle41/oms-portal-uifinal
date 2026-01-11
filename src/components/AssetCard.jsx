import React from "react";
import { FileText, Star, Archive, RefreshCcw, Cloud } from "lucide-react";

export default function AssetCard({
  asset,
  onFavorite,
  onArchive,
  onUnarchive,
}) {
  // --- 1. FATAL SAFETY GUARD ---
  // If asset is missing or not an object, render nothing.
  // This prevents the "cannot read property of undefined" crash.
  if (!asset || typeof asset !== "object") return null;

  // --- 2. STABLE IDENTIFIERS WITH FALLBACKS ---
  // Using ?. ensure that even if 'id' or 'folder_name' is missing, it doesn't crash.
  const assetId = asset?.id || asset?.folder_name || "unknown-id";
  const folderName = asset?.folder_name || "root";
  const assetName = asset?.name || "Unnamed Asset";
  const docCount = asset?.docs || 0;

  const imageUrl =
    asset?.img ||
    asset?.image ||
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1000&auto=format&fit=crop";

  return (
    <div
      className="
        group
        bg-white dark:bg-[#161B22]/40
        border border-slate-200 dark:border-white/10
        rounded-[2.5rem]
        overflow-hidden
        flex flex-col
        relative
        transition-all duration-500
        hover:-translate-y-1 hover:shadow-2xl
        cursor-pointer
        min-w-[260px]
        w-full
      "
    >
      {/* Image Section */}
      <div className="h-44 relative overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={imageUrl}
          alt={assetName}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          onError={(e) => {
            e.target.src =
              "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab";
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Azure Sync Badge */}
        <div className="absolute top-4 left-4 z-20">
          <div className="bg-black/20 backdrop-blur-md border border-white/20 p-2 rounded-xl text-white/80">
            <Cloud size={14} />
          </div>
        </div>

        {/* Actions */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
          {/* Favorite Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onFavorite && assetId !== "unknown-id") onFavorite(assetId);
            }}
            className={`p-3 rounded-2xl shadow-xl backdrop-blur-xl border border-white/10 transition-all active:scale-90 ${
              asset?.isFavorite
                ? "bg-yellow-500 text-white"
                : "bg-black/40 text-white/60 hover:text-yellow-400"
            }`}
          >
            <Star
              size={16}
              fill={asset?.isFavorite ? "currentColor" : "none"}
            />
          </button>

          {/* Archive / Restore Button */}
          {asset?.status === "archived" ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onUnarchive) onUnarchive(assetId);
              }}
              className="p-3 rounded-2xl shadow-xl bg-black/40 text-white/60 hover:bg-[#4F6EF7] hover:text-white backdrop-blur-xl border border-white/10 transition-all active:scale-90"
              title="Restore"
            >
              <RefreshCcw size={16} />
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onArchive) onArchive(asset);
              }}
              className="p-3 rounded-2xl shadow-xl bg-black/40 text-white/60 hover:bg-red-500 hover:text-white backdrop-blur-xl border border-white/10 transition-all active:scale-90"
              title="Archive"
            >
              <Archive size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 flex flex-col flex-1">
        <h3 className="font-bold text-slate-900 dark:text-white text-lg truncate mb-6 group-hover:text-[#4F6EF7] transition-colors">
          {assetName}
        </h3>

        <div className="mt-auto flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 text-slate-500 text-[10px] font-black uppercase tracking-widest bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-full">
            <FileText size={12} className="text-[#4F6EF7]" />
            {docCount} Documents
          </div>

          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-tighter">
            ID: {folderName}
          </span>
        </div>
      </div>
    </div>
  );
}
