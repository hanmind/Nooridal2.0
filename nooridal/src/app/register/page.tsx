"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Register() {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full bg-[#FFF4BB] flex justify-center items-center">
      <div className="w-96 h-[874px] relative bg-[#FFF4BB] overflow-hidden">
        {/* 배경 이미지 */}
        <Image
          src="/images/logo/아이디찾기 배경.png"
          alt="배경"
          fill
          className="object-cover z-0"
          priority
        />
        
        {/* 누리달 로고 */}
        <Image
          className="w-32 h-14 left-[135px] top-[109px] absolute z-20"
          src="/images/logo/누리달.png"
          alt="누리달 로고"
          width={134}
          height={55}
        />

        <div className="w-full flex flex-col items-center absolute top-[250px] z-20">
          <div className="text-2xl font-['Do_Hyeon'] mb-10">회원가입</div>
          <button
            onClick={() => router.push('/register/pregnant')}
            className="w-72 h-16 mb-6 bg-[#B7E5FF] rounded-[30px] shadow-lg hover:bg-[#A3D9F9] hover:scale-105 transition-all"
          >
            <span className="text-black text-xl font-['Do_Hyeon']">임산부</span>
          </button>
          <button
            className="w-72 h-16 mb-6 bg-[#B7E5FF] rounded-[30px] shadow-lg hover:bg-[#A3D9F9] hover:scale-105 transition-all"
          >
            <span className="text-black text-xl font-['Do_Hyeon']">보호자</span>
          </button>
          <div className="w-60 h-9 ml-8">
            <span className="text-black text-sm font-['Do_Hyeon'] leading-[50px]">이미 계정이 있으신가요? </span>
            <button
              onClick={() => router.push('/login')}
              className="text-yellow-400 text-sm font-['Do_Hyeon'] leading-[50px]"
            >
              로그인하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 