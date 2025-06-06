"use client";

import { useRouter } from "next/navigation";
import { useState, ChangeEvent, useEffect } from "react";
import Image from "next/image";
import { supabase } from "../../lib/supabase";
import HeaderBar from "@/app/components/HeaderBar";

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
    <div className="min-h-screen w-full bg-[#FFF4BB] flex flex-col items-center pt-20">
      {/* 헤더 */}
      <HeaderBar
        title={
          formData.babyName
            ? `${formData.babyName} 엄마의 임신 정보`
            : "엄마의 임신 정보"
        }
      />
      <main className="w-full max-w-md relative bg-[#FFF4BB] overflow-y-auto flex flex-col items-center px-4 pt-6 mx-auto">
        <div className="w-full max-w-[360px] bg-white rounded-3xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.30)] shadow-[0px_1px_3px_1px_rgba(0,0,0,0.15)] p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 태명 */}
            <div className="flex flex-col space-y-2">
              <label className="text-black text-sm font-normal font-['Do_Hyeon']">
                태명
              </label>
              <input
                type="text"
                value={tempBabyName}
                onChange={(e) => setTempBabyName(e.target.value)}
                className="w-full h-11 px-4 text-black text-sm font-normal font-['Do_Hyeon'] bg-white border-2 rounded-[10px] border-zinc-300 focus:outline-none focus:border-sky-400"
                placeholder="태명을 입력하세요"
              />
            </div>

            {/* 성별 */}
            <div className="flex flex-col space-y-2">
              <label className="text-black text-sm font-normal font-['Do_Hyeon']">
                성별
              </label>
              <div className="flex space-x-2 justify-center">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, gender: "남자" })}
                  className={`flex-1 py-2 rounded-full font-['Do_Hyeon'] transition-all duration-300 text-sm
                    ${
                      formData.gender === "남자"
                        ? "bg-sky-200 text-black border-2 border-sky-200"
                        : "bg-white border-2 border-gray-200 text-black hover:bg-sky-50"
                    }`}
                >
                  남아
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, gender: "여자" })}
                  className={`flex-1 py-2 rounded-full font-['Do_Hyeon'] transition-all duration-300 text-sm
                    ${
                      formData.gender === "여자"
                        ? "bg-red-200 text-black border-2 border-red-200"
                        : "bg-white border-2 border-gray-200 text-black hover:bg-sky-50"
                    }`}
                >
                  여아
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, gender: "모름" })}
                  className={`flex-1 py-2 rounded-full font-['Do_Hyeon'] transition-all duration-300 text-sm
                    ${
                      formData.gender === "모름"
                        ? "bg-gray-200 text-black border-2 border-gray-200"
                        : "bg-white border-2 border-gray-200 text-black hover:bg-sky-50"
                    }`}
                >
                  모름
                </button>
              </div>
            </div>

            {/* 현재 임신 주차 */}
            <div className="flex flex-col space-y-2">
              <label className="text-black text-sm font-normal font-['Do_Hyeon']">
                현재 임신 주차
              </label>
              <div className="relative w-full">
                <button
                  type="button"
                  onClick={() => setIsWeekSelectorOpen(!isWeekSelectorOpen)}
                  className="w-full h-11 px-4 border-2 rounded-[10px] font-['Do_Hyeon'] bg-white text-left flex justify-between items-center border-zinc-300 text-sm text-black"
                >
                  <span>
                    {formData.pregnancyWeek !== "*"
                      ? `${formData.pregnancyWeek}주차`
                      : "선택"}
                  </span>
                  <svg
                    className="w-4 h-4 text-black"
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
                          className={`w-full px-4 py-2 text-left font-['Do_Hyeon'] hover:bg-sky-100 transition-colors text-sm
                            ${
                              formData.pregnancyWeek === week.toString()
                                ? "bg-sky-200 text-black"
                                : "text-black"
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

            {/* 출산 예정일 */}
            <div className="flex flex-col space-y-2">
              <label className="text-black text-sm font-normal font-['Do_Hyeon']">
                출산 예정일
              </label>
              <button
                type="button"
                onClick={() => setShowCalendar(true)}
                className="w-full h-11 px-4 border-2 rounded-[10px] font-['Do_Hyeon'] bg-white text-left flex justify-between items-center border-zinc-300 text-sm text-black"
              >
                <span>{formData.dueDate || "선택"}</span>
                <svg
                  className="w-4 h-4 text-black"
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

            {/* 고위험 임신 */}
            <div className="flex flex-col space-y-2">
              <label className="text-black text-sm font-normal font-['Do_Hyeon']">
                고위험 임신
              </label>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isHighRisk: true })}
                  className={`flex-1 py-2 rounded-full font-['Do_Hyeon'] transition-all duration-300 text-sm
                    ${
                      formData.isHighRisk
                        ? "bg-[#F87171] text-white"
                        : "bg-white border-2 border-gray-200 text-gray-600 hover:bg-red-50"
                    }`}
                >
                  예
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, isHighRisk: false })
                  }
                  className={`flex-1 py-2 rounded-full font-['Do_Hyeon'] transition-all duration-300 text-sm
                    ${
                      !formData.isHighRisk
                        ? "bg-[#E5E7EB] text-black"
                        : "bg-white border-2 border-gray-200 text-black hover:bg-gray-50"
                    }`}
                >
                  아니오
                </button>
              </div>
            </div>

            {/* 수정 버튼 */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full h-11 bg-blue-300 rounded-full flex items-center justify-center text-white text-base font-normal font-['Do_Hyeon'] cursor-pointer"
              >
                수정
              </button>
            </div>
          </form>
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
                <div className="text-lg font-['Do_Hyeon'] text-black">
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
                    className="w-5 h-5 text-black"
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
                <div className="text-base font-['Do_Hyeon'] text-black">
                  {formatYearMonth(currentMonth)}
                </div>
                <button
                  onClick={() => changeMonth(1)}
                  aria-label="다음 달"
                  className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-black"
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
                    className={`w-10 h-10 flex items-center justify-center text-sm font-['Do_Hyeon'] rounded-full
                      ${
                        day.isCurrentMonth
                          ? day.date.toISOString().split("T")[0] ===
                            formData.dueDate
                            ? "bg-[#FFE999] text-black font-bold"
                            : "hover:bg-gray-100 text-black"
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
                  className="px-6 py-2 bg-gray-200 text-black rounded-full font-['Do_Hyeon'] hover:bg-gray-300 transition-colors text-sm"
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
