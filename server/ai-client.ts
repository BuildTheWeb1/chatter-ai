import { query } from "@anthropic-ai/claude-agent-sdk";
import type {
	Query,
	SDKMessage,
	SDKUserMessage,
} from "@anthropic-ai/claude-agent-sdk";
import { getSystemPrompt } from "../config/index.js";

// Computed once at module load — every AgentSession in this process shares
// the same deployment-configured persona (see config/index.ts's
// getSystemPrompt: SYSTEM_PROMPT env var, else SYSTEM_PROMPT_CONFIG_FILE,
// else the shipped config/data/assistant.config.json).
const SYSTEM_PROMPT = getSystemPrompt();

// Security scoping for this public-facing widget: only WebSearch/WebFetch may
// ever run. Two options are required together to actually enforce that with
// the current SDK (verified against the installed
// node_modules/@anthropic-ai/claude-agent-sdk/sdk.d.ts, not just the docs):
//   - `tools` restricts the base set of built-in tools the model is even
//     offered — without this, Bash/Read/Write/Edit/Glob/Grep would still be
//     available to the model and only subject to a permission prompt.
//   - `allowedTools` auto-approves the listed tools so they execute without
//     an interactive permission prompt (there is no human to answer one in a
//     headless server process).
const ALLOWED_TOOLS = ["WebSearch", "WebFetch"];

type UserMessage = {
	type: "user";
	message: { role: "user"; content: string };
};

// Simple async queue - messages go in via push(), come out via async iteration.
// Generic, copied near-verbatim from Anthropic's reference implementation,
// with one fix on top: `close()` must wake up a consumer that is currently
// parked in the `await new Promise(...)` branch below, otherwise the async
// iterator (and whatever is consuming it, e.g. AgentSession.getOutputStream)
// hangs forever instead of observing `closed` and returning. To do that,
// `push()` and `close()` both go through the same "wake the waiter, then let
// the loop re-check its own state" path, instead of `push` handing a message
// directly to a parked resolver.
class MessageQueue {
	private messages: UserMessage[] = [];
	private waiting: (() => void) | null = null;
	private closed = false;

	push(content: string) {
		const msg: UserMessage = {
			type: "user",
			message: {
				role: "user",
				content,
			},
		};

		this.messages.push(msg);
		this.wake();
	}

	private wake() {
		if (this.waiting) {
			const wake = this.waiting;
			this.waiting = null;
			wake();
		}
	}

	async *[Symbol.asyncIterator](): AsyncIterableIterator<UserMessage> {
		while (!this.closed) {
			if (this.messages.length > 0) {
				yield this.messages.shift()!;
			} else {
				// Wait to be woken by either push() (a message is available) or
				// close() (we should exit) - either way, loop back around and
				// re-check `closed`/`messages` above rather than assuming a
				// message is what woke us.
				await new Promise<void>((resolve) => {
					this.waiting = resolve;
				});
			}
		}
	}

	close() {
		this.closed = true;
		this.wake();
	}
}

export class AgentSession {
	private queue = new MessageQueue();
	private queryHandle: Query;

	constructor() {
		// Start the query immediately with the queue as input.
		// The queue's async iterator yields a minimal { type, message } shape
		// rather than the full SDKUserMessage (which also carries
		// parent_tool_use_id, uuid, session_id, etc.) - the SDK only reads
		// `type`/`message` off each yielded value, so this narrower shape is
		// safe at runtime; the cast documents that intentional simplification.
		this.queryHandle = query({
			prompt: this.queue as unknown as AsyncIterable<SDKUserMessage>,
			options: {
				maxTurns: 20,
				model: "claude-haiku-4-5",
				tools: ALLOWED_TOOLS,
				allowedTools: ALLOWED_TOOLS,
				systemPrompt: SYSTEM_PROMPT,
			},
		});
	}

	// Send a message to the agent
	sendMessage(content: string) {
		this.queue.push(content);
	}

	// Get the output stream
	async *getOutputStream(): AsyncGenerator<SDKMessage, void> {
		for await (const message of this.queryHandle) {
			yield message;
		}
	}

	// Tear down both the input queue and the underlying SDK subprocess.
	// `interrupt()` is the SDK's own termination method for streaming-input
	// queries (confirmed on the installed package's `Query` type) - without
	// calling it, closing a Session would stop feeding it new messages but
	// leave its child process running indefinitely.
	async close() {
		this.queue.close();
		await this.queryHandle.interrupt();
	}
}
