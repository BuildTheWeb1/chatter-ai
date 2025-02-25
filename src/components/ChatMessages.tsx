import { useEffect, useRef } from "react";
import ChatBubble from "./ChatBubble";
import type { Message } from "./ChatbotWidget";

interface ChatMessagesProps {
	messages: Message[];
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages }) => {
	const containerRef = useRef<HTMLDivElement>(null);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (containerRef.current) {
			containerRef.current.scrollTo({
				top: containerRef.current.scrollHeight,
				behavior: "smooth",
			});
		}
	}, [messages]);

	return (
		<div
			ref={containerRef}
			className="px-4 py-8 flex-1 overflow-y-auto space-y-3"
		>
			{messages.map((msg) => (
				<ChatBubble key={msg.id} message={msg} />
			))}
		</div>
	);
};

export default ChatMessages;
