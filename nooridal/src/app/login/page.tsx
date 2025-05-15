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

  const handleIdFind = async () => {
    console.log("Find ID button clicked");
    console.log("Nickname:", nickname);
    console.log("Phone Number:", phoneNumber);
    try {
      const { data: userData, error } = await supabase
        .from("users")
        .select("username")
        .eq("name", nickname)
        .eq("phone_number", phoneNumber)
        .single();

      if (error || !userData) {
        console.log("Error or no user data found:", error);
        alert("아이디를 찾을 수 없습니다.");
        return;
      }

      const maskedId =
        userData.username.slice(0, 3) +
        "*".repeat(userData.username.length - 3);
      setFoundId(maskedId);
      setShowFoundId(true);
    } catch (error) {
      console.error("아이디 찾기 오류:", error);
      alert("아이디 찾기 중 오류가 발생했습니다.");
    }
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
    router.push("/mypage");
  };

  // 회원가입 버튼 클릭 핸들러
  const handleSignupClick = () => {
    router.push("/register");
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

      // userId (username)으로 사용자의 email 가져오기
      console.log(`[Login Attempt] Finding email for username: '${userId}'`);
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("email")
        .eq("username", userId)
        .single();

      console.log("[Login Attempt] User query result:", {
        userData,
        userError,
      }); // Log the query result

      if (userError) {
        console.error("[Login Attempt] Supabase query error:", userError);
      }
      if (!userData) {
        console.log(
          "[Login Attempt] No user data found in users table for username:",
          userId
        );
      }

      if (userError || !userData) {
        setLoginError("존재하지 않는 아이디입니다.");
        setIsLoading(false);
        return;
      }

      // 이메일과 비밀번호로 Supabase Auth 로그인
      const { data, error } = await supabase.auth.signInWithPassword({
        email: userData.email || "",
        password: password,
      });

      if (error) {
        console.error("Login error:", error.message);
        setLoginError("아이디 또는 비밀번호가 일치하지 않습니다.");
        setIsLoading(false);
        return;
      }

      if (data.user) {
        // 로그인 유지 설정을 localStorage에 저장
        if (rememberLogin) {
          localStorage.setItem("rememberLogin", "true");
        } else {
          localStorage.removeItem("rememberLogin");
        }

        // 로그인 성공 후 사용자 타입 조회 (users 테이블의 id(PK) 사용)
        const { data: profileData } = await supabase
          .from("users")
          .select("user_type")
          .eq("id", data.user.id)
          .single();

        if (profileData) {
          console.log("로그인 성공:", data.user.email);
          router.push("/calendar");
        } else {
          console.warn(
            "User profile not found after login, redirecting to calendar."
          );
          router.push("/calendar");
        }
      }
    } catch (error) {
      console.error("Unexpected error during login:", error);
      setLoginError(
        "로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 카카오 로그인 처리 함수
  const handleKakaoLogin = async () => {
    setIsLoading(true);
    setLoginError(""); // Clear previous errors

    try {
      console.log("카카오 로그인 시도...");
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "kakao",
        options: {
          redirectTo: `${window.location.origin}/calendar`,
          scopes: "account_email profile_nickname profile_image openid",
        },
      });

      if (error) {
        console.error("Kakao login error:", error.message);
        setLoginError("카카오 로그인 중 오류가 발생했습니다.");
      }
      // Supabase는 자동으로 카카오 로그인 페이지로 리다이렉트합니다.
      // 성공 시 /auth/v1/callback에서 세션 처리 후 리다이렉트됩니다.
    } catch (error) {
      console.error("Unexpected error during Kakao login:", error);
      setLoginError("카카오 로그인 중 예상치 못한 오류가 발생했습니다.");
    } finally {
      // OAuth 리다이렉션이 발생하므로 로딩 상태 해제는 불필요할 수 있음
      // setIsLoading(false);
    }
  };

  // 구글 로그인 처리 함수
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setLoginError(""); // Clear previous errors

    try {
      console.log("구글 로그인 시도...");
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/calendar`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        console.error("Google login error:", error.message);
        setLoginError("구글 로그인 중 오류가 발생했습니다.");
      }
      // Supabase는 자동으로 구글 로그인 페이지로 리다이렉트합니다.
    } catch (error) {
      console.error("Unexpected error during Google login:", error);
      setLoginError("구글 로그인 중 예상치 못한 오류가 발생했습니다.");
    } finally {
      // OAuth 리다이렉션이 발생하므로 로딩 상태 해제는 불필요할 수 있음
      // setIsLoading(false);
    }
  };

  // 엔터 키 핸들러
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isLoading) {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen w-full bg-white flex flex-col items-center">
      {/* 상단에 로고 구름 이미지 추가 */}
      <div className="w-full flex justify-center mt-12 mb-4">
        <Image src="/images/logo/로고 구름.png" alt="로고 구름" width={180} height={100} priority />
      </div>

      {/* 메인 컨텐츠 영역 */}
      <div className="flex-1 w-full flex flex-col items-center justify-center px-4">
        {/* 로그인 컨테이너 */}
        <div className="w-full max-w-[360px] h-[560px] relative bg-white rounded-[30px] shadow-2xl overflow-hidden mb-8">
          {/* 배경 이미지 */}
          <div className="absolute inset-0 bg-white z-0"></div>

          {/* 로그인 폼 */}
          <div className="absolute top-[30px] left-0 right-0 px-8 z-20">
            {/* 로그인 오류 메시지 표시 */}
            {loginError && (
              <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-2 mb-4 rounded-lg text-sm font-['Do_Hyeon']">
                {loginError}
              </div>
            )}

            {/* 입력 필드 */}
            <div className="space-y-5">
              <div>
                <label className="block text-[#333333] text-base font-['Do_Hyeon'] mb-2">
                  아이디
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="아이디를 입력하세요"
                    className="w-full h-12 px-5 bg-[#F8F8F8] rounded-2xl border-2 border-transparent focus:border-[#FFE999] transition-all duration-300 text-base font-['Do_Hyeon'] outline-none"
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[#333333] text-base font-['Do_Hyeon'] mb-2">
                  비밀번호
                </label>
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
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* 로그인 유지 체크박스 */}
            <div className="flex items-center gap-2 mt-4">
              <input
                type="checkbox"
                id="rememberLoginCheckbox"
                aria-label="로그인 유지"
                checked={rememberLogin}
                onChange={(e) => setRememberLogin(e.target.checked)}
                className="w-5 h-5 rounded-[10px] border-2 border-[#FFE999] text-[#FFE999] focus:ring-[#FFE999]"
              />
              <span className="text-[#666666] text-sm font-['Do_Hyeon']">
                로그인 유지
              </span>
            </div>

            {/* 로그인 버튼 */}
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className={`w-full h-12 mt-6 bg-[#FFED90] rounded-2xl text-lg font-['Do_Hyeon'] text-[#333333] hover:bg-[#FFD966] transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center ${
                isLoading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? "로그인 중..." : "로그인"}
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
                <div className="px-3 text-[#999999] text-sm font-['Do_Hyeon']">
                  간편 로그인
                </div>
                <div className="w-20 h-0.5 bg-[#EEEEEE]"></div>
              </div>

              {/* 소셜 로그인 버튼들 */}
              <div className="flex justify-center items-center gap-6 mt-4">
                {/* Google */}
                <button
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  aria-label="구글 계정으로 로그인"
                  className="w-12 h-12 flex items-center justify-center bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                </button>
                {/* Kakao */}
                <button
                  onClick={handleKakaoLogin}
                  disabled={isLoading}
                  aria-label="카카오 계정으로 로그인"
                  className="w-12 h-12 flex items-center justify-center bg-[#FEE500] rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24">
                    <path
                      fill="#000000"
                      d="M12 4C7.03 4 3 7.03 3 10.82C3 13.27 4.56 15.41 6.94 16.58V19.58C6.94 19.97 7.4 20.19 7.7 19.94L10.73 17.72C11.14 17.78 11.56 17.82 12 17.82C16.97 17.82 21 14.79 21 10.82C21 7.03 16.97 4 12 4Z"
                    />
                  </svg>
                </button>
                {/* Naver: Supabase에서 제공하는 로그인 기능이 없어서 주석처리
                <button
                  aria-label="네이버 계정으로 로그인"
                  className="w-12 h-12 flex items-center justify-center bg-[#03C75A] rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24">
                    <path
                      fill="#FFFFFF"
                      d="M15.5 12.5L8.5 3H3v18h5.5v-8.5L16 22h5.5V4H15.5z"
                    />
                  </svg>
                </button> */}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 아이디 찾기 모달 */}
      {showIdFindModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* 반투명 배경 오버레이 */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowIdFindModal(false)}
          />

          {/* 모달 컨테이너 */}
          <div className="w-[400px] h-[100px] relative">
            {/* 아이디 찾기 폼 */}
            <div className="absolute inset-0 flex flex-col items-center justify-center px-8">
              {/* 제목과 설명 */}
              <div className="bg-white rounded-t-[20px] px-5 py-6 w-full h-[110px]">
                <h2 className="text-2xl font-['Do_Hyeon'] text-[#333333] text-center">
                  아이디 찾기
                </h2>
                <p className="text-sm font-['Do_Hyeon'] text-[#666666] mt-2 text-center">
                  회원정보에 등록한 정보로
                  <br />
                  아이디를 찾아보세요
                </p>
              </div>

              {/* 폼 컨테이너 */}
              <div className="bg-white rounded-b-[20px] p-10 shadow-lg w-full">
                <div className="space-y-6 mt-[-25px]">
                  <div>
                    <label className="block text-[#333333] text-m font-['Do_Hyeon'] mb-1">
                      닉네임
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder="닉네임을 입력하세요"
                        className="w-full h-12 px-4 bg-[#F8F8F8] rounded-2xl border-2 border-transparent focus:border-[#FFE999] transition-all duration-300 text-sm font-['Do_Hyeon'] outline-none"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#333333] text-m font-['Do_Hyeon'] mb-1">
                      전화번호
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="전화번호를 입력하세요"
                        className="w-full h-12 px-4 bg-[#F8F8F8] rounded-2xl border-2 border-transparent focus:border-[#FFE999] transition-all duration-300 text-sm font-['Do_Hyeon'] outline-none"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={handleIdFind}
                      className="w-full h-12 mt-[-5px] bg-[#FFE999] rounded-2xl text-base font-['Do_Hyeon'] text-[#333333] hover:bg-[#FFD966] transform hover:scale-[1.02] transition-all duration-300"
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
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowPwFindModal(false)}
          />

          {/* 모달 컨테이너 */}
          <div className="w-[400px] h-[200px] relative">
            {/* 비밀번호 찾기 폼 */}
            <div className="absolute inset-0 flex flex-col items-center justify-center px-8">
              {/* 제목과 설명 */}
              <div className="bg-white rounded-t-[20px] px-5 py-10 w-full h-[100px]">
                <h2 className="text-2xl font-['Do_Hyeon'] text-[#333333] text-center">
                  비밀번호 찾기
                </h2>
                <p className="text-sm font-['Do_Hyeon'] text-[#666666] mt-2 text-center">
                  가입한 이메일로 인증번호를 받아보세요
                </p>
              </div>

              {/* 폼 컨테이너 */}
              <div className="bg-white rounded-b-[20px] p-9 shadow-lg w-full mt-[-1px]">
                <div className="space-y-7">
                  {!showVerificationCode && !showPwReset && (
                    <div>
                      <label className="block text-[#333333] text-m font-['Do_Hyeon'] mb-2">
                        이메일
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="이메일을 입력하세요"
                          className="w-full h-12 px-4 bg-[#F8F8F8] rounded-2xl border-2 border-transparent focus:border-[#FFE999] transition-all duration-300 text-sm font-['Do_Hyeon'] outline-none"
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  )}

                  {showVerificationCode && !showPwReset && (
                    <div>
                      <label className="block text-[#333333] text-m font-['Do_Hyeon'] mb-1.5">
                        인증번호
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value)}
                          placeholder="인증번호를 입력하세요"
                          className="w-full h-12 px-4 bg-[#F8F8F8] rounded-2xl border-2 border-transparent focus:border-[#FFE999] transition-all duration-300 text-sm font-['Do_Hyeon'] outline-none"
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  )}

                  {showPwReset && (
                    <>
                      <div>
                        <label className="block text-[#333333] text-m font-['Do_Hyeon'] mb-1.5">
                          새 비밀번호
                        </label>
                        <div className="relative">
                          <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="새 비밀번호를 입력하세요"
                            className="w-full h-12 px-4 bg-[#F8F8F8] rounded-2xl border-2 border-transparent focus:border-[#FFE999] transition-all duration-300 text-sm font-['Do_Hyeon'] outline-none"
                          />
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[#333333] text-m font-['Do_Hyeon'] mb-1.5">
                          새 비밀번호 확인
                        </label>
                        <div className="relative">
                          <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="새 비밀번호를 다시 입력하세요"
                            className="w-full h-12 px-4 bg-[#F8F8F8] rounded-2xl border-2 border-transparent focus:border-[#FFE999] transition-all duration-300 text-sm font-['Do_Hyeon'] outline-none"
                          />
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                              />
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
        <p className="text-sm text-[#666666] font-['Do_Hyeon']">
          © 2025 누리달. All rights reserved.
        </p>
      </div>

      {/* 아이디 찾기 결과 모달 */}
      {showFoundId && (
        <div className="fixed inset-0 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white p-10 rounded-lg shadow-lg w-90 text-center">
            <p className="text-xl font-bold mb-4 font-['Do_Hyeon']">
              아이디 찾기 결과
            </p>
            <h2 className="mb-4 text-m font-['Do_Hyeon']">아이디: {foundId}</h2>
            <button
              onClick={() => {
                setShowFoundId(false);
                router.push("/login");
              }}
              className="bg-[#FFE999] text-[#333333] px-4 py-2 font-['Do_Hyeon'] rounded hover:bg-[#FFD966]"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
