"use client";

import { useState, useRef, useEffect } from "react";
import { useJDStore } from "@/stores/jdStore";
import { useAutoSaveStore } from "@/hooks/useAutoSave";
import { updateWorkspaceName } from "@/lib/workspace";

export function WorkspaceSelector() {
  const workspaceName = useJDStore((s) => s.workspaceName);
  const workspaceId = useJDStore((s) => s.workspaceId);
  const setWorkspaceName = useJDStore((s) => s.setWorkspaceName);
  const saveStatus = useAutoSaveStore((s) => s.status);

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(workspaceName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

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
      // Revert on error
      setWorkspaceName(workspaceName);
    }
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

  return (
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
  );
}
