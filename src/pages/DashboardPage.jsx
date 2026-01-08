import React from "react";
import { Files, Building2, Cpu, Tag } from "lucide-react";

export default function DashboardPage({ stats, loading }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <StatCard
        title="Total Docs"
        value={stats.totalDocs}
        icon={<Files />}
        gradient="from-blue-500 to-cyan-400"
        loading={loading}
      />
      <StatCard
        title="Buildings"
        value={stats.buildings}
        icon={<Building2 />}
        gradient="from-purple-500 to-pink-400"
        loading={loading}
      />
      <StatCard
        title="Systems"
        value={stats.systems}
        icon={<Cpu />}
        gradient="from-emerald-500 to-teal-400"
        loading={loading}
      />
      <StatCard
        title="Assets"
        value={stats.assets}
        icon={<Tag />}
        gradient="from-orange-500 to-yellow-400"
        loading={loading}
      />
    </div>
  );
}

function StatCard({ title, value, icon, gradient, loading }) {
  return (
    <div className="group relative p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/10 backdrop-blur-xl hover:border-white/20 transition-all duration-500 overflow-hidden shadow-lg">
      <div
        className={`absolute -right-4 -top-4 w-32 h-32 bg-gradient-to-br ${gradient} opacity-10 blur-3xl group-hover:opacity-30 transition-all duration-700`}
      />
      <div className="relative z-10">
        <div
          className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white mb-6 shadow-xl`}
        >
          {React.cloneElement(icon, { size: 28 })}
        </div>
        <h3 className="text-slate-500 font-bold text-xs uppercase tracking-[0.2em] mb-1">
          {title}
        </h3>
        {loading ? (
          <div className="h-10 w-20 bg-white/10 animate-pulse rounded-lg mt-2" />
        ) : (
          <p className="text-5xl font-black mt-2 text-white tracking-tighter">
            {value}
          </p>
        )}
      </div>
    </div>
  );
}
