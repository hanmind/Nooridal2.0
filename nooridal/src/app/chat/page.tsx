"use client";

import { useState } from 'react';

export default function ChatPage() {
  const [activeTab, setActiveTab] = useState('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center" style={{ backgroundColor: '#FFF4BB' }} onClick={closeSidebar}>
      {/* 채팅 화면 배경 및 요소 */}
      <div className="w-96 h-[874px] relative overflow-hidden flex flex-col items-center justify-center" style={{ backgroundColor: '#FFF4BB' }} onClick={(e) => e.stopPropagation()}>
        <div>
          <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
          </svg>
        </div>
        <div className="w-full text-center text-neutral-700 text-2xl font-normal font-['Do_Hyeon'] leading-[50px] absolute" style={{ top: '43px' }}>
          채팅
        </div>
        <svg className="w-6 h-6 text-gray-500 inline-block mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" xmlns="http://www.w3.org/2000/svg" style={{ marginLeft: '-280px', position: 'absolute', top: '55px' }} onClick={toggleSidebar}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.5 19.5l19-7-19-7v7l13 0-13 0v7z" />
        </svg>
        <div className="w-24 h-14 absolute rounded-full blur-[2px]" style={{ top: '229px', left: '260.61px' }} />
        <div className="w-24 h-14 absolute rounded-full blur-[2px]" style={{ top: '241.80px', left: '208px' }} />
        <div className="w-24 h-14 absolute rounded-full blur-[2px]" style={{ top: '255.94px', left: '267.63px' }} />
        <div className="w-24 h-14 absolute rounded-full blur-[2px]" style={{ top: '237.75px', left: '298.49px' }} />
        <div className="w-12 h-7 absolute rounded-full blur-[2px]" style={{ top: '274.12px', left: '333.57px' }} />
        <div className="w-12 h-7 absolute rounded-full blur-[2px]" style={{ top: '274.12px', left: '333.57px' }} />
        <div className="w-16 h-14 absolute rounded-full blur-[2px]" style={{ top: '252.57px', left: '235.36px' }} />
        <div className="w-16 h-14 absolute rounded-full blur-[2px]" style={{ top: '233.04px', left: '232.55px' }} />
        {/* 메시지 입력창 */}
        <div className="w-80 h-11 absolute bg-white rounded-[10px] border border-yellow-400" style={{ top: '700px', left: '10px' }}>
          <input type="text" className="w-full h-full px-4 py-2 text-neutral-600 text-base font-normal font-['Do_Hyeon']" placeholder="임신과 출산에 관한 질문을 입력하세요" />
        </div>
        
        <div className="w-11 h-11 absolute bg-yellow-400 rounded-full flex items-center justify-center" style={{ top: '700px', left: '337px' }}>
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.5 19.5l19-7-19-7v7l13 0-13 0v7z" />
          </svg>
        </div>
        {isSidebarOpen && (
          <div className="w-64 h-full bg-white shadow-lg fixed left-0 top-0 z-50 rounded-r-lg" onClick={(e) => e.stopPropagation()}>
            <div className="p-8 mt-8">
              <svg className="w-6 h-6 text-gray-500 inline-block mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.5 19.5l19-7-19-7v7l13 0-13 0v7z" />
              </svg>
              <p className="text-blue-500 mt-20 font-['Do_Hyeon']">250422 화</p>
            </div>
            <div className="absolute bottom-4 right-4" onClick={closeSidebar}>
              <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m-7-7l7 7-7 7" />
              </svg>
            </div>
          </div>
        )}
      </div>
      {/* 풋터 */}
      <div className="w-full h-28 fixed bottom-0 flex justify-around items-center bg-white shadow-md rounded-t-lg px-4" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {['chat', 'calendar', 'location', 'mypage'].map((tab, index) => (
          <div key={tab} className="flex flex-col items-center cursor-pointer" onClick={() => handleTabClick(tab)}>
            <div className={`w-10 h-10 flex items-center justify-center rounded-full ${activeTab === tab ? 'bg-[#FFD600]' : ''}`} style={{ marginBottom: '4px' }}>
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