import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createAgent = mutation({
  args: {
    name: v.string(),
    instructions: v.string(),
    voiceGender: v.string(),
    voiceLang: v.string(),
    pitch: v.number(),
    rate: v.number(),
    welcomeMessage: v.string(),
    createdBy: v.string(),
  },
  handler: async (ctx, args) => {
    const agentId = await ctx.db.insert("agents", {
      name: args.name,
      instructions: args.instructions,
      voiceGender: args.voiceGender,
      voiceLang: args.voiceLang,
      pitch: args.pitch,
      rate: args.rate,
      welcomeMessage: args.welcomeMessage,
      createdBy: args.createdBy,
      createdAt: Date.now(),
    });
    return agentId;
  },
});

export const getAgents = query({
  args: { createdBy: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("agents")
      .withIndex("by_creator", (q) => q.eq("createdBy", args.createdBy))
      .order("desc")
      .collect();
  },
});

export const getAgentById = query({
  args: { agentId: v.id("agents"), userId: v.string() },
  handler: async (ctx, args) => {
    const agent = await ctx.db.get(args.agentId);
    if (!agent) {
      throw new Error("Agent not found");
    }
    if (agent.createdBy !== args.userId) {
      throw new Error("Unauthorized to access this agent");
    }
    return agent;
  },
});

export const updateAgent = mutation({
  args: {
    agentId: v.id("agents"),
    userId: v.string(),
    name: v.optional(v.string()),
    instructions: v.optional(v.string()),
    voiceGender: v.optional(v.string()),
    voiceLang: v.optional(v.string()),
    pitch: v.optional(v.number()),
    rate: v.optional(v.number()),
    welcomeMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const agent = await ctx.db.get(args.agentId);
    if (!agent) {
      throw new Error("Agent not found");
    }
    if (agent.createdBy !== args.userId) {
      throw new Error("Unauthorized to update this agent");
    }

    const { agentId, userId, ...updates } = args;
    await ctx.db.patch(agentId, updates);
    return agentId;
  },
});

export const deleteAgent = mutation({
  args: { agentId: v.id("agents"), userId: v.string() },
  handler: async (ctx, args) => {
    const agent = await ctx.db.get(args.agentId);
    if (!agent) {
      throw new Error("Agent not found");
    }
    if (agent.createdBy !== args.userId) {
      throw new Error("Unauthorized to delete this agent");
    }
    await ctx.db.delete(args.agentId);
    return true;
  },
});
