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
import LoginPage from "./pages/LoginPage"; // <--- Importing your external file
import DashboardPage from "./pages/DashboardPage";
import AllFilesPage from "./pages/AllFilesPage";
import PortfolioPage from "./pages/PortfolioPage";
import AssetDetailsPage from "./pages/AssetDetailsPage";

const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:8000"
    : "https://oms-portal4-1.onrender.com";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginError, setLoginError] = useState("");

  // App State
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

  useEffect(() => {
    const session = localStorage.getItem("vv_session");
    if (session === "active") setIsAuthenticated(true);
    setAuthLoading(false);
  }, []);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [isDarkMode]);

  // Data Fetching
  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [filesRes, portfolioRes] = await Promise.all([
          fetch(`${API_BASE_URL}/files`),
          fetch(`${API_BASE_URL}/portfolio`),
        ]);
        const filesData = await filesRes.json();
        const resData = await portfolioRes.json();
        setFiles(filesData);
        setPortfolioData({
          stats: resData.stats || { companies: 0, properties: 0, docs: 0 },
          assets: (resData.assets || []).map((a) => ({
            ...a,
            isFavorite: false,
          })),
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAuthenticated]);

  // Logic passed TO the LoginPage
  const handleLogin = async (email, password) => {
    setLoginError("");
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (response.ok && data.status === "success") {
        setIsAuthenticated(true);
        localStorage.setItem("vv_session", "active");
      } else {
        setLoginError("Access Denied: Use the correct email and password.");
      }
    } catch (err) {
      setLoginError("Server waking up. Please try again in a few seconds.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("vv_session");
    setIsAuthenticated(false);
  };

  const handleOpenPreview = (file) => {
    const docId = file.id || file.document_id;
    setSelectedDoc({
      id: docId,
      name: file.name || file.filename,
      previewUrl: `${API_BASE_URL}/preview/${encodeURIComponent(docId)}`,
    });
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

  if (authLoading) return null;

  // --- SHOW EXTERNAL LOGIN PAGE ---
  if (!isAuthenticated) {
    return (
      <LoginPage
        onLogin={handleLogin}
        error={loginError}
        isDarkMode={isDarkMode}
      />
    );
  }

  return (
    <Router>
      <div
        className={`flex h-screen w-full font-sans relative ${
          isDarkMode
            ? "bg-[#030712] text-slate-200"
            : "bg-slate-50 text-slate-900"
        }`}
      >
        <Sidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          isDarkMode={isDarkMode}
          onLogout={handleLogout}
        />
        <div className="flex-1 flex overflow-hidden relative">
          <main
            className={`flex-1 flex flex-col min-w-0 border-r ${
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
            <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
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
            className={`transition-all duration-300 ease-in-out border-l backdrop-blur-2xl ${
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
