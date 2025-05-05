import React, { useState, useEffect } from 'react';
import { supabase, getCurrentUser } from '@/utils/supabase';
import { RRule } from 'rrule';

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
  onEventAdded?: () => void; // 일정 추가 후 캘린더 갱신을 위한 콜백
  eventToEdit?: Event | null; // 수정할 이벤트 객체
}

// 일정 타입 정의
interface Event {
  id: string;
  title: string;
  start_time: string;
  end_time: string | null;
  color: string | null;
  all_day: boolean | null;
  description?: string | null;
  user_id: string | null;
  notification_time?: string | null;
  repeat_pattern?: string | null;
  // 반복 일정 관련 필드 추가
  rrule?: string | null;
  exdate?: string[] | null;
  recurring_event_id?: string | null;
}

const SchedulePopup: React.FC<SchedulePopupProps> = ({ 
  isOpen, 
  onClose, 
  selectedDate, 
  onEventAdded,
  eventToEdit 
}) => {
  const formatDate = (date: Date) => {
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  };

  // 폼 상태 관리
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(formatDate(selectedDate));
  const [startTime, setStartTime] = useState('오전 8시 00분');
  const [endDate, setEndDate] = useState(formatDate(selectedDate));
  const [endTime, setEndTime] = useState('오전 8시 00분');
  const [selectedDuration, setSelectedDuration] = useState<string>('');
  const [selectedRepeat, setSelectedRepeat] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('blue'); // 기본 색상 설정
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  const [isStartDatePickerOpen, setIsStartDatePickerOpen] = useState(false);
  const [isStartTimePickerOpen, setIsStartTimePickerOpen] = useState(false);
  const [isEndDatePickerOpen, setIsEndDatePickerOpen] = useState(false);
  const [isEndTimePickerOpen, setIsEndTimePickerOpen] = useState(false);

  // 컴포넌트 마운트 시 사용자 정보 가져오기
  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUser();
      setCurrentUser(user);
    };
    
    fetchUser();
  }, []);

  const colors = [
    { bg: 'bg-blue-200', value: 'blue' },
    { bg: 'bg-green-200', value: 'green' },
    { bg: 'bg-pink-200', value: 'pink' },
    { bg: 'bg-red-200', value: 'red' },
    { bg: 'bg-purple-200', value: 'purple' }
  ];

  // 시간 변환 함수: "오전 8시 00분" -> "08:00:00"
  const parseTimeToISO = (timeString: string) => {
    try {
      // 입력값 검증
      if (!timeString || typeof timeString !== 'string') {
        console.error('유효하지 않은 시간 형식:', timeString);
        return '00:00:00'; // 기본값 반환
      }
      
      const parts = timeString.split(' ');
      if (parts.length < 2) {
        console.error('시간 형식 오류:', timeString);
        return '00:00:00';
      }
      
      const period = parts[0]; // 오전 또는 오후
      const timeSegment = parts[1]; // '8시'
      
      if (!timeSegment || !timeSegment.includes('시')) {
        console.error('시간 세그먼트 오류:', timeSegment);
        return '00:00:00';
      }
      
      let hourStr = timeSegment.split('시')[0];
      let hourNum = parseInt(hourStr);
      
      // 시간대 변환
      if (period === '오후' && hourNum < 12) hourNum += 12;
      if (period === '오전' && hourNum === 12) hourNum = 0;
      
      // 분 처리
      let min = '00';
      if (parts.length > 2 && parts[2].includes('분')) {
        min = parts[2].replace('분', '');
      }
      
      return `${String(hourNum).padStart(2, '0')}:${min.padStart(2, '0')}:00`;
    } catch (err) {
      console.error('시간 변환 중 오류 발생:', err, timeString);
      return '00:00:00'; // 오류 시 기본값 반환
    }
  };

  // 날짜 변환 함수: "2023.05.25" -> "2023-05-25"
  const parseDateToISO = (dateString: string) => {
    try {
      // 입력값 검증
      if (!dateString || typeof dateString !== 'string') {
        console.error('유효하지 않은 날짜 형식:', dateString);
        return new Date().toISOString().split('T')[0]; // 오늘 날짜 반환
      }

      // YYYY.MM.DD 형식 검증
      if (!/^\d{4}\.\d{2}\.\d{2}$/.test(dateString)) {
        console.error('날짜 형식 오류 (YYYY.MM.DD 형식이어야 함):', dateString);
        return new Date().toISOString().split('T')[0];
      }

      // 점을 대시로 변환
      return dateString.replace(/\./g, '-');
    } catch (err) {
      console.error('날짜 변환 중 오류 발생:', err, dateString);
      return new Date().toISOString().split('T')[0]; // 오류 시 오늘 날짜 반환
    }
  };

  // ISO 형식의 날짜/시간을 UI 형식으로 변환
  const formatISODateToUIDate = (isoDateString: string) => {
    const date = new Date(isoDateString);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  };

  const formatISOTimeToUITime = (isoDateString: string) => {
    const date = new Date(isoDateString);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? '오후' : '오전';
    const displayHours = hours % 12 || 12;
    
    return `${period} ${displayHours}시 ${minutes.toString().padStart(2, '0')}분`;
  };

  // 이벤트 수정 모드일 경우 기존 이벤트 정보 채우기
  useEffect(() => {
    if (eventToEdit) {
      setIsEditMode(true);
      setTitle(eventToEdit.title);
      setDescription(eventToEdit.description || '');
      
      // 시작 날짜/시간 설정
      const startDate = new Date(eventToEdit.start_time);
      setStartDate(formatISODateToUIDate(eventToEdit.start_time));
      setStartTime(formatISOTimeToUITime(eventToEdit.start_time));
      
      // 종료 날짜/시간 설정
      if (eventToEdit.end_time) {
        setEndDate(formatISODateToUIDate(eventToEdit.end_time));
        setEndTime(formatISOTimeToUITime(eventToEdit.end_time));
      }
      
      // 색상 설정
      if (eventToEdit.color) {
        setSelectedColor(eventToEdit.color);
      }

      // 알림 및 반복 설정
      if (eventToEdit.notification_time) {
        setSelectedDuration(eventToEdit.notification_time);
      }
      
      if (eventToEdit.repeat_pattern) {
        setSelectedRepeat(eventToEdit.repeat_pattern);
      }
    }
  }, [eventToEdit]);

  // ISO 날짜/시간 조합 - 타임존 처리
  // 사용자 로컬 시간대로 Date 객체 생성 후 ISO 문자열로 변환하여 Z 접미사(UTC) 제거
  const createLocalISOString = (dateStr: string, timeStr: string) => {
    // 날짜와 시간 문자열 결합
    const localDateTimeStr = `${dateStr}T${timeStr}`;
    // 로컬 시간대로 해석
    const date = new Date(localDateTimeStr);
    
    // ISO 문자열에서 Z(UTC 표시) 제거
    return date.toISOString().replace('Z', '');
  };
  
  // 날짜와 시간을 조합하는 함수
  const combineDateTime = (dateStr: string, timeStr: string, isAllDay: boolean) => {
    if (isAllDay) {
      // 하루종일 이벤트의 경우 시간 부분 없이 날짜만 사용
      return `${dateStr}T00:00:00`;
    }
    // 날짜와 시간 문자열 결합
    const localDateTimeStr = `${dateStr}T${timeStr}`;
    // 로컬 시간대로 해석
    const date = new Date(localDateTimeStr);
    
    // ISO 문자열에서 Z(UTC 표시) 제거
    return date.toISOString().replace('Z', '');
  };

  // 일정 저장/수정하기
  const saveEvent = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!title.trim()) {
        setError('일정 제목을 입력해주세요.');
        return;
      }
      
      // 로그인 확인
      if (!currentUser?.id) {
        setError('로그인이 필요합니다.');
        return;
      }
      
      // 날짜 및 시간 파싱
      const startDateISO = parseDateToISO(startDate);
      const startTimeISO = parseTimeToISO(startTime);
      const endDateISO = parseDateToISO(endDate);
      const endTimeISO = parseTimeToISO(endTime);
      
      // ISO 날짜/시간 조합 - 타임존 처리
      // 사용자 로컬 시간대로 Date 객체 생성 후 ISO 문자열로 변환하여 Z 접미사(UTC) 제거
      let start_time = createLocalISOString(startDateISO, startTimeISO);
      let end_time = endDateISO && endTimeISO ? createLocalISOString(endDateISO, endTimeISO) : null;
      
      // RRule 생성 (반복 설정이 있는 경우)
      let rruleString = null;
      if (selectedRepeat && selectedRepeat !== '반복 안함') {
        // 1. 로컬 시간 기준의 Date 객체 생성 (사용자가 UI에서 보는 시간)
        const localStartDateTime = new Date(
          parseDateToISO(startDate) + 'T' + parseTimeToISO(startTime)
        );
        
        // 로깅: 로컬 시간과 UTC 시간 확인
        console.log('반복 일정 시간 디버깅:');
        console.log('- 사용자 입력한 날짜:', startDate);
        console.log('- 사용자 입력한 시간:', startTime);
        console.log('- 변환된 로컬 시간 Date 객체:', localStartDateTime);
        console.log('- 로컬 시간 ISO 문자열:', localStartDateTime.toISOString());
        
        // 2. UTC 시간(DB 저장용)
        const utcStartDateTime = new Date(start_time);
        console.log('- DB 저장 UTC 시간:', utcStartDateTime.toISOString());
        
        // 간소화된 RRule 생성 로직
        const rruleOptions: any = {
          dtstart: utcStartDateTime // 이벤트의 DB 저장 시간과 정확히 동일한 UTC 시간 사용
        };
        
        // 반복 빈도만 설정 (요일, 일자 등은 자동으로 원본 이벤트 날짜 기준)
        switch (selectedRepeat) {
          case '매일':
            rruleOptions.freq = RRule.DAILY;
            break;
          case '매주':
            rruleOptions.freq = RRule.WEEKLY;
            // 요일 지정 제거 - 자동으로 선택한 날짜의 요일 사용
            break;
          case '매월':
            rruleOptions.freq = RRule.MONTHLY;
            // 일자 지정 제거 - 자동으로 선택한 날짜의 일자 사용
            break;
          case '매년':
            rruleOptions.freq = RRule.YEARLY;
            break;
        }
        
        // RRule 생성
        const rule = new RRule(rruleOptions);
        rruleString = rule.toString();
        
        console.log('생성된 반복 규칙:', rruleString);
        console.log('DB에 저장되는 start_time:', start_time);
      }
      
      // 이벤트 데이터 준비
      const eventData = {
        title,
        start_time,
        end_time,
        all_day: end_time === null,
        color: selectedColor,
        description,
        user_id: currentUser.id,
        notification_time: selectedDuration || null,
        repeat_pattern: selectedRepeat || null,
        rrule: rruleString,
        exdate: []
      };
      
      // 이벤트 생성 또는 수정
      let response;
      
      if (eventToEdit) {
        // 이벤트 수정
        response = await supabase
          .from('events')
          .update(eventData)
          .eq('id', eventToEdit.id);
      } else {
        // 이벤트 생성
        response = await supabase
          .from('events')
          .insert([eventData]);
      }
      
      if (response.error) {
        console.error('일정 저장 오류:', response.error);
        setError('일정을 저장할 수 없습니다. 다시 시도해주세요.');
        return;
      }
      
      // 성공 시 팝업 닫기
      onClose();
      
      // 이벤트 추가/수정 성공 시 콜백 호출
      if (onEventAdded) {
        setTimeout(() => {
          onEventAdded();
        }, 50);
      }
    } catch (error) {
      console.error('일정 저장 중 오류 발생:', error);
      setError('일정을 저장할 수 없습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

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
          {isEditMode ? '일정 수정' : '일정 등록'}
        </div>

        {/* 오류 메시지 */}
        {error && (
          <div className="mb-4 text-red-500 text-sm font-['Do_Hyeon']">
            {error}
          </div>
        )}

        {/* 일정 입력 폼 */}
        <div className="space-y-6">
          {/* 일정 제목 입력 */}
          <div>
            <input
              type="text"
              placeholder="일정을 입력하세요"
              className="w-full p-2 border-b border-neutral-200 focus:outline-none font-['Do_Hyeon'] text-neutral-600"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="flex gap-4 mt-6">
          <button 
            className="flex-1 py-2 rounded-[20px] bg-neutral-200 text-neutral-600 font-['Do_Hyeon']"
            onClick={onClose}
            disabled={isLoading}
          >
            취소
          </button>
          <button 
            className={`flex-1 py-2 rounded-[20px] font-['Do_Hyeon'] ${
              isLoading ? 'bg-gray-300 text-gray-100' : 'bg-blue-300 text-white hover:bg-blue-400'
            }`}
            onClick={saveEvent}
            disabled={isLoading}
          >
            {isLoading ? '저장 중...' : isEditMode ? '수정' : '등록'}
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