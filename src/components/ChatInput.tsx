import { ChevronRightIcon, GlobeAltIcon } from "@heroicons/react/24/outline";
import type { ChangeEvent, KeyboardEvent } from "react";

interface ChatInputProps {
	value: string;
	onChange: (val: string) => void;
	onSend: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ value, onChange, onSend }) => {
	const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
		// Press Enter to send (unless shift is held for multiline)
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			onSend();
		}
	};

	const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
		onChange(e.target.value);
	};

	return (
		<div className="border-t border-dotted p-3">
			<div className="flex space-x-2 bg-white rounded-xl shadow-md px-4 py-4">
				<GlobeAltIcon className="text-purple-600 w-6 h-6" />

				<textarea
					className="flex-1 bg-transparent focus:outline-none placeholder-gray-500 resize-none h-16 overflow-y-auto leading-tight"
					placeholder="How can I help?"
					value={value}
					onChange={handleChange}
					onKeyDown={handleKeyDown}
				/>

				{/* biome-ignore lint/a11y/useButtonType: <explanation> */}
				<button
					onClick={onSend}
					className="bg-black rounded-full p-2 text-white hover:bg-gray-800 transition-colors self-end"
				>
					<ChevronRightIcon className="w-6 h-6" />
				</button>
			</div>
		</div>
	);
};

export default ChatInput;
