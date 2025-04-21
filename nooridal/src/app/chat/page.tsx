"use client";

import { useState, useEffect } from 'react';

export default function ChatPage() {
  // 메시지, 입력 값, 활성 탭을 관리하는 상태
  const [messages, setMessages] = useState<{ text: string; sender: string; time: string }[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [activeTab, setActiveTab] = useState('chat');

  // 하루에 한 번 환영 메시지를 설정하는 효과
  useEffect(() => {
    const today = new Date().toDateString();
    const lastVisit = localStorage.getItem('lastVisit');
    if (lastVisit !== today) {
      const welcomeMessage = "안녕하세요. AI에이전트 플로렌스 입니다.\n나이팅게일의 풀네임은 플로렌스 나이팅게일이라고 하네요. 그분의 정신을 닮아 성심성의껏 도움을 드리겠습니다.\n아기는 현재 *주차이시군요 !\n임신과 출산에 관한 궁금한 점을 물어보세요!";
      const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages((prevMessages) => [...prevMessages, { text: welcomeMessage, sender: 'system', time: currentTime }]);
      localStorage.setItem('lastVisit', today);
    }
  }, []);

  // 메시지 전송을 처리하는 함수
  const handleSendMessage = () => {
    if (inputValue.trim()) {
      const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages([...messages, { text: inputValue, sender: 'user', time: currentTime }]);
      setInputValue('');
    }
  };

  // 탭 클릭을 처리하고 활성 탭을 설정하는 함수
  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'mypage') {
      window.location.href = '/mypage';
    } else if (tab === 'calendar') {
      window.location.href = '/calendar';
    } else if (tab === 'location') {
      window.location.href = '/location';
    } else if (tab === 'chat') {
      window.location.href = '/chat';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-yellow-100">
      {/* Footer remains, chat screen content removed */}
      <div className="w-full h-20 fixed bottom-0 flex justify-around items-center bg-white shadow-md rounded-t-lg px-4" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {['chat', 'calendar', 'location', 'mypage'].map((tab, index) => (
          <div key={tab} className="flex flex-col items-center cursor-pointer" onClick={() => handleTabClick(tab)}>
            <div className={`w-10 h-10 flex items-center justify-center rounded-full ${activeTab === tab ? 'bg-[#FFD600]' : ''}`}>
              <svg
                className={`w-6 h-6 ${activeTab === tab ? 'stroke-white' : 'stroke-[#979595]'}`}
                fill="none"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                {tab === 'chat' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />}
                {tab === 'calendar' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />}
                {tab === 'location' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />}
                {tab === 'location' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />}
                {tab === 'mypage' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />}
              </svg>
            </div>
            <div className={`text-xs font-normal font-['Do_Hyeon'] ${activeTab === tab ? 'text-[#FFD600]' : 'text-[#979595]'}`}>{tab === 'chat' ? '채팅' : tab === 'calendar' ? '캘린더' : tab === 'location' ? '위치' : '마이페이지'}</div>
          </div>
        ))}
      </div>
    </div>
  );
} 