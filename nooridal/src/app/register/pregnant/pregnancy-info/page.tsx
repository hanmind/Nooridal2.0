"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import PregnancyFormLayout from "@/components/pregnancy/PregnancyFormLayout";

export default function PregnancyInfo() {
  const router = useRouter();
  const [isPregnant, setIsPregnant] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const handleNext = () => {
    if (currentStep === 1) {
      router.push('/register/pregnant/pregnancy-info/baby-name');
    } else if (currentStep === 2) {
      router.push('/register/pregnant/pregnancy-info/expected-date');
    } else if (currentStep === 3) {
      router.push('/register/pregnant/pregnancy-info/high-risk');
    }
  };

  const handlePrevious = () => {
    if (currentStep === 2) {
      router.push('/register/pregnant/pregnancy-info');
    } else if (currentStep === 3) {
      router.push('/register/pregnant/pregnancy-info/baby-name');
    } else if (currentStep === 4) {
      router.push('/register/pregnant/pregnancy-info/expected-date');
    }
  };

  return (
    <PregnancyFormLayout
      title="임신 정보를 입력해주세요"
      subtitle="누리달에서 맞춤 서비스를 제공해 드립니다"
      currentStep={currentStep}
      onPrevious={handlePrevious}
      onNext={handleNext}
      isNextDisabled={!isPregnant && currentStep === 1}
    >
      {/* 임신 여부 선택 */}
      {currentStep === 1 && (
        <div 
          className="w-full p-4 bg-[#FFF4BB] rounded-xl border border-[#FFE999] mb-4 flex items-center cursor-pointer"
          onClick={() => setIsPregnant(!isPregnant)}
        >
          <input
            type="checkbox"
            checked={isPregnant}
            onChange={() => setIsPregnant(!isPregnant)}
            className="w-4 h-4 mr-4"
          />
          <span className="text-black font-['Do_Hyeon']">임신 중입니다</span>
        </div>
      )}
    </PregnancyFormLayout>
  );
} 
