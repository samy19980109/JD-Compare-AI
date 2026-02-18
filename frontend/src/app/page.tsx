"use client";

import { useChatStore } from "@/stores/chatStore";
import { Header } from "@/components/layout/Header";
import { MainContent } from "@/components/layout/MainContent";
import { ChatPanel } from "@/components/chat/ChatPanel";

export default function DashboardPage() {
  const activeTab = useChatStore((s) => s.activeTab);
  const setActiveTab = useChatStore((s) => s.setActiveTab);

  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div className="flex justify-center border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        <button
          onClick={() => setActiveTab("jd")}
          className={`px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === "jd"
              ? "border-b-2 border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          Job Descriptions
        </button>
        <button
          onClick={() => setActiveTab("chat")}
          className={`px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === "chat"
              ? "border-b-2 border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          AI Chat
        </button>
      </div>
      <div className="flex flex-1 overflow-hidden">
        {activeTab === "jd" ? <MainContent /> : <ChatPanel />}
      </div>
    </div>
  );
}
