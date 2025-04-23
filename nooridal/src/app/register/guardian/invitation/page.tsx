"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { supabase } from "../../../../utils/supabase";

export default function GuardianInvitation() {
  const router = useRouter();
  const [invitationCode, setInvitationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");

  const handleVerification = async () => {
    if (!invitationCode.trim()) {
      setError("초대 코드를 입력해주세요");
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      // 초대 코드로 사용자 찾기
      const { data, error: fetchError } = await supabase
        .from('users')
        .select('id')
        .eq('invitation_code', invitationCode)
        .eq('user_type', 'pregnant')
        .single();

      if (fetchError || !data) {
        setError("유효하지 않은 초대 코드입니다");
        setIsVerifying(false);
        return;
      }

      // 초대 코드가 유효하면 세션에 저장하고 보호자 회원가입 페이지로 이동
      sessionStorage.setItem('invitation_code', invitationCode);
      sessionStorage.setItem('pregnant_user_id', data.id);
      router.push('/register/guardian');
    } catch (error) {
      console.error("초대 코드 확인 중 오류 발생:", error);
      setError("초대 코드 확인 중 오류가 발생했습니다");
    } finally {
      setIsVerifying(false);
    }
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
          className="w-32 h-14 left-[135px] top-[109px] absolute z-20"
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
                className="w-full h-full px-4 text-center text-neutral-400 text-lg font-['Do_Hyeon'] focus:outline-none"
              />
            </div>
            
            {/* Error message */}
            {error && (
              <div className="text-red-500 text-sm font-['Do_Hyeon'] mb-2 text-center">
                {error}
              </div>
            )}
            
            {/* Helper text */}
            <div className="text-neutral-400 text-base font-['Do_Hyeon'] mb-6 text-center">
              내 정보 관리에서 코드를 확인해 주세요 ♥︎
            </div>
            
            {/* Verify button */}
            <button 
              onClick={handleVerification}
              disabled={isVerifying}
              className={`w-72 h-12 mb-6 ${isVerifying ? 'bg-gray-300' : 'bg-yellow-200 hover:bg-yellow-300'} rounded-[20px] flex items-center justify-center transition-colors`}
            >
              <span className="text-black text-lg font-['Do_Hyeon']">
                {isVerifying ? '확인 중...' : '인증 확인'}
              </span>
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