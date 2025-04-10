import { useState } from "react";
import ChatbotWidget from "./components/ChatbotWidget";

// Animated Arrow Component
const AnimatedArrow = ({ isVisible }: { isVisible: boolean }) => {
	if (!isVisible) return null;

	return (
		<div className="fixed bottom-24 right-24 animate-bounce">
			<div className="relative">
				<div className="absolute -left-20 -top-12 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-lg shadow-lg whitespace-nowrap">
					Need help? Click here!
				</div>
				<svg
					width="50"
					height="50"
					viewBox="0 0 24 24"
					fill="none"
					className="text-blue-600"
					aria-label="Arrow pointing to chat button"
					role="img"
				>
					<path
						d="M5 12h14M12 5l7 7-7 7"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						transform="rotate(45, 12, 12)"
					/>
				</svg>
			</div>
		</div>
	);
};

function App() {
	const [isChatOpen, setIsChatOpen] = useState(false);

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 p-12">
			<h1 className="text-4xl font-bold text-center mb-4">
				Chatbot Support beta
			</h1>

			{/* Animated Arrow - only shown when chat is closed */}
			<AnimatedArrow isVisible={!isChatOpen} />

			<ChatbotWidget onOpenChange={setIsChatOpen} />
		</div>
	);
}

export default App;
