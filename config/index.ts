import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { AssistantConfig } from "./types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_CONFIG_PATH = path.join(__dirname, "data", "assistant.config.json");

/**
 * Loads and parses an AssistantConfig JSON file.
 * @param filePath Absolute or relative path to the JSON config file.
 */
function loadAssistantConfig(filePath: string): AssistantConfig {
	const resolvedPath = path.isAbsolute(filePath)
		? filePath
		: path.join(process.cwd(), filePath);
	const raw = fs.readFileSync(resolvedPath, "utf8");
	return JSON.parse(raw) as AssistantConfig;
}

/**
 * Builds the assistant's system prompt for this deployment.
 *
 * Resolution order:
 * 1. `SYSTEM_PROMPT` env var, if set — used verbatim, no file involved.
 * 2. `SYSTEM_PROMPT_CONFIG_FILE` env var, if set — path to a JSON file
 *    matching the `AssistantConfig` shape.
 * 3. The default shipped `config/data/assistant.config.json`.
 *
 * For the JSON-file paths, the final prompt is the config's `systemPrompt`
 * plus an appended FAQ block built from `config.faqs`, if present.
 */
export function getSystemPrompt(): string {
	if (process.env.SYSTEM_PROMPT) {
		return process.env.SYSTEM_PROMPT;
	}

	const configPath = process.env.SYSTEM_PROMPT_CONFIG_FILE || DEFAULT_CONFIG_PATH;
	const config = loadAssistantConfig(configPath);

	if (!config.faqs || Object.keys(config.faqs).length === 0) {
		return config.systemPrompt;
	}

	const faqLines = Object.entries(config.faqs)
		.map(([question, answer]) => `- ${question}: ${answer}`)
		.join("\n");

	return `${config.systemPrompt}\n\nCommon FAQs:\n${faqLines}`;
}

export type { AssistantConfig };
