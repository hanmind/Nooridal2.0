"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PregnancyInfo() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isPregnant, setIsPregnant] = useState(false);

  const handleNext = () => {
    // 임신 정보 입력 후 캘린더 화면으로 이동
    router.push('/calendar');
  };

  // 모든 정보가 입력되었는지 확인
  const isFormValid = () => {
    // 임신 여부가 선택되었는지 확인
    return isPregnant;
  };

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
        <div className="absolute top-[180px] w-80 bg-white rounded-[30px] shadow-lg p-8 pb-6 z-10">
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
              임신 정보를 입력해주세요
            </div>
            <div className="text-sm font-['Do_Hyeon'] text-neutral-400">
              누리달에서 맞춤 서비스를 제공해 드립니다
            </div>
          </div>

          {/* 단계 표시 */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-[#FFE999] rounded-full flex items-center justify-center mb-2">
                <span className="text-black font-bold">1</span>
              </div>
              <span className="text-[#FFE999] text-xs font-['Do_Hyeon']">임신 여부</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                <span className="text-gray-500 font-bold">2</span>
              </div>
              <span className="text-gray-400 text-xs font-['Do_Hyeon']">태명</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                <span className="text-gray-500 font-bold">3</span>
              </div>
              <span className="text-gray-400 text-xs font-['Do_Hyeon']">임신 주차</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                <span className="text-gray-500 font-bold">4</span>
              </div>
              <span className="text-gray-400 text-xs font-['Do_Hyeon']">고위험 여부</span>
            </div>
          </div>

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

          {/* 다음 버튼 */}
          <div className="flex justify-end">
            <button
              onClick={handleNext}
              className={`w-20 h-10 rounded-2xl text-sm font-['Do_Hyeon'] ${isFormValid() ? 'bg-[#FFE999]' : 'bg-gray-300 cursor-not-allowed'}`}
              disabled={!isFormValid()}
            >
              확인
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
