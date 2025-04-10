import { SparklesIcon } from "@heroicons/react/24/outline";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";
import type { Message } from "./ChatbotWidget";

interface ChatBubbleProps {
	message: Message;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
	const { sender, content } = message;

	// Typing animation component
	const TypingAnimation = () => (
		<div className="flex space-x-1.5">
			<div
				className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
				style={{ animationDelay: "0ms" }}
			/>
			<div
				className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
				style={{ animationDelay: "150ms" }}
			/>
			<div
				className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"
				style={{ animationDelay: "300ms" }}
			/>
		</div>
	);

	return (
		<div
			className={`flex ${sender === "bot" || sender === "loading" ? "items-start gap-2" : "justify-end"}`}
		>
			{/* AI icon on the left for bot messages */}
			{(sender === "bot" || sender === "loading") && (
				<div className="flex-shrink-0 mt-1">
					<SparklesIcon className="text-purple-600 w-5 h-5" />
				</div>
			)}

			{/* The bubble itself */}
			<div
				className={`relative px-5 py-2.5 max-w-[75%] shadow-md text-sm ${
					sender === "bot"
						? "bg-white/70 backdrop-blur-sm text-gray-800 rounded-3xl"
						: sender === "loading"
							? "bg-white/70 backdrop-blur-sm text-gray-800 rounded-3xl"
							: "relative right-[14px] bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-3xl"
				}`}
			>
				{sender === "loading" ? <TypingAnimation /> : <span>{content}</span>}

				{/* If it's a user message, render the small circle tail */}
				{sender === "user" && (
					<CheckBadgeIcon className="absolute top-5/6 -translate-y-1/2 right-[-14px] w-6 h-6 text-purple-600" />
				)}
			</div>
		</div>
	);
};

export default ChatBubble;
