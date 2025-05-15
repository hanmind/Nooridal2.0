import React, { useState, useEffect } from 'react';

interface DiaryEntry {
  id: string;
  title: string;
  content: string;
  date: string;
}

interface DiaryPopupProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  onSave: (entry: DiaryEntry) => void;
  mode?: 'create' | 'view' | 'edit';
  initialData?: DiaryEntry;
  onEdit?: (entry: DiaryEntry) => void;
  onDelete?: (id: string) => void;
  image?: string | null;
}

const DiaryPopup: React.FC<DiaryPopupProps> = ({ 
  isOpen, 
  onClose, 
  date, 
  onSave, 
  mode = 'create',
  initialData,
  onEdit,
  onDelete,
  image
}) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // initialData가 변경될 때마다 title과 content 업데이트
  useEffect(() => {
    setTitle(initialData?.title || '');
    setContent(initialData?.content || '');
  }, [initialData]);

  // 팝업이 닫힐 때 상태 초기화
  const handleClose = () => {
    setShowDeleteConfirm(false);
    setIsEditMode(false);
    onClose();
  };

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
      id: mode === 'edit' || isEditMode ? (initialData?.id || Date.now().toString()) : Date.now().toString(),
      title,
      content,
      date: formatDate(date)
    };

    if (isEditMode && onEdit) {
      onEdit(newEntry);
      setIsEditMode(false);
    } else {
      onSave(newEntry);
    }
    handleClose();
  };

  if (showDeleteConfirm) {
    return (
      <>
        {/* 반투명 배경 */}
        <div 
          className="fixed inset-0 bg-black/30 z-50"
          onClick={handleClose}
        />
        
        {/* 삭제 확인 팝업 */}
        <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] bg-white z-50 shadow-lg rounded-[20px] p-6">
          <div className="text-center">
            <div className="text-xl font-['Do_Hyeon'] mb-8">
              일기를 삭제 하시겠습니까?
            </div>
            <div className="flex gap-4 justify-center">
              <button 
                className="w-1/4 py-2 rounded-[20px] bg-[#FFB4A4] text-white font-['Do_Hyeon']"
                onClick={() => {
                  if (initialData && onDelete) {
                    onDelete(initialData.id);
                  }
                  handleClose();
                }}
              >
                예
              </button>
              <button 
                className="w-1/4 py-2 rounded-[20px] bg-neutral-200 text-neutral-600 font-['Do_Hyeon']"
                onClick={() => setShowDeleteConfirm(false)}
              >
                아니오
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* 반투명 배경 */}
      <div 
        className="fixed inset-0 bg-black/30 z-50"
        onClick={handleClose}
      />
      
      {/* 팝업 */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] bg-white z-50 shadow-lg rounded-[20px] p-6">
        {mode === 'view' && !isEditMode ? (
          <>
            {/* 제목 표시 */}
            <div className="w-full p-2 border-b border-neutral-200 font-['Do_Hyeon'] text-neutral-600 mb-4">
              {initialData?.title}
            </div>

            {/* 일기 내용 표시 */}
            <div className="w-full h-[200px] p-4 border border-neutral-200 rounded-lg font-['Do_Hyeon'] text-neutral-600 mb-6 overflow-y-auto whitespace-pre-wrap">
              {initialData?.content}
            </div>

            {/* 첨부 이미지 표시 */}
            {typeof image === 'string' && image && (
              <div className="flex justify-center mb-4">
                <img src={image} alt="첨부 이미지" className="max-h-40 rounded-lg" />
              </div>
            )}

            {/* 하단 버튼 */}
            <div className="flex gap-4 justify-center">
              <button 
                className="w-1/2 py-2 rounded-[20px] bg-[#C5E9FF] text-gray font-['Do_Hyeon'] hover:bg-[#9FC5E8] transition-colors"
                onClick={() => {
                  if (initialData) {
                    setTitle(initialData.title);
                    setContent(initialData.content);
                    setIsEditMode(true);
                  }
                }}
              >
                수정
              </button>
              <button 
                className="w-1/2 py-2 rounded-[20px] bg-[#FFC2B4] text-gray font-['Do_Hyeon'] hover:bg-[#FFB4A4] transition-colors"
                onClick={() => setShowDeleteConfirm(true)}
              >
                삭제
              </button>
            </div>
          </>
        ) : (
          <>
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
            <div className="flex gap-4 justify-center">
              <button 
                className="w-1/2 py-2 rounded-[20px] bg-neutral-200 text-neutral-600 font-['Do_Hyeon'] hover:bg-neutral-300 transition-colors"
                onClick={handleClose}
              >
                닫기
              </button>
              <button 
                className="w-1/2 py-2 rounded-[20px] bg-[#9FC5E8] text-white font-['Do_Hyeon']"
                onClick={handleSave}
              >
                {isEditMode ? '수정' : '저장'}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default DiaryPopup; 