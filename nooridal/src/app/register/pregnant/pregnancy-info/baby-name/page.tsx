"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import PregnancyFormLayout from "@/components/pregnancy/PregnancyFormLayout";

export default function BabyName() {
  const router = useRouter();
  const [babyName, setBabyName] = useState("");
  const [noName, setNoName] = useState(false);
  const [gender, setGender] = useState("");
  const [noGender, setNoGender] = useState(false);

  const handleNext = () => {
    router.push('/register/pregnant/pregnancy-info/expected-date');
  };

  const handlePrevious = () => {
    router.push('/register/pregnant/pregnancy-info');
  };

  // 모든 정보가 입력되었는지 확인
  const isFormValid = () => {
    // 태명이 입력되었거나 '아직 없음'이 선택되었는지 확인
    const isNameValid = babyName.trim() !== "" || noName;
    // 성별이 선택되었거나 '아직 없음'이 선택되었는지 확인
    const isGenderValid = gender !== "" || noGender;
    return isNameValid && isGenderValid;
  };

  return (
    <PregnancyFormLayout
      title="태명을 입력해주세요"
      subtitle="아직 없으면 건너뛸 수 있습니다"
      currentStep={2}
      onPrevious={handlePrevious}
      onNext={handleNext}
      isNextDisabled={!isFormValid()}
    >
      {/* 태명 입력 */}
      <div className="mb-4">
        <input
          type="text"
          value={babyName}
          onChange={(e) => setBabyName(e.target.value)}
          placeholder="태명을 입력해주세요"
          className="w-full p-4 bg-[#FFF4BB] rounded-xl border border-[#FFE999] text-black font-['Do_Hyeon']"
          disabled={noName}
        />
        <div 
          className="mt-2 flex items-center cursor-pointer"
          onClick={() => setNoName(!noName)}
        >
          <input
            type="checkbox"
            checked={noName}
            onChange={() => setNoName(!noName)}
            className="w-4 h-4 mr-2"
          />
          <span className="text-black text-sm font-['Do_Hyeon']">아직 없음</span>
        </div>
      </div>

      {/* 성별 선택 */}
      <div className="mb-4">
        <div className="text-black text-sm font-['Do_Hyeon'] mb-2">성별</div>
        <div className="flex gap-2">
          <button
            onClick={() => setGender("남자")}
            className={`flex-1 p-2 rounded-xl border ${
              gender === "남자" ? "bg-[#FFE999] border-[#FFE999]" : "bg-white border-gray-300"
            }`}
          >
            <span className="text-black text-sm font-['Do_Hyeon']">남자</span>
          </button>
          <button
            onClick={() => setGender("여자")}
            className={`flex-1 p-2 rounded-xl border ${
              gender === "여자" ? "bg-[#FFE999] border-[#FFE999]" : "bg-white border-gray-300"
            }`}
          >
            <span className="text-black text-sm font-['Do_Hyeon']">여자</span>
          </button>
        </div>
        <div 
          className="mt-2 flex items-center cursor-pointer"
          onClick={() => setNoGender(!noGender)}
        >
          <input
            type="checkbox"
            checked={noGender}
            onChange={() => setNoGender(!noGender)}
            className="w-4 h-4 mr-2"
          />
          <span className="text-black text-sm font-['Do_Hyeon']">아직 없음</span>
        </div>
      </div>
    </PregnancyFormLayout>
  );
} 