import React from "react";
import { FileText, Star, Archive, RefreshCcw, Building2 } from "lucide-react";

export default function AssetCard({
  asset,
  onFavorite,
  onArchive,
  onUnarchive,
}) {
  // Defensive check for images - uses a professional building placeholder if image fails
  const imageUrl =
    asset.img ||
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1000&auto=format&fit=crop";

  return (
    <div className="group bg-white dark:bg-[#161B22]/40 border border-slate-200 dark:border-white/10 rounded-[2.5rem] overflow-hidden flex flex-col relative transition-all duration-500 hover:translate-y-[-4px] active:scale-95 hover:shadow-2xl cursor-pointer">
      {/* Top Banner Area */}
      <div className="h-44 relative overflow-hidden">
        <img
          src={imageUrl}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          alt={asset.name}
        />

        {/* Dark overlay for better button contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
          {/* Favorite Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFavorite(asset.id);
            }}
            className={`p-3 rounded-2xl transition-all active:scale-90 shadow-xl backdrop-blur-xl border border-white/10 ${
              asset.isFavorite
                ? "bg-yellow-500 text-white"
                : "bg-black/40 text-white/60 hover:text-yellow-400"
            }`}
          >
            <Star size={16} fill={asset.isFavorite ? "currentColor" : "none"} />
          </button>

          {/* Archive / Unarchive Button */}
          {asset.status === "archived" ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUnarchive(asset.id);
              }}
              className="p-3 rounded-2xl transition-all active:scale-90 shadow-xl bg-black/40 text-white/60 hover:bg-[#4F6EF7] hover:text-white backdrop-blur-xl border border-white/10"
              title="Restore Asset"
            >
              <RefreshCcw size={16} />
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onArchive(asset);
              }}
              className="p-3 rounded-2xl transition-all active:scale-90 shadow-xl bg-black/40 text-white/60 hover:bg-red-500 hover:text-white backdrop-blur-xl border border-white/10"
              title="Archive Asset"
            >
              <Archive size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Info Area */}
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-2">
          <Building2 size={14} className="text-[#4F6EF7]" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            Property Asset
          </span>
        </div>

        <h3 className="font-bold text-slate-900 dark:text-white text-lg truncate mb-4 group-hover:text-[#4F6EF7] transition-colors">
          {asset.name}
        </h3>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-black uppercase tracking-widest bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-full">
            <FileText size={12} className="text-[#4F6EF7]" />
            {asset.docs || 0} Documents
          </div>

          {/* Status Dot */}
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                asset.status === "active" ? "bg-emerald-500" : "bg-slate-400"
              } animate-pulse`}
            />
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">
              {asset.status || "Active"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
