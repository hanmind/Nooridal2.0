import React, { useState, KeyboardEvent } from "react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean; // Use disabled prop for clarity
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled }) => {
  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleSend = () => {
    if (inputValue.trim() && !disabled) {
      onSendMessage(inputValue);
      setInputValue(""); // Clear input after sending
    }
  };

  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault(); // Prevent default Enter behavior (new line)
      handleSend();
    }
  };

  return (
    <div className="p-4 bg-white border-t border-gray-200 flex items-center">
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        placeholder={disabled ? "Processing..." : "메시지를 입력하세요..."}
        className="flex-1 border border-gray-300 rounded-full py-2 px-4 mr-3 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
        disabled={disabled}
      />
      <button
        onClick={handleSend}
        disabled={disabled || !inputValue.trim()}
        className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        {/* Send Icon SVG */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 transform rotate-45"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
          />
        </svg>
      </button>
    </div>
  );
};

export default ChatInput;
