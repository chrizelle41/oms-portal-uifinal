import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Folder,
  Briefcase,
  ChevronLeft,
  Menu,
  MoreVertical,
  Settings,
  LogOut,
  User,
} from "lucide-react";

export default function Sidebar({ isCollapsed, setIsCollapsed, isDarkMode }) {
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard size={22} />,
    },
    {
      name: "Portfolio",
      path: "/portfolio",
      icon: <Briefcase size={22} />,
    },
    {
      name: "All Files",
      path: "/all-files",
      icon: <Folder size={22} />,
    },
  ];

  return (
    <aside
      className={`${
        isCollapsed ? "w-20" : "w-64"
      } transition-all duration-300 ${
        isDarkMode ? "bg-black/40 border-white/10" : "bg-white border-slate-200"
      } backdrop-blur-xl border-r flex flex-col h-screen z-30 shrink-0 relative`}
    >
      {/* Top Header */}
      <div
        className={`h-20 flex items-center px-4 mb-4 ${
          isCollapsed ? "justify-center" : "justify-between"
        }`}
      >
        {!isCollapsed ? (
          <>
            <span className="font-black text-xl bg-gradient-to-r from-[#4F6EF7] to-purple-400 bg-clip-text text-transparent truncate ml-2">
              O&Ms Portal
            </span>
            <button
              onClick={() => setIsCollapsed(true)}
              className="p-2 hover:bg-slate-500/10 rounded-xl text-slate-400 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
          </>
        ) : (
          <button
            onClick={() => setIsCollapsed(false)}
            className="p-3 hover:bg-slate-500/10 rounded-2xl text-slate-400 transition-all duration-200"
          >
            <Menu size={24} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            title={isCollapsed ? item.name : ""}
            className={({ isActive }) => `
              flex items-center rounded-2xl transition-all duration-200 group
              ${
                isCollapsed
                  ? "justify-center h-12 w-12 mx-auto"
                  : "px-4 py-3.5 gap-4 w-full"
              }
              ${
                isActive
                  ? "bg-[#4F6EF7] text-white shadow-lg shadow-blue-500/20"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 hover:bg-slate-500/5"
              }
            `}
          >
            <div className="shrink-0">{item.icon}</div>
            {!isCollapsed && (
              <span className="font-bold whitespace-nowrap text-sm">
                {item.name}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Account Section */}
      <div
        className={`p-4 border-t ${
          isDarkMode ? "border-white/5" : "border-slate-100"
        } relative`}
      >
        <div
          className={`flex items-center gap-3 p-2 rounded-2xl transition-colors ${
            isCollapsed ? "justify-center" : "hover:bg-slate-500/5"
          }`}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#4F6EF7] to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-500/20">
            <User size={18} />
          </div>

          {!isCollapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-xs font-bold truncate ${
                    isDarkMode ? "text-white" : "text-slate-900"
                  }`}
                >
                  User
                </p>
                <p className="text-[10px] text-slate-500 truncate">
                  User@virtualviewing.com
                </p>
              </div>

              <button
                onClick={() => setShowAccountMenu(!showAccountMenu)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-500/10"
              >
                <MoreVertical size={16} />
              </button>
            </>
          )}
        </div>

        {/* Account Menu */}
        {showAccountMenu && !isCollapsed && (
          <div
            className={`absolute bottom-20 left-4 right-4 border rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200 ${
              isDarkMode
                ? "bg-[#161b22] border-white/10"
                : "bg-white border-slate-200"
            }`}
          >
            <button className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-500/5 rounded-xl transition-colors">
              <Settings size={16} />
              <span>Settings</span>
            </button>
            <div
              className={`h-px my-1 ${
                isDarkMode ? "bg-white/5" : "bg-slate-100"
              }`}
            />
            <button className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-red-500 hover:bg-red-500/5 rounded-xl transition-colors">
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
