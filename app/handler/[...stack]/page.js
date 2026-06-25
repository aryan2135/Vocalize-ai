"use client";
import React, { useEffect, useRef, useState } from "react";
import { StackHandler } from "@stackframe/stack";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Sparkles, Activity, ShieldCheck, Terminal, Cpu, Zap } from "lucide-react";

export default function Handler() {
  const pathname = usePathname();
  const isSettings = pathname?.includes("account-settings");
  const leftCanvasRef = useRef(null);
  const animationRef = useRef(null);
  const [simulatedLogs, setSimulatedLogs] = useState([
    "SYS_INIT: Booting vocalize-node-alpha...",
    "DB_CONN: Convex client online",
    "API_SEC: rate-limit pools initialized",
  ]);

  // Audio wave visualization loop for the decorative left panel
  useEffect(() => {
    const canvas = leftCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;
    let phase = 0;

    const drawWave = () => {
      animationRef.current = requestAnimationFrame(drawWave);
      ctx.clearRect(0, 0, width, height);

      // Gradient fill for lines
      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, "rgba(20, 184, 166, 0)");
      gradient.addColorStop(0.3, "rgba(20, 184, 166, 0.8)");
      gradient.addColorStop(0.7, "rgba(168, 85, 247, 0.8)");
      gradient.addColorStop(1, "rgba(168, 85, 247, 0)");

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 1.5;

      // Draw multiple overlapping sin waves
      for (let w = 0; w < 3; w++) {
        ctx.beginPath();
        const amplitude = 15 + w * 5;
        const frequency = 0.015 - w * 0.003;
        const speed = 0.05 + w * 0.02;

        for (let x = 0; x < width; x++) {
          const y = height / 2 + Math.sin(x * frequency + phase * speed) * amplitude * Math.sin(x / width * Math.PI);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      phase += 0.8;
    };

    drawWave();

    // Event listener for resize
    const handleResize = () => {
      if (!leftCanvasRef.current) return;
      width = leftCanvasRef.current.width = leftCanvasRef.current.offsetWidth;
      height = leftCanvasRef.current.height = leftCanvasRef.current.offsetHeight;
    };
    window.addEventListener("resize", handleResize);

    // Rotating logs effect
    const logPool = [
      "CALL_INIT: Routing local WebSpeech synthesis...",
      "ASR_FALLBACK: Groq Whisper models listening",
      "MUTATION: deduct_credits secure handoff completed",
      "SYS_ALERT: allowance reload window resets in 24h",
      "LLM_GATEWAY:Groq-Llama-70b-versatile cascade active",
      "CLIENT_SPEECH: turn-taking duration: 1.25s",
    ];
    const logInterval = setInterval(() => {
      const randomLog = logPool[Math.floor(Math.random() * logPool.length)];
      setSimulatedLogs(prev => [randomLog, prev[0], prev[1]]);
    }, 4000);

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", handleResize);
      clearInterval(logInterval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-white relative flex overflow-hidden">
      
      {/* LEFT PANEL: Interactive Visual Brand Space (Hidden on mobile) */}
      {!isSettings && (
        <div className="hidden lg:flex lg:w-[45%] bg-zinc-950 border-r border-zinc-900 relative flex-col justify-between p-12 overflow-hidden select-none">
          
          {/* Cyber Grid pattern inside left panel */}
          <div className="absolute inset-0 bg-[radial-gradient(#27272a_1.2px,transparent_1.2px)] [background-size:20px_20px] opacity-35" />
          
          {/* Gradient glows */}
          <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[60%] rounded-full bg-teal-500/5 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[60%] rounded-full bg-purple-500/5 blur-[120px] pointer-events-none" />

          {/* Brand Header */}
          <div className="relative z-10 flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-teal-500/20">
              <Sparkles className="w-4 h-4 text-zinc-950 font-bold" />
            </div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              Vocalize<span className="text-teal-400">AI</span>
            </span>
          </div>

          {/* Middle Visuals: Dynamic Audio Line & Features */}
          <div className="relative z-10 space-y-12 my-auto">
            <div className="space-y-4">
              <span className="text-[10px] font-bold tracking-widest text-teal-400 uppercase bg-teal-500/5 px-2.5 py-1 rounded-full border border-teal-500/10">
                System Gateway
              </span>
              <h2 className="text-3xl font-black tracking-tight leading-tight">
                Create, Tune, and <br />
                Deploy Free Voice Bots.
              </h2>
              <p className="text-zinc-400 text-xs max-w-sm leading-relaxed">
                Log in to access your agent manager dashboard, customize system prompts, allocate credit thresholds, and inspect historical call session logs.
              </p>
            </div>

            {/* Active Audio Waveform Monitor */}
            <div className="p-4 rounded-xl border border-zinc-900 bg-zinc-900/10 backdrop-blur-md space-y-4 max-w-md">
              <div className="flex justify-between items-center text-[10px] text-zinc-500 font-bold tracking-wider uppercase">
                <span className="flex items-center space-x-1.5 text-teal-400">
                  <Activity className="w-3.5 h-3.5" />
                  <span>Demo Wave Visualizer</span>
                </span>
                <span className="font-mono text-zinc-400 bg-zinc-800/20 px-1.5 py-0.5 rounded border border-zinc-850">
                  Demo
                </span>
              </div>
              
              <div className="h-16 w-full relative flex items-center justify-center bg-zinc-950/40 rounded-lg overflow-hidden border border-zinc-900/60">
                <canvas ref={leftCanvasRef} className="absolute inset-0 w-full h-full" />
              </div>
            </div>

            {/* Core Badges Row */}
            <div className="grid grid-cols-2 gap-4 max-w-md">
              <div className="flex items-start space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-teal-500/5 border border-teal-500/15 flex items-center justify-center text-teal-400">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-200">Local processing</h4>
                  <p className="text-[10px] text-zinc-500 mt-0.5 leading-normal">Speech engines run inside client browser</p>
                </div>
              </div>
              <div className="flex items-start space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-purple-500/5 border border-purple-500/15 flex items-center justify-center text-purple-400">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-200">Sub-100ms Latency</h4>
                  <p className="text-[10px] text-zinc-500 mt-0.5 leading-normal">Zero network wait for audio synthesizers</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Logs Terminal */}
          <div className="relative z-10 border border-zinc-900 bg-zinc-950/80 rounded-xl p-3.5 w-full max-w-md font-mono text-[9px] text-zinc-500 space-y-1.5 shadow-2xl">
            <div className="flex items-center justify-between text-zinc-400 font-bold border-b border-zinc-900 pb-1.5 mb-2">
              <div className="flex items-center space-x-1.5">
                <Terminal className="w-3.5 h-3.5 text-teal-400" />
                <span>Demo Console Sandbox</span>
              </div>
              <span className="text-[8px] text-zinc-650 uppercase font-semibold">Canned Preview</span>
            </div>
            {simulatedLogs.map((log, idx) => (
              <div key={idx} className={`truncate ${idx === 0 ? "text-teal-400/90 font-semibold" : ""}`}>
                {log}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RIGHT PANEL: Authentication handler Form (Centered on mobile) */}
      <div className="flex-1 min-h-screen bg-zinc-950 relative flex flex-col justify-center items-center overflow-y-auto px-4 z-10">
        
        {/* Mobile background decorative items */}
        <div className="absolute inset-0 bg-[radial-gradient(#27272a_1.2px,transparent_1.2px)] [background-size:20px_20px] opacity-25 lg:hidden" />
        <div className="absolute top-[-20%] right-[-10%] w-[70%] h-[50%] rounded-full bg-teal-500/5 blur-[120px] pointer-events-none lg:hidden" />

        {/* Premium Top Navigation Bar */}
        <div className="absolute top-6 left-6 z-50">
          <Link
            href="/"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.addEventListener("beforeunload", (e) => {
                  e.stopImmediatePropagation();
                }, true);
              }
            }}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-zinc-300 hover:text-white hover:bg-zinc-800/80 transition-all font-medium text-xs group shadow-lg shadow-black/20"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Main Stack Auth Container */}
        <div className={`w-full ${isSettings ? "max-w-4xl" : "max-w-md"} p-6 md:p-8 bg-gradient-to-br from-zinc-900/40 via-zinc-900/20 to-zinc-950/60 border border-zinc-800/60 rounded-2xl backdrop-blur-xl shadow-2xl relative my-12 transition-all duration-300`}>
          
          {/* Header area */}
          {isSettings ? (
            <div className="mb-6 flex flex-col items-center sm:items-start space-y-2 border-b border-zinc-800/80 pb-4">
              <h2 className="text-lg font-bold text-white">Account Settings & Profile</h2>
              <p className="text-zinc-400 text-xs font-semibold tracking-wide">
                Manage your personal profiles, sessions, and security options
              </p>
            </div>
          ) : (
            <div className="mb-8 flex flex-col items-center space-y-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-teal-500/25 lg:hidden">
                <Sparkles className="w-4.5 h-4.5 text-zinc-950 font-bold" />
              </div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent lg:hidden">
                Vocalize<span className="text-teal-400">AI</span>
              </span>
              <p className="text-zinc-400 text-xs font-semibold tracking-wide text-center">
                Authenticate via Secure Gateway
              </p>
            </div>
          )}

          {/* Form wrapper */}
          <div className="stack-auth-form-wrapper">
            <StackHandler />
          </div>

          {/* Subtle Security Badge */}
          <div className="mt-8 flex items-center justify-center space-x-1.5 text-[10px] text-zinc-500 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-500" />
            <span>Secured by Stack Auth • AES-256</span>
          </div>
        </div>
      </div>
    </div>
  );
}
