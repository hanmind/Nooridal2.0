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
  const [showRecurringEditOptions, setShowRecurringEditOptions] = useState(false);
  const [recurringEditOption, setRecurringEditOption] = useState<'this' | 'thisAndFuture' | 'all'>('this');

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
      // 반복 일정 수정 시 옵션 모달 표시
      if (eventToEdit && (eventToEdit.rrule || eventToEdit.recurring_event_id)) {
        setShowRecurringEditOptions(true);
        return;
      }
      
      // 나머지 저장 로직 수행
      return saveEventWithOption();
    } catch (error) {
      console.error('일정 저장 중 오류 발생:', error);
      setError('일정을 저장할 수 없습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const saveEventWithOption = async (option?: 'this' | 'thisAndFuture' | 'all') => {
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
      let start_time = createLocalISOString(startDateISO, startTimeISO);
      let end_time = endDateISO && endTimeISO ? createLocalISOString(endDateISO, endTimeISO) : null;
      
      // RRule 생성 (반복 설정이 있는 경우)
      let rruleString = null;
      if (selectedRepeat && selectedRepeat !== '반복 안함') {
        // 로컬 시간 기준의 Date 객체 생성
        const localStartDateTime = new Date(
          parseDateToISO(startDate) + 'T' + parseTimeToISO(startTime)
        );
        
        // 로깅: 로컬 시간과 UTC 시간 확인
        console.log('반복 일정 시간 디버깅:');
        console.log('- 사용자 입력한 날짜:', startDate);
        console.log('- 사용자 입력한 시간:', startTime);
        console.log('- 변환된 로컬 시간 Date 객체:', localStartDateTime);
        console.log('- 로컬 시간 ISO 문자열:', localStartDateTime.toISOString());
        
        // UTC 시간(DB 저장용)
        const utcStartDateTime = new Date(start_time);
        console.log('- DB 저장 UTC 시간:', utcStartDateTime.toISOString());
        
        // 간소화된 RRule 생성 로직
        const rruleOptions: any = {
          dtstart: utcStartDateTime
        };
        
        // 반복 빈도 설정
        switch (selectedRepeat) {
          case '매일':
            rruleOptions.freq = RRule.DAILY;
            break;
          case '매주':
            rruleOptions.freq = RRule.WEEKLY;
            break;
          case '매월':
            rruleOptions.freq = RRule.MONTHLY;
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
      
      // 이벤트 생성 또는 수정 처리
      let response;
      
      if (eventToEdit) {
        // 반복 일정 수정 옵션에 따른 처리
        if (option && (eventToEdit.rrule || eventToEdit.recurring_event_id)) {
          console.log('반복 일정 수정 옵션:', option);
          
          // 원본 이벤트 ID 확인
          const originalEventId = eventToEdit.recurring_event_id || eventToEdit.id.split('_')[0];
          const eventDate = new Date(eventToEdit.start_time);
          const formattedDate = eventDate.toISOString().split('T')[0]; // YYYY-MM-DD
          
          switch (option) {
            case 'this':
              // 선택한 일정만 예외로 처리
              try {
                console.log('이 일정만 수정 - 시작');
                // 원본 이벤트 ID 확인 (recurring_event_id가 있거나 가상 ID인 경우)
                const originalId = eventToEdit.recurring_event_id || originalEventId;
                console.log('원본 이벤트 ID:', originalId);
                console.log('수정할 날짜:', formattedDate);
                
                // 1. 원본 이벤트의 exdate에 현재 날짜 추가
                const { data: originalEvent, error: fetchError } = await supabase
                  .from('events')
                  .select('exdate, title')
                  .eq('id', originalId)
                  .single();
                
                if (fetchError) {
                  console.error('원본 이벤트 조회 오류:', fetchError);
                  throw new Error(`원본 이벤트를 찾을 수 없습니다: ${fetchError.message}`);
                }
                
                console.log('원본 이벤트 정보:', originalEvent);
                
                // 현재 날짜가 이미 예외에 있는지 확인
                const existingExdate = originalEvent?.exdate || [];
                if (!existingExdate.includes(formattedDate)) {
                  // 예외 목록에 없으면 추가
                  const updatedExdate = [...existingExdate, formattedDate];
                  console.log('업데이트된 예외 날짜:', updatedExdate);
                  
                  const { error: updateError } = await supabase
                    .from('events')
                    .update({ exdate: updatedExdate })
                    .eq('id', originalId);
                  
                  if (updateError) {
                    console.error('예외 날짜 업데이트 오류:', updateError);
                    throw new Error(`예외 날짜 업데이트 실패: ${updateError.message}`);
                  }
                } else {
                  console.log('이 날짜는 이미 예외 목록에 있습니다:', formattedDate);
                }
                
                // 2. 이미 이 날짜에 대한 예외 이벤트가 있는지 확인
                const { data: existingException } = await supabase
                  .from('events')
                  .select('id')
                  .eq('recurring_event_id', originalId)
                  .eq('start_time', start_time)
                  .maybeSingle();
                
                console.log('기존 예외 이벤트 확인:', existingException);
                
                // 수정할 데이터 준비 (recurring_event_id 추가)
                const exceptionData = {
                  ...eventData,
                  recurring_event_id: originalId,
                  // 예외 이벤트는 단순 일정이어야 함
                  rrule: null,
                  repeat_pattern: null
                };
                
                if (existingException) {
                  // 2-1. 이미 예외 이벤트가 있으면 업데이트
                  console.log('기존 예외 이벤트 업데이트:', existingException.id);
                  response = await supabase
                    .from('events')
                    .update(exceptionData)
                    .eq('id', existingException.id);
                } else {
                  // 2-2. 없으면 새 예외 이벤트 생성
                  console.log('새 예외 이벤트 생성');
                  response = await supabase
                    .from('events')
                    .insert([exceptionData]);
                }
                
                console.log('이 일정만 수정 - 완료', response);
              } catch (error: any) {
                console.error('이 일정만 수정 중 오류:', error);
                throw new Error(`일정 수정 실패: ${error.message}`);
              }
              break;
              
            case 'thisAndFuture':
              // 이 일정과 이후 모든 반복 일정 수정
              try {
                // 1. 원본 이벤트의 반복 규칙 종료일 설정 (이전 날짜까지만 유지)
                const previousDay = new Date(eventDate);
                previousDay.setDate(previousDay.getDate() - 1);
                const untilDate = previousDay.toISOString().split('T')[0].replace(/-/g, '');
                
                // 2. 원본 이벤트 조회
                const { data: originalEvent } = await supabase
                  .from('events')
                  .select('rrule')
                  .eq('id', originalEventId)
                  .single();
                
                if (originalEvent?.rrule) {
                  // 3. RRULE 수정: UNTIL 설정
                  let updatedRrule = originalEvent.rrule;
                  
                  if (updatedRrule.includes('UNTIL=')) {
                    updatedRrule = updatedRrule.replace(/UNTIL=\d+T\d+Z?/i, `UNTIL=${untilDate}T235959Z`);
                  } else {
                    updatedRrule = updatedRrule.replace(/RRULE:/, `RRULE:UNTIL=${untilDate}T235959Z;`);
                  }
                  
                  // 4. 원본 이벤트 업데이트
                  await supabase
                    .from('events')
                    .update({ rrule: updatedRrule })
                    .eq('id', originalEventId);
                    
                  // 5. 새 이벤트 생성 (선택한 날짜부터 시작하는 새 반복 일정)
                  const newEventData = {
                    ...eventData,
                    start_time: eventDate.toISOString()
                  };
                  
                  response = await supabase
                    .from('events')
                    .insert([newEventData]);
                }
              } catch (error: any) {
                console.error('이 일정과 이후 반복 일정 수정 중 오류:', error);
                throw new Error(`반복 일정 수정 실패: ${error.message}`);
              }
              break;
              
            case 'all':
              // 모든 반복 일정 수정
              response = await supabase
                .from('events')
                .update(eventData)
                .eq('id', originalEventId);
                
              // 관련 예외 항목 삭제 (완전히 새로운 설정으로 변경하므로 예외 항목은 무의미)
              await supabase
                .from('events')
                .delete()
                .eq('recurring_event_id', originalEventId);
              break;
          }
        } else {
          // 일반 이벤트 수정
          response = await supabase
            .from('events')
            .update(eventData)
            .eq('id', eventToEdit.id);
        }
      } else {
        // 신규 이벤트 생성
        response = await supabase
          .from('events')
          .insert([eventData]);
      }
      
      if (response && response.error) {
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
      setShowRecurringEditOptions(false);
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

      {/* 반복 일정 수정 옵션 모달 */}
      {showRecurringEditOptions && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-60"
            onClick={() => setShowRecurringEditOptions(false)}
          />
          
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] bg-white z-70 shadow-lg rounded-[20px] p-5">
            
            <div className="flex flex-col gap-3 mb-4">
              <label className="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="recurringEditOption" 
                  checked={recurringEditOption === 'this'} 
                  onChange={() => setRecurringEditOption('this')}
                />
                <span className="text-sm font-['Do_Hyeon']">이 일정만</span>
              </label>
              <label className="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="recurringEditOption" 
                  checked={recurringEditOption === 'thisAndFuture'} 
                  onChange={() => setRecurringEditOption('thisAndFuture')}
                />
                <span className="text-sm font-['Do_Hyeon']">이 일정과 이후 모든 반복 일정</span>
              </label>
              <label className="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="recurringEditOption" 
                  checked={recurringEditOption === 'all'} 
                  onChange={() => setRecurringEditOption('all')}
                />
                <span className="text-sm font-['Do_Hyeon']">모든 반복 일정</span>
              </label>
            </div>
            
            <div className="flex gap-3">
              <button 
                className="flex-1 py-2 rounded-[20px] bg-neutral-200 text-neutral-600 font-['Do_Hyeon'] hover:bg-neutral-300 transition-colors"
                onClick={() => setShowRecurringEditOptions(false)}
              >
                취소
              </button>
              <button 
                className="flex-1 py-2 rounded-[20px] bg-blue-400 text-white font-['Do_Hyeon'] hover:bg-blue-500 transition-colors"
                onClick={() => saveEventWithOption(recurringEditOption)}
              >
                수정
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default SchedulePopup; 