import React, { useState } from 'react';
import SchedulePopup from '@/app/calendar/SchedulePopup';
import DiaryPopup from '@/app/calendar/DiaryPopup';

interface DiaryEntry {
  id: string;
  title: string;
  content: string;
  date: string;  // Date 객체 대신 문자열로 저장
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

  // 팝업이 닫힐 때 상태 초기화
  const handleClose = () => {
    setSelectedDiary(null);
    setIsDiaryPopupOpen(false);
  };

  if (!isOpen) return null;

  const formatDate = (date: Date) => {
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
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

  const currentDateEntries = diaryEntries.filter(entry => entry.date === formatDate(date));

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
          <div className="flex justify-center mt-[62px]">
            <button 
              className="w-1/2 bg-yellow-200 text-gray font-['Do_Hyeon'] py-2 rounded-[20px] hover:bg-yellow-500 transition-colors"
              onClick={() => setIsSchedulePopupOpen(true)}
            >
              일정 등록
            </button>
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

      {/* 일정 등록 팝업 */}
      <SchedulePopup 
        isOpen={isSchedulePopupOpen}
        onClose={() => setIsSchedulePopupOpen(false)}
        selectedDate={date}
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
    </>
  );
};

export default DatePopup; 