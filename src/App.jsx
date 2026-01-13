import React, { useEffect, useState, useMemo } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
// Icons - Ensure 'lucide-react' is in your package.json
import { Eye, EyeOff, Building2, ShieldAlert } from "lucide-react";

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
  // --- AUTH STATE ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");

  // --- APP STATE ---
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

  // 1. Check Authentication on Load
  useEffect(() => {
    const session = localStorage.getItem("vv_session");
    if (session === "active") {
      setIsAuthenticated(true);
    }
    setAuthLoading(false);
  }, []);

  // 2. Theme Logic
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  // 3. Data Fetching (Only if authenticated)
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
        console.error("Database sync failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAuthenticated]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");

    // 1. FRONTEND DOMAIN VALIDATION
    if (!loginEmail.toLowerCase().endsWith("@virtualviewing.com")) {
      setLoginError(
        "Access Denied: Use the correct @virtualviewing.com email."
      );
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await response.json();

      if (response.ok && data.status === "success") {
        setIsAuthenticated(true);
        localStorage.setItem("vv_session", "active");
      } else {
        // 2. BACKEND PASSWORD VALIDATION
        // If server returns 401 or 403, show your specific message
        setLoginError(
          "Access Denied: Use the correct email and password. Invalid credentials."
        );
      }
    } catch (err) {
      // This usually happens if the server is still "waking up" on Render
      setLoginError(
        "Server is starting up. Please wait 30 seconds and try again."
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("vv_session");
    setIsAuthenticated(false);
    setFiles([]);
    setPortfolioData({
      stats: { companies: 0, properties: 0, docs: 0 },
      assets: [],
    });
  };

  // --- PREVIEW LOGIC ---
  const handleOpenPreview = (file) => {
    const docId = file.id || file.document_id;
    setSelectedDoc({
      id: docId,
      name: file.name || file.filename,
      cat: file.cat || file.system || "Document",
      doc_type: file.doc_type || file.document_type || "General",
      size: file.size || "N/A",
      date: file.date || "Verified",
      isLocal: false,
      previewUrl: `${API_BASE_URL}/preview/${encodeURIComponent(docId)}`,
    });
  };

  const handleOpenDocFromChat = async (docTitle) => {
    try {
      const response = await fetch(`${API_BASE_URL}/files`);
      const allFiles = await response.json();
      const cleanTitle = docTitle.toLowerCase().trim();
      const match = allFiles.find((f) =>
        f.filename.toLowerCase().includes(cleanTitle)
      );
      if (match) handleOpenPreview(match);
    } catch (err) {
      console.error(err);
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

  if (authLoading) return null;

  // --- LOGIN UI ---
  if (!isAuthenticated) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center p-6 ${
          isDarkMode ? "bg-[#030712]" : "bg-slate-50"
        }`}
      >
        <div
          className={`w-full max-w-md p-10 rounded-[2.5rem] shadow-2xl transition-all ${
            isDarkMode
              ? "bg-slate-900 border border-white/5"
              : "bg-white border border-slate-100"
          }`}
        >
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-blue-600/10 mb-6 group">
              <Building2 size={32} className="text-blue-500" />
            </div>
            <h1
              className={`text-2xl font-black tracking-tight uppercase ${
                isDarkMode ? "text-white" : "text-slate-900"
              }`}
            >
              Virtual Viewing
            </h1>
            <p className="text-slate-500 text-sm mt-2 font-medium">
              O&M Operations Portal
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                Work Email
              </label>
              <input
                type="email"
                required
                className={`w-full p-4 mt-1 rounded-2xl outline-none transition-all text-sm border ${
                  isDarkMode
                    ? "bg-slate-800 border-white/5 text-white focus:border-blue-500"
                    : "bg-slate-50 border-slate-100 focus:border-blue-500"
                }`}
                placeholder="name@virtualviewing.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className={`w-full p-4 mt-1 rounded-2xl outline-none transition-all text-sm border ${
                    isDarkMode
                      ? "bg-slate-800 border-white/5 text-white focus:border-blue-500"
                      : "bg-slate-50 border-slate-100 focus:border-blue-500"
                  }`}
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 mt-0.5 text-slate-400 hover:text-blue-500 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {loginError && (
              <div className="flex items-center justify-center gap-2 bg-red-500/10 text-red-500 text-[11px] font-bold p-4 rounded-2xl text-center border border-red-500/20">
                <ShieldAlert size={14} />
                {loginError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold shadow-xl shadow-blue-500/20 transition-all active:scale-[0.98]"
            >
              Sign In
            </button>
          </form>

          <p className="text-center text-slate-500 text-[10px] mt-10 uppercase tracking-widest font-bold">
            Internal Demo Access Only
          </p>
        </div>
      </div>
    );
  }

  // --- DASHBOARD UI ---
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
          setIsDarkMode={setIsDarkMode}
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
