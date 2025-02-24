import ChatBubble from "./ChatBubble";
import type { Message } from "./ChatbotWidget";

interface ChatMessagesProps {
	messages: Message[];
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages }) => {
	return (
		<div className="px-4 py-8 flex-1 overflow-y-auto space-y-3">
			{messages.map((msg) => (
				<ChatBubble key={msg.id} message={msg} />
			))}
		</div>
	);
};

export default ChatMessages;
