"use client";

import { useRouter } from "next/navigation";
import HeaderBar from "@/app/components/HeaderBar";

export default function AppInfo() {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full bg-[#FFF4BB] flex flex-col items-center pt-20">
      {/* 헤더 */}
      <HeaderBar title="앱 정보" />
      <main className="w-full max-w-md relative bg-[#FFF4BB] overflow-hidden mx-auto px-4">
        {/* 앱 정보 카드 */}
        <div className="w-full max-h-[calc(100vh-140px)] bg-yellow-50 overflow-y-auto rounded-xl mt-6">
          <div className="p-6">
            {/* 앱 정보 목록 */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl overflow-hidden border-2 border-[#FFE999] p-4">
                <div className="mb-4">
                  <div className="text-[#A67C52] font-['Do_Hyeon'] text-lg mb-2">
                    앱 버전
                  </div>
                  <div className="text-black text-base font-['Do_Hyeon']">
                    2.0.0
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-[#A67C52] font-['Do_Hyeon'] text-lg mb-2">
                    개발자 정보
                  </div>
                  <div className="text-black text-base font-['Do_Hyeon']">
                    윤무열 한세희 최정은 장지윤
                  </div>
                </div>

                <div>
                  <div className="text-[#A67C52] font-['Do_Hyeon'] text-lg mb-2">
                    문의하기
                  </div>
                  <div className="text-black text-base font-['Do_Hyeon']">
                    noorimoon2025@gmail.com
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
