import { supabase } from './supabase';

// 수파베이스에서 사용자 세션 가져오기
export const getSessionData = async () => {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) {
    console.error('사용자 세션을 가져오는 중 오류 발생:', sessionError);
    return false;
  }
  return sessionData?.session?.user;
};

// 임신 주차를 기반으로 출산 예정일 계산
export const calculateDueDate = (week: number): string => {
  const today = new Date();
  const pregnancyStart = new Date(today);
  const weeksInMilliseconds = (week - 1) * 7 * 24 * 60 * 60 * 1000;
  pregnancyStart.setTime(today.getTime() - weeksInMilliseconds);
  const dueDate = new Date(pregnancyStart);
  dueDate.setDate(pregnancyStart.getDate() + 280); // 40주 = 280일
  return dueDate.toISOString().split('T')[0];
};

// 출산 예정일을 기반으로 임신 주차 계산
export const calculatePregnancyWeek = (dueDate: string): number => {
  const today = new Date();
  const due = new Date(dueDate);
  const pregnancyStart = new Date(due);
  pregnancyStart.setDate(due.getDate() - 280); // 40주 = 280일
  const diffTime = today.getTime() - pregnancyStart.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const currentWeek = Math.floor(diffDays / 7) + 1;
  return Math.min(Math.max(1, currentWeek), 40); // 1주에서 40주 사이로 제한
};

// 출산일까지 남은 일수 계산
export const calculateDaysUntilBirth = (dueDate: string): number => {
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// 달력의 날짜 생성
export const generateCalendarDays = (currentMonth: Date) => {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days = [];
  const prevMonthLastDate = new Date(year, month, 0).getDate();
  const firstDayOfWeek = firstDay.getDay();
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    days.push({
      date: new Date(year, month - 1, prevMonthLastDate - i),
      isCurrentMonth: false
    });
  }
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push({
      date: new Date(year, month, i),
      isCurrentMonth: true
    });
  }
  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    days.push({
      date: new Date(year, month + 1, i),
      isCurrentMonth: false
    });
  }
  return days;
};

// 연도와 월 형식화
export const formatYearMonth = (date: Date) => {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
};

// Move the registerPregnancy function from registerPregnancy.ts

export const registerPregnancy = async (babyName: string, expectedDate: string, pregnancyWeek: string, highRisk: boolean, babyGender: string) => {
  console.log('registerPregnancy 함수 시작');
  const user = await getSessionData();
  console.log('세션 데이터 확인:', user);
  if (!user) {
    console.error('사용자가 로그인되어 있지 않습니다');
    return;
  }

  const newPregnancy = {
    baby_name: babyName,
    due_date: expectedDate,
    current_week: parseInt(pregnancyWeek, 10),
    high_risk: highRisk,
    baby_gender: babyGender,
    userId: user.id,
    guardian_id: user.id,
    status: 'active',
  };

  console.log('생성할 임신 정보:', newPregnancy);

  const { data, error } = await supabase.from('pregnancies').insert(newPregnancy);
  if (error) {
    console.error('임신 정보 생성 중 오류 발생:', error);
  } else {
    console.log('임신 정보가 성공적으로 생성되었습니다:', data);
  }
}; 