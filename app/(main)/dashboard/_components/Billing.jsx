"use client";
import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@stackframe/stack";
import { 
  Coins, 
  Sparkles, 
  Check, 
  Calendar, 
  Zap, 
  Info,
  ShieldCheck
} from "lucide-react";

function Billing() {
  const user = useUser();
  const email = user?.primaryEmail;

  // Reactively fetch user details
  const dbUser = useQuery(api.user.getUser, email ? { email } : "skip");
  const claimCreditsMutation = useMutation(api.user.claimDailyCredits);
  
  // Fast mock purchase mutations
  const deductCreditsMutation = useMutation(api.user.deductCredits); // we can deduct negative amount to top up!

  // Cooldown status
  const [claimLoading, setClaimLoading] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(null); // id of package purchasing
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState("success");

  const showToast = (msg, type = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Claim free daily credits (+1000)
  const handleClaimCredits = async () => {
    setClaimLoading(true);
    try {
      const res = await claimCreditsMutation({ email });
      if (res.success) {
        showToast("Successfully claimed 1,000 free credits! See you tomorrow.");
      }
    } catch (err) {
      console.error(err);
      showToast(err.message || "Failed to claim credits.", "error");
    } finally {
      setClaimLoading(false);
    }
  };

  // Mock checkout top up
  const handleMockCheckout = async (pkgId, amountCredits) => {
    setPurchaseLoading(pkgId);
    
    // Simulate payment gateway delay
    setTimeout(async () => {
      try {
        // Top up credits securely on backend by passing a negative deduction amount!
        await deductCreditsMutation({
          email,
          amount: -amountCredits
        });
        showToast(`Checkout completed! Added ${amountCredits.toLocaleString()} credits to your account.`);
      } catch (err) {
        console.error(err);
        showToast("Checkout failed", "error");
      } finally {
        setPurchaseLoading(null);
      }
    }, 1500);
  };

  // Cooldown timer calculation
  const getCooldownText = () => {
    if (!dbUser?.lastClaimedCredits) return "Claim Daily Credits (+1,000)";
    const now = Date.now();
    const lastClaimed = dbUser.lastClaimedCredits;
    const oneDayMs = 24 * 60 * 60 * 1000;
    
    if (now - lastClaimed < oneDayMs) {
      const remainingMs = oneDayMs - (now - lastClaimed);
      const hours = Math.ceil(remainingMs / (1000 * 60 * 60));
      return `Claim Cooldown (${hours}h remaining)`;
    }
    return "Claim Daily Credits (+1,000)";
  };

  const isCooldownActive = () => {
    if (!dbUser?.lastClaimedCredits) return false;
    const now = Date.now();
    const lastClaimed = dbUser.lastClaimedCredits;
    const oneDayMs = 24 * 60 * 60 * 1000;
    return now - lastClaimed < oneDayMs;
  };

  // Credit pricing packages
  const packages = [
    {
      id: "pkg_lite",
      name: "Starter Reload",
      credits: 2000,
      price: "$0.00",
      description: "Quick boost for developer testing and small demos.",
      features: [
        "2,000 calling credits",
        "Approx. 33 minutes talk time",
        "Instant mock checkout"
      ],
      popular: false
    },
    {
      id: "pkg_pro",
      name: "Pro Volume",
      credits: 10000,
      price: "$0.00",
      description: "Great for building complex voice agent prompt structures.",
      features: [
        "10,000 calling credits",
        "Approx. 166 minutes talk time",
        "Priority LLM processing",
        "Instant mock checkout"
      ],
      popular: true
    },
    {
      id: "pkg_max",
      name: "Enterprise Bulk",
      credits: 50000,
      price: "$0.00",
      description: "Perfect for scaling call volumes across multiple agents.",
      features: [
        "50,000 calling credits",
        "Approx. 830 minutes talk time",
        "Max concurrent voice calls",
        "Instant mock checkout"
      ],
      popular: false
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300 relative">
      
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center space-x-2.5 px-4 py-3 rounded-lg border shadow-xl animate-in fade-in slide-in-from-bottom-5 duration-200 text-xs font-semibold ${
          toastType === "success" 
            ? "bg-emerald-950/90 border-emerald-500/30 text-emerald-400" 
            : "bg-rose-950/90 border-rose-500/30 text-rose-400"
        }`}>
          {toastType === "success" ? <ShieldCheck className="w-4.5 h-4.5" /> : <Info className="w-4.5 h-4.5" />}
          <span>{toastMessage}</span>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Billing & Credits</h1>
        <p className="text-zinc-400 mt-1">Manage call rate-limiting credits and claim daily free resources.</p>
      </div>

      {/* Credit Balance Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 rounded-2xl border border-zinc-800 bg-zinc-900/20 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 block">
              Remaining Balance
            </span>
            <div className="flex items-baseline space-x-2">
              <span className="text-4xl font-black text-white tracking-tight">
                {dbUser?.credits?.toLocaleString() ?? "0"}
              </span>
              <span className="text-sm font-semibold text-zinc-400">credits</span>
            </div>
            <p className="text-xs text-zinc-500 max-w-sm">
              Credits act as a shared platform limiter. Voice calls deduct 1 credit per second, while Groq Whisper transcribes cost 50 credits.
            </p>
          </div>

          {/* Cooldown Daily Button */}
          <button
            onClick={handleClaimCredits}
            disabled={claimLoading || isCooldownActive() || !dbUser}
            className={`flex items-center space-x-2 px-5 py-3 rounded-lg text-xs font-bold transition-all active:scale-95 duration-200 shrink-0 w-full sm:w-auto justify-center cursor-pointer ${
              isCooldownActive()
                ? "bg-zinc-800/40 border border-zinc-800 text-zinc-500"
                : "bg-teal-500 text-zinc-950 hover:bg-teal-400 shadow-lg shadow-teal-500/10"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>{claimLoading ? "Processing..." : getCooldownText()}</span>
          </button>
        </div>

        {/* Free Limits Explanation */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/10 p-6 flex flex-col justify-between text-xs space-y-4">
          <div className="flex items-center space-x-2 text-teal-400 font-semibold">
            <Sparkles className="w-4.5 h-4.5" />
            <span>100% Free Service</span>
          </div>
          <p className="text-zinc-400 leading-relaxed">
            We use browser speech synthesis, browser recognition, and free-tier cascading LLMs. Our credits system prevents API quota hogging by keeping resource consumption balanced.
          </p>
          <div className="flex items-center space-x-1.5 text-zinc-500 font-medium">
            <Info className="w-4 h-4 shrink-0" />
            <span>No real payments ever required.</span>
          </div>
        </div>
      </div>

      {/* Credit Package Grid */}
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-bold text-white">Top Up Credit Packages</h2>
          <p className="text-xs text-zinc-500 mt-0.5">Need more testing volume? Simulated payment checkout.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative rounded-2xl border bg-zinc-900/30 p-6 flex flex-col justify-between hover:border-zinc-700 transition-all duration-300 ${
                pkg.popular 
                  ? "border-teal-500/60 shadow-[0_0_25px_rgba(20,184,166,0.03)]" 
                  : "border-zinc-800"
              }`}
            >
              {pkg.popular && (
                <span className="absolute -top-3 left-6 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 text-zinc-950 font-bold text-[9px] uppercase tracking-wider">
                  Popular Option
                </span>
              )}

              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-white text-base">{pkg.name}</h3>
                    <p className="text-[10px] text-zinc-500 mt-0.5">{pkg.description}</p>
                  </div>
                </div>

                <div className="flex items-baseline space-x-1.5 my-5">
                  <span className="text-3xl font-extrabold text-white tracking-tight">{pkg.price}</span>
                  <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">/ one-time</span>
                </div>

                <div className="space-y-2.5 mb-6 text-xs text-zinc-400 border-t border-zinc-850 pt-4">
                  {pkg.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-teal-400 shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleMockCheckout(pkg.id, pkg.credits)}
                disabled={purchaseLoading !== null || !dbUser}
                className={`w-full py-2.5 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                  pkg.popular
                    ? "bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-zinc-950 shadow-lg shadow-teal-500/10 active:scale-95"
                    : "bg-zinc-850 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/60 active:scale-95"
                }`}
              >
                {purchaseLoading === pkg.id ? (
                  <div className="w-4 h-4 border border-zinc-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    <span>Get {pkg.credits.toLocaleString()} Credits</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Billing;
