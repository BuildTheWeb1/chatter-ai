import { useEffect, useState } from "react";
import { useChatSession } from "../hooks/useChatSession";
import ChatToggleButton from "./ChatToggleButton";
import ChatWindow from "./ChatWindow";

interface ChatbotWidgetProps {
	onOpenChange?: (isOpen: boolean) => void;
}

const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({ onOpenChange }) => {
	const [isOpen, setIsOpen] = useState(false);
	const [inputValue, setInputValue] = useState("");
	const { messages, sendMessage, isConnected } = useChatSession();

	// Notify parent component when isOpen changes
	useEffect(() => {
		onOpenChange?.(isOpen);
	}, [isOpen, onOpenChange]);

	const handleToggle = () => {
		setIsOpen((prev) => !prev);
	};

	const handleInputChange = (newVal: string) => {
		setInputValue(newVal);
	};

	const handleSend = () => {
		const trimmed = inputValue.trim();
		if (!trimmed) return;

		// Clear input immediately after sending
		setInputValue("");

		sendMessage(trimmed);
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
					isConnected={isConnected}
				/>
			)}
		</div>
	);
};

export default ChatbotWidget;
