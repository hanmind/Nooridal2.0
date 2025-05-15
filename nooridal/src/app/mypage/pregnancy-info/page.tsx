"use client";

import { useRouter } from "next/navigation";
import { useState, ChangeEvent, useEffect } from "react";
import Image from "next/image";
import { supabase } from "../../lib/supabase";

interface FormData {
  babyName: string;
  gender: "남자" | "여자" | "모름" | "";
  pregnancyWeek: string;
  dueDate: string;
  isHighRisk: boolean;
  daysUntilBirth?: number;
}

export default function PregnancyInfo() {
  const router = useRouter();
  const [isWeekSelectorOpen, setIsWeekSelectorOpen] = useState<boolean>(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [tempBabyName, setTempBabyName] = useState<string>("");
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    babyName: "",
    gender: "",
    pregnancyWeek: "*",
    dueDate: "",
    isHighRisk: true,
    daysUntilBirth: undefined,
  });

  const weeks: number[] = Array.from({ length: 40 }, (_, i) => i + 1);

  // 임신 주차에 따른 출산 예정일 계산
  const calculateDueDate = (week: number): string => {
    const today = new Date();
    const pregnancyStart = new Date(today);
    const weeksInMilliseconds = (week - 1) * 7 * 24 * 60 * 60 * 1000;
    pregnancyStart.setTime(today.getTime() - weeksInMilliseconds);

    const dueDate = new Date(pregnancyStart);
    dueDate.setDate(pregnancyStart.getDate() + 280); // 40주 = 280일

    return dueDate.toISOString().split("T")[0];
  };

  // 출산 예정일에 따른 임신 주차 계산
  const calculatePregnancyWeek = (dueDate: string): number => {
    const today = new Date();
    const due = new Date(dueDate);
    const pregnancyStart = new Date(due);
    pregnancyStart.setDate(due.getDate() - 280); // 40주 = 280일

    const diffTime = today.getTime() - pregnancyStart.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const currentWeek = Math.floor(diffDays / 7) + 1;

    return Math.min(Math.max(1, currentWeek), 40); // 1주에서 40주 사이로 제한
  };

  // 출산까지 남은 일수 계산
  const calculateDaysUntilBirth = (dueDate: string): number => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  useEffect(() => {
    const fetchPregnancyInfo = async () => {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();
      if (sessionError) {
        console.error("사용자 세션을 가져오는 중 오류 발생:", sessionError);
        return;
      }

      const user = sessionData?.session?.user;
      if (user) {
        console.log("Fetching pregnancy info for user:", user.id);
        const { data: pregnancyData, error: pregnancyError } = await supabase
          .from("pregnancies")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (pregnancyError) {
          console.error(
            "임신 정보를 가져오는 중 오류 발생:",
            pregnancyError.message
          );
        } else {
          console.log("임신 정보가 성공적으로 가져와졌습니다:", pregnancyData);
          if (pregnancyData) {
            const daysUntilBirth = calculateDaysUntilBirth(
              pregnancyData.due_date || ""
            );
            const babyName = pregnancyData.baby_name || "";
            setTempBabyName(babyName);
            setFormData({
              babyName: babyName,
              gender:
                (pregnancyData.baby_gender as "남자" | "여자" | "모름") || "",
              pregnancyWeek: (pregnancyData.current_week || 1).toString(),
              dueDate:
                pregnancyData.due_date ||
                new Date().toISOString().split("T")[0],
              isHighRisk: pregnancyData.high_risk || false,
              daysUntilBirth: daysUntilBirth,
            });
          }
        }
      }
    };

    fetchPregnancyInfo();
  }, []);

  useEffect(() => {
    const fetchProfileImage = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) throw new Error("사용자 정보를 찾을 수 없습니다.");

        const { data: userData, error: fetchError } = await supabase
          .from("users")
          .select("profile_image")
          .eq("id", user.id)
          .single();

        if (fetchError) throw fetchError;
        setProfileImage(userData?.profile_image || null);
      } catch (error) {
        console.error("프로필 이미지를 가져오는 중 오류 발생:", error);
      }
    };

    fetchProfileImage();
  }, []);

  // 임신 주차 변경 핸들러
  const handleWeekChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedWeek = e.target.value;
    if (selectedWeek && selectedWeek !== "") {
      const calculatedDueDate = calculateDueDate(parseInt(selectedWeek));
      const daysUntil = calculateDaysUntilBirth(calculatedDueDate);
      setFormData((prev) => ({
        ...prev,
        pregnancyWeek: selectedWeek,
        dueDate: calculatedDueDate,
        daysUntilBirth: daysUntil,
      }));
    }
    setIsWeekSelectorOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      const user = sessionData?.session?.user;
      if (user) {
        console.log("Updating pregnancy info for user:", user.id);
        const { error: updateError } = await supabase
          .from("pregnancies")
          .update({
            baby_gender: formData.gender,
            baby_name: tempBabyName,
            current_week: formData.pregnancyWeek,
            due_date: formData.dueDate,
            high_risk: formData.isHighRisk,
          })
          .eq("user_id", user.id);

        if (updateError) throw updateError;

        setFormData((prev) => ({
          ...prev,
          babyName: tempBabyName,
        }));

        console.log("임신 정보가 성공적으로 업데이트되었습니다.");
        alert("임신 정보가 성공적으로 저장되었습니다.");
        router.push("/mypage");
      }
    } catch (error) {
      console.error(
        "임신 정보를 업데이트하는 중 오류 발생:",
        (error as Error).message
      );
      alert("임신 정보 저장에 실패했습니다. 다시 시도해주세요.");
    }
  };

  // 오늘 날짜 기준 최소/최대 선택 가능 날짜 계산
  // const today = new Date(); // Linter: unused
  // const minDate = new Date(today); // Linter: unused
  // minDate.setDate(today.getDate()); // 오늘부터 선택 가능
  // const maxDate = new Date(today); // Linter: unused

  // 달력에 표시할 날짜 생성
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days = [];

    // 이전 달의 마지막 날짜들
    const prevMonthLastDate = new Date(year, month, 0).getDate();
    const firstDayOfWeek = firstDay.getDay();

    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDate - i),
        isCurrentMonth: false,
      });
    }

    // 현재 달의 날짜들
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    // 다음 달의 시작 날짜들
    const remainingDays = 42 - days.length; // 6주 달력을 위해
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return days;
  };

  // 달력 헤더의 년월 포맷
  const formatYearMonth = (date: Date) => {
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
  };

  // 이전/다음 달 이동
  const changeMonth = (offset: number) => {
    const newDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + offset,
      1
    );
    setCurrentMonth(newDate);
  };

  // 날짜 선택 핸들러
  const handleDateSelect = (date: Date) => {
    const selectedDate = date.toISOString().split("T")[0];
    const calculatedWeek = calculatePregnancyWeek(selectedDate);
    const daysUntil = calculateDaysUntilBirth(selectedDate);
    setFormData((prev) => ({
      ...prev,
      dueDate: selectedDate,
      pregnancyWeek: calculatedWeek.toString(),
      daysUntilBirth: daysUntil,
    }));
    setShowCalendar(false);
  };

  return (
    <div className="min-h-screen w-full flex justify-center items-center px-2 sm:px-4 md:px-8 bg-white">
      <main className="w-full max-w-md min-h-screen relative bg-white overflow-hidden sm:w-96 md:w-[420px] lg:w-[480px] xl:w-[520px]">
        {/* 헤더 */}
        <div className="w-full h-[100px] sm:h-[120px] flex items-center justify-center bg-white shadow-md rounded-b-3xl px-2 sm:px-4 relative">
          <button
            onClick={() => router.back()}
            className="absolute left-10 text-yellow-600 hover:text-yellow-800"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h1 className="text-xl sm:text-2xl text-neutral-700 font-['Do_Hyeon']">
            {formData.babyName
              ? `${formData.babyName} 엄마의 임신 정보`
              : "엄마의 임신 정보"}
          </h1>
        </div>

        {/* 임신 정보 카드 */}
        <div className="w-full h-[calc(100vh-140px)] sm:h-[calc(100vh-180px)] bg-yellow-50 overflow-y-auto">
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center justify-between">
                <label className="text-gray-600 font-['Do_Hyeon'] text-lg">
                  태명
                </label>
                <input
                  type="text"
                  value={tempBabyName}
                  onChange={(e) => setTempBabyName(e.target.value)}
                  className={`w-40 px-4 py-2 border-2 rounded-[20px] font-['Do_Hyeon'] bg-white focus:outline-none transition-colors duration-300 border-[#E5E7EB]`}
                  placeholder="태명을 입력하세요"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-gray-600 font-['Do_Hyeon'] text-lg">
                  성별
                </label>
                <div className="flex space-x-1">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, gender: "남자" })}
                    className={`px-3 py-1.5 rounded-full font-['Do_Hyeon'] transition-all duration-300 ease-in-out outline-none
                      ${
                        formData.gender === "남자"
                          ? "bg-sky-200 text-gray-700 border-2 border-sky-200"
                          : "bg-white border-2 border-gray-200 text-gray-600 hover:bg-sky-50"
                      }`}
                  >
                    남아
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, gender: "여자" })}
                    className={`px-3 py-1.5 rounded-full font-['Do_Hyeon'] transition-all duration-300 ease-in-out outline-none
                      ${
                        formData.gender === "여자"
                          ? "bg-red-200 text-gray-700 border-2 border-red-200"
                          : "bg-white border-2 border-gray-200 text-gray-600 hover:bg-sky-50"
                      }`}
                  >
                    여아
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, gender: "모름" })}
                    className={`px-3 py-1.5 rounded-full font-['Do_Hyeon'] transition-all duration-300 ease-in-out outline-none
                      ${
                        formData.gender === "모름"
                          ? "bg-gray-200 text-gray-700 border-2 border-gray-200"
                          : "bg-white border-2 border-gray-200 text-gray-600 hover:bg-sky-50"
                      }`}
                  >
                    모름
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-gray-600 font-['Do_Hyeon'] text-lg">
                  현재 임신 주차
                </label>
                <div className="relative w-40">
                  <button
                    type="button"
                    onClick={() => setIsWeekSelectorOpen(!isWeekSelectorOpen)}
                    className={`w-full px-4 py-2 border-2 rounded-[20px] font-['Do_Hyeon'] bg-white text-left flex justify-between items-center transition-colors duration-300 border-[#E5E7EB]`}
                  >
                    <span>
                      {formData.pregnancyWeek !== "*"
                        ? `${formData.pregnancyWeek}주차`
                        : "선택"}
                    </span>
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  {isWeekSelectorOpen && (
                    <div className="absolute top-12 left-0 w-full bg-white border-2 border-sky-200 rounded-xl shadow-lg z-50 max-h-40 overflow-y-auto">
                      <div className="py-1">
                        {weeks.map((week) => (
                          <button
                            key={week}
                            type="button"
                            onClick={() => {
                              const e = { target: { value: week.toString() } };
                              handleWeekChange(
                                e as ChangeEvent<HTMLSelectElement>
                              );
                            }}
                            className={`w-full px-4 py-2 text-left font-['Do_Hyeon'] hover:bg-sky-100 transition-colors
                              ${
                                formData.pregnancyWeek === week.toString()
                                  ? "bg-sky-200 text-black"
                                  : "text-gray-700"
                              }
                            `}
                          >
                            {week}주차
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-gray-600 font-['Do_Hyeon'] text-lg">
                  출산 예정일
                </label>
                <div className="relative w-40">
                  <button
                    type="button"
                    onClick={() => setShowCalendar(true)}
                    className={`w-full px-4 py-2 border-2 rounded-[20px] font-['Do_Hyeon'] bg-white text-left flex justify-between items-center transition-colors duration-300 border-[#E5E7EB]`}
                  >
                    <span>{formData.dueDate || "선택"}</span>
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-gray-600 font-['Do_Hyeon'] text-lg">
                  고위험 임신
                </label>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, isHighRisk: true })
                    }
                    className={`px-4 py-1.5 rounded-full font-['Do_Hyeon'] transition-all duration-300 outline-none
                      ${
                        formData.isHighRisk
                          ? "bg-[#F87171] text-white"
                          : "bg-white text-gray-600 hover:bg-[#FECACA]/40"
                      }
                      border-none`}
                  >
                    예
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, isHighRisk: false })
                    }
                    className={`px-4 py-1.5 rounded-full font-['Do_Hyeon'] transition-all duration-300 outline-none
                      ${
                        !formData.isHighRisk
                          ? "bg-[#E5E7EB] text-white"
                          : "bg-white text-gray-600 hover:bg-[#E5E7EB]/60"
                      }
                      border-none`}
                  >
                    아니오
                  </button>
                </div>
              </div>
              <button
                type="submit"
                className="w-full h-12 bg-blue-300 rounded-full flex items-center justify-center text-white text-lg font-normal font-['Do_Hyeon'] leading-[50px] cursor-pointer z-10 mt-4"
              >
                수정
              </button>
            </form>
          </div>
        </div>

        {/* 커스텀 달력 모달 */}
        {showCalendar && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowCalendar(false)}
            />
            <div className="bg-white p-4 rounded-2xl shadow-lg w-[320px] relative z-10 mx-4">
              <div className="text-center mb-4">
                <div className="text-lg font-['Do_Hyeon'] text-gray-900">
                  출산 예정일을 선택해주세요
                </div>
              </div>

              {/* 달력 헤더 */}
              <div className="flex justify-between items-center mb-3">
                <button
                  onClick={() => changeMonth(-1)}
                  aria-label="이전 달"
                  className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <div className="text-base font-['Do_Hyeon'] text-gray-900">
                  {formatYearMonth(currentMonth)}
                </div>
                <button
                  onClick={() => changeMonth(1)}
                  aria-label="다음 달"
                  className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>

              {/* 요일 헤더 */}
              <div className="grid grid-cols-7 mb-1">
                {["일", "월", "화", "수", "목", "금", "토"].map(
                  (day, index) => (
                    <div
                      key={day}
                      className={`text-center text-sm font-['Do_Hyeon'] py-1 ${
                        index === 0
                          ? "text-red-500"
                          : index === 6
                          ? "text-blue-500"
                          : "text-gray-600"
                      }`}
                    >
                      {day}
                    </div>
                  )
                )}
              </div>

              {/* 달력 날짜 */}
              <div className="grid grid-cols-7 gap-0.5">
                {generateCalendarDays().map((day, index) => (
                  <button
                    key={index}
                    onClick={() => handleDateSelect(day.date)}
                    disabled={!day.isCurrentMonth}
                    className={`                      w-10 h-10 flex items-center justify-center text-sm font-['Do_Hyeon'] rounded-full
                      ${
                        day.isCurrentMonth
                          ? day.date.toISOString().split("T")[0] ===
                            formData.dueDate
                            ? "bg-[#FFE999] text-gray-900 font-bold"
                            : "hover:bg-gray-100 text-gray-900"
                          : "text-gray-400"
                      }
                      ${day.date.getDay() === 0 ? "text-red-500" : ""}
                      ${day.date.getDay() === 6 ? "text-blue-500" : ""}
                      disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                  >
                    {day.date.getDate()}
                  </button>
                ))}
              </div>

              {/* 취소 버튼 */}
              <div className="mt-3 flex justify-center">
                <button
                  onClick={() => setShowCalendar(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-full font-['Do_Hyeon'] hover:bg-gray-300 transition-colors text-sm"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
