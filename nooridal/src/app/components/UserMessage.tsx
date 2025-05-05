import React from "react";

interface UserMessageProps {
  message: string;
  timestamp?: string; // Optional timestamp
}

const UserMessage: React.FC<UserMessageProps> = ({ message, timestamp }) => {
  // Basic timestamp formatting (can be improved)
  const formattedTime = timestamp
    ? new Date(timestamp).toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <div className="flex justify-end mb-4">
      <div className="flex items-end max-w-[70%]">
        {formattedTime && (
          <span className="text-xs text-gray-500 mr-2 mb-1">
            {formattedTime}
          </span>
        )}
        <div className="bg-blue-500 text-white rounded-lg py-2 px-4">
          <p className="text-sm whitespace-pre-wrap">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default UserMessage;
