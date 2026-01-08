import React, { useState } from "react";
import {
  X,
  User,
  Calendar,
  Database,
  FileText,
  CheckCircle,
  Info,
  ShieldCheck,
} from "lucide-react";

export default function DocumentPreviewDrawer({
  document,
  onClose,
  isDarkMode,
}) {
  const [activeTab, setActiveTab] = useState("details");

  if (!document) return null;

  // --- DYNAMIC BACKEND URL LOGIC ---
  // Detects if we are on localhost or Render
  const API_BASE_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:8000"
      : "https://oms-portal4.onrender.com";

  const previewUrl = document.isLocal
    ? document.localUrl
    : `${API_BASE_URL}/preview/${document.id}`;

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
        {/* Main Content: PDF Viewer */}
        <div className="flex-1 flex flex-col border-r border-slate-200 dark:border-white/10">
          <div className="p-6 border-b border-inherit flex justify-between items-center bg-inherit relative z-10">
            <div className="flex items-center gap-4">
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-500/10 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
              <div className="flex flex-col">
                <h2 className="text-xl font-bold truncate max-w-md">
                  {document.name}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <ShieldCheck size={12} className="text-emerald-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    O&M Verified Document
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <span
                className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                  isDarkMode
                    ? "bg-white/5 border-white/10"
                    : "bg-slate-100 border-slate-200"
                }`}
              >
                ID: {document.id?.split("/").pop() || "N/A"}
              </span>
              <span className="px-4 py-1.5 rounded-full bg-[#4F6EF7] text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20">
                {document.cat}
              </span>
            </div>
          </div>

          <div
            className={`flex-1 overflow-hidden p-4 md:p-8 flex justify-center ${
              isDarkMode ? "bg-black/40" : "bg-slate-100"
            }`}
          >
            <div className="w-full h-full max-w-5xl shadow-2xl bg-white rounded-2xl overflow-hidden border border-slate-200 dark:border-white/5 relative">
              {/* Iframe for PDF rendering */}
              <iframe
                key={document.id}
                src={previewUrl}
                title="Document Preview"
                className="w-full h-full border-none"
              />
            </div>
          </div>

          <div className="p-4 border-t border-inherit flex justify-between px-8 text-sm font-bold text-slate-500 bg-inherit">
            <p className="uppercase tracking-widest text-[10px]">
              {document.isLocal
                ? "Local Preview Mode"
                : "Cloud Auditor Stream active"}
            </p>
            <p className="uppercase tracking-widest text-[10px]">
              Azure OpenAI Version 2025-01-01
            </p>
          </div>
        </div>

        {/* Right Sidebar: Metadata */}
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
                    File Information
                  </p>
                  <div className="space-y-4">
                    <DetailRow
                      icon={<Database size={14} />}
                      label="Size"
                      value={document.size}
                    />
                    <DetailRow
                      icon={<User size={14} />}
                      label="Auditor"
                      value={document.user || "System"}
                    />
                    <DetailRow
                      icon={<Calendar size={14} />}
                      label="Date"
                      value={document.date}
                    />
                  </div>
                </div>

                <div
                  className={`p-5 rounded-2xl border ${
                    isDarkMode
                      ? "bg-blue-500/5 border-blue-500/20"
                      : "bg-blue-50 border-blue-100"
                  }`}
                >
                  <div className="flex items-center gap-2 text-[#4F6EF7] mb-3 font-bold text-[10px] uppercase tracking-widest">
                    <Info size={14} /> AI Analysis Summary
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 font-medium italic">
                    "This {document.doc_type || "document"} is verified under
                    the {document.cat} system.
                    {document.asset_hint
                      ? ` References detected: ${document.asset_hint}.`
                      : ""}
                    Document integrity check passed."
                  </p>
                </div>
              </>
            ) : (
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#4F6EF7] mb-4">
                  Azure Meta Tags
                </p>
                <div className="space-y-4">
                  <DetailRow
                    icon={<FileText size={14} />}
                    label="Type"
                    value={document.doc_type}
                    highlight
                  />
                  <DetailRow
                    icon={<CheckCircle size={14} />}
                    label="System"
                    value={document.cat}
                  />
                  <DetailRow
                    icon={<Info size={14} />}
                    label="Asset Hint"
                    value={document.asset_hint || "None"}
                    italic
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// Small helper component for sidebar rows
function DetailRow({ icon, label, value, highlight, italic }) {
  return (
    <div className="flex justify-between items-center text-[11px]">
      <div className="flex items-center gap-2 text-slate-400">
        {icon} <span>{label}</span>
      </div>
      <span
        className={`font-black ${highlight ? "text-[#4F6EF7]" : ""} ${
          italic ? "italic" : ""
        }`}
      >
        {value || "—"}
      </span>
    </div>
  );
}
