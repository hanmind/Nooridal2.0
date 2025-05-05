import React from "react";

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  return (
    <div className="flex justify-center my-4">
      <div
        className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg relative shadow-md max-w-lg text-center"
        role="alert"
      >
        <strong className="font-bold">오류 발생:</strong>
        <span className="block sm:inline ml-2">{message}</span>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 ml-4 px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 transition duration-150 ease-in-out"
          >
            재시도
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
