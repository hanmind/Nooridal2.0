import React, { useState } from 'react';

interface DateTimePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (date: string, time: string) => void;
  initialDate: string;
  initialTime: string;
  type: 'date' | 'time';
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({
  isOpen,
  onClose,
  onSelect,
  initialDate,
  initialTime,
  type
}) => {
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [selectedTime, setSelectedTime] = useState(initialTime);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });

  if (!isOpen) return null;

  const hours = Array.from({ length: 24 }, (_, i) => {
    const hour = i;
    return `${hour < 12 ? '오전' : '오후'} ${hour < 12 ? hour : hour - 12 || 12}시`;
  });

  const minutes = Array.from({ length: 12 }, (_, i) => `${i * 5}분`);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDateValue = (date: Date) => {
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDayOfMonth = getFirstDayOfMonth(currentMonth);
    const days = [];
    
    // 요일 헤더
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    days.push(
      <div key="header" className="grid grid-cols-7 mb-2">
        {dayNames.map((day, index) => (
          <div 
            key={day} 
            className={`text-center text-sm font-['Do_Hyeon'] ${
              index === 0 ? 'text-red-400' : index === 6 ? 'text-indigo-400' : ''
            }`}
          >
            {day}
          </div>
        ))}
      </div>
    );

    // 날짜 그리드
    const dateGrid = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      dateGrid.push(<div key={`empty-${i}`} />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const dateValue = formatDateValue(date);
      const isSelected = dateValue === selectedDate;
      const dayOfWeek = (firstDayOfMonth + day - 1) % 7;
      
      dateGrid.push(
        <button
          key={day}
          className={`h-8 flex items-center justify-center rounded-full text-sm font-['Do_Hyeon']
            ${isSelected ? 'bg-yellow-100' : 'hover:bg-yellow-50'}
            ${dayOfWeek === 0 ? 'text-red-400' : dayOfWeek === 6 ? 'text-indigo-400' : ''}
          `}
          onClick={() => {
            setSelectedDate(dateValue);
            onSelect(dateValue, selectedTime);
            onClose();
          }}
        >
          {day}
        </button>
      );
    }

    days.push(
      <div key="dates" className="grid grid-cols-7 gap-1">
        {dateGrid}
      </div>
    );

    return days;
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/30 z-50"
        onClick={onClose}
      />
      
      <div className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white z-50 shadow-lg rounded-[20px] p-4
        ${type === 'date' ? 'w-[280px]' : 'w-[250px]'}`}
      >
        {type === 'date' ? (
          <div>
            {/* 월 선택 헤더 */}
            <div className="flex items-center justify-between mb-4">
              <button 
                className="w-8 h-8 flex items-center justify-center text-neutral-600 hover:bg-yellow-50 rounded-full"
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
              >
                ←
              </button>
              <div className="font-['Do_Hyeon'] text-lg">
                {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
              </div>
              <button 
                className="w-8 h-8 flex items-center justify-center text-neutral-600 hover:bg-yellow-50 rounded-full"
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
              >
                →
              </button>
            </div>
            {renderCalendar()}
          </div>
        ) : (
          <div className="flex gap-4">
            <div className="flex-1 h-[150px] overflow-y-auto custom-scrollbar">
              {hours.map((hour) => (
                <button
                  key={hour}
                  className={`w-full py-1.5 px-4 text-left font-['Do_Hyeon'] text-sm rounded-full transition-colors
                    ${selectedTime.includes(hour) ? 'bg-yellow-100' : 'hover:bg-yellow-50'}`}
                  onClick={() => {
                    const newTime = `${hour} 00분`;
                    setSelectedTime(newTime);
                    onSelect(selectedDate, newTime);
                    onClose();
                  }}
                >
                  {hour}
                </button>
              ))}
            </div>
            <div className="w-[1px] bg-neutral-200" />
            <div className="flex-1 h-[150px] overflow-y-auto custom-scrollbar">
              {minutes.map((minute) => (
                <button
                  key={minute}
                  className={`w-full py-1.5 px-4 text-left font-['Do_Hyeon'] text-sm rounded-full transition-colors
                    ${selectedTime.includes(minute) ? 'bg-yellow-100' : 'hover:bg-yellow-50'}`}
                  onClick={() => {
                    const hour = selectedTime.split(' ')[0] + ' ' + selectedTime.split(' ')[1];
                    const newTime = `${hour} ${minute}`;
                    setSelectedTime(newTime);
                    onSelect(selectedDate, newTime);
                    onClose();
                  }}
                >
                  {minute}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #FFD93D;
          border-radius: 2px;
        }
      `}</style>
    </>
  );
};

