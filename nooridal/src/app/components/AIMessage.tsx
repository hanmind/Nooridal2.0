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
    <div className="flex justify-start mb-4 items-end">
      {/* Placeholder for AI avatar/icon if needed */}
      {/* <div className="w-8 h-8 rounded-full bg-gray-300 mr-3"></div> */}
      <div
        className="bg-pink-200 text-gray-800 p-3 rounded-lg max-w-lg shadow-sm"
        style={{
          borderTopLeftRadius: "0.25rem",
          borderBottomLeftRadius: "0.5rem",
          borderTopRightRadius: "0.5rem",
          borderBottomRightRadius: "0.5rem",
        }}
      >
        <p className="text-sm whitespace-pre-wrap">
          {message}
          {/* Simple blinking cursor effect when streaming */}
          {isStreaming && (
            <span className="inline-block w-2 h-4 ml-1 bg-pink-500 animate-blink"></span>
          )}
        </p>
      </div>
      {formattedTime && (
        <span className="text-xs text-gray-500 ml-2 mb-1">{formattedTime}</span>
      )}
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
          animation: blink 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default AIMessage;
