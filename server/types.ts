import type { WebSocket } from "ws";

/** WebSocket client augmented with the chat it is currently subscribed to. */
export interface WSClient extends WebSocket {
	chatId?: string;
	isAlive?: boolean;
}

/** A single stored message in a chat's history. */
export interface ChatMessage {
	id: string;
	chatId: string;
	role: "user" | "assistant";
	content: string;
	timestamp: string;
}

/** Client -> server: send a chat message (creates the chat/session if new). */
export interface WSChatMessage {
	type: "chat";
	chatId: string;
	content: string;
	/**
	 * Client-generated id for this outgoing message, echoed back on the
	 * `user_message`/`assistant_message`/`result` broadcasts so that:
	 * - the sending tab can recognize and skip its own optimistic echo, while
	 *   other tabs subscribed to the same chatId can render it as new, and
	 * - each turn's `assistant_message`/`result` events can be correlated
	 *   back to the specific loading bubble they resolve, instead of
	 *   resolving/clearing whichever loading bubble happens to be first.
	 */
	clientMessageId: string;
}

/** Client -> server: subscribe to a chat's history/updates. */
export interface WSSubscribeMessage {
	type: "subscribe";
	chatId: string;
}

export type IncomingWSMessage = WSChatMessage | WSSubscribeMessage;
