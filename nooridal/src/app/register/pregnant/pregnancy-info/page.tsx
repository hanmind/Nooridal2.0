"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import PregnancyFormLayout from "@/components/pregnancy/PregnancyFormLayout";

// 로컬 스토리지 키 상수
const STORAGE_KEY = "pregnancyInfo";

export default function PregnancyInfo() {
  const router = useRouter();
  const [isPregnant, setIsPregnant] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // 컴포넌트 마운트 시 저장된 데이터 불러오기
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        setIsPregnant(!!data.isPregnant); // boolean 값으로 확실하게 변환
      } catch (error) {
        console.error("저장된 데이터를 불러오는 중 오류가 발생했습니다:", error);
      }
    }
  }, []);

  // 데이터가 변경될 때마다 로컬 스토리지에 저장
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    let data = {};
    
    if (savedData) {
      try {
        data = JSON.parse(savedData);
      } catch (error) {
        console.error("저장된 데이터를 파싱하는 중 오류가 발생했습니다:", error);
      }
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...data,
      isPregnant: isPregnant
    }));
  }, [isPregnant]);

  const handleNext = () => {
    // 현재 상태를 저장하고 다음 페이지로 이동
    const savedData = localStorage.getItem(STORAGE_KEY);
    const data = savedData ? JSON.parse(savedData) : {};
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...data,
      isPregnant: isPregnant
    }));
    
    router.push('/register/pregnant/pregnancy-info/baby-name');
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
