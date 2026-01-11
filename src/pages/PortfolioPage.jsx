import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Building2,
  AlertCircle,
  Loader2,
  Star,
  Archive,
  FolderOpen,
} from "lucide-react";
import AssetCard from "../components/AssetCard";
import AddAssetModal from "../components/AddAssetModal";
import ChatDrawer from "../components/ChatDrawer";
import DocumentPreviewDrawer from "../components/DocumentPreviewDrawer";

export default function PortfolioPage({
  loading,
  globalSearch,
  portfolioData,
  setPortfolioData,
  isChatOpen,
  setIsChatOpen,
  isDarkMode,
  apiBase,
}) {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("All assets");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [archiveTarget, setArchiveTarget] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [chatPreviewDoc, setChatPreviewDoc] = useState(null);

  // ==========================================
  // 🔍 DEBUGGING SECTION (ADD THIS HERE)
  // ==========================================
  console.log("--- DEBUG: PORTFOLIO DATA ---");
  console.log("Loading State:", loading);
  console.log("Raw Data:", portfolioData);
  console.log("Assets Array:", portfolioData?.assets);

  // If the page is blank, check if portfolioData is an HTML string (backend error)
  if (
    typeof portfolioData === "string" &&
    portfolioData.includes("<!DOCTYPE")
  ) {
    console.error(
      "CRITICAL: Backend returned HTML instead of JSON. Check Render logs for a crash."
    );
  }
  // ==========================================

  // --- HANDLERS ---
  const handleOpenDocFromChat = async (docTitle) => {
    try {
      const response = await fetch(`${apiBase}/files`);
      const allFiles = await response.json();
      const cleanTitle = docTitle.toLowerCase().trim();

      const match = allFiles.find((f) => {
        const fname = (f.filename || f.name || "").toLowerCase();
        return (
          fname.includes(cleanTitle) ||
          cleanTitle.includes(fname.replace(".pdf", ""))
        );
      });

      if (match) {
        setChatPreviewDoc({
          id: match.document_id || match.id,
          name: match.filename || match.name,
          cat: match.system || match.cat || "Document",
          doc_type: match.document_type || match.doc_type || "General",
          date: match.date || "Verified",
          size: match.size || "N/A",
          isLocal: false,
          previewUrl:
            match.previewUrl ||
            `${apiBase}/preview/${encodeURIComponent(
              match.document_id || match.id
            )}`,
        });
      }
    } catch (err) {
      console.error("Error opening document from chat:", err);
    }
  };

  const handleConfirmAdd = async (newAssetData) => {
    if (isSyncing) return;
    setIsSyncing(true);
    const finalImageUrl =
      newAssetData.image && !newAssetData.image.startsWith("blob:")
        ? newAssetData.image
        : "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab";
    try {
      const response = await fetch(`${apiBase}/create-asset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newAssetData.name,
          image: finalImageUrl,
        }),
      });
      const result = await response.json();
      if (result.status === "success") {
        const refreshRes = await fetch(`${apiBase}/portfolio`);
        const updatedData = await refreshRes.json();
        setPortfolioData(updatedData);
        setIsAddModalOpen(false);
        setIsSyncing(false);
        navigate(`/portfolio/${result.folder_name}`);
      }
    } catch (error) {
      console.error("Asset creation failed:", error);
      setIsSyncing(false);
    }
  };

  const handleFavorite = (id) => {
    if (!id) return; // Guard against null IDs
    setPortfolioData((prev) => {
      if (!prev || !prev.assets) return prev; // Guard against null state
      return {
        ...prev,
        assets: prev.assets.map((a) => {
          if (!a || (a.id !== id && a.folder_name !== id)) return a;
          return { ...a, isFavorite: !a?.isFavorite };
        }),
      };
    });
  };

  const handleArchiveStatus = (id, newStatus) => {
    if (!id) return;
    setPortfolioData((prev) => {
      if (!prev || !prev.assets) return prev;
      return {
        ...prev,
        assets: prev.assets.map((a) => {
          if (!a || (a.id !== id && a.folder_name !== id)) return a;
          return {
            ...a,
            status: newStatus,
            isFavorite: newStatus === "archived" ? false : !!a?.isFavorite,
          };
        }),
      };
    });
    setArchiveTarget(null);
    setOpenMenuId(null);
  };

  // --- DEFENSIVE FILTERING ---
  const filteredAssets = (portfolioData?.assets || []).filter((a) => {
    // 1. If 'a' is null or undefined, skip it
    if (!a) return false;

    // 2. If folder_name is missing, skip it (This prevents your specific error)
    if (!a.folder_name) return false;

    // 3. Ignore system folders just in case they slipped through the API
    if (a.folder_name.startsWith(".")) return false;

    const searchTerm = globalSearch?.toLowerCase() || "";
    const matchesSearch = (a.name?.toLowerCase() || "").includes(searchTerm);

    if (!matchesSearch) return false;

    if (activeFilter === "Favourites")
      return a.isFavorite && a.status !== "archived";
    if (activeFilter === "Archived") return a.status === "archived";
    return a.status !== "archived";
  });

  // --- LOADING STATE ---
  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500">
        <Loader2 className="animate-spin mb-4" size={40} />
        <p className="font-black uppercase tracking-widest text-xs">
          Syncing Azure Portfolio...
        </p>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col h-full px-8 pb-20 overflow-y-auto relative"
      onClick={() => setOpenMenuId(null)}
    >
      {/* Header */}
      <div className="flex justify-between items-end mb-10 mt-4 shrink-0">
        <div>
          <h1 className="text-4xl font-black dark:text-white text-slate-900 mb-3 tracking-tight">
            Portfolio
          </h1>
          <div className="flex gap-2">
            <span className="bg-slate-200 dark:bg-white/10 text-slate-500 text-[10px] font-bold px-2 py-1 rounded-md uppercase">
              {portfolioData?.stats?.properties || 0} Assets
            </span>
            <span className="bg-slate-200 dark:bg-white/10 text-slate-500 text-[10px] font-bold px-2 py-1 rounded-md uppercase">
              {portfolioData?.stats?.docs || 0} Total documents
            </span>
          </div>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          disabled={isSyncing}
          className="flex items-center gap-2 bg-[#4F6EF7] text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
        >
          {isSyncing ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <Plus size={18} />
          )}
          Add asset
        </button>
      </div>

      <div className="flex items-center gap-2 mb-6 text-slate-900 dark:text-white font-bold text-lg shrink-0">
        <Building2 size={20} className="text-[#4F6EF7]" /> My Assets
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-3 mb-8 overflow-x-auto no-scrollbar shrink-0">
        {["All assets", "Favourites", "Archived"].map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-5 py-2 rounded-xl text-sm font-bold border transition-all whitespace-nowrap ${
              activeFilter === f
                ? "bg-white dark:bg-white/10 text-[#4F6EF7] dark:text-white border-slate-200 dark:border-white/20 shadow-sm"
                : "text-slate-400 border-transparent hover:text-slate-600"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filteredAssets.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6 mb-12">
          {filteredAssets.map((asset) => {
            // 1. Safety Guard: skip if asset is somehow null
            if (!asset) return null;

            return (
              <div
                key={asset?.id || asset?.folder_name || Math.random()}
                onClick={() => {
                  // 2. Safe Navigation
                  if (asset?.folder_name) {
                    navigate(`/portfolio/${asset.folder_name}`);
                  }
                }}
                className="contents"
              >
                <AssetCard
                  asset={asset}
                  isOpen={openMenuId === asset?.id}
                  // 3. Safe Handlers - Notice the ?. inside the arrow functions
                  onFavorite={() => asset?.id && handleFavorite(asset.id)}
                  onMenuOpen={setOpenMenuId}
                  onArchive={() => asset && setArchiveTarget(asset)}
                  onUnarchive={(id) => handleArchiveStatus(id, "active")}
                />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center py-20">
          <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-3xl flex items-center justify-center text-slate-300 dark:text-slate-600 mb-4">
            {activeFilter === "Favourites" ? (
              <Star size={40} />
            ) : activeFilter === "Archived" ? (
              <Archive size={40} />
            ) : (
              <FolderOpen size={40} />
            )}
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {activeFilter === "Favourites"
              ? "No favourites yet"
              : activeFilter === "Archived"
              ? "No archived assets"
              : "No assets found"}
          </h3>
        </div>
      )}

      {/* Components */}
      <ChatDrawer
        isOpen={isChatOpen}
        setIsOpen={setIsChatOpen}
        onOpenDoc={handleOpenDocFromChat}
        apiBase={apiBase}
      />
      {chatPreviewDoc && (
        <DocumentPreviewDrawer
          document={chatPreviewDoc}
          onClose={() => setChatPreviewDoc(null)}
          isDarkMode={isDarkMode}
        />
      )}
      <AddAssetModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onConfirm={handleConfirmAdd}
      />

      {/* Archive Modal */}
      {archiveTarget && (
        <div
          className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setArchiveTarget(null)}
        >
          <div
            className="bg-white dark:bg-[#1c2128] w-full max-w-sm rounded-[2rem] p-8 border border-slate-200 dark:border-white/10 shadow-2xl text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 bg-red-100 dark:bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mb-6 mx-auto">
              <AlertCircle size={32} />
            </div>
            <h2 className="text-xl font-bold dark:text-white mb-2">
              Archive Asset?
            </h2>
            <p className="text-slate-500 text-sm mb-8">
              Are you sure you want to archive <b>{archiveTarget.name}</b>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setArchiveTarget(null)}
                className="flex-1 py-3 rounded-xl font-bold bg-slate-100 text-slate-500"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  handleArchiveStatus(
                    archiveTarget.id || archiveTarget.folder_name,
                    "archived"
                  )
                }
                className="flex-1 py-3 rounded-xl font-bold bg-red-50 text-red-500"
              >
                Archive
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
