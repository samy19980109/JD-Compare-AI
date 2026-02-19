"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useJDStore } from "@/stores/jdStore";
import { useChatStore } from "@/stores/chatStore";
import { useAutoSaveStore } from "@/hooks/useAutoSave";
import {
  updateWorkspaceName,
  listWorkspaces,
  loadWorkspace,
  createWorkspace,
  deleteWorkspace,
  syncItems,
} from "@/lib/workspace";
import { WORKSPACE_KEY } from "@/lib/constants";
import type { WorkspaceSummary } from "@/types/workspace";

export function WorkspaceSelector() {
  const workspaceName = useJDStore((s) => s.workspaceName);
  const workspaceId = useJDStore((s) => s.workspaceId);
  const setWorkspaceName = useJDStore((s) => s.setWorkspaceName);
  const saveStatus = useAutoSaveStore((s) => s.status);

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(workspaceName);
  const inputRef = useRef<HTMLInputElement>(null);

  // Dropdown state
  const [isOpen, setIsOpen] = useState(false);
  const [workspaces, setWorkspaces] = useState<WorkspaceSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!isOpen) return;
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setConfirmDeleteId(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  const fetchWorkspaces = useCallback(async () => {
    setLoading(true);
    try {
      const list = await listWorkspaces();
      setWorkspaces(list);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  const handleToggleDropdown = () => {
    if (!isOpen) {
      fetchWorkspaces();
    } else {
      setConfirmDeleteId(null);
    }
    setIsOpen(!isOpen);
  };

  const handleSubmit = async () => {
    const trimmed = editValue.trim();
    if (!trimmed || !workspaceId) {
      setEditValue(workspaceName);
      setIsEditing(false);
      return;
    }

    setWorkspaceName(trimmed);
    setIsEditing(false);

    try {
      await updateWorkspaceName(workspaceId, trimmed);
    } catch {
      setWorkspaceName(workspaceName);
    }
  };

  const handleSwitch = async (targetId: string) => {
    if (targetId === workspaceId) {
      setIsOpen(false);
      return;
    }

    // Save current workspace first
    const cards = useJDStore.getState().cards;
    const currentId = useJDStore.getState().workspaceId;
    if (currentId) {
      try {
        await syncItems(
          currentId,
          cards.map((c, idx) => ({
            id: c.id,
            raw_text: c.text,
            label_title: c.labelTitle,
            label_company: c.labelCompany,
            is_muted: c.isMuted,
            sort_order: idx,
          }))
        );
      } catch {
        // continue with switch even if save fails
      }
    }

    // Reset stores
    useJDStore.getState().resetForSwitch();
    useChatStore.getState().resetMessages();

    // Load new workspace
    try {
      const workspace = await loadWorkspace(targetId);
      localStorage.setItem(WORKSPACE_KEY, workspace.id);
      useJDStore.getState().setWorkspaceId(workspace.id);
      useJDStore.getState().setWorkspaceName(workspace.name);
      useJDStore.getState().loadFromWorkspace(workspace.items);
      useChatStore.getState().loadMessages(workspace.chat_messages);
    } catch {
      // If load fails, revert to creating a new workspace
    }

    setIsOpen(false);
  };

  const handleNewWorkspace = async () => {
    // Save current first
    const cards = useJDStore.getState().cards;
    const currentId = useJDStore.getState().workspaceId;
    if (currentId) {
      try {
        await syncItems(
          currentId,
          cards.map((c, idx) => ({
            id: c.id,
            raw_text: c.text,
            label_title: c.labelTitle,
            label_company: c.labelCompany,
            is_muted: c.isMuted,
            sort_order: idx,
          }))
        );
      } catch {
        // continue
      }
    }

    useJDStore.getState().resetForSwitch();
    useChatStore.getState().resetMessages();

    try {
      const workspace = await createWorkspace();
      localStorage.setItem(WORKSPACE_KEY, workspace.id);
      useJDStore.getState().setWorkspaceId(workspace.id);
      useJDStore.getState().setWorkspaceName(workspace.name);
    } catch {
      // App still works without persistence
    }

    setIsOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      return;
    }

    try {
      await deleteWorkspace(id);
      // If we deleted the current workspace, switch to another
      if (id === workspaceId) {
        const remaining = workspaces.filter((w) => w.id !== id);
        if (remaining.length > 0) {
          await handleSwitch(remaining[0].id);
        } else {
          // No workspaces left, create a new one
          await handleNewWorkspace();
        }
      } else {
        setWorkspaces((prev) => prev.filter((w) => w.id !== id));
      }
    } catch {
      // silently fail
    }
    setConfirmDeleteId(null);
  };

  const statusIndicator = () => {
    switch (saveStatus) {
      case "saving":
        return (
          <span className="text-xs text-gray-400 dark:text-gray-500">
            Saving...
          </span>
        );
      case "saved":
        return (
          <span className="text-xs text-green-500 dark:text-green-400">
            Saved
          </span>
        );
      case "error":
        return (
          <span className="text-xs text-red-500 dark:text-red-400">
            Save failed
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className="relative flex items-center gap-1" ref={dropdownRef}>
      <div className="flex items-center gap-2">
        {isEditing ? (
          <input
            ref={inputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSubmit}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
              if (e.key === "Escape") {
                setEditValue(workspaceName);
                setIsEditing(false);
              }
            }}
            className="rounded border border-blue-400 bg-white px-2 py-0.5 text-sm text-gray-900 outline-none dark:border-blue-500 dark:bg-gray-800 dark:text-gray-100"
            maxLength={100}
          />
        ) : (
          <button
            onClick={() => {
              setEditValue(workspaceName);
              setIsEditing(true);
            }}
            className="rounded px-2 py-0.5 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
            title="Click to rename workspace"
          >
            {workspaceName}
          </button>
        )}
        {statusIndicator()}
      </div>

      {/* Dropdown toggle */}
      <button
        onClick={handleToggleDropdown}
        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-300"
        title="Switch workspace"
      >
        <svg
          className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1 w-72 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <div className="max-h-64 overflow-y-auto p-1">
            {loading ? (
              <div className="px-3 py-4 text-center text-sm text-gray-400 dark:text-gray-500">
                Loading...
              </div>
            ) : workspaces.length === 0 ? (
              <div className="px-3 py-4 text-center text-sm text-gray-400 dark:text-gray-500">
                No workspaces found
              </div>
            ) : (
              workspaces.map((ws) => (
                <div
                  key={ws.id}
                  className={`group flex items-center justify-between rounded-md px-3 py-2 ${
                    ws.id === workspaceId
                      ? "bg-blue-50 dark:bg-blue-900/30"
                      : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  }`}
                >
                  <button
                    onClick={() => handleSwitch(ws.id)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`truncate text-sm font-medium ${
                          ws.id === workspaceId
                            ? "text-blue-700 dark:text-blue-300"
                            : "text-gray-700 dark:text-gray-200"
                        }`}
                      >
                        {ws.name}
                      </span>
                      {ws.id === workspaceId && (
                        <span className="shrink-0 rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-600 dark:bg-blue-800 dark:text-blue-300">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
                      {ws.item_count} {ws.item_count === 1 ? "JD" : "JDs"} · {formatDate(ws.updated_at)}
                    </div>
                  </button>

                  {/* Delete button - only show if more than one workspace */}
                  {workspaces.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(ws.id);
                      }}
                      className={`ml-2 shrink-0 rounded p-1 text-xs ${
                        confirmDeleteId === ws.id
                          ? "bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400"
                          : "text-gray-300 opacity-0 hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 dark:text-gray-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                      }`}
                      title={
                        confirmDeleteId === ws.id
                          ? "Click again to confirm delete"
                          : "Delete workspace"
                      }
                    >
                      {confirmDeleteId === ws.id ? (
                        <span className="px-1 text-[11px] font-medium">Delete?</span>
                      ) : (
                        <svg
                          className="h-3.5 w-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      )}
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* New Workspace button */}
          <div className="border-t border-gray-200 p-1 dark:border-gray-700">
            <button
              onClick={handleNewWorkspace}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              New Workspace
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
