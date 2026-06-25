"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useUser } from "@stackframe/stack";
import { 
  Sparkles, 
  ArrowRight, 
  Phone, 
  PhoneOff, 
  Volume2, 
  Cpu, 
  Gauge, 
  Coins,
  HelpCircle,
  CheckCircle2,
  ChevronDown,
  Activity,
  Terminal,
  VolumeX,
  Volume1
} from "lucide-react";

const PRESETS = [
  {
    id: "support",
    name: "SOPHIA v2.4",
    role: "Enterprise Support",
    engine: "Neural WebSpeech",
    gender: "female",
    pitch: 1.0,
    rate: 1.0,
    avatar: "👩‍💼",
    accentColor: "#06b6d4",
    welcome: "Neural link verified. Hello, I am Sophia. I can assist you with your project metrics, documentation, or integration pipelines. How can I help?",
    responses: {
      hello: "Sophia system online. How can I assist you with your project today?",
      price: "All speech recognition and voice rendering run locally in your browser. Total platform cost is $0.00.",
      how: "By utilizing standard browser audio synthesis and audio capture, VocalizeAI cuts server CPU dependencies completely.",
      bye: "Session terminated. Thank you for calling Sophia. Have a wonderful day!",
    }
  },
  {
    id: "sales",
    name: "LEO v3.1",
    role: "Sales Accelerator",
    engine: "Ultra Fast Synthesizer",
    gender: "male",
    pitch: 0.9,
    rate: 1.15,
    avatar: "🚀",
    accentColor: "#f59e0b",
    welcome: "Hey there! Leo here from growth operations. Ready to supercharge your customer touchpoints at absolute zero cost? What are we building?",
    responses: {
      hello: "Leo here. Let's make things happen! What's on your mind?",
      price: "No costs, no hidden credit cards. Absolute peak performance running locally on your device.",
      how: "Your browser takes care of the voice rendering, and we route local audio buffers natively. Simple as that.",
      bye: "Goodbye! Click Launch Console to set up your personal credentials.",
    }
  },
  {
    id: "tutor",
    name: "MAYA v1.8",
    role: "Language Coach",
    engine: "Slow Accent Coach",
    gender: "female",
    pitch: 1.15,
    rate: 0.85,
    avatar: "🎓",
    accentColor: "#a855f7",
    welcome: "¡Hola! Welcome to your Spanish coaching session. I am Maya. We can practice speaking or answer grammar questions. What shall we learn?",
    responses: {
      hello: "¡Hola! How can I help you today? We can practice conversation or answer grammar questions.",
      price: "Learning languages with VocalizeAI is entirely free, using client-side speech processors.",
      how: "We translate voice buffers to local speech APIs, bypassing expensive cloud pipelines.",
      bye: "¡Hasta luego! Hope to chat with you again soon. Adiós.",
    }
  }
];

