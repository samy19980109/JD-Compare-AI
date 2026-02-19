import { useCallback } from "react";
import { useJDStore } from "@/stores/jdStore";
import { useChatStore } from "@/stores/chatStore";
import { streamChat } from "@/lib/stream";
import type { ChatRequest } from "@/types/chat";

export function useChat() {
  const cards = useJDStore((s) => s.cards);
  const workspaceId = useJDStore((s) => s.workspaceId);
  const {
    messages,
    provider,
    isStreaming,
    addUserMessage,
    startAssistantMessage,
    appendToMessage,
    finishMessage,
    setError,
  } = useChatStore();

  const sendMessage = useCallback(
    async (userMessage: string) => {
      if (isStreaming || !userMessage.trim()) return;

      addUserMessage(userMessage);

      const request: ChatRequest = {
        jd_cards: cards
          .filter((c) => c.text.trim())
          .map((c) => ({
            id: c.id,
            text: c.text,
            label_title: c.labelTitle,
            label_company: c.labelCompany,
            is_muted: c.isMuted,
          })),
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        user_message: userMessage,
        provider,
        jd_set_id: workspaceId,
      };

      const assistantId = startAssistantMessage();

      try {
        await streamChat(
          request,
          (token) => appendToMessage(assistantId, token),
          () => finishMessage(assistantId),
          (error) => {
            finishMessage(assistantId);
            setError(error);
          }
        );
      } catch (err) {
        finishMessage(assistantId);
        setError(err instanceof Error ? err.message : "An error occurred");
      }
    },
    [
      cards,
      messages,
      provider,
      workspaceId,
      isStreaming,
      addUserMessage,
      startAssistantMessage,
      appendToMessage,
      finishMessage,
      setError,
    ]
  );

  return { sendMessage, isStreaming };
}
