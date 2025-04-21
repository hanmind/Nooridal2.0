"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import PregnancyFormLayout from "@/components/pregnancy/PregnancyFormLayout";

export default function HighRisk() {
  const router = useRouter();
  const [isHighRisk, setIsHighRisk] = useState(false);
  const [showHighRiskModal, setShowHighRiskModal] = useState(false);

  const handleNext = () => {
    router.push('/register/pregnant/pregnancy-info/complete');
  };

  const handlePrevious = () => {
    router.push('/register/pregnant/pregnancy-info/expected-date');
  };

  const isFormValid = () => {
    return true; // 항상 다음으로 진행 가능
  };

  return (
    <PregnancyFormLayout
      title="고위험 임신 여부를 알려주세요"
      subtitle="고위험 임신의 경우 맞춤 서비스를 제공해 드립니다"
      currentStep={4}
      onPrevious={handlePrevious}
      onNext={handleNext}
      isNextDisabled={!isFormValid()}
    >
      {/* 고위험 임신 체크박스 */}
      <div 
        className="mb-4 flex items-center cursor-pointer"
        onClick={() => {
          setShowHighRiskModal(true);
        }}
      >
        <input
          type="checkbox"
          checked={isHighRisk}
          onChange={() => {
            setShowHighRiskModal(true);
          }}
          className={`w-4 h-4 mr-2 rounded border-gray-300 ${isHighRisk ? 'bg-red-100' : ''}`}
        />
        <span className="text-red-500 text-sm font-['Do_Hyeon']">고위험 임신입니다</span>
      </div>

      {/* 고위험 임신 정보 모달 */}
      {showHighRiskModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-[20px] shadow-lg w-[90%] max-w-md z-10 mx-4">
            <div className="text-center mb-6">
              <div className="text-xl font-['Do_Hyeon'] text-gray-900 mb-2">
                고위험 임신이란?
              </div>
              <div className="text-sm font-['Do_Hyeon'] text-gray-600">
                다음과 같은 경우 고위험 임신으로 분류됩니다:
              </div>
            </div>

            <div className="mb-6 space-y-3 bg-gray-50 p-4 rounded-xl">
              <div className="text-sm font-['Do_Hyeon'] text-gray-700">• 만 35세 이상의 고령 임신</div>
              <div className="text-sm font-['Do_Hyeon'] text-gray-700">• 임신성 당뇨</div>
              <div className="text-sm font-['Do_Hyeon'] text-gray-700">• 임신성 고혈압</div>
              <div className="text-sm font-['Do_Hyeon'] text-gray-700">• 다태 임신</div>
              <div className="text-sm font-['Do_Hyeon'] text-gray-700">• 전치태반</div>
              <div className="text-sm font-['Do_Hyeon'] text-gray-700">• 조기진통</div>
              <div className="text-sm font-['Do_Hyeon'] text-gray-700">• 산부인과 전문의가 고위험 임신으로 판단한 경우</div>
            </div>

            <div className="text-sm font-['Do_Hyeon'] text-gray-600 mb-6 p-3 bg-[#FFF4BB] rounded-xl">
              누리달에서는 고위험 임신부를 위한 맞춤 서비스를 제공해 드립니다.
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => {
                  setShowHighRiskModal(false);
                  setIsHighRisk(false);
                }}
                className="w-20 h-9 rounded-2xl bg-gray-200 hover:bg-gray-300 transition-colors"
              >
                <span className="text-gray-700 text-sm font-['Do_Hyeon']">취소</span>
              </button>
              <button
                onClick={() => {
                  setShowHighRiskModal(false);
                  setIsHighRisk(true);
                }}
                className="w-20 h-9 rounded-2xl bg-[#FFE999] hover:bg-[#FFD999] transition-colors"
              >
                <span className="text-gray-900 text-sm font-['Do_Hyeon']">확인</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </PregnancyFormLayout>
  );
} 