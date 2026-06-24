# VocalizeAI — Project Status, Architecture & Roadmap

This document summarizes the current architecture, implemented features, verified questions, and the risk-prioritized roadmap of **VocalizeAI** for code review and strategic improvements.

---

## 1. Core Technology Stack

*   **Framework:** Next.js (App Router)
*   **Authentication:** Stack Auth (fully integrated with custom dark themes via `StackTheme`)
*   **Database & Real-time State:** Convex (relational schema, reactive subscriptions, mutations, and actions)
*   **Audio Recognition (ASR):** WebSpeech API (SpeechRecognition) with custom fallback backend routes
*   **Speech Synthesis (TTS):** Browser-Native SpeechSynthesis (zero-latency, client-side rendering)
*   **LLM Orchestrator:** Gemini Flash & Groq (Llama-3) via Next.js backend routing
*   **Styling:** TailwindCSS with glassmorphic custom dark panels

---

## 2. Verified Architectural Details (Open Questions Resolved)

### A. Core Feature Status
*   **Confirmation:** The core workspace features (Agent CRUD list management, Convex call logging mutations, the main voice playground, and dynamic speech engines) are fully operational and intact. The trust/security audits represent narrow updates to address specific code review topics, not regressions.

### B. WebSpeech API cross-browser fallback ASR & Mic Gating
*   **ASR Gating:** Gating (Option A) applies equally to Firefox/Safari users. In [`VoicePlayground.jsx`](file:///e:/My%20folder/New%20folder/ai_voice_agent/app/(main)/dashboard/_components/VoicePlayground.jsx), `stopListening()` is called during playback, which successfully calls `stopMediaRecording()` to stop the active `MediaRecorder` instance. This prevents feedback loops across all browsers.
*   **Backend Handoff:** Captured fallback audio chunks are POSTed to `/api/transcribe`, using Groq Whisper (`whisper-large-v3-turbo`) with a 50-credit cost per turn.

### C. Credit Faucet & Quota Limits
*   **Refill Cooldown Enforced Server-Side:** Enforced in [`convex/user.js`](file:///e:/My%20folder/New%20folder/ai_voice_agent/convex/user.js#L62-L91) using server timestamps, preventing client-side bypass.
*   **App Quota Vulnerability:** Currently, the system throttles requests *only* against user credits. If the app-wide free-tier quotas (Groq/Gemini API limits) are exhausted, requests will fail with 429 errors. We need to implement degraded tier indicators and fallbacks to address this.

### D. Gemini model retirement calendar note
*   **Note:** The fallback Gemini model has been migrated to `gemini-2.5-flash` via the `GEMINI_MODEL` environment variable. Note that Google has scheduled the retirement of `gemini-2.5-flash` for **October 16, 2026**. Set a calendar reminder for September 2026 to update `GEMINI_MODEL` inside `.env.local` to the next active free-tier candidate to avoid outage cascades.

---

## 3. High-Priority Strategic Roadmap (Risk-Prioritized Sequence)

To preserve system stability, data security, and compliance alignment, features are sequenced by risk-impact priority:

### Phase 1: Security, Redaction & Quota Guards (Highest Priority)
*   **Transit & Storage Redaction Middleware:** Establish validation filters running *at the point of capture*. PII (credit cards, SSNs, personal data) is stripped out **before** the transcripts are passed to external APIs for conversational generation or async sentiment/summary jobs, preventing exposure to third-party model training datasets. A redundant pass runs before writing logs to Convex.
*   **RPM/TPM Telemetry Dashboard:** Implement monitoring tailored to Groq's critical constraints: Requests Per Minute (RPM) and Tokens Per Minute (TPM). Separate Whisper transcription requests and Chat LLM completions into distinct pools to track spikes accurately.
*   **Provider-Aware & Multi-Endpoint Rate Limiting:**
    *   *Chat completions:* Gated via provider-aware token-bucket limiters (tracking separate thresholds for Groq-bound and Gemini-bound fallbacks) to prevent burst failures.
    *   *Transcriptions (/api/transcribe):* Gated via a daily count limiter matching Whisper's flat daily request limits, rather than chat completion minute rates.
*   **Predictive Degraded Mode Banner:** Rather than triggering reactively after a 429 rate limit occurs, display warning banners predictively once remaining RPM/TPM headroom drops below a safety threshold.

### Phase 2: Interactive Sandbox & Playground Upgrades (Low Risk)
*   **Tap-To-Interrupt escape hatch:** Add a "Stop Speaking" visual button that instantly cancels native client speech synthesis (`window.speechSynthesis.cancel()`) and triggers an `AbortController` to abort any active back-end request (preventing token generation charges for aborted turns).
*   **Mid-Call Prompt Hot-Reloading:** Allow changing system prompts mid-call in the Voice Playground.
    *   *Security/Audit rule:* Log prompt updates directly into the conversation transcript to avoid misattributing inconsistent model behaviors to quality bugs.
*   **Idle Playground Timeout:** Enforce automated playground session disconnects on open tabs with inactive microphones to prevent idle resource leaks and accidental quota drains.

### Phase 3: Screen-Aware Context (Telemetry)
*   **Data Leakage Prevention:** Telemetry must be limited to validation flags and routing names. Raw input value fields (especially `type="password"` or search strings) are strictly excluded from prompt context payloads.
*   **Prompt Injection Shielding:** Telemetry attributes must be encapsulated within strict boundary tags (e.g. `<page-telemetry>...</page-telemetry>`) rather than raw text concatenation, preventing the LLM from misinterpreting DOM strings as instructions.

### Phase 4: Self-Hosted Enterprise Gateway (Ollama Toggle)
*   **HIPAA & Compliance Clarity:** The local LLM toggle must be framed as a secure local router, *not* full HIPAA compliance. True HIPAA compliance requires deploying the entire stack (including Convex databases and Stack Auth keys) locally. We will provide a comprehensive data-flow diagram to clarify local vs. cloud traffic.

### Phase 5: Token-Based Credit Deductions
*   **Accounting Refinement:** Modify flat-rate billing to scale with token metrics for Chat Completions. While flat-turn pricing works well for request-based ASR (Whisper), LLM generation credits should scale with response token counts to prevent long agent responses from outpacing billing quotas.

### Phase 6: Paid Premium Voice Tier (Optional)
*   **Rule:** Standard ASR fallback continues to route to Groq Whisper for free. Deepgram/ElevenLabs integrations are treated as paid-only premium voices, gated behind developer key-custody controls, rather than automated browser-detection fallbacks.

### Phase 7: Embeddable Voice Intercom Widget
*   **Abuse Safeguards:** Will only ship after domain-scoping allow-lists, per-agent call limits, and origin-header validation controls are fully implemented to prevent malicious hosts from draining shared app quotas.
