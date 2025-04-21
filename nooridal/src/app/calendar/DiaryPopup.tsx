import React, { useState } from 'react';

interface DiaryEntry {
  id: string;
  title: string;
  content: string;
  date: Date;
}

interface DiaryPopupProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  onSave: (entry: DiaryEntry) => void;
}

const DiaryPopup: React.FC<DiaryPopupProps> = ({ isOpen, onClose, date, onSave }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  if (!isOpen) return null;

  const formatDate = (date: Date) => {
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }

    const newEntry: DiaryEntry = {
      id: Date.now().toString(),
      title,
      content,
      date
    };

    onSave(newEntry);
    setTitle('');
    setContent('');
    onClose();
  };

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
        <div className="text-xl font-['Do_Hyeon'] text-center mb-4">
          아기와의 하루
        </div>

        {/* 날짜 */}
        <div className="bg-yellow-100 w-fit mx-auto px-4 py-1 rounded-full text-sm font-['Do_Hyeon'] mb-6">
          {formatDate(date)}
        </div>

        {/* 제목 입력 */}
        <input
          type="text"
          placeholder="제목을 입력하세요"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border-b border-neutral-200 focus:outline-none font-['Do_Hyeon'] text-neutral-600 mb-4"
        />

        {/* 일기 입력 */}
        <textarea
          placeholder="아기와의 소중한 하루를 기록해보세요...♥"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-[200px] p-4 border border-neutral-200 rounded-lg focus:outline-none font-['Do_Hyeon'] text-neutral-600 resize-none mb-6"
        />

        {/* 하단 버튼 */}
        <div className="flex gap-4">
          <button 
            className="flex-1 py-2 rounded-[20px] bg-[#B7D7A8] text-white font-['Do_Hyeon']"
          >
            사진 첨부
          </button>
          <button 
            className="flex-1 py-2 rounded-[20px] bg-[#9FC5E8] text-white font-['Do_Hyeon']"
            onClick={handleSave}
          >
            저장
          </button>
        </div>
      </div>
    </>
  );
};

export default DiaryPopup; 