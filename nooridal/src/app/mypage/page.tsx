"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useProfile } from "@/app/context/ProfileContext";
import { useState, useEffect } from "react";
import TabBar from "../components/TabBar";
import { supabase } from "../../utils/supabase"; // Adjust the import path as needed
import HeaderBar from "../components/HeaderBar";

type Tab = "chat" | "calendar" | "location" | "mypage";

export default function MyPage() {
  const router = useRouter();
  const { profileImage } = useProfile();
  const [showImageModal, setShowImageModal] = useState(false);
  const [name, setName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [pregnancyInfo, setPregnancyInfo] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState("mypage");
  const [babyName, setBabyName] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [weeks, setWeeks] = useState("");
  const [highRisk, setHighRisk] = useState(false);
  const [babyGender, setBabyGender] = useState("");
  const [username, setUsername] = useState<string | null>(null);
  const [invitationCode, setInvitationCode] = useState<string | null>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserInfo = async () => {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();
      if (sessionError) {
        console.error("세션 정보를 가져오는데 실패했습니다:", sessionError);
        return;
      }
      const user = sessionData?.session?.user;
      if (user) {
        setEmail(user.email || null);
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("name, username, invitation_code, user_type")
          .eq("id", user.id)
          .maybeSingle();
        if (userData) {
          setName(userData.name);
          setUsername(userData.username);
          setInvitationCode(userData.invitation_code);
          setUserType(userData.user_type || null);
        }
      }
    };
    fetchUserInfo();
  }, []);

  useEffect(() => {
    const sessionPregnancyInfo = sessionStorage.getItem("pregnancy_info");
    if (sessionPregnancyInfo) {
      try {
        const parsed = JSON.parse(sessionPregnancyInfo);
        setPregnancyInfo(parsed);
        setBabyName(parsed.baby_name || "");
        setDueDate(parsed.due_date || "");
        setWeeks(parsed.current_week || "");
        setHighRisk(parsed.high_risk || false);
        setBabyGender(parsed.baby_gender || "");
      } catch (e) {
        console.error("세션스토리지 임신정보 파싱 오류:", e);
      }
    } else {
      // Supabase에서 임신정보 로드 (기존 로직)
      const fetchPregnancyInfo = async () => {
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();
        if (sessionError) {
          console.error("세션 정보를 가져오는데 실패했습니다:", sessionError);
          return;
        }
        const user = sessionData?.session?.user;
        if (user) {
          const { data: pregnancyData, error: pregnancyError } = await supabase
            .from("pregnancies")
            .select("baby_name, due_date, current_week, high_risk, baby_gender")
            .eq("user_id", user.id)
            .maybeSingle();
          if (pregnancyError) {
            console.error(
              "임신 정보를 가져오는 중 오류 발생:",
              pregnancyError.message
            );
          } else if (pregnancyData) {
            setPregnancyInfo(pregnancyData);
            setBabyName(pregnancyData.baby_name || "");
            setDueDate(pregnancyData.due_date || "");
            setWeeks(pregnancyData.current_week || "");
            setHighRisk(pregnancyData.high_risk || false);
            setBabyGender(pregnancyData.baby_gender || "");
          }
        }
      };
      fetchPregnancyInfo();
    }
  }, []);

  useEffect(() => {
    setActiveTab("mypage");
  }, []);

  const handleLogout = () => {
    // 로그아웃 시 임신정보 세션스토리지 삭제
    sessionStorage.removeItem("pregnancy_info");
    router.push("/login");
  };

  const handleProfileManagement = () => {
    router.push("/mypage/profile");
  };

  const handlePregnancyInfoManagement = async () => {
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();
    if (sessionError) {
      console.error("Error fetching user session:", sessionError);
      return;
    }

    const user = sessionData?.session?.user;
    if (!user) {
      console.error("User not logged in");
      return;
    }

    const { data: pregnancyData, error: pregnancyError } = await supabase
      .from("pregnancies")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (pregnancyError) {
      console.error("Error fetching pregnancy info:", pregnancyError.message);
    } else {
      console.log("Pregnancy info fetched successfully:", pregnancyData);
      setPregnancyInfo(pregnancyData);
    }

    router.push("/mypage/pregnancy-info");
  };

  const handleRegisterPregnancyInfo = () => {
    router.push("/register/pregnant/pregnancy-info");
  };

  const handleFAQ = () => {
    router.push("/mypage/faq");
  };

  const handleAppInfo = () => {
    router.push("/mypage/app-info");
  };

  const handleProfileImageClick = () => {
    if (profileImage) {
      setShowImageModal(true);
    }
  };

  const closeImageModal = () => {
    setShowImageModal(false);
  };

  const handleTabClick = (tab: string) => {
    setActiveTab(tab as Tab);
    if (tab === "chat") {
      router.push("/agent");
    } else if (tab === "calendar") {
      router.push("/calendar");
    } else if (tab === "location") {
      router.push("/location");
    } else if (tab === "mypage") {
      router.push("/mypage");
    }
  };

  const createPregnancy = async () => {
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();
    if (sessionError) {
      console.error("Error fetching user session:", sessionError);
      return;
    }

    const user = sessionData?.session?.user;
    if (!user) {
      console.error("User not logged in");
      return;
    }

    const newPregnancy = {
      baby_name: babyName,
      due_date: new Date(dueDate).toISOString().split("T")[0],
      current_week: weeks,
      high_risk: highRisk,
      baby_gender: babyGender,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: user.id,
      guardian_id: user.id,
      status: "active" as const,
    };

    const { data, error } = await supabase
      .from("pregnancies")
      .insert([newPregnancy]);
    if (error) {
      console.error("Error creating pregnancy:", error);
    } else {
      console.log("Pregnancy created successfully:", data);
    }
  };

  if (userType === null) return null;

  return (
    <div className="min-h-screen w-full bg-[#FFF4BB] flex flex-col items-center">
      {/* 헤더 */}
      <HeaderBar title="마이페이지" showBackButton={false} />
      <main className="w-full max-w-md h-[874px] relative bg-[#FFF4BB] overflow-hidden sm:w-96 md:w-[420px] lg:w-[480px] xl:w-[520px]">
        {/* 프로필 섹션 */}
        <div className="w-[360px] h-[270px] mx-auto pt-3 mt-8 bg-white rounded-3xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.30)] shadow-[0px_1px_3px_1px_rgba(0,0,0,0.15)]">
          {/* 프로필 원 */}
          <div className="w-24 h-24 bg-gray-200 rounded-full overflow-hidden ml-5">
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

          {/* 사용자 정보 */}
          <div className="text-center mt-[-74px] ml-9">
            <div className="flex items-center justify-center">
              <div className="text-neutral-700 text-xl font-normal font-['Do_Hyeon'] ml-6">
                {name || ""}
              </div>
              {pregnancyInfo?.high_risk && (
                <div className="ml-10 bg-red-500 text-white text-xs font-['Do_Hyeon'] px-2 py-1 rounded-full">
                  고위험
                </div>
              )}
            </div>
            <div className="text-stone-500 text-m font-normal font-['Do_Hyeon'] mt-1 ml-[20px]">
              {email || ""}
            </div>
          </div>

          {/* 임신 정보 */}
          {pregnancyInfo ? (
            <div className={`w-full px-6 mt-10`}>
              <div className="w-full h-full bg-yellow-100 rounded-2xl flex items-center justify-center p-4">
                <span className="text-black text-lg font-normal font-['Do_Hyeon']">
                  🍼 {pregnancyInfo?.baby_name || "사랑스러운 아기"} 세상에
                  나오기
                  {pregnancyInfo?.due_date
                    ? ` D-${Math.ceil(
                        (new Date(pregnancyInfo.due_date).setHours(0, 0, 0, 0) -
                          new Date().setHours(0, 0, 0, 0)) /
                          (1000 * 60 * 60 * 24)
                      )}일`
                    : "비밀"}
                  🐥
                </span>
              </div>
              <div className="text-black text-sm font-normal font-['Do_Hyeon'] mt-1 text-center">
                출산 예정일: {pregnancyInfo.due_date}
              </div>
              <div className="flex items-center mt-4">
                <div className="w-full h-2 bg-gray-200 rounded-full relative">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{
                      width: `${(pregnancyInfo.current_week / 40) * 100}%`,
                    }}
                  ></div>
                  <div
                    className="absolute -top-6 text-blue-500"
                    style={{
                      left: `calc(${
                        (pregnancyInfo.current_week / 40) * 100
                      }% - 8px)`,
                    }}
                  >
                    <svg
                      className="w-4 h-4 inline-block"
                      fill="#1A237E"
                      stroke="#1A237E"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                      />
                      <circle cx="12" cy="9" r="2.5" />
                    </svg>
                    <div className="flex items-center justify-center text-center text-s font-['Do_Hyeon'] mt-2">
                      <span>{pregnancyInfo.current_week}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className={`w-full px-6 mt-10`}>
              <div className="w-full h-full bg-yellow-100 rounded-2xl flex items-center justify-center p-4">
                <span className="text-black text-m font-normal font-['Do_Hyeon']">
                  아래 버튼을 눌러 임신정보 등록을 해주세요 ❣️
                </span>
              </div>
              <button
                onClick={handleRegisterPregnancyInfo}
                className="mt-6 px-4 py-2 bg-yellow-400 text-white rounded-full font-['Do_Hyeon'] hover:bg-yellow-600 transition-colors mx-auto block"
              >
                임신 정보 등록하기
              </button>
            </div>
          )}
        </div>

        {/* 메뉴 섹션 */}
        <div className="w-full max-w-[360px] mx-auto mt-4 bg-white rounded-3xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.30)] shadow-[0px_1px_3px_1px_rgba(0,0,0,0.15)] p-6">
          <div className="grid grid-cols-2 gap-y-8 gap-x-2">
            {userType === "guardian" ? (
              <>
                {/* 내 정보 관리 - 사람 아이콘 (파랑) */}
                <div
                  className="flex flex-col items-center cursor-pointer"
                  onClick={handleProfileManagement}
                >
                  <svg
                    className="w-8 h-8 text-blue-400 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="8" r="4" strokeWidth="2" />
                    <path d="M4 20c0-4 4-7 8-7s8 3 8 7" strokeWidth="2" />
                  </svg>
                  <span className="text-xs text-neutral-700 font-['Do_Hyeon'] mt-1">
                    내 정보 관리
                  </span>
                </div>
                {/* 자주 찾는 질문 - 동그라미 안에 물음표 아이콘 (노랑) */}
                <div
                  className="flex flex-col items-center cursor-pointer"
                  onClick={handleFAQ}
                >
                  <svg
                    className="w-8 h-8 text-yellow-400 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="12" r="10" strokeWidth="2" />
                    <text
                      x="12"
                      y="16"
                      textAnchor="middle"
                      fontSize="12"
                      fill="#FACC15"
                      fontFamily="Arial"
                      dominantBaseline="middle"
                    >
                      ?
                    </text>
                  </svg>
                  <span className="text-xs text-neutral-700 font-['Do_Hyeon'] mt-1">
                    자주 찾는 질문
                  </span>
                </div>
                {/* 앱 정보 - 환경설정(톱니바퀴) 아이콘 (초록) */}
                <div
                  className="flex flex-col items-center cursor-pointer"
                  onClick={handleAppInfo}
                >
                  <svg
                    className="w-8 h-8 text-green-400 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="12" r="3" strokeWidth="2" />
                    <path
                      d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.09a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
                      strokeWidth="2"
                    />
                  </svg>
                  <span className="text-xs text-neutral-700 font-['Do_Hyeon'] mt-1">
                    앱 정보
                  </span>
                </div>
                {/* 로그아웃 - 나가는 문 아이콘 */}
                <div
                  className="flex flex-col items-center cursor-pointer"
                  onClick={handleLogout}
                >
                  <svg
                    className="w-8 h-8 text-gray-400 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M16 17v1a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v1"
                      strokeWidth="2"
                    />
                    <path d="M21 12H9" strokeWidth="2" />
                    <path d="M18 15l3-3-3-3" strokeWidth="2" />
                  </svg>
                  <span className="text-xs text-neutral-700 font-['Do_Hyeon'] mt-1">
                    로그아웃
                  </span>
                </div>
              </>
            ) : (
              <>
                {/* 내 정보 관리 - 사람 아이콘 (파랑) */}
                <div
                  className="flex flex-col items-center cursor-pointer"
                  onClick={handleProfileManagement}
                >
                  <svg
                    className="w-8 h-8 text-blue-400 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="8" r="4" strokeWidth="2" />
                    <path d="M4 20c0-4 4-7 8-7s8 3 8 7" strokeWidth="2" />
                  </svg>
                  <span className="text-xs text-neutral-700 font-['Do_Hyeon'] mt-1">
                    내 정보 관리
                  </span>
                </div>
                {/* 임신 정보 관리 - 동그란 하트 아이콘 (연핑크) */}
                <div
                  className="flex flex-col items-center cursor-pointer"
                  onClick={handlePregnancyInfoManagement}
                >
                  <svg
                    className="w-8 h-8 text-red-300 mb-2"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      d="M12 21s-5.5-4.5-7.5-7.5C2.5 10.5 4.5 7 8 7c1.7 0 3 1.2 4 2.5C13 8.2 14.3 7 16 7c3.5 0 5.5 3.5 3.5 6.5C17.5 16.5 12 21 12 21z"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="#FCA5A5"
                    />
                  </svg>
                  <span className="text-xs text-neutral-700 font-['Do_Hyeon'] mt-1">
                    임신 정보 관리
                  </span>
                </div>
                {/* 자주 찾는 질문 - 동그라미 안에 물음표 아이콘 (노랑) */}
                <div
                  className="flex flex-col items-center cursor-pointer"
                  onClick={handleFAQ}
                >
                  <svg
                    className="w-8 h-8 text-yellow-400 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="12" r="10" strokeWidth="2" />
                    <text
                      x="12"
                      y="16"
                      textAnchor="middle"
                      fontSize="12"
                      fill="#FACC15"
                      fontFamily="Arial"
                      dominantBaseline="middle"
                    >
                      ?
                    </text>
                  </svg>
                  <span className="text-xs text-neutral-700 font-['Do_Hyeon'] mt-1">
                    자주 찾는 질문
                  </span>
                </div>
                {/* 앱 정보 - 환경설정(톱니바퀴) 아이콘 (초록) */}
                <div
                  className="flex flex-col items-center cursor-pointer"
                  onClick={handleAppInfo}
                >
                  <svg
                    className="w-8 h-8 text-green-400 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="12" r="3" strokeWidth="2" />
                    <path
                      d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.09a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
                      strokeWidth="2"
                    />
                  </svg>
                  <span className="text-xs text-neutral-700 font-['Do_Hyeon'] mt-1">
                    앱 정보
                  </span>
                </div>
                {/* 로그아웃 - 나가는 문 아이콘 */}
                <div
                  className="flex flex-col items-center cursor-pointer"
                  onClick={handleLogout}
                >
                  <svg
                    className="w-8 h-8 text-gray-400 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M16 17v1a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v1"
                      strokeWidth="2"
                    />
                    <path d="M21 12H9" strokeWidth="2" />
                    <path d="M18 15l3-3-3-3" strokeWidth="2" />
                  </svg>
                  <span className="text-xs text-neutral-700 font-['Do_Hyeon'] mt-1">
                    로그아웃
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
      <TabBar
        activeTab={activeTab as Tab}
        tabs={["chat", "calendar", "location", "mypage"] as Tab[]}
        onTabClick={handleTabClick}
      />

      {showImageModal && profileImage && (
        <div
          className="fixed z-50"
          style={{
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <div className="relative bg-white rounded-lg p-4 shadow-xl max-w-[300px] max-h-[300px]">
            <img
              src={profileImage}
              alt="프로필 이미지 전체보기"
              className="w-full h-full object-contain rounded-lg"
            />
            <button
              className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md"
              onClick={closeImageModal}
              aria-label="이미지 닫기"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18 6L6 18M6 6L18 18"
                  stroke="black"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
