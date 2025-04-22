"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";

export default function GuardianInvitation() {
  const router = useRouter();
  const [invitationCode, setInvitationCode] = useState("");

  const handleVerification = () => {
    // Here you would typically verify the invitation code with your backend
    // For now, we'll just navigate to the registration form
    console.log("Navigating to guardian registration form...");
    router.push('/register/guardian');
  };

  return (
    <div className="min-h-screen w-full bg-[#FFF4BB] flex justify-center items-center">
      <div className="w-96 h-[874px] relative overflow-hidden">
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
          className="w-32 h-14 left-[125px] top-[100px] absolute z-20"
          src="/images/logo/누리달.png"
          alt="누리달 로고"
          width={134}
          height={55}
        />

        <div className="w-80 h-[320px] left-[28px] top-[260px] absolute bg-white rounded-3xl shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] z-10">
          <div className="w-full flex flex-col items-center pt-8">
            <div className="text-2xl font-['Do_Hyeon'] mb-8">보호자 초대 코드 확인</div>
            
            {/* Input field */}
            <div className="w-72 h-12 mb-4 bg-white rounded-[20px] border border-neutral-400 flex items-center justify-center">
              <input 
                type="text" 
                value={invitationCode}
                onChange={(e) => setInvitationCode(e.target.value)}
                placeholder="임산부에게 받은 초대 코드를 입력해주세요"
                className="w-full h-full px-4 text-center text-neutral-400 text-l font-['Do_Hyeon'] focus:outline-none"
              />
            </div>
            
            {/* Helper text */}
            <div className="text-neutral-400 text-base font-['Do_Hyeon'] mb-6 text-center">
              내 정보 관리에서 코드를 확인해 주세요 ♥︎
            </div>
            
            {/* Verify button */}
            <button 
              onClick={handleVerification}
              className="w-72 h-12 mb-6 bg-yellow-200 rounded-[20px] flex items-center justify-center hover:bg-yellow-300 transition-colors"
            >
              <span className="text-black text-lg font-['Do_Hyeon']">인증 확인</span>
            </button>
            
            {/* Back to login link */}
            <div 
              onClick={() => router.push('/login')}
              className="text-neutral-700 text-base font-['Do_Hyeon'] cursor-pointer"
            >
              로그인으로 돌아가기
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 