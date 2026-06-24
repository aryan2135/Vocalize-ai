"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useUser } from "@stackframe/stack";
import { 
  Sparkles, 
  ArrowRight, 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Volume2, 
  ShieldCheck, 
  Cpu, 
  Gauge, 
  Coins 
} from "lucide-react";

export default function Home() {
  const user = useUser();

  // Demo call states
  const [demoState, setDemoState] = useState("disconnected"); // disconnected | connecting | listening | thinking | speaking
  const demoStateRef = useRef("disconnected");
  const updateDemoState = (newState) => {
    setDemoState(newState);
    demoStateRef.current = newState;
  };
  const [demoTranscript, setDemoTranscript] = useState([]);
  const [demoLiveSpeech, setDemoLiveSpeech] = useState("");
  const [demoMuted, setDemoMuted] = useState(false);
  const [audioSupported, setAudioSupported] = useState(true);
  const [calcMinutes, setCalcMinutes] = useState(5000); // Monthly calls calculator minutes

  // Refs for Web Speech API
  const recognitionRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const demoLiveSpeechRef = useRef("");
  const demoTranscriptRef = useRef([]);

  const updateDemoTranscript = (newVal) => {
    setDemoTranscript(newVal);
    demoTranscriptRef.current = newVal;
  };

  // Check browser support for SpeechRecognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setAudioSupported(false);
      }
    }
  }, []);

  // Visual visualizer loop for the demo widget
  useEffect(() => {
    if (canvasRef.current) {
      renderDemoWaveform();
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [demoState]);

  const renderDemoWaveform = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;
    let phase = 0;

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      const baseRadius = 55;

      // Enable visual blending for holographic organic Siri-like aura
      ctx.globalCompositeOperation = "screen";

      // 3 overlapping waves with different colors, speeds, frequencies, and phase offsets
      const waves = [
        { color: "rgba(20, 184, 166, 0.65)", speed: 1.6, freq: 5, ampMult: 1.1, phaseOffset: 0 },
        { color: "rgba(16, 185, 129, 0.45)", speed: 2.3, freq: 7, ampMult: 0.85, phaseOffset: Math.PI / 3 },
        { color: "rgba(168, 85, 247, 0.4)", speed: 1.1, freq: 4, ampMult: 0.95, phaseOffset: Math.PI / 1.5 }
      ];

      waves.forEach(({ color, speed, freq, ampMult, phaseOffset }) => {
        let amplitude = 2;
        if (demoState === "speaking") {
          amplitude = (8 + Math.sin(phase * speed * 2) * 5) * ampMult;
        } else if (demoState === "listening") {
          amplitude = (3 + Math.sin(phase * speed * 1.2) * 2) * ampMult;
        } else if (demoState === "thinking") {
          amplitude = (4 + Math.sin(phase * 8) * 1.5) * ampMult;
        } else if (demoState === "connecting") {
          amplitude = 5 * ampMult;
        }

        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.0;
        ctx.shadowBlur = demoState !== "disconnected" ? 14 : 0;
        ctx.shadowColor = color;

        const segments = 120;
        for (let i = 0; i <= segments; i++) {
          const angle = (i / segments) * Math.PI * 2;
          const wave = Math.sin(angle * freq + phase * speed + phaseOffset) * 
                       Math.cos(angle * 2.5 - phase * 0.4) * amplitude;
          const r = baseRadius + wave;
          const x = centerX + Math.cos(angle) * r;
          const y = centerY + Math.sin(angle) * r;

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
      });

      phase += 0.045;
    };
    draw();
  };

  // Demo call dialog system (100% Free / Client-Side only)
  const startDemoCall = () => {
    updateDemoState("connecting");
    updateDemoTranscript([{ role: "agent", text: "Hello! Welcome to VocalizeAI. I am running entirely in your browser using local voice engines. Ask me anything!" }]);
    demoLiveSpeechRef.current = "";
    setDemoLiveSpeech("");

    setTimeout(() => {
      speakDemoAgent("Hello! Welcome to Vocalize A I. I am running entirely in your browser using local voice engines. Ask me anything!");
    }, 1000);
  };

  const speakDemoAgent = (text) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      updateDemoState("listening");
      startDemoListening();
      return;
    }

    window.speechSynthesis.cancel();
    if (recognitionRef.current) recognitionRef.current.stop();

    updateDemoState("speaking");
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 1.0;

    // Pick default system voice
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang.startsWith("en") && (v.name.includes("Google") || v.name.includes("Zira") || v.name.includes("Samantha")));
    if (voice) utterance.voice = voice;

    utterance.onend = () => {
      updateDemoState("listening");
      startDemoListening();
    };
    utterance.onerror = () => {
      updateDemoState("listening");
      startDemoListening();
    };

    window.speechSynthesis.speak(utterance);
  };

  const startDemoListening = () => {
    if (demoMuted || demoStateRef.current === "disconnected") return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = "en-US";

    rec.onstart = () => {
      if (window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        updateDemoState("listening");
      }
    };

    rec.onresult = (e) => {
      const result = e.results[e.resultIndex];
      const text = result[0].transcript;
      demoLiveSpeechRef.current = text;
      setDemoLiveSpeech(text);

      // ChatGPT style: immediately finalize when the speech engine says it's final
      if (result.isFinal) {
        rec.stop();
      }
    };

    rec.onend = () => {
      const query = demoLiveSpeechRef.current || "";
      demoLiveSpeechRef.current = "";
      setDemoLiveSpeech("");

      if (query.trim()) {
        processDemoQuery(query.trim());
      } else if (demoStateRef.current === "listening") {
        setTimeout(() => {
          try {
            if (demoStateRef.current === "listening" && recognitionRef.current === rec) {
              rec.start();
            }
          } catch (err) {}
        }, 150);
      }
    };

    recognitionRef.current = rec;
    rec.start();
  };

  const processDemoQuery = (queryText) => {
    const updatedHistory = [...demoTranscriptRef.current, { role: "user", text: queryText }];
    updateDemoTranscript(updatedHistory);
    updateDemoState("thinking");

    setTimeout(() => {
      const q = queryText.toLowerCase();
      let reply = "That's interesting! Inside our primary dashboard, you can build custom prompts and clone different agent identities.";

      if (q.includes("hello") || q.includes("hi ") || q.includes("hey")) {
        reply = "Hello there! Try asking me about our pricing or how this voice recognition operates.";
      } else if (q.includes("price") || q.includes("cost") || q.includes("free")) {
        reply = "VocalizeAI is 100% free! All voice synthesis and speech recognition tasks are processed locally in your browser.";
      } else if (q.includes("how") || q.includes("technology") || q.includes("engine")) {
        reply = "I speak using your browser's native speech synthesis, and listen via Web Speech recognition. This guarantees $0 API fees!";
      } else if (q.includes("bye") || q.includes("goodbye") || q.includes("hang up")) {
        hangUpDemoCall();
        return;
      }

      updateDemoTranscript([...demoTranscriptRef.current, { role: "agent", text: reply }]);
      speakDemoAgent(reply);
    }, 1200);
  };

  const hangUpDemoCall = () => {
    updateDemoState("disconnected");
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.stop();
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-teal-500/30 selection:text-teal-200 relative overflow-hidden">
      
      {/* Decorative Interactive Background Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#27272a_1.5px,transparent_1.5px)] [background-size:24px_24px] pointer-events-none opacity-40 z-0" />

      {/* Background radial glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-teal-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[50vw] h-[50vw] bg-emerald-500/5 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-[30%] left-[40%] w-[30vw] h-[30vw] bg-purple-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Navigation Header */}
      <header className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center relative z-10">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-teal-500/20">
            <Sparkles className="w-4 h-4 text-zinc-950 font-bold animate-pulse" />
          </div>
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            Vocalize<span className="text-teal-400">AI</span>
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <Link
            href="/dashboard"
            className="px-4 py-1.5 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-900/40 hover:bg-zinc-800/80 text-xs font-semibold text-zinc-300 hover:text-zinc-100 transition-all cursor-pointer shadow-lg shadow-black/20"
          >
            {user ? "Dashboard" : "Sign In"}
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-12 pb-16 relative z-10 flex flex-col lg:flex-row items-center justify-between gap-16 min-h-[calc(100vh-80px)]">
        
        {/* Left Copy block */}
        <div className="flex-1 space-y-8 text-center lg:text-left">
          <div className="inline-flex items-center space-x-2 bg-teal-500/5 border border-teal-500/15 px-3.5 py-1 rounded-full text-xs font-semibold text-teal-400 shadow-lg shadow-teal-500/5">
            <span className="flex h-1.5 w-1.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-teal-500"></span>
            </span>
            <span>100% Free • Browser-Native AI</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-white">
            Deploy Custom AI <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-teal-400 via-emerald-400 to-purple-400 bg-clip-text text-transparent">
              Voice Agents
            </span>{" "}
            in Seconds.
          </h1>

          <p className="text-zinc-400 text-sm sm:text-base max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
            Create tailored customer support, interactive tutor, or sales bots completely free. Power your audio recognition and voice synthesis directly in the browser with zero API costs.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <Link
              href="/dashboard"
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-zinc-950 font-bold rounded-xl text-sm transition-all duration-200 shadow-xl shadow-teal-500/10 active:scale-98 cursor-pointer w-full sm:w-auto justify-center"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            
            <a
              href="#demo-section"
              className="px-6 py-3 border border-zinc-800 hover:border-zinc-700 bg-zinc-900/30 text-zinc-300 hover:text-white font-semibold rounded-xl text-sm transition-all cursor-pointer w-full sm:w-auto text-center hover:bg-zinc-800/30"
            >
              Try Voice Demo
            </a>
          </div>
        </div>

        {/* Right Widget Block (Interactive Zero-Cost Demo) */}
        <div 
          id="demo-section" 
          className={`w-full max-w-sm rounded-2xl border bg-zinc-900/35 backdrop-blur-xl p-6 space-y-6 flex flex-col items-center shadow-2xl relative transition-all duration-500 ${
            demoState === "speaking" ? "border-teal-500/40 shadow-teal-500/5" :
            demoState === "listening" ? "border-emerald-500/40 shadow-emerald-500/5" :
            demoState === "thinking" ? "border-purple-500/40 shadow-purple-500/5" :
            "border-zinc-800/80 shadow-black/40"
          }`}
        >
          {/* Signal Indicator & Header */}
          <div className="w-full flex justify-between items-center text-[10px] font-semibold tracking-wider text-zinc-500">
            <div className="flex items-center space-x-1.5 uppercase text-teal-400">
              <Volume2 className="w-3.5 h-3.5" />
              <span>Voice Console</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-1 h-1.5 bg-emerald-500 rounded-sm"></span>
              <span className="w-1 h-2.5 bg-emerald-500 rounded-sm"></span>
              <span className="w-1 h-3.5 bg-emerald-500 rounded-sm"></span>
              <span className="text-[9px] ml-1 font-mono">LTE</span>
            </div>
          </div>

          <div className="text-center space-y-1 pt-2">
            <h3 className="font-bold text-white text-sm tracking-wide">Interactive Demo Line</h3>
            <span className={`text-[11px] font-semibold uppercase tracking-wider ${
              demoState === "speaking" ? "text-teal-400" :
              demoState === "listening" ? "text-emerald-400" :
              demoState === "thinking" ? "text-purple-400" : "text-zinc-500"
            }`}>
              {demoState === "disconnected" ? "Line Offline" : 
               demoState === "connecting" ? "Connecting Voice..." :
               demoState === "listening" ? "Listening to Speech..." :
               demoState === "thinking" ? "Generating Reply..." : "Agent Speaking..."}
            </span>
          </div>

          {/* Siri-style Glowing Voice Orb Canvas */}
          <div className="relative w-full h-36 flex items-center justify-center bg-zinc-950/20 rounded-xl overflow-hidden border border-zinc-900/40">
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
            {demoState !== "disconnected" && (
              <span className="text-[9px] font-mono font-bold tracking-widest text-zinc-400 bg-zinc-950/80 border border-zinc-800/80 px-2.5 py-0.5 rounded-full z-10 shadow-lg">
                LIVE ORB
              </span>
            )}
          </div>

          {/* Controller Call Trigger */}
          <div className="z-10">
            {demoState === "disconnected" ? (
              <button
                onClick={startDemoCall}
                disabled={!audioSupported}
                className="p-4 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 text-zinc-950 font-bold hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-40 shadow-lg shadow-teal-500/20"
                title="Start Demo Call"
              >
                <Phone className="w-5 h-5 fill-zinc-950" />
              </button>
            ) : (
              <button
                onClick={hangUpDemoCall}
                className="p-4 rounded-full bg-rose-600 text-white font-bold hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-lg shadow-rose-600/20"
                title="Hang Up"
              >
                <PhoneOff className="w-5 h-5 fill-white" />
              </button>
            )}
          </div>

          {/* Bubble Transcripts */}
          <div className="w-full h-24 overflow-y-auto border border-zinc-800/50 bg-zinc-950/45 rounded-xl p-3 space-y-2 text-[11px] scrollbar-thin">
            {demoTranscript.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center text-zinc-500 font-medium italic">
                Click the dial button to call. Calls run locally.
              </div>
            ) : (
              <div className="space-y-2">
                {demoTranscript.map((msg, idx) => (
                  <div key={idx} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                    <div className={`px-2.5 py-1.5 rounded-xl border max-w-[90%] leading-relaxed ${
                      msg.role === "user" ? "bg-zinc-800/40 border-zinc-700/60 text-zinc-300" : "bg-teal-500/5 border-teal-500/10 text-teal-400"
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {demoLiveSpeech && (
                  <div className="flex flex-col items-end animate-pulse">
                    <div className="px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 border-dashed text-zinc-500 italic">
                      {demoLiveSpeech}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Cost Savings Calculator Section */}
      <section className="max-w-4xl mx-auto px-6 py-12 relative z-10">
        <div className="p-8 rounded-2xl border border-zinc-800/60 bg-gradient-to-br from-zinc-900/50 via-zinc-900/30 to-zinc-950/80 backdrop-blur-xl space-y-8 relative overflow-hidden shadow-2xl">
          <div className="absolute top-[-30%] right-[-10%] w-[30%] h-[60%] rounded-full bg-teal-500/5 blur-[80px] pointer-events-none" />
          <div className="space-y-2 text-center">
            <span className="text-[10px] font-bold tracking-widest text-teal-400 uppercase">Interactive Savings</span>
            <h2 className="text-2xl font-black text-white">Compare Estimated API Costs</h2>
            <p className="text-zinc-400 text-xs max-w-md mx-auto">
              See how our client-side browser hybrid architecture compares to standard metered cloud hosting.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="flex justify-between text-xs font-semibold text-zinc-300">
                <span>Conversational Minutes / Month</span>
                <span className="text-teal-400 font-mono text-sm">{calcMinutes.toLocaleString()} mins</span>
              </div>
              <input
                type="range"
                min="1000"
                max="100000"
                step="1000"
                value={calcMinutes}
                onChange={(e) => setCalcMinutes(parseInt(e.target.value))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 font-medium">
                <span>1k mins</span>
                <span>50k mins</span>
                <span>100k mins</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-zinc-950/40 border border-zinc-900 text-center">
                <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Typical Cloud APIs*</span>
                <div className="text-lg font-black text-zinc-400 mt-1 font-mono">${(calcMinutes * 0.15).toLocaleString()}</div>
                <span className="text-[9px] text-zinc-650 block mt-0.5">($0.15/min est. average)</span>
              </div>
              <div className="p-4 rounded-xl bg-teal-500/5 border border-teal-500/20 text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="text-[10px] text-teal-400 uppercase font-bold tracking-wider">VocalizeAI*</span>
                <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400 mt-1 font-mono">$0.00</div>
                <span className="text-[9px] text-emerald-500/80 block mt-0.5 font-semibold">Free Browser-Native</span>
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-900 pt-4 text-[10px] text-zinc-500 space-y-1.5 leading-relaxed">
            <p>
              * **Typical Cloud APIs:** Comparison values are estimated averages based on typical industry pricing ($0.15 per minute) for aggregated cloud transcription (ASR), LLM processing, and text-to-speech (TTS) streaming. Actual competitor pricing varies.
            </p>
            <p>
              * **VocalizeAI Zero-Cost Processing:** Runs entirely inside the local browser context via WebSpeech. Fallback cloud LLM and backend transcriber queues are free-tier instances subject to pooled daily rate-limits, fair-use boundaries, and provider quota availability.
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="border-t border-zinc-900 bg-zinc-900/10 py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Feature 1 */}
          <div className="p-6 rounded-xl border border-zinc-900/60 bg-zinc-950/40 hover:border-zinc-800 hover:bg-zinc-900/30 transition-all duration-300 space-y-4 group">
            <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Zero API Costs</h3>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Synthesize voices and recognize audio directly in the user's browser context. Enjoy $0.00 platform costs for transcription and audio streams.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-6 rounded-xl border border-zinc-900/60 bg-zinc-950/40 hover:border-zinc-800 hover:bg-zinc-900/30 transition-all duration-300 space-y-4 group">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <Gauge className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Zero-Latency Synthesis</h3>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Browser-native SpeechSynthesis reacts instantly to incoming text buffers, cutting turn-taking latency down to virtually zero.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-6 rounded-xl border border-zinc-900/60 bg-zinc-950/40 hover:border-zinc-800 hover:bg-zinc-900/30 transition-all duration-300 space-y-4 group">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
              <Coins className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Rate Limit Guard</h3>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Use visual credit limit pools to throttle API consumption, ensuring fair quota distribution across your testing workspace.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900/60 py-8 text-center text-xs text-zinc-650 relative z-10 space-y-2">
        <p>© 2026 VocalizeAI. Powered entirely by browser-native APIs.</p>
        <div className="flex justify-center gap-4 text-zinc-500">
          <Link href="/privacy" className="hover:text-teal-400 transition">Privacy Policy</Link>
          <span className="text-zinc-800">•</span>
          <Link href="/terms" className="hover:text-teal-400 transition">Terms of Service</Link>
        </div>
      </footer>
    </div>
  );
};
