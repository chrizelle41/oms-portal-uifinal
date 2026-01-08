import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit2,
  Upload,
  FileText,
  Loader2,
  Trash2,
  Camera,
  Globe,
  Check,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function AssetDetailsPage({
  isDarkMode,
  portfolioData,
  setPortfolioData,
  onPreview,
  apiBase, // <--- Received from App.jsx
}) {
  const { assetId } = useParams();
  const navigate = useNavigate();
  const bannerInputRef = useRef(null);

  const currentAsset = portfolioData.assets.find(
    (a) => String(a.id) === String(assetId)
  );

  // States
  const [tempName, setTempName] = useState("");
  const [tempImg, setTempImg] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [localDocs, setLocalDocs] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // UI States
  const [showDeleteAssetModal, setShowDeleteAssetModal] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);

  // Initial Data Fetch
  useEffect(() => {
    if (currentAsset) {
      setTempName(currentAsset.name);
      setTempImg(currentAsset.img);

      const fetchRealFiles = async () => {
        setIsSyncing(true);
        try {
          // UPDATED: Use dynamic apiBase
          const response = await fetch(
            `${apiBase}/portfolio/${currentAsset.folder_name}/docs`
          );
          if (!response.ok) throw new Error("Failed to read directory");

          const filesFromFolder = await response.json();
          setLocalDocs(filesFromFolder);
        } catch (error) {
          console.error("Folder read error:", error);
        } finally {
          setIsSyncing(false);
        }
      };

      fetchRealFiles();
    }
  }, [currentAsset, apiBase]);

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = localDocs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(localDocs.length / itemsPerPage);

  if (!currentAsset)
    return (
      <div className="p-20 text-center font-bold text-slate-500">
        Asset not found.
      </div>
    );

  // --- UPDATED: FILE UPLOAD LOGIC ---
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !currentAsset?.folder_name) {
      alert("Error: Asset folder not initialized correctly.");
      return;
    }

    const tempId = Date.now();
    const processingDoc = {
      id: tempId,
      name: file.name,
      lang: "EN",
      cat: "AI Analyzing...",
      status: "Processing",
      date: new Date().toISOString().split("T")[0],
      user: "System",
      isLocal: true,
    };

    setLocalDocs((prev) => [processingDoc, ...prev]);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder_name", currentAsset.folder_name);

    try {
      // UPDATED: Use dynamic apiBase for classify-document (Azure OpenAI route)
      const response = await fetch(`${apiBase}/classify-document`, {
        method: "POST",
        body: formData,
      });
      const result = await response.json();

      setLocalDocs((prev) =>
        prev.map((doc) =>
          doc.id === tempId
            ? {
                ...doc,
                id: result.document_id,
                name: result.name,
                cat: result.category,
                doc_type: result.document_type || "Document",
                asset_hint: result.asset_hint || "None",
                size: result.size || "N/A",
                status: "Verified",
                isLocal: false,
              }
            : doc
        )
      );
    } catch (error) {
      console.error("Upload error:", error);
      // Remove the temp doc on error
      setLocalDocs((prev) => prev.filter((d) => d.id !== tempId));
    }
  };

  // --- UPDATED: UPDATE ASSET LOGIC ---
  const handleFinishEditing = async () => {
    try {
      const response = await fetch(
        `${apiBase}/portfolio/assets/${currentAsset.folder_name}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: tempName,
            image: tempImg,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to update asset");

      setPortfolioData((prev) => ({
        ...prev,
        assets: prev.assets.map((a) =>
          String(a.id) === String(assetId)
            ? { ...a, name: tempName, img: tempImg }
            : a
        ),
      }));

      setIsEditing(false);
    } catch (error) {
      console.error("Error updating asset:", error);
      alert("Could not save changes to the server.");
    }
  };

  // --- UPDATED: DELETE ASSET LOGIC ---
  const confirmDeleteAsset = async () => {
    try {
      const response = await fetch(
        `${apiBase}/portfolio/assets/${currentAsset.folder_name}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        setPortfolioData((prev) => ({
          ...prev,
          assets: prev.assets.filter((a) => String(a.id) !== String(assetId)),
          stats: {
            ...prev.stats,
            properties: Math.max(0, prev.stats.properties - 1),
          },
        }));
        navigate("/portfolio");
      } else {
        alert("Failed to delete asset from server.");
      }
    } catch (error) {
      console.error("Failed to delete asset:", error);
    }
  };

  // --- UPDATED: DELETE DOCUMENT LOGIC ---
  const handleDeleteDocument = async () => {
    if (!docToDelete) return;

    try {
      const response = await fetch(
        `${apiBase}/portfolio/${currentAsset.folder_name}/docs/${docToDelete.name}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        setLocalDocs((prev) => prev.filter((d) => d.id !== docToDelete.id));
        setDocToDelete(null);
      } else {
        alert("Failed to delete document from server.");
      }
    } catch (error) {
      console.error("Failed to delete document:", error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen animate-in fade-in duration-500 pb-20 max-w-full overflow-x-hidden relative">
      {/* 1. Header Actions */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <button
          onClick={() => navigate("/portfolio")}
          className="flex items-center gap-2 text-slate-500 hover:text-[#4F6EF7] font-bold text-sm transition-colors"
        >
          <ArrowLeft size={16} /> Back to Portfolio
        </button>
        <button
          onClick={() => setShowDeleteAssetModal(true)}
          className="flex items-center gap-2 bg-red-500/10 text-red-500 px-5 py-2 rounded-xl font-bold text-sm hover:bg-red-500 hover:text-white transition-all active:scale-95"
        >
          <Trash2 size={18} /> Delete Asset
        </button>
      </div>

      {/* 2. Hero Banner Section */}
      <div className="relative h-72 rounded-[3rem] overflow-hidden mb-10 shadow-2xl shrink-0 bg-slate-800">
        <img
          src={tempImg}
          className={`w-full h-full object-cover opacity-80 transition-all duration-700 ${
            isEditing ? "brightness-50" : "group-hover:scale-105"
          }`}
          alt="Banner"
        />
        {isEditing && (
          <button
            onClick={() => bannerInputRef.current.click()}
            className="absolute top-8 right-8 p-4 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-[#4F6EF7] transition-all z-20 shadow-xl"
          >
            <Camera size={24} />
          </button>
        )}
        <input
          type="file"
          ref={bannerInputRef}
          hidden
          accept="image/*"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              setTempImg(URL.createObjectURL(e.target.files[0]));
            }
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex items-end p-12">
          <div className="flex justify-between items-end w-full">
            <div className="flex flex-col gap-2 w-full max-w-3xl">
              {isEditing ? (
                <div className="space-y-3">
                  <input
                    autoFocus
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="text-4xl font-black text-white bg-white/10 border-b-2 border-[#4F6EF7] outline-none w-full px-2 rounded-md"
                  />
                </div>
              ) : (
                <h2 className="text-5xl font-black text-white leading-tight">
                  {tempName}
                </h2>
              )}
              <button
                onClick={() =>
                  isEditing ? handleFinishEditing() : setIsEditing(true)
                }
                className="mt-4 w-fit flex items-center gap-2 text-sm font-bold text-[#4F6EF7] hover:text-white transition-colors"
              >
                {isEditing ? <Check size={18} /> : <Edit2 size={18} />}
                {isEditing ? "Finish Editing" : "Edit Name & Image"}
              </button>
            </div>
            <label className="flex items-center gap-3 bg-[#4F6EF7] hover:bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold cursor-pointer shadow-xl transition-all active:scale-95">
              <Upload size={22} /> Upload files
              <input type="file" hidden onChange={handleFileUpload} />
            </label>
          </div>
        </div>
      </div>

      {/* 3. Paginated Documents Table */}
      <div
        className={`rounded-[3rem] border flex flex-col ${
          isDarkMode
            ? "bg-white/[0.03] border-white/10"
            : "bg-white border-slate-200 shadow-2xl"
        }`}
      >
        <div className="p-10 border-b border-inherit flex justify-between items-center sticky top-0 bg-inherit z-10 rounded-t-[3rem]">
          <h3 className="text-2xl font-bold dark:text-white">Documents</h3>
          <div className="flex items-center gap-4">
            <span className="bg-slate-500/10 text-slate-500 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
              {localDocs.length} Total
            </span>
            {isSyncing && (
              <Loader2 className="animate-spin text-blue-500" size={24} />
            )}
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left table-auto">
            <thead
              className={`text-xs font-black uppercase tracking-widest ${
                isDarkMode ? "text-slate-500" : "text-slate-400"
              }`}
            >
              <tr className="border-b border-inherit">
                <th className="px-10 py-6">File name</th>
                <th className="px-10 py-6">Language</th>
                <th className="px-10 py-6">AI Category</th>
                <th className="px-10 py-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-inherit">
              {currentItems.length > 0 ? (
                currentItems.map((doc) => (
                  <tr
                    key={doc.id}
                    onClick={() =>
                      onPreview({
                        document_id: doc.id,
                        filename: doc.name,
                        system: doc.cat,
                        document_type: doc.doc_type || "Document",
                        size: doc.size || "N/A",
                        user: doc.user || "System",
                        date: doc.date || "Verified",
                        asset_hint: doc.asset_hint || "None",
                      })
                    }
                    className="group hover:bg-slate-500/5 transition-colors cursor-pointer"
                  >
                    <td className="px-10 py-8 max-w-md">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-xl text-[#4F6EF7] shrink-0">
                          <FileText size={24} />
                        </div>
                        <span className="font-bold text-lg dark:text-slate-200 truncate">
                          {doc.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-slate-500 font-bold">
                      <div className="flex items-center gap-2">
                        <Globe size={16} /> {doc.lang || "EN"}
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <span
                        className={`px-4 py-2 rounded-full text-xs font-black uppercase ${
                          doc.cat === "HVAC"
                            ? "bg-blue-500/10 text-blue-500"
                            : doc.cat === "Electrical"
                            ? "bg-yellow-500/10 text-yellow-500"
                            : doc.cat === "Fire"
                            ? "bg-red-500/10 text-red-500"
                            : doc.cat === "Plumbing"
                            ? "bg-green-500/10 text-green-500"
                            : "bg-slate-500/10 text-slate-500"
                        }`}
                      >
                        {doc.cat}
                      </span>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDocToDelete(doc);
                        }}
                        className="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 size={22} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-10 py-24 text-center">
                    <p className="text-slate-400 font-bold">
                      No files uploaded
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-8 border-t border-inherit flex justify-between items-center bg-inherit rounded-b-[3rem]">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex gap-3">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="p-3 rounded-xl border border-inherit disabled:opacity-30 dark:text-white hover:bg-slate-500/10 transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="p-3 rounded-xl border border-inherit disabled:opacity-30 dark:text-white hover:bg-slate-500/10 transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* --- MODALS (Unchanged Logic, purely UI) --- */}
      {showDeleteAssetModal && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowDeleteAssetModal(false)}
        >
          <div
            className="bg-white dark:bg-[#1c2128] w-full max-w-sm rounded-[2rem] p-8 border border-slate-200 shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 bg-red-100 dark:bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mb-6 mx-auto">
              <AlertCircle size={32} />
            </div>
            <h2 className="text-xl font-bold text-center dark:text-white mb-2">
              Delete Asset?
            </h2>
            <p className="text-center text-slate-500 text-sm mb-8 leading-relaxed">
              Are you sure you want to delete <b>{tempName}</b>? This cannot be
              undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteAssetModal(false)}
                className="flex-1 py-3 rounded-xl font-bold text-sm text-slate-500 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteAsset}
                className="flex-1 py-3 rounded-xl font-bold text-sm bg-red-500 text-white shadow-lg hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {docToDelete && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setDocToDelete(null)}
        >
          <div
            className="bg-white dark:bg-[#1c2128] w-full max-w-sm rounded-[2rem] p-8 border border-slate-200 shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 bg-red-100 dark:bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mb-6 mx-auto">
              <Trash2 size={32} />
            </div>
            <h2 className="text-xl font-bold text-center dark:text-white mb-2">
              Remove Document?
            </h2>
            <p className="text-center text-slate-500 text-sm mb-8 leading-relaxed">
              Remove <b>{docToDelete.name}</b>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDocToDelete(null)}
                className="flex-1 py-3 rounded-xl font-bold text-sm text-slate-500 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteDocument}
                className="flex-1 py-3 rounded-xl font-bold text-sm bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
