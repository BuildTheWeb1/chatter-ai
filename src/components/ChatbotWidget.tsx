import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { fetchBotResponse } from "../services/chatApi";
import ChatToggleButton from "./ChatToggleButton";
import ChatWindow from "./ChatWindow";

enum Sender {
	USER = "user",
	BOT = "bot",
}

export interface Message {
	id: number;
	content: string;
	sender: Sender;
}

const ChatbotWidget: React.FC = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [messages, setMessages] = useState<Message[]>([
		{ id: 1, content: "Hello! I'm a simple chatbot.", sender: Sender.BOT },
		{ id: 2, content: "How can I help you today?", sender: Sender.BOT },
	]);
	const [inputValue, setInputValue] = useState("");

	const handleToggle = () => {
		setIsOpen((prev) => !prev);
	};

	const handleInputChange = (newVal: string) => {
		setInputValue(newVal);
	};

	const mutation = useMutation({
		mutationFn: fetchBotResponse,
		onError: (error) => {
			console.error("Error fetching from server:", error);
		},
	});

	const handleSend = async () => {
		const trimmed = inputValue.trim();
		if (!trimmed) return;

		setMessages((prev) => [
			...prev,
			{ id: Date.now(), sender: Sender.USER, content: trimmed },
		]);

		try {
			const data = await mutation.mutateAsync(trimmed);

			setMessages((prev) => [
				...prev,
				{ id: Date.now(), sender: Sender.BOT, content: data.response },
			]);
		} catch (err) {
			console.error("handle send failed with the following:", err);
		}

		setInputValue("");
	};

	return (
		<div className="fixed bottom-6 right-6 flex flex-col items-end">
			{/* Floating Chat Button */}
			<ChatToggleButton onClick={handleToggle} />

			{/* Chat Window (shown if isOpen) */}
			{isOpen && (
				<ChatWindow
					messages={messages}
					inputValue={inputValue}
					onInputChange={handleInputChange}
					onSend={handleSend}
				/>
			)}
		</div>
	);
};

export default ChatbotWidget;
