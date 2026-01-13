import React, { useState } from "react";
import { Eye, EyeOff, Building2, ShieldAlert } from "lucide-react";

export default function LoginPage({ onLogin, error, isDarkMode }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError("");

    // Professional Validation
    if (!email.toLowerCase().endsWith("@virtualviewing.com")) {
      setLocalError("Access Denied");
      return;
    }

    onLogin(email, password);
  };

  const displayError = localError || error;

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
            O&Ms Portal
          </h1>
          <p className="text-slate-500 text-sm mt-2 font-medium">
            Authorized Personnel Only
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
              Email
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
                className={`w-full p-4 mt-1 rounded-2xl outline-none transition-all text-sm border ${
                  isDarkMode
                    ? "bg-slate-800 border-white/5 text-white focus:border-blue-500"
                    : "bg-slate-50 border-slate-100 focus:border-blue-500"
                }`}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

          {displayError && (
            <div className="flex items-center gap-2 bg-red-500/10 text-red-500 text-[11px] font-bold p-4 rounded-2xl border border-red-500/20 animate-in fade-in slide-in-from-top-1">
              <ShieldAlert size={16} className="shrink-0" />
              <span>{displayError}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-xl shadow-blue-500/20 transition-all active:scale-[0.98]"
          >
            Sign In
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-slate-100/5 text-center">
          <p className="text-slate-500 text-[10px] uppercase tracking-[0.2em] font-bold">
            System Access Protected
          </p>
        </div>
      </div>
    </div>
  );
}
