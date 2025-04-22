"use client";

import { useState } from 'react';
import TabBar from '../components/TabBar';

export default function ChatPage() {
  const [activeTab, setActiveTab] = useState('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'chat') {
      window.location.href = '/chat';
    } else if (tab === 'calendar') {
      window.location.href = '/calendar';
    } else if (tab === 'location') {
      window.location.href = '/location';
    } else if (tab === 'mypage') {
      window.location.href = '/mypage';
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
      {/* TabBar Component */}
      <TabBar activeTab={activeTab} tabs={['chat', 'calendar', 'location', 'mypage']} onTabClick={handleTabClick} />
    </div>
  );
} 