export interface ChatResponse {
	response: string;
}

// OpenAI API types
interface OpenAIMessage {
	role: "system" | "user" | "assistant";
	content: string;
}

interface OpenAIResponse {
	choices: {
		message: OpenAIMessage;
		finish_reason: string;
		index: number;
	}[];
}

export async function fetchBotResponse(message: string): Promise<ChatResponse> {
	// Get API key from Vite environment variable
	const apiKey = import.meta.env.VITE_OPENAI_API_KEY || "";

	if (!apiKey) {
		throw new Error(
			"OpenAI API key is missing. Please set the VITE_OPENAI_API_KEY environment variable.",
		);
	}

	const messages: OpenAIMessage[] = [
		{ role: "system", content: "You are a helpful assistant." },
		{ role: "user", content: message },
	];

	try {
		const response = await fetch("https://api.openai.com/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${apiKey}`,
			},
			body: JSON.stringify({
				model: "gpt-3.5-turbo",
				messages,
				temperature: 0.7,
				max_tokens: 150,
			}),
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(
				`OpenAI API error: ${errorData.error?.message || response.statusText}`,
			);
		}

		const data = (await response.json()) as OpenAIResponse;
		return {
			response: data.choices[0]?.message?.content || "No response generated",
		};
	} catch (error) {
		console.error("Error calling OpenAI API:", error);
		throw new Error("Failed to get response from AI service");
	}
}
