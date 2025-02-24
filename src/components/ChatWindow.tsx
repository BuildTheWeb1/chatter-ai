import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";
import ChatMessages from "./ChatMessages";
import type { Message } from "./ChatbotWidget";

interface ChatWindowProps {
	messages: Message[];
	inputValue: string;
	onInputChange: (val: string) => void;
	onSend: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
	messages,
	inputValue,
	onInputChange,
	onSend,
}) => {
	return (
		<div className="bg-white rounded-xl shadow-xl mt-3 w-96 max-w-full flex flex-col overflow-hidden animate-fadeInScale">
			<ChatHeader />
			<ChatMessages messages={messages} />
			<ChatInput value={inputValue} onChange={onInputChange} onSend={onSend} />
		</div>
	);
};

export default ChatWindow;
