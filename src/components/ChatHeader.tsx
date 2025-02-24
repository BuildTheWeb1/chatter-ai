interface ChatHeaderProps {
	title?: string;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ title }: ChatHeaderProps) => (
	<div className="py-3 px-4 flex items-center">
		<h2 className="text-lg font-semibold">{title || "Chatbot AI"}</h2>
	</div>
);

export default ChatHeader;
