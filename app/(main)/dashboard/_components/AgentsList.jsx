"use client";
import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@stackframe/stack";
import { useRouter } from "next/navigation";
import { 
  Plus, 
  Trash2, 
  Play, 
  Volume2, 
  Settings, 
  X,
  FileText,
  User,
  Sliders,
  ChevronRight,
  Info
} from "lucide-react";

// Predefined agent prompt templates
const TEMPLATES = [
  {
    title: "Pizza Restaurant Assistant",
    name: "Tony the Pizza Bot",
    welcome: "Grazie! Thanks for calling Tony's Pizza. What kind of pizza can I get started for you today?",
    instructions: "You are Tony, a friendly and highly energetic Italian pizza shop assistant. Speak with a warm, slightly expressive, customer-friendly voice. Help callers order pizzas, explain toppings (pepperoni, mushrooms, onions, extra cheese), describe sizes (small, medium, large), calculate delivery times (always 30-40 minutes), and sum up prices. Keep replies short, quick, and conversational.",
    gender: "male"
  },
  {
    title: "Customer Support Agent",
    name: "Emma",
    welcome: "Hello! Thank you for calling Customer Support. My name is Emma. How can I help you today?",
    instructions: "You are Emma, a professional, calm, and extremely polite customer service agent. You work for a modern tech hardware marketplace. Assist users with shipment questions, missing orders, refund requests, and product compatibility queries. Keep a helpful, empathetic tone. Answer concise, clear sentences.",
    gender: "female"
  },
  {
    title: "Spanish Tutor Bot",
    name: "Mateo",
    welcome: "¡Hola! Bienvenidos. I am Mateo, your interactive Spanish tutor. Are you ready to practice speaking Spanish today?",
    instructions: "You are Mateo, an encouraging and patient Spanish language tutor. Alternate your dialogue: speak in simple Spanish phrases, then immediately translate or explain them in friendly English. Praise the user when they respond. Correct mistakes gently. Keep replies simple and brief to help them learn.",
    gender: "male",
    lang: "es-ES"
  },
  {
    title: "IT Support Helpdesk",
    name: "Alex",
    welcome: "Hi, you've reached IT Helpdesk Support. This is Alex speaking. What system issues are we troubleshooting today?",
    instructions: "You are Alex, an expert, analytical, and highly technical support technician. Diagnose customer computer issues: slow operation, forgot passwords, wifi drops, or email failures. Ask clarifying questions one step at a time. Do not overwhelm the user. Keep it brief, supportive, and direct.",
    gender: "neutral"
  }
];

