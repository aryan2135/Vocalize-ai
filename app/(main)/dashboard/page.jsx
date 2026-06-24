"use client";
import React, { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

// Import components
import Overview from "./_components/Overview";
import AgentsList from "./_components/AgentsList";
import VoicePlayground from "./_components/VoicePlayground";
import CallLogs from "./_components/CallLogs";
import Billing from "./_components/Billing";

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentTab = searchParams.get("tab") || "overview";

  const setActiveTab = (tab) => {
    router.push(`/dashboard?tab=${tab}`);
  };

  // Render active tab sub-view
  switch (currentTab) {
    case "overview":
      return <Overview setActiveTab={setActiveTab} />;
    case "agents":
      return <AgentsList setActiveTab={setActiveTab} />;
    case "playground":
      return <VoicePlayground />;
    case "logs":
      return <CallLogs />;
    case "billing":
      return <Billing />;
    default:
      return <Overview setActiveTab={setActiveTab} />;
  }
}

function Dashboard() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}

export default Dashboard;