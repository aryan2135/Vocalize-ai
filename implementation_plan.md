# Production Deployment Preparation Plan

This plan details the steps to prepare **VocalizeAI** for production cloud deployment, including configuring production environment variables templates, running build checks, and outlining deployment configurations.

## User Review Required

> [!IMPORTANT]
> To deploy successfully to a public URL (like Vercel, Google Cloud, or Netlify), you will need to provision production credentials for your database and authentication systems.

---

## Open Questions & Choices

> [!IMPORTANT]
> **Deployment Exposure Options (Choose One):**
> *   **Option A: Quiet / Personal Launch:** Deploy the application in its current state to a controlled domain for portfolio/demo purposes. You accept the risk of concurrent usage hitting the Groq/Gemini free-tier 30 RPM rate ceiling and will implement security guards later.
> *   **Option B: Public / Wide Launch:** Implement a server-side token-bucket rate limiter on `/api/chat` and `/api/transcribe` first to prevent shared API key exhaustion before deployment.

---

## Proposed Changes

### 1. Configuration & Key Management

#### [NEW] [env.production.example](file:///e:/My%20folder/New%20folder/ai_voice_agent/.env.production.example)
*   Add clear placeholders for Production-only environment keys (`GROQ_API_KEY`, `GEMINI_API_KEY`, `GEMINI_MODEL`, `STACK_PROJECT_ID`, etc.) which must be completely distinct from development keys to avoid cross-environment quota pollution.
*   Document that the Google Cloud project backing Gemini model calls must remain **billing-free** to preserve free-tier eligibility.

### 2. Convex Cloud Production Pipeline

#### Build Command Override
*   Configure the deployment build command in Vercel to `npx convex deploy --cmd 'npm run build'` to automatically sync migrations, schemas, and actions to the cloud environment during Next.js builds.
*   Generate a `CONVEX_DEPLOY_KEY` (scoped only to the Production environment in Vercel) from the Convex Cloud dashboard to prevent preview branch builds from overwriting your production database.

### 3. Stack Auth Callback Updates
*   Configure the Stack Auth dashboard's Allowed Callback and Redirect URLs to align with your production domain (e.g. `https://your-domain.vercel.app/handler/sign-in`) to prevent callback mismatches in production.

### 4. Privacy Policy & Terms of Service (Public Paths)

#### [NEW] [privacy](file:///e:/My%20folder/New%20folder/ai_voice_agent/app/privacy/page.js)
*   **Routing:** Placed outside the authenticated `(main)` dashboard folder to allow anonymous, unlogged-in visitors to inspect it.
*   **Disclosures:**
    *   Explicitly name **Stack Auth** (authentication provider and email sub-processor).
    *   Explicitly name **Convex** (relational database and call log storage vendor).
    *   Explicitly name **Google** (for WebSpeech API speech-to-text processing and Gemini LLM generation).
    *   Explicitly name **Groq** (for Whisper fallback transcription and Llama-3 agent responses).
    *   Disclose that Google Chrome’s default WebSpeech engine processes audio on cloud servers, and that Gemini’s free tier allows input and output data to be retained for model training.

#### [NEW] [terms](file:///e:/My%20folder/New%20folder/ai_voice_agent/app/terms/page.js)
*   **Routing:** Placed outside `(main)` for public access.
*   **AUP Clause:** Implement an Acceptable Use Policy for system prompts, forbidding hate speech, harassment, fraud, and phishing campaigns.
*   **AI Disclaimer:** Add a disclaimer stating: *"AI-generated voice responses are experimental, may contain inaccuracies or biases, and do not constitute professional, legal, medical, or financial advice."*

#### [MODIFY] [page.js](file:///e:/My%20folder/New%20folder/ai_voice_agent/app/page.js)
*   Add a subtle, glassmorphic footer section to the landing page containing links to `/privacy` and `/terms`.

---

## Option B Implementation Specification (If Selected)

If Option B is chosen, we will build a server-side global Token Bucket Rate Limiter integrated directly with the API cascade:

### 1. Storage & Refill Algorithm (Convex)
*   Define a `rateLimits` schema table tracking bucket token counts, bucket capacity, refill rates, and timestamps for specific provider identifiers (`groq_bucket` and `gemini_bucket`).
*   **Continuous Refill Refinement:** Calculate available tokens continuously based on time-elapsed math:
    `currentTokens = Math.min(capacity, lastTokens + (now - lastRefillTimestamp) * refillRatePerMs)`
    This prevents double-limit bursts on fixed 60-second boundaries.
*   **Atomic Convex Mutation:** Create a single atomic Convex mutation `convex/user.js:claimCreditsAndCheckLimit` that:
    1. Validates the user has sufficient credits.
    2. Performs the continuous token-bucket rate limit check against the global provider bucket.
    3. If the bucket has room, decrements the rate limit token count and deducts the user's credits atomically in one database turn.

### 2. Throttling, Cascade & Credit Rules
*   **Global Rate Limits:** Calibrate the global Groq bucket to 30 RPM (limit ceiling) and Gemini to its own separate RPM limit.
*   **Cascade & Server Logging Flow:**
    *   When `/api/chat` processes a call, it first verifies the Groq rate-limit bucket.
    *   If the Groq bucket is exhausted, log a server warning `[CASCADE] Groq rate-limit exhausted, cascading to Gemini` and route the request to Gemini (testing Gemini's rate-limit bucket).
    *   If the Gemini bucket is also exhausted, log `[CASCADE] Gemini rate-limit exhausted, cascading to local failsafe` and fall back to the local regex failsafe.
*   **Credit Exceptions:** When a request falls back to the local regex failsafe, **zero credits** are deducted from the user's account (since no external API generation was used).
*   **ASR (`/api/transcribe`) Exhaustion:** If Whisper's daily rate-limit bucket is exhausted, immediately return a specific `429` error payload: `{"error": "Transcription is at today's limit. Please try again tomorrow or switch to a WebSpeech-supported browser (Chrome/Edge)."}`.

---

## Verification Plan

### 1. Build Verification
*   Execute `npm run build` locally to verify that all routing systems and custom theme wrapper layout configurations compile without errors.

### 2. Initial Convex Schema Check
*   Run the initial `npx convex deploy` push manually and monitor console logs directly to verify schema validation and index creations pass cleanly against the fresh production database.

### 3. Rate-Limiter Stress Test
*   Create a temporary testing script inside the conversation scratch directory (to keep it completely excluded from the deployment bundle).
*   Verify that when the Groq bucket exhausts, the cascade falls back cleanly to Gemini first, and then to the regex-based fallback response, asserting that the local regex failsafe deducts zero credits.

### 4. Preview Environment Smoke Test
*   Deploy a Vercel Preview branch configured with temporary testing keys.
*   Verify end-to-end functionality (Stack Auth signup redirects, live `/api/chat` fallback Cascade, and `/api/transcribe` MediaRecorder capture) on staging-shaped infrastructure before promoting the deployment to production.
