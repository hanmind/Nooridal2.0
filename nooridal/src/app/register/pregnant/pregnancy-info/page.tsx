"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import PregnancyFormLayout from "@/components/pregnancy/PregnancyFormLayout";
import { supabase } from "../../../../utils/supabase";
// import { Database } from "../../../../../types_db"; // Linter: unused

// type Pregnancy = Database["public"]["Tables"]["pregnancies"]["Row"]; // Linter: unused

export default function PregnancyInfo() {
  const router = useRouter();
  const [babyName, setBabyName] = useState("");
  const [expectedDate, setExpectedDate] = useState("");
  const [highRisk, setHighRisk] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [babyGender, setBabyGender] = useState("");
  const [pregnancyWeek, setPregnancyWeek] = useState("");
  const [lastPeriodDate /* setLastPeriodDate */] = useState(""); // Linter: unused setter. Potential logic issue: lastPeriodDate is displayed but not updated.
  const [noInfo, setNoInfo] = useState(false);
  const [noName, setNoName] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [waitingForBaby, setWaitingForBaby] = useState(false);
  const [showHighRiskModal, setShowHighRiskModal] = useState(false);
  const [isWeekSelectorOpen, setIsWeekSelectorOpen] = useState(false);
  const [showLastPeriodInput, setShowLastPeriodInput] = useState(false);
  const [lastPeriodDateInput, setLastPeriodDateInput] = useState("");
  const [showLastPeriodCalendar, setShowLastPeriodCalendar] = useState(false);

  useEffect(() => {
    fetchPregnancies();
  }, []);

  const fetchPregnancies = async () => {
    // const { data, error } = await supabase.from("pregnancies").select("*"); // Linter: unused data
    const { error } = await supabase.from("pregnancies").select("*");
    if (error) console.error("Error fetching pregnancies:", error);
    // else setPregnancies(data); // Removed as setPregnancies is commented out
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      console.log("Moving to previous step:", currentStep - 1);
    } else {
      router.push("/login");
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

    const dueDate = new Date(expectedDate);
    const today = new Date();
    const diffInTime = dueDate.getTime() - today.getTime();
    const diffInDays = Math.ceil(diffInTime / (1000 * 3600 * 24));
    const currentWeek = Math.floor((280 - diffInDays) / 7); // Assuming 280 days for full term

    const newPregnancy = {
      baby_name: babyName,
      due_date: dueDate.toISOString().split("T")[0],
      // current_week: currentWeek, // Schema mismatch: DB expects string | null
      current_week: currentWeek.toString(), // Convert number to string for DB
      high_risk: highRisk,
      created_at: new Date().toISOString(),
      user_id: user.id,
      guardian_id: user.id,
      status: "active" as const,
    };

    console.log("Attempting to create pregnancy with data:", newPregnancy);

    try {
      const { data, error } = await supabase
        .from("pregnancies")
        .insert(newPregnancy);
      if (error) {
        console.error(
          "Error creating pregnancy:",
          error.message,
          error.details
        );
      } else {
        console.log("Pregnancy created successfully:", data);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    }
  };

  // 입력값이 변경될 때마다 콘솔에 저장된 정보 출력
  useEffect(() => {
    console.log("[입력값 변경]", {
      babyName,
      babyGender,
      pregnancyWeek,
      expectedDate,
      highRisk,
    });
  }, [babyName, babyGender, pregnancyWeek, expectedDate, highRisk]);

  const handleNext = async () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      // 완료 시 캘린더로 이동
      await createPregnancy();
      router.push("/calendar");
    }
  };

  useEffect(() => {
    console.log("Current step after render:", currentStep);
  }, [currentStep]);

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    const prevMonthLastDate = new Date(year, month, 0).getDate();
    const firstDayOfWeek = firstDay.getDay();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDate - i),
        isCurrentMonth: false,
      });
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return days;
  };

  const handleDateSelect = (date: Date) => {
    setExpectedDate(date.toISOString().split("T")[0]);
    setShowCalendar(false);
    if (currentStep === 2) {
      setCurrentStep(3);
    }
  };

  const formatYearMonth = (date: Date) => {
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
  };

  const handleWeekSelect = (week: number) => {
    setPregnancyWeek(week.toString());
    const today = new Date();
    const daysToAdd = (40 - week) * 7;
    const dueDate = new Date(today.setDate(today.getDate() + daysToAdd));
    setExpectedDate(dueDate.toISOString().split("T")[0]);
    setIsWeekSelectorOpen(false);
    setCurrentStep(3);
    setShowCalendar(true);
  };

  return (
    <div className="min-h-screen w-full flex justify-center items-center px-2 sm:px-4 md:px-8">
      <main className="w-full max-w-md min-h-[600px] relative overflow-hidden sm:w-96 md:w-[420px] lg:w-[480px] xl:w-[520px]">
        <PregnancyFormLayout
          title="임신 정보를 입력해주세요"
          subtitle="누리달에서 맞춤 서비스를 제공해 드립니다"
          currentStep={currentStep}
          onPrevious={handlePrevious}
          onNext={handleNext}
          isNextDisabled={
            (currentStep === 1 && !babyName && !noName) ||
            (currentStep === 2 &&
              !(
                (pregnancyWeek && expectedDate) ||
                (showLastPeriodInput && lastPeriodDateInput)
              )
            )
          }
        >
          {currentStep === 1 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 font-['Do_Hyeon']">
                태명
              </label>
              <div className="relative mt-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  {/* user icon */}
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A9 9 0 1112 21a9 9 0 01-6.879-3.196z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </span>
                <input
                  type="text"
                  value={babyName}
                  onChange={(e) => setBabyName(e.target.value)}
                  placeholder="태명을 입력하세요"
                  className="w-full py-3 pl-10 pr-10 bg-gray-100 rounded-full border-none text-gray-700 font-['Do_Hyeon'] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-200 transition text-base"
                  style={{ fontFamily: "Do Hyeon, sans-serif" }}
                />
                {babyName && (
                  <button
                    type="button"
                    onClick={() => setBabyName("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 focus:outline-none"
                    tabIndex={-1}
                  >
                    {/* X icon */}
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                )}
              </div>
              <div
                className="mt-3 flex items-center cursor-pointer"
                onClick={() => {
                  setNoName(!noName);
                  if (!noName) {
                    setBabyName("아기");
                  } else {
                    setBabyName("");
                  }
                }}
              >
                <input
                  type="checkbox"
                  id="noNameCheckbox"
                  aria-label="아직 이름이 없어요 체크박스"
                  checked={noName}
                  onChange={() => {
                    setNoName(!noName);
                    if (!noName) {
                      setBabyName("아기");
                    } else {
                      setBabyName("");
                    }
                  }}
                  className="w-4 h-4 mr-2"
                />
                <span className="text-black text-sm font-['Do_Hyeon']">
                  아직 이름이 없어용
                </span>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 font-['Do_Hyeon']">
                  성별
                </label>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => setBabyGender("남자")}
                    className={`flex-1 p-2 rounded-xl border ${
                      babyGender === "남자"
                        ? "bg-blue-200 border-blue-200"
                        : "bg-white border-gray-300"
                    } cursor-pointer transition-colors font-['Do_Hyeon']`}
                  >
                    <span className="text-black text-sm">남자</span>
                  </button>
                  <button
                    onClick={() => setBabyGender("여자")}
                    className={`flex-1 p-2 rounded-xl border ${
                      babyGender === "여자"
                        ? "bg-red-200 border-red-200"
                        : "bg-white border-gray-300"
                    } cursor-pointer transition-colors font-['Do_Hyeon']`}
                  >
                    <span className="text-black text-sm">여자</span>
                  </button>
                  <button
                    onClick={() => setBabyGender("모름")}
                    className={`flex-1 p-2 rounded-xl border ${
                      babyGender === "모름"
                        ? "bg-gray-200 border-gray-200"
                        : "bg-white border-gray-300"
                    } cursor-pointer transition-colors font-['Do_Hyeon']`}
                  >
                    <span className="text-black text-sm">비밀</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 font-['Do_Hyeon']">
                현재 임신 주차
              </label>
              <div className="relative mt-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  {/* calendar icon */}
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="4" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
                </span>
                <button
                  type="button"
                  onClick={() => setIsWeekSelectorOpen(!isWeekSelectorOpen)}
                  className="w-full py-3 pl-10 pr-10 bg-gray-100 rounded-full border-none text-gray-700 font-['Do_Hyeon'] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-200 transition text-base text-left cursor-pointer"
                  style={{ fontFamily: "Do Hyeon, sans-serif" }}
                >
                  {pregnancyWeek ? `${pregnancyWeek}주차` : "주차를 선택하세요"}
                </button>
                {pregnancyWeek && (
                  <button
                    type="button"
                    onClick={() => setPregnancyWeek("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 focus:outline-none"
                    tabIndex={-1}
                  >
                    {/* X icon */}
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                )}
                {isWeekSelectorOpen && (
                  <div className="absolute top-full left-0 w-full bg-white border-2 border-gray-200 rounded-xl shadow-lg z-50 max-h-40 overflow-y-auto">
                    <div className="py-1">
                      {Array.from({ length: 40 }, (_, i) => (
                        <button
                          key={i + 1}
                          type="button"
                          onClick={() => handleWeekSelect(i + 1)}
                          className={`w-full px-4 py-2 text-left font-['Do_Hyeon'] hover:bg-gray-100 transition-colors
                            ${pregnancyWeek === (i + 1).toString() ? "bg-gray-200 text-black" : "text-gray-700"}
                          `}
                        >
                          {i + 1}주차
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <label className="block text-sm font-medium text-gray-700 font-['Do_Hyeon'] mt-4">
                출산 예정일
              </label>
              <div className="flex flex-col gap-0.5">
                <div className="relative mt-1">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    {/* calendar icon */}
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="4" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
                  </span>
                  <input
                    type="text"
                    value={expectedDate}
                    onClick={() => setShowCalendar(true)}
                    placeholder="날짜를 선택하세요"
                    className="w-full py-3 pl-10 pr-10 bg-gray-100 rounded-full border-none text-gray-700 font-['Do_Hyeon'] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-200 transition text-base cursor-pointer"
                    style={{ fontFamily: "Do Hyeon, sans-serif" }}
                    readOnly
                  />
                  {expectedDate && (
                    <button
                      type="button"
                      onClick={() => setExpectedDate("")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 focus:outline-none"
                      tabIndex={-1}
                    >
                      {/* X icon */}
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  )}
                </div>
                {/* 두개 다 모르겠어요 체크박스 */}
                <div className="flex items-center mt-3">
                  <input
                    type="checkbox"
                    id="dontKnowBoth"
                    checked={showLastPeriodInput}
                    onChange={() => setShowLastPeriodInput(!showLastPeriodInput)}
                    className="w-4 h-4 mr-2"
                  />
                  <label htmlFor="dontKnowBoth" className="text-gray-700 text-sm font-['Do_Hyeon'] cursor-pointer">
                    두개 다 모르겠어요
                  </label>
                </div>
                {/* 마지막 생리 시작일 입력 및 달력 */}
                {showLastPeriodInput && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 font-['Do_Hyeon'] mb-2">
                      마지막 생리 시작일
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                        {/* calendar icon */}
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="4" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
                      </span>
                      <input
                        type="text"
                        value={lastPeriodDateInput}
                        onClick={() => setShowLastPeriodCalendar(true)}
                        placeholder="날짜를 선택하세요"
                        className="w-full py-3 pl-10 pr-10 bg-gray-100 rounded-full border-none text-gray-700 font-['Do_Hyeon'] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-200 transition text-base cursor-pointer"
                        style={{ fontFamily: "Do Hyeon, sans-serif" }}
                        readOnly
                      />
                      {lastPeriodDateInput && (
                        <button
                          type="button"
                          onClick={() => setLastPeriodDateInput("")}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 focus:outline-none"
                          tabIndex={-1}
                        >
                          {/* X icon */}
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      )}
                    </div>
                    {showLastPeriodCalendar && (
                      <div className="fixed inset-0 flex items-center justify-center z-50">
                        <div
                          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                          onClick={() => setShowLastPeriodCalendar(false)}
                        />
                        <div className="bg-white p-4 rounded-2xl shadow-lg w-[320px] relative z-10 mx-4">
                          <div className="text-center mb-4">
                            <div className="text-lg font-['Do_Hyeon'] text-gray-900">
                              마지막 생리 시작일을 선택해주세요
                            </div>
                          </div>
                          <div className="flex justify-between items-center mb-3">
                            <button
                              onClick={() =>
                                setCurrentMonth(
                                  new Date(
                                    currentMonth.setMonth(currentMonth.getMonth() - 1)
                                  )
                                )
                              }
                              aria-label="이전 달 보기"
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
                              onClick={() =>
                                setCurrentMonth(
                                  new Date(
                                    currentMonth.setMonth(currentMonth.getMonth() + 1)
                                  )
                                )
                              }
                              aria-label="다음 달 보기"
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
                          <div className="grid grid-cols-7 gap-0.5">
                            {generateCalendarDays().map((day, index) => (
                              <button
                                key={index}
                                onClick={() => {
                                  const selectedDate = day.date;
                                  const today = new Date();
                                  const diffInTime = today.getTime() - selectedDate.getTime();
                                  const diffInDays = Math.floor(diffInTime / (1000 * 3600 * 24));
                                  const week = Math.floor(diffInDays / 7);
                                  // 출산예정일 = 마지막 생리 시작일 + 280일
                                  const dueDate = new Date(selectedDate.getTime() + 280 * 24 * 60 * 60 * 1000);
                                  setLastPeriodDateInput(selectedDate.toISOString().split("T")[0]);
                                  setPregnancyWeek(week.toString());
                                  setExpectedDate(dueDate.toISOString().split("T")[0]);
                                  setShowLastPeriodCalendar(false);
                                }}
                                disabled={!day.isCurrentMonth}
                                className={`
                                  w-10 h-10 flex items-center justify-center text-sm font-['Do_Hyeon'] rounded-full
                                  ${
                                    day.isCurrentMonth
                                      ? day.date.toISOString().split("T")[0] === lastPeriodDateInput
                                        ? "bg-gray-200 text-gray-900 font-bold"
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
                          <div className="mt-3 flex justify-center">
                            <button
                              onClick={() => setShowLastPeriodCalendar(false)}
                              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-full font-['Do_Hyeon'] hover:bg-gray-300 transition-colors text-sm"
                            >
                              취소
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

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

                    <div className="flex justify-between items-center mb-3">
                      <button
                        onClick={() =>
                          setCurrentMonth(
                            new Date(
                              currentMonth.setMonth(currentMonth.getMonth() - 1)
                            )
                          )
                        }
                        aria-label="이전 달 보기"
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
                        onClick={() =>
                          setCurrentMonth(
                            new Date(
                              currentMonth.setMonth(currentMonth.getMonth() + 1)
                            )
                          )
                        }
                        aria-label="다음 달 보기"
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

                    <div className="grid grid-cols-7 gap-0.5">
                      {generateCalendarDays().map((day, index) => (
                        <button
                          key={index}
                          onClick={() => handleDateSelect(day.date)}
                          disabled={!day.isCurrentMonth}
                          className={`
                            w-10 h-10 flex items-center justify-center text-sm font-['Do_Hyeon'] rounded-full
                            ${
                              day.isCurrentMonth
                                ? day.date.toISOString().split("T")[0] ===
                                  expectedDate
                                  ? "bg-gray-200 text-gray-900 font-bold"
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
            </div>
          )}

          {currentStep === 3 && (
            <div className="mb-4 flex items-center justify-center cursor-pointer bg-white p-2 rounded-full border-2 border-gray-200">
              <input
                type="checkbox"
                aria-label="고위험 임신 체크박스"
                checked={highRisk}
                onChange={() => setShowHighRiskModal(true)}
                className={`w-4 h-6 mr-2 rounded border-gray-300 ${
                  highRisk ? "bg-gray-200" : ""
                }`}
              />
              <span className="text-red-500 text-sm font-['Do_Hyeon']">
                고위험 임신입니다
              </span>
            </div>
          )}

          {showHighRiskModal && (
            <div className="fixed inset-0 flex items-center justify-center z-50">
              <div className="bg-red-100 p-6 rounded-[20px] shadow-lg w-[90%] max-w-md z-10 mx-4">
                <div className="text-center mb-6">
                  <div className="text-xl font-['Do_Hyeon'] text-gray-900 mb-2">
                    고위험 임신이란?
                  </div>
                  <div className="text-sm font-['Do_Hyeon'] text-gray-600">
                    다음과 같은 경우 고위험 임신으로 분류됩니다:
                  </div>
                </div>

                <div className="mb-6 space-y-3 bg-gray-50 p-4 rounded-xl">
                  <div className="text-sm font-['Do_Hyeon'] text-gray-700">
                    • 만 35세 이상의 고령 임신
                  </div>
                  <div className="text-sm font-['Do_Hyeon'] text-gray-700">
                    • 임신성 당뇨
                  </div>
                  <div className="text-sm font-['Do_Hyeon'] text-gray-700">
                    • 임신성 고혈압
                  </div>
                  <div className="text-sm font-['Do_Hyeon'] text-gray-700">
                    • 다태 임신
                  </div>
                  <div className="text-sm font-['Do_Hyeon'] text-gray-700">
                    • 전치태반
                  </div>
                  <div className="text-sm font-['Do_Hyeon'] text-gray-700">
                    • 조기진통
                  </div>
                  <div className="text-sm font-['Do_Hyeon'] text-gray-700">
                    • 산부인과 전문의가 고위험 임신으로 판단한 경우
                  </div>
                </div>

                <div className="text-sm font-['Do_Hyeon'] text-gray-600 mb-6 p-3 bg-white rounded-xl">
                  누리달에서는 고위험 임신부를 위한 맞춤 서비스를 제공해 드립니다.
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={() => {
                      setShowHighRiskModal(false);
                      setHighRisk(true);
                    }}
                    className="w-20 h-9 rounded-2xl bg-red-400 hover:bg-red-500 transition-colors"
                  >
                    <span className="text-white text-sm font-['Do_Hyeon']">
                      확인
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </PregnancyFormLayout>
      </main>
    </div>
  );
}
