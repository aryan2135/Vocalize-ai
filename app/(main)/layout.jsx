"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Mic, 
  PhoneCall, 
  History, 
  Coins, 
  Menu, 
  X 
} from "lucide-react";
import AppHeader from "./_components/AppHeader";

function DashboardLayout({ children }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = searchParams.get("tab") || "overview";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Side navigation links
  const menuItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "agents", label: "Voice Agents", icon: Mic },
    { id: "playground", label: "Voice Playground", icon: PhoneCall },
    { id: "logs", label: "Call History", icon: History },
    { id: "billing", label: "Billing & Credits", icon: Coins },
  ];

  return (
    <div className="h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-teal-500/30 selection:text-teal-200 overflow-hidden">
      {/* Top Navbar */}
      <AppHeader onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />

      <div className="flex flex-1 relative overflow-hidden">
        {/* Left Sidebar (Desktop) */}
        <aside className="hidden md:flex flex-col w-64 border-r border-zinc-800 bg-zinc-900/40 backdrop-blur-md p-4 space-y-2 shrink-0">
          <div className="px-3 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            Workspace
          </div>
          <nav className="flex-1 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <Link
                  key={item.id}
                  href={`/dashboard?tab=${item.id}`}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-teal-500/10 to-emerald-500/10 text-teal-400 border-l-2 border-teal-500 pl-2.5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]"
                      : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-teal-400" : "text-zinc-400"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Mobile Navigation Drawer (Overlay) */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden bg-zinc-950/80 backdrop-blur-sm">
            <aside className="fixed inset-y-0 left-0 w-64 bg-zinc-900 border-r border-zinc-800 p-4 flex flex-col space-y-6 animate-in slide-in-from-left duration-200">
              <div className="flex justify-between items-center px-2">
                <span className="font-bold bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
                  VocalizeAI
                </span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <Link
                      key={item.id}
                      href={`/dashboard?tab=${item.id}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-teal-500/10 text-teal-400 border-l-2 border-teal-500 pl-2.5"
                          : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </aside>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-zinc-950 p-6 md:p-10 relative">
          {/* Subtle Background Glows */}
          <div className="absolute top-[-10%] right-[10%] w-[30vw] h-[30vw] bg-teal-500/5 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-10%] left-[5%] w-[35vw] h-[35vw] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none" />
          
          <div className="max-w-7xl mx-auto w-full relative z-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;