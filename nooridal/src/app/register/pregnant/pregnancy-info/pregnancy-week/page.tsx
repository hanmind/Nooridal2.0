"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PregnancyWeek() {
  const router = useRouter();
  const [pregnancyWeek, setPregnancyWeek] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [noInfo, setNoInfo] = useState(false);
  const [showWeekDropdown, setShowWeekDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [lastPeriodDate, setLastPeriodDate] = useState("");
  const [showLastPeriodModal, setShowLastPeriodModal] = useState(false);
  const [calculatedPregnancyWeek, setCalculatedPregnancyWeek] = useState<number | null>(null);
  const [calculatedDueDate, setCalculatedDueDate] = useState<string | null>(null);

  // 1-40주 배열 생성
  const weeks = Array.from({ length: 40 }, (_, i) => i + 1);

  const handleNext = () => {
    router.push('/register/pregnant/pregnancy-info/high-risk');
  };

  const handlePrevious = () => {
    router.push('/register/pregnant/pregnancy-info/baby-name');
  };

  // 모든 정보가 입력되었는지 확인
  const isFormValid = () => {
    // 임신 주차와 출산 예정일이 모두 입력되었거나, 정보 없음이 체크되었는지 확인
    const isInfoValid = (pregnancyWeek.trim() !== "" && dueDate.trim() !== "") || noInfo;
    
    // 마지막 생리 시작일 모달이 열려있고 계산된 정보가 있는 경우도 유효
    const isCalculatedInfoValid = calculatedPregnancyWeek !== null && calculatedDueDate !== null;
    
    return isInfoValid || isCalculatedInfoValid;
  };

  const handleWeekSelect = (week: number) => {
    setPregnancyWeek(week.toString());
    setShowWeekDropdown(false);
    // 임신 주차에 따라 출산 예정일 자동 계산 로직 추가 가능
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    // 날짜를 YYYY.MM.DD 형식으로 변환
    const formattedDate = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
    setDueDate(formattedDate);
    setShowDatePicker(false);
  };

  // 현재 달의 날짜 배열 생성
  const generateCalendarDays = () => {
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    
    const days = [];
    const firstDayIndex = firstDay.getDay();
    
    // 이전 달의 날짜들 (빈 칸으로 채움)
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }
    
    // 현재 달의 날짜들
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(currentYear, currentMonth, i));
    }
    
    return days;
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleYearSelect = (year: number) => {
    setCurrentDate(new Date(year, currentDate.getMonth(), 1));
    setShowYearPicker(false);
  };

  const handleMonthSelect = (month: number) => {
    setCurrentDate(new Date(month, currentDate.getMonth(), 1));
    setShowMonthPicker(false);
  };

  const handleLastPeriodDateSelect = (date: Date) => {
    setSelectedDate(date);
    // 날짜를 YYYY.MM.DD 형식으로 변환
    const formattedDate = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
    setLastPeriodDate(formattedDate);
    
    // 마지막 생리 시작일로부터 임신 주차와 출산 예정일 계산
    calculatePregnancyInfo(date);
    
    // 달력 닫기
    setShowDatePicker(false);
  };

  const calculatePregnancyInfo = (lastPeriodDate: Date) => {
    const today = new Date();
    
    // 마지막 생리 시작일로부터 오늘까지의 일수 계산
    const diffTime = Math.abs(today.getTime() - lastPeriodDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // 임신 주차 계산 (마지막 생리 시작일로부터 2주 후부터 계산)
    const pregnancyWeek = Math.floor((diffDays - 14) / 7);
    setCalculatedPregnancyWeek(pregnancyWeek);
    
    // 출산 예정일 계산 (마지막 생리 시작일로부터 280일 후)
    const dueDate = new Date(lastPeriodDate);
    dueDate.setDate(dueDate.getDate() + 280);
    
    const formattedDueDate = `${dueDate.getFullYear()}.${String(dueDate.getMonth() + 1).padStart(2, '0')}.${String(dueDate.getDate()).padStart(2, '0')}`;
    setCalculatedDueDate(formattedDueDate);
  };

  const handleNoInfoChange = (checked: boolean) => {
    setNoInfo(checked);
    if (checked) {
      setShowWeekDropdown(false);
      setShowDatePicker(false);
      setShowLastPeriodModal(true);
    } else {
      setShowLastPeriodModal(false);
      setLastPeriodDate("");
      setCalculatedPregnancyWeek(null);
      setCalculatedDueDate(null);
    }
  };

  const calendarDays = generateCalendarDays();
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
  const months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
  
  // 년도 선택을 위한 배열 (현재 년도 기준 -10 ~ +10)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);

  return (
    <div className="min-h-screen w-full bg-[#FFF4BB] flex justify-center items-center">
      <div className="w-96 h-[874px] relative overflow-hidden flex justify-center">
        {/* 누리달 로고 */}
        <div className="absolute left-1/2 top-[50px] transform -translate-x-1/2 z-20 w-[200px] h-[100px]">
          <Image
            src="/images/logo/로고 구름.png"
            alt="로고 구름"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* 메인 카드 */}
        <div className="absolute top-[180px] w-80 bg-white rounded-[30px] shadow-lg p-6 z-10">
          {/* 달 아이콘 */}
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 relative">
              <Image
                src="/images/logo/달달.png"
                alt="달달"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* 텍스트 */}
          <div className="text-center mb-6">
            <div className="text-lg font-['Do_Hyeon'] text-neutral-700 mb-1">
              임신 정보를 입력해주세요
            </div>
            <div className="text-sm font-['Do_Hyeon'] text-neutral-400">
              누리달에서 맞춤 서비스를 제공해 드립니다
            </div>
          </div>

          {/* 단계 표시 */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mb-1">
                <span className="text-black font-bold text-sm">1</span>
              </div>
              <span className="text-neutral-400 text-[10px] font-['Do_Hyeon']">임신 여부</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mb-1">
                <span className="text-black font-bold text-sm">2</span>
              </div>
              <span className="text-neutral-400 text-[10px] font-['Do_Hyeon']">태명</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-[#FFE999] rounded-full flex items-center justify-center mb-1">
                <span className="text-black font-bold text-sm">3</span>
              </div>
              <span className="text-[#FFE999] text-[10px] font-['Do_Hyeon']">임신 주차</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-zinc-300 rounded-full flex items-center justify-center mb-1">
                <span className="text-neutral-400 font-bold text-sm">4</span>
              </div>
              <span className="text-neutral-400 text-[10px] font-['Do_Hyeon']">고위험 여부</span>
            </div>
          </div>

          {/* 임신 주차 입력 */}
          <div className="mb-5">
            <div className="text-black text-sm font-['Do_Hyeon'] mb-2">현재 임신 주차</div>
            <div className="relative">
              <input
                type="text"
                value={pregnancyWeek}
                onChange={(e) => setPregnancyWeek(e.target.value)}
                placeholder="임신 주차를 입력하세요"
                className="w-full h-8 bg-sky-100 rounded-[10px] border border-zinc-300 px-4 text-black/40 text-xs font-['Do_Hyeon']"
                disabled={noInfo}
                onClick={() => !noInfo && setShowWeekDropdown(!showWeekDropdown)}
                readOnly
              />
              <div 
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-neutral-700 text-lg font-semibold cursor-pointer"
                onClick={() => !noInfo && setShowWeekDropdown(!showWeekDropdown)}
              >
                ∨
              </div>
              
              {/* 주차 선택 드롭다운 */}
              {showWeekDropdown && !noInfo && (
                <div className="absolute z-20 w-full mt-1 max-h-40 overflow-y-auto bg-white rounded-[10px] border border-zinc-300 shadow-md">
                  {weeks.map((week) => (
                    <div
                      key={week}
                      className="px-4 py-2 hover:bg-sky-100 cursor-pointer text-black text-xs font-['Do_Hyeon']"
                      onClick={() => handleWeekSelect(week)}
                    >
                      {week}주
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 출산 예정일 입력 */}
          <div className="mb-5">
            <div className="text-black text-sm font-['Do_Hyeon'] mb-2">출산 예정일</div>
            <div className="relative">
              <input
                type="text"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                placeholder="연도. 월. 일"
                className="w-full h-8 bg-sky-100 rounded-[10px] border border-zinc-300 px-4 text-black/40 text-xs font-['Do_Hyeon']"
                disabled={noInfo}
                readOnly
              />
              <div 
                className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer"
                onClick={() => !noInfo && setShowDatePicker(!showDatePicker)}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className="text-neutral-700"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
              
              {/* 날짜 선택 달력 */}
              {showDatePicker && !noInfo && (
                <div className="absolute z-30 w-64 bg-white rounded-[10px] border border-zinc-300 shadow-md p-3 mt-1 right-0">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex gap-2">
                      <div 
                        className="text-black text-sm font-['Do_Hyeon'] cursor-pointer hover:text-[#FFE999]"
                        onClick={() => setShowYearPicker(!showYearPicker)}
                      >
                        {currentDate.getFullYear()}년
                      </div>
                      <div 
                        className="text-black text-sm font-['Do_Hyeon'] cursor-pointer hover:text-[#FFE999]"
                        onClick={() => setShowMonthPicker(!showMonthPicker)}
                      >
                        {currentDate.getMonth() + 1}월
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100"
                        onClick={handlePrevMonth}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                      </button>
                      <button 
                        className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100"
                        onClick={handleNextMonth}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  {/* 년도 선택 드롭다운 */}
                  {showYearPicker && (
                    <div className="absolute z-40 w-full max-h-40 overflow-y-auto bg-white rounded-[10px] border border-zinc-300 shadow-md p-2 mb-2">
                      <div className="grid grid-cols-3 gap-1">
                        {years.map((year) => (
                          <div
                            key={year}
                            className={`px-2 py-1 text-center text-xs font-['Do_Hyeon'] cursor-pointer rounded-md ${
                              year === currentDate.getFullYear() 
                                ? 'bg-[#FFE999] text-black' 
                                : 'hover:bg-sky-100 text-black'
                            }`}
                            onClick={() => handleYearSelect(year)}
                          >
                            {year}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* 월 선택 드롭다운 */}
                  {showMonthPicker && (
                    <div className="absolute z-40 w-full max-h-40 overflow-y-auto bg-white rounded-[10px] border border-zinc-300 shadow-md p-2 mb-2">
                      <div className="grid grid-cols-3 gap-1">
                        {months.map((month, index) => (
                          <div
                            key={index}
                            className={`px-2 py-1 text-center text-xs font-['Do_Hyeon'] cursor-pointer rounded-md ${
                              index === currentDate.getMonth() 
                                ? 'bg-[#FFE999] text-black' 
                                : 'hover:bg-sky-100 text-black'
                            }`}
                            onClick={() => handleMonthSelect(index)}
                          >
                            {month}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* 요일 헤더 */}
                  <div className="grid grid-cols-7 gap-1 mb-1">
                    {weekDays.map((day, index) => (
                      <div 
                        key={index} 
                        className={`text-center text-xs font-['Do_Hyeon'] ${
                          index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-neutral-500'
                        }`}
                      >
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  {/* 날짜 그리드 */}
                  <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((date, index) => (
                      <div 
                        key={index} 
                        className={`w-8 h-8 flex items-center justify-center text-xs font-['Do_Hyeon'] rounded-full ${
                          date 
                            ? 'cursor-pointer hover:bg-sky-100' 
                            : ''
                        } ${
                          date && selectedDate && 
                          date.getDate() === selectedDate.getDate() && 
                          date.getMonth() === selectedDate.getMonth() && 
                          date.getFullYear() === selectedDate.getFullYear()
                            ? 'bg-[#FFE999] text-black'
                            : date
                              ? date.getDay() === 0 
                                ? 'text-red-500' 
                                : date.getDay() === 6 
                                  ? 'text-blue-500' 
                                  : 'text-black'
                              : 'text-transparent'
                        }`}
                        onClick={() => date && handleDateSelect(date)}
                      >
                        {date ? date.getDate() : ''}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="text-neutral-400 text-xs font-['Do_Hyeon'] mt-1">
              임신 주차를 선택하면 자동으로 계산됩니다. 필요시 수정 가능합니다
            </div>
          </div>

          {/* 정보 없음 체크박스 */}
          {!calculatedPregnancyWeek && !calculatedDueDate && (
            <div className="flex items-center mb-5">
              <input
                type="checkbox"
                checked={noInfo}
                onChange={(e) => handleNoInfoChange(e.target.checked)}
                className="mr-2"
              />
              <span className="text-neutral-700 text-xs font-['Do_Hyeon']">현재 임신 주차와 출산 예정일을 모릅니다</span>
            </div>
          )}

          {/* 마지막 생리 시작일 모달 */}
          {showLastPeriodModal && (
            <div className="absolute inset-0 bg-white rounded-[30px] z-20 p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="text-lg font-['Do_Hyeon'] text-neutral-700">
                  마지막 생리 시작일
                </div>
              </div>
              
              <div className="relative mb-4">
                <input
                  type="text"
                  value={lastPeriodDate}
                  placeholder="연도. 월. 일"
                  className="w-full h-8 bg-sky-100 rounded-[10px] border border-zinc-300 px-4 text-black/40 text-xs font-['Do_Hyeon']"
                  readOnly
                />
                <div 
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer"
                  onClick={() => setShowDatePicker(!showDatePicker)}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className="text-neutral-700"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                </div>
                
                {/* 날짜 선택 달력 */}
                {showDatePicker && (
                  <div className="absolute z-30 w-64 bg-white rounded-[10px] border border-zinc-300 shadow-md p-3 mt-1 right-0">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex gap-2">
                        <div 
                          className="text-black text-sm font-['Do_Hyeon'] cursor-pointer hover:text-[#FFE999]"
                          onClick={() => setShowYearPicker(!showYearPicker)}
                        >
                          {currentDate.getFullYear()}년
                        </div>
                        <div 
                          className="text-black text-sm font-['Do_Hyeon'] cursor-pointer hover:text-[#FFE999]"
                          onClick={() => setShowMonthPicker(!showMonthPicker)}
                        >
                          {currentDate.getMonth() + 1}월
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100"
                          onClick={handlePrevMonth}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6"></polyline>
                          </svg>
                        </button>
                        <button 
                          className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100"
                          onClick={handleNextMonth}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6"></polyline>
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    {/* 년도 선택 드롭다운 */}
                    {showYearPicker && (
                      <div className="absolute z-40 w-full max-h-40 overflow-y-auto bg-white rounded-[10px] border border-zinc-300 shadow-md p-2 mb-2">
                        <div className="grid grid-cols-3 gap-1">
                          {years.map((year) => (
                            <div
                              key={year}
                              className={`px-2 py-1 text-center text-xs font-['Do_Hyeon'] cursor-pointer rounded-md ${
                                year === currentDate.getFullYear() 
                                  ? 'bg-[#FFE999] text-black' 
                                  : 'hover:bg-sky-100 text-black'
                              }`}
                              onClick={() => handleYearSelect(year)}
                            >
                              {year}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* 월 선택 드롭다운 */}
                    {showMonthPicker && (
                      <div className="absolute z-40 w-full max-h-40 overflow-y-auto bg-white rounded-[10px] border border-zinc-300 shadow-md p-2 mb-2">
                        <div className="grid grid-cols-3 gap-1">
                          {months.map((month, index) => (
                            <div
                              key={index}
                              className={`px-2 py-1 text-center text-xs font-['Do_Hyeon'] cursor-pointer rounded-md ${
                                index === currentDate.getMonth() 
                                  ? 'bg-[#FFE999] text-black' 
                                  : 'hover:bg-sky-100 text-black'
                              }`}
                              onClick={() => handleMonthSelect(index)}
                            >
                              {month}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* 요일 헤더 */}
                    <div className="grid grid-cols-7 gap-1 mb-1">
                      {weekDays.map((day, index) => (
                        <div 
                          key={index} 
                          className={`text-center text-xs font-['Do_Hyeon'] ${
                            index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-neutral-500'
                          }`}
                        >
                          {day}
                        </div>
                      ))}
                    </div>
                    
                    {/* 날짜 그리드 */}
                    <div className="grid grid-cols-7 gap-1">
                      {calendarDays.map((date, index) => (
                        <div 
                          key={index} 
                          className={`w-8 h-8 flex items-center justify-center text-xs font-['Do_Hyeon'] rounded-full ${
                            date 
                              ? 'cursor-pointer hover:bg-sky-100' 
                              : ''
                          } ${
                            date && selectedDate && 
                            date.getDate() === selectedDate.getDate() && 
                            date.getMonth() === selectedDate.getMonth() && 
                            date.getFullYear() === selectedDate.getFullYear()
                              ? 'bg-[#FFE999] text-black'
                              : date
                                ? date.getDay() === 0 
                                  ? 'text-red-500' 
                                  : date.getDay() === 6 
                                    ? 'text-blue-500' 
                                    : 'text-black'
                                : 'text-transparent'
                          }`}
                          onClick={() => date && handleLastPeriodDateSelect(date)}
                        >
                          {date ? date.getDate() : ''}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="text-neutral-400 text-xs font-['Do_Hyeon'] mb-4">
                마지막 생리 시작일을 기준으로 임신 주차와 출산 예정일을 계산합니다.
              </div>
              
              {/* 버튼 */}
              <div className="flex justify-between mt-4">
                <button
                  onClick={() => setShowLastPeriodModal(false)}
                  className="w-16 h-8 bg-white rounded-2xl border border-neutral-400"
                >
                  <span className="text-black text-xs font-['Do_Hyeon']">취소</span>
                </button>
                <button
                  onClick={() => {
                    if (calculatedPregnancyWeek !== null && calculatedDueDate !== null) {
                      setPregnancyWeek(calculatedPregnancyWeek.toString());
                      setDueDate(calculatedDueDate);
                      setShowLastPeriodModal(false);
                      setNoInfo(false);
                      setShowDatePicker(false);
                    }
                  }}
                  className="w-16 h-8 bg-[#FFE999] rounded-2xl"
                >
                  <span className="text-black text-xs font-['Do_Hyeon']">확인</span>
                </button>
              </div>
            </div>
          )}

          {/* 버튼 */}
          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              className="w-16 h-8 bg-white rounded-2xl border border-neutral-400"
            >
              <span className="text-black text-xs font-['Do_Hyeon']">이전</span>
            </button>
            <button
              onClick={handleNext}
              className={`w-16 h-8 rounded-2xl ${isFormValid() ? 'bg-[#FFE999]' : 'bg-gray-300 cursor-not-allowed'}`}
              disabled={!isFormValid()}
            >
              <span className="text-black text-xs font-['Do_Hyeon']">다음</span>
            </button>
          </div>
        </div>

        {/* 배경 이미지 */}
        <div className="absolute bottom-0 left-0 right-0 h-[400px] w-full">
          <Image
            src="/images/logo/임신정보등록 배경.png"
            alt="배경"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>
    </div>
  );
} 