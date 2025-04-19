"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function BabyName() {
  const router = useRouter();
  const [babyName, setBabyName] = useState("");
  const [gender, setGender] = useState("");
  const [noName, setNoName] = useState(false);
  const [noGender, setNoGender] = useState(false);

  const handleNext = () => {
    router.push('/register/pregnant/pregnancy-info/pregnancy-week');
  };

  const handlePrevious = () => {
    router.push('/register/pregnant/pregnancy-info');
  };

  // 모든 정보가 입력되었는지 확인
  const isFormValid = () => {
    // 태명이 입력되었거나 '태명이 없습니다'가 체크되었는지 확인
    const isNameValid = babyName.trim() !== "" || noName;
    
    // 성별이 선택되었거나 '아직 모릅니다'가 체크되었는지 확인
    const isGenderValid = gender !== "" || noGender;
    
    return isNameValid && isGenderValid;
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
        <div className="absolute top-[180px] w-80 bg-white rounded-[30px] shadow-lg p-6 z-10">
          {/* 뒤로가기 버튼 */}
          <div className="absolute top-0 left-0 p-2">
            <button
              onClick={handlePrevious}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </button>
          </div>
          
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
          <div className="text-center mb-6">
            <div className="text-lg font-['Do_Hyeon'] text-neutral-700 mb-1">
              임신 정보를 입력해주세요
            </div>
            <div className="text-sm font-['Do_Hyeon'] text-neutral-400">
              누리달에서 맞춤 서비스를 제공해 드립니다
            </div>
          </div>

          {/* 단계 표시 */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mb-1">
                <span className="text-black font-bold text-sm">1</span>
              </div>
              <span className="text-neutral-400 text-[10px] font-['Do_Hyeon']">임신 여부</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-[#FFE999] rounded-full flex items-center justify-center mb-1">
                <span className="text-black font-bold text-sm">2</span>
              </div>
              <span className="text-[#FFE999] text-[10px] font-['Do_Hyeon']">태명</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-zinc-300 rounded-full flex items-center justify-center mb-1">
                <span className="text-neutral-400 font-bold text-sm">3</span>
              </div>
              <span className="text-neutral-400 text-[10px] font-['Do_Hyeon']">임신 주차</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-zinc-300 rounded-full flex items-center justify-center mb-1">
                <span className="text-neutral-400 font-bold text-sm">4</span>
              </div>
              <span className="text-neutral-400 text-[10px] font-['Do_Hyeon']">고위험 여부</span>
            </div>
          </div>

          {/* 태명 섹션 */}
          <div className="mb-5">
            <div className="text-black text-sm font-['Do_Hyeon'] mb-2">태명</div>
            <input
              type="text"
              value={babyName}
              onChange={(e) => setBabyName(e.target.value)}
              placeholder="꼬물이"
              className="w-full h-8 bg-sky-100 rounded-[10px] border border-zinc-300 px-4 text-black/40 text-xs font-['Do_Hyeon']"
              disabled={noName}
            />
            <div className="flex items-center mt-1">
              <input
                type="checkbox"
                checked={noName}
                onChange={() => setNoName(!noName)}
                className="mr-2"
              />
              <span className="text-neutral-400 text-xs font-['Do_Hyeon']">태명이 없습니다</span>
            </div>
          </div>

          {/* 성별 섹션 */}
          <div className="mb-5">
            <div className="text-black text-sm font-['Do_Hyeon'] mb-2">성별</div>
            <div className="flex gap-8 mb-3 justify-center">
              <button
                onClick={() => setGender('male')}
                disabled={noGender}
                className={`w-16 h-8 flex items-center justify-center rounded-2xl transition-all duration-300 text-sm font-['Do_Hyeon'] ${
                  gender === 'male' 
                  ? 'bg-[#89CFF0] opacity-100' 
                  : 'bg-stone-300 opacity-50'
                }`}
              >
                남
              </button>
              <button
                onClick={() => setGender('female')}
                disabled={noGender}
                className={`w-16 h-8 flex items-center justify-center rounded-2xl transition-all duration-300 text-sm font-['Do_Hyeon'] ${
                  gender === 'female' 
                  ? 'bg-[#FFB6C1] opacity-100' 
                  : 'bg-stone-300 opacity-50'
                }`}
              >
                여
              </button>
            </div>
            <div className="flex items-center justify-center">
              <input
                type="checkbox"
                checked={noGender}
                onChange={() => setNoGender(!noGender)}
                className="mr-2"
              />
              <span className="text-neutral-400 text-xs font-['Do_Hyeon']">아직 모릅니다</span>
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex justify-end">
            <button
              onClick={handleNext}
              className={`w-16 h-8 rounded-2xl ${isFormValid() ? 'bg-[#FFE999]' : 'bg-gray-300 cursor-not-allowed'}`}
              disabled={!isFormValid()}
            >
              <span className="text-black text-xs font-['Do_Hyeon']">확인</span>
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