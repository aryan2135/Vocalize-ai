import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    credits: v.number(),
    SubscriptionId: v.optional(v.string()),
    lastClaimedCredits: v.optional(v.number()),
  }).index("by_email", ["email"]),

  agents: defineTable({
    name: v.string(),
    instructions: v.string(),
    voiceGender: v.string(), // "male" | "female" | "neutral"
    voiceLang: v.string(),   // e.g., "en-US", "es-ES"
    pitch: v.number(),       // 0.5 to 2.0
    rate: v.number(),        // 0.5 to 2.0
    welcomeMessage: v.string(),
    createdBy: v.string(),   // stack user ID or email
    createdAt: v.number(),
  }).index("by_creator", ["createdBy"]),

  calls: defineTable({
    agentId: v.string(),
    agentName: v.string(),
    duration: v.number(),    // in seconds
    status: v.string(),      // "completed" | "failed"
    transcript: v.array(
      v.object({
        role: v.string(),    // "user" | "agent"
        text: v.string(),
      })
    ),
    sentiment: v.optional(v.string()),
    summary: v.optional(v.string()),
    creditsUsed: v.number(),
    createdBy: v.string(),   // stack user ID or email
    createdAt: v.number(),
  }).index("by_creator", ["createdBy"]),

  rateLimits: defineTable({
    provider: v.string(), // e.g. "groq_chat", "gemini_chat", "groq_transcribe"
    tokens: v.number(),
    lastRefillTimestamp: v.number(),
  }).index("by_provider", ["provider"]),
});