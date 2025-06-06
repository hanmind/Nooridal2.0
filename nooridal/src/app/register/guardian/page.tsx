"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { supabase } from "../../../utils/supabase";
import Script from "next/script";

// 랜덤 인증코드 생성 함수 (6자리 숫자)
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export default function GuardianSignup() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [userIdStatus, setUserIdStatus] = useState<"default" | "valid" | "invalid">("default");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState<"default" | "valid" | "invalid">("default");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneNumberStatus, setPhoneNumberStatus] = useState<"default" | "valid" | "invalid">("default");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [address, setAddress] = useState("");
  const [showEmailVerificationModal, setShowEmailVerificationModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [actualVerificationCode, setActualVerificationCode] = useState(""); // 실제 생성된 인증코드 저장용
  const [invitationCode, setInvitationCode] = useState("");
  const [pregnantUserId, setPregnantUserId] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  // 디바운스 타이머 참조
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 세션 스토리지에서 초대코드 정보 로드
  useEffect(() => {
    const savedInvitationCode = sessionStorage.getItem('invitation_code');
    const savedPregnantUserId = sessionStorage.getItem('pregnant_user_id');

    if (savedInvitationCode) {
      setInvitationCode(savedInvitationCode);
      console.log('세션스토리지에서 로드된 초대코드:', savedInvitationCode);
    } else {
      // 초대코드가 없으면 초대 페이지로 리다이렉트
      router.push('/register/guardian/invitation');
    }

    if (savedPregnantUserId) {
      setPregnantUserId(savedPregnantUserId);
      console.log('세션스토리지에서 로드된 임산부 ID:', savedPregnantUserId);
    }
  }, [router]);

  // 디바운스된 입력 처리 함수
  const handleInputChange = (
    type: "id" | "phone",
    value: string,
    setter: React.Dispatch<React.SetStateAction<string>>,
    statusSetter: React.Dispatch<React.SetStateAction<"default" | "valid" | "invalid">>
  ) => {
    setter(value);
    statusSetter("default");
  };

  // 전화번호 포맷팅 함수
  const formatPhoneNumber = (value: string) => {
    // 숫자만 추출
    const numbers = value.replace(/[^\d]/g, '');

    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  // 전화번호 입력 핸들러
  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedNumber = formatPhoneNumber(e.target.value);
    setPhoneNumber(formattedNumber);
    setPhoneNumberStatus("default");
  };

  // 이메일 중복 확인 함수
  const checkEmailDuplicate = async (emailValue: string) => {
    if (!emailValue.trim()) {
      alert("이메일을 입력해주세요.");
      return false;
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailValue)) {
      alert("유효한 이메일 형식이 아닙니다.");
      return false;
    }

    try {
      // Supabase에서 중복 이메일 확인
      const { data, error } = await supabase
        .from('users')
        .select('email')
        .eq('email', emailValue);
        
      if (error) {
        throw error;
      }
      
      const isDuplicate = data && data.length > 0;
      setEmailStatus(isDuplicate ? "invalid" : "valid");
      
      if (isDuplicate) {
        alert("이미 등록된 이메일입니다.");
      }
      
      return !isDuplicate; // 중복이 아닌 경우 true 반환
    } catch (error) {
      console.error('이메일 중복 확인 중 오류 발생:', error);
      alert('이메일 중복 확인 중 오류가 발생했습니다.');
      setEmailStatus("default");
      return false;
    }
  };

  // 이메일 인증 요청 처리
  const handleEmailVerification = async () => {
    // 이메일 중복 확인 수행
    const isEmailAvailable = await checkEmailDuplicate(email);
    
    if (!isEmailAvailable) {
      return; // 중복된 이메일이면 여기서 중단
    }
    
    // 인증 코드 생성
    const newVerificationCode = generateVerificationCode();
    setActualVerificationCode(newVerificationCode);
    
    // 실제 이메일 발송 로직은 서버에서 처리해야 하지만, 
    // 개발 중이므로 콘솔에 인증 코드를 출력하고 알림으로 표시
    console.log(`인증 코드: ${newVerificationCode}`);
    alert(`인증 코드가 발송되었습니다. (개발 테스트용: ${newVerificationCode})`);
    
    // 인증 코드 입력 모달 표시
    setShowEmailVerificationModal(true);
  };

  // 인증 코드 확인
  const handleVerificationSubmit = () => {
    if (verificationCode === actualVerificationCode) {
      alert("이메일 인증이 완료되었습니다.");
      setIsEmailVerified(true);
      setShowEmailVerificationModal(false);
      setVerificationCode("");
    } else {
      alert("인증 코드가 일치하지 않습니다. 다시 확인해주세요.");
    }
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

  // 실제로는 서버에 중복 확인 요청을 보내야 합니다.
  const checkDuplication = async (type: "id" | "phone", value: string) => {
    // 디바운스 타이머가 이미 있으면 제거
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!value.trim()) {
      alert(type === "id" ? "아이디를 입력해주세요." : "전화번호를 입력해주세요.");
      return;
    }

    // 최소 길이 검증 (아이디는 최소 3자, 전화번호는 최소 10자)
    if ((type === "id" && value.length < 3) || (type === "phone" && value.length < 10)) {
      alert(type === "id" ? "아이디는 최소 3자 이상이어야 합니다." : "전화번호는 최소 10자 이상이어야 합니다.");
      return;
    }

    try {
      if (type === "id") {
        // Supabase에서 중복 아이디 확인 - 올바른 방식으로 쿼리 구성
        const { data, error } = await supabase
          .from('users')
          .select('username')
          .eq('username', value);
          
        if (error) {
          throw error;
        }
        
        const isDuplicate = data && data.length > 0;
        setUserIdStatus(isDuplicate ? "invalid" : "valid");
        alert(isDuplicate ? "이미 사용 중인 아이디입니다." : "사용 가능한 아이디입니다.");
      } else {
        // 전화번호에서 하이픈 제거하고 확인
        const cleanPhoneNumber = value.replace(/-/g, '');
        
        // Supabase에서 중복 전화번호 확인 - 올바른 방식으로 쿼리 구성
        const { data, error } = await supabase
          .from('users')
          .select('phone_number')
          .eq('phone_number', cleanPhoneNumber);
          
        if (error) {
          throw error;
        }
        
        const isDuplicate = data && data.length > 0;
        setPhoneNumberStatus(isDuplicate ? "invalid" : "valid");
        alert(isDuplicate ? "이미 등록된 전화번호입니다." : "사용 가능한 전화번호입니다.");
      }
    } catch (error) {
      console.error('중복 확인 중 오류 발생:', error);
      alert('중복 확인 중 오류가 발생했습니다.');
      if (type === "id") {
        setUserIdStatus("default");
      } else {
        setPhoneNumberStatus("default");
      }
    }
  };

  // Daum Postcode API 사용을 위한 함수
  const handlePostcodeSearch = () => {
    if ((window as any).daum && (window as any).daum.Postcode) {
      new (window as any).daum.Postcode({
        oncomplete: function(data: any) {
          // 팝업에서 검색결과 항목을 클릭했을때 실행할 코드를 작성하는 부분
          let addr = ''; // 주소 변수
          
          // 사용자가 선택한 주소 타입에 따라 해당 주소 값을 가져온다.
          if (data.userSelectedType === 'R') { // 도로명 주소
            addr = data.roadAddress;
          } else { // 지번 주소
            addr = data.jibunAddress;
          }
          
          // 주소 정보를 해당 필드에 넣는다.
          setAddress(addr);
        }
      }).open();
    } else {
      alert('주소 검색 서비스를 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  const handleSignup = async () => {
    try {
      // 중복 확인 여부 검증
      if (userIdStatus !== "valid") {
        alert('아이디 중복 확인을 해주세요.');
        return;
      }
      
      if (phoneNumberStatus !== "valid") {
        alert('전화번호 중복 확인을 해주세요.');
        return;
      }
      
      // 이메일 인증 여부 확인
      if (!isEmailVerified) {
        alert('이메일 인증을 완료해주세요.');
        return;
      }

      // 비밀번호 확인 검증
      if (password !== confirmPassword) {
        alert('비밀번호가 일치하지 않습니다.');
        return;
      }

      // 전화번호에서 하이픈 제거
      const cleanPhoneNumber = phoneNumber.replace(/-/g, '');
      
      // 1. 사용자 비밀번호 해싱은 Supabase에서 자동으로 처리
      const { data: userData, error: userError } = await supabase.auth.signUp({
        email, 
        password,
      });

      if (userError) throw userError;
      if (!userData?.user) throw new Error('사용자 계정 생성에 실패했습니다.');

      // 2. users 테이블에 추가 정보 저장
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: userData.user.id,
          email,
          name,
          username: userId,
          phone_number: cleanPhoneNumber, // 하이픈 제거된 번호 저장
          address, // Use just the main address
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

      // 5. 성공 시 캘린더 페이지로 이동
      router.push('/calendar');
      
    } catch (error) {
      console.error('회원가입 에러:', error);
      alert('회원가입 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#FFF4BB] flex justify-center items-center">
      {/* Load Daum Postcode API script */}
      <Script src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js" strategy="beforeInteractive" />
      
      <div className="w-96 h-[874px] relative bg-[#FFF4BB] overflow-hidden">
        <div className="w-80 h-[745px] left-[28px] top-[67px] absolute bg-white rounded-3xl shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]" />
        
        {/* 누리달 로고 */}
        <img
          className="w-32 h-14 left-[135px] top-[105px] absolute"
          src="/images/logo/누리달.png"
          alt="누리달 로고"
        />

        {/* 아이디 입력 필드 */}
        <div className="w-20 h-9 left-[32px] top-[167px] absolute text-center text-black/70 text-sm font-['Do_Hyeon'] leading-[50px]">아이디</div>
        <div className="w-70 h-8 left-[52px] top-[202px] absolute">
          <input
            type="text"
            value={userId}
            onChange={(e) => handleInputChange("id", e.target.value, setUserId, setUserIdStatus)}
            placeholder="아이디를 입력하세요"
            className={`w-full h-full px-4 text-neutral-400 text-xs font-['Do_Hyeon'] rounded-[10px] border ${getBorderColor(userIdStatus)} focus:outline-none`}
          />
        </div>
        <button 
          onClick={() => checkDuplication("id", userId)}
          className={`w-16 h-6 left-[264px] top-[206px] absolute bg-yellow-200 rounded-[10px] text-black text-xs font-['Do_Hyeon'] ${userIdStatus === "valid" ? "opacity-50 cursor-not-allowed" : "hover:bg-yellow-300 transition-colors"}`}
          disabled={userIdStatus === "valid"}
        >
          중복확인
        </button>

        {/* 이름 입력 필드 */}
        <div className="w-12 h-9 left-[45px] top-[236px] absolute text-center text-black/70 text-sm font-['Do_Hyeon'] leading-[50px]">이름</div>
        <div className="w-70 h-8 left-[52px] top-[271px] absolute">
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
        <div className="w-70 h-8 left-[52px] top-[340px] absolute">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailStatus("default");
              setIsEmailVerified(false); // 이메일 변경 시 인증 상태 초기화
            }}
            placeholder="이메일을 입력하세요"
            className={`w-full h-full px-4 text-neutral-400 text-xs font-['Do_Hyeon'] rounded-[10px] border ${getBorderColor(emailStatus)} focus:outline-none`}
          />
        </div>
        <button 
          onClick={handleEmailVerification}
          className={`w-16 h-6 left-[264px] top-[344px] absolute bg-yellow-200 rounded-[10px] text-black text-xs font-['Do_Hyeon'] ${isEmailVerified ? "opacity-50 cursor-not-allowed" : "hover:bg-yellow-300 transition-colors"}`}
          disabled={isEmailVerified}
        >
          {isEmailVerified ? "인증완료" : "인증요청"}
        </button>

        {/* 전화번호 입력 필드 */}
        <div className="w-20 h-9 left-[38px] top-[374px] absolute text-center text-black/70 text-sm font-['Do_Hyeon'] leading-[50px]">전화번호</div>
        <div className="w-70 h-8 left-[52px] top-[415px] absolute">
          <input
            type="tel"
            value={phoneNumber}
            onChange={handlePhoneNumberChange}
            placeholder="숫자만 입력하세요"
            className={`w-full h-full px-4 text-neutral-400 text-xs font-['Do_Hyeon'] rounded-[10px] border ${getBorderColor(phoneNumberStatus)} focus:outline-none`}
          />
        </div>
        <button 
          onClick={() => checkDuplication("phone", phoneNumber)}
          className={`w-16 h-6 left-[264px] top-[419px] absolute bg-yellow-200 rounded-[10px] text-black text-xs font-['Do_Hyeon'] ${phoneNumberStatus === "valid" ? "opacity-50 cursor-not-allowed" : "hover:bg-yellow-300 transition-colors"}`}
          disabled={phoneNumberStatus === "valid"}
        >
          중복확인
        </button>

        {/* 비밀번호 입력 필드 */}
        <div className="w-32 h-9 left-[15px] top-[449px] absolute text-center text-black/70 text-sm font-['Do_Hyeon'] leading-[50px]">비밀번호</div>
        <div className="w-70 h-8 left-[52px] top-[487px] absolute">
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
        <div className="w-70 h-8 left-[51px] top-[569px] absolute">
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
        <div className="w-70 h-8 left-[52px] top-[643px] absolute">
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="검색 버튼을 눌러 주소를 입력해주세요"
            className="w-full h-full px-4 text-neutral-400 text-xs font-['Do_Hyeon'] rounded-[10px] border border-zinc-300 focus:outline-none"
            readOnly
          />
        </div>
        <button 
          onClick={handlePostcodeSearch}
          className="w-16 h-6 left-[264px] top-[647px] absolute bg-yellow-200 rounded-[10px] text-black text-xs font-['Do_Hyeon'] hover:bg-yellow-300 transition-colors"
        >
          검색
        </button>

        {/* 이메일 인증 모달 */}
        {showEmailVerificationModal && (
          <>
            <div className="w-96 h-[874px] left-0 top-0 absolute bg-neutral-400/50 z-20" />
            <div className="w-80 h-52 left-[29px] top-[303px] absolute bg-white rounded-[20px] z-30">
              <div className="w-80 h-20 left-0 top-[28px] absolute text-center text-black text-lg font-['Do_Hyeon'] leading-[50px] z-10">
                이메일로 받은 인증번호를 입력하세요
              </div>
              <div className="w-64 h-10 left-[33px] top-[85px] absolute z-10">
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="인증번호 입력"
                  className="w-full h-full px-4 text-neutral-400 text-sm font-['Do_Hyeon'] rounded-[10px] border border-zinc-300 focus:outline-none"
                />
              </div>
              <div className="flex justify-between w-full px-8 absolute bottom-6 z-10">
                <button
                  onClick={handleVerificationSubmit}
                  className="w-30 h-9 bg-[#FFED90] rounded-[10px] hover:bg-[#FFE080] transition-colors"
                >
                  <div className="w-full text-center text-black text-sm font-['Do_Hyeon'] leading-[36px]">
                    확인
                  </div>
                </button>
                <button
                  onClick={() => setShowEmailVerificationModal(false)}
                  className="w-30 h-9 bg-[#FFED90] rounded-[10px] hover:bg-[#FFE080] transition-colors"
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
          className="w-70 h-10 left-[49px] top-[702.18px] absolute bg-yellow-200 rounded-[20px] z-10 hover:bg-yellow-300 transition-colors"
        >
          <div className="w-50 h-7 left-[45px] top-[-5px] absolute text-black text-base font-['Do_Hyeon'] leading-[50px]">
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