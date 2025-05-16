import React from "react";
import { formatTimestamp } from "../utils/formatTimestamp";

interface UserMessageProps {
  message: string;
  timestamp?: string | Date | null;
}

const UserMessage: React.FC<UserMessageProps> = ({ message, timestamp }) => {
  return (
    <div className="flex justify-end mb-4">
      <div className="flex items-end">
        {timestamp && (
          <span className="text-xs text-black dark:text-gray-300 mr-2 self-end mb-0.5">
            {formatTimestamp(timestamp)}
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
