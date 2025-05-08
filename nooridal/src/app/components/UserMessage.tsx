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
        hour12: false, // 24시간 표기
      })
    : "";

  return (
    <div className="flex justify-end mb-3">
      <div className="flex items-end max-w-[75%]">
        {formattedTime && (
          <span className="text-xs text-gray-500 dark:text-gray-400 mr-2 self-end mb-0.5">
            {formattedTime}
          </span>
        )}
        <div className="bg-yellow-200 text-yellow-900 p-3 rounded-xl shadow">
          <p className="text-sm whitespace-pre-wrap">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default UserMessage;
