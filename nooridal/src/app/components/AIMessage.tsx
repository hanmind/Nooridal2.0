import React from "react";

interface AIMessageProps {
  message: string;
  timestamp?: string; // Optional timestamp
  isStreaming?: boolean; // Optional flag for streaming indicator
}

const AIMessage: React.FC<AIMessageProps> = ({
  message,
  timestamp,
  isStreaming,
}) => {
  // Basic timestamp formatting
  const formattedTime = timestamp
    ? new Date(timestamp).toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <div className="flex justify-start mb-4">
      {/* Placeholder for AI avatar/icon if needed */}
      {/* <div className="w-8 h-8 rounded-full bg-gray-300 mr-3"></div> */}
      <div className="flex items-end max-w-[70%]">
        <div className="bg-gray-200 text-gray-800 rounded-lg py-2 px-4">
          <p className="text-sm whitespace-pre-wrap">
            {message}
            {/* Simple blinking cursor effect when streaming */}
            {isStreaming && (
              <span className="inline-block w-2 h-4 bg-gray-800 ml-1 animate-blink"></span>
            )}
          </p>
        </div>
        {formattedTime && (
          <span className="text-xs text-gray-500 ml-2 mb-1">
            {formattedTime}
          </span>
        )}
      </div>
      {/* Basic CSS for blinking animation - needs to be added to global CSS or Tailwind config */}
      <style jsx>{`
        @keyframes blink {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0;
          }
        }
        .animate-blink {
          animation: blink 1s step-end infinite;
        }
      `}</style>
    </div>
  );
};

export default AIMessage;
