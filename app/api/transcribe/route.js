import { NextResponse } from "next/server";
import { stackServerApp } from "@/stack/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convexClient = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

export async function POST(req) {
  try {
    // 1. Authenticate user
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const email = user.primaryEmail;

    // 2. Fetch User Profile
    const dbUser = await convexClient.query(api.user.getUser, { email });
    if (!dbUser) {
      return NextResponse.json({ error: "User profile not found in database" }, { status: 404 });
    }

    // 3. Check for GROQ API Key
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: "Groq API key not configured on server. Please use Google Chrome or Edge for zero-cost browser-native speech recognition instead." }, { status: 501 });
    }

    // 4. Perform Rate Limit check & credit deduction atomically (Whisper Daily Limit: 100 requests)
    try {
      const limitCheck = await convexClient.mutation(api.user.claimCreditsAndCheckLimit, {
        email,
        creditsToDeduct: 50,
        provider: "groq_transcribe",
        capacity: 100,
        refillRatePerMs: 100 / 86400000,
      });

      if (!limitCheck.success) {
        if (limitCheck.error.includes("Insufficient credits")) {
          return NextResponse.json({ error: limitCheck.error }, { status: 402 });
        }
        return NextResponse.json({
          error: "Transcription is at today's limit. Please try again tomorrow or switch to a WebSpeech-supported browser (Chrome/Edge)."
        }, { status: 429 });
      }
    } catch (err) {
      console.error("Convex Whisper rate limit check error:", err);
    }

    // 5. Parse multipart form data
    const formData = await req.formData();
    const file = formData.get("file");
    if (!file) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    // 6. Package for Groq Whisper API
    const groqFormData = new FormData();
    groqFormData.append("file", file, "audio.webm");
    groqFormData.append("model", "whisper-large-v3-turbo");
    groqFormData.append("language", "en");

    console.log("Calling Groq Whisper transcription...");
    const whisperRes = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: groqFormData
    });

    if (!whisperRes.ok) {
      const errorText = await whisperRes.text();
      console.error("Groq Whisper API returned error:", errorText);
      return NextResponse.json({ error: "Transcription failed at external provider" }, { status: 502 });
    }

    const result = await whisperRes.json();
    const transcriptionText = result.text || "";

    return NextResponse.json({ text: transcriptionText });

  } catch (error) {
    console.error("Critical error in /api/transcribe:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
