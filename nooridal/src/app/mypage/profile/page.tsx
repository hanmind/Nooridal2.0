"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useProfile } from "@/app/context/ProfileContext";
import { useAddress } from "@/app/context/AddressContext";
import { supabase } from "@/app/lib/supabase";

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
      }) => { open: () => void };
    };
  }
}

// Define a reusable button component for similar styled buttons with type annotations
const StyledButton: React.FC<{
  onClick?: () => void;
  children?: React.ReactNode;
  className?: string;
}> = ({ onClick, children, className }) => (
  <div
    className={`w-9 h-7 bg-sky-200 rounded-full cursor-pointer ${className}`}
    onClick={onClick}
  >
    {children}
  </div>
);

export default function ProfileManagement() {
  const router = useRouter();
  const [idDuplicate, setIdDuplicate] = useState<boolean | null>(null);
  const [phoneDuplicate, setPhoneDuplicate] = useState<boolean | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const { address, setAddress } = useAddress();
  const inviteCode = "fkdi38fshl12";
  const [showProfileOptions, setShowProfileOptions] = useState(false);
  const [showEditOptions, setShowEditOptions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { profileImage, setProfileImage } = useProfile();
  const [isEditingId, setIsEditingId] = useState(false);
  const [tempUserId, setTempUserId] = useState("");
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [tempPhoneNumber, setTempPhoneNumber] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordLength, setPasswordLength] = useState(8);
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    username: "",
    phoneNumber: "",
    address: "",
    invitation_code: "",
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const isSocialLogin = true; // This should be set based on your logic

  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
    script.async = true;
    document.head.appendChild(script);

    // Supabase에서 사용자 정보 불러오기
    const fetchUserInfo = async () => {
      try {
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();
        if (sessionError) {
          console.error("Error fetching user session:", sessionError);
          return;
        }

        const user = sessionData?.session?.user;
        if (user) {
          // 사용자 기본 정보 설정
          setUserInfo({
            name: user.user_metadata.full_name || "",
            email: user.email || "",
            username: user.id || "",
            phoneNumber: user.user_metadata.phone || "",
            address: "",
            invitation_code: user.user_metadata.invitation_code || "",
          });
          setTempUserId(user.id || "");
          setTempPhoneNumber(user.user_metadata.phone || "");
          setPasswordLength(8);

          // 추가 사용자 정보 가져오기
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("*")
            .eq("id", user.id)
            .maybeSingle();

          if (userError) {
            console.error("Error fetching user data:", userError);
          } else if (userData) {
            setUserInfo({
              name: userData.name || "",
              email: userData.email || "",
              username: userData.username || "",
              phoneNumber: userData.phone_number || "",
              address: "",
              invitation_code: userData.invitation_code || "",
            });
            if (userData.address) {
              setAddress(userData.address);
            }
            setTempUserId(userData.username || userInfo.username);
            setTempPhoneNumber(userData.phone_number || userInfo.phoneNumber);
          }
        }
      } catch (error) {
        console.error("사용자 정보를 불러오는데 실패했습니다:", error);
      }
    };

    fetchUserInfo();

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [setAddress]);

  const handleAddressSearch = () => {
    if (window.daum) {
      new window.daum.Postcode({
        oncomplete: function (data: any) {
          // API 결과에서 주소 선택 (도로명 우선, 없으면 지번)
          const selectedAddress = data.roadAddress || data.jibunAddress;
          console.log("Address selected:", selectedAddress); // 선택된 주소 로깅
          setAddress(selectedAddress); // AddressContext 상태 업데이트
        },
      }).open();
    } else {
      console.error("Daum Postcode API is not loaded.");
      alert("주소 검색 API를 로드할 수 없습니다. 페이지를 새로고침 해보세요.");
    }
  };

  const handleIdClick = () => {
    setIsEditingId(true);
  };

  const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempUserId(e.target.value);
  };

  const handleIdBlur = () => {
    // 중복 체크 중이 아닐 때만 편집 모드 종료
    if (idDuplicate === null) {
      setIsEditingId(false);
    }
  };

  const checkIdDuplicate = async () => {
    if (!tempUserId.trim()) {
      alert("아이디를 입력해주세요.");
      return;
    }

    try {
      console.log("Checking ID duplicate for:", tempUserId);
      const { data, error, status } = await supabase
        .from("users")
        .select("username")
        .eq("username", tempUserId)
        .neq("email", userInfo.email) // 현재 사용자 제외
        .maybeSingle(); // Use maybeSingle to handle no rows case

      if (error) {
        console.error("Supabase error:", error);
        if (status === 406) {
          alert("서버에서 요청을 처리할 수 없습니다. 요청 형식을 확인하세요.");
        } else {
          alert("중복 확인 중 오류가 발생했습니다.");
        }
      } else if (data) {
        // 데이터가 있음 = 중복
        setIdDuplicate(true);
        alert("이미 사용 중인 아이디입니다.");
      } else {
        // 데이터가 없음 = 중복 아님
        setIdDuplicate(false);
        setUserInfo((prev) => ({ ...prev, username: tempUserId }));
        alert("사용 가능한 아이디입니다.");
      }
    } catch (error) {
      console.error("아이디 중복 확인 중 오류 발생:", error);
      alert("중복 확인 중 오류가 발생했습니다.");
    }

    setTimeout(() => {
      setIdDuplicate(null);
    }, 3000);
  };

  const handlePhoneClick = () => {
    setIsEditingPhone(true);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, ""); // 숫자만 남기기

    if (value.length <= 11) {
      // 전화번호 형식으로 변환 (010-1234-5678)
      if (value.length > 3 && value.length <= 7) {
        value = value.slice(0, 3) + "-" + value.slice(3);
      } else if (value.length > 7) {
        value =
          value.slice(0, 3) + "-" + value.slice(3, 7) + "-" + value.slice(7);
      }
      setTempPhoneNumber(value);
    }
  };

  const handlePhoneBlur = () => {
    if (phoneDuplicate === null) {
      setIsEditingPhone(false);
    }
  };

  const checkPhoneDuplicate = async () => {
    if (!tempPhoneNumber.trim()) {
      return;
    }

    try {
      console.log("Checking phone number duplicate for:", tempPhoneNumber);
      const { data, error, status } = await supabase
        .from("users")
        .select("phone_number")
        .eq("phone_number", tempPhoneNumber.replace(/-/g, ""))
        .neq("email", userInfo.email) // 현재 사용자 제외
        .maybeSingle(); // Use maybeSingle to handle no rows case

      if (error) {
        console.error("Supabase error:", error);
        if (status === 406) {
          alert("서버에서 요청을 처리할 수 없습니다. 요청 형식을 확인하세요.");
        } else {
          alert("전화번호 중복 확인 중 오류가 발생했습니다.");
        }
      } else if (data) {
        // 데이터가 있음 = 중복
        setPhoneDuplicate(true);
        alert("이미 등록된 전화번호입니다.");
      } else {
        // 데이터가 없음 = 중복 아님
        setPhoneDuplicate(false);
        setUserInfo((prev) => ({ ...prev, phoneNumber: tempPhoneNumber }));
        alert("사용 가능한 전화번호입니다.");
      }
    } catch (error) {
      console.error("전화번호 중복 확인 중 오류 발생:", error);
      alert("전화번호 중복 확인 중 오류가 발생했습니다.");
    }

    setTimeout(() => {
      setPhoneDuplicate(null);
    }, 3000);
  };

  const copyInviteCode = () => {
    navigator.clipboard
      .writeText(userInfo.invitation_code)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => {
          setCopySuccess(false);
        }, 2000);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  };

  const handleProfileClick = () => {
    if (profileImage) {
      // 이미 프로필 이미지가 있는 경우 편집 옵션 표시
      setShowEditOptions(!showEditOptions);
      setShowProfileOptions(false);
    } else {
      // 프로필 이미지가 없는 경우 등록 옵션 표시
      setShowProfileOptions(!showProfileOptions);
      setShowEditOptions(false);
    }
  };

  const handleEditProfile = async () => {
    setShowEditOptions(false);
    setShowProfileOptions(true);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDeleteProfile = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('사용자 정보를 찾을 수 없습니다.');

      const { error: updateError } = await supabase
        .from('users')
        .update({ profile_image: null })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfileImage(null);
      setShowEditOptions(false);
    } catch (error) {
      console.error('프로필 이미지 삭제 중 오류 발생:', error);
      alert('프로필 이미지 삭제에 실패했습니다.');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const imageData = reader.result as string;
        setProfileImage(imageData);
        setShowProfileOptions(false);

        // Supabase에 프로필 이미지 저장
        try {
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          if (userError) throw userError;
          if (!user) throw new Error('사용자 정보를 찾을 수 없습니다.');

          const { error: updateError } = await supabase
            .from('users')
            .update({ profile_image: imageData })
            .eq('id', user.id);

          if (updateError) throw updateError;
        } catch (error) {
          console.error('프로필 이미지 저장 중 오류 발생:', error);
          alert('프로필 이미지 저장에 실패했습니다.');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = async () => {
    // 저장 로직에서 AddressContext의 address 값을 사용
    const updates = {
      name: userInfo.name,
      phone_number: tempPhoneNumber.replace(/-/g, ""),
      username: tempUserId,
      address: address, // <<--- AddressContext의 값 사용
      // email은 일반적으로 프로필에서 수정하지 않음
    };

    console.log("Saving changes:", updates);

    try {
      const { error } = await supabase
        .from("users")
        .update(updates)
        .eq("username", userInfo.username); // 현재 로그인된 사용자의 username 사용

      if (error) {
        console.error("Error updating user info:", error);
        alert("정보 업데이트 중 오류가 발생했습니다.");
      } else {
        alert("정보가 성공적으로 업데이트되었습니다.");
        // 필요하다면 userInfo 상태 다시 로드 또는 업데이트
        setUserInfo((prev) => ({
          ...prev,
          ...updates,
          phoneNumber: tempPhoneNumber,
        }));
        setIsEditingId(false); // 편집 모드 종료
        setIsEditingPhone(false);
        router.push("/mypage"); // 마이페이지로 이동
      }
    } catch (error) {
      console.error("정보 업데이트 중 오류 발생:", error);
      alert("정보 업데이트 중 오류가 발생했습니다.");
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordError("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("비밀번호는 최소 6자 이상이어야 합니다.");
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      alert("비밀번호가 성공적으로 변경되었습니다.");
      setShowPasswordModal(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordError("");
    } catch (error) {
      console.error("비밀번호 변경 중 오류 발생:", error);
      setPasswordError("비밀번호 변경에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        console.log("탈퇴 시작 - 사용자 ID:", user.id);

        // 1. 사용자의 모든 채팅 대화 삭제
        const { error: convError } = await supabase
          .from("llm_conversations")
          .delete()
          .eq("user_id", user.id);
        if (convError) console.error("채팅 대화 삭제 실패:", convError);
        else console.log("채팅 대화 삭제 완료");

        // 2. 사용자의 모든 채팅방 삭제
        const { error: roomError } = await supabase
          .from("chat_rooms")
          .delete()
          .eq("user_id", user.id);
        if (roomError) console.error("채팅방 삭제 실패:", roomError);
        else console.log("채팅방 삭제 완료");

        // 3. 사용자의 모든 일정 삭제
        const { error: eventError } = await supabase
          .from("events")
          .delete()
          .eq("user_id", user.id);
        if (eventError) console.error("일정 삭제 실패:", eventError);
        else console.log("일정 삭제 완료");

        // 4. 사용자의 임신 정보 삭제
        const { error: pregError } = await supabase
          .from("pregnancies")
          .delete()
          .eq("user_id", user.id);
        if (pregError) console.error("임신 정보 삭제 실패:", pregError);
        else console.log("임신 정보 삭제 완료");

        // 5. 사용자의 일기 삭제
        const { error: diaryError } = await supabase
          .from("baby_diaries")
          .delete()
          .eq("user_id", user.id);
        if (diaryError) console.error("일기 삭제 실패:", diaryError);
        else console.log("일기 삭제 완료");

        // 6. 사용자의 프로필 이미지 삭제
        const { error: profileError } = await supabase
          .from("users")
          .update({ profile_image: null })
          .eq("id", user.id);
        if (profileError) console.error("프로필 이미지 삭제 실패:", profileError);
        else console.log("프로필 이미지 삭제 완료");

        // 7. 사용자 계정 삭제
        console.log("users 테이블에서 사용자 삭제 시도...");
        console.log("삭제할 사용자 ID:", user.id);
        
        // 먼저 사용자 정보 확인
        const { data: userData, error: userCheckError } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();
          
        if (userCheckError) {
          console.error("사용자 정보 확인 실패:", userCheckError);
          throw userCheckError;
        }
        
        console.log("삭제할 사용자 정보:", userData);

        // 사용자 삭제 시도 (RLS 정책을 고려하여 수정)
        const { error: userDeleteError } = await supabase
          .from("users")
          .delete()
          .eq("id", user.id);

        if (userDeleteError) {
          console.error("users 테이블 삭제 실패:", userDeleteError);
          throw userDeleteError;
        }
        console.log("users 테이블에서 사용자 삭제 완료");

        // 8. 로그아웃 처리
        const { error: signOutError } = await supabase.auth.signOut();
        if (signOutError) console.error("로그아웃 실패:", signOutError);
        else console.log("로그아웃 완료");
        
        // 9. 세션 스토리지의 임신 정보 삭제
        sessionStorage.removeItem('pregnancy_info');
        console.log("세션 스토리지 임신 정보 삭제 완료");
        
        alert("계정이 완전히 삭제되었습니다.");
        router.push("/login");
      }
    } catch (error) {
      console.error("계정 삭제 중 오류 발생:", error);
      alert("계정 삭제에 실패했습니다. 다시 시도해주세요.");
    }
  };

  // Adjust the masked user ID to fit within the input field
  const maxVisibleLength = 8; // Number of visible characters
  const totalLength = 12; // Total length of the user ID field
  const maskedUserId =
    userInfo.username.slice(0, maxVisibleLength) +
    "*".repeat(totalLength - maxVisibleLength);

  return (
    <div className="min-h-screen w-full bg-[#FFF4BB] flex justify-center items-center">
      <div className="w-96 h-[874px] relative bg-[#FFF4BB] overflow-hidden">
        <div className="w-[360px] h-[610px] left-[12px] top-[130px] absolute bg-white rounded-3xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.30)] shadow-[0px_1px_3px_1px_rgba(0,0,0,0.15)]" />
        <div className="left-[155px] top-[65px] absolute text-center justify-start text-neutral-700 text-2xl font-normal font-['Do_Hyeon'] leading-[50px]">
          내 정보 관리
        </div>
        <button
          onClick={() => router.back()}
          className="left-[24px] top-[63px] absolute text-center justify-start text-neutral-700 text-2xl font-normal font-['Inter'] leading-[50px]"
        >
          &lt;
        </button>

        {/* 프로필 사진 영역 */}
        <div
          className="w-25 h-25 left-[32px] top-[163px] absolute bg-gray-200 rounded-full relative cursor-pointer overflow-hidden z-10"
          onClick={handleProfileClick}
        >
          {profileImage ? (
            <img
              src={profileImage}
              alt="프로필 이미지"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"
                  fill="#9CA3AF"
                />
              </svg>
            </div>
          )}
        </div>
        {/* 카메라 버튼 */}
        <button
          className="absolute left-[100px] top-[230px] w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md z-50"
          onClick={() => setShowProfileOptions(true)}
        >
          {/* 카메라 아이콘 */}
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="4"
              y="8"
              width="16"
              height="10"
              rx="2"
              stroke="#9CA3AF"
              strokeWidth="1.5"
              fill="white"
            />
            <circle
              cx="12"
              cy="13"
              r="3"
              stroke="#9CA3AF"
              strokeWidth="1.5"
              fill="white"
            />
            <rect x="9" y="6" width="6" height="2" rx="1" fill="#9CA3AF" />
            <circle cx="17" cy="10" r="0.7" fill="#9CA3AF" />
          </svg>
        </button>

        {/* 프로필 옵션 팝업 */}
        {showProfileOptions && (
          <div className="absolute left-[20px] top-20 w-32 bg-white rounded-lg shadow-lg z-10">
            {profileImage ? (
              <>
                <div
                  className="p-2 text-center text-sm font-['Do_Hyeon'] hover:bg-blue-50 cursor-pointer text-sky-400"
                  onClick={handleEditProfile}
                >
                  수정
                </div>
                <div
                  className="p-2 text-center text-sm font-['Do_Hyeon'] hover:bg-red-50 cursor-pointer text-rose-400"
                  onClick={handleDeleteProfile}
                >
                  삭제
                </div>
              </>
            ) : (
              <div
                className="p-2 text-center text-sm font-['Do_Hyeon'] hover:bg-green-50 cursor-pointer text-emerald-400"
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.click();
                  }
                }}
              >
                등록
              </div>
            )}
            <div
              className="p-2 text-center text-sm font-['Do_Hyeon'] hover:bg-gray-100 cursor-pointer text-gray-400"
              onClick={() => setShowProfileOptions(false)}
            >
              취소
            </div>
          </div>
        )}

        {/* 편집 옵션 팝업 */}
        {showEditOptions && (
          <div className="absolute left-[20px] top-20 w-32 bg-white rounded-lg shadow-lg z-10">
            <div
              className="p-2 text-center text-sm font-['Do_Hyeon'] hover:bg-blue-50 cursor-pointer text-sky-400"
              onClick={handleEditProfile}
            >
              수정
            </div>
            <div
              className="p-2 text-center text-sm font-['Do_Hyeon'] hover:bg-red-50 cursor-pointer text-rose-400"
              onClick={handleDeleteProfile}
            >
              삭제
            </div>
            <div
              className="p-2 text-center text-sm font-['Do_Hyeon'] hover:bg-gray-100 cursor-pointer text-gray-400"
              onClick={() => setShowEditOptions(false)}
            >
              취소
            </div>
          </div>
        )}

        {/* 숨겨진 파일 입력 */}
        <input
          aria-label="프로필 이미지 선택"
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />

        {/* 이름 입력란 */}
        <input
          placeholder="이름"
          aria-label="이름"
          type="text"
          value={userInfo.name}
          onChange={(e) =>
            setUserInfo((prev) => ({ ...prev, name: e.target.value }))
          }
          className="w-36 h-9 left-[209px] top-[184px] absolute bg-white rounded-lg border border-zinc-300 px-3 text-black text-base font-['Do_Hyeon'] focus:outline-none"
        />

        {/* 초대 코드 */}
        <div className="w-36 h-9 left-[209px] top-[235px] absolute bg-gray-200 rounded-lg border border-zinc-300 flex items-center justify-between px-2">
          <button
            onClick={copyInviteCode}
            className="w-6 h-6 cursor-pointer ml-auto"
          >
            {copySuccess ? (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M19 21H8V7H19V21ZM16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5Z"
                  fill="green"
                />
              </svg>
            ) : (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M19 21H8V7H19V21ZM16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5Z"
                  fill="#6366F1"
                />
              </svg>
            )}
          </button>
        </div>
        <div className="left-[158px] top-[178px] absolute text-center justify-start text-black text-base font-normal font-['Do_Hyeon'] leading-[50px]">
          이 름
        </div>
        <div className="left-[157px] top-[227px] absolute text-center justify-start text-black text-sm font-normal font-['Do_Hyeon'] leading-[50px]">
          초대코드
        </div>
        <div className="w-20 h-4 left-[221px] top-[227px] absolute text-center justify-start text-black text-base font-normal font-['Do_Hyeon'] leading-[50px]">
          {userInfo.invitation_code}
        </div>

        {/* 아이디 */}
        <div className="w-[250px] h-11 left-[30px] top-[308px] absolute flex items-center">
          <input
            placeholder="아이디"
            aria-label="아이디"
            type="text"
            value={isEditingId ? tempUserId : userInfo.username}
            onChange={handleIdChange}
            onClick={handleIdClick}
            onBlur={handleIdBlur}
            className="w-full h-full pl-4 text-left text-neutral-700 text-s font-normal font-['Do_Hyeon'] bg-transparent outline-none focus:border-sky-400 border-2 border-zinc-300 rounded-[10px]"
          />
        </div>
        <div className="w-24 h-5 left-[35px] top-[272px] absolute text-left justify-start text-neutral-700 text-sm font-normal font-['Do_Hyeon'] leading-[50px]">
          아이디
        </div>
        <button
          onClick={checkIdDuplicate}
          className="w-16 h-9 left-[290px] top-[305px] absolute bg-[#FFE999] hover:bg-[#FFD966] rounded-2xl transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center"
        >
          <span className="text-center text-[#333333] text-sm font-normal font-['Do_Hyeon']">
            중복확인
          </span>
        </button>

        {/* 비밀번호 */}
        <div className="w-[250px] h-11 left-[30px] top-[380px] absolute flex items-center">
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="********"
            className="w-full h-full pl-4 text-left text-neutral-700 text-s font-normal font-['Do_Hyeon'] bg-transparent outline-none focus:border-sky-400 border-2 border-zinc-300 rounded-[10px]"
          />
        </div>
        <div className="w-24 h-5 left-[35px] top-[344px] absolute text-left justify-start text-neutral-700 text-sm font-normal font-['Do_Hyeon'] leading-[50px]">
          비밀번호
        </div>
        <button
          onClick={() => setShowPasswordModal(true)}
          className="w-16 h-9 left-[290px] top-[384px] absolute bg-[#FFE999] hover:bg-[#FFD966] rounded-2xl transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center"
        >
          <span className="text-center text-[#333333] text-sm font-normal font-['Do_Hyeon']">
            변경하기
          </span>
        </button>

        {/* 비밀번호 변경 모달 */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-neutral-400/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-3xl p-6 w-80 relative">
              {/* 로고 */}
              <div className="flex justify-center mb-2">
                <div className="relative w-24 h-14">
                  <Image
                    src="/images/logo/누리달.png"
                    alt="누리달"
                    width={96}
                    height={96}
                  />
                </div>
              </div>

              {/* 모달 헤더 */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-['Do_Hyeon'] text-center flex-1">
                  비밀번호 변경
                </h3>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {/* 입력 필드들 */}
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => {
                      setCurrentPassword(e.target.value);
                      setPasswordError(""); // 입력 시 에러 메시지 초기화
                    }}
                    placeholder="현재 비밀번호"
                    className={`w-full px-4 py-2 rounded-full border-2 ${
                      passwordError ? "border-red-500" : "border-[#FFE999]"
                    } focus:outline-none focus:border-[#FFD966] text-sm font-['Do_Hyeon']`}
                  />
                  <div className="absolute right-4 top-2.5 text-yellow-400">
                    🔒
                  </div>
                  {passwordError && (
                    <p className="text-red-500 text-xs font-['Do_Hyeon'] mt-1 ml-2">
                      {passwordError}
                    </p>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="새 비밀번호"
                    className="w-full px-4 py-2 rounded-full border-2 border-[#FFE999] focus:outline-none focus:border-[#FFD966] text-sm font-['Do_Hyeon']"
                  />
                  <div className="absolute right-4 top-2.5 text-yellow-400">
                    ✨
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="새 비밀번호 확인"
                    className="w-full px-4 py-2 rounded-full border-2 border-[#FFE999] focus:outline-none focus:border-[#FFD966] text-sm font-['Do_Hyeon']"
                  />
                  <div className="absolute right-4 top-2.5 text-yellow-400">
                    ✅
                  </div>
                </div>
              </div>

              {/* 변경 버튼 */}
              <button
                onClick={handlePasswordChange}
                className="w-full mt-6 bg-[#FFE999] hover:bg-[#FFD966] text-black py-3 rounded-full transition-colors duration-300 font-['Do_Hyeon']"
              >
                비밀번호 변경하기
              </button>
            </div>
          </div>
        )}

        {/* 이메일 */}
        <div className="w-[250px] h-11 left-[30px] top-[452px] absolute bg-gray-200 rounded-[10px] border border-zinc-300" />
        <div className="w-28 h-5 left-[35px] top-[417px] absolute text-left justify-start text-neutral-700 text-sm font-normal font-['Do_Hyeon'] leading-[50px]">
          이메일
        </div>
        <div className="w-52 h-2 left-[45px] top-[450px] absolute text-left justify-start text-stone-500 text-s font-normal font-['Do_Hyeon'] leading-[50px]">
          {userInfo.email}
        </div>

        {/* 전화번호 */}
        <div
          className={`w-[250px] h-11 left-[30px] top-[524px] absolute rounded-[10px] border ${
            phoneDuplicate === true
              ? "bg-red-100 border-red-300"
              : phoneDuplicate === false
              ? "bg-green-100 border-green-300"
              : "bg-white border-zinc-300"
          }`}
        />
        <div className="w-24 h-5 left-[35px] top-[489px] absolute text-left justify-start text-neutral-700 text-sm font-normal font-['Do_Hyeon'] leading-[50px]">
          전화번호
        </div>
        {isEditingPhone ? (
          <div className="w-[250px] h-11 left-[30px] top-[524px] absolute flex items-center">
            <input
              type="text"
              value={tempPhoneNumber}
              onChange={handlePhoneChange}
              onBlur={handlePhoneBlur}
              className="w-full h-full pl-4 text-left text-neutral-700 text-s font-normal font-['Do_Hyeon'] bg-transparent outline-none focus:border-sky-400 border-2 border-zinc-300 rounded-[10px]"
              autoFocus
              maxLength={13}
              placeholder="010-0000-0000"
            />
          </div>
        ) : (
          <div
            className="w-52 h-11 left-[42px] top-[521px] absolute text-left justify-start text-black text-s font-normal font-['Do_Hyeon'] leading-[50px] cursor-pointer"
            onClick={handlePhoneClick}
          >
            {userInfo.phoneNumber.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3")}
          </div>
        )}
        <div
          data-property-1="Default"
          className="w-16 h-9 left-[300px] top-[505px] absolute"
          onClick={checkPhoneDuplicate}
        >
          <div className="w-16 h-9 left-[-10px] top-6 absolute bg-[#FFE999] rounded-2xl hover:bg-[#FFD966] transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center">
            <span className="text-center text-[#333333] text-sm font-normal font-['Do_Hyeon']">
              중복확인
            </span>
          </div>
        </div>

        {/* 주소 */}
        <div className="w-24 h-9 left-[35px] top-[560px] absolute text-left justify-start text-neutral-700 text-sm font-normal font-['Do_Hyeon'] leading-[50px]">
          주소
        </div>
        <div className="w-[250px] h-11 left-[30px] top-[596px] absolute bg-white rounded-[10px] border border-zinc-300 overflow-hidden">
          <div className="w-full h-full text-left justify-start text-neutral-900 text-m font-normal font-['Do_Hyeon'] leading-[48px] pl-3">
            {address}
          </div>
        </div>
        <div
          data-property-1="Default"
          className="w-16 h-9 left-[295px] top-[577px] absolute"
        >
          <div className="w-16 h-9 left-[-5px] top-6 absolute bg-[#FFE999] rounded-2xl hover:bg-[#FFD966] transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center">
            <span
              className="text-center text-[#333333] text-sm font-normal font-['Do_Hyeon'] cursor-pointer"
              onClick={handleAddressSearch}
            >
              검색
            </span>
          </div>
        </div>

        {/* Center the text inside the edit button and navigate back to @page.tsx on click */}
        <button
          onClick={handleSaveChanges}
          className="w-35 h-10 left-[50%] transform -translate-x-1/2 top-[670px] absolute bg-blue-300 rounded-full flex items-center justify-center text-white text-m font-normal font-['Do_Hyeon'] leading-[50px] cursor-pointer z-10"
        >
          수정
        </button>

        {/* 탈퇴하기 */}
        <div
          className="w-36 h-6 left-[120px] top-[740px] absolute text-center justify-start text-neutral-400/60 text-base font-normal font-['Do_Hyeon'] leading-[50px] cursor-pointer z-10"
          onClick={() => setShowDeleteModal(true)}
        >
          탈퇴하기
        </div>

        {showDeleteModal && (
          <div className="fixed inset-0 bg-neutral-400/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-3xl p-6 w-80 relative">
              <h3 className="text-xl font-['Do_Hyeon'] text-center mb-4">
                정말 탈퇴하시겠어요?
              </h3>
              <p className="text-center font-['Do_Hyeon'] text-sm mb-6">
                탈퇴 버튼 선택 시, 계정 및 정보는 삭제되며 복구되지 않습니다.
              </p>
              <div className="flex justify-around">
                <button
                  onClick={handleDeleteAccount}
                  className="bg-red-400 text-white py-3 px-6 rounded-full font-['Do_Hyeon']"
                >
                  탈퇴
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="bg-gray-300 text-black py-3 px-6 rounded-full font-['Do_Hyeon']"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 하단 네비게이션 바 */}
        <div className="absolute bottom-0 w-full">
          <div className="w-[462px] h-52 relative">
            {/* 채팅 아이콘 */}
            <svg
              className="w-8 h-8 left-[52.71px] top-[786px] absolute"
              fill="none"
              stroke="#979595"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>

            {/* 캘린더 아이콘 */}
            <svg
              className="w-8 h-8 left-[140.75px] top-[787.34px] absolute"
              fill="none"
              stroke="#979595"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>

            {/* 위치 아이콘 */}
            <svg
              className="w-8 h-8 left-[222px] top-[784px] absolute"
              fill="none"
              stroke="#979595"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>

            {/* 마이페이지 아이콘 */}
            <svg
              className="w-8 h-8 left-[323.75px] top-[787px] absolute"
              fill="none"
              stroke="#FDB813"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>

            {/* 네비게이션 텍스트 */}
            <div className="w-20 h-16 left-[25px] top-[803px] absolute text-center justify-start text-[#979595] text-xs font-normal font-['Do_Hyeon'] leading-[50px]">
              채팅
            </div>
            <div className="w-9 h-8 left-[138px] top-[803px] absolute text-center justify-start text-[#979595] text-xs font-normal font-['Do_Hyeon'] leading-[50px]">
              캘린더
            </div>
            <div className="w-20 h-10 left-[201px] top-[802.60px] absolute text-center justify-start text-[#979595] text-xs font-normal font-['Do_Hyeon'] leading-[50px]">
              위치
            </div>
            <div className="w-20 h-10 left-[293px] top-[802.60px] absolute text-center justify-start text-yellow-400 text-xs font-normal font-['Do_Hyeon'] leading-[50px]">
              마이페이지
            </div>
          </div>
        </div>

        <div className="left-[20px] top-[180px] absolute w-[90%]">
          {/* Profile image and address content adjusted downwards */}
          <div className="text-neutral-700 text-sm font-normal font-['Do_Hyeon'] leading-[30px]">
            {/* Content goes here */}
          </div>
        </div>
      </div>
    </div>
  );
}
