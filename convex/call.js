import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const saveCall = mutation({
  args: {
    agentId: v.string(),
    agentName: v.string(),
    duration: v.number(),
    status: v.string(),
    transcript: v.array(
      v.object({
        role: v.string(),
        text: v.string(),
      })
    ),
    creditsUsed: v.number(),
    createdBy: v.string(),
  },
  handler: async (ctx, args) => {
    // Save the call
    const callId = await ctx.db.insert("calls", {
      agentId: args.agentId,
      agentName: args.agentName,
      duration: args.duration,
      status: args.status,
      transcript: args.transcript,
      creditsUsed: args.creditsUsed,
      createdBy: args.createdBy,
      createdAt: Date.now(),
    });
    return callId;
  },
});

export const updateSentiment = mutation({
  args: {
    callId: v.id("calls"),
    userId: v.string(),
    sentiment: v.string(),
    summary: v.string(),
  },
  handler: async (ctx, args) => {
    const call = await ctx.db.get(args.callId);
    if (!call) {
      throw new Error("Call log not found");
    }
    if (call.createdBy !== args.userId) {
      throw new Error("Unauthorized");
    }
    await ctx.db.patch(args.callId, {
      sentiment: args.sentiment,
      summary: args.summary,
    });
    return true;
  },
});

export const getCalls = query({
  args: { createdBy: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("calls")
      .withIndex("by_creator", (q) => q.eq("createdBy", args.createdBy))
      .order("desc")
      .collect();
  },
});

export const getCallStats = query({
  args: { createdBy: v.string() },
  handler: async (ctx, args) => {
    const calls = await ctx.db
      .query("calls")
      .withIndex("by_creator", (q) => q.eq("createdBy", args.createdBy))
      .collect();

    let totalCalls = calls.length;
    let totalDuration = 0;
    let totalCreditsUsed = 0;
    let sentimentCount = { Positive: 0, Neutral: 0, Negative: 0 };

    calls.forEach((c) => {
      totalDuration += c.duration;
      totalCreditsUsed += c.creditsUsed;
      if (c.sentiment && sentimentCount[c.sentiment] !== undefined) {
        sentimentCount[c.sentiment]++;
      } else if (c.sentiment) {
        // Fallback or fuzzy match
        if (c.sentiment.toLowerCase().includes("pos")) sentimentCount.Positive++;
        else if (c.sentiment.toLowerCase().includes("neg")) sentimentCount.Negative++;
        else sentimentCount.Neutral++;
      }
    });

    return {
      totalCalls,
      totalDuration, // in seconds
      totalCreditsUsed,
      sentimentCount,
    };
  },
});
