"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import PregnancyFormLayout from "@/components/pregnancy/PregnancyFormLayout";

export default function ExpectedDate() {
  const router = useRouter();
  const [pregnancyWeek, setPregnancyWeek] = useState("");
  const [expectedDate, setExpectedDate] = useState("");
  const [noInfo, setNoInfo] = useState(false);
  const [showLastPeriodModal, setShowLastPeriodModal] = useState(false);
  const [lastPeriodDate, setLastPeriodDate] = useState("");
  const [showPregnancyWeekPicker, setShowPregnancyWeekPicker] = useState(false);
  const [showExpectedDatePicker, setShowExpectedDatePicker] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [calculatedPregnancyWeek, setCalculatedPregnancyWeek] = useState("");
  const [calculatedDueDate, setCalculatedDueDate] = useState("");

  const handleNext = () => {
    router.push('/register/pregnant/pregnancy-info/high-risk');
  };

  const handlePrevious = () => {
    router.push('/register/pregnant/pregnancy-info/baby-name');
  };

  const isFormValid = () => {
    const isPregnancyWeekValid = pregnancyWeek.trim() !== "" || noInfo;
    const isExpectedDateValid = expectedDate.trim() !== "" || noInfo;
    return isPregnancyWeekValid || isExpectedDateValid;
  };

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    for (let i = 0; i < firstDay.getDay(); i++) {
      const prevDate = new Date(year, month, -i);
      days.unshift({
        date: prevDate,
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

  const handleMonthSelect = (month: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), month));
    setShowMonthPicker(false);
  };

  const handleYearSelect = (year: number) => {
    setCurrentDate(new Date(year, currentDate.getMonth()));
    setShowYearPicker(false);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setLastPeriodDate(date.toLocaleDateString());
    calculatePregnancyInfo(date);
  };

  const handleExpectedDateSelect = (date: Date) => {
    setSelectedDate(date);
    setExpectedDate(date.toLocaleDateString());
    setShowExpectedDatePicker(false);
  };

  const calculatePregnancyInfo = (lastPeriodDate: Date) => {
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lastPeriodDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const pregnancyWeek = Math.floor(diffDays / 7);
    
    const dueDate = new Date(lastPeriodDate);
    dueDate.setDate(dueDate.getDate() + 280);
    
    setCalculatedPregnancyWeek(pregnancyWeek.toString());
    setCalculatedDueDate(dueDate.toLocaleDateString());
    setPregnancyWeek(pregnancyWeek.toString());
    setExpectedDate(dueDate.toLocaleDateString());
  };

  // 년도 선택을 위한 배열 생성 (현재 년도 기준 전후 10년)
  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 1; i <= currentYear + 2; i++) {
      years.push(i);
    }
    return years;
  };

  // 월 선택을 위한 배열
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <PregnancyFormLayout
      title="임신 정보를 입력해주세요"
      subtitle="누리달에서 맞춤 서비스를 제공해 드립니다"
      currentStep={3}
      onPrevious={handlePrevious}
      onNext={handleNext}
      isNextDisabled={!isFormValid()}
    >
      {/* 임신 주차 입력 */}
      <div className="mb-4">
        <label className="block text-sm font-['Do_Hyeon'] text-gray-700 mb-1">현재 임신 주차</label>
        <div 
          className="w-full h-12 bg-white rounded-xl border border-gray-300 text-black font-['Do_Hyeon'] flex justify-between items-center cursor-pointer px-4"
          onClick={() => !noInfo && setShowPregnancyWeekPicker(!showPregnancyWeekPicker)}
        >
          <span className="text-gray-900">{pregnancyWeek ? `${pregnancyWeek}주차` : "임신 주차를 선택해주세요"}</span>
          {!noInfo && (
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </div>
        
        {/* 임신 주차 선택 모달 */}
        {showPregnancyWeekPicker && !noInfo && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-[20px] shadow-lg w-80">
              <div className="text-center mb-4">
                <div className="text-lg font-['Do_Hyeon'] text-gray-900">
                  임신 주차를 선택해주세요
                </div>
              </div>
              
              <div className="h-60 overflow-y-auto mb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {Array.from({ length: 40 }, (_, i) => i + 1).map((week) => (
                  <div 
                    key={week}
                    className={`p-3 text-center cursor-pointer rounded-lg transition-colors font-['Do_Hyeon'] ${
                      pregnancyWeek === week.toString() ? 'bg-[#FFE999] text-black' : 'hover:bg-gray-100'
                    }`}
                    onClick={() => {
                      setPregnancyWeek(week.toString());
                      setShowPregnancyWeekPicker(false);
                    }}
                  >
                    {week}주차
                  </div>
                ))}
              </div>
              
              <div className="flex justify-center">
                <button
                  onClick={() => setShowPregnancyWeekPicker(false)}
                  className="w-20 h-9 rounded-2xl bg-gray-200 hover:bg-gray-300 transition-colors"
                >
                  <span className="text-gray-700 text-sm font-['Do_Hyeon']">취소</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 출산 예정일 입력 */}
      <div className="mb-6">
        <label className="block text-sm font-['Do_Hyeon'] text-gray-700 mb-1">출산 예정일</label>
        <div 
          className="w-full h-12 bg-white rounded-xl border border-gray-300 text-black font-['Do_Hyeon'] flex justify-between items-center cursor-pointer px-4"
          onClick={() => !noInfo && setShowExpectedDatePicker(!showExpectedDatePicker)}
        >
          <span className="text-gray-900">{expectedDate || "출산 예정일을 선택해주세요"}</span>
          {!noInfo && (
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )}
        </div>
        
        {/* 예정일 선택 모달 */}
        {showExpectedDatePicker && !noInfo && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-[20px] shadow-lg w-80">
              <div className="text-center mb-4">
                <div className="text-lg font-['Do_Hyeon'] text-gray-900">
                  출산 예정일을 선택해주세요
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-center items-center mb-4 relative">
                  <div 
                    className="flex items-center gap-1 px-4 py-2 bg-gray-50 rounded-lg cursor-pointer"
                    onClick={() => setShowYearPicker(!showYearPicker)}
                  >
                    <span className="text-gray-900 font-['Do_Hyeon']">{currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월</span>
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>

                  {/* 년도/월 선택 팝업 */}
                  {showYearPicker && (
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white shadow-lg rounded-lg p-4 w-64 z-10">
                      <div className="h-40 overflow-y-auto mb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                        {generateYears().map((year) => (
                          <div
                            key={year}
                            className={`p-3 text-center cursor-pointer rounded-lg transition-colors font-['Do_Hyeon'] ${
                              currentDate.getFullYear() === year
                                ? 'bg-[#FFE999] text-black'
                                : 'hover:bg-gray-100 text-gray-700'
                            }`}
                            onClick={() => {
                              handleYearSelect(year);
                              setShowMonthPicker(true);
                              setShowYearPicker(false);
                            }}
                          >
                            {year}년
                          </div>
                        ))}
                      </div>
                      <div className="h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                        {months.map((month) => (
                          <div
                            key={month}
                            className={`p-3 text-center cursor-pointer rounded-lg transition-colors font-['Do_Hyeon'] ${
                              currentDate.getMonth() + 1 === month
                                ? 'bg-[#FFE999] text-black'
                                : 'hover:bg-gray-100 text-gray-700'
                            }`}
                            onClick={() => {
                              handleMonthSelect(month - 1);
                              setShowYearPicker(false);
                            }}
                          >
                            {month}월
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 요일 표시 */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
                    <div 
                      key={day} 
                      className={`text-center text-sm font-['Do_Hyeon'] ${
                        index === 0 ? 'text-red-500' : 
                        index === 6 ? 'text-blue-500' : 
                        'text-gray-500'
                      }`}
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* 날짜 표시 */}
                <div className="grid grid-cols-7 gap-1">
                  {generateCalendarDays().map((day, index) => {
                    const dayOfWeek = day.date.getDay();
                    return (
                      <button
                        key={index}
                        onClick={() => handleExpectedDateSelect(day.date)}
                        className={`p-2 text-sm font-['Do_Hyeon'] rounded-full transition-colors ${
                          day.isCurrentMonth
                            ? selectedDate?.toDateString() === day.date.toDateString()
                              ? 'bg-[#FFE999] text-black'
                              : dayOfWeek === 0
                                ? 'text-red-500 hover:bg-gray-100'
                                : dayOfWeek === 6
                                  ? 'text-blue-500 hover:bg-gray-100'
                                  : 'text-gray-900 hover:bg-gray-100'
                            : dayOfWeek === 0
                              ? 'text-red-300'
                              : dayOfWeek === 6
                                ? 'text-blue-300'
                                : 'text-gray-400'
                        }`}
                      >
                        {day.date.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={() => setShowExpectedDatePicker(false)}
                  className="w-20 h-9 rounded-2xl bg-gray-200 hover:bg-gray-300 transition-colors"
                >
                  <span className="text-gray-700 text-sm font-['Do_Hyeon']">취소</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 두개다 모른다 체크박스 */}
      <div 
        className="mb-4 flex items-center cursor-pointer"
        onClick={() => {
          setNoInfo(!noInfo);
          if (!noInfo) {
            setShowLastPeriodModal(true);
          }
        }}
      >
        <input
          type="checkbox"
          checked={noInfo}
          onChange={() => {
            setNoInfo(!noInfo);
            if (!noInfo) {
              setShowLastPeriodModal(true);
            }
          }}
          className="w-4 h-4 mr-2 rounded border-gray-300"
        />
        <span className="text-gray-700 text-sm font-['Do_Hyeon']">현재 임신 주차와 출산 예정일을 모릅니다</span>
      </div>

      {/* 마지막 월경일 입력 모달 */}
      {showLastPeriodModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-[20px] shadow-lg w-80">
            <div className="text-center mb-4">
              <div className="text-lg font-['Do_Hyeon'] text-gray-900">
                마지막 월경일을 입력해주세요
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-center items-center mb-4 relative">
                <div 
                  className="flex items-center gap-1 px-4 py-2 bg-gray-50 rounded-lg cursor-pointer"
                  onClick={() => setShowYearPicker(!showYearPicker)}
                >
                  <span className="text-gray-900 font-['Do_Hyeon']">{currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월</span>
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {/* 년도/월 선택 팝업 */}
                {showYearPicker && (
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white shadow-lg rounded-lg p-4 w-64 z-10">
                    <div className="h-40 overflow-y-auto mb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                      {generateYears().map((year) => (
                        <div
                          key={year}
                          className={`p-3 text-center cursor-pointer rounded-lg transition-colors font-['Do_Hyeon'] ${
                            currentDate.getFullYear() === year
                              ? 'bg-[#FFE999] text-black'
                              : 'hover:bg-gray-100 text-gray-700'
                          }`}
                          onClick={() => {
                            handleYearSelect(year);
                            setShowMonthPicker(true);
                            setShowYearPicker(false);
                          }}
                        >
                          {year}년
                        </div>
                      ))}
                    </div>
                    <div className="h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                      {months.map((month) => (
                        <div
                          key={month}
                          className={`p-3 text-center cursor-pointer rounded-lg transition-colors font-['Do_Hyeon'] ${
                            currentDate.getMonth() + 1 === month
                              ? 'bg-[#FFE999] text-black'
                              : 'hover:bg-gray-100 text-gray-700'
                          }`}
                          onClick={() => {
                            handleMonthSelect(month - 1);
                            setShowYearPicker(false);
                          }}
                        >
                          {month}월
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 요일 표시 */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
                  <div 
                    key={day} 
                    className={`text-center text-sm font-['Do_Hyeon'] ${
                      index === 0 ? 'text-red-500' : 
                      index === 6 ? 'text-blue-500' : 
                      'text-gray-500'
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* 날짜 표시 */}
              <div className="grid grid-cols-7 gap-1">
                {generateCalendarDays().map((day, index) => {
                  const dayOfWeek = day.date.getDay();
                  return (
                    <button
                      key={index}
                      onClick={() => handleDateSelect(day.date)}
                      className={`p-2 text-sm font-['Do_Hyeon'] rounded-full transition-colors ${
                        day.isCurrentMonth
                          ? selectedDate?.toDateString() === day.date.toDateString()
                            ? 'bg-[#FFE999] text-black'
                            : dayOfWeek === 0
                              ? 'text-red-500 hover:bg-gray-100'
                              : dayOfWeek === 6
                                ? 'text-blue-500 hover:bg-gray-100'
                                : 'text-gray-900 hover:bg-gray-100'
                          : dayOfWeek === 0
                            ? 'text-red-300'
                            : dayOfWeek === 6
                              ? 'text-blue-300'
                              : 'text-gray-400'
                      }`}
                    >
                      {day.date.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>

            {calculatedPregnancyWeek && calculatedDueDate && (
              <div className="mb-4 p-4 bg-gray-50 rounded-xl">
                <div className="text-sm font-['Do_Hyeon'] text-gray-700 mb-1">
                  계산된 임신 주차: {calculatedPregnancyWeek}주차
                </div>
                <div className="text-sm font-['Do_Hyeon'] text-gray-700">
                  계산된 출산 예정일: {calculatedDueDate}
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <button
                onClick={() => setShowLastPeriodModal(false)}
                className="w-20 h-9 rounded-2xl bg-gray-200 hover:bg-gray-300 transition-colors"
              >
                <span className="text-gray-700 text-sm font-['Do_Hyeon']">취소</span>
              </button>
              <button
                onClick={() => {
                  setShowLastPeriodModal(false);
                  setNoInfo(true);
                }}
                className="w-20 h-9 rounded-2xl bg-[#FFE999] hover:bg-[#FFD999] transition-colors"
              >
                <span className="text-gray-900 text-sm font-['Do_Hyeon']">확인</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </PregnancyFormLayout>
  );
} 