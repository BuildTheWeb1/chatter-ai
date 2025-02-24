import { SparklesIcon } from "@heroicons/react/24/outline";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";
import type { Message } from "./ChatbotWidget";

interface ChatBubbleProps {
	message: Message;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
	const { sender, content } = message;

	return (
		<div
			className={`flex ${sender === "bot" ? "items-start gap-2" : "justify-end"}`}
		>
			{/* AI icon on the left for bot messages */}
			{sender === "bot" && (
				<div className="flex-shrink-0 mt-1">
					<SparklesIcon className="text-purple-600 w-5 h-5" />
				</div>
			)}

			{/* The bubble itself */}
			<div
				className={`relative px-5 py-2.5 max-w-[75%] shadow-md text-sm ${
					sender === "bot"
						? "bg-white/70 backdrop-blur-sm text-gray-800 rounded-3xl"
						: "bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full"
				}`}
			>
				<span>{content}</span>

				{/* If it's a user message, render the small circle tail */}
				{sender === "user" && (
					<CheckBadgeIcon className="absolute top-3/4 -translate-y-1/2 right-[-12px] w-6 h-6 text-purple-600" />
				)}
			</div>
		</div>
	);
};

export default ChatBubble;
