export interface ChatResponse {
	response: string;
}

export async function fetchBotResponse(message: string): Promise<ChatResponse> {
	const res = await fetch("http://localhost:3001/api/chat", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ message }),
	});
	if (!res.ok) {
		throw new Error("Failed to send message");
	}
	return res.json();
}
