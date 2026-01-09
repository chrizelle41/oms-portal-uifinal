import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Send,
  MessageSquare,
  Loader2,
  FileText,
  Sparkles,
  Cloud,
} from "lucide-react";

export default function ChatDrawer({ isOpen, setIsOpen, onOpenDoc, apiBase }) {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "ai",
      content:
        "Hi! I am your O&M assistant. Ask me about document gaps or specific values in your files.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!query.trim()) return;
    const userMsg = { role: "user", content: query };
    setMessages((prev) => [...prev, userMsg]);
    const currentQuery = query;
    setQuery("");
    setLoading(true);

    try {
      const response = await fetch(`${apiBase}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: currentQuery }),
      });

      if (!response.ok) throw new Error("Cloud AI Search Failed");

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: data.answer || data.error },
      ]);
    } catch (err) {
      console.error("Chat Error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content:
            "I'm having trouble connecting to the Azure Audit server. Please check your network and API key.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // --- RENDERING LOGIC FOR AUDIT CARDS ---
  const renderMessageContent = (content) => {
    if (!content) return null;

    // Remove markdown headers and separator lines to keep UI clean
    const lines = content.split("\n").filter((line) => {
      const l = line.toLowerCase();
      return (
        !l.includes("document name | status") &&
        !l.includes("---") &&
        line.trim() !== ""
      );
    });

    return lines.map((line, i) => {
      // Check if line is formatted as an audit card (Title | Status | Info)
      if (line.includes("|")) {
        const parts = line.split("|").map((s) => s.trim());
        if (parts.length >= 2) {
          const [title, status, info] = parts;
          const isPresent = status.toLowerCase().includes("present");

          return (
            <div
              key={i}
              className={`my-3 p-4 rounded-2xl border shadow-sm transition-all animate-in zoom-in-95 duration-200 ${
                isPresent
                  ? "bg-[#F0F4FF] border-blue-100 dark:bg-blue-500/5 dark:border-blue-500/20"
                  : "bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-900/20"
              }`}
            >
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-start">
                  <span
                    className={`text-sm font-bold leading-tight ${
                      isPresent
                        ? "text-slate-800 dark:text-white"
                        : "text-red-800 dark:text-red-200"
                    }`}
                  >
                    {title}
                  </span>
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-tighter ${
                      isPresent
                        ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
                        : "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400"
                    }`}
                  >
                    {status}
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  {info ||
                    (isPresent
                      ? "Verified in Azure storage."
                      : "Missing from O&M database.")}
                </p>

                {isPresent && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (typeof onOpenDoc === "function") {
                        onOpenDoc(title);
                      }
                    }}
                    className="w-fit flex items-center gap-1.5 mt-3 text-[10px] font-black uppercase tracking-wider text-[#4F6EF7] hover:text-blue-600 transition-colors"
                  >
                    <FileText size={14} /> Open Document
                  </button>
                )}
              </div>
            </div>
          );
        }
      }

      // Standard text response (for Q&A Mode)
      return (
        <p
          key={i}
          className="mb-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300 font-medium"
        >
          {line}
        </p>
      );
    });
  };

  return (
    <div
      className={`fixed top-0 right-0 h-full border-l border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B0F1A] transition-transform duration-300 z-[999] ${
        isOpen ? "translate-x-0 w-[400px]" : "translate-x-full w-[400px]"
      }`}
    >
      <div className="flex flex-col h-full shadow-2xl">
        {/* Header */}
        <div className="h-20 px-6 border-b border-slate-200 dark:border-white/10 flex justify-between items-center bg-white dark:bg-[#0B0F1A]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-[#4F6EF7] to-purple-600 rounded-lg text-white">
              <Sparkles size={20} />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 dark:text-white leading-none">
                Azure Audit Bot
              </span>
              <span className="text-[9px] text-blue-500 font-bold uppercase tracking-widest mt-1 flex items-center gap-1">
                <Cloud size={10} /> Live Data Sync
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-slate-500/10 rounded-full transition-all"
          >
            <X size={22} className="text-slate-400" />
          </button>
        </div>

        {/* Messages Container */}
        <div
          ref={scrollRef}
          className="flex-1 px-6 py-6 overflow-y-auto space-y-6 no-scrollbar bg-slate-50/30 dark:bg-transparent"
        >
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`${
                  msg.role === "user"
                    ? "bg-[#4F6EF7] text-white p-4 rounded-2xl rounded-tr-none max-w-[85%] shadow-lg"
                    : "w-full"
                }`}
              >
                {msg.role === "ai" ? (
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex-shrink-0 flex items-center justify-center text-[#4F6EF7] dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                      <MessageSquare size={16} />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      {renderMessageContent(msg.content)}
                    </div>
                  </div>
                ) : (
                  <span className="text-sm font-semibold">{msg.content}</span>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-3 text-slate-400 text-[10px] px-12 font-black uppercase tracking-[0.2em] animate-pulse">
              <Loader2 className="animate-spin text-[#4F6EF7]" size={16} />
              Scanning Blobs...
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B0F1A]">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="E.g., What is missing in Building A?"
              className="w-full pl-4 pr-12 py-4 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-[#4F6EF7]/50 focus:border-[#4F6EF7] transition-all text-sm font-medium dark:text-white"
            />
            <button
              onClick={handleSend}
              disabled={loading || !query.trim()}
              className="absolute right-2 top-2 bottom-2 px-3 bg-[#4F6EF7] text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 transition-all active:scale-95 shadow-lg shadow-blue-500/20"
            >
              <Send size={18} />
            </button>
          </div>
          <p className="text-[9px] text-center text-slate-400 mt-3 font-bold uppercase tracking-widest">
            Powered by OpenAI GPT-4o & Azure
          </p>
        </div>
      </div>
    </div>
  );
}
