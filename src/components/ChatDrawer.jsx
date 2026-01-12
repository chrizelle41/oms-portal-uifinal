import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Send,
  MessageSquare,
  Loader2,
  FileText,
  Sparkles,
  ChevronRight,
} from "lucide-react";

export default function ChatDrawer({ isOpen, setIsOpen, onOpenDoc, apiBase }) {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "ai",
      content:
        "Hi! I am your O&M assistant. Ask me anything about your documents.",
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
            "I'm having trouble connecting to the audit server. Please check your connection.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessageContent = (content) => {
    if (!content) return null;

    const hasSourceCard = content.includes("SOURCE_FILE:");
    let mainContent = content;
    let sourceFileName = "";

    if (hasSourceCard) {
      const parts = content.split("SOURCE_FILE:");
      mainContent = parts[0];
      sourceFileName = parts[1].replace(/[\[\]]/g, "").trim();
    }

    const lines = mainContent.split("\n").filter((line) => {
      const l = line.toLowerCase();
      return (
        !l.includes("document name | status") &&
        !l.includes("---") &&
        line.trim() !== ""
      );
    });

    const renderedLines = lines.map((line, i) => {
      // 1. Audit Cards (Logic remains unchanged)
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
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  {info}
                </p>
                {isPresent && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenDoc?.(title);
                    }}
                    className="w-fit flex items-center gap-1.5 mt-3 text-[10px] font-black uppercase tracking-wider text-[#4F6EF7] hover:text-blue-600"
                  >
                    <FileText size={14} /> Open Document
                  </button>
                )}
              </div>
            </div>
          );
        }
      }

      // 2. Optimized QA Text (No Horizontal Scroll & Clean Bullets)
      let processedLine = line.trim();
      // Detect if line starts with hyphen or asterisk bullet
      const isBullet =
        processedLine.startsWith("- ") || processedLine.startsWith("* ");

      // Remove the hyphen/asterisk if it is a bullet to prevent "double bullets"
      if (isBullet) {
        processedLine = processedLine.substring(2);
      }

      // Bold text processing
      const parts = processedLine.split(/(\*\*.*?\*\*)/g);
      const formattedLine = parts.map((part, index) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong
              key={index}
              className="font-bold text-slate-900 dark:text-white"
            >
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });

      return (
        <div
          key={i}
          className={`text-sm leading-relaxed text-slate-600 dark:text-slate-300 break-words whitespace-pre-wrap ${
            isBullet ? "pl-5 relative mb-2" : "mb-3"
          }`}
        >
          {isBullet && (
            <span className="absolute left-1 text-[#4F6EF7] font-bold">
              px•
            </span>
          )}
          {formattedLine}
        </div>
      );
    });

    return (
      <div className="flex flex-col w-full overflow-hidden">
        <div className="w-full max-w-full">{renderedLines}</div>

        {/* Source Card */}
        {hasSourceCard && sourceFileName && (
          <div className="mt-4 p-4 rounded-2xl border border-blue-200 bg-blue-50/50 dark:bg-blue-500/5 dark:border-blue-500/20">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 bg-[#4F6EF7] rounded-xl text-white flex-shrink-0">
                  <FileText size={18} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#4F6EF7]">
                    Source Document
                  </span>
                  <span className="text-xs font-bold text-slate-800 dark:text-white truncate">
                    {sourceFileName}
                  </span>
                </div>
              </div>
              <button
                onClick={() => onOpenDoc?.(sourceFileName)}
                className="flex-shrink-0 flex items-center gap-1 px-3 py-2 bg-white dark:bg-white/10 border border-blue-100 dark:border-white/10 rounded-xl text-[10px] font-black uppercase text-[#4F6EF7] hover:bg-[#4F6EF7] hover:text-white transition-all"
              >
                View <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    );
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
                O&M AI Assistant
              </span>
              <span className="text-[9px] text-blue-500 font-bold uppercase tracking-widest mt-1">
                AI Powered Audit
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
              Reviewing documents...
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
              placeholder="Ask about O&M gaps..."
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
