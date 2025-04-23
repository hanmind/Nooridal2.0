"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../utils/supabase";

declare global {
  interface Window {
    daum: {
      Postcode: new (config: {
        oncomplete: (data: {
          address: string;
          addressType: string;
          bname: string;
          buildingName: string;
          zonecode: string;
        }) => void;
      }) => {
        open: () => void;
      };
    };
  }
}

export default function Login() {
  const [showIdFindModal, setShowIdFindModal] = useState(false);
  const [showPwFindModal, setShowPwFindModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showPregnantSignup, setShowPregnantSignup] = useState(false);
  const [showGuardianSignup, setShowGuardianSignup] = useState(false);
  const [nickname, setNickname] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [foundId, setFoundId] = useState("");
  const [showFoundId, setShowFoundId] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [showVerificationCode, setShowVerificationCode] = useState(false);
  const [showPwReset, setShowPwReset] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const router = useRouter();

  const handleIdFind = () => {
    // 실제로는 서버에서 아이디를 조회하는 로직이 들어갈 것입니다.
    // 여기서는 예시로 "test123"이라는 아이디를 찾았다고 가정합니다.
    const id = "test123";
    setFoundId(id);
    setShowFoundId(true);
  };

  const handlePwFindRequest = () => {
    // 테스트를 위해 입력값 검증 없이 바로 인증번호 입력 화면으로 전환
    setShowVerificationCode(true);
  };

  const handleVerificationSubmit = () => {
    // 인증 코드 확인 후 비밀번호 재설정 화면으로 전환
    setShowVerificationCode(false);
    setShowPwReset(true);
  };

  const handlePwReset = () => {
    // 비밀번호 재설정 로직
    if (newPassword !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }
    
    // 비밀번호 재설정 API 호출 로직
    alert("비밀번호가 재설정되었습니다.");
    setShowPwFindModal(false);
    setShowPwReset(false);
  };

  const handleSignupClick = () => {
    setShowSignupModal(true);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setLoginError("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setLoginError("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // 로그인 성공
      console.log("로그인 성공:", data);
      
      // 홈페이지로 리다이렉트
      router.push('/');
    } catch (error) {
      console.error("로그인 에러:", error);
      setLoginError("로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  // 임시 SignupForm 컴포넌트 정의
  const SignupForm = ({ type }) => {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
          onClick={() => type === 'pregnant' ? setShowPregnantSignup(false) : setShowGuardianSignup(false)} />
        
        <div className="w-[360px] h-[600px] relative z-10 bg-white rounded-[30px] p-6">
          <h2 className="text-xl font-['Do_Hyeon'] text-center mb-4">
            {type === 'pregnant' ? '임산부 회원가입' : '보호자 회원가입'}
          </h2>
          
          <p className="text-sm text-center mb-6">
            회원가입 폼이 준비되지 않았습니다. 개발 중입니다.
          </p>
          
          <button
            onClick={() => type === 'pregnant' ? setShowPregnantSignup(false) : setShowGuardianSignup(false)}
            className="w-full h-12 bg-[#FFE999] rounded-2xl text-base font-['Do_Hyeon'] text-[#333333]"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full bg-[#FFF4BB] flex justify-center items-center">
      <div className="w-96 h-[874px] relative bg-[#FFF4BB] overflow-hidden">
        <Image
          className="w-40 h-20 left-[-686px] top-[354px] absolute"
          src="/images/logo/누리달.png"
          alt="누리달 로고"
          width={163}
          height={84}
        />
        
        {/* 흰색 배경 카드 */}
        <div className="w-96 h-[507px] left-[23px] top-[229px] absolute bg-white rounded-[20px] blur-[2px]" />
        
        {/* 로그인 버튼 */}
        <div className="w-80 h-9 left-[51px] top-[430px] absolute bg-yellow-200 rounded-[20px]" onClick={handleLogin}>
          <div className="w-64 h-10 left-[23px] top-[-4px] absolute text-center text-neutral-700 text-lg font-['Do_Hyeon'] leading-[50px]">로그인</div>
        </div>

        {/* 입력 필드 레이블 */}
        <div className="w-14 h-8 left-[50px] top-[245.65px] absolute text-black/70 text-lg font-['Do_Hyeon'] leading-[50px]">아이디</div>
        <div className="w-20 h-9 left-[43px] top-[323px] absolute text-black/70 text-lg font-['Do_Hyeon'] leading-[50px]">비밀번호</div>

        {/* 입력 필드 */}
        <div className="w-80 h-8 left-[50px] top-[288px] absolute bg-white rounded-[20px] border border-zinc-300">
          <input 
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="아이디를 입력하세요"
            className="w-full h-full px-4 text-neutral-400 text-base font-['Do_Hyeon'] rounded-[20px] focus:outline-none"
          />
        </div>
        <div className="w-80 h-8 left-[51px] top-[367px] absolute bg-white rounded-[20px] border border-zinc-300">
          <input 
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호를 입력하세요"
            className="w-full h-full px-4 text-neutral-400 text-base font-['Do_Hyeon'] rounded-[20px] focus:outline-none"
          />
        </div>

        {/* 로그인 유지 체크박스 */}
        <div className="flex items-center gap-2 absolute left-[59px] top-[489px]">
          <input type="checkbox" className="w-4 h-4 rounded-[3px] border border-neutral-700" />
          <span className="text-black text-sm font-['Do_Hyeon']">로그인 유지</span>
        </div>

        {/* 간편 로그인 섹션 */}
        <div className="w-full absolute top-[585px]">
          <div className="relative flex items-center justify-center">
            <div className="w-24 h-0.5 bg-zinc-300"></div>
            <div className="px-4 text-stone-500 text-base font-['Do_Hyeon']">간편 로그인</div>
            <div className="w-24 h-0.5 bg-zinc-300"></div>
          </div>
          
          {/* 소셜 로그인 버튼들 */}
          <div className="flex justify-center items-center gap-8 mt-8">
            <button className="w-12 h-12 flex items-center justify-center">
              <Image
                src="/images/logo/구글.png"
                alt="구글 로그인"
                width={47}
                height={47}
                className="cursor-pointer hover:opacity-80 transition-opacity"
              />
            </button>
            <button className="w-12 h-12 flex items-center justify-center">
              <Image
                src="/images/logo/카카오.png"
                alt="카카오 로그인"
                width={47}
                height={47}
                className="cursor-pointer hover:opacity-80 transition-opacity"
              />
            </button>
            <button className="w-12 h-12 flex items-center justify-center">
              <Image
                src="/images/logo/네이버.png"
                alt="네이버 로그인"
                width={47}
                height={47}
                className="cursor-pointer hover:opacity-80 transition-opacity"
              />
            </button>
          </div>
            
          {/* 하단 링크들 */}
          <div className="flex justify-center items-center gap-4 mt-4">
            <button 
              onClick={() => setShowIdFindModal(true)}
              className="text-[#666666] text-sm font-['Do_Hyeon'] hover:text-[#333333] transition-colors duration-300"
            >
              ID 찾기
            </button>
            <div className="w-0.5 h-4 bg-[#DDDDDD]"></div>
            <button 
              onClick={() => setShowPwFindModal(true)}
              className="text-[#666666] text-sm font-['Do_Hyeon'] hover:text-[#333333] transition-colors duration-300"
            >
              PW 찾기
            </button>
            <div className="w-0.5 h-4 bg-[#DDDDDD]"></div>
            <button 
              onClick={handleSignupClick}
              className="text-[#FFB800] text-sm font-['Do_Hyeon'] hover:text-[#FFA000] transition-colors duration-300"
            >
              회원가입
            </button>
          </div>
        </div>
      </div>

      {/* 에러 메시지 표시 */}
      {loginError && (
        <div className="absolute bottom-20 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
          {loginError}
        </div>
      )}

      {/* 아이디 찾기 모달 */}
      {showIdFindModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* 반투명 배경 오버레이 */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowIdFindModal(false)} />
          
          {/* 모달 컨테이너 */}
          <div className="w-[360px] h-[500px] relative z-10">
            {/* 배경 이미지 */}
              <Image
              className="w-full h-full object-cover absolute rounded-[30px]"
                src="/images/logo/아이디찾기 배경.png"
              alt="아이디 찾기 배경"
              width={360}
              height={500}
            />

            {/* 아이디 찾기 폼 */}
            <div className="absolute inset-0 flex flex-col items-center justify-center px-8 z-20">
              {/* 제목과 설명 */}
              <div className="bg-white/90 rounded-t-[20px] px-6 py-4 w-full">
                <h2 className="text-xl font-['Do_Hyeon'] text-[#333333] text-center">아이디 찾기</h2>
                <p className="text-sm font-['Do_Hyeon'] text-[#666666] mt-2 text-center">
                  회원정보에 등록한 정보로<br/>아이디를 찾아보세요
                </p>
                    </div>

              {/* 폼 컨테이너 */}
              <div className="bg-white/90 rounded-b-[20px] p-6 shadow-lg w-full">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[#333333] text-sm font-['Do_Hyeon'] mb-1.5">닉네임</label>
                    <div className="relative">
                        <input
                        type="text"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder="닉네임을 입력하세요"
                        className="w-full h-12 px-4 bg-[#F8F8F8] rounded-2xl border-2 border-transparent focus:border-[#FFE999] transition-all duration-300 text-sm font-['Do_Hyeon'] outline-none"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#333333] text-sm font-['Do_Hyeon'] mb-1.5">전화번호</label>
                    <div className="relative">
                        <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="전화번호를 입력하세요"
                        className="w-full h-12 px-4 bg-[#F8F8F8] rounded-2xl border-2 border-transparent focus:border-[#FFE999] transition-all duration-300 text-sm font-['Do_Hyeon'] outline-none"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      </div>
                    </div>

                  <div className="pt-4">
                      <button 
                      onClick={handleIdFind}
                      className="w-full h-12 bg-[#FFE999] rounded-2xl text-base font-['Do_Hyeon'] text-[#333333] hover:bg-[#FFD966] transform hover:scale-[1.02] transition-all duration-300"
                      >
                      아이디 찾기
                      </button>
                      <button
                      onClick={() => setShowIdFindModal(false)}
                      className="w-full text-center mt-3 text-[#666666] text-sm font-['Do_Hyeon'] hover:text-[#333333] transition-colors duration-300"
                    >
                      돌아가기
                      </button>
                    </div>
                  </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 비밀번호 찾기 모달 */}
      {showPwFindModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* 반투명 배경 오버레이 */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowPwFindModal(false)} />
          
          {/* 모달 컨테이너 */}
          <div className="w-[360px] h-[500px] relative z-10">
            {/* 배경 이미지 */}
            <Image
              className="w-full h-full object-cover absolute rounded-[30px]"
              src="/images/logo/아이디찾기 배경.png"
              alt="비밀번호 찾기 배경"
              width={360}
              height={500}
            />

            {/* 비밀번호 찾기 폼 */}
            <div className="absolute inset-0 flex flex-col items-center justify-center px-8 z-20">
              {/* 제목과 설명 */}
              <div className="bg-white/90 rounded-t-[20px] px-6 py-4 w-full">
                <h2 className="text-xl font-['Do_Hyeon'] text-[#333333] text-center">비밀번호 찾기</h2>
                <p className="text-sm font-['Do_Hyeon'] text-[#666666] mt-2 text-center">
                  가입한 이메일로 인증번호를 받아보세요
                </p>
              </div>

              {/* 폼 컨테이너 */}
              <div className="bg-white/90 rounded-b-[20px] p-6 shadow-lg w-full">
                <div className="space-y-4">
                  {!showVerificationCode && !showPwReset && (
                    <div>
                      <label className="block text-[#333333] text-sm font-['Do_Hyeon'] mb-1.5">이메일</label>
                      <div className="relative">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="이메일을 입력하세요"
                          className="w-full h-12 px-4 bg-[#F8F8F8] rounded-2xl border-2 border-transparent focus:border-[#FFE999] transition-all duration-300 text-sm font-['Do_Hyeon'] outline-none"
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  )}

                  {showVerificationCode && !showPwReset && (
                    <div>
                      <label className="block text-[#333333] text-sm font-['Do_Hyeon'] mb-1.5">인증번호</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value)}
                          placeholder="인증번호를 입력하세요"
                          className="w-full h-12 px-4 bg-[#F8F8F8] rounded-2xl border-2 border-transparent focus:border-[#FFE999] transition-all duration-300 text-sm font-['Do_Hyeon'] outline-none"
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  )}

                  {showPwReset && (
                    <>
                      <div>
                        <label className="block text-[#333333] text-sm font-['Do_Hyeon'] mb-1.5">새 비밀번호</label>
                        <div className="relative">
                          <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="새 비밀번호를 입력하세요"
                            className="w-full h-12 px-4 bg-[#F8F8F8] rounded-2xl border-2 border-transparent focus:border-[#FFE999] transition-all duration-300 text-sm font-['Do_Hyeon'] outline-none"
                          />
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[#333333] text-sm font-['Do_Hyeon'] mb-1.5">새 비밀번호 확인</label>
                        <div className="relative">
                          <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="새 비밀번호를 다시 입력하세요"
                            className="w-full h-12 px-4 bg-[#F8F8F8] rounded-2xl border-2 border-transparent focus:border-[#FFE999] transition-all duration-300 text-sm font-['Do_Hyeon'] outline-none"
                          />
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="pt-4">
                    {!showVerificationCode && !showPwReset && (
                      <button 
                        onClick={handlePwFindRequest}
                        className="w-full h-12 bg-[#FFE999] rounded-2xl text-base font-['Do_Hyeon'] text-[#333333] hover:bg-[#FFD966] transform hover:scale-[1.02] transition-all duration-300"
                      >
                        인증번호 받기
                      </button>
                    )}
                    {showVerificationCode && !showPwReset && (
                      <button 
                        onClick={handleVerificationSubmit}
                        className="w-full h-12 bg-[#FFE999] rounded-2xl text-base font-['Do_Hyeon'] text-[#333333] hover:bg-[#FFD966] transform hover:scale-[1.02] transition-all duration-300"
                      >
                        인증확인
                      </button>
                    )}
                    {showPwReset && (
                      <button 
                        onClick={handlePwReset}
                        className="w-full h-12 bg-[#FFE999] rounded-2xl text-base font-['Do_Hyeon'] text-[#333333] hover:bg-[#FFD966] transform hover:scale-[1.02] transition-all duration-300"
                      >
                        비밀번호 재설정
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setShowPwFindModal(false);
                        setShowVerificationCode(false);
                        setShowPwReset(false);
                        setEmail("");
                        setVerificationCode("");
                        setNewPassword("");
                        setConfirmPassword("");
                      }}
                      className="w-full text-center mt-3 text-[#666666] text-sm font-['Do_Hyeon'] hover:text-[#333333] transition-colors duration-300"
                    >
                      돌아가기
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSignupModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="w-96 h-[600px] relative bg-[#FFF4BB] overflow-hidden">
            {/* 배경 이미지 */}
            <Image
              className="w-full h-full object-cover absolute"
              src="/images/logo/아이디찾기 배경.png"
              alt="회원가입 배경"
              width={384}
              height={600}
            />

            {/* 상단 구름 효과 */}
            <div className="w-40 h-14 left-[122px] top-[86.85px] absolute bg-white rounded-full" />
            <div className="w-32 h-14 left-[200px] top-[97.63px] absolute bg-white rounded-full" />
            <div className="w-32 h-14 left-[101px] top-[79px] absolute bg-white rounded-full" />
            <div className="w-32 h-14 left-[164px] top-[79px] absolute bg-white rounded-full" />
            <div className="w-32 h-14 left-[175px] top-[116.27px] absolute bg-white rounded-full" />
            <div className="w-28 h-14 left-[68px] top-[97.63px] absolute bg-white rounded-full" />
            <div className="w-28 h-14 left-[135px] top-[121.17px] absolute bg-white rounded-full" />
            <div className="w-28 h-14 left-[83px] top-[116.27px] absolute bg-white rounded-full" />

            {/* 회원가입 선택 폼 */}
            <div className="absolute w-full top-[90px] text-center">
              <h2 className="text-2xl font-['Do_Hyeon'] text-[#333333]">회원가입</h2>
              <p className="text-sm font-['Do_Hyeon'] text-[#666666] mt-2">회원 유형을 선택해주세요</p>
            </div>

            <div className="w-96 h-[400px] left-0 top-[200px] absolute">
              <div className="w-full h-full bg-white rounded-t-[30px] rounded-b-[30px] px-8 pt-8">
                <div className="flex flex-col gap-4">
                <button 
                  onClick={() => {
                    setShowSignupModal(false);
                      setShowPregnantSignup(true);
                  }}
                    className="w-full h-12 bg-[#FFE999] rounded-2xl text-lg font-['Do_Hyeon'] text-[#333333] hover:bg-[#FFD966] transform hover:scale-[1.02] transition-all duration-300"
                >
                    임산부 회원가입
                </button>
                <button 
                  onClick={() => {
                    setShowSignupModal(false);
                      setShowGuardianSignup(true);
                  }}
                    className="w-full h-12 bg-[#FFE999] rounded-2xl text-lg font-['Do_Hyeon'] text-[#333333] hover:bg-[#FFD966] transform hover:scale-[1.02] transition-all duration-300"
                >
                    보호자 회원가입
                </button>
                <button
                  onClick={() => setShowSignupModal(false)}
                    className="w-full text-center mt-2 text-[#666666] text-base font-['Do_Hyeon'] hover:text-[#333333] transition-colors duration-300"
                >
                    돌아가기
                </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 임산부 회원가입 모달 */}
      {showPregnantSignup && <SignupForm type="pregnant" />}

      {/* 보호자 회원가입 모달 */}
      {showGuardianSignup && <SignupForm type="guardian" />}

      {/* 풋바 */}
      <div className="w-full h-[60px] flex items-center justify-center mt-auto">
        <p className="text-sm text-[#666666] font-['Do_Hyeon']">© 2024 누리달. All rights reserved.</p>
      </div>
    </div>
  );
}