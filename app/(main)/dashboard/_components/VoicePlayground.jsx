"use client";
import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@stackframe/stack";
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Volume2, 
  Sparkles, 
  AlertTriangle,
  Send,
  RefreshCw,
  Info
} from "lucide-react";

function VoicePlayground() {
  const user = useUser();
  const email = user?.primaryEmail;
  const searchParams = useSearchParams();
  const targetAgentId = searchParams.get("agentId");

  // Reactively fetch user and agents from Convex
  const dbUser = useQuery(api.user.getUser, email ? { email } : "skip");
  const agents = useQuery(api.agent.getAgents, email ? { createdBy: email } : "skip");
  const saveCallMutation = useMutation(api.call.saveCall);
  const deductCreditsMutation = useMutation(api.user.deductCredits);

  // Active state configs
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [selectedAgent, setSelectedAgent] = useState(null);
  
  // Call status
  const [callState, setCallState] = useState("disconnected"); // disconnected | connecting | listening | thinking | speaking
  const callStateRef = useRef("disconnected");
  const updateCallState = (newState) => {
    setCallState(newState);
    callStateRef.current = newState;
  };
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [liveTranscription, setLiveTranscription] = useState("");
  const [callDuration, setCallDuration] = useState(0);
  const [browserSupport, setBrowserSupport] = useState({ speechRec: true });

  // Refs for audio context and speech synthesis
  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const micStreamRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const callTimerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Stale closure guards
  const transcriptRef = useRef([]);
  const liveTranscriptionRef = useRef("");

  const updateTranscript = (newVal) => {
    setTranscript(newVal);
    transcriptRef.current = newVal;
  };

  // Auto-select agent if passed in URL
  useEffect(() => {
    if (agents && targetAgentId) {
      const matched = agents.find(a => a._id === targetAgentId);
      if (matched) {
        setSelectedAgentId(targetAgentId);
      }
    } else if (agents && agents.length > 0 && !selectedAgentId) {
      setSelectedAgentId(agents[0]._id);
    }
  }, [agents, targetAgentId]);

  // Update selected agent details
  useEffect(() => {
    if (agents && selectedAgentId) {
      const agent = agents.find(a => a._id === selectedAgentId);
      setSelectedAgent(agent);
    }
  }, [agents, selectedAgentId]);

  // Detect speech recognition support
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setBrowserSupport({ speechRec: false });
      }
    }
  }, []);

  // Visual Waveform rendering
  useEffect(() => {
    if (canvasRef.current) {
      renderWaveform();
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [callState]);

  // Monitor call duration
  useEffect(() => {
    if (callState !== "disconnected" && callState !== "connecting") {
      callTimerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
      setCallDuration(0);
    }
    return () => {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    };
  }, [callState]);

  // Canvas waveform visualizer loop
  const renderWaveform = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;

    let phase = 0;
    
    // Web audio mic level variables
    let dataArray = null;
    if (analyserRef.current) {
      const bufferLength = analyserRef.current.frequencyBinCount;
      dataArray = new Uint8Array(bufferLength);
    }

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      let baseRadius = 80;

      // React to microphone level if listening and we have audio data
      let amplitude = 4;
      if (callState === "listening" && analyserRef.current && dataArray && !isMuted) {
        analyserRef.current.getByteTimeDomainData(dataArray);
        let maxVal = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const val = Math.abs(dataArray[i] - 128);
          if (val > maxVal) maxVal = val;
        }
        amplitude = 4 + (maxVal * 1.5); // scale mic level
      } else if (callState === "speaking") {
        amplitude = 12 + Math.sin(phase * 4) * 8; // generic speaking pulse
      } else if (callState === "thinking") {
        amplitude = 6;
      } else if (callState === "connecting") {
        amplitude = 10;
        baseRadius = 80 + Math.sin(phase * 2) * 5;
      } else {
        amplitude = 1; // flat/disconnected
      }

      // Draw multiple glowing rings
      const ringCount = callState === "disconnected" ? 1 : 3;
      for (let r = 0; r < ringCount; r++) {
        ctx.beginPath();
        const rOffset = r * 15;
        const speed = 0.05 + r * 0.01;
        const currentRadius = baseRadius + rOffset;

        ctx.strokeStyle = callState === "speaking" 
          ? `rgba(20, 184, 166, ${0.8 - r * 0.2})`  // Teal
          : callState === "listening"
            ? `rgba(16, 185, 129, ${0.8 - r * 0.2})` // Emerald
            : callState === "thinking"
              ? `rgba(168, 85, 247, ${0.8 - r * 0.2})` // Purple
              : `rgba(63, 63, 70, ${0.6 - r * 0.2})`;  // Dark zinc

        ctx.lineWidth = r === 0 ? 3 : 1.5;
        if (callState !== "disconnected") {
          ctx.shadowBlur = 15;
          ctx.shadowColor = callState === "speaking" ? "#14b8a6" : callState === "listening" ? "#10b981" : "#a855f7";
        } else {
          ctx.shadowBlur = 0;
        }

        // Draw sine wave around circle
        const segments = 120;
        for (let i = 0; i <= segments; i++) {
          const angle = (i / segments) * Math.PI * 2;
          // Wave modulation
          const wave = Math.sin(angle * 6 + phase + r) * amplitude;
          const radialRadius = currentRadius + wave;
          const x = centerX + Math.cos(angle) * radialRadius;
          const y = centerY + Math.sin(angle) * radialRadius;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.closePath();
        ctx.stroke();
      }

      phase += 0.05;
    };

    draw();
  };

  // Start microphonse analyzer for live visual feedback
  const startMicAnalyzer = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const audioContext = new AudioContextClass();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;
    } catch (err) {
      console.error("Failed to access microphone for visualizer:", err);
    }
  };

  // Stop microphone visualizer stream
  const stopMicAnalyzer = () => {
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
      micStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;
  };

  // Start Call
  const handleStartCall = async () => {
    if (!selectedAgent) {
      alert("Please select or create an agent first!");
      return;
    }
    if (dbUser?.credits <= 0) {
      alert("You are out of credits! Please claim free credits in the Billing tab.");
      return;
    }

    updateCallState("connecting");
    updateTranscript([{ role: "agent", text: selectedAgent.welcomeMessage }]);
    liveTranscriptionRef.current = "";
    setLiveTranscription("");

    // Initialize mic and visualizer
    await startMicAnalyzer();

    // Small delay to simulate connection
    setTimeout(() => {
      speakAgentResponse(selectedAgent.welcomeMessage);
    }, 1000);
  };

  // Speak agent response text via Web SpeechSynthesis
  const speakAgentResponse = (text) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      // Fallback if no SpeechSynthesis
      updateCallState("listening");
      startListening();
      return;
    }

    // Interruption / cancel any active speech
    window.speechSynthesis.cancel();

    // Echo prevention: stop recognition while speaking
    stopListening();

    updateCallState("speaking");

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = selectedAgent.voiceLang || "en-US";
    utterance.pitch = parseFloat(selectedAgent.pitch || 1.0);
    utterance.rate = parseFloat(selectedAgent.rate || 1.0);

    // Find custom voice matching lang & gender
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(v => {
      const vLang = v.lang.toLowerCase();
      const vName = v.name.toLowerCase();
      const targetLang = utterance.lang.toLowerCase().split("-")[0];
      const langMatch = vLang.startsWith(targetLang);
      let genderMatch = true;
      if (selectedAgent.voiceGender === "female") {
        genderMatch = vName.includes("zira") || vName.includes("samantha") || vName.includes("hazel") || vName.includes("google us english") || vName.includes("female");
      } else if (selectedAgent.voiceGender === "male") {
        genderMatch = vName.includes("david") || vName.includes("daniel") || vName.includes("google uk english") || vName.includes("male");
      }
      return langMatch && genderMatch;
    });

    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onend = () => {
      // Transition back to listening
      updateCallState("listening");
      startListening();
    };

    utterance.onerror = (e) => {
      console.error("SpeechSynthesis error:", e);
      updateCallState("listening");
      startListening();
    };

    window.speechSynthesis.speak(utterance);
  };

  // Start Speech Recognition (ASR)
  const startListening = () => {
    if (isMuted || callStateRef.current === "disconnected") return;

    // Check Chrome browser-native ASR
    if (browserSupport.speechRec) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = selectedAgent.voiceLang || "en-US";

      rec.onstart = () => {
        // Barge-in: if synthesis is speaking when mic triggers, cancel active speech
        if (window.speechSynthesis && window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
          updateCallState("listening");
        }
      };

      rec.onresult = (event) => {
        const resultIndex = event.resultIndex;
        const result = event.results[resultIndex];
        const transcriptText = result[0].transcript;
        liveTranscriptionRef.current = transcriptText;
        setLiveTranscription(transcriptText);

        // Barge-in check (cancels TTS on user utterance input)
        if (window.speechSynthesis && window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
          updateCallState("listening");
        }

        // ChatGPT style: immediately finalize when the speech engine says it's final
        if (result.isFinal) {
          rec.stop();
        }
      };

      rec.onend = () => {
        // Speech ended, process turn
        const finalUtterance = liveTranscriptionRef.current || rec.finalTranscript || "";
        liveTranscriptionRef.current = "";
        setLiveTranscription("");

        if (finalUtterance.trim()) {
          processUserSpeech(finalUtterance.trim());
        } else if (callStateRef.current === "listening") {
          // Restart recognition if user didn't speak but call is active
          // Delay restart slightly to let browser clean up speech components
          setTimeout(() => {
            try {
              if (callStateRef.current === "listening" && recognitionRef.current === rec) {
                rec.start();
              }
            } catch (e) {}
          }, 150);
        }
      };

      rec.onerror = (e) => {
        if (e.error !== "no-speech") {
          console.warn("SpeechRec error:", e.error);
        }
      };

      recognitionRef.current = rec;
      rec.start();
    } else {
      // Universal Fallback: MediaRecorder audio transcription (Firefox / Safari)
      startMediaRecording();
    }
  };

  // Stop Speech Recognition
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.onerror = null;
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    stopMediaRecording();
  };

  // MediaRecorder utilities for Groq Whisper transcription fallback
  const startMediaRecording = async () => {
    if (!micStreamRef.current) return;
    try {
      audioChunksRef.current = [];
      const options = { mimeType: "audio/webm" };
      const recorder = new MediaRecorder(micStreamRef.current, options);
      
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        if (audioChunksRef.current.length === 0) return;
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await uploadAudioBlob(audioBlob);
      };

      mediaRecorderRef.current = recorder;
      recorder.start(250); // collect chunks every 250ms
    } catch (e) {
      console.error("Failed to start MediaRecorder fallback:", e);
    }
  };

  const stopMediaRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  };

  // Triggered manually in fallback mode when user stops speaking or clicks button
  const handleTriggerUpload = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      setCallState("thinking");
      mediaRecorderRef.current.stop();
    }
  };

  const uploadAudioBlob = async (blob) => {
    try {
      const formData = new FormData();
      formData.append("file", blob);

      const res = await fetch("/api/transcribe", {
        method: "POST",
        body: formData
      });

      if (!res.ok) {
        const err = await res.json();
        console.error("Transcribe API Error:", err.error);
        speakAgentResponse("Sorry, I had trouble transcribing your audio. Can you try again?");
        return;
      }

      const data = await res.json();
      if (data.text && data.text.trim()) {
        await processUserSpeech(data.text);
      } else {
        // restart listening if nothing recognized
        setCallState("listening");
        startListening();
      }
    } catch (err) {
      console.error("Transcribe API request failed:", err);
      speakAgentResponse("Sorry, a server network error occurred. Please try again.");
    }
  };

  // Process user input (Speech-to-Text resolved)
  const processUserSpeech = async (speechText) => {
    // Add user message to transcript feed
    const updatedHistory = [...transcriptRef.current, { role: "user", text: speechText }];
    updateTranscript(updatedHistory);
    setCallState("thinking");

    try {
      // Call Chat Completion route securely
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          instructions: selectedAgent.instructions,
          userInput: speechText,
          history: transcriptRef.current,
          voiceGender: selectedAgent.voiceGender
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        const msg = errorData.error || "A call server error occurred.";
        speakAgentResponse(msg);
        updateTranscript([...transcriptRef.current, { role: "agent", text: msg }]);
        return;
      }

      const result = await res.json();
      
      // Add agent reply to history
      updateTranscript([...transcriptRef.current, { role: "agent", text: result.text }]);
      
      // Speak reply
      speakAgentResponse(result.text);

    } catch (err) {
      console.error("Failed to fetch chat response:", err);
      const fallbackMsg = "I apologize, my communication bridge is offline. Please try speaking again.";
      speakAgentResponse(fallbackMsg);
      updateTranscript([...transcriptRef.current, { role: "agent", text: fallbackMsg }]);
    }
  };

  // Hang Up Call
  const handleEndCall = async () => {
    updateCallState("disconnected");
    stopListening();
    stopMicAnalyzer();

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    // Save logs to database & deduct duration credits
    if (transcriptRef.current.length > 0 && selectedAgent) {
      try {
        const duration = callDuration;
        
        // Simple client-side sentiment analysis (100% Free / Immediate)
        let sentiment = "Neutral";
        const dialogueString = transcriptRef.current.map(t => t.text).join(" ").toLowerCase();
        const positiveKeywords = ["thank", "great", "perfect", "good", "happy", "love", "yes", "nice", "excellent"];
        const negativeKeywords = ["bad", "broken", "issue", "error", "fail", "slow", "annoyed", "unhappy", "angry", "no"];
        
        let posCount = positiveKeywords.filter(k => dialogueString.includes(k)).length;
        let negCount = negativeKeywords.filter(k => dialogueString.includes(k)).length;
        
        if (posCount > negCount + 1) sentiment = "Positive";
        else if (negCount > posCount) sentiment = "Negative";

        // Save Call Mutation
        await saveCallMutation({
          agentId: selectedAgent._id,
          agentName: selectedAgent.name,
          duration,
          status: "completed",
          transcript: transcriptRef.current,
          creditsUsed: duration, // 1 credit per second of call time
          createdBy: email,
        });

        // Deduct duration credits in Convex database
        await deductCreditsMutation({
          email,
          amount: duration
        });

      } catch (err) {
        console.error("Failed to save call records:", err);
      }
    }
  };

  // Toggle Microphone Mute
  const handleToggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      updateCallState("listening");
      // Wait a minor tick to restart recognition
      setTimeout(() => startListening(), 100);
    } else {
      setIsMuted(true);
      stopListening();
      updateCallState("listening"); // keeps visualization alive, but quiet
    }
  };

  // Format call duration
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const rSecs = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${rSecs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Voice Playground</h1>
        <p className="text-zinc-400 mt-1">Test your configured voice assistants in a live conversation cockpit.</p>
      </div>

      {/* Select Agent Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-zinc-900/40 border border-zinc-800 rounded-xl">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider shrink-0">Active Agent:</label>
          {agents === undefined ? (
            <div className="w-4 h-4 border border-zinc-700 border-t-transparent rounded-full animate-spin" />
          ) : agents.length === 0 ? (
            <span className="text-sm text-zinc-500 font-medium">Create an agent to test calling</span>
          ) : (
            <select
              value={selectedAgentId}
              onChange={(e) => setSelectedAgentId(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 focus:border-teal-500/80 outline-none rounded-lg px-3 py-1.5 text-sm text-white transition-all w-full sm:w-64"
              disabled={callState !== "disconnected"}
            >
              {agents.map((a) => (
                <option key={a._id} value={a._id}>{a.name} ({a.voiceGender})</option>
              ))}
            </select>
          )}
        </div>

        {/* Browser compatibility banner */}
        {!browserSupport.speechRec && (
          <div className="flex items-center space-x-2 text-xs font-medium text-amber-400 bg-amber-500/5 border border-amber-500/10 px-3 py-2 rounded-lg">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              ASR Fallback: Firefox/Safari detected. Press "Stop Speaking" below to transcribe audio.
            </span>
          </div>
        )}
      </div>

      {/* Cockpit Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Waveform Visualization Console */}
        <div className="lg:col-span-2 rounded-2xl border border-zinc-800 bg-zinc-900/10 p-8 flex flex-col items-center justify-between min-h-[420px] relative overflow-hidden">
          
          {/* Top Status */}
          <div className="text-center space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 block">
              Call Status
            </span>
            <span className={`text-sm font-semibold capitalize ${
              callState === "speaking" ? "text-teal-400" :
              callState === "listening" ? "text-emerald-400" :
              callState === "thinking" ? "text-purple-400" :
              callState === "connecting" ? "text-zinc-400 animate-pulse" : "text-zinc-500"
            }`}>
              {callState === "disconnected" ? "Offline" : 
               callState === "connecting" ? "Establishing connection..." :
               callState === "listening" ? (isMuted ? "Microphone Muted" : "Listening...") :
               callState === "thinking" ? "Thinking..." : "Speaking..."}
            </span>
          </div>

          {/* Glowing Waveform Canvas */}
          <div className="relative w-full flex-1 flex items-center justify-center min-h-[220px]">
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
            {callState !== "disconnected" && (
              <div className="absolute flex flex-col items-center justify-center space-y-1.5 text-center pointer-events-none">
                <span className="text-3xl font-mono font-bold tracking-widest text-white">
                  {formatTime(callDuration)}
                </span>
                <span className="text-[9px] font-semibold text-zinc-500 uppercase tracking-widest">
                  1 credit / sec
                </span>
              </div>
            )}
          </div>

          {/* Call Controls */}
          <div className="flex items-center space-x-6 z-10">
            {/* Mute Microphone */}
            {callState !== "disconnected" && (
              <button
                onClick={handleToggleMute}
                className={`p-3 rounded-full border transition-all active:scale-95 cursor-pointer ${
                  isMuted 
                    ? "bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20" 
                    : "bg-zinc-800/80 border-zinc-700/60 text-zinc-300 hover:bg-zinc-800"
                }`}
                title={isMuted ? "Unmute Mic" : "Mute Mic"}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
            )}

            {/* Connect / Hang Up */}
            {callState === "disconnected" ? (
              <button
                onClick={handleStartCall}
                disabled={!selectedAgent}
                className="p-5 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-zinc-950 font-bold shadow-lg shadow-teal-500/10 active:scale-95 transition-all cursor-pointer disabled:opacity-40"
                title="Start Call"
              >
                <Phone className="w-6 h-6 fill-zinc-950" />
              </button>
            ) : (
              <button
                onClick={handleEndCall}
                className="p-5 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-lg shadow-rose-500/20 active:scale-95 transition-all cursor-pointer"
                title="Hang Up"
              >
                <PhoneOff className="w-6 h-6 fill-white" />
              </button>
            )}

            {/* Manual Trancribe push-to-talk button for Firefox/Safari */}
            {callState === "listening" && !browserSupport.speechRec && (
              <button
                onClick={handleTriggerUpload}
                className="p-3 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 hover:bg-teal-500/20 active:scale-95 transition-all cursor-pointer animate-pulse"
                title="Stop Speaking & Transcribe"
              >
                <Send className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Live Conversation Transcript Panel */}
        <div className="lg:col-span-3 rounded-2xl border border-zinc-800 bg-zinc-900/15 p-6 flex flex-col justify-between min-h-[420px] max-h-[500px]">
          <div className="flex justify-between items-center pb-4 border-b border-zinc-800/80 mb-4 shrink-0">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span>Live Transcript</span>
            </h2>
            <div className="text-zinc-500 text-xs font-semibold">
              {callState === "disconnected" ? "No Active Call" : "Recording..."}
            </div>
          </div>

          {/* Transcript Scroll Area */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
            {transcript.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <Volume2 className="w-8 h-8 text-zinc-700 mb-2" />
                <span className="text-sm font-semibold text-zinc-400">Audio Stream Closed</span>
                <p className="text-xs text-zinc-500 mt-1 max-w-[240px]">
                  Click the green phone icon to establish a call with {selectedAgent?.name || "the agent"}.
                </p>
              </div>
            ) : (
              <div className="space-y-4 text-sm">
                {transcript.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col max-w-[85%] ${
                      msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
                    }`}
                  >
                    <span className="text-[10px] text-zinc-500 font-semibold mb-1 uppercase tracking-wider">
                      {msg.role === "user" ? "You" : selectedAgent?.name}
                    </span>
                    <div
                      className={`px-3 py-2 rounded-xl border leading-relaxed ${
                        msg.role === "user"
                          ? "bg-zinc-800/50 border-zinc-700 text-zinc-200 rounded-tr-none"
                          : "bg-teal-500/5 border-teal-500/10 text-teal-300 rounded-tl-none shadow-[inset_0_1px_0_0_rgba(20,184,166,0.05)]"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}

                {/* Show User Speech recognition buffer preview */}
                {liveTranscription && (
                  <div className="flex flex-col max-w-[85%] ml-auto items-end animate-pulse">
                    <span className="text-[10px] text-zinc-500 font-semibold mb-1 uppercase tracking-wider">You (speaking...)</span>
                    <div className="px-3 py-2 rounded-xl rounded-tr-none bg-zinc-800/20 border border-zinc-800 border-dashed text-zinc-400 italic">
                      {liveTranscription}
                    </div>
                  </div>
                )}

                {/* Show thinking loader */}
                {callState === "thinking" && (
                  <div className="flex flex-col max-w-[80px] mr-auto items-start">
                    <span className="text-[10px] text-zinc-500 font-semibold mb-1 uppercase tracking-wider">
                      {selectedAgent?.name}
                    </span>
                    <div className="px-3.5 py-2.5 rounded-xl rounded-tl-none bg-teal-500/5 border border-teal-500/10 flex items-center space-x-1">
                      <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-zinc-800/80 mt-4 shrink-0 flex items-center justify-between text-[10px] text-zinc-500">
            <div className="flex items-center space-x-1.5">
              <Info className="w-3.5 h-3.5" />
              <span>Voice recognition and synthesizer run 100% free locally</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VoicePlayground;
