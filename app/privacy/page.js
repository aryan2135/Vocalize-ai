import React from "react";
import Link from "next/link";
import { Shield, ArrowLeft, Lock, Database, Cpu, HardDrive } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-teal-500 selection:text-zinc-950">
      {/* Top Header/Navigation */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur sticky top-0 z-50 px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-teal-400" />
            <span className="text-xl font-bold tracking-tight text-white">Vocalize<span className="text-teal-400">AI</span></span>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-teal-400 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Landing</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto px-6 py-12 w-full">
        <div className="space-y-6">
          <div className="border-b border-zinc-800 pb-6">
            <h1 className="text-3xl font-extrabold text-white">Privacy Policy</h1>
            <p className="text-sm text-zinc-400 mt-2">Last Updated: June 24, 2026</p>
          </div>

          <p className="text-zinc-300 leading-relaxed">
            Welcome to VocalizeAI ("we", "our", or "us"). We are committed to transparency in how we collect, process, and secure user data. Please read this Privacy Policy carefully to understand our data practices.
          </p>

          {/* Third-Party Sub-Processors Section */}
          <section className="space-y-4 pt-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-teal-400" />
              1. Information We Share with Sub-Processors
            </h2>
            <p className="text-zinc-300 leading-relaxed">
              VocalizeAI utilizes third-party infrastructure to deliver real-time voice synthesis and interactive AI services. Personal data, including your email address and conversational transcripts, is processed by:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
                <h3 className="font-semibold text-white">Stack Auth</h3>
                <p className="text-sm text-zinc-400">
                  Handles user authentication, login management, and registration. Your email and basic profile data are processed and secured in their cloud.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
                <h3 className="font-semibold text-white">Convex</h3>
                <p className="text-sm text-zinc-400">
                  Serves as our primary real-time database. All persistent logs, metadata, agent settings, and historical transcripts are hosted here.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2 col-span-1 md:col-span-2">
                <h3 className="font-semibold text-white">AI Processing Services (Google & Groq)</h3>
                <p className="text-sm text-zinc-400">
                  Transcripts and conversational context are forwarded to <strong>Groq API</strong> (Llama chat completion and Whisper fallback ASR) and <strong>Google Gemini API</strong> (fallback LLM) to generate conversational responses.
                </p>
              </div>
            </div>
          </section>

          {/* Audio Data Capture and Processing Section */}
          <section className="space-y-4 pt-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-teal-400" />
              2. Audio Processing & Speech Recognition Disclosures
            </h2>
            <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 space-y-3">
              <h3 className="font-semibold text-teal-400">Google Chrome WebSpeech Cloud Processing</h3>
              <p className="text-sm text-zinc-300 leading-relaxed">
                By default, browser-native Speech Recognition (WebSpeech API) in Google Chrome transmits captured voice audio streams to Google cloud servers for translation into text. Audio does not stay local to your device unless you are explicitly running Chrome's opt-in offline/on-device mode.
              </p>
            </div>
            
            <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 space-y-3">
              <h3 className="font-semibold text-teal-400">Gemini & Groq Free Tier Policy</h3>
              <p className="text-sm text-zinc-300 leading-relaxed">
                Because this application operates on free-tier access configurations for Google Gemini and Groq APIs, be advised that Google’s free-tier terms allow input/output content (including call transcripts and system instruction prompts) to be retained and reviewed to train and refine AI models. Do not discuss private, proprietary, or sensitive personal data mid-call.
              </p>
            </div>
          </section>

          {/* Security & Transit Encryption */}
          <section className="space-y-4 pt-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-teal-400" />
              3. Data Security & Storage
            </h2>
            <p className="text-zinc-300 leading-relaxed">
              We enforce HTTPS encryption for all transit payloads. Redaction middleware is scheduled to scan and purge common PII patterns before data writes are committed to logs. However, the system is provided as-is for demo and evaluation purposes; we advise against using it to transmit production logs containing highly sensitive fields.
            </p>
          </section>

          {/* Contact */}
          <section className="space-y-4 pt-6 border-t border-zinc-800">
            <h2 className="text-xl font-bold text-white">4. Contact Us</h2>
            <p className="text-zinc-300 leading-relaxed">
              If you have any questions or concerns about this Privacy Policy, please reach out via our contact channels or open an issue on our GitHub repository.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 bg-zinc-950 px-6 py-6 mt-12 text-center text-xs text-zinc-500">
        <p>&copy; {new Date().getFullYear()} VocalizeAI. All rights reserved. Legal Demo Only.</p>
      </footer>
    </div>
  );
}
