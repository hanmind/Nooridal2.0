"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useProfile } from "@/app/context/ProfileContext";
import { useState, useEffect } from "react";
import TabBar from "../components/TabBar";
import { supabase } from "../../utils/supabase"; // Adjust the import path as needed

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
          .select("name, username, invitation_code")
          .eq("id", user.id)
          .maybeSingle();

        if (userError) {
          console.error("사용자 정보를 가져오는데 실패했습니다:", userError);
        } else if (userData) {
          setName(userData.name);
          setUsername(userData.username);
          setInvitationCode(userData.invitation_code);

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
            console.log("임신 정보 가져오기 성공:", pregnancyData);
            setPregnancyInfo(pregnancyData);
            setBabyName(pregnancyData.baby_name || "");
            setDueDate(pregnancyData.due_date || "");
            setWeeks(pregnancyData.current_week || "");
            setHighRisk(pregnancyData.high_risk || false);
            setBabyGender(pregnancyData.baby_gender || "");
          }
        }
      }
    };

    fetchUserInfo();
  }, []);

  useEffect(() => {
    setActiveTab("mypage");
  }, []);

  const handleLogout = () => {
    // 로그아웃 처리 로직
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
    setActiveTab(tab);
    if (tab === "chat") {
      window.location.href = "/chat";
    } else if (tab === "calendar") {
      window.location.href = "/calendar";
    } else if (tab === "location") {
      window.location.href = "/location";
    } else if (tab === "mypage") {
      window.location.href = "/mypage";
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

  return (
    <div className="min-h-screen w-full bg-[#FFF4BB] flex justify-center items-center">
      <div className="w-full max-w-[1080px] h-[900px] relative bg-[#FFF4BB] overflow-hidden">
        {/* 헤더 */}
        <div className="w-full h-[140px] flex items-center justify-center bg-white shadow-md rounded-b-3xl relative mt-[-10px]">
          <div className="absolute inset-x-0 top-[75px] flex items-center justify-center">
            <div className="text-center text-neutral-700 text-2xl font-normal font-['Do_Hyeon'] leading-[50px]">
              마이페이지
            </div>
          </div>
        </div>

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
              <div className="text-neutral-700 text-xl font-normal font-['Do_Hyeon']">
                {name || ""}
              </div>
              {pregnancyInfo?.high_risk && (
                <div className="ml-10 bg-red-500 text-white text-xs font-['Do_Hyeon'] px-2 py-1 rounded-full">
                  고위험
                </div>
              )}
            </div>
            <div className="text-stone-500 text-m font-normal font-['Do_Hyeon'] mt-1 ml-4">
              {email || ""}
            </div>
          </div>

          {/* 임신 정보 */}
          {pregnancyInfo ? (
            <div className="w-full px-6 mt-9">
              <div className="w-full h-full bg-yellow-100 rounded-2xl flex items-center justify-center p-4">
                <span className="text-black text-lg font-normal font-['Do_Hyeon']">
                  🍼 {pregnancyInfo?.baby_name || "사랑스러운 아기"} 세상에 나오기
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
                      fill="currentColor"
                      stroke="currentColor"
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
                      <span>{pregnancyInfo.current_week}주차</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full px-6 mt-10">
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
        <div className="w-full max-w-[360px] h-62 mx-auto mt-8 bg-white rounded-3xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.30)] shadow-[0px_1px_3px_1px_rgba(0,0,0,0.15)]">
          {/* 내 정보 관리 */}
          <div
            onClick={handleProfileManagement}
            className="w-full flex items-center justify-between px-4 py-3 border-b border-stone-300 cursor-pointer hover:bg-stone-50 transition-colors"
          >
            <div className="flex items-center">
              <svg
                className="w-6 h-6 mr-3"
                fill="none"
                stroke="currentColor"
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
              <div className="text-black text-base font-['Do_Hyeon'] leading-[35px]">
                내 정보 관리
              </div>
            </div>
            <div className="text-stone-300 text-xl font-['Inter'] leading-[35px]">
              &gt;
            </div>
          </div>

          {/* 임신 정보 관리 */}
          <div
            onClick={handlePregnancyInfoManagement}
            className="w-full flex items-center justify-between px-4 py-3 border-b border-stone-300 cursor-pointer hover:bg-stone-50 transition-colors"
          >
            <div className="flex items-center">
              <svg
                className="w-6 h-6 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <div className="text-black text-base font-['Do_Hyeon'] leading-[35px]">
                임신 정보 관리
              </div>
            </div>
            <div className="text-stone-300 text-xl font-['Inter'] leading-[35px]">
              &gt;
            </div>
          </div>

          {/* 자주 찾는 질문 */}
          <div
            onClick={handleFAQ}
            className="w-full flex items-center justify-between px-4 py-3 border-b border-stone-300 cursor-pointer hover:bg-stone-50 transition-colors"
          >
            <div className="flex items-center">
              <svg
                className="w-6 h-6 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="text-black text-base font-['Do_Hyeon'] leading-[35px]">
                자주 찾는 질문
              </div>
            </div>
            <div className="text-stone-300 text-xl font-['Inter'] leading-[35px]">
              &gt;
            </div>
          </div>

          {/* 앱 정보 */}
          <div
            onClick={handleAppInfo}
            className="w-full flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-stone-50 transition-colors"
          >
            <div className="flex items-center">
              <svg
                className="w-6 h-6 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="text-black text-base font-['Do_Hyeon'] leading-[35px]">
                앱 정보
              </div>
            </div>
            <div className="text-stone-300 text-xl font-['Inter'] leading-[35px]">
              &gt;
            </div>
          </div>
        </div>

        {/* 로그아웃 버튼 */}
        <button
          onClick={handleLogout}
          className="absolute left-1/2 transform -translate-x-1/2 top-[720px] text-center text-gray-500 text-base font-normal font-['Do_Hyeon'] leading-[50px] w-full"
        >
          로그아웃
        </button>
      </div>
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
