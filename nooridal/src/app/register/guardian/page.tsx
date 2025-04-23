"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "../../../utils/supabase";

export default function GuardianSignup() {
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
  const [invitationCode, setInvitationCode] = useState("");
  const [pregnantUserId, setPregnantUserId] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  // 세션 스토리지에서 초대코드 정보 로드
  useEffect(() => {
    const savedInvitationCode = sessionStorage.getItem('invitation_code');
    const savedPregnantUserId = sessionStorage.getItem('pregnant_user_id');

    if (savedInvitationCode) {
      setInvitationCode(savedInvitationCode);
    } else {
      // 초대코드가 없으면 초대 페이지로 리다이렉트
      router.push('/register/guardian/invitation');
    }

    if (savedPregnantUserId) {
      setPregnantUserId(savedPregnantUserId);
    }
  }, [router]);

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
    // 실제로는 서버에 인증 코드를 확인하는 요청을 보내야 합니다.
    // 임시로 인증 성공 처리
    setIsEmailVerified(true);
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
          user_type: "guardian", // 보호자로 설정
          invitation_code: null // 보호자는 초대코드가 필요 없음
        });

      if (profileError) throw profileError;

      // 3. 임산부와 보호자 연결 - pregnancies 테이블 업데이트
      if (pregnantUserId) {
        // 임산부의 pregnancies 테이블에서 최신 레코드 찾기
        const { data: pregnancyData, error: pregnancyError } = await supabase
          .from('pregnancies')
          .select('id')
          .eq('user_id', pregnantUserId)
          .order('created_at', { ascending: false })
          .limit(1);

        if (pregnancyError || !pregnancyData || pregnancyData.length === 0) {
          console.warn('임산부의 임신 정보를 찾을 수 없습니다');
        } else {
          // 임신 정보에 보호자 ID 업데이트
          const { error: updateError } = await supabase
            .from('pregnancies')
            .update({ guardian_id: userData.user.id })
            .eq('id', pregnancyData[0].id);

          if (updateError) {
            console.error('임신 정보 업데이트 중 오류 발생:', updateError);
          }
        }
      }

      // 4. 초대코드 및 임산부 ID 세션 스토리지에서 제거
      sessionStorage.removeItem('invitation_code');
      sessionStorage.removeItem('pregnant_user_id');

      // 5. 성공 시 로그인 페이지로 이동
      router.push('/login');
      
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

        {/* 초대코드 표시 */}
        {invitationCode && (
          <div className="w-72 h-10 left-[50px] top-[167px] absolute bg-yellow-100 rounded-md flex items-center justify-center">
            <span className="text-black text-sm font-['Do_Hyeon']">
              초대코드: {invitationCode}
            </span>
          </div>
        )}

        {/* 아이디 입력 필드 */}
        <div className="w-20 h-9 left-[32px] top-[197px] absolute text-center text-black/70 text-sm font-['Do_Hyeon'] leading-[50px]">아이디</div>
        <div className="w-72 h-8 left-[52px] top-[232px] absolute">
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
          className="w-16 h-6 left-[275px] top-[237px] absolute bg-yellow-200 rounded-[10px] text-black text-xs font-['Do_Hyeon'] hover:bg-yellow-300 transition-colors"
        >
          중복확인
        </button>

        {/* 이름 입력 필드 */}
        <div className="w-12 h-9 left-[45px] top-[266px] absolute text-center text-black/70 text-sm font-['Do_Hyeon'] leading-[50px]">이름</div>
        <div className="w-72 h-8 left-[52px] top-[301px] absolute">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름을 입력하세요"
            className="w-full h-full px-4 text-neutral-400 text-xs font-['Do_Hyeon'] rounded-[10px] border border-zinc-300 focus:outline-none"
          />
        </div>

        {/* 이메일 입력 필드 */}
        <div className="w-12 h-9 left-[49px] top-[335px] absolute text-center text-black/70 text-sm font-['Do_Hyeon'] leading-[50px]">이메일</div>
        <div className="w-72 h-8 left-[52px] top-[370px] absolute">
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
          className="w-16 h-6 left-[275px] top-[374px] absolute bg-yellow-200 rounded-[10px] text-black text-xs font-['Do_Hyeon'] hover:bg-yellow-300 transition-colors"
        >
          인증요청
        </button>

        {/* 전화번호 입력 필드 */}
        <div className="w-20 h-9 left-[38px] top-[404px] absolute text-center text-black/70 text-sm font-['Do_Hyeon'] leading-[50px]">전화번호</div>
        <div className="w-72 h-8 left-[52px] top-[445px] absolute">
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
          className="w-16 h-6 left-[275px] top-[450px] absolute bg-yellow-200 rounded-[10px] text-black text-xs font-['Do_Hyeon'] hover:bg-yellow-300 transition-colors"
        >
          중복확인
        </button>

        {/* 비밀번호 입력 필드 */}
        <div className="w-32 h-9 left-[15px] top-[479px] absolute text-center text-black/70 text-sm font-['Do_Hyeon'] leading-[50px]">비밀번호</div>
        <div className="w-72 h-8 left-[52px] top-[517px] absolute">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호를 입력하세요"
            className="w-full h-full px-4 text-neutral-400 text-xs font-['Do_Hyeon'] rounded-[10px] border border-zinc-300 focus:outline-none"
          />
        </div>

        {/* 비밀번호 확인 입력 필드 */}
        <div className="w-32 h-9 left-[28px] top-[561px] absolute text-center text-black/70 text-sm font-['Do_Hyeon'] leading-[50px]">비밀번호 확인</div>
        <div className="w-72 h-8 left-[51px] top-[599px] absolute">
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="비밀번호를 다시 입력하세요"
            className="w-full h-full px-4 text-neutral-400 text-xs font-['Do_Hyeon'] rounded-[10px] border border-zinc-300 focus:outline-none"
          />
        </div>

        {/* 주소 입력 필드 */}
        <div className="w-20 h-9 left-[31px] top-[636px] absolute text-center text-black/70 text-sm font-['Do_Hyeon'] leading-[50px]">주소</div>
        <div className="w-72 h-8 left-[52px] top-[673px] absolute">
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="검색 버튼을 눌러 주소를 입력해주세요"
            className="w-full h-full px-4 text-neutral-400 text-xs font-['Do_Hyeon'] rounded-[10px] border border-zinc-300 focus:outline-none"
            readOnly
          />
        </div>
        <button className="w-16 h-6 left-[275px] top-[677px] absolute bg-yellow-200 rounded-[10px] text-black text-xs font-['Do_Hyeon'] hover:bg-yellow-300 transition-colors">
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