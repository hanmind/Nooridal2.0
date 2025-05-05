import React, { useState, useEffect } from 'react';
import SchedulePopup from '@/app/calendar/SchedulePopup';
import DiaryPopup from '@/app/calendar/DiaryPopup';
import { supabase, getCurrentUser } from '@/utils/supabase';

interface DiaryEntry {
  id: string;
  title: string;
  content: string;
  date: string;  // Date 객체 대신 문자열로 저장
}

// 일정 타입 정의
interface Event {
  id: string;
  title: string;
  start_time: string;
  end_time: string | null;
  color: string;
  all_day: boolean;
  description?: string;
  user_id: string;
}

interface DatePopupProps {
  date: Date;
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'schedule' | 'diary' | 'today';
}

const DatePopup: React.FC<DatePopupProps> = ({ date, isOpen, onClose, initialTab }) => {
  const [activeTab, setActiveTab] = useState<'schedule' | 'diary' | 'today'>(initialTab || 'schedule');
  const [isSchedulePopupOpen, setIsSchedulePopupOpen] = useState(false);
  const [isDiaryPopupOpen, setIsDiaryPopupOpen] = useState(false);
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [selectedDiary, setSelectedDiary] = useState<DiaryEntry | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  
  // 삭제 확인 관련 상태 추가
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);

  // 팝업이 닫힐 때 상태 초기화
  const handleClose = () => {
    setSelectedDiary(null);
    setIsDiaryPopupOpen(false);
  };

  const formatDate = (date: Date) => {
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  };

  // ISO 형식으로 변환
  const dateToISO = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  // 날짜에 해당하는 일정 가져오기
  const fetchEventsForDate = async () => {
    if (!isOpen) return;
    
    try {
      setIsLoading(true);
      
      // 실제 로그인한 사용자 ID 가져오기
      const user = await getCurrentUser();
      const userId = user?.id;
      
      // 로그인하지 않은 경우 빈 배열 반환
      if (!userId) {
        console.warn('로그인한 사용자 정보가 없습니다. 일정을 가져올 수 없습니다.');
        setEvents([]);
        return;
      }
      
      // 선택한 날짜의 시작과 끝 (로컬 시간대 기준)
      const selectedDate = new Date(date);
      selectedDate.setHours(0, 0, 0, 0);
      
      const nextDay = new Date(selectedDate);
      nextDay.setDate(nextDay.getDate() + 1);
      nextDay.setMilliseconds(-1); // 23:59:59.999
      
      // ISO 문자열로 변환하고 Z 제거 (UTC 표시 제거)
      const startDateStr = selectedDate.toISOString().replace('Z', '');
      const endDateStr = nextDay.toISOString().replace('Z', '');
      
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', userId)
        .gte('start_time', startDateStr)
        .lt('start_time', endDateStr)
        .order('start_time', { ascending: true });
      
      if (error) {
        console.error('일정 가져오기 오류:', error);
        return;
      }
      
      setEvents(data || []);
    } catch (err) {
      console.error('일정 불러오기 실패:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // 일정 삭제하기
  const handleDeleteEvent = async (eventId: string) => {
    // 삭제 확인 모달 표시
    setEventToDelete(eventId);
    setShowDeleteConfirm(true);
  };

  // 일정 삭제 확인 후 실제 삭제 실행
  const confirmDeleteEvent = async () => {
    if (!eventToDelete) return;
    
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventToDelete);
        
      if (error) {
        console.error('일정 삭제 오류:', error);
        return;
      }
      
      // 삭제 후 일정 목록 갱신
      setEvents(prevEvents => prevEvents.filter(event => event.id !== eventToDelete));
    } catch (err) {
      console.error('일정 삭제 실패:', err);
    } finally {
      // 삭제 확인 모달 닫기
      setShowDeleteConfirm(false);
      setEventToDelete(null);
    }
  };

  // 삭제 취소
  const cancelDeleteEvent = () => {
    setShowDeleteConfirm(false);
    setEventToDelete(null);
  };

  // 팝업이 열릴 때마다 일정 가져오기
  useEffect(() => {
    if (isOpen) {
      fetchEventsForDate();
    }
  }, [isOpen, date]);
  
  // activeTab이 schedule로 변경될 때 일정 가져오기
  useEffect(() => {
    if (activeTab === 'schedule' && isOpen) {
      fetchEventsForDate();
    }
  }, [activeTab]);

  const handleSaveDiary = (entry: DiaryEntry) => {
    const formattedDate = formatDate(date);
    const newEntry = { ...entry, date: formattedDate };
    setDiaryEntries(prevEntries => [...prevEntries, newEntry]);
    handleClose();
  };

  const handleEditDiary = (entry: DiaryEntry) => {
    setDiaryEntries(prevEntries => 
      prevEntries.map(e => e.id === entry.id ? entry : e)
    );
    handleClose();
  };

  const handleDeleteDiary = (id: string) => {
    setDiaryEntries(prevEntries => prevEntries.filter(e => e.id !== id));
    handleClose();
  };

  // 시간 형식 변환 (ISO -> 표시용)
  const formatEventTime = (isoTime: string) => {
    try {
      // UTC 표시자(Z)가 있으면 제거하고 로컬 시간으로 해석
      const localTimeString = isoTime.replace('Z', '');
      const date = new Date(localTimeString);
      
      // Date 객체가 유효한지 확인
      if (isNaN(date.getTime())) {
        console.error('유효하지 않은 날짜:', isoTime);
        return '시간 정보 없음';
      }
      
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? '오후' : '오전';
      const displayHours = hours % 12 || 12;
      
      return `${ampm} ${displayHours}시 ${minutes.toString().padStart(2, '0')}분`;
    } catch (err) {
      console.error('시간 형식 변환 오류:', err);
      return '시간 정보 없음';
    }
  };

  // 색상 표시 헬퍼
  const getColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      'blue': 'bg-blue-100 border-blue-200',
      'green': 'bg-green-100 border-green-200',
      'pink': 'bg-pink-100 border-pink-200',
      'red': 'bg-red-100 border-red-200',
      'purple': 'bg-purple-100 border-purple-200'
    };
    
    return colorMap[color] || 'bg-yellow-100 border-yellow-200';
  };

  const currentDateEntries = diaryEntries.filter(entry => entry.date === formatDate(date));

  // 일정 클릭 핸들러 추가
  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setIsSchedulePopupOpen(true);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* 반투명 배경 */}
      <div 
        className="fixed inset-0 bg-black/30 z-30"
        onClick={onClose}
      />
      
      {/* 팝업 */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] h-[500px] bg-white z-40 shadow-lg rounded-[20px] p-6">
        {/* 날짜 */}
        <div className="text-xl font-['Do_Hyeon'] text-center">
          {formatDate(date)}
        </div>
        
        {/* 구분선 */}
        <div className="w-full h-[2px] bg-neutral-200 my-4" />

        {/* 탭 */}
        <div className="flex gap-4 mb-8">
          <button
            className={`flex-1 pb-2 font-['Do_Hyeon'] text-l transition-colors ${
              activeTab === 'schedule'
                ? 'text-yellow-400 border-b-2 border-yellow-400'
                : 'text-neutral-400'
            }`}
            onClick={() => setActiveTab('schedule')}
          >
            일정 등록
          </button>
          
          <button
            className={`flex-1 pb-2 font-['Do_Hyeon'] text-l transition-colors ${
              activeTab === 'today'
                ? 'text-yellow-400 border-b-2 border-yellow-400'
                : 'text-neutral-400'
            }`}
            onClick={() => setActiveTab('today')}
          >
            오늘의 하루
          </button>

          <button
            className={`flex-1 pb-2 font-['Do_Hyeon'] text-l transition-colors ${
              activeTab === 'diary'
                ? 'text-yellow-400 border-b-2 border-yellow-400'
                : 'text-neutral-400'
            }`}
            onClick={() => setActiveTab('diary')}
          >
            태명과의 하루
          </button>
        </div>

        {/* 컨텐츠 */}
        {activeTab === 'schedule' ? (
          <div className="flex flex-col gap-3 h-[270px] overflow-y-auto custom-scrollbar">
            {/* 로딩 표시 */}
            {isLoading && (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-yellow-400"></div>
              </div>
            )}
            
            {/* 일정 목록 */}
            {!isLoading && events.length > 0 ? (
              <>
                {events.map((event) => (
                  <div 
                    key={event.id} 
                    className={`p-3 rounded-lg border ${getColorClass(event.color)} flex flex-col relative cursor-pointer hover:bg-opacity-80`}
                    onClick={() => handleEventClick(event)}
                  >
                    <div className="font-['Do_Hyeon'] text-base">{event.title}</div>
                    <div className="text-sm text-gray-600">
                      {formatEventTime(event.start_time)}
                      {event.end_time && ` ~ ${formatEventTime(event.end_time)}`}
                    </div>
                    {event.description && (
                      <div className="text-sm text-gray-500 mt-1">{event.description}</div>
                    )}
                    
                    {/* 삭제 버튼 */}
                    <button 
                      className="absolute top-1 right-1 text-gray-400 hover:text-gray-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteEvent(event.id);
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
                
                <div className="flex justify-center mt-4">
                  <button 
                    className="w-1/2 bg-yellow-200 text-gray font-['Do_Hyeon'] py-2 rounded-[20px] hover:bg-yellow-300 transition-colors"
                    onClick={() => {
                      setSelectedEvent(null);
                      setIsSchedulePopupOpen(true);
                    }}
                  >
                    일정 추가하기
                  </button>
                </div>
              </>
            ) : !isLoading && (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="text-gray-400 mb-4 font-['Do_Hyeon']">등록된 일정이 없습니다</div>
                <button 
                  className="w-1/2 bg-yellow-200 text-gray font-['Do_Hyeon'] py-2 rounded-[20px] hover:bg-yellow-300 transition-colors"
                  onClick={() => {
                    setSelectedEvent(null);
                    setIsSchedulePopupOpen(true);
                  }}
                >
                  일정 등록
                </button>
              </div>
            )}
          </div>
        ) : activeTab === 'today' ? (
          <div className="flex justify-center mt-[30px]">
            <div className="w-full h-[240px] bg-white border-2 border-neutral-200 rounded-[15px]">
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {currentDateEntries.length > 0 ? (
              <div className="flex flex-col gap-4">
                {currentDateEntries.map((entry) => (
                  <div key={entry.id} className="w-full">
                    <div className="flex items-center justify-between bg-white border border-neutral-200 rounded-full px-6 py-3">
                      <div className="font-['Do_Hyeon']">{entry.title}</div>
                      <button 
                        className="text-neutral-400 text-sm font-['Do_Hyeon']"
                        onClick={() => {
                          setSelectedDiary(entry);
                          setIsDiaryPopupOpen(true);
                        }}
                      >
                        전체보기
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex justify-center mt-[30px]">
                <button 
                  className="w-1/2 bg-yellow-200 text-gray font-['Do_Hyeon'] py-2 rounded-[20px] hover:bg-yellow-500 transition-colors"
                  onClick={() => setIsDiaryPopupOpen(true)}
                >
                  일기 작성
                </button>
              </div>
            )}
            <div className="flex justify-center mt-4">
              <button 
                className="w-1/2 bg-[#C7E6B9] text-gray font-['Do_Hyeon'] py-2 rounded-[20px]"
              >
                사진 첨부
              </button>
            </div>
          </div>
        )}

        {/* 닫기 버튼 */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center">
          <button 
            className="w-1/2 bg-neutral-200 text-neutral-600 font-['Do_Hyeon'] py-2 rounded-[20px] hover:bg-neutral-300 transition-colors"
            onClick={onClose}
          >
            닫기
          </button>
        </div>
      </div>

      {/* 삭제 확인 모달 */}
      {showDeleteConfirm && (
        <>
          {/* 반투명 배경 */}
          <div 
            className="fixed inset-0 bg-black/50 z-50"
            onClick={cancelDeleteEvent}
          />
          
          {/* 확인 창 */}
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[260px] bg-white z-[60] shadow-lg rounded-[20px] p-5">
            <div className="text-center mb-5">
              <div className="text-base text-gray-600">이 일정을 삭제하시겠습니까?</div>
            </div>
            
            <div className="flex gap-3">
              <button 
                className="flex-1 py-2 rounded-[20px] bg-neutral-200 text-neutral-600 font-['Do_Hyeon'] hover:bg-neutral-300 transition-colors"
                onClick={cancelDeleteEvent}
              >
                아니오
              </button>
              <button 
                className="flex-1 py-2 rounded-[20px] bg-red-400 text-white font-['Do_Hyeon'] hover:bg-red-500 transition-colors"
                onClick={confirmDeleteEvent}
              >
                예
              </button>
            </div>
          </div>
        </>
      )}

      {/* 일정 등록/수정 팝업 */}
      <SchedulePopup 
        isOpen={isSchedulePopupOpen}
        onClose={() => {
          setIsSchedulePopupOpen(false);
          setSelectedEvent(null);
        }}
        selectedDate={date}
        onEventAdded={fetchEventsForDate}
        eventToEdit={selectedEvent}
      />

      {/* 일기 작성 팝업 */}
      <DiaryPopup
        isOpen={isDiaryPopupOpen}
        onClose={handleClose}
        date={date}
        onSave={handleSaveDiary}
        mode={selectedDiary ? 'view' : 'create'}
        initialData={selectedDiary || undefined}
        onEdit={handleEditDiary}
        onDelete={handleDeleteDiary}
      />
      
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

export default DatePopup; 