function AgentsList({ setActiveTab }) {
  const user = useUser();
  const email = user?.primaryEmail;
  const router = useRouter();

  const agents = useQuery(api.agent.getAgents, email ? { createdBy: email } : "skip");
  const createAgentMutation = useMutation(api.agent.createAgent);
  const deleteAgentMutation = useMutation(api.agent.deleteAgent);

  const [modalOpen, setModalOpen] = useState(false);
  
  // Form states
  const [name, setName] = useState("");
  const [instructions, setInstructions] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [voiceGender, setVoiceGender] = useState("female");
  const [voiceLang, setVoiceLang] = useState("en-US");
  const [pitch, setPitch] = useState(1.0);
  const [rate, setRate] = useState(1.0);

  const [testSpeaking, setTestSpeaking] = useState(false);

  // Apply template values to form fields
  const applyTemplate = (tpl) => {
    setName(tpl.name);
    setInstructions(tpl.instructions);
    setWelcomeMessage(tpl.welcome);
    setVoiceGender(tpl.gender);
    if (tpl.lang) setVoiceLang(tpl.lang);
  };

  // Test the configured SpeechSynthesis voice in the browser
  const handleTestVoice = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    // Cancel any active speech synthesis
    window.speechSynthesis.cancel();

    setTestSpeaking(true);
    const testPhrase = `Hi! My name is ${name || "Assistant"}. How does my custom voice sound to you?`;
    const utterance = new SpeechSynthesisUtterance(testPhrase);
    utterance.lang = voiceLang;
    utterance.pitch = parseFloat(pitch);
    utterance.rate = parseFloat(rate);

    // Get list of voices
    const voices = window.speechSynthesis.getVoices();
    
    // Attempt voice matching based on gender and language
    const matchedVoice = voices.find(v => {
      const vLang = v.lang.toLowerCase();
      const vName = v.name.toLowerCase();
      const targetLang = voiceLang.toLowerCase().split("-")[0]; // e.g. "en"
      
      const langMatch = vLang.startsWith(targetLang);
      
      let genderMatch = true;
      if (voiceGender === "female") {
        genderMatch = vName.includes("zira") || vName.includes("samantha") || vName.includes("hazel") || vName.includes("google us english") || vName.includes("female");
      } else if (voiceGender === "male") {
        genderMatch = vName.includes("david") || vName.includes("daniel") || vName.includes("google uk english") || vName.includes("male");
      }
      return langMatch && genderMatch;
    });

    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onend = () => setTestSpeaking(false);
    utterance.onerror = () => setTestSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const [notification, setNotification] = useState(null); // { message: string, type: "error" | "success" | "info" }
  const [deleteConfirmId, setDeleteConfirmId] = useState(null); // ID of agent to delete

  const showNotification = (message, type = "info") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleCreateAgent = async (e) => {
    e.preventDefault();
    if (!name || !instructions || !welcomeMessage) {
      showNotification("Please fill in all fields.", "error");
      return;
    }

    try {
      await createAgentMutation({
        name,
        instructions,
        welcomeMessage,
        voiceGender,
        voiceLang,
        pitch: parseFloat(pitch),
        rate: parseFloat(rate),
        createdBy: email,
      });

      // Reset
      setName("");
      setInstructions("");
      setWelcomeMessage("");
      setVoiceGender("female");
      setVoiceLang("en-US");
      setPitch(1.0);
      setRate(1.0);
      setModalOpen(false);
      showNotification("Agent created successfully!", "success");
    } catch (err) {
      console.error(err);
      showNotification("Failed to create agent", "error");
    }
  };

  const confirmDeleteAgent = async () => {
    if (!deleteConfirmId) return;
    try {
      await deleteAgentMutation({ agentId: deleteConfirmId, userId: email });
      showNotification("Agent deleted successfully", "success");
    } catch (err) {
      console.error(err);
      showNotification("Failed to delete agent", "error");
    } finally {
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Voice Agents</h1>
          <p className="text-zinc-400 mt-1">Configure and manage your custom conversational assistants.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-zinc-950 font-bold rounded-lg text-sm transition-all duration-200 shadow-lg shadow-teal-500/10 active:scale-95 cursor-pointer"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>New Agent</span>
        </button>
      </div>

      {/* Agents Grid */}
      {agents === undefined ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : agents.length === 0 ? (
        <div className="border border-dashed border-zinc-800 rounded-2xl p-16 text-center max-w-xl mx-auto mt-6 bg-zinc-900/10">
          <User className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white">No Agents Configured</h3>
          <p className="text-sm text-zinc-500 mt-2 max-w-sm mx-auto">
            Get started by creating a new voice assistant. You can choose a pre-configured template to jump-start configuration!
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="mt-6 px-4 py-2 border border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800/40 text-zinc-300 font-semibold rounded-lg text-sm transition-all cursor-pointer"
          >
            Create first agent
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <div 
              key={agent._id} 
              className="group relative rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 flex flex-col justify-between hover:border-zinc-700 hover:bg-zinc-900/50 transition-all duration-300 hover:shadow-[0_4px_30px_rgba(20,184,166,0.02)]"
            >
              <div>
                {/* Agent Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-teal-400 transition-colors">
                      {agent.name}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                        {agent.voiceGender} ({agent.voiceLang})
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setDeleteConfirmId(agent._id)}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                    title="Delete Agent"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3.5 mb-6 text-sm">
                  {/* Welcome Message */}
                  <div className="bg-zinc-950/40 border border-zinc-800/60 rounded-lg p-2.5">
                    <span className="text-[10px] text-zinc-500 font-semibold block mb-0.5">Welcome Message</span>
                    <p className="text-zinc-300 leading-snug italic text-xs">"{agent.welcomeMessage}"</p>
                  </div>

                  {/* System Prompt Snippet */}
                  <div>
                    <span className="text-[10px] text-zinc-500 font-semibold block mb-0.5">System prompt</span>
                    <p className="text-zinc-400 line-clamp-2 text-xs leading-relaxed">{agent.instructions}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between">
                <div className="flex space-x-2 text-xs text-zinc-500 font-medium">
                  <span>Pitch: {agent.pitch}x</span>
                  <span>•</span>
                  <span>Rate: {agent.rate}x</span>
                </div>
                <button
                  onClick={() => {
                    router.push(`/dashboard?tab=playground&agentId=${agent._id}`);
                  }}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 font-semibold rounded-lg text-xs transition-colors border border-teal-500/20 active:scale-95 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-teal-400" />
                  <span>Call Agent</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Creation Modal overlay */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-800">
              <div>
                <h2 className="text-lg font-bold text-white">Create Voice Agent</h2>
                <p className="text-xs text-zinc-500 mt-0.5">Create your agent prompt, configuration, and browser voices</p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleCreateAgent} className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
              
              {/* Template quick-pick */}
              <div>
                <span className="text-xs font-semibold text-zinc-400 block mb-2">Start with a Template (Optional)</span>
                <div className="grid grid-cols-2 gap-3.5">
                  {TEMPLATES.map((tpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => applyTemplate(tpl)}
                      className="p-3 text-left rounded-lg border border-zinc-800/80 hover:border-teal-500/40 hover:bg-zinc-800/20 bg-zinc-900/60 transition-all duration-200 group flex justify-between items-center cursor-pointer"
                    >
                      <div className="truncate pr-2">
                        <span className="font-semibold text-xs text-zinc-300 block group-hover:text-teal-400 transition-colors">
                          {tpl.title}
                        </span>
                        <span className="text-[10px] text-zinc-500">Preset: {tpl.name}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-teal-400 group-hover:translate-x-0.5 transition-all" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-zinc-800/60 pt-4 space-y-4">
                {/* Agent Name */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Agent Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Support Bot, John"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-teal-500/80 focus:ring-1 focus:ring-teal-500/40 outline-none rounded-lg px-3 py-2 text-white placeholder-zinc-600 transition-all"
                  />
                </div>

                {/* System Prompt Instructions */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">System Prompt Instructions</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Define the behavior, identity, rules, and scope of conversation..."
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-teal-500/80 focus:ring-1 focus:ring-teal-500/40 outline-none rounded-lg px-3 py-2 text-white placeholder-zinc-600 transition-all leading-relaxed"
                  />
                </div>

                {/* Welcome Message */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Welcome Message (Opening line)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Hello, thanks for calling! How can I help you?"
                    value={welcomeMessage}
                    onChange={(e) => setWelcomeMessage(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-teal-500/80 focus:ring-1 focus:ring-teal-500/40 outline-none rounded-lg px-3 py-2 text-white placeholder-zinc-600 transition-all"
                  />
                </div>

                {/* Dual settings Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Language */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Voice Language</label>
                    <select
                      value={voiceLang}
                      onChange={(e) => setVoiceLang(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-teal-500/80 focus:ring-1 focus:ring-teal-500/40 outline-none rounded-lg px-3 py-2 text-white transition-all"
                    >
                      <option value="en-US">English (US)</option>
                      <option value="en-GB">English (UK)</option>
                      <option value="es-ES">Spanish (Spain)</option>
                      <option value="fr-FR">French (France)</option>
                      <option value="de-DE">German (Germany)</option>
                    </select>
                  </div>

                  {/* Gender Matcher */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Voice Gender Preference</label>
                    <select
                      value={voiceGender}
                      onChange={(e) => setVoiceGender(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-teal-500/80 focus:ring-1 focus:ring-teal-500/40 outline-none rounded-lg px-3 py-2 text-white transition-all"
                    >
                      <option value="female">Female preference</option>
                      <option value="male">Male preference</option>
                      <option value="neutral">Neutral/Default</option>
                    </select>
                  </div>
                </div>

                {/* Sliders and Tester */}
                <div className="p-4 bg-zinc-950/40 border border-zinc-800/80 rounded-xl space-y-4">
                  <div className="flex items-center space-x-2 text-teal-400 text-xs font-semibold mb-2">
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Fine-tune Voice Synthesis</span>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    {/* Pitch */}
                    <div>
                      <div className="flex justify-between text-xs text-zinc-400 mb-1">
                        <span>Pitch:</span>
                        <span className="font-semibold text-white">{pitch}x</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="2.0"
                        step="0.1"
                        value={pitch}
                        onChange={(e) => setPitch(e.target.value)}
                        className="w-full accent-teal-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    {/* Rate */}
                    <div>
                      <div className="flex justify-between text-xs text-zinc-400 mb-1">
                        <span>Speed (Rate):</span>
                        <span className="font-semibold text-white">{rate}x</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="2.0"
                        step="0.1"
                        value={rate}
                        onChange={(e) => setRate(e.target.value)}
                        className="w-full accent-teal-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-zinc-800/40">
                    <div className="flex items-center space-x-1 text-[10px] text-zinc-500">
                      <Info className="w-3 h-3" />
                      <span>Speaks using browser local engines</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleTestVoice}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        testSpeaking
                          ? "bg-teal-500/20 text-teal-400 border border-teal-500/30 animate-pulse"
                          : "bg-zinc-850 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/60"
                      }`}
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{testSpeaking ? "Speaking..." : "Test Voice"}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Form Footer */}
              <div className="border-t border-zinc-800 pt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 font-semibold rounded-lg text-sm transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-zinc-950 font-bold rounded-lg text-sm transition-all cursor-pointer"
                >
                  Create Agent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-white mb-2">Delete Voice Agent?</h3>
            <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
              Are you sure you want to delete this agent? This action cannot be undone, and any dashboard links to this agent will be removed.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 border border-zinc-850 hover:border-zinc-700 text-zinc-450 hover:text-zinc-200 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteAgent}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-450 text-zinc-950 font-bold rounded-lg text-xs transition-all cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Toast Alert */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-900/90 backdrop-blur-md shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className={`w-2 h-2 rounded-full ${notification.type === "error" ? "bg-rose-500 shadow-lg shadow-rose-500/50" : "bg-teal-500 shadow-lg shadow-teal-500/50"}`} />
          <span className="text-xs font-semibold text-zinc-200">{notification.message}</span>
        </div>
      )}
    </div>
  );
}

export default AgentsList;
