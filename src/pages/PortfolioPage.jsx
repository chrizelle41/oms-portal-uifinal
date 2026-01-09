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

  const handleOpenDocFromChat = async (docTitle) => {
    try {
      const response = await fetch(`${apiBase}/files`);
      const allFiles = await response.json();
      const cleanTitle = docTitle.toLowerCase().trim();

      const match = allFiles.find((f) => {
        const fname = f.filename.toLowerCase();
        return (
          fname.includes(cleanTitle) ||
          cleanTitle.includes(fname.replace(".pdf", ""))
        );
      });

      if (match) {
        setChatPreviewDoc({
          id: match.document_id,
          name: match.filename,
          cat: match.system || "Document",
          doc_type: match.document_type || "General",
          date: match.date || "Verified",
          size: match.size || "N/A",
          isLocal: false,
        });
      }
    } catch (err) {
      console.error("Error opening document:", err);
    }
  };

  const handleConfirmAdd = async (newAssetData) => {
    if (isSyncing) return;
    setIsSyncing(true);

    // FIX: Fallback to default image if user uploaded a local file (blob)
    // or didn't provide one.
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
      console.error("Creation failed:", error);
      setIsSyncing(false);
    }
  };

  const handleFavorite = (id) => {
    setPortfolioData((prev) => ({
      ...prev,
      assets: prev.assets.map((a) =>
        a.id === id ? { ...a, isFavorite: !a.isFavorite } : a
      ),
    }));
  };

  const handleArchiveStatus = (id, newStatus) => {
    setPortfolioData((prev) => ({
      ...prev,
      assets: prev.assets.map((a) =>
        a.id === id
          ? {
              ...a,
              status: newStatus,
              isFavorite: newStatus === "archived" ? false : a.isFavorite,
            }
          : a
      ),
    }));
    setArchiveTarget(null);
    setOpenMenuId(null);
  };

  const filteredAssets = (portfolioData.assets || []).filter((a) => {
    const searchTerm = globalSearch?.toLowerCase() || "";
    const matchesSearch = (a.name?.toLowerCase() || "").includes(searchTerm);
    if (!matchesSearch) return false;

    if (activeFilter === "Favourites")
      return a.isFavorite && a.status !== "archived";
    if (activeFilter === "Archived") return a.status === "archived";
    return a.status !== "archived";
  });

  if (!portfolioData.assets.length && globalSearch === "") {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500">
        <Loader2 className="animate-spin mb-4" size={40} />
        <p className="font-black uppercase tracking-widest text-xs">
          Syncing Portfolio...
        </p>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col h-full px-8 pb-20 overflow-y-auto relative"
      onClick={() => setOpenMenuId(null)}
    >
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

      {/* FIXED GRID: auto-fill prevents overlapping by forcing minimum width */}
      {filteredAssets.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6 mb-12">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              onClick={() =>
                navigate(`/portfolio/${asset.folder_name || asset.id}`)
              }
              className="contents"
            >
              <AssetCard
                asset={asset}
                isOpen={openMenuId === asset.id}
                onFavorite={handleFavorite}
                onMenuOpen={setOpenMenuId}
                onArchive={setArchiveTarget}
                onUnarchive={(id) => handleArchiveStatus(id, "active")}
              />
            </div>
          ))}
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

      {/* Modals & Drawers */}
      <ChatDrawer
        isOpen={isChatOpen}
        setIsOpen={setIsChatOpen}
        onAddAsset={() => setIsAddModalOpen(true)}
        onOpenDoc={(title) => handleOpenDocFromChat(title)}
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
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white dark:bg-[#1c2128] w-full max-w-sm rounded-[2rem] p-8 border border-slate-200 dark:border-white/10 shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mb-6 mx-auto">
              <AlertCircle size={32} />
            </div>
            <h2 className="text-xl font-bold dark:text-white mb-2">
              Archive Asset?
            </h2>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed">
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
                  handleArchiveStatus(archiveTarget.id, "archived")
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
