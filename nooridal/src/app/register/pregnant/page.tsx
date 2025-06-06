"use client";

// import Image from "next/image"; // Linter: unused
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { supabase } from "../../../utils/supabase";
import Script from "next/script";
import { Database } from "../../../../types_db"; // 정확한 상대 경로로 수정

export default function PregnantSignup() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [userIdStatus, setUserIdStatus] = useState<
    "default" | "valid" | "invalid"
  >("default");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneNumberStatus, setPhoneNumberStatus] = useState<
    "default" | "valid" | "invalid"
  >("default");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [address, setAddress] = useState("");
  const [showEmailVerificationModal, setShowEmailVerificationModal] =
    useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [actualVerificationCode, setActualVerificationCode] = useState(""); // 실제 생성된 인증코드 저장용
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [emailStatus, setEmailStatus] = useState<
    "default" | "valid" | "invalid"
  >("default");
  // const [pregnancies, setPregnancies] = useState<Pregnancy[]>([]); // Linter: unused
  // const [newPregnancy, setNewPregnancy] = useState({
  //   baby_name: '',
  //   current_week: 0,
  //   high_risk: false,
  // });

  // 디바운스 타이머 참조
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 랜덤 인증코드 생성 함수 (6자리 숫자)
  const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // 8자리 랜덤 초대코드 생성 함수
  const generateInvitationCode = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  // 전화번호 포맷팅 함수
  const formatPhoneNumber = (value: string) => {
    // 숫자만 추출
    const numbers = value.replace(/[^\d]/g, "");

    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7)
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(
      7,
      11
    )}`;
  };

  // 전화번호 입력 핸들러
  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedNumber = formatPhoneNumber(e.target.value);
    setPhoneNumber(formattedNumber);
    setPhoneNumberStatus("default");
  };

  // 인증코드 요청
  const handleVerificationRequest = async () => {
    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("유효한 이메일 형식이 아닙니다.");
      return;
    }

    // 이메일 중복 확인
    try {
      const { data, error } = await supabase
        .from("users")
        .select("email")
        .eq("email", email);

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        alert("이미 등록된 이메일입니다.");
        setEmailStatus("invalid");
        return;
      }

      setEmailStatus("valid");

      // 인증 코드 생성
      const generatedCode = generateVerificationCode();
      setActualVerificationCode(generatedCode);

      // 실제 이메일 발송 로직은 서버에서 처리해야 하지만,
      // 개발 중이므로 콘솔에 인증 코드를 출력하고 알림으로 표시
      console.log(`인증 코드: ${generatedCode}`);
      alert(`인증 코드가 발송되었습니다. (개발 테스트용: ${generatedCode})`);

      // 인증 모달 열기
      setShowEmailVerificationModal(true);
    } catch (error) {
      console.error("이메일 중복 확인 중 오류 발생:", error);
      alert("이메일 중복 확인 중 오류가 발생했습니다.");
    }
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

  // Daum Postcode API 사용을 위한 함수
  const handlePostcodeSearch = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).daum && (window as any).daum.Postcode) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      new (window as any).daum.Postcode({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        oncomplete: function (data: any) {
          // 팝업에서 검색결과 항목을 클릭했을때 실행할 코드를 작성하는 부분
          let addr = ""; // 주소 변수

          // 사용자가 선택한 주소 타입에 따라 해당 주소 값을 가져온다.
          if (data.userSelectedType === "R") {
            // 도로명 주소
            addr = data.roadAddress;
          } else {
            // 지번 주소
            addr = data.jibunAddress;
          }

          // 주소 정보를 해당 필드에 넣는다.
          setAddress(addr);
        },
      }).open();
    } else {
      alert(
        "주소 검색 서비스를 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요."
      );
    }
  };

  const handleSignup = async () => {
    try {
      // 중복 확인 여부 검증
      if (userIdStatus !== "valid") {
        alert("아이디 중복 확인을 해주세요.");
        return;
      }

      if (phoneNumberStatus !== "valid") {
        alert("전화번호 중복 확인을 해주세요.");
        return;
      }

      // 이메일 인증 여부 확인
      if (!isEmailVerified) {
        alert("이메일 인증을 완료해주세요.");
        return;
      }

      // 비밀번호 확인 검증
      if (password !== confirmPassword) {
        alert("비밀번호가 일치하지 않습니다.");
        return;
      }

      // 전화번호에서 하이픈 제거
      const cleanPhoneNumber = phoneNumber.replace(/-/g, "");

      // 초대코드 생성
      const invitationCode = generateInvitationCode();

      // 1. 사용자 비밀번호 해싱은 Supabase에서 자동으로 처리
      const { data: userData, error: userError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            // 여기서는 user_auth_id 대신 다른 초기 메타데이터 설정 가능
            // username은 public.users 테이블에 직접 삽입 예정
          },
        },
      });

      if (userError) throw userError;
      if (!userData?.user) throw new Error("사용자 계정 생성에 실패했습니다.");

      // 2. users 테이블에 추가 정보 저장
      const newUser: Omit<
        Database["public"]["Tables"]["users"]["Insert"],
        "id"
      > = {
        username: userId,
        name: name,
        email: email,
        phone_number: cleanPhoneNumber,
        address: address,
        invitation_code: invitationCode,
        user_type: "pregnant",
      };

      const { error: insertError } = await supabase
        .from("users")
        .insert(newUser);

      if (insertError) throw insertError;

      // 3. 성공 시 다음 페이지로 이동
      router.push("/register/pregnant/pregnancy-info");
    } catch (error) {
      console.error("회원가입 에러:", error);
      alert("회원가입 중 오류가 발생했습니다.");
    }
  };

  // 실제로는 서버에 중복 확인 요청을 보내야 합니다.
  const checkDuplication = async (type: "id" | "phone", value: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    if (!value.trim()) {
      alert(
        type === "id" ? "아이디를 입력해주세요." : "전화번호를 입력해주세요."
      );
      return;
    }
    if (
      (type === "id" && value.length < 3) ||
      (type === "phone" && value.length < 10)
    ) {
      alert(
        type === "id"
          ? "아이디는 최소 3자 이상이어야 합니다."
          : "전화번호는 최소 10자 이상이어야 합니다."
      );
      return;
    }
    try {
      if (type === "id") {
        // Supabase에서 중복 아이디 확인 - username 컬럼 확인
        const { data, error } = await supabase
          .from("users")
          .select("username") // username 컬럼 확인
          .eq("username", value); // username과 비교

        if (error) {
          throw error;
        }

        const isDuplicate = data && data.length > 0;
        setUserIdStatus(isDuplicate ? "invalid" : "valid");
        alert(
          isDuplicate
            ? "이미 사용 중인 아이디입니다."
            : "사용 가능한 아이디입니다."
        );
      } else {
        // 전화번호에서 하이픈 제거하고 확인
        const cleanPhoneNumber = value.replace(/-/g, "");

        // Supabase에서 중복 전화번호 확인 - 올바른 방식으로 쿼리 구성
        const { data, error } = await supabase
          .from("users")
          .select("phone_number")
          .eq("phone_number", cleanPhoneNumber);

        if (error) {
          throw error;
        }

        const isDuplicate = data && data.length > 0;
        setPhoneNumberStatus(isDuplicate ? "invalid" : "valid");
        alert(
          isDuplicate
            ? "이미 등록된 전화번호입니다."
            : "사용 가능한 전화번호입니다."
        );
      }
    } catch (error) {
      console.error("중복 확인 중 오류 발생:", error);
      alert("중복 확인 중 오류가 발생했습니다.");
      if (type === "id") {
        setUserIdStatus("default");
      } else {
        setPhoneNumberStatus("default");
      }
    }
  };

  // 디바운스된 입력 처리 함수
  const handleInputChange = (
    type: "id" | "phone",
    value: string,
    setter: React.Dispatch<React.SetStateAction<string>>,
    statusSetter: React.Dispatch<
      React.SetStateAction<"default" | "valid" | "invalid">
    >
  ) => {
    setter(value);
    statusSetter("default");
  };

  useEffect(() => {
    // fetchPregnancies(); // Linter: functions using this are commented out
  }, []);

  /* Linter: unused functions
  const fetchPregnancies = async () => {
    const { data, error } = await supabase.from('pregnancies').select('*');
    if (error) console.error('Error fetching pregnancies:', error);
    // else setPregnancies(data); // Assuming Pregnancy type matches DB
  };

  const createPregnancy = async () => {
    const { data, error } = await supabase.from('pregnancies').insert([newPregnancy]);
    if (error) console.error('Error creating pregnancy:', error);
    else fetchPregnancies(); // Refresh list
  };

  const updatePregnancy = async (id: string, updates: Partial<Pregnancy>) => {
    const { data, error } = await supabase.from('pregnancies').update(updates).eq('id', id);
    if (error) console.error('Error updating pregnancy:', error);
    else fetchPregnancies(); // Refresh list
  };

  const deletePregnancy = async (id: string) => {
    const { error } = await supabase.from('pregnancies').delete().eq('id', id);
    if (error) console.error('Error deleting pregnancy:', error);
    else fetchPregnancies(); // Refresh list
  };
  */

  /* Linter: unused
  type Pregnancy = {
    id: string;
    baby_name: string | null;
    current_week: number | null;
    high_risk: boolean | null;
  };
  */

  return (
    <div className="min-h-screen w-full flex justify-center items-center px-2 py-10 sm:px-4 md:px-8 bg-white">
      <main className="w-full max-w-md relative bg-white overflow-visible pb-20 mb-10 sm:w-96 md:w-[420px] lg:w-[480px] xl:w-[520px]">
        {/* Load Daum Postcode API script */}
        <Script
          src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
          strategy="beforeInteractive"
        />

        <div className="w-82 h-auto min-h-[725px] mx-auto rounded-3xl shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] p-8 pt-16 relative">
          {/* 누리달 로고 */}
          <img
            className="w-32 h-14 absolute left-0 right-0 mx-auto -top-10"
            src="/images/logo/누리달.png"
            alt="누리달 로고"
          />

          {/* 아이디 입력 필드 */}
          <div className="mb-2 text-black/70 text-sm font-['Do_Hyeon']">
            아이디
          </div>
          <div className="mb-6 relative">
            <input
              type="text"
              value={userId}
              onChange={(e) =>
                handleInputChange(
                  "id",
                  e.target.value,
                  setUserId,
                  setUserIdStatus
                )
              }
              placeholder="아이디를 입력하세요"
              className={`w-full h-10 px-3 text-neutral-400 text-sm font-['Do_Hyeon'] rounded-[10px] border ${getBorderColor(
                userIdStatus
              )} focus:outline-none`}
            />
            <button
              onClick={() => checkDuplication("id", userId)}
              className={`absolute right-2 top-2 w-16 h-6 bg-yellow-200 rounded-[10px] text-black text-xs font-['Do_Hyeon'] ${
                userIdStatus === "valid"
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-yellow-300 transition-colors"
              }`}
              disabled={userIdStatus === "valid"}
            >
              중복확인
            </button>
          </div>

          {/* 이름 입력 필드 */}
          <div className="mb-2 text-black/70 text-sm font-['Do_Hyeon']">
            이름
          </div>
          <div className="mb-6">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름을 입력하세요"
              className="w-full h-10 px-3 text-neutral-400 text-sm font-['Do_Hyeon'] rounded-[10px] border border-zinc-300 focus:outline-none"
            />
          </div>

          {/* 이메일 입력 필드 */}
          <div className="mb-2 text-black/70 text-sm font-['Do_Hyeon']">
            이메일
          </div>
          <div className="mb-6 relative">
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailStatus("default");
                setIsEmailVerified(false); // 이메일 변경 시 인증 상태 초기화
              }}
              placeholder="이메일을 입력하세요"
              className={`w-full h-10 px-3 text-neutral-400 text-sm font-['Do_Hyeon'] rounded-[10px] border ${getBorderColor(
                emailStatus
              )} focus:outline-none`}
            />
            <button
              onClick={handleVerificationRequest}
              className={`absolute right-2 top-2 w-16 h-6 bg-yellow-200 rounded-[10px] text-black text-xs font-['Do_Hyeon'] ${
                isEmailVerified
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-yellow-300 transition-colors"
              }`}
              disabled={isEmailVerified}
            >
              {isEmailVerified ? "인증완료" : "인증요청"}
            </button>
          </div>

          {/* 전화번호 입력 필드 */}
          <div className="mb-2 text-black/70 text-sm font-['Do_Hyeon']">
            전화번호
          </div>
          <div className="mb-6 relative">
            <input
              type="tel"
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
              placeholder="숫자만 입력하세요"
              className={`w-full h-10 px-3 text-neutral-400 text-sm font-['Do_Hyeon'] rounded-[10px] border ${getBorderColor(
                phoneNumberStatus
              )} focus:outline-none`}
            />
            <button
              onClick={() => checkDuplication("phone", phoneNumber)}
              className={`absolute right-2 top-2 w-16 h-6 bg-yellow-200 rounded-[10px] text-black text-xs font-['Do_Hyeon'] ${
                phoneNumberStatus === "valid"
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-yellow-300 transition-colors"
              }`}
              disabled={phoneNumberStatus === "valid"}
            >
              중복확인
            </button>
          </div>

          {/* 비밀번호 입력 필드 */}
          <div className="mb-2 text-black/70 text-sm font-['Do_Hyeon']">
            비밀번호
          </div>
          <div className="mb-6">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              className="w-full h-10 px-3 text-neutral-400 text-sm font-['Do_Hyeon'] rounded-[10px] border border-zinc-300 focus:outline-none"
            />
          </div>

          {/* 비밀번호 확인 입력 필드 */}
          <div className="mb-2 text-black/70 text-sm font-['Do_Hyeon']">
            비밀번호 확인
          </div>
          <div className="mb-6">
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="비밀번호를 다시 입력하세요"
              className="w-full h-10 px-3 text-neutral-400 text-sm font-['Do_Hyeon'] rounded-[10px] border border-zinc-300 focus:outline-none"
            />
          </div>

          {/* 주소 입력 필드 */}
          <div className="mb-2 text-black/70 text-sm font-['Do_Hyeon']">
            주소
          </div>
          <div className="mb-8 relative">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="검색 버튼을 눌러 주소를 입력해주세요"
              className="w-full h-10 px-3 text-neutral-400 text-sm font-['Do_Hyeon'] rounded-[10px] border border-zinc-300 focus:outline-none"
              readOnly
            />
            <button
              onClick={handlePostcodeSearch}
              className="absolute right-2 top-2 w-16 h-6 bg-yellow-200 rounded-[10px] text-black text-xs font-['Do_Hyeon'] hover:bg-yellow-300 transition-colors"
            >
              검색
            </button>
          </div>

          {/* 회원가입 버튼 */}
          <button
            onClick={handleSignup}
            className="w-full h-12 bg-yellow-200 rounded-[20px] hover:bg-yellow-300 transition-colors"
          >
            <div className="text-black text-base font-['Do_Hyeon']">
              회원가입
            </div>
          </button>

          <div className="mt-4 text-center">
            <button
              onClick={() => router.push("/login")}
              className="text-yellow-400 text-sm font-['Do_Hyeon']"
            >
              이미 계정이 있으신가요? 로그인하기
            </button>
          </div>
        </div>

        {/* 이메일 인증 모달 */}
        {showEmailVerificationModal && (
          <>
            <div className="fixed inset-0 bg-neutral-400/50 z-20" />
            <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-52 bg-white rounded-[20px] z-30 p-4">
              <div className="text-center text-black text-lg font-['Do_Hyeon'] mb-4">
                이메일로 받은 인증번호를 입력하세요
              </div>
              <div className="mb-4">
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="인증번호 입력"
                  className="w-full h-10 px-3 text-neutral-400 text-s font-['Do_Hyeon'] rounded-[10px] border border-zinc-300 focus:outline-none"
                />
              </div>
              <div className="flex justify-between">
                <button
                  onClick={handleVerificationSubmit}
                  className="w-[45%] h-9 bg-[#FFED90] rounded-[10px] hover:bg-[#FFE080] transition-colors"
                >
                  <div className="text-center text-black text-sm font-['Do_Hyeon']">
                    확인
                  </div>
                </button>
                <button
                  onClick={() => setShowEmailVerificationModal(false)}
                  className="w-[45%] h-9 bg-[#FFED90] rounded-[10px] hover:bg-[#FFE080] transition-colors"
                >
                  <div className="text-center text-black text-sm font-['Do_Hyeon']">
                    취소
                  </div>
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
