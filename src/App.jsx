import React, { useEffect, useState, useMemo } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Components
import Sidebar from "./components/Sidebar";
import Topbar from "./components/TopBar";
import ChatDrawer from "./components/ChatDrawer";
import DocumentPreviewDrawer from "./components/DocumentPreviewDrawer";

// Pages
import DashboardPage from "./pages/DashboardPage";
import AllFilesPage from "./pages/AllFilesPage";
import PortfolioPage from "./pages/PortfolioPage";
import AssetDetailsPage from "./pages/AssetDetailsPage";

const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:8000"
    : "https://oms-portal4-1.onrender.com";

export default function App() {
  const [files, setFiles] = useState([]);
  const [portfolioData, setPortfolioData] = useState({
    stats: { companies: 0, properties: 0, docs: 0 },
    assets: [],
  });
  const [loading, setLoading] = useState(true);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [globalSearch, setGlobalSearch] = useState("");
  const [selectedDoc, setSelectedDoc] = useState(null);

  // Theme Logic
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Data Loading Logic
  useEffect(() => {
    // Inside App.jsx
    const fetchData = async () => {
      setLoading(true);
      try {
        const [filesRes, portfolioRes] = await Promise.all([
          fetch(`${API_BASE_URL}/files`),
          fetch(`${API_BASE_URL}/portfolio`),
        ]);

        if (!filesRes.ok || !portfolioRes.ok)
          throw new Error("API Response Error");

        const filesData = await filesRes.json();
        const resData = await portfolioRes.json();

        setFiles(Array.isArray(filesData) ? filesData : []);

        // --- CRITICAL CLEANING STEP ---
        const rawAssets = Array.isArray(resData?.assets) ? resData.assets : [];

        const cleanedAssets = rawAssets
          .filter((a) => a !== null && typeof a === "object") // Remove null entries
          .map((a) => {
            // Find ANY possible identifier to use as folder_name
            const fallbackId =
              a.id || a.name || Math.random().toString(36).substr(2, 9);

            return {
              ...a,
              // If folder_name is missing, the app crashes. We MUST ensure it exists.
              folder_name: a.folder_name || a.prefix || a.path || fallbackId,
              name: a.name || a.folder_name || "Unnamed Asset",
              id: a.id || a.folder_name || fallbackId,
              status: a.status || "active",
              isFavorite: !!a.isFavorite,
              docs: a.docs || 0,
            };
          })
          .filter((a) => a.folder_name); // Final safety check: must have a folder_name

        setPortfolioData({
          stats: resData?.stats || { companies: 0, properties: 0, docs: 0 },
          assets: cleanedAssets,
        });
      } catch (err) {
        console.error("Critical: Sync failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- PREVIEW LOGIC ---
  const handleOpenPreview = (file) => {
    if (!file) return;
    setSelectedDoc({
      id: file?.document_id || file?.id,
      name: file?.filename || file?.name,
      cat: file?.system || file?.cat || "Document",
      doc_type: file?.document_type || file?.doc_type || "General",
      size: file?.size || "N/A",
      user: file?.user || "System",
      date: file?.date || "Verified",
      asset_hint: file?.asset_hint || "",
      isLocal: false,
      previewUrl:
        file?.previewUrl ||
        `${API_BASE_URL}/preview/${encodeURIComponent(
          file?.document_id || file?.id
        )}`,
    });
  };

  const handleOpenDocFromChat = async (docTitle) => {
    try {
      const cleanTitle = docTitle.toLowerCase().trim();
      const match = files.find((f) => {
        const fname = (f?.filename || f?.name || "").toLowerCase();
        return (
          fname.includes(cleanTitle) ||
          cleanTitle.includes(fname.replace(".pdf", ""))
        );
      });
      if (match) {
        handleOpenPreview(match);
      }
    } catch (err) {
      console.error("Chat trigger error:", err);
    }
  };

  // --- STATS CALCULATION ---
  const stats = useMemo(
    () => ({
      totalDocs: files?.length || 0,
      buildings: [
        ...new Set(
          files?.map(
            (f) =>
              f?.building || f?.folder_name || (f?.id && f.id.split("/")[1])
          )
        ),
      ].filter(Boolean).length,
      systems: [...new Set(files?.map((f) => f?.system || f?.cat))].filter(
        Boolean
      ).length,
      assets: files?.filter((f) => f?.asset_hint)?.length || 0,
    }),
    [files]
  );

  return (
    <Router>
      <div
        className={`flex h-screen w-full transition-colors duration-300 font-sans relative ${
          isDarkMode
            ? "bg-[#030712] text-slate-200"
            : "bg-slate-50 text-slate-900"
        }`}
      >
        <Sidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
        />
        <div className="flex-1 flex overflow-hidden relative">
          <main
            className={`flex-1 flex flex-col min-w-0 relative z-10 transition-all duration-300 ease-in-out border-r ${
              isDarkMode ? "border-white/5" : "border-slate-200"
            }`}
          >
            <Topbar
              isAiOpen={isAiOpen}
              setIsAiOpen={setIsAiOpen}
              isDarkMode={isDarkMode}
              searchQuery={globalSearch}
              setSearchQuery={setGlobalSearch}
            />
            <div className="flex-1 overflow-y-auto p-8 relative no-scrollbar">
              <Routes>
                <Route
                  path="/"
                  element={<Navigate to="/dashboard" replace />}
                />
                <Route
                  path="/dashboard"
                  element={<DashboardPage stats={stats} loading={loading} />}
                />
                <Route
                  path="/all-files"
                  element={
                    <AllFilesPage
                      files={files}
                      loading={loading}
                      isDarkMode={isDarkMode}
                      onPreview={handleOpenPreview}
                      globalSearch={globalSearch}
                    />
                  }
                />
                <Route
                  path="/portfolio"
                  element={
                    <PortfolioPage
                      loading={loading}
                      globalSearch={globalSearch}
                      portfolioData={portfolioData}
                      setPortfolioData={setPortfolioData}
                      isDarkMode={isDarkMode}
                      onPreview={handleOpenPreview}
                      apiBase={API_BASE_URL}
                    />
                  }
                />
                <Route
                  path="/portfolio/:assetId"
                  element={
                    <AssetDetailsPage
                      isDarkMode={isDarkMode}
                      portfolioData={portfolioData}
                      setPortfolioData={setPortfolioData}
                      onPreview={handleOpenPreview}
                      apiBase={API_BASE_URL}
                    />
                  }
                />
              </Routes>
            </div>
          </main>

          <div
            className={`transition-all duration-300 ease-in-out overflow-hidden border-l backdrop-blur-2xl ${
              isAiOpen ? "w-96 opacity-100" : "w-0 opacity-0 border-none"
            } ${
              isDarkMode
                ? "border-white/10 bg-black/20"
                : "border-slate-200 bg-white/80"
            }`}
          >
            <ChatDrawer
              isOpen={isAiOpen}
              setIsOpen={setIsAiOpen}
              onOpenDoc={handleOpenDocFromChat}
              apiBase={API_BASE_URL}
            />
          </div>
        </div>

        {selectedDoc && (
          <DocumentPreviewDrawer
            document={selectedDoc}
            onClose={() => setSelectedDoc(null)}
            isDarkMode={isDarkMode}
          />
        )}
      </div>
    </Router>
  );
}
