import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Building2, Users, AlertCircle, Loader2 } from "lucide-react";
import AssetCard from "../components/AssetCard";
import AddAssetModal from "../components/AddAssetModal";
import ChatDrawer from "../components/ChatDrawer";
import DocumentPreviewModal from "../components/DocumentPreviewModal"; // Centered Pop-up version

export default function PortfolioPage({
  globalSearch,
  portfolioData,
  setPortfolioData,
  isChatOpen,
  setIsChatOpen,
  isDarkMode,
}) {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("All assets");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [archiveTarget, setArchiveTarget] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // State for the Centered Pop-up Previewer (Chat triggered)
  const [chatPreviewDoc, setChatPreviewDoc] = useState(null);

  // Helper to find a specific document by title for the AI Assistant
  const handleOpenDocFromChat = async (docTitle) => {
    try {
      const response = await fetch("http://localhost:8000/files");
      const allFiles = await response.json();

      // Find the file that matches the title provided by AI cards
      const match = allFiles.find(
        (f) =>
          f.filename.toLowerCase().includes(docTitle.toLowerCase()) ||
          docTitle.toLowerCase().includes(f.filename.toLowerCase())
      );

      if (match) {
        // Construct the full document object with metadata for the Modal
        const docObj = {
          id: match.document_id,
          name: match.filename,
          cat: match.system || "Document",
          doc_type: match.document_type || "General",
          asset_hint: match.asset_hint || "",
          date: "Verified",
          user: "System",
          size: "N/A", // Static for chat-triggered links
        };
        setChatPreviewDoc(docObj);
      } else {
        // Fallback: search for asset name if file search fails
        const assetMatch = portfolioData.assets.find((a) =>
          a.name.toLowerCase().includes(docTitle.toLowerCase())
        );
        if (assetMatch) {
          navigate(`/portfolio/${assetMatch.id}`);
          setIsChatOpen(false); // Close chat to show the asset page
        }
      }
    } catch (err) {
      console.error("Error searching for document from chat:", err);
    }
  };

  const handleConfirmAdd = (newAssetData) => {
    const assetId = `new-${Date.now()}`;
    const assetObj = {
      ...newAssetData,
      id: assetId,
      docs: 0,
      toDos: 0,
      status: "active",
      isFavorite: false,
      img:
        newAssetData.image ||
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab",
      location: newAssetData.location || "Unknown Location",
      type: "Commercial use",
    };

    setPortfolioData((prev) => ({
      ...prev,
      assets: [assetObj, ...prev.assets],
      stats: { ...prev.stats, properties: prev.stats.properties + 1 },
    }));

    setIsAddModalOpen(false);
    navigate(`/portfolio/${assetId}`);
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

  const filteredAssets = portfolioData.assets.filter((a) => {
    const searchTerm = globalSearch?.toLowerCase() || "";
    const matchesSearch =
      (a.name?.toLowerCase() || "").includes(searchTerm) ||
      (a.location?.toLowerCase() || "").includes(searchTerm);
    if (!matchesSearch) return false;
    if (activeFilter === "Favorites")
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
      {/* 1. Header & Stats */}
      <div className="flex justify-between items-end mb-10 mt-4 shrink-0">
        <div>
          <h1 className="text-4xl font-black dark:text-white text-slate-900 mb-3 tracking-tight">
            Portfolio
          </h1>
          <div className="flex gap-2">
            <span className="bg-slate-200 dark:bg-white/10 text-slate-500 text-[10px] font-bold px-2 py-1 rounded-md uppercase">
              {portfolioData.stats.companies} Companies
            </span>
            <span className="bg-slate-200 dark:bg-white/10 text-slate-500 text-[10px] font-bold px-2 py-1 rounded-md uppercase">
              {portfolioData.stats.properties} Properties
            </span>
            <span className="bg-slate-200 dark:bg-white/10 text-slate-500 text-[10px] font-bold px-2 py-1 rounded-md uppercase">
              {portfolioData.stats.docs} Total documents
            </span>
          </div>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-[#4F6EF7] text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus size={18} /> Add asset
        </button>
      </div>

      <div className="flex items-center gap-2 mb-6 text-slate-900 dark:text-white font-bold text-lg shrink-0">
        <Building2 size={20} className="text-[#4F6EF7]" /> My Assets
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-3 mb-8 overflow-x-auto no-scrollbar shrink-0">
        {["All assets", "Favorites", "Archived"].map((f) => (
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

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
        {filteredAssets.map((asset) => (
          <div
            key={asset.id}
            onClick={() => navigate(`/portfolio/${asset.id}`)}
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

      {/* Chat Assistant Component */}
      <ChatDrawer
        isOpen={isChatOpen}
        setIsOpen={setIsChatOpen}
        onAddAsset={() => setIsAddModalOpen(true)}
        onOpenDoc={handleOpenDocFromChat}
      />

      {/* CENTERED POP-UP PREVIEWER (Triggered from Chat) */}
      {chatPreviewDoc && (
        <DocumentPreviewModal
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
          <div className="bg-white dark:bg-[#1c2128] w-full max-w-sm rounded-[2rem] p-8 border border-slate-200 dark:border-white/10 shadow-2xl">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mb-6 mx-auto">
              <AlertCircle size={32} />
            </div>
            <h2 className="text-xl font-bold text-center dark:text-white mb-2">
              Archive Asset?
            </h2>
            <p className="text-center text-slate-500 text-sm mb-8">
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
