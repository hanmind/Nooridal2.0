import React from "react";

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  return (
    <div className="flex justify-start mb-4">
      {/* Align with AI message bubble style but indicate error */}
      <div className="flex items-end max-w-[70%]">
        <div className="bg-red-100 border border-red-400 text-red-700 rounded-lg py-2 px-4">
          <p className="text-sm font-medium">오류 발생:</p>
          <p className="text-sm whitespace-pre-wrap">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 text-xs bg-red-200 hover:bg-red-300 text-red-800 py-1 px-2 rounded"
            >
              다시 시도
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;
