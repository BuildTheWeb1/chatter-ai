import React, { useState } from 'react';

interface Message {
  id: number;
  content: string;
  sender: 'user' | 'bot';
}

const ChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, content: "Hello! I'm a simple chatbot.", sender: 'bot' },
    { id: 2, content: 'How can I help you today?', sender: 'bot' },
  ]);
  const [inputValue, setInputValue] = useState('');

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;
    const newMessage: Message = {
      id: Date.now(),
      content: inputValue,
      sender: 'user',
    };
    setMessages((prev) => [...prev, newMessage]);
    setInputValue('');
  };

  return (
    <div className="fixed bottom-6 right-6 flex flex-col items-end">
      {/* Floating Chat Button */}
      <button
        onClick={handleToggle}
        className="bg-blue-600 hover:bg-blue-700 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-colors"
      >
        {/* Simple chat icon */}
        <svg
          className="w-7 h-7"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 10h.01M12 10h.01M16 10h.01M21 12c0-1.886-.896-3.678-2.607-5.032C17.43 5.62 15.273 5 13 5s-4.43.62-5.393 1.968C6.896 8.322 6 10.114 6 12c0 1.886.896 3.678 2.607 5.032C9.57 18.38 11.727 19 14 19c.394 0 .779-.02 1.154-.06L18 20l-1.137-1.424C18.103 17.654 19 15.914 19 14c0-.775-.108-1.525-.313-2.234A9.961 9.961 0 0021 12z"
          />
        </svg>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className="
            bg-white rounded-xl shadow-xl mt-3 w-96 max-w-full
            flex flex-col overflow-hidden
            animate-fadeInScale  /* The custom fade+scale animation */
          "
        >
          {/* Header */}
          <div className="bg-blue-600 text-white py-3 px-4 flex items-center">
            <h2 className="text-lg font-semibold">Chatbot</h2>
          </div>

          {/* Messages */}
          <div className="p-4 flex-1 overflow-y-auto space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`
                  flex ${msg.sender === 'bot' ? 'items-start gap-2' : 'justify-end'}
                `}
              >
                {/* If it's a bot message, show the AI icon to the LEFT, outside the bubble */}
                {msg.sender === 'bot' && (
                  <div className="flex-shrink-0 mt-1">
                    <svg
                      className="w-6 h-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      viewBox="0 0 24 24"
                    >
                      {/* Example "cpu" icon; replace with your own AI/robot icon */}
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10.5 6h3m-3 12h3m4.5-6v3m0-3H21m-6 0H9m0 0H3m6 0v-3m3-3v3m0 3v3m-3 0h3m-3-6h3"
                      />
                    </svg>
                  </div>
                )}

                {/* Bubble */}
                <div
                  className={`
                    relative px-5 py-2.5 max-w-[75%] shadow-md
                    ${msg.sender === 'bot'
                      ? /* BOT bubble: semi-transparent + round corners */
                        'bg-white/70 backdrop-blur-sm text-gray-800 rounded-3xl'
                      : /* USER bubble: gradient pill + circle tail */
                        'bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full'
                    }
                  `}
                >
                  <span>{msg.content}</span>

                  {/* If it's a user message, render the small circle tail */}
                  {msg.sender === 'user' && (
                    <span
                      className="
                        absolute
                        top-1/2
                        -translate-y-1/2
                        right-[-8px]
                        w-4
                        h-4
                        rounded-full
                        bg-purple-600
                      "
                    />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Input Section */}
          <div className="border-t p-3">
            <div className="flex items-center space-x-2 bg-white rounded-xl shadow-md px-4 py-4">
              {/* Globe icon */}
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 12a9 9 0 11-9-9m0 0c3.3 0 6 4.03 6 9 0 4.97-2.7 9-6 9m0-18c-3.3 0-6 4.03-6 9 0 4.97 2.7 9 6 9m0-18v18"
                />
              </svg>

              {/* Textarea instead of input */}
              <textarea
                className="
                  flex-1
                  bg-transparent
                  focus:outline-none
                  placeholder-gray-500
                  resize-none
                  h-16
                  overflow-y-auto
                  leading-tight
                "
                placeholder="Ask, write or search for anything..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  // Press Enter to send (unless shift is held for multiline)
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />

              {/* Send Button */}
              <button
                onClick={handleSend}
                className="bg-black rounded-full p-2 text-white hover:bg-gray-800 transition-colors"
              >
                {/* Arrow icon */}
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatbotWidget;
