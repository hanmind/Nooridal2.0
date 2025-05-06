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
        hour12: false, // 24시간 표기
      })
    : "";

  return (
    <div className="flex justify-start mb-3">
      {" "}
      {/* 여백 약간 조정 */}
      <div className="flex items-end max-w-[75%]">
        {" "}
        {/* 최대 너비 약간 증가 */}
        {/* AI 아바타/아이콘이 필요하다면 여기에 추가 */}
        {/* <img src="/path/to/ai-avatar.png" alt="AI" className="w-8 h-8 rounded-full mr-2 self-start" /> */}
        <div
          className="bg-white text-gray-800 dark:bg-gray-700 dark:text-gray-200 p-3 rounded-xl shadow"
          // 이미지의 흰색 배경을 위해 bg-white 사용
        >
          <p className="text-sm whitespace-pre-wrap">
            {message}
            {isStreaming && (
              <span className="inline-block w-2 h-4 ml-1 bg-yellow-600 animate-blink"></span> // 스트리밍 커서 색상 변경
            )}
          </p>
        </div>
        {formattedTime && (
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 self-end mb-0.5">
            {" "}
            {/* 시간 위치 및 색상 조정 */}
            {formattedTime}
          </span>
        )}
      </div>
      {/* Basic CSS for blinking animation - needs to be added to global CSS or Tailwind config if not already present */}
      {/* This style block might be better placed in a global CSS file */}
      <style jsx global>{` /* global 추가 */}
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
