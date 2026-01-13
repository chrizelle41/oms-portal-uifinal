import React, { useState } from "react";

export default function LoginPage({ onLogin, error, isDarkMode }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(email, password);
  };

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
        {/* Branding Area */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-blue-600/10 mb-6 group">
            <span className="text-3xl group-hover:scale-110 transition-transform cursor-default">
              🏢
            </span>
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

        {/* Form Area */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
              Work Email
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              className={`w-full p-4 rounded-2xl outline-none transition-all text-sm border ${
                isDarkMode
                  ? "bg-slate-800 border-white/5 text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  : "bg-slate-50 border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5"
              }`}
              placeholder="name@virtualviewing.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1 relative">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                className={`w-full p-4 rounded-2xl outline-none transition-all text-sm border ${
                  isDarkMode
                    ? "bg-slate-800 border-white/5 text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    : "bg-slate-50 border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5"
                }`}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {/* Show/Hide Toggle */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-colors"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 text-red-500 text-[11px] font-bold p-4 rounded-2xl text-center border border-red-500/20 animate-pulse">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-xl shadow-blue-500/20 transition-all active:scale-[0.98] mt-2"
          >
            Enter Dashboard
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-slate-100/5 text-center">
          <p className="text-slate-500 text-[10px] uppercase tracking-[0.2em] font-bold">
            Authorized Personnel Only
          </p>
        </div>
      </div>
    </div>
  );
}
