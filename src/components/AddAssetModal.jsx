import React, { useState, useRef } from "react";
import { X, Image as ImageIcon } from "lucide-react";

export default function AddAssetModal({ isOpen, onClose, onConfirm }) {
  const [newAsset, setNewAsset] = useState({
    name: "",
    type: "Commercial use",
    image: null,
    imageFile: null, // <--- Add this to store the actual File object
  });
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewAsset({
        ...newAsset,
        image: URL.createObjectURL(file), // For the UI preview
        imageFile: file, // For the actual backend upload
      });
    }
  };

  const handleConfirm = () => {
    if (!newAsset.name) return alert("Please enter an asset name");

    // Pass the whole object back to PortfolioPage
    onConfirm(newAsset);

    // Reset state
    setNewAsset({
      name: "",
      type: "Commercial use",
      image: null,
      imageFile: null,
    });
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1c2128] w-full max-w-lg rounded-[2.5rem] p-8 border border-slate-200 dark:border-white/10 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black dark:text-white">New asset</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full text-slate-400 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          <div
            onClick={() => fileInputRef.current.click()}
            className="w-full h-40 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-[#4F6EF7] transition-all bg-slate-50 dark:bg-white/[0.02] overflow-hidden group"
          >
            {newAsset.image ? (
              <img
                src={newAsset.image}
                className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
                alt="Preview"
              />
            ) : (
              <>
                <ImageIcon size={32} className="text-slate-400 mb-2" />
                <span className="text-sm font-bold text-slate-500 uppercase tracking-wider text-center px-4">
                  Choose a cover image
                </span>
              </>
            )}
            <input
              type="file"
              ref={fileInputRef}
              hidden
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2 mb-2 block">
                Asset Name
              </label>
              <input
                type="text"
                placeholder="e.g. Virtual Viewing"
                className="w-full px-5 py-4 bg-slate-100 dark:bg-white/5 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[#4F6EF7]/50 dark:text-white placeholder:text-slate-400"
                value={newAsset.name}
                onChange={(e) =>
                  setNewAsset({ ...newAsset, name: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              onClick={onClose}
              className="flex-1 py-4 rounded-2xl font-bold text-slate-500 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 py-4 rounded-2xl font-bold bg-[#4F6EF7] text-white shadow-lg shadow-blue-500/20 hover:bg-blue-600 active:scale-95 transition-all"
            >
              Create Asset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
