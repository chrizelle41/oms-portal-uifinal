import React, { useState } from "react";
import {
  X,
  Database,
  User,
  Calendar,
  Info,
  FileText,
  Download,
} from "lucide-react";

export default function DocumentPreviewDrawer({
  document,
  onClose,
  isDarkMode,
}) {
  const [activeTab, setActiveTab] = useState("details");

  if (!document) return null;

  // --- DYNAMIC BACKEND URL ---
  const API_BASE_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:8000"
      : "https://oms-portal4-1.onrender.com";

  // --- DATA NORMALIZATION ---
  // Ensure we capture the ID regardless of whether the backend sends 'id' or 'document_id'
  const docId = document.document_id || document.id;

  // Ensure we have a display name
  const displayName = document.filename || document.name || "Unknown Document";

  // Safeguard the URL with encoding for folders/special characters
  const previewUrl = document.isLocal
    ? document.localUrl
    : `${API_BASE_URL}/preview/${encodeURIComponent(docId)}`;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-[90%] max-w-7xl shadow-2xl z-[201] flex animate-in slide-in-from-right duration-500 ease-out overflow-hidden ${
          isDarkMode ? "bg-[#0B0F1A] text-white" : "bg-white text-slate-900"
        }`}
      >
        {/* Main Preview Section */}
        <div className="flex-1 flex flex-col border-r border-slate-200 dark:border-white/10">
          {/* Header */}
          <div className="p-6 border-b border-inherit flex justify-between items-center bg-inherit relative z-10">
            <div className="flex items-center gap-4 min-w-0">
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-500/10 rounded-full transition-colors"
              >
                <X size={24} />
              </button>

              <h2 className="text-xl font-bold truncate max-w-md">
                {displayName}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <a
                href={previewUrl}
                download
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl bg-slate-500/10 text-slate-400 hover:text-[#4F6EF7] transition-colors"
                title="Download File"
              >
                <Download size={20} />
              </a>
              <span className="px-4 py-1.5 rounded-full bg-[#4F6EF7] text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20">
                {document.system || document.cat || "General"}
              </span>
            </div>
          </div>

          {/* Iframe Viewport */}
          <div
            className={`flex-1 overflow-hidden p-4 md:p-8 flex justify-center ${
              isDarkMode ? "bg-black/40" : "bg-slate-100"
            }`}
          >
            <div className="w-full h-full max-w-5xl shadow-2xl bg-white rounded-2xl overflow-hidden border border-slate-200 dark:border-white/5">
              {docId ? (
                <iframe
                  key={docId} // Using docId as key forces refresh when switching files
                  src={previewUrl}
                  title="Document Preview"
                  className="w-full h-full border-none"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400 font-bold uppercase tracking-widest text-xs">
                  Unable to load document path
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div
          className={`w-80 shrink-0 flex flex-col ${
            isDarkMode ? "bg-[#0B0F1A]" : "bg-slate-50/50"
          }`}
        >
          {/* Tabs */}
          <div className="flex p-3 gap-2 border-b border-slate-200 dark:border-white/10">
            <button
              onClick={() => setActiveTab("details")}
              className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                activeTab === "details"
                  ? "bg-[#4F6EF7] text-white shadow-lg"
                  : "text-slate-400 hover:bg-slate-500/10"
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab("metadata")}
              className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                activeTab === "metadata"
                  ? "bg-[#4F6EF7] text-white shadow-lg"
                  : "text-slate-400 hover:bg-slate-500/10"
              }`}
            >
              Metadata
            </button>
          </div>

          {/* Sidebar Content */}
          <div className="p-8 space-y-8 overflow-y-auto no-scrollbar">
            {activeTab === "details" ? (
              <>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#4F6EF7] mb-4">
                    File Details
                  </p>
                  <div className="space-y-4">
                    <DetailRow
                      icon={<Database size={14} />}
                      label="File Size"
                      value={document.size || "Analyzing..."}
                    />
                    <DetailRow
                      icon={<User size={14} />}
                      label="Source"
                      value={document.user || "O&M Cloud"}
                    />
                    <DetailRow
                      icon={<Calendar size={14} />}
                      label="Last Modified"
                      value={document.date || "Verified"}
                    />
                  </div>
                </div>

                <div
                  className={`p-5 rounded-2xl border ${
                    isDarkMode
                      ? "bg-white/5 border-white/10"
                      : "bg-white border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2 text-slate-500 mb-3 font-bold text-[10px] uppercase tracking-widest">
                    <Info size={14} /> Description
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 font-medium italic">
                    This{" "}
                    {document.document_type || document.doc_type || "document"}{" "}
                    is part of the{" "}
                    {document.system || document.cat || "General"} database.
                    {document.asset_hint
                      ? ` Cross-reference: ${document.asset_hint}.`
                      : ""}
                  </p>
                </div>
              </>
            ) : (
              <>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#4F6EF7] mb-4">
                  Technical Metadata
                </p>
                <div className="space-y-4">
                  <DetailRow
                    icon={<FileText size={14} />}
                    label="Doc Type"
                    value={document.document_type || document.doc_type}
                    highlight
                  />
                  <DetailRow
                    icon={<Info size={14} />}
                    label="System"
                    value={document.system || document.cat}
                  />
                  <DetailRow
                    icon={<Info size={14} />}
                    label="Internal ID"
                    value={docId}
                    italic
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/* Helper Component */
function DetailRow({ icon, label, value, highlight, italic }) {
  return (
    <div className="flex justify-between items-center text-[11px]">
      <div className="flex items-center gap-2 text-slate-400">
        {icon}
        <span>{label}</span>
      </div>
      <span
        className={`font-black truncate max-w-[120px] text-right ${
          highlight ? "text-[#4F6EF7]" : "text-slate-600 dark:text-slate-300"
        } ${italic ? "italic text-[9px]" : ""}`}
      >
        {value || "—"}
      </span>
    </div>
  );
}
