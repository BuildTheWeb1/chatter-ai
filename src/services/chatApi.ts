export interface ChatResponse {
	response: string;
}

export async function fetchBotResponse(message: string): Promise<ChatResponse> {
	try {
		const response = await fetch("http://localhost:3001/api/chat", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ message }),
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(
				`API error: ${errorData.error || response.statusText}`
			);
		}

		return await response.json();
	} catch (error) {
		console.error("Error calling chat API:", error);
		throw new Error("Failed to get response from AI service");
	}
}
