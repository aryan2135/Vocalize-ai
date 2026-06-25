"use client";
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@stackframe/stack";
import { 
  History, 
  Search, 
  Clock, 
  Coins, 
  Smile, 
  Frown, 
  Meh, 
  X, 
  ChevronRight,
  Sparkles,
  FileText
} from "lucide-react";

function CallLogs() {
  const user = useUser();
  const email = user?.primaryEmail;

  // Fetch calls from Convex
  const calls = useQuery(api.call.getCalls, email ? { createdBy: email } : "skip");

  // Search filter
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCall, setSelectedCall] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Format call duration (seconds to MM:SS or seconds)
  const formatDuration = (sec) => {
    if (!sec) return "0s";
    if (sec < 60) return `${sec}s`;
    const mins = Math.floor(sec / 60);
    const remainingSecs = sec % 60;
    return `${mins}m ${remainingSecs}s`;
  };

  const filteredCalls = calls 
    ? calls.filter(c => 
        c.agentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.sentiment && c.sentiment.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : [];

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case "Positive":
        return <Smile className="w-3.5 h-3.5 text-emerald-400" />;
      case "Negative":
        return <Frown className="w-3.5 h-3.5 text-rose-400" />;
      default:
        return <Meh className="w-3.5 h-3.5 text-zinc-400" />;
    }
  };

  const getSentimentClass = (sentiment) => {
    switch (sentiment) {
      case "Positive":
        return "bg-emerald-500/5 text-emerald-400 border-emerald-500/10";
      case "Negative":
        return "bg-rose-500/5 text-rose-400 border-rose-500/10";
      default:
        return "bg-zinc-500/5 text-zinc-400 border-zinc-500/10";
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Call History</h1>
        <p className="text-zinc-400 mt-1">Review past audio conversations and analytical logs.</p>
      </div>

      {/* Search Filter bar */}
      <div className="flex items-center space-x-3 p-3 bg-zinc-900/40 border border-zinc-800 rounded-xl max-w-md">
        <Search className="w-4.5 h-4.5 text-zinc-500" />
        <input
          type="text"
          placeholder="Filter by agent name or sentiment..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent text-sm text-white placeholder-zinc-500 outline-none w-full"
        />
      </div>

      {/* Logs Table */}
      {calls === undefined ? (
        <div className="flex justify-center items-center h-48">
          <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredCalls.length === 0 ? (
        <div className="border border-dashed border-zinc-800 rounded-2xl p-16 text-center max-w-xl mx-auto mt-6 bg-zinc-900/10">
          <History className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white">No Call Logs Match</h3>
          <p className="text-sm text-zinc-500 mt-2 max-w-sm mx-auto">
            {searchTerm ? "Try searching for a different term." : "Complete a test call inside the Playground to start compiling logs."}
          </p>
        </div>
      ) : (
        <div className="border border-zinc-800 bg-zinc-900/10 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto text-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/50 text-zinc-400 font-medium text-xs uppercase tracking-wider">
                  <th className="px-6 py-4">Agent Name</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Duration</th>
                  <th className="px-6 py-4">Credits Used</th>
                  <th className="px-6 py-4">Sentiment</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850 text-zinc-300">
                {filteredCalls.map((call) => (
                  <tr 
                    key={call._id} 
                    onClick={() => setSelectedCall(call)}
                    className="hover:bg-zinc-800/20 hover:text-white transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4.5 font-semibold text-zinc-100 group-hover:text-teal-400 transition-colors">
                      {call.agentName}
                    </td>
                    <td className="px-6 py-4.5 text-zinc-400 text-xs">
                      {new Date(call.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4.5 text-zinc-400">
                      <div className="flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5 text-zinc-500" />
                        <span>{formatDuration(call.duration)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4.5">
                      <div className="flex items-center space-x-1.5 text-zinc-400 font-medium">
                        <Coins className="w-3.5 h-3.5 text-teal-500/80" />
                        <span>{call.creditsUsed}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4.5">
                      {call.sentiment ? (
                        <div className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full border text-[10px] font-semibold ${getSentimentClass(call.sentiment)}`}>
                          {getSentimentIcon(call.sentiment)}
                          <span>{call.sentiment}</span>
                        </div>
                      ) : (
                        <span className="text-zinc-500 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4.5">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        call.status === "completed" 
                          ? "bg-teal-500/10 text-teal-400" 
                          : "bg-rose-500/10 text-rose-400"
                      }`}>
                        {call.status}
                      </span>
                    </td>
                    <td className="px-6 py-4.5 text-right">
                      <button 
                        className="p-1 rounded-md text-zinc-500 group-hover:text-teal-400 group-hover:translate-x-0.5 transition-all"
                        onClick={() => setSelectedCall(call)}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Slide-out Drawer Panel */}
      {selectedCall && mounted && createPortal(
        <div className="fixed inset-0 z-50 flex justify-end bg-zinc-950/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-zinc-900 border-l border-zinc-800 h-full shadow-2xl p-6 flex flex-col justify-between animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="flex justify-between items-start pb-4 border-b border-zinc-850 shrink-0">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 block">
                  Call Record Details
                </span>
                <h2 className="text-lg font-bold text-white mt-1">
                  Session with {selectedCall.agentName}
                </h2>
                <span className="text-xs text-zinc-500">{new Date(selectedCall.createdAt).toLocaleString()}</span>
              </div>
              <button
                onClick={() => setSelectedCall(null)}
                className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Metrics Dashboard inside drawer */}
            <div className="grid grid-cols-3 gap-3.5 my-4 shrink-0 text-center text-xs">
              <div className="p-2.5 rounded-lg border border-zinc-850 bg-zinc-950/30">
                <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider block mb-0.5">Duration</span>
                <span className="font-bold text-zinc-200">{formatDuration(selectedCall.duration)}</span>
              </div>
              <div className="p-2.5 rounded-lg border border-zinc-850 bg-zinc-950/30">
                <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider block mb-0.5">Credits Spent</span>
                <span className="font-bold text-teal-400">{selectedCall.creditsUsed}</span>
              </div>
              <div className="p-2.5 rounded-lg border border-zinc-850 bg-zinc-950/30">
                <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider block mb-0.5">Sentiment</span>
                <span className={`font-bold ${
                  selectedCall.sentiment === "Positive" ? "text-emerald-400" :
                  selectedCall.sentiment === "Negative" ? "text-rose-400" : "text-zinc-400"
                }`}>{selectedCall.sentiment || "Neutral"}</span>
              </div>
            </div>

            {/* Dialog Transcript Scroll Area */}
            <div className="flex-1 overflow-y-auto space-y-4 my-4 pr-1 scrollbar-thin">
              <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 block mb-2">
                Transcript Dialogue
              </span>
              
              {selectedCall.transcript.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col max-w-[85%] ${
                    msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
                  }`}
                >
                  <span className="text-[9px] text-zinc-500 font-semibold mb-0.5 uppercase tracking-wider">
                    {msg.role === "user" ? "You" : selectedCall.agentName}
                  </span>
                  <div
                    className={`px-3 py-2 rounded-xl border leading-relaxed text-sm ${
                      msg.role === "user"
                        ? "bg-zinc-800/40 border-zinc-800 text-zinc-300 rounded-tr-none"
                        : "bg-teal-500/5 border-teal-500/10 text-teal-400 rounded-tl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Simulated Call Summary */}
            <div className="p-4 bg-zinc-950/50 border border-zinc-850 rounded-xl shrink-0 mt-4">
              <div className="flex items-center space-x-1.5 text-teal-400 text-xs font-semibold mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Call Summary</span>
              </div>
              <p className="text-zinc-400 text-xs leading-relaxed">
                {selectedCall.summary || 
                  `Conversation resolved successfully with ${selectedCall.agentName}. Caller discussed general options. Sentiment categorized as ${selectedCall.sentiment?.toLowerCase() || "neutral"}.`}
              </p>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default CallLogs;
