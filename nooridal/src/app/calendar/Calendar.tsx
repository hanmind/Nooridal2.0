import React, { useState, useEffect } from "react";
import DatePopup from "@/app/calendar/DatePopup";
import SchedulePopup from "@/app/calendar/SchedulePopup";
import { supabase, getCurrentUser } from "@/utils/supabase";
import { RRule, rrulestr } from "rrule";
import TabBar from "@/app/components/TabBar";
import { useRouter } from "next/navigation";
import { Tab } from "@/types/ui";

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
  created_at?: string | null;
  is_recurring?: boolean | null;
}

interface CalendarProps {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
}

const Calendar: React.FC<CalendarProps> = ({ currentDate, setCurrentDate }) => {
  const [isMonthSelectorOpen, setIsMonthSelectorOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isSchedulePopupOpen, setIsSchedulePopupOpen] = useState(false);
  const [initialTab, setInitialTab] = useState<"schedule" | "diary" | "today">(
    "schedule"
  );
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedEvents, setExpandedEvents] = useState<Event[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // 강제 새로고침을 위한 트리거

  const refreshEvents = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  // 현재 표시되는 월의 일정만 필터링
  const filteredEvents = events.filter((event) => {
    // UTC 표시자(Z)가 있으면 제거하고 로컬 시간으로 해석
    const localTimeString = event.start_time.replace("Z", "");
    const eventDate = new Date(localTimeString);

    return (
      eventDate.getFullYear() === currentDate.getFullYear() &&
      eventDate.getMonth() === currentDate.getMonth()
    );
  });

  // 특정 날짜의 일정 가져오기
  const getEventsForDay = (day: number) => {
    // 현재 달력에서 선택한 날짜 (로컬 시간 기준)
    const localDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    localDate.setHours(0, 0, 0, 0);

    // 다음 날 자정
    const nextLocalDate = new Date(localDate);
    nextLocalDate.setDate(localDate.getDate() + 1);

    // 해당 날짜의 이벤트만 필터링
    return expandedEvents.filter((event) => {
      try {
        // 이벤트의 시작 시간을 로컬 Date 객체로 변환
        const eventDate = new Date(event.start_time);

        // 날짜 부분만 비교 (연, 월, 일)
        return (
          eventDate.getFullYear() === localDate.getFullYear() &&
          eventDate.getMonth() === localDate.getMonth() &&
          eventDate.getDate() === localDate.getDate()
        );
      } catch (err) {
        console.error("이벤트 날짜 파싱 오류:", err, event);
        return false;
      }
    });
  };

  // 일정 가져오기
  const fetchEvents = async () => {
    try {
      setIsLoading(true);

      // 실제 로그인한 사용자 ID 가져오기
      const user = await getCurrentUser();
      const userId = user?.id;

      // 로그인하지 않은 경우 빈 배열 반환
      if (!userId) {
        console.warn(
          "로그인한 사용자 정보가 없습니다. 일정을 가져올 수 없습니다."
        );
        setEvents([]);
        return;
      }

      // 현재 월에 표시될 수 있는 이벤트 설정 범위 확장
      const startOfPrevMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - 1,
        1
      );
      const endOfNextMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 2,
        0
      );

      // UTC 시간으로 변환 (데이터베이스에 저장된 형식과 일치)
      const startDateUtc = new Date(
        Date.UTC(
          startOfPrevMonth.getFullYear(),
          startOfPrevMonth.getMonth(),
          startOfPrevMonth.getDate()
        )
      );

      const endDateUtc = new Date(
        Date.UTC(
          endOfNextMonth.getFullYear(),
          endOfNextMonth.getMonth(),
          endOfNextMonth.getDate(),
          23,
          59,
          59
        )
      );

      // ISO 문자열로 변환 (UTC 시간)
      const startDateStr = startDateUtc.toISOString();
      const endDateStr = endDateUtc.toISOString();

      console.log("일정 검색 범위 (UTC):", {
        시작: startDateStr,
        종료: endDateStr,
      });

      // 캐시 방지를 위한 타임스탬프 쿼리 파라미터
      const timestamp = new Date().getTime();

      // 1. 현재 기간의 일반 이벤트 조회
      const { data: dateRangeEvents, error: dateRangeError } = await supabase
        .from("events")
        .select("*")
        .eq("user_id", userId)
        .gte("start_time", startDateStr)
        .lte("start_time", endDateStr)
        .order("start_time", { ascending: true });

      if (dateRangeError) {
        console.error("일정 가져오기 오류:", dateRangeError);
        return;
      }

      // 2. 반복 일정(rrule이 있는 이벤트) 조회
      const { data: recurringEvents, error: recurringError } = await supabase
        .from("events")
        .select("*")
        .eq("user_id", userId)
        .not("rrule", "is", null)
        .order("start_time", { ascending: true });

      if (recurringError) {
        console.error("반복 일정 가져오기 오류:", recurringError);
        return;
      }

      // 3. 두 이벤트 세트 병합 (중복 제거)
      const allEvents = [...(dateRangeEvents || [])];

      if (recurringEvents) {
        // recurringEvents에서 이미 allEvents에 있지 않은 이벤트만 추가
        recurringEvents.forEach((recurringEvent) => {
          const isDuplicate = allEvents.some(
            (event) => event.id === recurringEvent.id
          );
          if (!isDuplicate) {
            allEvents.push(recurringEvent);
          }
        });
      }

      console.log(
        `가져온 총 이벤트 수: ${allEvents.length}(일반: ${
          dateRangeEvents?.length || 0
        }, 반복: ${recurringEvents?.length || 0})`
      );

      // 이벤트 설정 및 확장
      setEvents(allEvents);
      const expandedRecurringEvents = expandRecurringEvents(allEvents);
      setExpandedEvents(expandedRecurringEvents);
    } catch (err) {
      console.error("일정 불러오기 실패:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // 반복 일정 확장 함수
  const expandRecurringEvents = (events: Event[]): Event[] => {
    // 기준 날짜 범위 (현재 표시 중인 달력에 맞게 조정)
    const startDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      1
    ); // 이전 달부터
    const endDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 2,
      0
    ); // 다음 달까지

    const expandedEvents: Event[] = [];

    // 기본 이벤트 복사 (반복 아닌 것)
    const regularEvents = events.filter((event) => !event.rrule);
    expandedEvents.push(...regularEvents);

    // 반복 일정 처리
    const recurringEvents = events.filter((event) => event.rrule);

    // 반복 일정 확장 과정을 콘솔에 로깅
    console.log(
      `확장 중인 반복 일정 범위: ${startDate.toISOString()} ~ ${endDate.toISOString()}`
    );
    console.log(`반복 일정 수: ${recurringEvents.length}`);

    recurringEvents.forEach((event) => {
      if (!event.rrule) return;

      try {
        // 원본 이벤트 시작 시간 (UTC 시간으로 파싱)
        const originalStartTime = new Date(event.start_time);
        console.log(`[${event.title}] 원본 이벤트 시간:`, {
          start_time: event.start_time,
          parsedDate: originalStartTime.toISOString(),
        });

        // 검색 범위를 UTC 시간으로 변환
        const utcStartDate = new Date(
          Date.UTC(
            startDate.getFullYear(),
            startDate.getMonth(),
            startDate.getDate()
          )
        );

        const utcEndDate = new Date(
          Date.UTC(
            endDate.getFullYear(),
            endDate.getMonth(),
            endDate.getDate(),
            23,
            59,
            59
          )
        );

        console.log(`[${event.title}] 반복 검색 범위:`, {
          utcStart: utcStartDate.toISOString(),
          utcEnd: utcEndDate.toISOString(),
        });

        // RRule 문자열 처리 - 올바른 DTSTART 설정
        let rruleOptions: any = {};

        // rrule 문자열 파싱 - UNTIL과 같은 모든 매개변수 유지하면서
        // DTSTART를 이벤트의 실제 시작 시간으로 설정
        try {
          // 원본 RRule 문자열에서 필요한 부분만 추출 (RRULE: 이후 부분)
          const rrulePart = event.rrule.startsWith("RRULE:")
            ? event.rrule
            : `RRULE:${event.rrule}`;

          // RRule 옵션으로 변환 (dtstart는 원본 이벤트 시간 사용)
          rruleOptions = RRule.parseString(rrulePart.replace("RRULE:", ""));
          rruleOptions.dtstart = originalStartTime;

          console.log(`[${event.title}] 파싱된 RRule 옵션:`, rruleOptions);
        } catch (parseError) {
          console.error("RRule 파싱 오류:", parseError);
          // 기본 옵션 사용 (주간 반복)
          rruleOptions = {
            freq: RRule.WEEKLY,
            dtstart: originalStartTime,
          };
        }

        // RRule 객체 생성
        const rule = new RRule(rruleOptions);
        console.log(`[${event.title}] 생성된 RRule:`, rule.toString());

        // 반복 일정 발생 날짜 계산
        const occurrences = rule.between(utcStartDate, utcEndDate, true);
        console.log(
          `이벤트 "${event.title}"의 발생 횟수: ${occurrences.length}`
        );

        if (occurrences.length > 0) {
          console.log(
            `[${event.title}] 첫 번째 발생:`,
            occurrences[0].toISOString()
          );
        }

        // 각 발생 일자에 대해 이벤트 인스턴스 생성
        occurrences.forEach((occurrence) => {
          // 발생 날짜를 ISO 문자열로 변환
          const occurrenceDate = occurrence.toISOString().split("T")[0]; // YYYY-MM-DD

          // 제외된 날짜 확인
          if (event.exdate && event.exdate.includes(occurrenceDate)) {
            console.log(`이벤트 "${event.title}" 제외된 날짜:`, occurrenceDate);
            return; // 제외된 날짜는 건너뛰기
          }

          // 새 이벤트 인스턴스 생성
          const newEvent: Event = {
            ...event,
            id: `${event.id}_${occurrenceDate}`, // 가상 ID 할당
            start_time: occurrence.toISOString(), // 발생 시간
            recurring_event_id: event.id, // 원본 이벤트 ID 참조
          };

          // 종료 시간이 있는 경우 계산
          if (event.end_time) {
            const originalEndDate = new Date(event.end_time);

            // 시작과 종료 사이의 시간 차이 (밀리초)
            const duration =
              originalEndDate.getTime() - originalStartTime.getTime();

            // 새 종료 시간 계산
            const newEndTime = new Date(occurrence.getTime() + duration);
            newEvent.end_time = newEndTime.toISOString(); // UTC 시간 유지
          }

          expandedEvents.push(newEvent);
        });
      } catch (error) {
        console.error("반복 일정 처리 오류:", error, event);
        // 오류 시 원본 이벤트 추가
        expandedEvents.push(event);
      }
    });

    return expandedEvents;
  };

  // 이벤트가 변경될 때마다 달력 업데이트
  useEffect(() => {
    fetchEvents();
  }, [currentDate, refreshTrigger]);

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
  const months = [
    "1월",
    "2월",
    "3월",
    "4월",
    "5월",
    "6월",
    "7월",
    "8월",
    "9월",
    "10월",
    "11월",
    "12월",
  ];

  const handleMonthSelect = (monthIndex: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(monthIndex);
    setCurrentDate(newDate);
    setIsMonthSelectorOpen(false);
  };

  // 특정 날짜에 이벤트 표시 (수정)
  const getEventsForDate = (date: Date) => {
    // 확장된 이벤트 목록 사용
    return expandedEvents.filter((event) => {
      const eventDate = new Date(event.start_time);

      // 타임존을 고려하여 이벤트의 로컬 날짜 계산
      const localEventDate = new Date(eventDate);

      // 날짜 비교 (연도, 월, 일만 비교)
      const isSameDate =
        localEventDate.getFullYear() === date.getFullYear() &&
        localEventDate.getMonth() === date.getMonth() &&
        localEventDate.getDate() === date.getDate();

      return isSameDate;
    });
  };

  return (
    <div className="min-h-screen w-full bg-[#FFF4BB] flex flex-col items-center">
      {/* 알림 패널 오버레이 */}
      {isNotificationOpen && (
        <>
          {/* 반투명 배경 */}
          <div
            className="fixed inset-0 bg-black/30 z-30"
            onClick={() => setIsNotificationOpen(false)}
          />

          {/* 알림 패널 */}
          <div className="fixed right-0 top-0 w-[250px] h-full bg-white z-50 shadow-lg transform transition-transform duration-300 ease-in-out rounded-l-[20px]">
            {/* 헤더 */}
            <div className="flex items-center justify-between px-4 pt-8 pb-4 border-b border-gray-100 mt-[30px]">
              <div className="w-9 h-9 opacity-0">
                {/* 빈 공간 유지를 위한 투명한 요소 */}
              </div>
              <div className="text-xl font-['Do_Hyeon'] flex-1 text-center">
                알림
              </div>
              <div className="w-9 h-9 opacity-0">
                {/* 빈 공간 유지를 위한 투명한 요소 */}
              </div>
            </div>

            {/* Exit 아이콘 */}
            <div
              className="absolute bottom-6 left-6 w-10 h-10 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setIsNotificationOpen(false)}
            >
              <div
                style={
                  {
                    display: "inline-block",
                    width: "100%",
                    height: "100%",
                    "--svg":
                      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%239CA3AF' d='M5 21q-.825 0-1.413-.587Q3 19.825 3 19V5q0-.825.587-1.413Q4.175 3 5 3h7v2H5v14h7v2Zm11-4-1.375-1.45 2.55-2.55H9v-2h8.175l-2.55-2.55L16 7l5 5Z'/%3E%3C/svg%3E\")",
                    backgroundColor: "currentColor",
                    WebkitMaskImage: "var(--svg)",
                    maskImage: "var(--svg)",
                    WebkitMaskRepeat: "no-repeat",
                    maskRepeat: "no-repeat",
                    WebkitMaskSize: "100% 100%",
                    maskSize: "100% 100%",
                    color: "#9CA3AF",
                  } as React.CSSProperties
                }
              />
            </div>

            {/* 알림 내용 */}
            <div className="p-4">
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-yellow-400 mt-2"></div>
                  <div>
                    <div className="text-sm text-neutral-600 font-['Do_Hyeon']">
                      오늘의 일정이 있습니다.
                    </div>
                    <div className="text-xs text-neutral-400 mt-1">
                      10:00 AM
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-yellow-400 mt-2"></div>
                  <div>
                    <div className="text-sm text-neutral-600 font-['Do_Hyeon']">
                      내일 일정이 있습니다.
                    </div>
                    <div className="text-xs text-neutral-400 mt-1">2:30 PM</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 배경 장식 요소 왼쪽*/}
      {/* 상단 메뉴 버튼 */}
      {/* <div 
        className="cursor-pointer absolute left-[23px] top-[50px] z-10"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        <div className="w-6 h-1 bg-zinc-500 mb-[6px]" />
        <div className="w-6 h-1 bg-zinc-500 mb-[6px]" />
        <div className="w-6 h-1 bg-zinc-500" />
      </div> */}

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
              <div className="text-xl font-['Do_Hyeon'] flex-1 text-center">
                메뉴
              </div>
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
                  <div className="text-base text-neutral-700 font-['Do_Hyeon']">
                    일정
                  </div>
                </div>
                <div
                  className="py-3 border-b border-gray-100"
                  onClick={() => {
                    setSelectedDate(new Date());
                    setInitialTab("today");
                    setIsMenuOpen(false);
                  }}
                >
                  <div className="text-base text-neutral-700 font-['Do_Hyeon']">
                    오늘의 하루
                  </div>
                </div>
                <div
                  className="py-3 border-b border-gray-100"
                  onClick={() => {
                    setSelectedDate(new Date());
                    setInitialTab("diary");
                    setIsMenuOpen(false);
                  }}
                >
                  <div className="text-base text-neutral-700 font-['Do_Hyeon']">
                    아기와의 하루
                  </div>
                </div>
              </div>
            </div>

            {/* Exit 아이콘 */}
            <div
              className="absolute bottom-6 right-6 w-10 h-10 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setIsMenuOpen(false)}
            >
              <div
                style={
                  {
                    display: "inline-block",
                    width: "100%",
                    height: "100%",
                    "--svg":
                      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%239CA3AF' d='M5 21q-.825 0-1.413-.587Q3 19.825 3 19V5q0-.825.587-1.413Q4.175 3 5 3h7v2H5v14h7v2Zm11-4-1.375-1.45 2.55-2.55H9v-2h8.175l-2.55-2.55L16 7l5 5Z'/%3E%3C/svg%3E\")",
                    backgroundColor: "currentColor",
                    WebkitMaskImage: "var(--svg)",
                    maskImage: "var(--svg)",
                    WebkitMaskRepeat: "no-repeat",
                    maskRepeat: "no-repeat",
                    WebkitMaskSize: "100% 100%",
                    maskSize: "100% 100%",
                    color: "#9CA3AF",
                  } as React.CSSProperties
                }
              />
            </div>
          </div>
        </>
      )}

    

      {/* 요일 헤더 + 달력 날짜: Responsive Grid */}
      <div className="w-full max-w-md mx-auto mt-8 flex flex-col items-center justify-center">
        <div className="grid grid-cols-7 w-full bg-transparent">
          {dayNames.map((day, index) => (
            <div
              key={`header-${day}`}
              className={`text-center text-l font-normal font-['Do_Hyeon'] py-2 sm:py-3 select-none
                ${index === 0 ? 'text-red-400' : index === 6 ? 'text-indigo-400' : 'text-black'}`}
            >
              {day}
            </div>
          ))}
        </div>
        {/* 날짜 그리드 */}
        <div className="grid grid-cols-7 w-full bg-transparent min-h-[320px] sm:min-h-[420px]">
          {/* 빈 칸 (1일 시작 요일 맞추기) */}
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {/* 날짜 셀 */}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dayOfWeek = (firstDayOfMonth + i) % 7;
            const isSunday = dayOfWeek === 0;
            const isSaturday = dayOfWeek === 6;
            const isToday =
              day === new Date().getDate() &&
              currentDate.getMonth() === new Date().getMonth() &&
              currentDate.getFullYear() === new Date().getFullYear();
            const dayEvents = getEventsForDay(day);
            return (
              <div key={`day-${day}`} className="flex flex-col items-center py-1 sm:py-2">
                <button
                  className={`w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center rounded-full text-base font-normal font-['Do_Hyeon'] transition-colors
                    ${isToday ? 'bg-yellow-200' : 'hover:bg-yellow-50'}
                    ${isSunday ? 'text-red-400' : isSaturday ? 'text-indigo-400' : 'text-black'}`}
                  onClick={() => {
                    const clickedDate = new Date(
                      currentDate.getFullYear(),
                      currentDate.getMonth(),
                      day
                    );
                    setSelectedDate(clickedDate);
                  }}
                  style={{ backgroundColor: isToday ? '#fef3c7' : undefined }}
                >
                  {day}
                </button>
                {/* 일정 표시 (최대 3개까지) */}
                <div className="flex flex-col w-full gap-[2px] mt-1">
                  {dayEvents.slice(0, 3).map((event, index) => (
                    <div
                      key={`event-${event.id}-${index}`}
                      className="text-xs rounded-md px-1 truncate cursor-pointer"
                      style={{
                        backgroundColor: getColorForEvent(event.color),
                        height: '16px',
                        overflow: 'hidden',
                      }}
                      onClick={e => {
                        e.stopPropagation();
                        const clickedDate = new Date(
                          currentDate.getFullYear(),
                          currentDate.getMonth(),
                          day
                        );
                        setSelectedDate(clickedDate);
                      }}
                    >
                      {event.title}
                    </div>
                  ))}
                  {/* 추가 일정 표시 (+N개 더) */}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{dayEvents.length - 3}개 더
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DatePopup */}
      {selectedDate && (
        <DatePopup
          date={selectedDate}
          isOpen={true}
          onClose={() => setSelectedDate(null)}
          initialTab={initialTab}
          expandedEvents={expandedEvents}
          onDataChanged={refreshEvents}
        />
      )}

      {/* SchedulePopup */}
      <SchedulePopup
        isOpen={isSchedulePopupOpen}
        onClose={() => setIsSchedulePopupOpen(false)}
        selectedDate={new Date()}
        onEventAdded={refreshEvents}
      />
    </div>
  );
};

// 이벤트 색상 헬퍼 함수
const getColorForEvent = (color: string | null): string => {
  const colorMap: Record<string, string> = {
    blue: "#DBEAFE", // blue-100
    green: "#D1FAE5", // green-100
    pink: "#FCE7F3", // pink-100
    red: "#FEE2E2", // red-100
    purple: "#EDE9FE", // purple-100
  };

  return colorMap[color || "blue"] || colorMap.blue;
};

export default Calendar;