interface SchedulePopupProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
}

const SchedulePopup: React.FC<SchedulePopupProps> = ({ isOpen, onClose, selectedDate }) => {
  const formatDate = (date: Date) => {
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  };

  const [startDate, setStartDate] = useState(formatDate(selectedDate));
  const [startTime, setStartTime] = useState('오전 8시 00분');
  const [endDate, setEndDate] = useState(formatDate(selectedDate));
  const [endTime, setEndTime] = useState('오전 8시 00분');
  const [selectedDuration, setSelectedDuration] = useState<string>('');
  const [selectedRepeat, setSelectedRepeat] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  
  const [isStartDatePickerOpen, setIsStartDatePickerOpen] = useState(false);
  const [isStartTimePickerOpen, setIsStartTimePickerOpen] = useState(false);
  const [isEndDatePickerOpen, setIsEndDatePickerOpen] = useState(false);
  const [isEndTimePickerOpen, setIsEndTimePickerOpen] = useState(false);

  const colors = [
    { bg: 'bg-blue-200', value: 'blue' },
    { bg: 'bg-green-200', value: 'green' },
    { bg: 'bg-pink-200', value: 'pink' },
    { bg: 'bg-red-200', value: 'red' },
    { bg: 'bg-purple-200', value: 'purple' }
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* 반투명 배경 */}
      <div 
        className="fixed inset-0 bg-black/30 z-50"
        onClick={onClose}
      />
      
      {/* 팝업 */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] bg-white z-50 shadow-lg rounded-[20px] p-6">
        {/* 제목 */}
        <div className="text-xl font-['Do_Hyeon'] text-center mb-6">
          일정 등록
        </div>

        {/* 일정 입력 폼 */}
        <div className="space-y-6">
          {/* 일정 제목 입력 */}
          <div>
            <input
              type="text"
              placeholder="일정을 입력하세요"
              className="w-full p-2 border-b border-neutral-200 focus:outline-none font-['Do_Hyeon'] text-neutral-600"
            />
          </div>

          {/* 시작 시간 */}
          <div className="flex items-center gap-2">
            <div className="text-sm font-['Do_Hyeon']">시작</div>
            <div className="flex gap-2">
              <button 
                className="bg-yellow-100 px-4 py-1 rounded-full text-sm font-['Do_Hyeon'] hover:bg-yellow-200 transition-colors"
                onClick={() => setIsStartDatePickerOpen(true)}
              >
                {startDate}
              </button>
              <button 
                className="bg-yellow-100 px-4 py-1 rounded-full text-sm font-['Do_Hyeon'] hover:bg-yellow-200 transition-colors"
                onClick={() => setIsStartTimePickerOpen(true)}
              >
                {startTime}
              </button>
            </div>
          </div>

          {/* 종료 시간 */}
          <div className="flex items-center gap-2">
            <div className="text-sm font-['Do_Hyeon']">종료</div>
            <div className="flex gap-2">
              <button 
                className="bg-yellow-100 px-4 py-1 rounded-full text-sm font-['Do_Hyeon'] hover:bg-yellow-200 transition-colors"
                onClick={() => setIsEndDatePickerOpen(true)}
              >
                {endDate}
              </button>
              <button 
                className="bg-yellow-100 px-4 py-1 rounded-full text-sm font-['Do_Hyeon'] hover:bg-yellow-200 transition-colors"
                onClick={() => setIsEndTimePickerOpen(true)}
              >
                {endTime}
              </button>
            </div>
          </div>

          {/* 알림 */}
          <div>
            <div className="text-sm font-['Do_Hyeon'] mb-2">알림</div>
            <div className="flex gap-2">
              <button 
                className={`px-4 py-1 rounded-full text-sm font-['Do_Hyeon'] ${selectedDuration === '10분' ? 'bg-yellow-100' : 'bg-neutral-100'}`}
                onClick={() => setSelectedDuration(selectedDuration === '10분' ? '' : '10분')}
              >
                10분
              </button>
              <button 
                className={`px-4 py-1 rounded-full text-sm font-['Do_Hyeon'] ${selectedDuration === '30분' ? 'bg-yellow-100' : 'bg-neutral-100'}`}
                onClick={() => setSelectedDuration(selectedDuration === '30분' ? '' : '30분')}
              >
                30분
              </button>
              <button 
                className={`px-4 py-1 rounded-full text-sm font-['Do_Hyeon'] ${selectedDuration === '60분' ? 'bg-yellow-100' : 'bg-neutral-100'}`}
                onClick={() => setSelectedDuration(selectedDuration === '60분' ? '' : '60분')}
              >
                60분
              </button>
            </div>
          </div>

          {/* 반복 설정 */}
          <div>
            <div className="text-sm font-['Do_Hyeon'] mb-2">반복</div>
            <div className="flex gap-2">
              <button 
                className={`px-4 py-1 rounded-full text-sm font-['Do_Hyeon'] ${selectedRepeat === '매일' ? 'bg-yellow-100' : 'bg-neutral-100'}`}
                onClick={() => setSelectedRepeat(selectedRepeat === '매일' ? '' : '매일')}
              >
                매일
              </button>
              <button 
                className={`px-4 py-1 rounded-full text-sm font-['Do_Hyeon'] ${selectedRepeat === '매주' ? 'bg-yellow-100' : 'bg-neutral-100'}`}
                onClick={() => setSelectedRepeat(selectedRepeat === '매주' ? '' : '매주')}
              >
                매주
              </button>
              <button 
                className={`px-4 py-1 rounded-full text-sm font-['Do_Hyeon'] ${selectedRepeat === '매월' ? 'bg-yellow-100' : 'bg-neutral-100'}`}
                onClick={() => setSelectedRepeat(selectedRepeat === '매월' ? '' : '매월')}
              >
                매월
              </button>
            </div>
          </div>

          {/* 색상 선택 */}
          <div>
            <div className="text-sm font-['Do_Hyeon'] mb-2">색상</div>
            <div className="flex gap-2">
              {colors.map((color) => (
                <button 
                  key={color.value}
                  className={`w-8 h-8 rounded-full ${color.bg} relative`}
                  onClick={() => setSelectedColor(selectedColor === color.value ? '' : color.value)}
                >
                  {selectedColor === color.value && (
                    <div className="absolute inset-0 flex items-center justify-center text-neutral-600">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 24 24" 
                        fill="currentColor" 
                        className="w-3 h-3"
                      >
                        <path 
                          fillRule="evenodd" 
                          d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" 
                          clipRule="evenodd" 
                        />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 메모 입력 */}
          <div>
            <input
              type="text"
              placeholder="메모를 입력하세요"
              className="w-full p-2 border-b border-neutral-200 focus:outline-none font-['Do_Hyeon'] text-neutral-600"
            />
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="flex gap-4 mt-6">
          <button 
            className="flex-1 py-2 rounded-[20px] bg-neutral-200 text-neutral-600 font-['Do_Hyeon']"
            onClick={onClose}
          >
            취소
          </button>
          <button className="flex-1 py-2 rounded-[20px] bg-blue-300 text-white font-['Do_Hyeon']">
            등록
          </button>
        </div>
      </div>

      {/* Date/Time Pickers */}
      <DateTimePicker
        isOpen={isStartDatePickerOpen}
        onClose={() => setIsStartDatePickerOpen(false)}
        onSelect={(date, time) => setStartDate(date)}
        initialDate={startDate}
        initialTime={startTime}
        type="date"
      />
      <DateTimePicker
        isOpen={isStartTimePickerOpen}
        onClose={() => setIsStartTimePickerOpen(false)}
        onSelect={(date, time) => setStartTime(time)}
        initialDate={startDate}
        initialTime={startTime}
        type="time"
      />
      <DateTimePicker
        isOpen={isEndDatePickerOpen}
        onClose={() => setIsEndDatePickerOpen(false)}
        onSelect={(date, time) => setEndDate(date)}
        initialDate={endDate}
        initialTime={endTime}
        type="date"
      />
      <DateTimePicker
        isOpen={isEndTimePickerOpen}
        onClose={() => setIsEndTimePickerOpen(false)}
        onSelect={(date, time) => setEndTime(time)}
        initialDate={endDate}
        initialTime={endTime}
        type="time"
      />
    </>
  );
};

export default SchedulePopup; 