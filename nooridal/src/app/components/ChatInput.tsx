import React, { useState } from "react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-center space-x-2 p-1 bg-white rounded-full border border-gray-300 shadow-sm">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="메시지를 입력하세요..."
        disabled={disabled}
        rows={1}
        className="flex-1 px-4 py-2.5 bg-transparent rounded-full focus:outline-none resize-none overflow-y-auto text-sm placeholder-gray-500"
        style={{ maxHeight: "100px" }}
      />
      <button
        onClick={handleSend}
        disabled={disabled || !message.trim()}
        className={`p-2.5 rounded-full transition duration-200 flex items-center justify-center ${
          disabled || !message.trim()
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-gray-500 hover:bg-gray-600 text-white"
        }`}
        aria-label="전송"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 transform transition-transform duration-200"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
            clipRule="evenodd"
            fillRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
};

export default ChatInput;
