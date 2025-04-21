"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import Calendar from './Calendar';

export default function CalendarPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('calendar');

  useEffect(() => {
    setActiveTab('calendar');
  }, []);

  const handleTabClick = (tabName: string) => {
    setActiveTab(tabName);
    if (tabName === 'chat') {
      router.push('/chat');
    } else if (tabName === 'mypage') {
      router.push('/mypage');
    } else if (tabName === 'location') {
      router.push('/location');
    } else if (tabName === 'calendar') {
      router.push('/calendar');
    }
  };

  return (
    <main className="min-h-screen w-full bg-[#FFF4BB] flex justify-center items-center">
      <Calendar />
      
      {/* Footer */}
      <div className="w-full h-20 fixed bottom-0 left-0 flex justify-around items-center bg-white shadow-md rounded-t-lg px-4" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
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
    </main>
  );
} 