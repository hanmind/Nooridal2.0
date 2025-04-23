"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "../../../utils/supabase";

// 8자리 랜덤 초대코드 생성 함수
const generateInvitationCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export default function PregnantSignup() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [userIdStatus, setUserIdStatus] = useState<"default" | "valid" | "invalid">("default");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneNumberStatus, setPhoneNumberStatus] = useState<"default" | "valid" | "invalid">("default");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [address, setAddress] = useState("");
  const [showEmailVerificationModal, setShowEmailVerificationModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");

  // 실제로는 서버에 중복 확인 요청을 보내야 합니다.
  const checkDuplication = async (type: "id" | "phone", value: string) => {
    // 임시로 테스트용 중복 체크 로직 구현
    if (type === "id") {
      const isDuplicate = value === "test";
      setUserIdStatus(isDuplicate ? "invalid" : "valid");
    } else {
      const isDuplicate = value === "01012345678";
      setPhoneNumberStatus(isDuplicate ? "invalid" : "valid");
    }
  };

  const handleEmailVerification = () => {
    setShowEmailVerificationModal(true);
  };

  const handleVerificationSubmit = () => {
    setShowEmailVerificationModal(false);
    setVerificationCode("");
  };

  const getBorderColor = (status: "default" | "valid" | "invalid") => {
    switch (status) {
      case "valid":
        return "border-green-500";
      case "invalid":
        return "border-red-500";
      default:
        return "border-zinc-300";
    }
  };

  const handleSignup = async () => {
    try {
      // 비밀번호 확인 검증
      if (password !== confirmPassword) {
        alert('비밀번호가 일치하지 않습니다.');
        return;
      }
      
      // 초대코드 생성
      const invitationCode = generateInvitationCode();

      // 1. 사용자 비밀번호 해싱은 Supabase에서 자동으로 처리
      const { data: userData, error: userError } = await supabase.auth.signUp({
        email, 
        password,
      });

      if (userError) throw userError;

      // 2. users 테이블에 추가 정보 저장
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: userData.user.id,
          email,
          name,
          userId,
          phone_number: phoneNumber,
          address,
          user_type: "pregnant", // 임산부로 설정
          invitation_code: invitationCode // 초대코드 저장
        });

      if (profileError) throw profileError;

      // 3. 성공 시 다음 페이지로 이동
      router.push('/register/pregnant/pregnancy-info'); 
      
    } catch (error) {
      console.error('회원가입 에러:', error);
      alert('회원가입 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#FFF4BB] flex justify-center items-center">
      <div className="w-96 h-[874px] relative bg-[#FFF4BB] overflow-hidden">
        <div className="w-80 h-[745px] left-[28px] top-[70px] absolute bg-white rounded-3xl shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]" />
        
        {/* 누리달 로고 */}
        <img
          className="w-32 h-14 left-[135px] top-[109px] absolute"
          src="/images/logo/누리달.png"
          alt="누리달 로고"
        />

        {/* 아이디 입력 필드 */}
        <div className="w-20 h-9 left-[32px] top-[167px] absolute text-center text-black/70 text-sm font-['Do_Hyeon'] leading-[50px]">아이디</div>
        <div className="w-72 h-8 left-[52px] top-[202px] absolute">
          <input
            type="text"
            value={userId}
            onChange={(e) => {
              setUserId(e.target.value);
              setUserIdStatus("default");
            }}
            placeholder="아이디를 입력하세요"
            className={`w-full h-full px-4 text-neutral-400 text-xs font-['Do_Hyeon'] rounded-[10px] border ${getBorderColor(userIdStatus)} focus:outline-none`}
          />
        </div>
        <button 
          onClick={() => checkDuplication("id", userId)}
          className="w-16 h-6 left-[275px] top-[207px] absolute bg-yellow-200 rounded-[10px] text-black text-xs font-['Do_Hyeon'] hover:bg-yellow-300 transition-colors"
        >
          중복확인
        </button>

        {/* 이름 입력 필드 */}
        <div className="w-12 h-9 left-[45px] top-[236px] absolute text-center text-black/70 text-sm font-['Do_Hyeon'] leading-[50px]">이름</div>
        <div className="w-72 h-8 left-[52px] top-[271px] absolute">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름을 입력하세요"
            className="w-full h-full px-4 text-neutral-400 text-xs font-['Do_Hyeon'] rounded-[10px] border border-zinc-300 focus:outline-none"
          />
        </div>

        {/* 이메일 입력 필드 */}
        <div className="w-12 h-9 left-[49px] top-[305px] absolute text-center text-black/70 text-sm font-['Do_Hyeon'] leading-[50px]">이메일</div>
        <div className="w-72 h-8 left-[52px] top-[340px] absolute">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일을 입력하세요"
            className="w-full h-full px-4 text-neutral-400 text-xs font-['Do_Hyeon'] rounded-[10px] border border-zinc-300 focus:outline-none"
          />
        </div>
        <button 
          onClick={handleEmailVerification}
          className="w-16 h-6 left-[275px] top-[344px] absolute bg-yellow-200 rounded-[10px] text-black text-xs font-['Do_Hyeon'] hover:bg-yellow-300 transition-colors"
        >
          인증요청
        </button>

        {/* 전화번호 입력 필드 */}
        <div className="w-20 h-9 left-[38px] top-[374px] absolute text-center text-black/70 text-sm font-['Do_Hyeon'] leading-[50px]">전화번호</div>
        <div className="w-72 h-8 left-[52px] top-[415px] absolute">
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => {
              setPhoneNumber(e.target.value);
              setPhoneNumberStatus("default");
            }}
            placeholder="휴대폰 번호는 '-'없이 숫자만 입력하셔도 됩니다"
            className={`w-full h-full px-4 text-neutral-400 text-xs font-['Do_Hyeon'] rounded-[10px] border ${getBorderColor(phoneNumberStatus)} focus:outline-none`}
          />
        </div>
        <button 
          onClick={() => checkDuplication("phone", phoneNumber)}
          className="w-16 h-6 left-[275px] top-[420px] absolute bg-yellow-200 rounded-[10px] text-black text-xs font-['Do_Hyeon'] hover:bg-yellow-300 transition-colors"
        >
          중복확인
        </button>

        {/* 비밀번호 입력 필드 */}
        <div className="w-32 h-9 left-[15px] top-[449px] absolute text-center text-black/70 text-sm font-['Do_Hyeon'] leading-[50px]">비밀번호</div>
        <div className="w-72 h-8 left-[52px] top-[487px] absolute">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호를 입력하세요"
            className="w-full h-full px-4 text-neutral-400 text-xs font-['Do_Hyeon'] rounded-[10px] border border-zinc-300 focus:outline-none"
          />
        </div>

        {/* 비밀번호 확인 입력 필드 */}
        <div className="w-32 h-9 left-[28px] top-[531px] absolute text-center text-black/70 text-sm font-['Do_Hyeon'] leading-[50px]">비밀번호 확인</div>
        <div className="w-72 h-8 left-[51px] top-[569px] absolute">
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="비밀번호를 다시 입력하세요"
            className="w-full h-full px-4 text-neutral-400 text-xs font-['Do_Hyeon'] rounded-[10px] border border-zinc-300 focus:outline-none"
          />
        </div>

        {/* 주소 입력 필드 */}
        <div className="w-20 h-9 left-[31px] top-[606px] absolute text-center text-black/70 text-sm font-['Do_Hyeon'] leading-[50px]">주소</div>
        <div className="w-72 h-8 left-[52px] top-[643px] absolute">
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="검색 버튼을 눌러 주소를 입력해주세요"
            className="w-full h-full px-4 text-neutral-400 text-xs font-['Do_Hyeon'] rounded-[10px] border border-zinc-300 focus:outline-none"
            readOnly
          />
        </div>
        <button className="w-16 h-6 left-[275px] top-[647px] absolute bg-yellow-200 rounded-[10px] text-black text-xs font-['Do_Hyeon'] hover:bg-yellow-300 transition-colors">
          검색
        </button>

        {/* 이메일 인증 모달 */}
        {showEmailVerificationModal && (
          <>
            <div className="w-96 h-[874px] left-0 top-0 absolute bg-neutral-400/50 z-20" />
            <div className="w-80 h-52 left-[29px] top-[303px] absolute bg-white rounded-[20px] z-30">
              <div className="w-80 h-20 left-0 top-[30px] absolute text-center text-black text-lg font-['Do_Hyeon'] leading-[50px] z-10">
                이메일로 받은 인증번호를 입력하세요:
              </div>
              <div className="w-72 h-10 left-[16px] top-[85px] absolute z-10">
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="인증번호 입력"
                  className="w-full h-full px-4 text-neutral-400 text-sm font-['Do_Hyeon'] rounded-[10px] border border-zinc-300 focus:outline-none"
                />
              </div>
              <div className="flex justify-between w-full px-4 absolute bottom-4 z-10">
                <button
                  onClick={handleVerificationSubmit}
                  className="w-32 h-9 bg-[#FFE999] rounded-[10px] hover:bg-[#FFE080] transition-colors"
                >
                  <div className="w-full text-center text-black text-sm font-['Do_Hyeon'] leading-[36px]">
                    확인
                  </div>
                </button>
                <button
                  onClick={() => setShowEmailVerificationModal(false)}
                  className="w-32 h-9 bg-[#FFE999] rounded-[10px] hover:bg-[#FFE080] transition-colors"
                >
                  <div className="w-full text-center text-black text-sm font-['Do_Hyeon'] leading-[36px]">
                    취소
                  </div>
                </button>
              </div>
            </div>
          </>
        )}

        {/* 회원가입 버튼 */}
        <button 
          // onClick={() => router.push('/register/pregnant/pregnancy-info')}
          onClick={handleSignup}
          className="w-72 h-10 left-[49px] top-[702.18px] absolute bg-yellow-200 rounded-[20px] z-10 hover:bg-yellow-300 transition-colors"
        >
          <div className="w-52 h-7 left-[45px] top-[-2px] absolute text-black text-base font-['Do_Hyeon'] leading-[50px]">
            회원가입
          </div>
        </button>

        {/* 로그인으로 돌아가기 */}
        <div className="w-60 h-9 left-[79px] top-[758px] absolute text-center z-10">
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