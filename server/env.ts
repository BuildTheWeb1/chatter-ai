import dotenv from "dotenv";

// This module's only job is to be the very first thing server.ts imports.
//
// Why: ai-client.ts reads SYSTEM_PROMPT/SYSTEM_PROMPT_CONFIG_FILE from
// process.env at ITS OWN module top-level (`const SYSTEM_PROMPT =
// getSystemPrompt();`). Under ESM, all of a module's static imports are
// evaluated (in declaration order, depth-first) before that module's own
// top-level code runs - so if server.ts called dotenv.config() in its own
// body, that would run AFTER session.ts -> ai-client.ts had already been
// evaluated and had already read (missing) env vars. Importing this
// side-effect module first, before any other server/*.ts import, guarantees
// .env/.env.local are loaded before anything else in the server has a
// chance to read process.env.
dotenv.config();
dotenv.config({ path: ".env.local", override: true });

if (!process.env.ANTHROPIC_API_KEY) {
	console.error(
		"ANTHROPIC_API_KEY is not set. Add it to .env.local (see README's " +
			"'Configuring for your own site' section) before starting the server.",
	);
	process.exit(1);
}
