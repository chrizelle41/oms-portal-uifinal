import React from "react";
import { FileText, Star, Archive, RefreshCcw, Cloud } from "lucide-react";

export default function AssetCard({
  asset,
  onFavorite,
  onArchive,
  onUnarchive,
}) {
  // SAFETY GUARD: If asset is missing, don't crash the page
  if (!asset) return null;

  // Azure Blob Storage uses folder_name as the primary identifier
  const assetId = asset?.folder_name || asset?.id;

  const imageUrl =
    asset?.img ||
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
      <div className="h-44 relative overflow-hidden">
        <img
          src={imageUrl}
          alt={asset?.name}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Cloud Badge (Indicates Azure Sync) */}
        <div className="absolute top-4 left-4 z-20">
          <div className="bg-black/20 backdrop-blur-md border border-white/20 p-2 rounded-xl text-white/80">
            <Cloud size={14} />
          </div>
        </div>

        {/* Actions */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
          {/* Favorite */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFavorite(assetId);
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

          {/* Archive / Restore */}
          {asset?.status === "archived" ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUnarchive(assetId);
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
                onArchive(asset);
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
          {asset?.name || "Unnamed Asset"}
        </h3>

        {/* Footer with Blob Doc Count */}
        <div className="mt-auto flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 text-slate-500 text-[10px] font-black uppercase tracking-widest bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-full">
            <FileText size={12} className="text-[#4F6EF7]" />
            {asset?.docs || 0} Documents
          </div>

          {/* Virtual Folder Identifier */}
          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-tighter">
            ID: {asset?.folder_name || "root"}
          </span>
        </div>
      </div>
    </div>
  );
}
