"use client";

import { useRouter } from "next/navigation";

export default function AppInfo() {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full flex justify-center items-center px-2 sm:px-4 md:px-8 bg-white">
      <main className="w-full max-w-md min-h-screen relative bg-white overflow-hidden sm:w-96 md:w-[420px] lg:w-[480px] xl:w-[520px]">
        {/* 헤더 */}
        <div className="w-full h-[140px] sm:h-[180px] flex items-center justify-center bg-white shadow-md rounded-b-3xl px-2 sm:px-4 relative">
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
            앱 정보
          </h1>
        </div>

        {/* 앱 정보 카드 */}
        <div className="w-full h-[calc(100vh-140px)] sm:h-[calc(100vh-180px)] bg-yellow-50 overflow-y-auto">
          <div className="p-6">
            {/* 상단 아이콘 */}
            {/* 상단 아이콘 */}

            {/* 앱 정보 목록 */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl overflow-hidden border-2 border-[#FFE999] p-4">
                <div className="mb-4">
                  <div className="text-[#A67C52] font-['Do_Hyeon'] text-lg mb-2">앱 버전</div>
                  <div className="text-gray-700 text-base font-['Do_Hyeon']">2.0.0</div>
                </div>
                
                <div className="mb-4">
                  <div className="text-[#A67C52] font-['Do_Hyeon'] text-lg mb-2">개발자 정보</div>
                  <div className="text-gray-700 text-base font-['Do_Hyeon']">윤무열 한세희 최정은 장지윤</div>
                </div>

                <div>
                  <div className="text-[#A67C52] font-['Do_Hyeon'] text-lg mb-2">문의하기</div>
                  <div className="text-gray-700 text-base font-['Do_Hyeon']">noorimoon2025@gmail.com</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 