import { NextResponse } from "next/server";
import { stackServerApp } from "@/stack/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convexClient = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

// Local rule-based fallback response generator
function getLocalFallbackResponse(instructions, userInput, history) {
  const input = userInput.toLowerCase();
  
  // Generic keyword matchers
  if (input.includes("hello") || input.includes("hi ") || input.includes("hey")) {
    return "Hello! I'm your local AI agent. My server connection is currently running in fallback mode, but I'm here to help. What can I do for you today?";
  }
  if (input.includes("help") || input.includes("support")) {
    return "I would be happy to help. Since I'm running in local fallback mode, I have basic capabilities, but tell me what you need assistance with.";
  }
  if (input.includes("price") || input.includes("cost") || input.includes("billing")) {
    return "Our AI voice agent platform is currently 100% free! You can claim free credits daily.";
  }
  if (input.includes("name") || input.includes("who are you")) {
    return `I am your custom voice assistant. My instructions are to act according to: "${instructions.slice(0, 50)}..."`;
  }
  if (input.includes("bye") || input.includes("goodbye") || input.includes("exit")) {
    return "Thank you for calling. Have a wonderful day! Goodbye.";
  }

  // Contextual fallback based on system instructions
  if (instructions.toLowerCase().includes("support") || instructions.toLowerCase().includes("customer")) {
    return "I understand your request. Let me look into that for you. Is there any specific account or order number you'd like me to check?";
  }
  if (instructions.toLowerCase().includes("sales") || instructions.toLowerCase().includes("product")) {
    return "That's a great question! Our product offers high-speed AI voice response, fully customizable agents, and native browser integration. Would you like to sign up?";
  }
  
  return "That is interesting! Can you tell me more about that? (Running in local fallback mode)";
}

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

    // 3. Parse Request Payload
    const { instructions, userInput, history, voiceGender } = await req.json();

    let responseText = "";
    let providerUsed = "";

    // 4. Cascade Tier 1: Groq LLM (Gated by Groq Rate Limiter)
    let groqAllowed = false;
    if (process.env.GROQ_API_KEY) {
      try {
        const limitCheck = await convexClient.mutation(api.user.claimCreditsAndCheckLimit, {
          email,
          creditsToDeduct: 10,
          provider: "groq_chat",
          capacity: 30,
          refillRatePerMs: 30 / 60000,
        });

        if (limitCheck.success) {
          groqAllowed = true;
        } else {
          if (limitCheck.error.includes("Insufficient credits")) {
            return NextResponse.json({ error: limitCheck.error }, { status: 402 });
          }
          console.warn(`[CASCADE] Groq rate-limit exhausted, cascading to Gemini. Detail: ${limitCheck.error}`);
        }
      } catch (err) {
        console.error("Convex Groq rate limit check error:", err);
      }
    }

    if (groqAllowed && process.env.GROQ_API_KEY) {
      try {
        console.log("Calling Groq LLM...");
        const groqMessages = [
          { role: "system", content: instructions },
          ...history.map(h => ({
            role: h.role === "agent" ? "assistant" : "user",
            content: h.text
          })),
          { role: "user", content: userInput }
        ];

        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: groqMessages,
            temperature: 0.7,
            max_tokens: 250
          })
        });

        if (groqRes.ok) {
          const data = await groqRes.json();
          responseText = data.choices[0].message.content;
          providerUsed = "groq";
        } else {
          console.warn("Groq request failed status:", groqRes.status);
        }
      } catch (err) {
        console.error("Groq API error:", err);
      }
    }

    // 5. Cascade Tier 2: Gemini Flash Free Tier (Gated by Gemini Rate Limiter)
    let geminiAllowed = false;
    if (!responseText && process.env.GEMINI_API_KEY) {
      try {
        const limitCheck = await convexClient.mutation(api.user.claimCreditsAndCheckLimit, {
          email,
          creditsToDeduct: 10,
          provider: "gemini_chat",
          capacity: 15,
          refillRatePerMs: 15 / 60000,
        });

        if (limitCheck.success) {
          geminiAllowed = true;
        } else {
          if (limitCheck.error.includes("Insufficient credits")) {
            return NextResponse.json({ error: limitCheck.error }, { status: 402 });
          }
          console.warn(`[CASCADE] Gemini rate-limit exhausted, cascading to local failsafe. Detail: ${limitCheck.error}`);
        }
      } catch (err) {
        console.error("Convex Gemini rate limit check error:", err);
      }
    }

    if (geminiAllowed && !responseText && process.env.GEMINI_API_KEY) {
      try {
        console.log("Cascading to Gemini Free Tier...");
        const geminiContents = [
          ...history.map(h => ({
            role: h.role === "agent" ? "model" : "user",
            parts: [{ text: h.text }]
          })),
          { role: "user", parts: [{ text: userInput }] }
        ];

        const geminiModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              contents: geminiContents,
              systemInstruction: {
                parts: [{ text: instructions }]
              },
              generationConfig: {
                maxOutputTokens: 250,
                temperature: 0.7
              }
            })
          }
        );

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          responseText = data.candidates[0].content.parts[0].text;
          providerUsed = "gemini";
        } else {
          console.warn("Gemini request failed status:", geminiRes.status);
        }
      } catch (err) {
        console.error("Gemini API error:", err);
      }
    }

    // 6. Cascade Tier 3: Local Rule-Based Fallback (Zero Credits Charged)
    if (!responseText) {
      console.log("Both APIs failed or are rate-limited. Triggering Local Fallback...");
      responseText = getLocalFallbackResponse(instructions, userInput, history);
      providerUsed = "fallback";
    }

    return NextResponse.json({
      text: responseText,
      provider: providerUsed
    });

  } catch (error) {
    console.error("Critical error in /api/chat:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
