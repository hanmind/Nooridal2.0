import React, { useState } from 'react';
import DatePopup from '@/app/calendar/DatePopup';
import SchedulePopup from '@/app/calendar/SchedulePopup';

const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isMonthSelectorOpen, setIsMonthSelectorOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isSchedulePopupOpen, setIsSchedulePopupOpen] = useState(false);
  const [initialTab, setInitialTab] = useState<'schedule' | 'diary' | 'today'>('schedule');
  
  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();
  
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();
  
  const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const months = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];
  
  const handleMonthSelect = (monthIndex: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(monthIndex);
    setCurrentDate(newDate);
    setIsMonthSelectorOpen(false);
  };

  // 달력 그리드 계산
  const totalWidth = 372; // 전체 달력 너비
  const dayWidth = totalWidth / 7; // 각 요일 칸의 너비
  const startLeft = 20; // 시작 위치
  
  return (
    <div className="w-96 h-[874px] relative bg-'#FFF4BB'  overflow-hidden">
      {/* 배경 장식 요소 오른쪽 */}
      <div className="w-32 h-20 left-[-63px] top-[1px] absolute bg-white rounded-full blur-[2px]" />
      <div className="w-32 h-20 right-[-52px] top-[-10px] absolute bg-white rounded-full blur-[2px]" />
      <div className="w-28 h-16 right-[-100px] top-[24.58px] absolute bg-white rounded-full blur-[2px]" />
      <div className="w-28 h-14 right-[-80px] top-[54.05px] absolute bg-white rounded-full blur-[2px]" />
      <div className="w-24 h-14 right-[-30px] top-[46px] absolute bg-white rounded-full blur-[2px]" />
      <div className="w-28 h-16 right-0 top-[21px] absolute bg-white rounded-full blur-[2px]" />
      <div className="absolute right-[18px] top-[42px]">
        {/* 상단 알람 버튼 */}
        <div 
          className="material-symbols--notifications-outline-rounded bg-neutral-400 cursor-pointer hover:opacity-80 transition-opacity" 
          onClick={() => setIsNotificationOpen(!isNotificationOpen)}
          style={{
            display: 'inline-block',
            width: '36px',
            height: '36px',
            '--svg': 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\'%3E%3Cpath fill=\'%23000\' d=\'M5 19q-.425 0-.712-.288T4 18t.288-.712T5 17h1v-7q0-2.075 1.25-3.687T10.5 4.2v-.7q0-.625.438-1.062T12 2t1.063.438T13.5 3.5v.7q2 .5 3.25 2.113T18 10v7h1q.425 0 .713.288T20 18t-.288.713T19 19zm7 3q-.825 0-1.412-.587T10 20h4q0 .825-.587 1.413T12 22m-4-5h8v-7q0-1.65-1.175-2.825T12 6T9.175 7.175T8 10z\'/%3E%3C/svg%3E")',
            backgroundColor: 'currentColor',
            WebkitMaskImage: 'var(--svg)',
            maskImage: 'var(--svg)',
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            WebkitMaskSize: '100% 100%',
            maskSize: '100% 100%'
          } as React.CSSProperties}
        />
      </div>

      
    
      {/* 알림 패널 오버레이 */}
      {isNotificationOpen && (
        <>
          {/* 반투명 배경 */}
          <div 
            className="fixed inset-0 bg-black/30 z-30"
            onClick={() => setIsNotificationOpen(false)}
          />
          
          {/* 알림 패널 */}
          <div className="fixed right-0 top-0 w-[250px] h-full bg-white z-40 shadow-lg transform transition-transform duration-300 ease-in-out rounded-l-[20px]">
            {/* 헤더 */}
            <div className="flex items-center justify-between px-4 pt-8 pb-4 border-b border-gray-100 mt-[30px]">
              <div className="w-9 h-9 opacity-0">
                {/* 빈 공간 유지를 위한 투명한 요소 */}
              </div>
              <div className="text-xl font-['Do_Hyeon'] flex-1 text-center">알림</div>
              <div className="w-9 h-9 opacity-0">
                {/* 빈 공간 유지를 위한 투명한 요소 */}
              </div>
            </div>
            
            {/* Exit 아이콘 */}
            <div 
              className="absolute bottom-6 left-6 w-10 h-10 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setIsNotificationOpen(false)}
            >
              <div style={{
                display: 'inline-block',
                width: '100%',
                height: '100%',
                '--svg': 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\'%3E%3Cpath fill=\'%239CA3AF\' d=\'M5 21q-.825 0-1.413-.587Q3 19.825 3 19V5q0-.825.587-1.413Q4.175 3 5 3h7v2H5v14h7v2Zm11-4-1.375-1.45 2.55-2.55H9v-2h8.175l-2.55-2.55L16 7l5 5Z\'/%3E%3C/svg%3E")',
                backgroundColor: 'currentColor',
                WebkitMaskImage: 'var(--svg)',
                maskImage: 'var(--svg)',
                WebkitMaskRepeat: 'no-repeat',
                maskRepeat: 'no-repeat',
                WebkitMaskSize: '100% 100%',
                maskSize: '100% 100%',
                color: '#9CA3AF'
              } as React.CSSProperties} />
            </div>
            
            {/* 알림 내용 */}
            <div className="p-4">
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-yellow-400 mt-2"></div>
                  <div>
                    <div className="text-sm text-neutral-600 font-['Do_Hyeon']">오늘의 일정이 있습니다.</div>
                    <div className="text-xs text-neutral-400 mt-1">10:00 AM</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-yellow-400 mt-2"></div>
                  <div>
                    <div className="text-sm text-neutral-600 font-['Do_Hyeon']">내일 일정이 있습니다.</div>
                    <div className="text-xs text-neutral-400 mt-1">2:30 PM</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      
      {/* 배경 장식 요소 왼쪽*/}
      <div className="w-32 h-20 left-[-63px] top-[1px] absolute bg-white rounded-full blur-[2px]" />
      <div className="w-32 h-20 left-[-52px] top-[-10px] absolute bg-white rounded-full blur-[2px]" />
      <div className="w-28 h-16 left-[-100px] top-[24.58px] absolute bg-white rounded-full blur-[2px]" />
      <div className="w-28 h-14 left-[-80px] top-[54.05px] absolute bg-white rounded-full blur-[2px]" />
      <div className="w-24 h-14 left-[-30px] top-[46px] absolute bg-white rounded-full blur-[2px]" />
      <div className="w-28 h-16 left-0 top-[21px] absolute bg-white rounded-full blur-[2px]" />
      {/* 상단 메뉴 버튼 */}
      <div 
        className="cursor-pointer absolute left-[23px] top-[50px] z-10"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        <div className="w-6 h-1 bg-zinc-500 mb-[6px]" />
        <div className="w-6 h-1 bg-zinc-500 mb-[6px]" />
        <div className="w-6 h-1 bg-zinc-500" />
      </div>

      {/* 메뉴 패널 오버레이 */}
      {isMenuOpen && (
        <>
          {/* 반투명 배경 */}
          <div 
            className="fixed inset-0 bg-black/30 z-30"
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* 메뉴 패널 */}
          <div className="fixed left-0 top-0 w-[250px] h-full bg-white z-40 shadow-lg transform transition-transform duration-300 ease-in-out rounded-r-[20px]">
            {/* 헤더 */}
            <div className="flex items-center justify-between px-4 pt-8 pb-4 border-b border-gray-100 mt-[30px]">
              <div className="text-xl font-['Do_Hyeon'] flex-1 text-center">메뉴</div>
            </div>
            
            {/* 메뉴 항목들 */}
            <div className="p-4">
              <div className="flex flex-col">
                <div 
                  className="py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50"
                  onClick={() => {
                    setIsSchedulePopupOpen(true);
                    setIsMenuOpen(false);
                  }}
                >
                  <div className="text-base text-neutral-700 font-['Do_Hyeon']">일정</div>
                </div>
                <div 
                  className="py-3 border-b border-gray-100"
                  onClick={() => {
                    setSelectedDate(new Date());
                    setInitialTab('today');
                    setIsMenuOpen(false);
                  }}
                >
                  <div className="text-base text-neutral-700 font-['Do_Hyeon']">오늘의 하루</div>
                </div>
                <div 
                  className="py-3 border-b border-gray-100"
                  onClick={() => {
                    setSelectedDate(new Date());
                    setInitialTab('diary');
                    setIsMenuOpen(false);
                  }}
                >
                  <div className="text-base text-neutral-700 font-['Do_Hyeon']">아기와의 하루</div>
                </div>
              </div>
            </div>

            {/* Exit 아이콘 */}
            <div 
              className="absolute bottom-6 right-6 w-10 h-10 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setIsMenuOpen(false)}
            >
              <div style={{
                display: 'inline-block',
                width: '100%',
                height: '100%',
                '--svg': 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\'%3E%3Cpath fill=\'%239CA3AF\' d=\'M5 21q-.825 0-1.413-.587Q3 19.825 3 19V5q0-.825.587-1.413Q4.175 3 5 3h7v2H5v14h7v2Zm11-4-1.375-1.45 2.55-2.55H9v-2h8.175l-2.55-2.55L16 7l5 5Z\'/%3E%3C/svg%3E")',
                backgroundColor: 'currentColor',
                WebkitMaskImage: 'var(--svg)',
                maskImage: 'var(--svg)',
                WebkitMaskRepeat: 'no-repeat',
                maskRepeat: 'no-repeat',
                WebkitMaskSize: '100% 100%',
                maskSize: '100% 100%',
                color: '#9CA3AF'
              } as React.CSSProperties} />
            </div>
          </div>
        </>
      )}

      {/* 요일 헤더 */}
      {dayNames.map((day, index) => {
        const leftPosition = startLeft + (index * dayWidth);
        const isSunday = index === 0;
        const isSaturday = index === 6;
        
        return (
          <div 
            key={`header-${day}`}
            className={`w-5 h-14 absolute text-center justify-start text-l font-normal font-['Do_Hyeon'] leading-[50px] ${
              isSunday ? 'text-red-400' : isSaturday ? 'text-indigo-400' : 'text-black'
            }`}
            style={{ left: `${leftPosition}px`, top: '145px' }}
          >
            {day}
          </div>
        );
      })}
      
      {/* 월 표시 */}
      <div className="left-[148px] top-[79px] absolute text-center text-neutral-700 text-2xl font-['Do_Hyeon'] leading-[50px]">
        {currentDate.getFullYear()}.{String(currentDate.getMonth() + 1).padStart(2, '0')}
        <svg 
          width="25" 
          height="30" 
          viewBox="0 4 30 25" 
          fill="none" 
          className="absolute right-[-35px] top-[50%] translate-y-[-50%] cursor-pointer transition-transform duration-300 hover:scale-110"
          onClick={() => setIsMonthSelectorOpen(!isMonthSelectorOpen)}
        >
          <path 
            d="M15 22C15 22 6 11 6 11C6 11 24 11 24 11C24 11 15 22 15 22Z" 
            fill="#FCD34D"
            stroke="#FCD34D"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* 월 선택 박스 */}
        {isMonthSelectorOpen && (
          <div className="absolute right-[-100px] top-[60px] w-[200px] bg-white rounded-2xl shadow-lg p-4 grid grid-cols-3 gap-2 z-10 border-2 border-yellow-100">
            {months.map((month, index) => (
              <div
                key={month}
                onClick={() => handleMonthSelect(index)}
                className={`p-2 text-base cursor-pointer rounded-lg transition-colors duration-200 hover:bg-yellow-50
                  ${currentDate.getMonth() === index ? 'bg-yellow-100 text-yellow-600' : 'text-neutral-600'}
                `}
              >
                {month}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* 달력 날짜 */}
      {Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        const dayOfWeek = (firstDayOfMonth + i) % 7;
        const isSunday = dayOfWeek === 0;
        const isSaturday = dayOfWeek === 6;
        const isToday = 
          day === new Date().getDate() && 
          currentDate.getMonth() === new Date().getMonth() && 
          currentDate.getFullYear() === new Date().getFullYear();
        
        // 날짜 위치 계산
        const row = Math.floor((firstDayOfMonth + i) / 7);
        const col = (firstDayOfMonth + i) % 7;
        
        // 위치 계산 (요일 헤더와 동일한 간격 유지)
        const leftPosition = startLeft + (col * dayWidth);
        const topPosition = 185 + (row * 101);
        
        return (
          <div 
            key={`day-${day}`}
            className={`absolute text-center justify-start text-base font-normal font-['Do_Hyeon'] leading-[50px] w-6 h-6 flex items-center justify-center cursor-pointer hover:bg-yellow-50 transition-colors ${
              isToday ? 'bg-yellow-200 rounded-[30px]' : ''
            } ${
              isSunday ? 'text-red-400' : isSaturday ? 'text-indigo-400' : 'text-black'
            }`}
            style={{ 
              left: `${leftPosition}px`, 
              top: `${topPosition}px`,
              backgroundColor: isToday ? '#fef3c7' : 'transparent' 
            }}
            onClick={() => {
              const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
              setSelectedDate(clickedDate);
            }}
          >
            {day}
          </div>
        );
      })}
      
    
      
  

      {/* DatePopup */}
      {selectedDate && (
        <DatePopup
          date={selectedDate}
          isOpen={true}
          onClose={() => setSelectedDate(null)}
          initialTab={initialTab}
        />
      )}

      {/* SchedulePopup */}
      <SchedulePopup
        isOpen={isSchedulePopupOpen}
        onClose={() => setIsSchedulePopupOpen(false)}
        selectedDate={new Date()}
      />
    </div>
  );
};

export default Calendar; 