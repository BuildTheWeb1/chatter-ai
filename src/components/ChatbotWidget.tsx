import { useState } from "react";
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

	const handleSend = () => {
		if (!inputValue.trim()) return;
		const newMessage: Message = {
			id: Date.now(),
			content: inputValue,
			sender: Sender.USER,
		};
		setMessages((prev) => [...prev, newMessage]);
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
					onInputChange={setInputValue}
					onSend={handleSend}
				/>
			)}
		</div>
	);
};

export default ChatbotWidget;
