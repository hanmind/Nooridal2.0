"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function HighRisk() {
  const router = useRouter();
  const [isHighRisk, setIsHighRisk] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleNext = () => {
    router.push('/register/pregnant/pregnancy-info/complete');
  };

  const handlePrevious = () => {
    router.push('/register/pregnant/pregnancy-info/pregnancy-week');
  };

  // 모든 정보가 입력되었는지 확인
  const isFormValid = () => {
    // 고위험 임신 여부가 선택되었는지 확인
    // 체크박스가 체크되거나 체크되지 않은 상태로 명확하게 선택된 경우 유효
    return true; // 이 페이지에서는 체크박스가 선택되지 않은 상태도 유효한 선택으로 간주
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsHighRisk(e.target.checked);
    if (e.target.checked) {
      setShowModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
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
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mb-1">
                <span className="text-black font-bold text-sm">2</span>
              </div>
              <span className="text-neutral-400 text-[10px] font-['Do_Hyeon']">태명</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mb-1">
                <span className="text-black font-bold text-sm">3</span>
              </div>
              <span className="text-neutral-400 text-[10px] font-['Do_Hyeon']">임신 주차</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-[#FFE999] rounded-full flex items-center justify-center mb-1">
                <span className="text-black font-bold text-sm">4</span>
              </div>
              <span className="text-[#FFE999] text-[10px] font-['Do_Hyeon']">고위험 여부</span>
            </div>
          </div>

          {/* 고위험 여부 체크박스 */}
          <div className="mb-5">
            <div className="text-black text-sm font-['Do_Hyeon'] mb-2">고위험 임신 여부</div>
            <div className="bg-[#FFE1DD] rounded-[10px] border border-rose-400 p-4">
              <div className="flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={isHighRisk}
                  onChange={handleCheckboxChange}
                  className="mr-2"
                />
                <span className="text-neutral-700 text-xs font-['Do_Hyeon']">고위험 임신입니다</span>
              </div>
            </div>
          </div>

          {/* 설명 텍스트 */}
          <div className="text-neutral-400 text-xs font-['Do_Hyeon'] mb-5">
            고위험 임신인 경우 체크해 주세요. 맞춤형 정보를 제공해 드립니다.
          </div>

          {/* 버튼 */}
          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              className="w-16 h-8 bg-white rounded-2xl border border-neutral-400"
            >
              <span className="text-black text-xs font-['Do_Hyeon']">이전</span>
            </button>
            <button
              onClick={handleNext}
              className={`w-16 h-8 rounded-2xl ${isFormValid() ? 'bg-[#FFE999]' : 'bg-gray-300 cursor-not-allowed'}`}
              disabled={!isFormValid()}
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

        {/* 고위험 임신 모달 */}
        {showModal && (
          <div className="absolute top-[180px] left-1/2 transform -translate-x-1/2 z-20">
            <div className="bg-[#FFE1DD] rounded-[30px] p-6 w-80 max-h-[80vh] overflow-y-auto shadow-lg border border-rose-400">
              <div className="text-lg font-['Do_Hyeon'] text-neutral-700 mb-4 text-center">
                고위험 임신이란?
              </div>
              <div className="text-sm font-['Do_Hyeon'] text-neutral-700 mb-4">
                <p className="mb-2">고위험 임신은 다음과 같은 경우를 말합니다:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>35세 이상의 고령 임신</li>
                  <li>당뇨병, 고혈압 등 기존 질환이 있는 경우</li>
                  <li>이전 임신에서 합병증이 있었던 경우</li>
                  <li>다태 임신</li>
                  <li>태아 기형이나 유전적 문제가 있는 경우</li>
                  <li>임신 중 감염이나 합병증이 발생한 경우</li>
                </ul>
                <p className="mt-4">
                  고위험 임신은 더 많은 의학적 관리와 모니터링이 필요합니다. 
                  정기적인 검진과 의료진과의 긴밀한 협조가 중요합니다.
                </p>
              </div>
              <div className="flex justify-end mt-4">
                <button
                  onClick={handleCloseModal}
                  className="w-16 h-8 bg-[#FF9082] rounded-2xl"
                >
                  <span className="text-black text-xs font-['Do_Hyeon']">확인</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 