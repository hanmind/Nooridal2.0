"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Register() {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full bg-yellow-100 flex justify-center items-center">
      <div className="w-96 h-[874px] relative bg-yellow-100 overflow-hidden">
        <div className="w-80 h-[745px] left-[28px] top-[70px] absolute bg-white rounded-3xl shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]" />
        
        {/* 누리달 로고 */}
        <Image
          className="w-32 h-14 left-[135px] top-[109px] absolute"
          src="/images/logo/누리달.png"
          alt="누리달 로고"
          width={134}
          height={55}
        />

        <div className="w-full flex flex-col items-center absolute top-[250px]">
          <div className="text-2xl font-['Do_Hyeon'] mb-10">회원가입</div>
          <button
            onClick={() => router.push('/register/pregnant')}
            className="w-72 h-16 mb-6 bg-white rounded-[20px] shadow-md hover:shadow-lg transition-shadow"
          >
            <span className="text-black text-xl font-['Do_Hyeon']">임산부</span>
          </button>
          <button
            className="w-72 h-16 bg-white rounded-[20px] shadow-md hover:shadow-lg transition-shadow"
          >
            <span className="text-black text-xl font-['Do_Hyeon']">보호자</span>
          </button>
        </div>

        {/* 로그인으로 돌아가기 */}
        <div className="w-60 h-9 left-[85px] top-[758px] absolute">
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
  );
} 