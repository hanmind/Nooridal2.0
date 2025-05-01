"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import PregnancyFormLayout from "@/components/pregnancy/PregnancyFormLayout";
import { supabase } from '../../../../utils/supabase';
import { Database } from '../../../../../types_db';

type Pregnancy = Database['public']['Tables']['pregnancies']['Row'];

export default function PregnancyInfo() {
  const router = useRouter();
  const [isPregnant, setIsPregnant] = useState(false);
  const [pregnancies, setPregnancies] = useState<Pregnancy[]>([]);
  const [babyName, setBabyName] = useState("");
  const [expectedDate, setExpectedDate] = useState("");
  const [highRisk, setHighRisk] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [babyGender, setBabyGender] = useState("");
  const [pregnancyWeek, setPregnancyWeek] = useState("");
  const [lastPeriodDate, setLastPeriodDate] = useState("");
  const [noInfo, setNoInfo] = useState(false);
  const [noName, setNoName] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [waitingForBaby, setWaitingForBaby] = useState(false);
  const [showHighRiskModal, setShowHighRiskModal] = useState(false);

  useEffect(() => {
    fetchPregnancies();
  }, []);

  const fetchPregnancies = async () => {
    const { data, error } = await supabase.from('pregnancies').select('*');
    if (error) console.error('Error fetching pregnancies:', error);
    else setPregnancies(data);
  };

  const handlePrevious = () => {
    if (currentStep === 2) {
      router.push('/register/pregnant/pregnancy-info');
    } else if (currentStep === 1) {
    router.push('/login');
    }
  };

  const createPregnancy = async () => {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error('Error fetching user session:', sessionError);
      return;
    }

    const user = sessionData?.session?.user;
    if (!user) {
      console.error('User not logged in');
      return;
    }

    const dueDate = new Date(expectedDate);
    const today = new Date();
    const diffInTime = dueDate.getTime() - today.getTime();
    const diffInDays = Math.ceil(diffInTime / (1000 * 3600 * 24));
    const currentWeek = Math.floor((280 - diffInDays) / 7); // Assuming 280 days for full term

    const newPregnancy = {
      baby_name: babyName,
      due_date: dueDate.toISOString().split('T')[0],
      current_week: currentWeek,
      high_risk: highRisk,
      created_at: new Date().toISOString(),
      userId: user.id,
      guardian_id: user.id,
      status: 'active' as 'active',
    };

    console.log('Attempting to create pregnancy with data:', newPregnancy);

    try {
      const { data, error } = await supabase.from('pregnancies').insert(newPregnancy);
      if (error) {
        console.error('Error creating pregnancy:', error.message, error.details);
      } else {
        console.log('Pregnancy created successfully:', data);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  };

  const handleNext = async () => {
    console.log('Current step:', currentStep);
    console.log('Data at current step:', {
      babyName,
      expectedDate,
      pregnancyWeek,
      babyGender,
      highRisk,
    });
    if (currentStep === 4) {
      console.log('Calling createPregnancy');
      await createPregnancy();
      router.push('/mypage'); // Navigate to My Page after registration
    } else {
      if (currentStep === 1) {
        if (isPregnant) {
          setCurrentStep(2);
          console.log('Moving to step 2');
        } else if (waitingForBaby) {
          console.log('Navigating directly to calendar');
          router.push('/calendar');
        }
      } else if (currentStep === 2) {
        setCurrentStep(3);
        console.log('Moving to step 3');
      } else if (currentStep === 3) {
        setCurrentStep(4);
        console.log('Moving to step 4');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data, error } = await supabase
      .from('pregnancies')
      .insert([{ due_date: expectedDate, weeks: expectedDate }]);

    if (error) {
      console.error('Error inserting data:', error);
    } else {
      console.log('Data inserted successfully:', data);
    }
  };

  useEffect(() => {
    console.log('Current step after render:', currentStep);
  }, [currentStep]);

  const calculatePregnancyInfo = (lastPeriodDate: Date) => {
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lastPeriodDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const pregnancyWeek = Math.floor(diffDays / 7);
    
    const dueDate = new Date(lastPeriodDate);
    dueDate.setDate(dueDate.getDate() + 280);
    
    setPregnancyWeek(pregnancyWeek.toString());
    setExpectedDate(dueDate.toISOString().split('T')[0]);
  };

  const generateCalendarDays = () => {
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
        isCurrentMonth: false,
      });
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return days;
  };

  const handleDateSelect = (date: Date) => {
    setExpectedDate(date.toISOString().split('T')[0]);
    setShowCalendar(false);
    if (currentStep === 3) {
      setCurrentStep(4);
    }
  };

  const formatYearMonth = (date: Date) => {
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
  };

  return (
    <PregnancyFormLayout
      title="임신 정보를 입력해주세요"
      subtitle="누리달에서 맞춤 서비스를 제공해 드립니다"
      currentStep={currentStep}
      onPrevious={handlePrevious}
      onNext={handleNext}
      isNextDisabled={currentStep === 1 && !isPregnant}
    >
      {currentStep === 1 && (
        <div className="w-full p-4 bg-[#FFF4BB] rounded-xl border border-[#FFE999] mb-4 flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={isPregnant}
            onChange={() => {
              setIsPregnant(!isPregnant);
              setWaitingForBaby(false);
            }}
          className="w-4 h-4 mr-4"
        />
          <span className="text-black font-['Do_Hyeon']">🤰🏻 뱃속에 아기가 있어요</span>
        </div>
      )}

      {currentStep === 2 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 font-['Do_Hyeon']">태명</label>
          <input
            type="text"
            value={babyName}
            onChange={(e) => setBabyName(e.target.value)}
            placeholder="태명을 입력하세요"
            className="mt-1 block w-full p-2.5 bg-[#FFF4BB] rounded-xl border border-yellow-300 text-black font-['Do_Hyeon'] focus:outline-none focus:border-[#FFE999] focus:border-2 transition-colors"
          />
          <div 
            className="mt-3 flex items-center cursor-pointer"
            onClick={() => {
              setNoName(!noName);
              if (!noName) {
                setBabyName("아기");
              } else {
                setBabyName("");
              }
            }}
          >
            <input
              type="checkbox"
              checked={noName}
              onChange={() => {
                setNoName(!noName);
                if (!noName) {
                  setBabyName("아기");
                } else {
                  setBabyName("");
                }
              }}
              className="w-4 h-4 mr-2"
            />
            <span className="text-black text-sm font-['Do_Hyeon']">아직 이름이 없어용</span>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 font-['Do_Hyeon']">성별</label>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => setBabyGender('남자')}
                className={`flex-1 p-2 rounded-xl border ${
                  babyGender === '남자' ? 'bg-blue-200 border-blue-200' : 'bg-white border-gray-300'
                } cursor-pointer transition-colors font-['Do_Hyeon']`}
              >
                <span className="text-black text-sm">남자</span>
              </button>
              <button
                onClick={() => setBabyGender('여자')}
                className={`flex-1 p-2 rounded-xl border ${
                  babyGender === '여자' ? 'bg-red-200 border-red-200' : 'bg-white border-gray-300'
                } cursor-pointer transition-colors font-['Do_Hyeon']`}
              >
                <span className="text-black text-sm">여자</span>
              </button>
              <button
                onClick={() => setBabyGender('모름')}
                className={`flex-1 p-2 rounded-xl border ${
                  babyGender === '모름' ? 'bg-gray-200 border-gray-200' : 'bg-white border-gray-300'
                } cursor-pointer transition-colors font-['Do_Hyeon']`}
              >
                <span className="text-black text-sm">비밀</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {currentStep === 3 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 font-['Do_Hyeon']">현재 임신 주차</label>
          <input
            type="text"
            value={pregnancyWeek}
            onChange={(e) => setPregnancyWeek(e.target.value)}
            placeholder="임신 주차를 입력하세요"
            className="mt-1 block w-full p-2.5 bg-[#FFF4BB] rounded-xl border border-yellow-300 text-black font-['Do_Hyeon'] focus:outline-none focus:border-[#FFE999] focus:border-2 transition-colors"
          />

          <label className="block text-sm font-medium text-gray-700 font-['Do_Hyeon'] mt-4">출산 예정일</label>
          <div className="relative">
            <input
              type="text"
              value={expectedDate}
              onClick={() => setShowCalendar(true)}
              placeholder="날짜를 선택해 주세요"
              className="mt-1 block w-full p-2.5 bg-[#FFF4BB] rounded-xl border border-yellow-300 text-black font-['Do_Hyeon'] focus:outline-none focus:border-[#FFE999] focus:border-2 transition-colors"
              readOnly
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8h18M3 8V6a2 2 0 012-2h14a2 2 0 012 2v2M3 8v10a2 2 0 002 2h14a2 2 0 002-2V8M16 12h4M8 12h4M8 16h4" />
              </svg>
            </div>
          </div>

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

                <div className="flex justify-between items-center mb-3">
                  <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
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
                    onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

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

                <div className="grid grid-cols-7 gap-0.5">
                  {generateCalendarDays().map((day, index) => (
                    <button
                      key={index}
                      onClick={() => handleDateSelect(day.date)}
                      disabled={!day.isCurrentMonth}
                      className={`
                        w-10 h-10 flex items-center justify-center text-sm font-['Do_Hyeon'] rounded-full
                        ${day.isCurrentMonth
                          ? day.date.toISOString().split('T')[0] === expectedDate
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

          <div className="mt-4 flex items-center">
            <input
              type="checkbox"
              checked={noInfo}
              onChange={() => setNoInfo(!noInfo)}
              className="w-4 h-4 mr-2"
            />
            <span className="text-sm font-['Do_Hyeon'] text-gray-700">두 개 다 잘 모르겠어요</span>
          </div>

          {noInfo && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 font-['Do_Hyeon']">마지막 생리일</label>
              <div className="relative">
                <input
                  type="text"
                  value={lastPeriodDate}
                  onClick={() => setShowCalendar(true)}
                  placeholder="날짜를 선택해 주세요"
                  className="mt-1 block w-full p-2.5 bg-[#FFF4BB] rounded-xl border border-yellow-300 text-black font-['Do_Hyeon'] focus:outline-none focus:border-[#FFE999] focus:border-2 transition-colors"
                  readOnly
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8h18M3 8V6a2 2 0 012-2h14a2 2 0 012 2v2M3 8v10a2 2 0 002 2h14a2 2 0 002-2V8M16 12h4M8 12h4M8 16h4" />
                  </svg>
                </div>
              </div>

              {showCalendar && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                  <div 
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
                    onClick={() => setShowCalendar(false)} 
                  />
                  <div className="bg-white p-4 rounded-2xl shadow-lg w-[320px] relative z-10 mx-4">
                    <div className="text-center mb-4">
                      <div className="text-lg font-['Do_Hyeon'] text-gray-900">
                        마지막 생리일을 선택해주세요
                      </div>
                    </div>

                    <div className="flex justify-between items-center mb-3">
                      <button
                        onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
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
                        onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>

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

                    <div className="grid grid-cols-7 gap-0.5">
                      {generateCalendarDays().map((day, index) => (
                        <button
                          key={index}
                          onClick={() => handleDateSelect(day.date)}
                          disabled={!day.isCurrentMonth}
                          className={`
                            w-10 h-10 flex items-center justify-center text-sm font-['Do_Hyeon'] rounded-full
                            ${day.isCurrentMonth
                              ? day.date.toISOString().split('T')[0] === lastPeriodDate
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
          )}
        </div>
      )}

      {currentStep === 4 && (
        <div className="mb-4 flex items-center cursor-pointer bg-red-100 p-2 rounded">
          <input
            type="checkbox"
            checked={highRisk}
            onChange={() => setShowHighRiskModal(true)}
            className={`w-4 h-6 mr-2 rounded border-gray-300 ${highRisk ? 'bg-red-100' : ''}`}
          />
          <span className="text-red-500 text-sm font-['Do_Hyeon']">고위험 임신입니다</span>
        </div>
      )}

      {showHighRiskModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-[20px] shadow-lg w-[90%] max-w-md z-10 mx-4">
            <div className="text-center mb-6">
              <div className="text-xl font-['Do_Hyeon'] text-gray-900 mb-2">
                고위험 임신이란?
              </div>
              <div className="text-sm font-['Do_Hyeon'] text-gray-600">
                다음과 같은 경우 고위험 임신으로 분류됩니다:
              </div>
            </div>

            <div className="mb-6 space-y-3 bg-gray-50 p-4 rounded-xl">
              <div className="text-sm font-['Do_Hyeon'] text-gray-700">• 만 35세 이상의 고령 임신</div>
              <div className="text-sm font-['Do_Hyeon'] text-gray-700">• 임신성 당뇨</div>
              <div className="text-sm font-['Do_Hyeon'] text-gray-700">• 임신성 고혈압</div>
              <div className="text-sm font-['Do_Hyeon'] text-gray-700">• 다태 임신</div>
              <div className="text-sm font-['Do_Hyeon'] text-gray-700">• 전치태반</div>
              <div className="text-sm font-['Do_Hyeon'] text-gray-700">• 조기진통</div>
              <div className="text-sm font-['Do_Hyeon'] text-gray-700">• 산부인과 전문의가 고위험 임신으로 판단한 경우</div>
            </div>

            <div className="text-sm font-['Do_Hyeon'] text-gray-600 mb-6 p-3 bg-[#FFF4BB] rounded-xl">
              누리달에서는 고위험 임신부를 위한 맞춤 서비스를 제공해 드립니다.
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => {
                  setShowHighRiskModal(false);
                  setHighRisk(true);
                }}
                className="w-20 h-9 rounded-2xl bg-[#FFE999] hover:bg-[#FFD999] transition-colors"
              >
                <span className="text-gray-900 text-sm font-['Do_Hyeon']">확인</span>
              </button>
            </div>
          </div>
      </div>
      )}
    </PregnancyFormLayout>
  );
} 
