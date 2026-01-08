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

/**
 * CONFIGURATION:
 * Switches between local development and your live Render backend.
 * Ensure your backend on Render is named 'oms-portal4'.
 */
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

  // --- GLOBAL PREVIEW STATE ---
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
    const fetchData = async () => {
      setLoading(true);
      try {
        const [filesRes, portfolioRes] = await Promise.all([
          fetch(`${API_BASE_URL}/files`),
          fetch(`${API_BASE_URL}/portfolio`),
        ]);

        if (!filesRes.ok || !portfolioRes.ok)
          throw new Error("Server responded with error");

        const filesData = await filesRes.json();
        const resData = await portfolioRes.json();

        setFiles(filesData);

        const initializedAssets = (resData.assets || []).map((a) => ({
          ...a,
          isFavorite: false,
          status: a.status || "active",
          type: a.type || "Commercial use",
        }));

        setPortfolioData({
          stats: resData.stats || { companies: 0, properties: 0, docs: 0 },
          assets: initializedAssets,
        });
      } catch (err) {
        console.error("Critical: Database sync failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- SHARED PREVIEW LOGIC ---
  const handleOpenPreview = (file) => {
    setSelectedDoc({
      id: file.document_id,
      name: file.filename,
      cat: file.system || "Document",
      doc_type: file.document_type || "General",
      size: file.size || "N/A",
      user: file.user || "System",
      date: file.date || "Verified",
      asset_hint: file.asset_hint || "",
      isLocal: false,
      // Pass the API_BASE_URL to the drawer for PDF fetching
      previewUrl: `${API_BASE_URL}/preview/${file.document_id}`,
    });
  };

  const handleOpenDocFromChat = async (docTitle) => {
    try {
      const response = await fetch(`${API_BASE_URL}/files`);
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
        handleOpenPreview(match);
      } else {
        console.error("Chat matching failed for:", docTitle);
      }
    } catch (err) {
      console.error("Chat trigger error:", err);
    }
  };

  const stats = useMemo(
    () => ({
      totalDocs: files.length,
      buildings: [...new Set(files.map((f) => f.building))].length,
      systems: [...new Set(files.map((f) => f.system))].filter(Boolean).length,
      assets: files.filter((f) => f.asset_hint).length,
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
                      globalSearch={globalSearch}
                      portfolioData={portfolioData}
                      setPortfolioData={setPortfolioData}
                      isDarkMode={isDarkMode}
                      onPreview={handleOpenPreview}
                      apiBase={API_BASE_URL} // Passing API base for folder operations
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
                      apiBase={API_BASE_URL} // Passing API base for asset operations
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
              apiBase={API_BASE_URL} // Pass this to ChatDrawer so it can call /ask
            />
          </div>
        </div>

        {/* --- GLOBAL PREVIEW DRAWER --- */}
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
