import Image from "next/image";
import { ReactNode } from "react";
import React from "react";

interface PregnancyFormLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  currentStep: number;
  onPrevious: () => void;
  onNext: () => void;
  isNextDisabled: boolean;
}

export default function PregnancyFormLayout({
  children,
  title,
  subtitle,
  currentStep,
  onPrevious,
  onNext,
  isNextDisabled,
}: PregnancyFormLayoutProps) {
  // 브라운 계열 색상
  const BROWN = '#A67C52';
  const BROWN_LIGHT = '#E9DCCF';

  return (
    <div className="min-h-screen w-full bg-white flex justify-center items-center">
      <div className="w-96 h-[874px] relative overflow-hidden flex justify-center">
        {/* 누리달 로고 */}
        <div className="absolute left-1/2 top-[50px] transform -translate-x-1/2 z-20 w-[200px] h-[100px]">
          <Image
            src="/images/logo/로고 구름.png"
            alt="로고 구름"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* 메인 카드 */}
        <div className="absolute top-[180px] w-80 bg-white rounded-[30px] shadow-lg p-6 z-10">
          {/* 달 아이콘 */}
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 relative">
              <Image
                src="/images/logo/달달.png"
                alt="달달"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* 텍스트 */}
          <div className="text-center mb-8">
            <div className="text-lg font-['Do_Hyeon'] text-neutral-700 mb-2">
              {title}
            </div>
            <div className="text-sm font-['Do_Hyeon'] text-neutral-400">
              {subtitle}
            </div>
          </div>

          {/* 단계 표시 */}
          <div className="flex justify-center items-center mb-8 w-full">
            <div className="flex items-center w-full max-w-[400px]">
              {[1, 2, 3].map((step, idx) => {
                const isCompleted = currentStep > step;
                const isActive = currentStep === step;
                const isUpcoming = currentStep < step;
                return (
                  <React.Fragment key={step}>
                    <div className="flex flex-col items-center flex-1 min-w-0">
                      {/* 원(circle) */}
                      <div
                        className={`w-8 h-8 flex items-center justify-center rounded-full border-2 z-10 transition-all duration-200
                          ${isCompleted ? 'bg-[#A67C52] border-[#A67C52]' : ''}
                          ${isActive ? 'bg-white border-[#A67C52]' : ''}
                          ${isUpcoming ? 'bg-[#E9DCCF] border-[#E9DCCF]' : ''}
                        `}
                      >
                        {isCompleted ? (
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <circle cx="10" cy="10" r="10" fill="#A67C52" />
                            <path d="M6 10.5L9 13.5L14 8.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : (
                          <span className={`font-bold text-base ${isActive ? 'text-[#A67C52]' : 'text-[#C2B1A0]'}`}>{step}</span>
                        )}
                      </div>
                      {/* 라벨 */}
                      <span className="mt-2 text-xs font-['Do_Hyeon'] font-bold text-[#A67C52]">
                        {step === 1 ? '태명' : step === 2 ? '임신주차' : '고위험'}
                      </span>
                    </div>
                    {/* 선(line) - step 사이에만 */}
                    {idx < 2 && (
                      <div className={`flex-1 h-1 mx-2 transition-all duration-200 ${isCompleted || isActive ? 'bg-[#A67C52]' : 'bg-[#E9DCCF]'}`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* 폼 내용 */}
          {children}

          {/* 버튼 */}
          <div className="flex justify-between">
            <button
              onClick={onPrevious}
              className="w-16 h-8 rounded-2xl bg-gray-200"
            >
              <span className="text-black text-xs font-['Do_Hyeon']">이전</span>
            </button>
            <button
              onClick={onNext}
              className={`w-16 h-8 rounded-2xl ${
                isNextDisabled ? "bg-gray-300 cursor-not-allowed" : "bg-gray-200"
              }`}
              disabled={isNextDisabled}
            >
              <span className="text-black text-xs font-['Do_Hyeon']">{currentStep === 3 ? "완료" : "다음"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 