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

// LLM 대화 인터페이스 추가
interface LlmConversation {
  id: string;
  chat_room_id: string | null;
  query: string;
  response: string;
  created_at: string | null;
  updated_at: string | null;
  user_info: any;
  source_documents: any;
  using_rag: boolean | null;
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

interface DatePopupProps {
  date: Date;
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'schedule' | 'diary' | 'today';
  expandedEvents?: Event[]; // 확장된 이벤트 목록 추가
  onDataChanged?: () => void; // 데이터 변경을 Calendar에 알리는 콜백
}

const DatePopup: React.FC<DatePopupProps> = ({ date, isOpen, onClose, initialTab, expandedEvents = [], onDataChanged }) => {
  const [activeTab, setActiveTab] = useState<'schedule' | 'diary' | 'today'>(initialTab || 'schedule');
  const [isSchedulePopupOpen, setIsSchedulePopupOpen] = useState(false);
  const [isDiaryPopupOpen, setIsDiaryPopupOpen] = useState(false);
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [selectedDiary, setSelectedDiary] = useState<DiaryEntry | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  // LLM 대화 상태 추가
  const [conversations, setConversations] = useState<LlmConversation[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(false);
  
  // 삭제 확인 관련 상태 추가
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [showRecurringDeleteOptions, setShowRecurringDeleteOptions] = useState(false);
  const [recurringDeleteOption, setRecurringDeleteOption] = useState<'this' | 'thisAndFuture' | 'all'>('this');
  const [eventToDeleteInfo, setEventToDeleteInfo] = useState<{id: string, isRecurring: boolean, date: string} | null>(null);

  // 상태 변수 추가 (const DatePopup 함수 내부 상단)
  const [policySummary, setPolicySummary] = useState<{
    summary: string;
    policies: string[];
  } | null>(null);

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
      
      // 1. 확장된 이벤트에서 해당 날짜의 이벤트 필터링
      if (expandedEvents && expandedEvents.length > 0) {
        const filteredEvents = expandedEvents.filter(event => {
          try {
            // 이벤트의 시작 시간을 Date 객체로 변환
            const eventDate = new Date(event.start_time);
            
            // 날짜 부분만 비교 (연, 월, 일)
            return (
              eventDate.getFullYear() === date.getFullYear() && 
              eventDate.getMonth() === date.getMonth() && 
              eventDate.getDate() === date.getDate()
            );
          } catch (err) {
            console.error('이벤트 날짜 파싱 오류:', err, event);
            return false;
          }
        });
        
        setEvents(filteredEvents);
        setIsLoading(false);
        return;
      }
      
      // 2. 확장된 이벤트가 없는 경우 기존 방식으로 API 호출
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
  
  // 일정 삭제하기 - 수정
  const handleDeleteEvent = async (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    
    if (event?.rrule || event?.recurring_event_id) {
      // 반복 일정인 경우 옵션 모달 표시
      setEventToDeleteInfo({
        id: eventId,
        isRecurring: true,
        date: event.start_time
      });
      setShowRecurringDeleteOptions(true);
    } else {
      // 일반 일정인 경우 기존 코드 사용
      setEventToDelete(eventId);
      setShowDeleteConfirm(true);
    }
  };

  // 반복 일정 삭제 처리
  const handleRecurringDelete = async () => {
    if (!eventToDeleteInfo) return;
    
    try {
      const { id } = eventToDeleteInfo;
      const event = events.find(e => e.id === id);
      if (!event) return;
      
      // ISO 날짜 형식으로 변환 (YYYY-MM-DD)
      const eventDate = new Date(event.start_time);
      const formattedDate = eventDate.toISOString().split('T')[0]; // YYYY-MM-DD
      
      switch (recurringDeleteOption) {
        case 'this':
          // 이 일정만 삭제 - exdate 필드에 날짜 추가
          const targetId = event.recurring_event_id || id;
          
          const { data: originalEvent } = await supabase
            .from('events')
            .select('exdate')
            .eq('id', targetId)
            .single();
            
          const updatedExdate = [...(originalEvent?.exdate || []), formattedDate];
          
          await supabase
            .from('events')
            .update({ exdate: updatedExdate })
            .eq('id', targetId);
          
          // 화면에서 현재 일정만 제거
          setEvents(prevEvents => prevEvents.filter(e => e.id !== id));
          break;
          
        case 'thisAndFuture':
          // 이 일정과 이후 모든 반복 일정 삭제
          try {
            // 1. 원본 반복 이벤트 ID 확인
            const originalEventId = event.recurring_event_id || event.id.split('_')[0];
            
            // 2. 선택한 날짜의 전날 계산 (종료 날짜로 사용)
            const previousDay = new Date(eventDate);
            previousDay.setDate(previousDay.getDate() - 1);
            
            // YYYYMMDD 형식의 날짜 문자열로 변환
            const untilDate = previousDay.toISOString().split('T')[0].replace(/-/g, '');
            
            console.log('반복 일정 종료일 설정:', {
              originalEventId,
              untilDate,
              선택한날짜: formattedDate
            });
            
            // 3. 원본 이벤트 조회
            const { data: originalEvent } = await supabase
              .from('events')
              .select('rrule')
              .eq('id', originalEventId)
              .single();
            
            if (originalEvent?.rrule) {
              // 4. RRULE 문자열에서 UNTIL 부분 수정 또는 추가
              let updatedRrule = originalEvent.rrule;
              
              if (updatedRrule.includes('UNTIL=')) {
                // 이미 UNTIL이 있으면 값만 교체
                updatedRrule = updatedRrule.replace(/UNTIL=\d+T\d+Z?/i, `UNTIL=${untilDate}T235959Z`);
              } else {
                // UNTIL이 없으면 추가
                updatedRrule = updatedRrule.replace(/RRULE:/, `RRULE:UNTIL=${untilDate}T235959Z;`);
              }
              
              // 5. 원본 이벤트 업데이트
              const { error } = await supabase
                .from('events')
                .update({ rrule: updatedRrule })
                .eq('id', originalEventId);
                
              if (error) {
                throw new Error(`원본 이벤트 업데이트 실패: ${error.message}`);
              }
              
              // 6. UI에서 해당 날짜 이후 이벤트 제거 (로컬 UI 갱신)
              setEvents(prevEvents => prevEvents.filter(e => {
                const eDate = new Date(e.start_time);
                // 날짜가 선택 날짜보다 이전이면 유지, 아니면 제거
                return eDate < eventDate;
              }));
            } else {
              throw new Error('원본 반복 이벤트를 찾을 수 없습니다');
            }
          } catch (error: any) {
            console.error('이 일정과 이후 반복 일정 삭제 중 오류:', error);
            alert(`일정 삭제 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`);
          }
          break;
          
        case 'all':
          // 모든 반복 일정 삭제
          const mainEventId = event.recurring_event_id || id;
          
          // 1. 모든 관련 예외 이벤트 삭제
          await supabase
            .from('events')
            .delete()
            .eq('recurring_event_id', mainEventId);
            
          // 2. 원본 반복 이벤트 삭제
          await supabase
            .from('events')
            .delete()
            .eq('id', mainEventId);
            
          // 화면에서 모든 관련 이벤트 제거
          setEvents(prevEvents => prevEvents.filter(e => 
            e.id !== mainEventId && e.recurring_event_id !== mainEventId
          ));
          break;
      }
      
      // 삭제 후 상태 초기화
      setShowRecurringDeleteOptions(false);
      setEventToDeleteInfo(null);
      
      // 부모 Calendar 컴포넌트에 변경 알리기
      if (onDataChanged) {
        onDataChanged();
      }
    } catch (err) {
      console.error('반복 일정 삭제 오류:', err);
    }
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
      
      // 부모 Calendar 컴포넌트에 변경 알리기
      if (onDataChanged) {
        onDataChanged();
      }
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

  // 팝업이 열릴 때와 날짜가 변경될 때 일정 가져오기
  useEffect(() => {
    if (isOpen) {
      fetchEventsForDate();
    }
  }, [isOpen, date, expandedEvents]); // expandedEvents 의존성 추가
  
  // activeTab이 schedule로 변경될 때 일정 가져오기
  useEffect(() => {
    if (activeTab === 'schedule' && isOpen) {
      fetchEventsForDate();
    } else if (activeTab === 'today' && isOpen) {
      // today 탭일 때 LLM 대화 가져오기
      fetchLlmConversations();
    }
  }, [activeTab]);

  // 날짜에 해당하는 LLM 대화 가져오기
  const fetchLlmConversations = async () => {
    if (!isOpen || activeTab !== 'today') return;
    
    try {
      setConversationsLoading(true);
      
      // 로그인한 사용자 ID 가져오기
      const user = await getCurrentUser();
      const userId = user?.id;
      
      // 로그인하지 않은 경우 빈 배열 반환
      if (!userId) {
        console.warn('로그인한 사용자 정보가 없습니다. 대화 내용을 가져올 수 없습니다.');
        setConversations([]);
        return;
      }
      
      // 선택한 날짜의 시작과 끝 (로컬 시간대 기준)
      const selectedDate = new Date(date);
      selectedDate.setHours(0, 0, 0, 0);
      
      const nextDay = new Date(selectedDate);
      nextDay.setDate(nextDay.getDate() + 1);
      nextDay.setMilliseconds(-1); // 23:59:59.999
      
      // ISO 문자열로 변환
      const startDateStr = selectedDate.toISOString();
      const endDateStr = nextDay.toISOString();
      
      // llm_conversations 테이블에서 해당 날짜의 대화 가져오기
      const { data, error } = await supabase
        .from('llm_conversations')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', startDateStr)
        .lt('created_at', endDateStr)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('LLM 대화 가져오기 오류:', error);
        return;
      }
      
      setConversations(data || []);
      
      // 데이터를 가져온 후 즉시 정책 정보 추출 실행
      if (data && data.length > 0) {
        extractPoliciesInfo(data);
      } else {
        // 대화 내용이 없는 경우 정책 요약도 없음
        setPolicySummary(null);
      }
    } catch (err) {
      console.error('LLM 대화 불러오기 실패:', err);
    } finally {
      setConversationsLoading(false);
    }
  };

  // 대화 내용에서 유용한 정보 추출
  const extractPoliciesInfo = (conversationsData = conversations) => {
    if (!conversationsData || conversationsData.length === 0) return;
    
    try {
      // 정책 정보가 포함된 답변 필터링
      const policyResponses = conversationsData.filter(conv => {
        const response = String(conv.response).toLowerCase();
        return (
          response.includes('정책') || 
          response.includes('지원') || 
          response.includes('혜택') || 
          response.includes('보조금') ||
          response.includes('서비스') ||
          response.includes('법률') ||
          response.includes('수당')
        );
      });
      
      if (policyResponses.length === 0) {
        console.log('정책 관련 대화가 없습니다.');
        // 정책 관련 대화가 없다는 상태 설정
        setPolicySummary({ summary: '정책 관련 대화가 없습니다', policies: [] });
        return;
      }
      
      // 정책 정보 추출
      const policies: string[] = [];
      // 날짜 표시 변경 ("오늘" -> 실제 날짜)
      let summaryText = `${formatDate(date)} 대화에서 다음과 같은 유용한 정보를 찾았습니다:`;
      
      // 정책 키워드 추출
      policyResponses.forEach(conv => {
        // 간단한 문장 분리 및 정책 관련 정보 추출
        const sentences = String(conv.response).split(/[.!?]\s+/);
        sentences.forEach(sentence => {
          const lowerSentence = sentence.toLowerCase();
          if (
            (lowerSentence.includes('정책') || 
            lowerSentence.includes('지원') || 
            lowerSentence.includes('혜택') || 
            lowerSentence.includes('보조금') ||
            lowerSentence.includes('서비스') ||
            lowerSentence.includes('법률') ||
            lowerSentence.includes('수당')) &&
            sentence.length > 10 &&  // 너무 짧은 문장 제외
            !policies.some(p => p.includes(sentence.trim())) // 중복 제외
          ) {
            policies.push(sentence.trim());
          }
        });
      });
      
      // 요약 생성
      if (policies.length === 0) {
        // 키워드 기반으로 정책을 찾지 못한 경우, 전체 응답 중 일부 사용
        const firstPolicy = String(policyResponses[0].response).substring(0, 150) + '...';
        policies.push(firstPolicy);
      }
      
      setPolicySummary({
        summary: summaryText,
        policies: policies.slice(0, 5) // 최대 5개 정책만 표시
      });
      
    } catch (err) {
      console.error('정책 정보 추출 오류:', err);
    }
  };

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
                    className={`p-3 rounded-lg border ${getColorClass(event.color || '')} flex flex-col relative cursor-pointer hover:bg-opacity-80`}
                    onClick={() => handleEventClick(event)}
                  >
                    <div className="flex justify-between">
                      <span className="text-base font-['Do_Hyeon']">{event.title}</span>
                      <button 
                        className="text-gray-500 hover:text-gray-700" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteEvent(event.id);
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                          <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="text-xs text-gray-600 mt-1">
                      {new Date(event.start_time).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: true })}
                      {event.end_time && ` - ${new Date(event.end_time).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: true })}`}
                    </div>
                    
