"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import PregnancyFormLayout from "@/components/pregnancy/PregnancyFormLayout";

export default function PregnancyInfo() {
  const router = useRouter();
  const [isPregnant, setIsPregnant] = useState(false);

  const handleNext = () => {
    router.push('/register/pregnant/pregnancy-info/baby-name');
  };

  const handlePrevious = () => {
    router.push('/login');
  };

  return (
    <PregnancyFormLayout
      title="임신 정보를 입력해주세요"
      subtitle="누리달에서 맞춤 서비스를 제공해 드립니다"
      currentStep={1}
      onPrevious={handlePrevious}
      onNext={handleNext}
      isNextDisabled={!isPregnant}
    >
      {/* 임신 여부 선택 */}
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
    </PregnancyFormLayout>
  );
} 
