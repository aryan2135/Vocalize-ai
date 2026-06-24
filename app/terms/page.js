import React from "react";
import Link from "next/link";
import { FileText, ArrowLeft, AlertTriangle, Coins, ShieldAlert } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-teal-500 selection:text-zinc-950">
      {/* Top Header/Navigation */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur sticky top-0 z-50 px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-teal-400" />
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
            <h1 className="text-3xl font-extrabold text-white">Terms of Service</h1>
            <p className="text-sm text-zinc-400 mt-2">Last Updated: June 24, 2026</p>
          </div>

          <p className="text-zinc-300 leading-relaxed">
            By accessing or using VocalizeAI, you agree to comply with and be bound by the following Terms of Service. If you do not agree to these terms, you may not use the services.
          </p>

          {/* Acceptable Use Policy */}
          <section className="space-y-4 pt-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-teal-400" />
              1. Acceptable Use Policy (System Prompts & Audio)
            </h2>
            <p className="text-zinc-300 leading-relaxed">
              VocalizeAI permits you to customize voice agents using system instruction prompts. You are solely responsible for the prompts and output behaviors of your agents. You agree not to use the services to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-zinc-400 text-sm">
              <li>Deploy agents configured to harass, threaten, stalk, or abuse any individual.</li>
              <li>Create system prompts designed for fraudulent activity, phishing, or financial scams.</li>
              <li>Impersonate real individuals, public figures, or organizations without explicit consent.</li>
              <li>Transmit, store, or solicit illegal, offensive, or malicious content.</li>
              <li>Generate bulk spam, robocalls, or automated messaging campaigns.</li>
            </ul>
          </section>

          {/* AI Output Disclaimer */}
          <section className="space-y-4 pt-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-teal-400" />
              2. AI-Generated Output & Failsafe Disclaimers
            </h2>
            <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 border-l-4 border-l-teal-500 space-y-2">
              <p className="text-sm text-zinc-300 leading-relaxed">
                <strong>Important Notice:</strong> Voice agent responses are synthesized dynamically using Large Language Models (LLMs) and speech generation engines. All AI-generated responses are experimental, may contain inaccuracies, hallucinations, or biases, and <strong>do not constitute professional, legal, medical, financial, or engineering advice</strong>.
              </p>
              <p className="text-sm text-zinc-400">
                You agree not to rely on any synthesized output for critical business decisions, safety-critical tasks, or professional consultation.
              </p>
            </div>
          </section>

          {/* Credits and Quotas */}
          <section className="space-y-4 pt-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Coins className="w-5 h-5 text-teal-400" />
              3. Credits Faucet & Resource Quotas
            </h2>
            <p className="text-zinc-300 leading-relaxed">
              VocalizeAI issues mock credits to test and evaluate the voice agents. These credits have no real-world monetary value, cannot be redeemed for cash, and are subject to fair-use thresholds:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-zinc-400 text-sm">
              <li>Free accounts can claim 1,000 extra credits once every 24 hours via the Billing faucet mutation.</li>
              <li>Credits are deducted dynamically per message turn (10 credits) and per cloud transcription fallback (50 credits).</li>
              <li>We reserve the right to limit, reset, or terminate user credits and account balances without prior notice to protect underlying API quotas.</li>
            </ul>
          </section>

          {/* Limitation of Liability */}
          <section className="space-y-4 pt-6 border-t border-zinc-800">
            <h2 className="text-xl font-bold text-white">4. Limitation of Liability</h2>
            <p className="text-zinc-300 leading-relaxed">
              Under no circumstances shall VocalizeAI be liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use the platform, including API outages, rate limit blocks, data loss, or model errors.
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
