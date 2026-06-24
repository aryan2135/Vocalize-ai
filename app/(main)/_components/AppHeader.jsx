"use client";
import React from "react";
import { UserButton, useUser } from "@stackframe/stack";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Coins, Menu, Sparkles } from "lucide-react";

function AppHeader({ onMenuToggle }) {
  const user = useUser();
  
  // Reactively fetch user details (including credits) from Convex database
  const dbUser = useQuery(
    api.user.getUser,
    user?.primaryEmail ? { email: user.primaryEmail } : "skip"
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-900/70 backdrop-blur-md px-6 py-4 flex justify-between items-center">
      <div className="flex items-center space-x-3">
        {/* Mobile Menu Toggle */}
        <button
          onClick={onMenuToggle}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 md:hidden transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-teal-500/20">
            <Sparkles className="w-4 h-4 text-zinc-950 font-bold" />
          </div>
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            Vocalize<span className="text-teal-400">AI</span>
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Credits Counter Widget */}
        {dbUser !== undefined && (
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-zinc-800/40 hover:bg-zinc-800/70 border border-zinc-700/60 rounded-full text-xs font-semibold text-zinc-300 transition-all duration-200 shadow-inner">
            <Coins className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
            <span>
              {dbUser?.credits?.toLocaleString() ?? "0"} <span className="text-zinc-500 font-medium">credits</span>
            </span>
          </div>
        )}

        {/* User Button */}
        <div className="flex items-center border border-zinc-800 pl-1 rounded-full bg-zinc-800/20">
          <UserButton />
        </div>
      </div>
    </header>
  );
}

export default AppHeader;