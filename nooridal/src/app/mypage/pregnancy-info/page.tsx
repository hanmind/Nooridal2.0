"use client";

import { useRouter } from "next/navigation";
import { useState, ChangeEvent } from "react";
import Image from "next/image";

interface FormData {
  babyName: string;
  gender: "male" | "female" | "unknown" | "";
  pregnancyWeek: string;
  dueDate: string;
  isHighRisk: boolean;
  daysUntilBirth?: number;
}

export default function PregnancyInfo() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isWeekSelectorOpen, setIsWeekSelectorOpen] = useState<boolean>(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const [formData, setFormData] = useState<FormData>({
    babyName: "아기",
    gender: "",
    pregnancyWeek: "*",
    dueDate: "202*-**-**",
    isHighRisk: true,
    daysUntilBirth: undefined
  });

  const weeks: number[] = Array.from({length: 40}, (_, i) => i + 1);

  // 임신 주차에 따른 출산 예정일 계산
  const calculateDueDate = (week: number): string => {
    const today = new Date();
    const pregnancyStart = new Date(today);
    const weeksInMilliseconds = (week - 1) * 7 * 24 * 60 * 60 * 1000;
    pregnancyStart.setTime(today.getTime() - weeksInMilliseconds);
    
    const dueDate = new Date(pregnancyStart);
    dueDate.setDate(pregnancyStart.getDate() + 280); // 40주 = 280일
    
    return dueDate.toISOString().split('T')[0];
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

  // 임신 주차 변경 핸들러
  const handleWeekChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedWeek = e.target.value;
    if (selectedWeek && selectedWeek !== "") {
      const calculatedDueDate = calculateDueDate(parseInt(selectedWeek));
      const daysUntil = calculateDaysUntilBirth(calculatedDueDate);
      setFormData(prev => ({
        ...prev,
        pregnancyWeek: selectedWeek,
        dueDate: calculatedDueDate,
        daysUntilBirth: daysUntil
      }));
    }
    setIsWeekSelectorOpen(false);
  };

  // 출산 예정일 변경 핸들러
  const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    if (selectedDate) {
      const calculatedWeek = calculatePregnancyWeek(selectedDate);
      const daysUntil = calculateDaysUntilBirth(selectedDate);
      setFormData(prev => ({
        ...prev,
        dueDate: selectedDate,
        pregnancyWeek: calculatedWeek.toString(),
        daysUntilBirth: daysUntil
      }));
    }
  };

  const handleGenderChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newGender = e.target.value as FormData['gender'];
    setFormData(prev => ({
      ...prev,
      gender: newGender
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: API 호출하여 임신 정보 업데이트
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  // 오늘 날짜 기준 최소/최대 선택 가능 날짜 계산
  const today = new Date();
  const minDate = new Date(today);
  minDate.setDate(today.getDate()); // 오늘부터 선택 가능
  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + 280); // 최대 40주

  const minDateString = minDate.toISOString().split('T')[0];
  const maxDateString = maxDate.toISOString().split('T')[0];

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
        isCurrentMonth: false
      });
    }
    
    // 현재 달의 날짜들
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      });
    }
    
    // 다음 달의 시작 날짜들
    const remainingDays = 42 - days.length; // 6주 달력을 위해
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
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
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1);
    setCurrentMonth(newDate);
  };

  // 날짜 선택 핸들러
  const handleDateSelect = (date: Date) => {
    const selectedDate = date.toISOString().split('T')[0];
    const calculatedWeek = calculatePregnancyWeek(selectedDate);
    const daysUntil = calculateDaysUntilBirth(selectedDate);
    setFormData(prev => ({
      ...prev,
      dueDate: selectedDate,
      pregnancyWeek: calculatedWeek.toString(),
      daysUntilBirth: daysUntil
    }));
    setShowCalendar(false);
  };

  return (
    <div className="min-h-screen w-full bg-[#FFF4BB] flex justify-center items-center">
      <style jsx global>{`
        select, input[type="date"], option {
          font-family: 'Do Hyeon', sans-serif !important;
        }
        select option {
          font-family: 'Do Hyeon', sans-serif !important;
        }
        /* Webkit (Chrome, Safari) */
        select::-webkit-listbox {
          font-family: 'Do Hyeon', sans-serif !important;
        }
        select::-webkit-list {
          font-family: 'Do Hyeon', sans-serif !important;
        }
        /* Firefox */
        select:-moz-focusring {
          font-family: 'Do Hyeon', sans-serif !important;
        }
        select::-ms-value {
          font-family: 'Do Hyeon', sans-serif !important;
        }
        /* For the dropdown itself */
        select option:checked {
          font-family: 'Do Hyeon', sans-serif !important;
          font-weight: normal;
        }
        select:focus option:checked {
          font-family: 'Do Hyeon', sans-serif !important;
        }
        select option:hover {
          font-family: 'Do Hyeon', sans-serif !important;
        }
        select::-webkit-scrollbar {
          width: 8px;
        }
        select::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        select::-webkit-scrollbar-thumb {
          background: #FFC0CB;
          border-radius: 4px;
        }
        select::-webkit-scrollbar-thumb:hover {
          background: #FFB6C1;
        }
        .select-wrapper {
          position: relative;
        }
        .select-wrapper::after {
          content: '';
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          width: 0;
          height: 0;
          border-left: 5px solid transparent;
          border-right: 5px solid transparent;
          border-top: 5px solid #666;
          pointer-events: none;
        }
        ::-webkit-calendar-picker-indicator {
          cursor: pointer;
        }
        input[type="date"]::-webkit-datetime-edit-text,
        input[type="date"]::-webkit-datetime-edit-month-field,
        input[type="date"]::-webkit-datetime-edit-day-field,
        input[type="date"]::-webkit-datetime-edit-year-field {
          font-family: 'Do Hyeon', sans-serif !important;
        }
        .gender-radio-group {
          display: flex;
          gap: 8px;
        }
        
        .gender-radio-button {
          display: none;
        }
        
        .gender-radio-label {
          padding: 8px 16px;
          background-color: #f3f4f6;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: 'Do Hyeon', sans-serif;
        }
        
        #male:checked + .gender-radio-label {
          background-color: #89CFF0;
          color: white;
        }

        #female:checked + .gender-radio-label {
          background-color: #FFC0CB;
          color: white;
        }

        #unknown:checked + .gender-radio-label {
          background-color: #9CA3AF;
          color: white;
        }

        .week-selector {
          position: relative;
          width: 160px;
        }

        .week-selector select {
          width: 100%;
          padding: 8px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 20px;
          font-family: 'Do Hyeon', sans-serif !important;
          appearance: none;
          background-color: white;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .week-selector select:not([size]) {
          border: 2px solid #e5e7eb;
        }

        .week-selector select:not([size]):hover {
          border-color: #FFC0CB;
        }

        .week-selector select:not([size])::after {
          content: '';
          position: absolute;
          right: 12px;
          top: 50%;
          width: 10px;
          height: 10px;
          border-right: 2px solid #FFC0CB;
          border-bottom: 2px solid #FFC0CB;
          transform: translateY(-70%) rotate(45deg);
        }

        .week-selector select[size] {
          position: absolute;
          top: 0;
          left: 0;
          height: 200px !important;
          overflow-y: auto !important;
          border-radius: 12px;
          padding: 8px 0;
          border: 2px solid #FFC0CB;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          z-index: 10;
          background-color: white;
        }

        .week-selector select option {
          font-family: 'Do Hyeon', sans-serif !important;
          padding: 12px 16px;
          background-color: white;
          color: #4B5563;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .week-selector select option:hover,
        .week-selector select option:focus {
          background-color: #FFF4BB !important;
          color: #1F2937;
        }

        .week-selector select option:checked {
          background-color: #FFC0CB !important;
          color: white;
        }

        .week-selector select::-webkit-scrollbar {
          width: 8px;
          background-color: #f5f5f5;
        }

        .week-selector select::-webkit-scrollbar-thumb {
          background-color: #FFC0CB;
          border-radius: 4px;
          border: 2px solid #f5f5f5;
        }

        .week-selector select::-webkit-scrollbar-thumb:hover {
          background-color: #FFB6C1;
        }

        .week-selector select::-webkit-scrollbar-track {
          background-color: #f5f5f5;
          border-radius: 4px;
        }

        .week-selector select {
          scrollbar-width: thin;
          scrollbar-color: #FFC0CB #f5f5f5;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .week-selector select[size] {
          animation: fadeIn 0.2s ease-out;
        }

        /* 날짜 선택 캘린더 스타일링 */
        input[type="date"] {
          position: relative;
          font-family: 'Do Hyeon', sans-serif !important;
          background-color: white;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        input[type="date"]::-webkit-calendar-picker-indicator {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          width: 20px;
          height: 20px;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23FFE999' viewBox='0 0 24 24'%3E%3Cpath d='M20 3h-1V2c0-.6-.4-1-1-1s-1 .4-1 1v1H7V2c0-.6-.4-1-1-1S5 1.4 5 2v1H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13zM4 6V5h16v1H4z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: center;
          background-size: contain;
          opacity: 0.7;
          cursor: pointer;
          transition: opacity 0.3s ease;
        }

        input[type="date"]::-webkit-calendar-picker-indicator:hover {
          opacity: 1;
        }

        ::-webkit-datetime-edit {
          padding: 0;
          color: #4B5563;
        }

        ::-webkit-datetime-edit-fields-wrapper {
          padding: 0;
        }

        ::-webkit-datetime-edit-text {
          color: #9CA3AF;
          padding: 0 2px;
        }

        ::-webkit-datetime-edit-month-field,
        ::-webkit-datetime-edit-day-field,
        ::-webkit-datetime-edit-year-field {
          padding: 0;
          font-family: 'Do Hyeon', sans-serif;
        }

        ::-webkit-calendar-picker {
          border-radius: 12px;
          border: 2px solid #FFE999;
          background-color: white;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        /* Firefox 달력 스타일링 */
        input[type="date"]::-moz-calendar-picker {
          border-radius: 12px;
          border: 2px solid #FFE999;
        }

        /* 모바일 최적화 */
        @media (max-width: 768px) {
          input[type="date"] {
            font-size: 16px;
          }
        }

        /* 달력 애니메이션 */
        @keyframes calendarFadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        input[type="date"]::-webkit-calendar-picker {
          animation: calendarFadeIn 0.2s ease-out;
        }
      `}</style>
      <div className="w-96 h-[874px] relative bg-[#FFF4BB] overflow-hidden">
        <div className="w-96 h-[538px] left-0 top-[126px] absolute bg-white rounded-3xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.30)] shadow-[0px_1px_3px_1px_rgba(0,0,0,0.15)]">
          <div className="p-6">
            <Image 
              src="/images/logo/달달.png"
              alt="달달 이미지"
              width={54}
              height={63}
              className="mx-auto mb-4"
            />
            
            <div className="text-center text-xl font-['Do_Hyeon'] mb-6">
              홍길동 님의 임신정보
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex items-center justify-between">
                  <label className="text-gray-600 font-['Do_Hyeon']">태명</label>
                  <input
                    type="text"
                    value={formData.babyName}
                    onChange={(e) => setFormData({...formData, babyName: e.target.value})}
                    className="border rounded-lg px-3 py-1 font-['Do_Hyeon'] w-40 bg-white"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-gray-600 font-['Do_Hyeon']">성별</label>
                  <div className="gender-radio-group">
                    <input
                      type="radio"
                      id="male"
                      name="gender"
                      value="male"
                      checked={formData.gender === "male"}
                      onChange={handleGenderChange}
                      className="gender-radio-button"
                    />
                    <label htmlFor="male" className="gender-radio-label">남아</label>

                    <input
                      type="radio"
                      id="female"
                      name="gender"
                      value="female"
                      checked={formData.gender === "female"}
                      onChange={handleGenderChange}
                      className="gender-radio-button"
                    />
                    <label htmlFor="female" className="gender-radio-label">여아</label>

                    <input
                      type="radio"
                      id="unknown"
                      name="gender"
                      value="unknown"
                      checked={formData.gender === "unknown"}
                      onChange={handleGenderChange}
                      className="gender-radio-button"
                    />
                    <label htmlFor="unknown" className="gender-radio-label">모름</label>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-gray-600 font-['Do_Hyeon']">현재 임신 주차</label>
                  <div className="week-selector">
                    <select
                      value={formData.pregnancyWeek}
                      onChange={handleWeekChange}
                      onClick={() => setIsWeekSelectorOpen(!isWeekSelectorOpen)}
                      className="font-['Do_Hyeon']"
                      size={isWeekSelectorOpen ? 8 : undefined}
                    >
                      <option value="" className="font-['Do_Hyeon']">선택</option>
                      {weeks.map(week => (
                        <option key={week} value={week} className="font-['Do_Hyeon']">
                          {week}주차
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-gray-600 font-['Do_Hyeon']">출산 예정일</label>
                  <div className="relative flex items-center">
                    <span className="font-['Do_Hyeon'] mr-2">{formData.dueDate}</span>
                    <button
                      type="button"
                      onClick={() => setShowCalendar(true)}
                      className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-gray-600 font-['Do_Hyeon']">고위험 임신</label>
                  <input
                    type="checkbox"
                    checked={formData.isHighRisk}
                    onChange={(e) => setFormData({...formData, isHighRisk: e.target.checked})}
                    className="w-4 h-4"
                  />
                </div>
                <div className="flex justify-center gap-4 mt-8">
                  <button
                    type="submit"
                    className="bg-[#FFD600] text-white px-6 py-2 rounded-lg font-['Do_Hyeon'] hover:bg-[#E6C200] transition-colors"
                  >
                    저장
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="bg-gray-300 text-white px-6 py-2 rounded-lg font-['Do_Hyeon'] hover:bg-gray-400 transition-colors"
                  >
                    취소
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-['Do_Hyeon']">태명</span>
                    <span className="font-['Do_Hyeon']">{formData.babyName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-['Do_Hyeon']">성별</span>
                    <span className="font-['Do_Hyeon']">
                      {formData.gender === 'male' ? '남아' : 
                       formData.gender === 'female' ? '여아' : 
                       formData.gender === 'unknown' ? '모름' : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-['Do_Hyeon']">현재 임신 주차</span>
                    <span className="font-['Do_Hyeon']">{formData.pregnancyWeek}주차</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-['Do_Hyeon']">출산 예정일</span>
                    <span className="font-['Do_Hyeon']">{formData.dueDate}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-['Do_Hyeon']">출산까지 남은 일수</span>
                    <span className="font-['Do_Hyeon']">
                      {formData.daysUntilBirth !== undefined ? `${formData.daysUntilBirth}일` : '***일'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-12 h-12 absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-[#FFD600] rounded-full text-white font-['Do_Hyeon'] hover:bg-[#E6C200] transition-colors flex items-center justify-center"
                >
                  수정
                </button>
              </>
            )}
          </div>
        </div>

        <div className="left-[148px] top-[65px] absolute text-center justify-start text-neutral-700 text-2xl font-normal font-['Do_Hyeon'] leading-[50px]">
          내 임신 정보
        </div>
        <button 
          onClick={() => router.back()}
          className="left-[24px] top-[63px] absolute text-center justify-start text-neutral-700 text-2xl font-normal font-['Do_Hyeon'] leading-[50px]"
        >
          &lt;
        </button>

        {/* 하단 네비게이션 바 */}
        <div className="absolute bottom-0 w-full">
          <div className="w-[462px] h-52 relative">
            <div className="w-44 h-44 left-[-24px] top-[742px] absolute bg-white rounded-full" />
            <div className="w-44 h-44 left-[109px] top-[742px] absolute bg-white rounded-full" />
            <div className="w-44 h-44 left-[250px] top-[742px] absolute bg-white rounded-full" />
            <div className="w-44 h-44 left-[-28px] top-[723px] absolute bg-white/40 rounded-full" />
            <div className="w-44 h-44 left-[105px] top-[723px] absolute bg-white/40 rounded-full" />
            <div className="w-44 h-44 left-[246px] top-[723px] absolute bg-white/40 rounded-full" />
            
            {/* 채팅 아이콘 */}
            <div className="w-8 h-7 left-[52.71px] top-[786px] absolute bg-white rounded-full border-[3px] border-neutral-400" />
            <div className="w-2.5 h-1.5 left-[59.40px] top-[816.33px] absolute origin-top-left rotate-[-141.02deg] bg-white rounded-[0.50px] border-[3px] border-neutral-400" />
            <div className="w-1.5 h-1.5 left-[60.46px] top-[812.90px] absolute origin-top-left rotate-[-141.02deg] bg-white rounded-[0.50px] border-2 border-yellow-400/0" />
            
            {/* 캘린더 아이콘 */}
            <div className="w-8 h-7 left-[140.75px] top-[787.34px] absolute bg-white rounded-[5px] border-[3px] border-neutral-400" />
            <div className="w-7 h-0 left-[142.49px] top-[796.10px] absolute outline outline-[3px] outline-offset-[-1.50px] outline-neutral-400"></div>
            <div className="w-1 h-0 left-[146.83px] top-[784px] absolute origin-top-left rotate-90 outline outline-[3px] outline-offset-[-1.50px] outline-neutral-400"></div>
            <div className="w-1 h-0 left-[162.90px] top-[784px] absolute origin-top-left rotate-90 outline outline-[3px] outline-offset-[-1.50px] outline-neutral-400"></div>
            
            {/* 위치 아이콘 */}
            <div className="w-8 h-8 left-[222px] top-[784px] absolute overflow-hidden">
              <div className="w-5 h-7 left-[6.88px] top-[2.75px] absolute bg-neutral-400" />
            </div>
            
            {/* 마이페이지 아이콘 */}
            <div className="w-4 h-4 left-[323.75px] top-[787px] absolute bg-white rounded-full border-[3px] border-yellow-400" />
            <div className="w-9 h-3.5 left-[314.40px] top-[803.78px] absolute bg-white rounded-[5px] border-[3px] border-yellow-400" />
            <div className="w-10 h-1 left-[310.68px] top-[813.46px] absolute bg-white" />

            {/* 네비게이션 텍스트 */}
            <div className="w-20 h-16 left-[25px] top-[803px] absolute text-center justify-start text-neutral-400 text-xs font-normal font-['Do_Hyeon'] leading-[50px]">채팅</div>
            <div className="w-9 h-8 left-[138px] top-[803px] absolute text-center justify-start text-neutral-400 text-xs font-normal font-['Do_Hyeon'] leading-[50px]">캘린더</div>
            <div className="w-20 h-10 left-[201px] top-[802.60px] absolute text-center justify-start text-neutral-400 text-xs font-normal font-['Do_Hyeon'] leading-[50px]">위치</div>
            <div className="w-20 h-10 left-[293px] top-[802.60px] absolute text-center justify-start text-yellow-400 text-xs font-normal font-['Do_Hyeon'] leading-[50px]">마이페이지</div>
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
                  className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="text-base font-['Do_Hyeon'] text-gray-900">
                  {formatYearMonth(currentMonth)}
                </div>
                <button
                  onClick={() => changeMonth(1)}
                  className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* 요일 헤더 */}
              <div className="grid grid-cols-7 mb-1">
                {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
                  <div
                    key={day}
                    className={`text-center text-sm font-['Do_Hyeon'] py-1 ${
                      index === 0 ? 'text-red-500' :
                      index === 6 ? 'text-blue-500' :
                      'text-gray-600'
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* 달력 날짜 */}
              <div className="grid grid-cols-7 gap-0.5">
                {generateCalendarDays().map((day, index) => (
                  <button
                    key={index}
                    onClick={() => handleDateSelect(day.date)}
                    disabled={!day.isCurrentMonth}
                    className={`
                      w-10 h-10 flex items-center justify-center text-sm font-['Do_Hyeon'] rounded-full
                      ${day.isCurrentMonth
                        ? day.date.toISOString().split('T')[0] === formData.dueDate
                          ? 'bg-[#FFE999] text-gray-900 font-bold'
                          : 'hover:bg-gray-100 text-gray-900'
                        : 'text-gray-400'
                      }
                      ${day.date.getDay() === 0 ? 'text-red-500' : ''}
                      ${day.date.getDay() === 6 ? 'text-blue-500' : ''}
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
      </div>
    </div>
  );
} 