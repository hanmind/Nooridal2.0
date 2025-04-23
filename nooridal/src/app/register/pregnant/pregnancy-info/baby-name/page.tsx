"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import PregnancyFormLayout from "@/components/pregnancy/PregnancyFormLayout";

// 로컬 스토리지 키 상수
const STORAGE_KEY = "pregnancyInfo";

export default function BabyName() {
  const router = useRouter();
  const [babyName, setBabyName] = useState("");
  const [noName, setNoName] = useState(false);
  const [gender, setGender] = useState("");
  const [noGender, setNoGender] = useState(false);

  // 컴포넌트 마운트 시 저장된 데이터 불러오기
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        if (data.babyName) setBabyName(data.babyName);
        if (data.noName) setNoName(data.noName);
        if (data.gender) setGender(data.gender);
        if (data.noGender) setNoGender(data.noGender);
      } catch (error) {
        console.error("저장된 데이터를 불러오는 중 오류가 발생했습니다:", error);
      }
    }
  }, []);

  // 데이터가 변경될 때마다 로컬 스토리지에 저장
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    let existingData = {};
    
    if (savedData) {
      try {
        existingData = JSON.parse(savedData);
      } catch (error) {
        console.error("저장된 데이터를 파싱하는 중 오류가 발생했습니다:", error);
      }
    }
    
    // 현재 페이지의 데이터만 업데이트하고 기존 데이터는 유지
    const updatedData = {
      ...existingData,
      babyName,
      noName,
      gender,
      noGender
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
  }, [babyName, noName, gender, noGender]);

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
          className="w-full p-2.5 bg-[#FFF4BB] rounded-xl border border-yellow-300 text-black font-['Do_Hyeon'] focus:outline-none focus:border-[#FFE999] focus:border-2 transition-colors"
          disabled={noName}
        />
        <div 
          className="mt-3 flex items-center cursor-pointer"
          onClick={() => {
            setNoName(!noName);
            if (!noName) {
              setBabyName("아기");
            } else {
              setBabyName("");
            }
          }}
        >
          <input
            type="checkbox"
            checked={noName}
            onChange={() => {
              setNoName(!noName);
              if (!noName) {
                setBabyName("아기");
              } else {
                setBabyName("");
              }
            }}
            className="w-4 h-4 mr-2"
          />
          <span className="text-black text-sm font-['Do_Hyeon']">미정</span>
        </div>
      </div>

      {/* 성별 선택 */}
      <div className="mb-5">
        <div className="text-black text-sm font-['Do_Hyeon'] mb-1">성별</div>
        <div className="flex gap-2">
          <button
            onClick={() => setGender("남자")}
            className={`flex-1 p-2 rounded-xl border ${
              gender === "남자" ? "bg-blue-200 border-blue-200" : "bg-white border-gray-300"
            }`}
          >
            <span className="text-black text-sm font-['Do_Hyeon']">남자</span>
          </button>
          <button
            onClick={() => setGender("여자")}
            className={`flex-1 p-2 rounded-xl border ${
              gender === "여자" ? "bg-red-200 border-red-200" : "bg-white border-gray-300"
            }`}
          >
            <span className="text-black text-sm font-['Do_Hyeon']">여자</span>
          </button>
        </div>
        <div 
          className="mt-2 flex items-center cursor-pointer"
          onClick={() => {
            setNoGender(!noGender);
            if (!noGender) {
              setGender("");
            }
          }}
        >
          <input
            type="checkbox"
            checked={noGender}
            onChange={() => {
              setNoGender(!noGender);
              if (!noGender) {
                setGender("");
              }
            }}
            className="w-4 h-4 mr-2"
          />
          <span className="text-black text-sm font-['Do_Hyeon']">아직 모름</span>
        </div>
      </div>
    </PregnancyFormLayout>
  );
} 