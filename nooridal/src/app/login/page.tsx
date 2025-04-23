"use client";

import Image from "next/image";
import { useState } from "react";
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
  const [nickname, setNickname] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [foundId, setFoundId] = useState("");
  const [showFoundId, setShowFoundId] = useState(false);
  const [email, setEmail] = useState("");
  const [showVerificationCode, setShowVerificationCode] = useState(false);
  const [showPwReset, setShowPwReset] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rememberLogin, setRememberLogin] = useState(false);
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
    // 테스트를 위해 입력값 검증 없이 바로 비밀번호 재설정 화면으로 전환
    setShowPwReset(true);
  };

  const handlePwReset = () => {
    // 테스트를 위해 입력값 검증 없이 바로 마이페이지로 이동
    router.push('/mypage');
  };

  // 회원가입 버튼 클릭 핸들러
  const handleSignupClick = () => {
    router.push('/register');
  };

  // 로그인 처리 함수
  const handleLogin = async () => {
    // Reset previous errors
    setLoginError("");
    
    // Validate inputs
    if (!userId.trim()) {
      setLoginError("아이디를 입력해주세요.");
      return;
    }
    if (!password.trim()) {
      setLoginError("비밀번호를 입력해주세요.");
      return;
    }

    try {
      setIsLoading(true);
      
      // First, get the user's email using their userId
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('email')
        .eq('userId', userId)
        .single();
      
      if (userError || !userData) {
        setLoginError("존재하지 않는 아이디입니다.");
        setIsLoading(false);
        return;
      }
      
      // Now login with the email and password via Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: userData.email,
        password: password,
      });

      if (error) {
        console.error('Login error:', error.message);
        setLoginError("아이디 또는 비밀번호가 일치하지 않습니다.");
        return;
      }

      if (data.user) {
        // 로그인 유지 설정을 localStorage에 저장
        if (rememberLogin) {
          localStorage.setItem('rememberLogin', 'true');
        } else {
          localStorage.removeItem('rememberLogin');
        }
        
        // Get user type to redirect to appropriate dashboard
        const { data: profileData } = await supabase
          .from('users')
          .select('user_type')
          .eq('id', data.user.id)
          .single();
          
        if (profileData) {
          // 로그인 성공 처리 및 리다이렉트
          console.log("로그인 성공:", data.user.email);
          
          // Redirect to calendar regardless of user type
          router.push('/calendar');
          
          // Previous user-type based redirection
          /*
          if (profileData.user_type === 'pregnant') {
            router.push('/pregnant-dashboard');
          } else if (profileData.user_type === 'guardian') {
            router.push('/guardian-dashboard');
          } else {
            router.push('/dashboard'); // Default dashboard
          }
          */
        } else {
          router.push('/calendar'); // Default fallback also goes to calendar
        }
      }
    } catch (error) {
      console.error('Unexpected error during login:', error);
      setLoginError("로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  // 엔터 키 핸들러
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#FFF4BB] to-[#FFE999] flex flex-col">
      {/* 메인 컨텐츠 영역 */}
      <div className="flex-1 w-full flex flex-col items-center justify-center px-4">
        {/* 로고 */}
        <div className="mb-6">
          <Image
            src="/images/logo/로고 구름.png"
            alt="누리달 로고"
            width={180}
            height={72}
            className="drop-shadow-md"
          />
        </div>

        {/* 로그인 컨테이너 */}
        <div className="w-full max-w-[360px] h-[560px] relative bg-white rounded-[30px] shadow-2xl overflow-hidden mb-8">
          {/* 배경 이미지 */}
          <div className="absolute inset-0 bg-white z-0"></div>
          
          {/* 로그인 폼 */}
          <div className="absolute top-[30px] left-0 right-0 px-8 z-20">
            <h2 className="text-2xl font-['Do_Hyeon'] text-[#333333] text-center mb-6">로그인</h2>

            {/* Display login error message if any */}
            {loginError && (
              <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-2 mb-4 rounded-lg text-sm font-['Do_Hyeon']">
                {loginError}
              </div>
            )}

            {/* 입력 필드 */}
            <div className="space-y-5">
              <div>
                <label className="block text-[#333333] text-base font-['Do_Hyeon'] mb-2">아이디</label>
                <div className="relative">
                  <input 
                    type="text"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="아이디를 입력하세요"
                    className="w-full h-12 px-5 bg-[#F8F8F8] rounded-2xl border-2 border-transparent focus:border-[#FFE999] transition-all duration-300 text-base font-['Do_Hyeon'] outline-none"
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-[#333333] text-base font-['Do_Hyeon'] mb-2">비밀번호</label>
                <div className="relative">
                  <input 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="비밀번호를 입력하세요"
                    className="w-full h-12 px-5 bg-[#F8F8F8] rounded-2xl border-2 border-transparent focus:border-[#FFE999] transition-all duration-300 text-base font-['Do_Hyeon'] outline-none"
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* 로그인 유지 체크박스 */}
            <div className="flex items-center gap-2 mt-4">
              <input 
                type="checkbox" 
                checked={rememberLogin}
                onChange={(e) => setRememberLogin(e.target.checked)}
                className="w-5 h-5 rounded-[10px] border-2 border-[#FFE999] text-[#FFE999] focus:ring-[#FFE999]" 
              />
              <span className="text-[#666666] text-sm font-['Do_Hyeon']">로그인 유지</span>
            </div>

            {/* 로그인 버튼 */}
            <button 
              onClick={handleLogin}
              disabled={isLoading}
              className={`w-full h-12 mt-6 bg-[#FFED90] rounded-2xl text-lg font-['Do_Hyeon'] text-[#333333] hover:bg-[#FFD966] transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? '로그인 중...' : '로그인'}
            </button>

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

            {/* 간편 로그인 섹션 */}
            <div className="mt-8">
              <div className="relative flex items-center justify-center">
                <div className="w-20 h-0.5 bg-[#EEEEEE]"></div>
                <div className="px-3 text-[#999999] text-sm font-['Do_Hyeon']">간편 로그인</div>
                <div className="w-20 h-0.5 bg-[#EEEEEE]"></div>
              </div>
              
              {/* 소셜 로그인 버튼들 */}
              <div className="flex justify-center items-center gap-6 mt-4">
                {/* Google */}
                <button className="w-12 h-12 flex items-center justify-center bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                  <svg width="24" height="24" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </button>
                {/* Kakao */}
                <button className="w-12 h-12 flex items-center justify-center bg-[#FEE500] rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                  <svg width="24" height="24" viewBox="0 0 24 24">
                    <path fill="#000000" d="M12 4C7.03 4 3 7.03 3 10.82C3 13.27 4.56 15.41 6.94 16.58V19.58C6.94 19.97 7.4 20.19 7.7 19.94L10.73 17.72C11.14 17.78 11.56 17.82 12 17.82C16.97 17.82 21 14.79 21 10.82C21 7.03 16.97 4 12 4Z"/>
                  </svg>
                </button>
                {/* Naver */}
                <button className="w-12 h-12 flex items-center justify-center bg-[#03C75A] rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                  <svg width="24" height="24" viewBox="0 0 24 24">
                    <path fill="#FFFFFF" d="M15.5 12.5L8.5 3H3v18h5.5v-8.5L16 22h5.5V4H15.5z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

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

      {/* 풋바 */}
      <div className="w-full h-[60px] flex items-center justify-center mt-auto">
        <p className="text-sm text-[#666666] font-['Do_Hyeon']">© 2024 누리달. All rights reserved.</p>
      </div>
    </div>
  );
} 