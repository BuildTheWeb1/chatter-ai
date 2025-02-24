import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";

interface ChatToggleButtonProps {
	onClick: () => void;
}

const ChatToggleButton: React.FC<ChatToggleButtonProps> = ({ onClick }) => {
	return (
		// biome-ignore lint/a11y/useButtonType: <explanation>
		<button
			onClick={onClick}
			className="bg-indigo-600 hover:bg-purple-600 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-colors"
		>
			<ChatBubbleLeftRightIcon className="w-7 h-7" />
		</button>
	);
};

export default ChatToggleButton;
