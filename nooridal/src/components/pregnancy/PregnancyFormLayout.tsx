import Image from "next/image";
import { ReactNode } from "react";

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
  return (
    <div className="min-h-screen w-full bg-[#FFF4BB] flex justify-center items-center">
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
          <div className="flex justify-between items-center mb-8">
            {[
              { step: 1, label: "임신 여부" },
              { step: 2, label: "태명" },
              { step: 3, label: "임신 주차" },
              { step: 4, label: "고위험 여부" },
            ].map(({ step, label }) => (
              <div key={step} className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                    step < currentStep ? "bg-[#FFE999]" : step === currentStep ? "bg-green-500" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`font-bold ${
                      step <= currentStep ? "text-black" : "text-gray-500"
                    }`}
                  >
                    {step}
                  </span>
                </div>
                <span
                  className={`text-xs font-['Do_Hyeon'] ${
                    step < currentStep ? "text-[#FFE999]" : step === currentStep ? "text-green-500" : "text-gray-400"
                  }`}
                >
                  {label}
                </span>
              </div>
            ))}
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
                isNextDisabled ? "bg-gray-300 cursor-not-allowed" : "bg-[#FFE999]"
              }`}
              disabled={isNextDisabled}
            >
              <span className="text-black text-xs font-['Do_Hyeon']">다음</span>
            </button>
          </div>
        </div>

        {/* 배경 이미지 */}
        <div className="absolute bottom-0 left-0 right-0 h-[400px] w-full">
          <Image
            src="/images/logo/임신정보등록 배경.png"
            alt="배경"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>
    </div>
  );
} 