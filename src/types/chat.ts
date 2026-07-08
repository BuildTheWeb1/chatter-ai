export enum Sender {
	USER = "user",
	BOT = "bot",
	LOADING = "loading", // Add a new sender type for loading state
}

export interface Message {
	id: string;
	content: string;
	sender: Sender;
}
