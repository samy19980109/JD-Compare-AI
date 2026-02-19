"use client";

import { useEffect, useRef } from "react";
import { useChatStore } from "@/stores/chatStore";
import { useJDStore } from "@/stores/jdStore";
import { Header } from "@/components/layout/Header";
import { MainContent } from "@/components/layout/MainContent";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { useAutoSave } from "@/hooks/useAutoSave";
import { createWorkspace, loadWorkspace } from "@/lib/workspace";

const WORKSPACE_KEY = "jdcompare_workspace_id";

function useWorkspaceInit() {
  const setWorkspaceId = useJDStore((s) => s.setWorkspaceId);
  const setWorkspaceName = useJDStore((s) => s.setWorkspaceName);
  const loadFromWorkspace = useJDStore((s) => s.loadFromWorkspace);
  const loadMessages = useChatStore((s) => s.loadMessages);
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    async function init() {
      const storedId = localStorage.getItem(WORKSPACE_KEY);

      if (storedId) {
        try {
          const workspace = await loadWorkspace(storedId);
          setWorkspaceId(workspace.id);
          setWorkspaceName(workspace.name);
          loadFromWorkspace(workspace.items);
          loadMessages(workspace.chat_messages);
          return;
        } catch (err) {
          // If workspace not found, create a new one
          if (err instanceof Error && err.message === "WORKSPACE_NOT_FOUND") {
            localStorage.removeItem(WORKSPACE_KEY);
          } else {
            // Network error - set workspace ID so auto-save can work when connection returns
            setWorkspaceId(storedId);
            return;
          }
        }
      }

      // Create new workspace
      try {
        const workspace = await createWorkspace();
        localStorage.setItem(WORKSPACE_KEY, workspace.id);
        setWorkspaceId(workspace.id);
        setWorkspaceName(workspace.name);
      } catch {
        // App still works without persistence
      }
    }

    init();
  }, [setWorkspaceId, setWorkspaceName, loadFromWorkspace, loadMessages]);
}

export default function DashboardPage() {
  const activeTab = useChatStore((s) => s.activeTab);
  const setActiveTab = useChatStore((s) => s.setActiveTab);

  useWorkspaceInit();
  useAutoSave();

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
