// Must be the first import - loads .env/.env.local and fails fast if
// ANTHROPIC_API_KEY is missing, before any other module (e.g. ai-client.ts)
// gets a chance to read process.env. See server/env.ts for why the ordering
// matters under ESM.
import "./env.js";

import { createServer } from "node:http";
import cors from "cors";
import express from "express";
import type { Request, Response } from "express";
import { WebSocketServer } from "ws";
import type { IncomingWSMessage, WSClient } from "./types.js";
import { chatStore } from "./chat-store.js";
import { Session } from "./session.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req: Request, res: Response) => {
	res.json({ status: "ok" });
});

// Create HTTP server
const server = createServer(app);

// WebSocket server
const wss = new WebSocketServer({ server, path: "/ws" });

// Session management — one Session (and its own long-lived AgentSession) per chatId
const sessions: Map<string, Session> = new Map();

function getOrCreateSession(chatId: string): Session {
	let session = sessions.get(chatId);
	if (!session) {
		session = new Session(chatId);
		sessions.set(chatId, session);
	}
	return session;
}

wss.on("connection", (ws: WSClient) => {
	console.log("WebSocket client connected");
	ws.isAlive = true;

	ws.send(JSON.stringify({ type: "connected", message: "Connected to chat server" }));

	ws.on("pong", () => {
		ws.isAlive = true;
	});

	ws.on("message", (data) => {
		let message: IncomingWSMessage;
		try {
			message = JSON.parse(data.toString());
		} catch (error) {
			console.error("Error parsing WebSocket message:", error);
			ws.send(JSON.stringify({ type: "error", error: "Invalid message format" }));
			return;
		}

		try {
			switch (message.type) {
				case "subscribe": {
					const session = getOrCreateSession(message.chatId);
					session.subscribe(ws);
					console.log(`Client subscribed to chat ${message.chatId}`);

					// Send existing messages
					const messages = chatStore.getMessages(message.chatId);
					ws.send(
						JSON.stringify({
							type: "history",
							messages,
							chatId: message.chatId,
						}),
					);
					break;
				}

				case "chat": {
					const session = getOrCreateSession(message.chatId);
					session.subscribe(ws);
					session.sendMessage(message.content, message.clientMessageId);
					break;
				}

				default:
					console.warn("Unknown message type:", (message as { type: unknown }).type);
			}
		} catch (error) {
			console.error("Error handling WebSocket message:", error);
			ws.send(
				JSON.stringify({ type: "error", error: "Failed to process message" }),
			);
		}
	});

	ws.on("close", () => {
		console.log("WebSocket client disconnected");

		// Look up this client's session directly via the chatId stamped on it
		// by Session.subscribe(), instead of sweeping every live session.
		const chatId = ws.chatId;
		if (!chatId) return;

		const session = sessions.get(chatId);
		if (!session) return;

		session.unsubscribe(ws);

		// No tabs left watching this chat - tear down its (possibly
		// never-created) AgentSession/subprocess and drop the Session itself,
		// instead of leaking one Session (and one child process, once a chat
		// has been used) per chatId for the lifetime of the server.
		if (!session.hasSubscribers()) {
			session.close();
			sessions.delete(chatId);
		}
	});
});

// Heartbeat to detect dead connections
const heartbeat = setInterval(() => {
	for (const ws of wss.clients) {
		const client = ws as WSClient;
		if (client.isAlive === false) {
			client.terminate();
			continue;
		}
		client.isAlive = false;
		client.ping();
	}
}, 30000);

wss.on("close", () => {
	clearInterval(heartbeat);
});

// Start server
server.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
	console.log(`WebSocket endpoint available at ws://localhost:${PORT}/ws`);
});
