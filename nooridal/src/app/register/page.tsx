"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Register() {
  const router = useRouter();

  const handleGuardianClick = () => {
    router.push('/register/guardian/invitation');
  };

  const handlePregnantClick = () => {
    router.push("/register/pregnant");
  };

  return (
    <div className="min-h-screen w-full flex justify-center items-center px-2 sm:px-4 md:px-8 bg-white">
      <main className="w-full max-w-md min-h-[600px] relative bg-white overflow-hidden sm:w-96 md:w-[420px] lg:w-[480px] xl:w-[520px]">
        {/* 배경 이미지 제거 */}
        {/*
        <Image
          src="/images/logo/아이디찾기 배경.png"
          alt="배경"
          fill
          className="object-cover z-0"
          priority
        />
        */}
        
        <div className="items-center w-80 h-[400px] left-[30px] top-[220px] absolute bg-white rounded-3xl shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] z-10" />
        
        {/* 누리달 로고 */}
        <Image
          className="w-32 h-14 left-[125px] top-[100px] absolute z-20"
          src="/images/logo/로고 구름.png"
          alt="누리달"
          width={180}
          height={72}
        />

        <div className="w-full flex flex-col items-center absolute top-[240px] z-20">
          <div className="text-2xl font-['Do_Hyeon'] mb-14">회원가입</div>
          <button 
            onClick={handlePregnantClick}
            className="w-64 h-16 mb-6 bg-[#FADADD] rounded-[30px] shadow-lg hover:bg-[#F8C8DC] hover:scale-105 transition-transform duration-300"
          >
            <span className="text-black text-xl font-['Do_Hyeon']">임산부</span>
          </button>
          <button
            onClick={handleGuardianClick}
            className="w-64 h-16 mb-6 bg-white border-2 border-[#FADADD] rounded-[30px] shadow-lg hover:bg-[#F8C8DC] hover:scale-105 transition-transform duration-300"
          >
            <span className="text-black text-xl font-['Do_Hyeon']">보호자</span>
          </button>
          <div className="w-60 h-9 ml-8">
            <span className="text-black text-m font-['Do_Hyeon'] leading-[160px]">이미 계정이 있으신가요? </span>
            <button
              onClick={() => router.push('/login')}
              className="text-yellow-400 text-sm font-['Do_Hyeon'] leading-[50px]"
            >
              로그인하기
            </button>
          </div>
        </div>
      </main>
    </div>
  );
} 