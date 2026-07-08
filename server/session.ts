import type { SDKMessage } from "@anthropic-ai/claude-agent-sdk";
import type { WSClient } from "./types.js";
import { AgentSession } from "./ai-client.js";
import { chatStore } from "./chat-store.js";

type BroadcastPayload = Record<string, unknown>;

// Session manages a single chat conversation with a long-lived agent
export class Session {
	public readonly chatId: string;
	private subscribers: Set<WSClient> = new Set();
	// Lazily created - the SDK's query() call synchronously spawns a real
	// child process, so we must not pay that cost just because a tab
	// connected/subscribed (e.g. the widget mounted but is still collapsed).
	// It's created on the first actual sendMessage() call for this chat.
	private agentSession: AgentSession | null = null;
	private isListening = false;
	// FIFO of clientMessageIds awaiting a response, in the order they were
	// sent. Since a Session drives a single long-lived agent conversation
	// (messages are consumed off one queue, one at a time), turns resolve in
	// the same order they were submitted, so peeking/shifting this array lets
	// us correlate each assistant_message/result back to the specific
	// request (and therefore the specific loading bubble) it belongs to.
	private pendingMessageIds: string[] = [];

	constructor(chatId: string) {
		this.chatId = chatId;
	}

	private getOrCreateAgentSession(): AgentSession {
		if (!this.agentSession) {
			this.agentSession = new AgentSession();
		}
		return this.agentSession;
	}

	// Start listening to agent output (call once)
	private async startListening() {
		if (this.isListening) return;
		this.isListening = true;

		const agentSession = this.agentSession;
		if (!agentSession) {
			this.isListening = false;
			return;
		}

		try {
			for await (const message of agentSession.getOutputStream()) {
				this.handleSDKMessage(message);
			}
		} catch (error) {
			console.error(`Error in session ${this.chatId}:`, error);
			this.broadcastError((error as Error).message);
		} finally {
			// Whether the output loop ended normally (e.g. the underlying
			// query() generator completed) or via the catch above, listening
			// has stopped - reset so a future sendMessage() can restart it.
			// Without this, hitting maxTurns (a normal SDKResultMessage, not a
			// thrown error) or any other loop exit would permanently wedge
			// the chat: isListening would stay true forever and sendMessage's
			// `if (!this.isListening) this.startListening()` guard would never
			// fire again.
			this.isListening = false;
		}
	}

	// Send a user message to the agent
	sendMessage(content: string, clientMessageId: string) {
		// Store user message
		const storedMessage = chatStore.addMessage(this.chatId, {
			role: "user",
			content,
		});

		// Broadcast user message to subscribers. `clientMessageId` lets the
		// sending tab recognize (and skip) its own optimistic echo, while
		// other tabs subscribed to the same chatId render it as new.
		this.broadcast({
			type: "user_message",
			content,
			chatId: this.chatId,
			id: storedMessage.id,
			clientMessageId,
		});

		this.pendingMessageIds.push(clientMessageId);

		// Send to agent first (this creates the AgentSession - and its
		// subprocess - on first use, and starts the session's turn if needed)
		const agentSession = this.getOrCreateAgentSession();
		agentSession.sendMessage(content);

		// Start listening if not already
		if (!this.isListening) {
			this.startListening();
		}
	}

	private handleSDKMessage(message: SDKMessage) {
		if (message.type === "assistant") {
			const content = message.message.content;
			// Peek (don't consume) - a turn can emit multiple assistant
			// messages/text blocks before its terminating `result`, and they
			// should all correlate to the same in-flight request.
			const clientMessageId = this.pendingMessageIds[0];

			if (typeof content === "string") {
				chatStore.addMessage(this.chatId, {
					role: "assistant",
					content,
				});
				this.broadcast({
					type: "assistant_message",
					content,
					chatId: this.chatId,
					clientMessageId,
				});
			} else if (Array.isArray(content)) {
				for (const block of content) {
					if (block.type === "text") {
						chatStore.addMessage(this.chatId, {
							role: "assistant",
							content: block.text,
						});
						this.broadcast({
							type: "assistant_message",
							content: block.text,
							chatId: this.chatId,
							clientMessageId,
						});
					}
					// Deviation from the reference: `tool_use` blocks are
					// deliberately NOT broadcast to the client. Tool calls
					// (WebSearch/WebFetch) happen transparently server-side —
					// the UI has no "tool use" element and must not grow one.
				}
			}
		} else if (message.type === "result") {
			// The turn is over - consume the id it was resolving so the next
			// turn's messages correlate to the next queued id instead.
			const clientMessageId = this.pendingMessageIds.shift();

			// Always broadcast `result`, even on a turn with no text output,
			// so the client has a definite signal to clear its loading state.
			if (message.subtype === "success") {
				this.broadcast({
					type: "result",
					success: true,
					chatId: this.chatId,
					clientMessageId,
					cost: message.total_cost_usd,
					duration: message.duration_ms,
				});
			} else {
				// SDKResultError (any non-"success" subtype, e.g. hitting
				// maxTurns) carries an `errors: string[]` the client should
				// be able to show instead of leaving the user guessing why
				// their loading bubble turned into a dead end.
				this.broadcast({
					type: "result",
					success: false,
					chatId: this.chatId,
					clientMessageId,
					cost: message.total_cost_usd,
					duration: message.duration_ms,
					error: message.errors.join("; "),
				});
			}
		}
	}

	subscribe(client: WSClient) {
		this.subscribers.add(client);
		client.chatId = this.chatId;
	}

	unsubscribe(client: WSClient) {
		this.subscribers.delete(client);
	}

	hasSubscribers(): boolean {
		return this.subscribers.size > 0;
	}

	private broadcast(message: BroadcastPayload) {
		const messageStr = JSON.stringify(message);
		for (const client of this.subscribers) {
			try {
				if (client.readyState === client.OPEN) {
					client.send(messageStr);
				}
			} catch (error) {
				console.error("Error broadcasting to client:", error);
				this.subscribers.delete(client);
			}
		}
	}

	private broadcastError(error: string) {
		this.broadcast({
			type: "error",
			error,
			chatId: this.chatId,
		});
	}

	// Close the session - a no-op if no AgentSession (and therefore no
	// subprocess) was ever created for this chat.
	close() {
		if (!this.agentSession) return;
		this.agentSession.close().catch((error) => {
			console.error(`Error closing agent session for chat ${this.chatId}:`, error);
		});
	}
}
