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
    answer: "누리달은 임산부를 위한 종합 헬스케어 서비스입니다. 임신 주차별 맞춤 정보 제공, 병원 위치 안내 등 다양한 기능을 제공합니다."
  },
  {
    question: "임신 정보는 어떻게 등록하나요?",
    answer: "마이페이지 > 임신 정보 관리에서 출산 예정일과 임신 주차를 입력하실 수 있습니다. 입력하신 정보를 바탕으로 맞춤 서비스를 제공해 드립니다."
  },
  {
    question: "고위험 임신은 어떻게 등록하나요?",
    answer: "임신 정보 등록 시 고위험 임신 여부를 체크하실 수 있습니다. 이를 통해 보다 세심한 관리와 정보를 제공받으실 수 있습니다."
  },
  {
    question: "위치 기반 서비스는 어떻게 이용하나요?",
    answer: "위치 서비스 활성화 후, 하단 메뉴의 '위치' 탭을 통해 다양한 정보를 확인하실 수 있습니다."
  },
  {
    question: "채팅 기능은 어떻게 이용하나요?",
    answer: "AI 에이전트 플로렌스와 채팅을 통해 임신 및 출산 관련 질문에 대한 답변을 받으실 수 있습니다."
  }
];

export default function FAQ() {
  const router = useRouter();
  const [openQuestion, setOpenQuestion] = useState<number | null>(null);

  const toggleQuestion = (index: number) => {
    setOpenQuestion(openQuestion === index ? null : index);
  };

  return (
    <div className="min-h-screen w-full bg-[#FFF4BB] flex justify-center items-center">
      <div className="w-96 h-[900px] relative bg-[#FFF4BB] overflow-hidden">
        {/* 헤더 */}
        <div className="left-[145px] top-[65px] absolute text-center justify-start text-neutral-700 text-2xl font-normal font-['Do_Hyeon'] leading-[50px]">
          자주 찾는 질문
        </div>
        <button 
          onClick={() => router.back()}
          className="left-[24px] top-[63px] absolute text-center justify-start text-neutral-700 text-2xl font-normal font-['Inter'] leading-[50px]"
        >
          &lt;
        </button>

        {/* FAQ 카드 */}
        <div className="w-96 h-[538px] left-0 top-[200px] absolute bg-white rounded-3xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.30)] shadow-[0px_1px_3px_1px_rgba(0,0,0,0.15)] overflow-y-auto">
          <div className="p-6">
            {/* 상단 아이콘 */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-[#FFF4BB] rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-[#FFD600]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>

            {/* FAQ 목록 */}
            <div className="space-y-4">
              {faqData.map((faq, index) => (
                <div key={index} className="bg-white rounded-xl overflow-hidden border-2 border-[#FFE999]">
                  <button
                    onClick={() => toggleQuestion(index)}
                    className="w-full flex items-center justify-between p-4 hover:bg-[#FFF4BB] transition-colors"
                  >
                    <div className="flex items-center">
                      <span className="text-[#FFD600] font-['Do_Hyeon'] text-lg mr-3">Q.</span>
                      <span className="text-base font-['Do_Hyeon'] text-left">{faq.question}</span>
                    </div>
                    <svg 
                      className={`w-5 h-5 text-gray-400 transform transition-transform ${openQuestion === index ? 'rotate-180' : ''}`}
                      fill="none" 
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openQuestion === index && (
                    <div className="p-4 bg-[#FFF4BB] border-t-2 border-[#FFE999]">
                      <div className="flex">
                        <span className="text-[#FFD600] font-['Do_Hyeon'] text-lg mr-3">A.</span>
                        <span className="text-gray-700 text-base font-['Do_Hyeon']">{faq.answer}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 하단 네비게이션 바 */}
        <div className="absolute bottom-0 w-full">
          <div className="w-[462px] h-52 relative">
            <div className="w-44 h-44 left-[-24px] top-[742px] absolute bg-white rounded-full" />
            <div className="w-44 h-44 left-[109px] top-[742px] absolute bg-white rounded-full" />
            <div className="w-44 h-44 left-[250px] top-[742px] absolute bg-white rounded-full" />
            <div className="w-44 h-44 left-[-28px] top-[723px] absolute bg-white/40 rounded-full" />
            <div className="w-44 h-44 left-[105px] top-[723px] absolute bg-white/40 rounded-full" />
            <div className="w-44 h-44 left-[246px] top-[723px] absolute bg-white/40 rounded-full" />
            
            {/* 채팅 아이콘 */}
            <div className="w-8 h-7 left-[52.71px] top-[786px] absolute bg-white rounded-full border-[3px] border-neutral-400" />
            <div className="w-2.5 h-1.5 left-[59.40px] top-[816.33px] absolute origin-top-left rotate-[-141.02deg] bg-white rounded-[0.50px] border-[3px] border-neutral-400" />
            <div className="w-1.5 h-1.5 left-[60.46px] top-[812.90px] absolute origin-top-left rotate-[-141.02deg] bg-white rounded-[0.50px] border-2 border-yellow-400/0" />
            
            {/* 캘린더 아이콘 */}
            <div className="w-8 h-7 left-[140.75px] top-[787.34px] absolute bg-white rounded-[5px] border-[3px] border-neutral-400" />
            <div className="w-7 h-0 left-[142.49px] top-[796.10px] absolute outline outline-[3px] outline-offset-[-1.50px] outline-neutral-400"></div>
            <div className="w-1 h-0 left-[146.83px] top-[784px] absolute origin-top-left rotate-90 outline outline-[3px] outline-offset-[-1.50px] outline-neutral-400"></div>
            <div className="w-1 h-0 left-[162.90px] top-[784px] absolute origin-top-left rotate-90 outline outline-[3px] outline-offset-[-1.50px] outline-neutral-400"></div>
            
            {/* 위치 아이콘 */}
            <div className="w-8 h-8 left-[222px] top-[784px] absolute overflow-hidden">
              <div className="w-5 h-7 left-[6.88px] top-[2.75px] absolute bg-neutral-400" />
            </div>
            
            {/* 마이페이지 아이콘 */}
            <div className="w-4 h-4 left-[323.75px] top-[787px] absolute bg-white rounded-full border-[3px] border-yellow-400" />
            <div className="w-9 h-3.5 left-[314.40px] top-[803.78px] absolute bg-white rounded-[5px] border-[3px] border-yellow-400" />
            <div className="w-10 h-1 left-[310.68px] top-[813.46px] absolute bg-white" />

            {/* 네비게이션 텍스트 */}
            <div className="w-20 h-16 left-[25px] top-[803px] absolute text-center justify-start text-neutral-400 text-xs font-normal font-['Do_Hyeon'] leading-[50px]">채팅</div>
            <div className="w-9 h-8 left-[138px] top-[803px] absolute text-center justify-start text-neutral-400 text-xs font-normal font-['Do_Hyeon'] leading-[50px]">캘린더</div>
            <div className="w-20 h-10 left-[201px] top-[802.60px] absolute text-center justify-start text-neutral-400 text-xs font-normal font-['Do_Hyeon'] leading-[50px]">위치</div>
            <div className="w-20 h-10 left-[293px] top-[802.60px] absolute text-center justify-start text-yellow-400 text-xs font-normal font-['Do_Hyeon'] leading-[50px]">마이페이지</div>
          </div>
        </div>
      </div>
    </div>
  );
} 