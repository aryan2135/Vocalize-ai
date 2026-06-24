"use client";
import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@stackframe/stack";
import { 
  PhoneCall, 
  Clock, 
  Coins, 
  Smile, 
  Activity, 
  ArrowRight,
  TrendingUp
} from "lucide-react";

function Overview({ setActiveTab }) {
  const user = useUser();
  const email = user?.primaryEmail;

  // Reactively query Convex data
  const dbUser = useQuery(api.user.getUser, email ? { email } : "skip");
  const stats = useQuery(api.call.getCallStats, email ? { createdBy: email } : "skip");
  const calls = useQuery(api.call.getCalls, email ? { createdBy: email } : "skip");

  // Format call duration (seconds to MM:SS)
  const formatDuration = (sec) => {
    if (!sec) return "0s";
    if (sec < 60) return `${sec}s`;
    const mins = Math.floor(sec / 60);
    const remainingSecs = sec % 60;
    return `${mins}m ${remainingSecs}s`;
  };

  const recentCalls = calls ? calls.slice(0, 4) : [];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Greeting */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard</h1>
        <p className="text-zinc-400 mt-1">
          Welcome back, {user?.displayName || "Developer"}. Here is your voice agent workspace overview.
        </p>
      </div>

      {/* Grid Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Calls */}
        <div className="group relative rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 transition-all duration-300 hover:border-zinc-700/60 hover:bg-zinc-900/60 hover:shadow-[0_0_20px_rgba(20,184,166,0.05)]">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 to-transparent rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-400">Total Calls</span>
            <div className="rounded-lg bg-teal-500/10 p-2 text-teal-400">
              <PhoneCall className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-white tracking-tight">
              {stats?.totalCalls ?? 0}
            </span>
          </div>
        </div>

        {/* Total Duration */}
        <div className="group relative rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 transition-all duration-300 hover:border-zinc-700/60 hover:bg-zinc-900/60 hover:shadow-[0_0_20px_rgba(16,185,129,0.05)]">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-transparent rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-400">Total Call Time</span>
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-white tracking-tight">
              {formatDuration(stats?.totalDuration)}
            </span>
          </div>
        </div>

        {/* Credit Limit Balance */}
        <div className="group relative rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 transition-all duration-300 hover:border-zinc-700/60 hover:bg-zinc-900/60 hover:shadow-[0_0_20px_rgba(45,212,191,0.05)]">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-transparent rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-400">Remaining Credits</span>
            <div className="rounded-lg bg-cyan-500/10 p-2 text-cyan-400">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-white tracking-tight">
              {dbUser?.credits?.toLocaleString() ?? "0"}
            </span>
          </div>
        </div>

        {/* Positive Sentiment */}
        <div className="group relative rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 transition-all duration-300 hover:border-zinc-700/60 hover:bg-zinc-900/60 hover:shadow-[0_0_20px_rgba(244,63,94,0.05)]">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-transparent rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-400">Positive Sentiment</span>
            <div className="rounded-lg bg-rose-500/10 p-2 text-rose-400">
              <Smile className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-white tracking-tight">
              {stats?.totalCalls > 0 
                ? `${Math.round(((stats?.sentimentCount?.Positive || 0) / stats.totalCalls) * 100)}%` 
                : "0%"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Charts & Activity Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* SVG Chart Area */}
        <div className="lg:col-span-2 rounded-xl border border-zinc-800 bg-zinc-900/20 p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-white">Call Volume Trend</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Aggregated analytics across active agents</p>
            </div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-teal-400 bg-teal-500/5 px-2.5 py-1 rounded-full border border-teal-500/10">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Live Analytics</span>
            </div>
          </div>

          {/* SVG Area Chart */}
          <div className="h-64 w-full flex items-end relative mt-2">
            {/* Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              <div className="w-full border-b border-zinc-800/40" />
              <div className="w-full border-b border-zinc-800/40" />
              <div className="w-full border-b border-zinc-800/40" />
              <div className="w-full border-b border-zinc-800/40" />
            </div>

            {/* Custom SVG Line Chart */}
            <svg className="w-full h-full overflow-visible z-10" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Area */}
              <path
                d="M 0,95 Q 15,60 30,75 T 60,35 T 80,45 T 100,15 L 100,95 L 0,95 Z"
                fill="url(#chartGradient)"
              />
              {/* Stroke line */}
              <path
                d="M 0,95 Q 15,60 30,75 T 60,35 T 80,45 T 100,15"
                fill="none"
                stroke="#14b8a6"
                strokeWidth="2"
                strokeLinecap="round"
              />
              {/* Dots */}
              <circle cx="30" cy="75" r="1.5" fill="#ffffff" stroke="#14b8a6" strokeWidth="1" />
              <circle cx="60" cy="35" r="1.5" fill="#ffffff" stroke="#14b8a6" strokeWidth="1" />
              <circle cx="100" cy="15" r="1.5" fill="#ffffff" stroke="#14b8a6" strokeWidth="1" />
            </svg>
          </div>

          <div className="flex justify-between items-center text-xs text-zinc-500 mt-4 px-2">
            <span>May</span>
            <span>June</span>
            <span>Today</span>
          </div>
        </div>

        {/* Recent Feed Panel */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/20 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Calls</h2>
            <button 
              onClick={() => setActiveTab("logs")}
              className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center space-x-1 transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentCalls.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-lg p-6 text-center">
              <Activity className="w-8 h-8 text-zinc-600 mb-2" />
              <span className="text-sm font-semibold text-zinc-400">No calls recorded</span>
              <p className="text-xs text-zinc-500 mt-1 max-w-[200px]">
                Create a voice agent and start a test conversation in the Playground.
              </p>
            </div>
          ) : (
            <div className="flex-1 space-y-3.5 overflow-y-auto max-h-[250px] pr-1">
              {recentCalls.map((call) => (
                <div 
                  key={call._id} 
                  className="p-3 rounded-lg border border-zinc-800/80 bg-zinc-900/30 flex items-center justify-between hover:bg-zinc-900/60 transition-colors"
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-zinc-300">{call.agentName}</span>
                    <div className="flex items-center space-x-2 text-[10px] text-zinc-500">
                      <span>{new Date(call.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{formatDuration(call.duration)}</span>
                    </div>
                  </div>
                  {call.sentiment && (
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      call.sentiment === "Positive" 
                        ? "bg-emerald-500/5 text-emerald-400 border-emerald-500/10"
                        : call.sentiment === "Negative"
                          ? "bg-rose-500/5 text-rose-400 border-rose-500/10"
                          : "bg-zinc-500/5 text-zinc-400 border-zinc-500/10"
                    }`}>
                      {call.sentiment}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Overview;
