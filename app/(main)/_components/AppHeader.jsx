"use client";
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useUser, useStackApp } from "@stackframe/stack";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { Coins, Menu, Sparkles, Settings, LogOut } from "lucide-react";

function AppHeader({ onMenuToggle }) {
  const user = useUser();
  const stack = useStackApp();
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reactively fetch user details (including credits) from Convex database
  const dbUser = useQuery(
    api.user.getUser,
    user?.primaryEmail ? { email: user.primaryEmail } : "skip"
  );

  const displayName = user?.displayName || user?.primaryEmail || "User";
  const initial = displayName.charAt(0).toUpperCase();

  const handleLogout = async () => {
    setShowLogoutModal(false);
    
    // Bypass any beforeunload confirmation prompts (e.g. from unsaved third-party form edits)
    if (typeof window !== "undefined") {
      window.addEventListener("beforeunload", (e) => {
        e.stopImmediatePropagation();
      }, true);
    }

    await stack.signOut({ redirectUrl: "/" });
  };

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

        {/* Custom User Dropdown instead of UserButton */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-500/20 to-emerald-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold hover:from-teal-500/30 hover:to-emerald-500/30 transition-all cursor-pointer"
          >
            {initial}
          </button>

          {dropdownOpen && (
            <>
              {/* Invisible click backdrop to close dropdown */}
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2.5 w-48 rounded-xl border border-zinc-800 bg-zinc-900 p-1.5 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-1 border-b border-zinc-800/80 mb-1">
                  <p className="text-[11px] font-semibold text-zinc-200 truncate">{displayName}</p>
                </div>
                
                <Link
                  href="/handler/account-settings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center space-x-2 w-full px-3 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition-colors"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Account Settings</span>
                </Link>

                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    setShowLogoutModal(true);
                  }}
                  className="flex items-center space-x-2 w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-rose-455 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && mounted && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-sm rounded-xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-white mb-2">Sign Out?</h3>
            <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
              Are you sure you want to sign out? You will be redirected to the homepage.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 border border-zinc-850 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-450 text-zinc-950 font-bold rounded-lg text-xs transition-all cursor-pointer"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
}

export default AppHeader;