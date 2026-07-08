import { useCallback, useEffect, useRef, useState } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { Sender, type Message } from "../types/chat";

const CHAT_ID_STORAGE_KEY = "chatter-ai_chatId";

const CONNECTION_ERROR_TEXT =
	"Sorry, I'm having trouble connecting. Please try again later.";
const GENERIC_ERROR_TEXT = "Sorry, I encountered an error. Please try again.";

interface StoredChatMessage {
	id: string;
	chatId: string;
	role: "user" | "assistant";
	content: string;
	timestamp: string;
}

type IncomingWSMessage =
	| { type: "connected"; message: string }
	| { type: "history"; messages: StoredChatMessage[]; chatId: string }
	| {
			type: "user_message";
			content: string;
			chatId: string;
			id: string;
			clientMessageId: string;
	  }
	| {
			type: "assistant_message";
			content: string;
			chatId: string;
			clientMessageId?: string;
	  }
	| {
			type: "result";
			success: boolean;
			chatId: string;
			clientMessageId?: string;
			error?: string;
	  }
	| { type: "error"; error: string; chatId: string };

function getOrCreateChatId(): string {
	const existing = localStorage.getItem(CHAT_ID_STORAGE_KEY);
	if (existing) return existing;

	const chatId = crypto.randomUUID();
	localStorage.setItem(CHAT_ID_STORAGE_KEY, chatId);
	return chatId;
}

function storedMessageToMessage(stored: StoredChatMessage): Message {
	return {
		id: stored.id,
		content: stored.content,
		sender: stored.role === "user" ? Sender.USER : Sender.BOT,
	};
}

// The loading bubble for a given outgoing request gets a derived id, rather
// than its own random one, so later events for that same request (which only
// carry the request's clientMessageId, not a separate loading-bubble id) can
// find and replace/remove exactly that bubble - not the first/any LOADING
// entry in the array, which would misattribute results when multiple
// messages are in flight at once.
function loadingIdFor(clientMessageId: string): string {
	return `${clientMessageId}-loading`;
}

