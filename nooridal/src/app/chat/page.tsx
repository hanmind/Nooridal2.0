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
        
      {/* 배경 장식 요소 */}
      <div className="w-32 h-20 left-[-63px] top-[1px] absolute bg-white rounded-full blur-[2px]" />
      <div className="w-32 h-20 left-[-52px] top-[-10px] absolute bg-white rounded-full blur-[2px]" />
      <div className="w-28 h-16 left-[-100px] top-[24.58px] absolute bg-white rounded-full blur-[2px]" />
      <div className="w-28 h-14 left-[-80px] top-[54.05px] absolute bg-white rounded-full blur-[2px]" />
      <div className="w-24 h-14 left-[-30px] top-[46px] absolute bg-white rounded-full blur-[2px]" />
      <div className="w-28 h-16 left-0 top-[21px] absolute bg-white rounded-full blur-[2px]" />

        <div>
          <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
          </svg>
        </div>
        <div className="w-full text-center text-neutral-700 text-2xl font-normal font-['Do_Hyeon'] leading-[50px] absolute" style={{ top: '65px' }}>
          채팅
        </div>
        <svg 
          className="w-10 h-10 text-gray-800 inline-block mr-1" 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          style={{ marginLeft: '-300px', position: 'absolute', top: '40px' }} 
          onClick={toggleSidebar}
        >
          <path 
            fill="#a6a6a6" 
            d="M8 9h6q.425 0 .713-.288T15 8t-.288-.712T14 7H8q-.425 0-.712.288T7 8t.288.713T8 9m0 4h3q.425 0 .713-.288T12 12t-.288-.712T11 11H8q-.425 0-.712.288T7 12t.288.713T8 13m9 4h-2q-.425 0-.712-.288T14 16t.288-.712T15 15h2v-2q0-.425.288-.712T18 12t.713.288T19 13v2h2q.425 0 .713.288T22 16t-.288.713T21 17h-2v2q0 .425-.288.713T18 20t-.712-.288T17 19zM6 17l-2.15 2.15q-.25.25-.55.125T3 18.8V5q0-.825.588-1.412T5 3h12q.825 0 1.413.588T19 5v4.35q0 .3-.213.488t-.512.162q-1.275-.05-2.437.388T13.75 11.75q-.9.925-1.35 2.088t-.4 2.437q.025.3-.175.513T11.35 17z"
          />
        </svg>
        
        {/* 메시지 입력창 */}
        <div className="w-80 h-11 absolute bg-white rounded-[20px] border border-yellow-400" style={{ top: '680px', left: '10px' }}>
          <input type="text" className="w-full h-full px-4 py-2 text-neutral-600 text-base font-normal font-['Do_Hyeon'] rounded-[20px]" placeholder="임신과 출산에 관한 질문을 입력하세요" />
        </div>
        
        <div className="w-11 h-11 absolute bg-yellow-400 rounded-full flex items-center justify-center" style={{ top: '680px', left: '337px' }}>
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.5 19.5l19-7-19-7v7l13 0-13 0v7z" />
          </svg>
        </div>
        {isSidebarOpen && (
          <>
            <div 
              className="fixed inset-0 bg-transparent z-40"
              onClick={closeSidebar}
            />
            <div className="w-64 h-full bg-white shadow-lg fixed left-[-10px] top-0 z-50 rounded-[20px]" onClick={(e) => e.stopPropagation()}>
              <div className="p-8 mt-8">
                <svg className="w-6 h-6 text-gray-500 inline-block mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.5 19.5l19-7-19-7v7l13 0-13 0v7z" />
                </svg>
                <p className="text-blue-500 mt-10 font-['Do_Hyeon']">250422 화</p>
              </div>
              <div className="absolute bottom-4 right-4" onClick={closeSidebar}>
                <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m-7-7l7 7-7 7" />
                </svg>
              </div>
            </div>
          </>
        )}
      </div>
      {/* TabBar Component */}
      <TabBar activeTab={activeTab} tabs={['chat', 'calendar', 'location', 'mypage']} onTabClick={handleTabClick} />
    </div>
  );
} 