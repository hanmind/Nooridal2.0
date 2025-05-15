import React from "react";
import { useRouter } from "next/navigation";

interface HeaderBarProps {
  title: string;
  showBackButton?: boolean;
  backUrl?: string;
  onBackClick?: () => void;
  rightButton?: React.ReactNode;
  leftButton?: React.ReactNode;
}

const HeaderBar: React.FC<HeaderBarProps> = ({
  title,
  showBackButton = true,
  backUrl,
  onBackClick,
  rightButton,
  leftButton,
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
    <div className="w-full h-20 sticky top-0 flex justify-center items-center bg-white shadow-md rounded-b-2xl px-4 z-10">
      {leftButton ? (
        <div className="absolute left-4">{leftButton}</div>
      ) : (
        showBackButton && (
          <button
            onClick={handleBackClick}
            className="absolute left-4 flex items-center justify-center text-neutral-700 hover:text-yellow-600 transition-colors"
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
        )
      )}

      <h1 className="text-xl font-normal font-['Do_Hyeon'] text-neutral-700">
        {title}
      </h1>

      {rightButton && <div className="absolute right-4">{rightButton}</div>}
    </div>
  );
};

export default HeaderBar;
