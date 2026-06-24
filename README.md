# VocalizeAI — Production-Ready AI Voice Agent Dashboard (100% Free)

VocalizeAI is a premium, responsive SaaS application for configuring, previewing, and calling custom AI voice assistants. It operates on a **100% Free cost model** with no paid API dependencies, leveraging a hybrid architecture that runs high-quality, zero-latency speech services directly in the client's browser.

---

## 🚀 Key Features

*   **Organic Voice Orb**: A multi-layered, Siri-like glowing canvas wave visualizer that dynamically reacts to voice and audio playback.
*   **Custom Voice Agent Builder**: Fine-tune voice assistants with custom prompts, languages, gender preferences, speed (rate), and pitch selectors.
*   **Zero-Cost ASR/TTS**: Utilizes browser-native WebSpeech Recognition and SpeechSynthesis to run calling sessions locally for $0.00.
*   **Throttled API Fallback Cascade**: Server-side routes automatically waterfall to ensure high availability:
    1.  **Groq LLM** (e.g., Llama-3.3-70b-versatile)
    2.  **Google Gemini Free Tier** (Gemini-2.5-flash)
    3.  **Local Context-Aware Regex Failsafe** (charges zero credits)
*   **Token-Bucket Rate Limiting**: Global provider-aware rate-limiting buckets protect shared API pools against concurrent abuse.
*   **Credits & Daily Reload Faucet**: Managed user balances with a daily reload mechanism (+1,000 credits) to test calling capabilities.
*   **Public Terms & Privacy Disclosures**: Unauthenticated routes highlighting third-party API processing (Convex, Stack Auth, Google, Groq) and user data governance.

---

## 🛠️ Technology Stack

*   **Framework**: Next.js (App Router)
*   **Authentication**: Stack Auth (fully styled with custom dark-mode cards)
*   **Database & Backend**: Convex (reactive queries, mutations, and database schemas)
*   **Styling**: Tailwind CSS (Premium glassmorphism and dark mode palette)
*   **Icons**: Lucide React

---

## 💻 Local Development Setup

### 1. Clone & Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_STACK_PROJECT_ID=your_stack_project_id
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=your_stack_client_key
STACK_SECRET_SERVER_KEY=your_stack_server_key

# Convex URLs (automatically configured if running 'npx convex dev')
NEXT_PUBLIC_CONVEX_URL=http://127.0.0.1:3210

# AI APIs
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
```

### 3. Run the Database & Dev Server
If running Convex self-hosted with Docker:
```bash
docker-compose up -d
npx convex dev --once
npm run dev
```

---

## ☁️ Production Deployment

### 1. Build Override in Vercel
Set your build command override to run both Convex migrations and Next.js builds:
```bash
npx convex deploy --cmd 'npm run build'
```

### 2. Production Environment Variables
Configure the following in Vercel settings (based on [.env.production.example](file:///e:/My%20folder/New%20folder/ai_voice_agent/.env.production.example)):
*   `CONVEX_DEPLOY_KEY` (Generate from your production Convex dashboard under Settings -> Deploy Keys. Select all permissions.)
*   `NEXT_PUBLIC_CONVEX_URL` (Your production Convex cloud URL)
*   `NEXT_PUBLIC_STACK_PROJECT_ID` / `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY` / `STACK_SECRET_SERVER_KEY`
*   `GROQ_API_KEY` / `GEMINI_API_KEY`
*   `GEMINI_MODEL` = `gemini-2.5-flash`

### 3. Stack Auth Production Mode
1. In your Stack Auth dashboard, switch the project to **Production Mode**.
2. Go to **Project Settings** -> **Trusted Domains**:
    *   Toggle **OFF** "Allow all localhost callbacks for development".
    *   Click **Add new domain** and input your Vercel deployment URL (e.g. `vocalize-ai.vercel.app`).
3. Add the redirect callback endpoint under Redirect URLs: `https://your-domain.vercel.app/handler/sign-in`.

---

## 🗺️ Roadmap
Details regarding future security metrics, predictive degradation banners, and telemetry containers can be reviewed inside [project_status_and_roadmap.md](file:///e:/My%20folder/New%20folder/ai_voice_agent/project_status_and_roadmap.md).
