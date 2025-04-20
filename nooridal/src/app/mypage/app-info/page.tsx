"use client";

import { useRouter } from "next/navigation";

export default function AppInfo() {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full bg-[#FFF4BB] flex justify-center items-center">
      <div className="w-96 h-[874px] relative bg-[#FFF4BB] overflow-hidden">
        {/* 헤더 */}
        <div className="left-[155px] top-[65px] absolute text-center justify-start text-neutral-700 text-2xl font-normal font-['Do_Hyeon'] leading-[50px]">
          앱 정보
        </div>
        <button 
          onClick={() => router.back()}
          className="left-[24px] top-[63px] absolute text-center justify-start text-neutral-700 text-2xl font-normal font-['Inter'] leading-[50px]"
        >
          &lt;
        </button>

        {/* 앱 정보 카드 */}
        <div className="w-96 h-[300px] left-0 top-[126px] absolute bg-white rounded-3xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.30)] shadow-[0px_1px_3px_1px_rgba(0,0,0,0.15)]">
          <div className="p-8">
            <div className="mb-6">
              <div className="text-xl font-['Do_Hyeon'] mb-2">앱 버전</div>
              <div className="text-gray-600">2.0.0</div>
            </div>
            
            <div className="mb-6">
              <div className="text-xl font-['Do_Hyeon'] mb-2">개발자 정보</div>
              <div className="text-gray-600">윤무열 한세희 최정은 장지윤</div>
            </div>

            <div>
              <div className="text-xl font-['Do_Hyeon'] mb-2">문의하기</div>
              <div className="text-gray-600">noorimoon2025@gmail.com</div>
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