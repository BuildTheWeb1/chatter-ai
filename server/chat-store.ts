import { randomUUID } from "node:crypto";
import type { ChatMessage } from "./types.js";

/**
 * In-memory store of chat message history, keyed by chatId.
 *
 * This is intentionally the only source of truth for conversation history —
 * there is no chat-list CRUD (no `Chat` entity, no titles). A chat is simply
 * whatever `chatId` the client first `subscribe`s or `chat`s with; history is
 * lost on server restart by design (matches the reference's in-memory model).
 */
class ChatStore {
	private messages: Map<string, ChatMessage[]> = new Map();

	addMessage(
		chatId: string,
		message: Omit<ChatMessage, "id" | "chatId" | "timestamp">,
	): ChatMessage {
		const newMessage: ChatMessage = {
			id: randomUUID(),
			chatId,
			timestamp: new Date().toISOString(),
			...message,
		};

		const existing = this.messages.get(chatId);
		if (existing) {
			existing.push(newMessage);
		} else {
			this.messages.set(chatId, [newMessage]);
		}

		return newMessage;
	}

	getMessages(chatId: string): ChatMessage[] {
		return this.messages.get(chatId) || [];
	}
}

// Singleton instance
export const chatStore = new ChatStore();
