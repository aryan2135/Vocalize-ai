import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const CreateUser = mutation({
  args: {
    name: v.string(),
    email: v.string()
  },
  handler: async (ctx, args) => {
    // query by index for better performance
    const userData = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!userData) {
      const data = {
        name: args.name,
        email: args.email,
        credits: 5000,
        lastClaimedCredits: 0
      };
      const id = await ctx.db.insert('users', data);
      console.log("New user created with ID:", id);
      return { ...data, _id: id };
    }
    return userData;
  }
});

export const getUser = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  }
});

export const deductCredits = mutation({
  args: {
    email: v.string(),
    amount: v.number()
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const newCredits = Math.max(0, user.credits - args.amount);
    await ctx.db.patch(user._id, { credits: newCredits });
    return { ...user, credits: newCredits };
  }
});

export const claimDailyCredits = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const lastClaimed = user.lastClaimedCredits || 0;

    if (now - lastClaimed < oneDayMs) {
      const remainingMs = oneDayMs - (now - lastClaimed);
      const remainingHours = Math.ceil(remainingMs / (1000 * 60 * 60));
      throw new Error(`Please wait ${remainingHours} hours to claim free credits again.`);
    }

    const newCredits = user.credits + 1000;
    await ctx.db.patch(user._id, {
      credits: newCredits,
      lastClaimedCredits: now
    });

    return { success: true, credits: newCredits };
  }
});

export const claimCreditsAndCheckLimit = mutation({
  args: {
    email: v.string(),
    creditsToDeduct: v.number(),
    provider: v.string(),
    capacity: v.number(),
    refillRatePerMs: v.number(),
  },
  handler: async (ctx, args) => {
    // 1. Verify user credits
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    if (user.credits < args.creditsToDeduct) {
      return { success: false, error: "Insufficient credits. Please claim free daily credits in the Billing tab." };
    }

    // 2. Perform continuous token-bucket rate limit check
    const now = Date.now();
    let limitDoc = await ctx.db
      .query("rateLimits")
      .withIndex("by_provider", (q) => q.eq("provider", args.provider))
      .first();

    if (!limitDoc) {
      // First time initialization
      const initData = {
        provider: args.provider,
        tokens: args.capacity - 1, // claim 1 token immediately
        lastRefillTimestamp: now,
      };
      await ctx.db.insert("rateLimits", initData);
      
      // Deduct credits atomically
      const newCredits = Math.max(0, user.credits - args.creditsToDeduct);
      await ctx.db.patch(user._id, { credits: newCredits });
      
      return { success: true, remainingCredits: newCredits };
    }

    // Continuous refill math
    const timeElapsed = now - limitDoc.lastRefillTimestamp;
    const refilledTokens = timeElapsed * args.refillRatePerMs;
    const currentTokens = Math.min(args.capacity, limitDoc.tokens + refilledTokens);

    if (currentTokens < 1) {
      return { success: false, error: "Rate limit exceeded. System is busy, please try again in a few seconds." };
    }

    // Claim 1 token and update rate limit record
    const updatedTokens = currentTokens - 1;
    await ctx.db.patch(limitDoc._id, {
      tokens: updatedTokens,
      lastRefillTimestamp: now,
    });

    // 3. Deduct user credits atomically
    const newCredits = Math.max(0, user.credits - args.creditsToDeduct);
    await ctx.db.patch(user._id, { credits: newCredits });

    return { success: true, remainingCredits: newCredits };
  }
});