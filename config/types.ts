/**
 * Generic per-deployment assistant configuration.
 *
 * Each deployer defines their own assistant's persona/context either by
 * setting the SYSTEM_PROMPT env var directly, or by editing a JSON file
 * matching this shape (see config/data/assistant.config.json for the
 * shipped example).
 */
export interface AssistantConfig {
	/** The assistant's full system prompt / persona text. */
	systemPrompt: string;
	/** Optional common question/answer pairs appended to the system prompt. */
	faqs?: Record<string, string>;
}
