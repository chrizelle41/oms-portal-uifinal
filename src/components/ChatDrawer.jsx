import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Send,
  MessageSquare,
  Loader2,
  FileText,
  Info,
  Sparkles,
} from "lucide-react";

export default function ChatDrawer({
  isOpen,
  setIsOpen,
  onAddAsset,
  onOpenDoc,
  apiBase, // <--- Received from App.jsx
}) {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "ai",
      content:
        "Hi! I am your O&M assistant powered by Azure AI. Ask me anything about your documents.",
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
    setQuery("");
    setLoading(true);

    try {
      // UPDATED: Use dynamic apiBase for the /ask endpoint
      const response = await fetch(`${apiBase}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query }),
      });

      if (!response.ok) throw new Error("AI Search Failed");

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
            "I'm having trouble connecting to the Azure audit server. Please check your connection.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessageContent = (content) => {
    // Safety check if content is undefined
    if (!content) return null;

    const lines = content.split("\n").filter((line) => {
      const l = line.toLowerCase();
      return (
        !l.includes("document name | status") &&
        !l.includes("---") &&
        line.trim() !== ""
      );
    });

    return lines.map((line, i) => {
      if (line.includes("|")) {
        const parts = line.split("|").map((s) => s.trim());
        if (parts.length >= 2) {
          const [title, status, info] = parts;
          const isPresent = status.toLowerCase() === "present";

          return (
            <div
              key={i}
              className={`my-3 p-4 rounded-2xl border shadow-sm transition-all animate-in zoom-in-95 duration-200 ${
                isPresent
                  ? "bg-[#F0F4FF] border-blue-100 dark:bg-white/5 dark:border-white/10"
                  : "bg-red-50/50 border-red-100 dark:bg-red-900/10 dark:border-red-900/20"
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
                    className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase tracking-tighter ${
                      isPresent
                        ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
                        : "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400"
                    }`}
                  >
                    {status}
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  {info || "No additional information provided."}
                </p>

                {isPresent && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (typeof onOpenDoc === "function") {
                        onOpenDoc(title);
                      }
                    }}
                    className="w-fit flex items-center gap-1.5 mt-3 text-[10px] font-black uppercase tracking-wider text-[#4F6EF7] hover:text-blue-400 transition-colors"
                  >
                    <FileText size={14} /> Open Document
                  </button>
                )}
              </div>
            </div>
          );
        }
      }

      return (
        <p
          key={i}
          className="mb-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300"
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
                Audit Assistant
              </span>
              <span className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest mt-1">
                Azure OpenAI Live
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
          className="flex-1 px-6 py-4 overflow-y-auto space-y-6 no-scrollbar"
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
                    ? "bg-[#4F6EF7] text-white p-3 px-4 rounded-2xl rounded-tr-none max-w-[85%] shadow-md"
                    : "w-full pl-2"
                }`}
              >
                {msg.role === "ai" ? (
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex-shrink-0 flex items-center justify-center text-[#4F6EF7] dark:text-blue-400">
                      <MessageSquare size={16} />
                    </div>
                    <div className="flex-1 pr-2">
                      {renderMessageContent(msg.content)}
                    </div>
                  </div>
                ) : (
                  <span className="text-sm font-medium">{msg.content}</span>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-3 text-slate-400 text-[11px] px-12 font-bold uppercase tracking-widest">
              <Loader2 className="animate-spin text-[#4F6EF7]" size={16} />
              Analyzing context...
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 border-t border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-black/20">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Query documents (e.g. 'Show me HVAC gaps')"
              className="w-full pl-4 pr-12 py-3.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-[#4F6EF7]/50 transition-all text-sm dark:text-white"
            />
            <button
              onClick={handleSend}
              disabled={loading || !query.trim()}
              className="absolute right-2 top-2 bottom-2 px-3 bg-[#4F6EF7] text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
