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
        
        <div className="items-center w-80 h-[400px] left-[30px] top-[220px] absolute bg-white rounded-3xl shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] z-10" />
        
        {/* 누리달 로고 */}
        <Image
          className="w-32 h-14 left-[125px] top-[100px] absolute z-20"
          src="/images/logo/누리달.png"
          alt="누리달"
          width={134}
          height={55}
        />

        <div className="w-full flex flex-col items-center absolute top-[260px] z-20">
          <div className="text-2xl font-['Do_Hyeon'] mb-14">회원가입</div>
          <button 
            onClick={handlePregnantClick}
            className="w-64 h-16 mb-6 bg-[#B7E5FF] rounded-[30px] shadow-lg hover:bg-[#A3D9F9] hover:scale-105 transition-all"
          >
            <span className="text-black text-xl font-['Do_Hyeon']">임산부</span>
          </button>
          <button
            onClick={handleGuardianClick}
            className="w-64 h-16 mb- bg-[#B7E5FF] rounded-[30px] shadow-lg hover:bg-[#A3D9F9] hover:scale-105 transition-all"
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
      </div>
    </div>
  );
} 