export default function Home() {
  const user = useUser();
  const [selectedPreset, setSelectedPreset] = useState(PRESETS[0]);
  const [demoState, setDemoState] = useState("disconnected"); // disconnected | connecting | listening | thinking | speaking
  const demoStateRef = useRef("disconnected");

  const updateDemoState = (newState) => {
    setDemoState(newState);
    demoStateRef.current = newState;
  };

  const [demoTranscript, setDemoTranscript] = useState([]);
  const [demoLiveSpeech, setDemoLiveSpeech] = useState("");
  const [calcMinutes, setCalcMinutes] = useState(15000);
  const [activeFaq, setActiveFaq] = useState(null);
  
  // Real-time fake metrics for hardware console look
  const [latency, setLatency] = useState(0);
  const [cpuUsage, setCpuUsage] = useState(0.4);
  const [callDuration, setCallDuration] = useState(0);
  const durationTimerRef = useRef(null);
  const [audioSupported, setAudioSupported] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      setAudioSupported(!!SpeechRecognition && !!window.speechSynthesis);
    }
  }, []);

  // Refs for Web Speech API & Visualizer
  const recognitionRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const demoLiveSpeechRef = useRef("");
  const demoTranscriptRef = useRef([]);

  const updateDemoTranscript = (newVal) => {
    setDemoTranscript(newVal);
    demoTranscriptRef.current = newVal;
  };

  // Call duration counter
  useEffect(() => {
    if (demoState !== "disconnected" && demoState !== "connecting") {
      if (!durationTimerRef.current) {
        durationTimerRef.current = setInterval(() => {
          setCallDuration(prev => prev + 1);
        }, 1000);
      }
    } else {
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
        durationTimerRef.current = null;
      }
      setCallDuration(0);
    }
    return () => {
      if (durationTimerRef.current) clearInterval(durationTimerRef.current);
    };
  }, [demoState]);

  // Fake system latency/metrics loop
  useEffect(() => {
    const interval = setInterval(() => {
      if (demoState === "speaking" || demoState === "listening") {
        setLatency(Math.floor(100 + Math.random() * 80));
        setCpuUsage((0.8 + Math.random() * 1.5).toFixed(1));
      } else if (demoState === "thinking") {
        setLatency(Math.floor(250 + Math.random() * 150));
        setCpuUsage((3.5 + Math.random() * 2).toFixed(1));
      } else {
        setLatency(0);
        setCpuUsage(0.2);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [demoState]);

  // Visualizer loop: High-tech neural waveform visualizer
  useEffect(() => {
    if (canvasRef.current) {
      renderNeuralWaveform();
    }
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [demoState, selectedPreset]);

  const renderNeuralWaveform = () => {
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

      // Grid background lines
      ctx.strokeStyle = "rgba(63, 63, 70, 0.15)";
      ctx.lineWidth = 1;
      const step = 20;
      for (let x = 0; x < width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw horizontal neural line
      const centerY = height / 2;
      const accentColor = selectedPreset.accentColor;

      // 3 overlapping visualizer layers
      const layers = [
        { opacity: 0.15, amplitude: 0.45, speed: 0.8, freq: 0.008, color: accentColor },
        { opacity: 0.4, amplitude: 0.7, speed: 1.4, freq: 0.015, color: "#10b981" },
        { opacity: 0.8, amplitude: 1.0, speed: 2.2, freq: 0.022, color: accentColor }
      ];

      layers.forEach(({ opacity, amplitude, speed, freq, color }) => {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = opacity === 0.8 ? 2 : 1;
        ctx.globalAlpha = opacity;

        if (demoState !== "disconnected") {
          ctx.shadowBlur = 12;
          ctx.shadowColor = color;
        } else {
          ctx.shadowBlur = 0;
        }

        let baseAmp = 3;
        if (demoState === "speaking") {
          baseAmp = 25;
        } else if (demoState === "listening") {
          baseAmp = 12;
        } else if (demoState === "thinking") {
          baseAmp = 18;
        } else if (demoState === "connecting") {
          baseAmp = 6;
        }

        for (let x = 0; x < width; x++) {
          const edgeClamp = Math.sin((x / width) * Math.PI);
          const y = centerY + Math.sin(x * freq + phase * speed) * Math.cos(x * 0.005 - phase * 0.5) * baseAmp * amplitude * edgeClamp;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      ctx.globalAlpha = 1.0;
      ctx.shadowBlur = 0;
      phase += 0.04;
    };
    draw();
  };

  const startDemoCall = () => {
    updateDemoState("connecting");
    updateDemoTranscript([{ role: "agent", text: selectedPreset.welcome }]);
    demoLiveSpeechRef.current = "";
    setDemoLiveSpeech("");

    setTimeout(() => {
      speakDemoAgent(selectedPreset.welcome);
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
    utterance.rate = selectedPreset.rate;
    utterance.pitch = selectedPreset.pitch;

    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => {
      const vName = v.name.toLowerCase();
      const isEnglish = v.lang.startsWith("en") || v.lang.startsWith("es");
      if (selectedPreset.gender === "female") {
        return isEnglish && (vName.includes("zira") || vName.includes("samantha") || vName.includes("google us english") || vName.includes("female") || vName.includes("hazel"));
      } else {
        return isEnglish && (vName.includes("david") || vName.includes("daniel") || vName.includes("google uk english") || vName.includes("male"));
      }
    });

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
    if (demoStateRef.current === "disconnected") return;
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
      let reply = `Command received. Processing "${queryText}" locally. Custom prompts can be customized to resolve direct workflows via the dashboard.`;

      if (q.includes("hello") || q.includes("hi ") || q.includes("hey")) {
        reply = selectedPreset.responses.hello;
      } else if (q.includes("price") || q.includes("cost") || q.includes("free")) {
        reply = selectedPreset.responses.price;
      } else if (q.includes("how") || q.includes("technology") || q.includes("engine")) {
        reply = selectedPreset.responses.how;
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

  const handleSelectPreset = (preset) => {
    if (demoState !== "disconnected") hangUpDemoCall();
    setSelectedPreset(preset);
  };

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const FAQS = [
    {
      q: "How does VocalizeAI run voice agents at $0 platform cost?",
      a: "Traditional setups stream raw audio bytes over metered API connections, creating large server bills. VocalizeAI offloads the intensive audio capture (speech-to-text) and vocal synthesis (text-to-speech) to the client's local browser engine. Only the core chat tokens process on backend pools, making operations free-tier lightweight."
    },
    {
      q: "Does this require complex downloads or extensions?",
      a: "No downloads, no plugins, and no custom installations. It utilizes standard Web Speech API endpoints supported natively inside Google Chrome, Microsoft Edge, and Safari."
    },
    {
      q: "Can I train a custom voice clone?",
      a: "Yes! The dashboard supports fine-tuning instructions, rate parameters, and lets you map custom TTS engines. Advanced integrations allow binding voice templates to specific system endpoints."
    }
  ];

  return (
    <div className="min-h-screen bg-[#070709] text-zinc-150 font-sans selection:bg-teal-500/20 selection:text-teal-300 relative overflow-hidden">
      
      {/* Dynamic Cyberpunk Tech Grids */}
      <div className="absolute inset-0 bg-[radial-gradient(#1c1917_1px,transparent_1px)] [background-size:28px_28px] pointer-events-none opacity-60 z-0" />
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-teal-950/10 via-transparent to-transparent pointer-events-none z-0" />

      {/* Mesh Glow Points */}
      <div className="absolute top-[-10%] right-[5%] w-[45vw] h-[45vw] bg-teal-500/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-5%] w-[40vw] h-[40vw] bg-emerald-600/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Nav Header */}
      <header className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center relative z-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-teal-500/10 border border-teal-400/20">
            <Activity className="w-5 h-5 text-zinc-950 font-bold" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg leading-none tracking-wider text-white">
              VOCALIZE<span className="text-teal-400">.AI</span>
            </span>
            <span className="text-[9px] text-zinc-500 font-mono tracking-widest uppercase">neural gateway</span>
          </div>
        </div>

        <Link
          href="/dashboard"
          className="px-5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs font-bold text-zinc-200 hover:text-white transition-all shadow-md hover:bg-zinc-850 cursor-pointer"
        >
          {user ? "CONSOLE.LOG" : "SIGN_IN"}
        </Link>
      </header>

      {/* Futuristic Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-12 pb-24 relative z-10 flex flex-col lg:flex-row items-center justify-between gap-16 min-h-[calc(100vh-120px)]">
        
        {/* Left Side: Bold Digital Typography */}
        <div className="flex-1 space-y-8 text-center lg:text-left">
          <div className="inline-flex items-center space-x-2 bg-zinc-900/60 border border-teal-500/20 px-4 py-1.5 rounded-full text-xs font-mono text-teal-400">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
            <span>CORE NODE: ACTIVE</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
            Deploy Custom <br className="hidden lg:inline" />
            Voice Agents With <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400">
              Zero Server API Fees.
            </span>
          </h1>

          <p className="text-zinc-400 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
            Offload expensive audio pipelines. VocalizeAI translates speech-to-text and synthesizes voice outputs directly inside the user's browser context. Complete zero-cost infrastructure.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <Link
              href="/dashboard"
              className="flex items-center space-x-2.5 px-8 py-4 bg-teal-500 hover:bg-teal-400 text-zinc-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-teal-500/10 active:scale-95 cursor-pointer w-full sm:w-auto justify-center"
            >
              <span>ACCESS DASHBOARD</span>
              <ArrowRight className="w-4.5 h-4.5" />
            </Link>
            
            <a
              href="#console-deck"
              className="px-8 py-4 border border-zinc-800 hover:border-zinc-700 bg-zinc-900/40 text-zinc-300 hover:text-white font-semibold rounded-xl text-sm transition-all cursor-pointer w-full sm:w-auto text-center hover:bg-zinc-850"
            >
              LAUNCH SIMULATOR
            </a>
          </div>

          {/* Real-time platform stats */}
          <div className="grid grid-cols-3 gap-4 pt-8 border-t border-zinc-900 max-w-md mx-auto lg:mx-0">
            <div>
              <div className="text-xl font-bold text-white font-mono">0.00ms</div>
              <div className="text-[10px] text-zinc-500 uppercase font-mono">Audio Latency</div>
            </div>
            <div>
              <div className="text-xl font-bold text-teal-400 font-mono">$0.00</div>
              <div className="text-[10px] text-zinc-500 uppercase font-mono">Per Minute</div>
            </div>
            <div>
              <div className="text-xl font-bold text-white font-mono">100%</div>
              <div className="text-[10px] text-zinc-500 uppercase font-mono">Local Audio</div>
            </div>
          </div>
        </div>

        {/* Right Side: Futuristic Synthesizer Console */}
        <div 
          id="console-deck"
          className="w-full max-w-xl rounded-2xl border border-zinc-800 bg-[#0c0c0f] p-6 space-y-6 flex flex-col shadow-2xl relative"
        >
          {/* Panel LED Bar */}
          <div className="flex justify-between items-center border-b border-zinc-850 pb-4">
            <div className="flex items-center space-x-2 text-[10px] font-mono tracking-widest text-zinc-400">
              <Terminal className="w-4 h-4 text-teal-400 animate-pulse" />
              <span>VOICE SIMULATOR DECK v2.4</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1 font-mono text-[9px] bg-zinc-950 px-2.5 py-1 rounded-md border border-zinc-850">
                <span className="text-zinc-500">STATE:</span>
                <span className={`font-bold ${
                  demoState === "disconnected" ? "text-zinc-500" :
                  demoState === "connecting" ? "text-amber-400" :
                  demoState === "thinking" ? "text-purple-400" : "text-emerald-400"
                }`}>
                  {demoState.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Preset Selectors */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">
              [SYSTEM_INTEGRATIONS] Select Agent Node:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {PRESETS.map((p) => {
                const isSelected = selectedPreset.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPreset(p)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between h-20 ${
                      isSelected
                        ? "bg-zinc-900 border-teal-500/40 text-white"
                        : "bg-zinc-950/50 border-zinc-850 hover:bg-zinc-900/40 text-zinc-400"
                    }`}
                    disabled={demoState !== "disconnected"}
                  >
                    <div className="flex justify-between items-start w-full">
                      <span className="text-xs font-bold font-mono text-white">{p.name}</span>
                      <span className="text-xs">{p.avatar}</span>
                    </div>
                    <div className="text-[9px] text-zinc-500 font-mono leading-tight">
                      {p.role}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Visual Waveform Screen */}
          <div className="relative w-full h-32 flex flex-col items-center justify-center bg-zinc-950 rounded-xl overflow-hidden border border-zinc-900 shadow-inner">
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-80 pointer-events-none" />
            
            <div className="absolute bottom-2 left-3 right-3 flex justify-between font-mono text-[8px] text-zinc-500 z-10">
              <div>PITCH: {selectedPreset.pitch}Hz</div>
              <div>RATE: {selectedPreset.rate}x</div>
              <div>BUFF: LOCAL_STREAM</div>
            </div>
          </div>

          {/* Log Console Transcript */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">
              [OUTPUT_LOGGER] Neural Transcripts:
            </span>
            <div className="w-full h-32 overflow-y-auto border border-zinc-850 bg-zinc-950 rounded-xl p-3.5 space-y-3 font-mono text-[10px] scrollbar-thin">
              {demoTranscript.length === 0 ? (
                <div className="h-full flex items-center justify-center text-center text-zinc-650 italic">
                  // DIAL TELEMETRY TO ENGAGE LOCAL LINK ROUTER
                </div>
              ) : (
                <div className="space-y-3">
                  {demoTranscript.map((msg, idx) => (
                    <div key={idx} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                      <div className={`px-3 py-1.5 rounded-lg border max-w-[85%] leading-relaxed ${
                        msg.role === "user" 
                          ? "bg-zinc-900 border-zinc-800 text-zinc-350" 
                          : "bg-teal-950/20 border-teal-500/10 text-teal-400"
                      }`}>
                        <span className="text-[8px] text-zinc-500 block mb-0.5 font-bold tracking-wider">
                          {msg.role === "user" ? "USER_PROMPT" : selectedPreset.name}
                        </span>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {demoLiveSpeech && (
                    <div className="flex flex-col items-end animate-pulse">
                      <div className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 border-dashed text-zinc-500 italic">
                        <span className="text-[8px] text-zinc-650 block mb-0.5 font-bold">SPEAKING...</span>
                        {demoLiveSpeech}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Control Deck */}
          <div className="grid grid-cols-3 gap-4 items-center bg-zinc-950/80 p-4 rounded-xl border border-zinc-900">
            <div className="font-mono text-[9px] text-zinc-500 space-y-1">
              <div className="flex justify-between">
                <span>LATENCY:</span>
                <span className="text-white font-bold">{latency}ms</span>
              </div>
              <div className="flex justify-between">
                <span>CPU_LOAD:</span>
                <span className="text-white font-bold">{cpuUsage}%</span>
              </div>
            </div>

            <div className="flex justify-center">
              {demoState === "disconnected" ? (
                <button
                  onClick={startDemoCall}
                  className="p-4 rounded-full bg-teal-500 text-zinc-950 font-bold hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-lg shadow-teal-500/20 border border-teal-400/20"
                  title="INITIALIZE CONSOLE LINK"
                >
                  <Phone className="w-5.5 h-5.5 fill-zinc-950" />
                </button>
              ) : (
                <button
                  onClick={hangUpDemoCall}
                  className="p-4 rounded-full bg-rose-600 text-white font-bold hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-lg shadow-rose-600/30 border border-rose-500/20"
                  title="TERMINATE SESSION"
                >
                  <PhoneOff className="w-5.5 h-5.5 fill-white" />
                </button>
              )}
            </div>

            <div className="font-mono text-[9px] text-zinc-500 space-y-1 text-right">
              <div>TIME: {formatTimer(callDuration)}</div>
              <div>RATE: 48.0kHz</div>
            </div>
          </div>
        </div>
      </main>

      {/* Cost Savings Calculator */}
      <section className="max-w-4xl mx-auto px-6 py-20 relative z-10">
        <div className="p-8 rounded-2xl border border-zinc-800 bg-[#09090b] space-y-8 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-teal-500/5 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="space-y-2 text-center">
            <span className="text-[10px] font-mono tracking-widest text-teal-400 uppercase">[COMPUTE_METRICS]</span>
            <h2 className="text-2xl font-black text-white tracking-tight">API Cost Reduction Simulator</h2>
            <p className="text-zinc-400 text-xs max-w-md mx-auto">
              Drag the volume query slider to estimate monthly cloud pipeline savings vs client offloads.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-4">
            <div className="space-y-4">
              <div className="flex justify-between text-xs font-mono text-zinc-300">
                <span>SIMULATED MINUTES / MONTH</span>
                <span className="text-teal-400 font-bold">{calcMinutes.toLocaleString()} MINS</span>
              </div>
              <input
                type="range"
                min="2000"
                max="150000"
                step="2000"
                value={calcMinutes}
                onChange={(e) => setCalcMinutes(parseInt(e.target.value))}
                className="w-full h-1 bg-zinc-850 rounded-lg appearance-none cursor-pointer accent-teal-500"
              />
              <div className="flex justify-between text-[9px] font-mono text-zinc-650">
                <span>2,000</span>
                <span>75,000</span>
                <span>150,000</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-900 text-center font-mono">
                <span className="text-[9px] text-zinc-500 uppercase block tracking-wider">Metered APIs</span>
                <div className="text-xl font-bold text-zinc-400 mt-1">${(calcMinutes * 0.15).toLocaleString()}</div>
                <span className="text-[8px] text-zinc-600 block mt-0.5">($0.15 / min average)</span>
              </div>
              <div className="p-4 rounded-xl bg-teal-950/20 border border-teal-500/20 text-center font-mono relative overflow-hidden group">
                <span className="text-[9px] text-teal-400 uppercase block tracking-wider">VocalizeAI</span>
                <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400 mt-1">$0.00</div>
                <span className="text-[8px] text-emerald-500/80 block mt-0.5 font-bold">CLIENT_SYNTHESIS</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Columns */}
      <section className="py-16 relative z-10 max-w-7xl mx-auto px-6 border-t border-zinc-900">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="p-6 rounded-2xl border border-zinc-900 bg-zinc-950/20 hover:border-zinc-800 transition-all space-y-4">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Local Processor Offloading</h3>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Redirect resource loads from backend clusters down to Web Speech rendering scripts. Eliminate central audio servers.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-zinc-900 bg-zinc-950/20 hover:border-zinc-800 transition-all space-y-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Gauge className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Direct Hardware Synthesizers</h3>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Bypass web sockets for local playback, responding to speech transcription buffers with zero latency.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-zinc-900 bg-zinc-950/20 hover:border-zinc-800 transition-all space-y-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
              <Coins className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Token Bucket Pools</h3>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Mitigate developer LLM costs with custom mutations checking rate boundaries, credit tokens, and caps.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="max-w-4xl mx-auto px-6 py-16 relative z-10 space-y-10">
        <div className="text-center space-y-2">
          <HelpCircle className="w-7 h-7 text-teal-400 mx-auto" />
          <h2 className="text-2xl font-black text-white tracking-tight">Frequently Asked Questions</h2>
          <p className="text-zinc-400 text-xs">Essential details concerning the VocalizeAI architecture.</p>
        </div>

        <div className="space-y-3.5">
          {FAQS.map((faq, index) => (
            <div 
              key={index}
              className="border border-zinc-850 bg-zinc-950/40 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                className="w-full flex justify-between items-center p-5 text-left text-xs font-bold text-white hover:bg-zinc-900/30 transition-colors cursor-pointer font-mono"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform duration-200 ${activeFaq === index ? "rotate-180" : ""}`} />
              </button>
              
              {activeFaq === index && (
                <div className="p-5 pt-0 border-t border-zinc-850/40 text-xs text-zinc-400 leading-relaxed font-sans">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900/80 py-12 text-center text-xs text-zinc-500 relative z-10 space-y-4">
        <p className="font-mono text-[10px]">© 2026 VOCALIZE.AI // CONNECTED SYSTEM</p>
        <div className="flex justify-center gap-4 text-zinc-400">
          <Link href="/privacy" className="hover:text-teal-400 transition">Privacy Policy</Link>
          <span className="text-zinc-800">•</span>
          <Link href="/terms" className="hover:text-teal-400 transition">Terms of Service</Link>
        </div>
      </footer>
    </div>
  );
}