                    {event.description && (
                      <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {event.description}
                      </div>
                    )}
                    
                    {/* 알림 및 반복 설정 표시 */}
                    <div className="flex gap-2 mt-2">
                      {event.notification_time && (
                        <div className="bg-yellow-100 px-2 py-0.5 rounded-full text-xs">
                          알림: {event.notification_time}
                        </div>
                      )}
                      {event.repeat_pattern && (
                        <div className="bg-yellow-100 px-2 py-0.5 rounded-full text-xs">
                          반복: {event.repeat_pattern}
                        </div>
                      )}
                    </div>
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
          <div className="h-[270px] overflow-y-auto custom-scrollbar">
            {conversationsLoading ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-yellow-400"></div>
              </div>
            ) : policySummary ? (
              <div className="flex flex-col gap-3">
                {policySummary.policies.length > 0 ? (
                  // 정책 정보가 있을 경우 표시
                  <div className="bg-white border border-neutral-200 rounded-lg p-4">
                    <div className="text-base font-['Do_Hyeon'] text-yellow-600 mb-3">오늘의 유용한 정보</div>
                    
                    <ul className="list-disc pl-5">
                      {policySummary.policies.map((policy, idx) => (
                        <li key={idx} className="text-sm text-gray-600 mb-2">{policy}</li>
                      ))}
                    </ul>
                    
                    <div className="flex justify-end mt-3">
                      <button
                        className="text-xs text-gray-500 hover:text-gray-700 underline"
                        onClick={() => setPolicySummary(null)}
                      >
                        원본 대화 보기
                      </button>
                    </div>
                  </div>
                ) : (
                  // 정책 정보가 없을 경우 표시
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="text-gray-400 mb-2 font-['Do_Hyeon']">정책 관련 대화가 없습니다</div>
                    <div className="text-xs text-gray-400 text-center max-w-[250px] mb-4">
                      대화에서 정부 지원 정책이나 <br /> 유용한 정보를 찾지 못했습니다
                    </div>
                    <button
                      className="text-xs text-gray-500 hover:text-gray-700 underline"
                      onClick={() => setPolicySummary(null)}
                    >
                      원본 대화 보기
                    </button>
                  </div>
                )}
              </div>
            ) : conversations.length > 0 ? (
              // 기존 대화 내용 표시
              <div className="flex flex-col gap-3">
                <div className="flex justify-center mb-2">
                  <button
                    className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs hover:bg-yellow-200"
                    onClick={() => extractPoliciesInfo()}
                  >
                    유용한 정보 다시 정리하기
                  </button>
                </div>
                
                {conversations.map((conversation) => (
                  <div key={conversation.id} className="bg-white border border-neutral-200 rounded-lg p-4">
                    <div>
                      <div className="text-sm font-['Do_Hyeon'] text-gray-700 mb-2">
                        <span className="font-bold">질문:</span> {conversation.query}
                      </div>
                      <div className="text-sm text-gray-600 mt-2 line-clamp-3">
                        <span className="font-bold">답변:</span> {conversation.response}
                      </div>
                      
                      {/* 정부 정책 정보 추출 (source_documents에서 찾을 수 있다면) */}
                      {conversation.source_documents && Array.isArray(conversation.source_documents) && conversation.source_documents.length > 0 && (
                        <div className="mt-2">
                          <div className="text-sm font-['Do_Hyeon'] text-yellow-600 mb-1">관련 정책</div>
                          <ul className="list-disc pl-5">
                            {conversation.source_documents.slice(0, 3).map((doc: any, idx: number) => (
                              <li key={idx} className="text-xs text-gray-600">
                                {doc.metadata?.title || doc.pageContent?.substring(0, 50) || "정책 정보"}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-400 mt-2">
                        {conversation.created_at && new Date(conversation.created_at).toLocaleTimeString('ko-KR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="text-gray-400 mb-2 font-['Do_Hyeon']">오늘 나눈 대화가 없습니다</div>
                <div className="text-xs text-gray-400 text-center max-w-[250px]">
                  채팅에서 대화를 나누면 이곳에서 <br /> 유용한 정보와 정책을 확인할 수 있습니다.
                </div>
              </div>
            )}
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

      {/* 반복 일정 삭제 옵션 모달 */}
      {showRecurringDeleteOptions && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-60"
            onClick={() => setShowRecurringDeleteOptions(false)}
          />
          
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] bg-white z-70 shadow-lg rounded-[20px] p-5">
            
            <div className="flex flex-col gap-3 mb-4">
              <label className="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="recurringDeleteOption" 
                  checked={recurringDeleteOption === 'this'} 
                  onChange={() => setRecurringDeleteOption('this')}
                />
                <span className="text-sm font-['Do_Hyeon']">이 일정만</span>
              </label>
              <label className="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="recurringDeleteOption" 
                  checked={recurringDeleteOption === 'thisAndFuture'} 
                  onChange={() => setRecurringDeleteOption('thisAndFuture')}
                />
                <span className="text-sm font-['Do_Hyeon']">이 일정과 이후 모든 반복 일정</span>
              </label>
              <label className="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="recurringDeleteOption" 
                  checked={recurringDeleteOption === 'all'} 
                  onChange={() => setRecurringDeleteOption('all')}
                />
                <span className="text-sm font-['Do_Hyeon']">모든 반복 일정</span>
              </label>
            </div>
            
            <div className="flex gap-3">
              <button 
                className="flex-1 py-2 rounded-[20px] bg-neutral-200 text-neutral-600 font-['Do_Hyeon'] hover:bg-neutral-300 transition-colors"
                onClick={() => setShowRecurringDeleteOptions(false)}
              >
                취소
              </button>
              <button 
                className="flex-1 py-2 rounded-[20px] bg-red-400 text-white font-['Do_Hyeon'] hover:bg-red-500 transition-colors"
                onClick={handleRecurringDelete}
              >
                삭제
              </button>
            </div>
          </div>
        </>
      )}
      
      {/* 기존 삭제 확인 모달 */}
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
        onEventAdded={() => {
          // 일정 추가/수정 후 데이터 다시 가져오기
          fetchEventsForDate();
          
          // 부모 Calendar 컴포넌트에도 변경 알리기 (expandedEvents가 업데이트되도록)
          if (onDataChanged) {
            onDataChanged();
          }
        }}
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