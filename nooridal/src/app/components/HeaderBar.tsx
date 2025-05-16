import React from "react";
import { useRouter } from "next/navigation";

interface HeaderBarProps {
  title: React.ReactNode;
  showBackButton?: boolean;
  backUrl?: string;
  onBackClick?: () => void;
  rightButton?: React.ReactNode;
  leftCustomButton?: React.ReactNode;
}

const HeaderBar: React.FC<HeaderBarProps> = ({
  title,
  showBackButton = true,
  backUrl,
  onBackClick,
  rightButton,
  leftCustomButton,
}) => {
  const router = useRouter();

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else if (backUrl) {
      router.push(backUrl);
    } else {
      router.back();
    }
  };

  return (
    <div className="w-full h-20 fixed top-0 left-0 flex justify-center items-center bg-white shadow-md rounded-b-2xl px-4 z-10">
      {showBackButton && !leftCustomButton && (
        <button
          onClick={handleBackClick}
          className="absolute left-4 flex items-center justify-center text-black hover:text-yellow-600 transition-colors"
          title="뒤로 가기"
          aria-label="뒤로 가기"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      )}
      {leftCustomButton && (
        <div className="absolute left-4 flex items-center justify-center">
          {leftCustomButton}
        </div>
      )}

      <h1 className="text-xl font-normal font-['Do_Hyeon'] text-black">
        {title}
      </h1>

      {rightButton && <div className="absolute right-4">{rightButton}</div>}
    </div>
  );
};

export default HeaderBar;
