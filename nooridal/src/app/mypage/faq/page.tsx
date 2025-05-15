"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import HeaderBar from "@/app/components/HeaderBar";

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
    <div className="min-h-screen w-full bg-[#FFF4BB] flex flex-col items-center pt-20">
      {/* 헤더 */}
      <HeaderBar title="자주 묻는 질문" />
      <main className="w-full max-w-md relative bg-[#FFF4BB] overflow-hidden mx-auto px-4">
        {/* FAQ 목록 */}
        <div className="w-full max-h-[calc(100vh-140px)] overflow-y-auto mt-6">
          <div className="space-y-4 pb-6">
            {faqData.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-sm overflow-hidden"
              >
                <div
                  className="flex justify-between items-center p-4 cursor-pointer bg-[#FFF8DD] text-black"
                  onClick={() => toggleQuestion(index)}
                >
                  <h3 className="text-lg font-['Do_Hyeon']">{item.question}</h3>
                  <svg
                    className={`w-6 h-6 transition-transform duration-300 ${
                      openQuestion === index ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
                <div
                  className={`overflow-hidden transition-max-height duration-500 ease-in-out text-black ${
                    openQuestion === index ? "max-h-96" : "max-h-0"
                  }`}
                >
                  <div className="p-4 bg-white">
                    <p className="text-base font-['Do_Hyeon']">{item.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
