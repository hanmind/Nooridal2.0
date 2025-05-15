"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "누리달은 어떤 서비스인가요?",
    answer:
      "누리달은 임산부를 위한 종합 헬스케어 서비스입니다. 임신 주차별 맞춤 정보 제공, 병원 위치 안내 등 다양한 기능을 제공합니다.",
  },
  {
    question: "임신 정보는 어떻게 등록하나요?",
    answer:
      "마이페이지 > 임신 정보 관리에서 출산 예정일과 임신 주차를 입력하실 수 있습니다. 입력하신 정보를 바탕으로 맞춤 서비스를 제공해 드립니다.",
  },
  {
    question: "고위험 임신은 어떻게 등록하나요?",
    answer:
      "임신 정보 등록 시 고위험 임신 여부를 체크하실 수 있습니다. 이를 통해 보다 세심한 관리와 정보를 제공받으실 수 있습니다.",
  },
  {
    question: "위치 기반 서비스는 어떻게 이용하나요?",
    answer:
      "위치 서비스 활성화 후, 하단 메뉴의 '위치' 탭을 통해 다양한 정보를 확인하실 수 있습니다.",
  },
  {
    question: "채팅 기능은 어떻게 이용하나요?",
    answer:
      "AI 에이전트 플로렌스와 채팅을 통해 임신 및 출산 관련 질문에 대한 답변을 받으실 수 있습니다.",
  },
];

export default function FAQ() {
  const router = useRouter();
  const [openQuestion, setOpenQuestion] = useState<number | null>(null);

  const toggleQuestion = (index: number) => {
    setOpenQuestion(openQuestion === index ? null : index);
  };

  return (
    <div className="min-h-screen w-full flex justify-center items-center px-2 sm:px-4 md:px-8 bg-white">
      <main className="w-full max-w-md min-h-screen relative bg-white overflow-hidden sm:w-96 md:w-[420px] lg:w-[480px] xl:w-[520px]">
        {/* 헤더 */}
        <div className="w-full h-[100px] sm:h-[120px] flex items-center justify-center bg-white shadow-md rounded-b-3xl px-2 sm:px-4 relative">
          <button
            onClick={() => router.back()}
            className="absolute left-10 text-yellow-600 hover:text-yellow-800"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h1 className="text-xl sm:text-2xl text-neutral-700 font-['Do_Hyeon']">
            자주 찾는 질문
          </h1>
        </div>

        {/* FAQ 카드 */}
        <div className="w-full h-[calc(100vh-140px)] sm:h-[calc(100vh-180px)] bg-yellow-50 overflow-y-auto">
          <div className="p-6">
            {/* 상단 아이콘 */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-[#FFF4BB] rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-[#FFD600]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>

            {/* FAQ 목록 */}
            <div className="space-y-4">
              {faqData.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl overflow-hidden border-2 border-[#FFE999]"
                >
                  <button
                    onClick={() => toggleQuestion(index)}
                    className="w-full flex items-center justify-between p-4 hover:bg-[#FFF4BB] transition-colors"
                  >
                    <div className="flex items-center">
                      <span className="text-[#FFD600] font-['Do_Hyeon'] text-lg mr-3">
                        Q.
                      </span>
                      <span className="text-base font-['Do_Hyeon'] text-left">
                        {faq.question}
                      </span>
                    </div>
                    <svg
                      className={`w-5 h-5 text-gray-400 transform transition-transform ${
                        openQuestion === index ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  {openQuestion === index && (
                    <div className="p-4 bg-[#FFF4BB] border-t-2 border-[#FFE999]">
                      <div className="flex">
                        <span className="text-[#FFD600] font-['Do_Hyeon'] text-lg mr-3">
                          A.
                        </span>
                        <span className="text-gray-700 text-base font-['Do_Hyeon']">
                          {faq.answer}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
