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
    if (event.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className="flex items-center space-x-3">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="메시지를 입력하세요..."
        disabled={disabled}
        className="flex-1 px-4 py-2 border border-yellow-300 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-sm"
      />
      <button
        onClick={handleSend}
        disabled={disabled || !message.trim()}
        className={`px-5 py-2 rounded-full text-white transition duration-200 shadow-md ${
          disabled || !message.trim()
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-yellow-500 hover:bg-yellow-600"
        }`}
      >
        {/* 전송 아이콘 */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            d="M10.894 2.886l4.107 4.107a1 1 0 010 1.414l-4.107 4.107a1 1 0 01-1.414-1.414L12.586 10l-3.106-3.107a1 1 0 011.414-1.414zM4.894 2.886l4.107 4.107a1 1 0 010 1.414l-4.107 4.107a1 1 0 01-1.414-1.414L6.586 10 3.48 6.893a1 1 0 011.414-1.414z"
            clipRule="evenodd"
            fillRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
};

export default ChatInput;
