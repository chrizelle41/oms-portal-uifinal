import React, { useState, useEffect } from "react";
import {
  X,
  Database,
  User,
  Calendar,
  Info,
  FileText,
  Loader2,
} from "lucide-react";

export default function DocumentPreviewDrawer({
  document,
  onClose,
  isDarkMode,
}) {
  const [activeTab, setActiveTab] = useState("details");
  const [isIframeLoading, setIsIframeLoading] = useState(true);

  // Reset loading state whenever the document changes
  useEffect(() => {
    setIsIframeLoading(true);
  }, [document?.document_id, document?.id]);

  if (!document) return null;

  const API_BASE_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:8000"
      : "https://oms-portal4-1.onrender.com";

  const docId = document.document_id || document.id;
  const displayName = document.filename || document.name || "Unknown Document";

  const previewUrl = document.isLocal
    ? document.localUrl
    : `${API_BASE_URL}/direct_preview/${encodeURIComponent(docId)}`;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] animate-in fade-in duration-300"
        onClick={onClose}
      />

      <div
        className={`fixed top-0 right-0 h-full w-[90%] max-w-7xl shadow-2xl z-[201] flex animate-in slide-in-from-right duration-500 ease-out overflow-hidden ${
          isDarkMode ? "bg-[#0B0F1A] text-white" : "bg-white text-slate-900"
        }`}
      >
        <div className="flex-1 flex flex-col border-r border-slate-200 dark:border-white/10">
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
            <span className="px-4 py-1.5 rounded-full bg-[#4F6EF7] text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20">
              {document.system || document.cat || "General"}
            </span>
          </div>

          <div
            className={`flex-1 overflow-hidden p-4 md:p-8 flex justify-center relative ${
              isDarkMode ? "bg-black/40" : "bg-slate-100"
            }`}
          >
            <div className="w-full h-full max-w-5xl shadow-2xl bg-white rounded-2xl overflow-hidden border border-slate-200 dark:border-white/5 relative">
              {/* LOADING SPINNER */}
              {isIframeLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 z-10 text-center p-4">
                  <Loader2 className="w-10 h-10 animate-spin text-[#4F6EF7] mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                    Retrieving from Secure Server...
                  </p>
                </div>
              )}

              {docId ? (
                <iframe
                  key={docId}
                  src={previewUrl}
                  onLoad={() => setIsIframeLoading(false)}
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

        <div
          className={`w-80 shrink-0 flex flex-col ${
            isDarkMode ? "bg-[#0B0F1A]" : "bg-slate-50/50"
          }`}
        >
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
                  </p>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#4F6EF7] mb-4">
                  Technical Metadata
                </p>
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
            )}
          </div>
        </div>
      </div>
    </>
  );
}

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