export function useChatSession() {
	const [chatId] = useState(getOrCreateChatId);
	const [messages, setMessages] = useState<Message[]>([]);
	const [connectionFailed, setConnectionFailed] = useState(false);
	const hasSubscribed = useRef(false);

	const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
	const wsUrl = `${wsProtocol}//${window.location.host}/ws`;

	const { sendJsonMessage, lastJsonMessage, readyState } =
		useWebSocket<IncomingWSMessage>(wsUrl, {
			shouldReconnect: () => true,
			reconnectAttempts: 10,
			reconnectInterval: 3000,
			onOpen: () => setConnectionFailed(false),
			onReconnectStop: () => {
				// Reconnection has permanently given up. Any bubble still
				// waiting on a reply otherwise stays "typing..." forever with
				// no way to ever resolve - surface that as a visible error now.
				setConnectionFailed(true);
				setMessages((prev) =>
					prev.map((msg) =>
						msg.sender === Sender.LOADING
							? { ...msg, sender: Sender.BOT, content: CONNECTION_ERROR_TEXT }
							: msg,
					),
				);
			},
		});

	const isConnected = readyState === ReadyState.OPEN && !connectionFailed;

	// Subscribe to this tab's chat as soon as the socket opens.
	useEffect(() => {
		if (isConnected && !hasSubscribed.current) {
			hasSubscribed.current = true;
			sendJsonMessage({ type: "subscribe", chatId });
		}
		if (!isConnected) {
			hasSubscribed.current = false;
		}
	}, [isConnected, chatId, sendJsonMessage]);

	// Reduce incoming WebSocket frames into the Message[] the UI renders.
	useEffect(() => {
		if (!lastJsonMessage) return;

		switch (lastJsonMessage.type) {
			case "history": {
				setMessages(lastJsonMessage.messages.map(storedMessageToMessage));
				break;
			}

			case "user_message": {
				const { id, clientMessageId, content } = lastJsonMessage;
				setMessages((prev) => {
					// This tab's own optimistic echo (already appended in
					// sendMessage under this same id) - no-op. Otherwise this
					// came from a different tab sharing the same chatId -
					// render it as a new incoming user bubble.
					if (prev.some((msg) => msg.id === clientMessageId)) {
						return prev;
					}
					return [...prev, { id, content, sender: Sender.USER }];
				});
				break;
			}

			case "assistant_message": {
				const targetId = lastJsonMessage.clientMessageId
					? loadingIdFor(lastJsonMessage.clientMessageId)
					: undefined;

				setMessages((prev) => {
					const loadingIndex = targetId
						? prev.findIndex((msg) => msg.id === targetId)
						: -1;
					const botMessage: Message = {
						id: crypto.randomUUID(),
						content: lastJsonMessage.content,
						sender: Sender.BOT,
					};
					if (loadingIndex === -1) {
						return [...prev, botMessage];
					}
					const next = [...prev];
					next[loadingIndex] = botMessage;
					return next;
				});
				break;
			}

			case "result": {
				const { success, clientMessageId, error } = lastJsonMessage;
				const targetId = clientMessageId
					? loadingIdFor(clientMessageId)
					: undefined;

				setMessages((prev) => {
					const loadingIndex = targetId
						? prev.findIndex((msg) => msg.id === targetId)
						: -1;

					if (loadingIndex === -1) {
						// Already resolved via assistant_message(s). Only
						// surface something new here if the turn ultimately
						// failed - a successful turn with no lingering
						// loading bubble needs no further action.
						if (success) return prev;
						return [
							...prev,
							{
								id: crypto.randomUUID(),
								content: error || GENERIC_ERROR_TEXT,
								sender: Sender.BOT,
							},
						];
					}

					const next = [...prev];
					if (success) {
						// Turn produced no text output - just clear its
						// loading bubble, nothing to show.
						next.splice(loadingIndex, 1);
					} else {
						next[loadingIndex] = {
							id: crypto.randomUUID(),
							content: error || GENERIC_ERROR_TEXT,
							sender: Sender.BOT,
						};
					}
					return next;
				});
				break;
			}

			case "error": {
				// Session-level failure with no per-request correlation
				// available - clear every pending loading bubble and surface
				// one error message.
				setMessages((prev) => {
					const hadLoading = prev.some(
						(msg) => msg.sender === Sender.LOADING,
					);
					const withoutLoading = prev.filter(
						(msg) => msg.sender !== Sender.LOADING,
					);
					return hadLoading
						? [
								...withoutLoading,
								{
									id: crypto.randomUUID(),
									content: GENERIC_ERROR_TEXT,
									sender: Sender.BOT,
								},
							]
						: withoutLoading;
				});
				break;
			}
		}
	}, [lastJsonMessage]);

	const sendMessage = useCallback(
		(content: string) => {
			const clientMessageId = crypto.randomUUID();

			if (!isConnected) {
				// Don't bother sending - react-use-websocket would just queue
				// it indefinitely. Show the user the request never went out
				// instead of an infinite loading bubble.
				setMessages((prev) => [
					...prev,
					{ id: clientMessageId, content, sender: Sender.USER },
					{
						id: crypto.randomUUID(),
						content: CONNECTION_ERROR_TEXT,
						sender: Sender.BOT,
					},
				]);
				return;
			}

			setMessages((prev) => [
				...prev,
				{ id: clientMessageId, content, sender: Sender.USER },
				{
					id: loadingIdFor(clientMessageId),
					content: "typing...",
					sender: Sender.LOADING,
				},
			]);

			sendJsonMessage({ type: "chat", chatId, content, clientMessageId });
		},
		[chatId, isConnected, sendJsonMessage],
	);

	return { messages, sendMessage, isConnected };
}
