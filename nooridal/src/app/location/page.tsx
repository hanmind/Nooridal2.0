"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function LocationPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('location');

  useEffect(() => {
    setActiveTab('location');
  }, []);

  const handleTabClick = (tabName: string) => {
    setActiveTab(tabName);
    if (tabName === 'chat') {
      router.push('/chat');
    } else if (tabName === 'calendar') {
      router.push('/calendar');
    } else if (tabName === 'location') {
      router.push('/location');
    } else if (tabName === 'mypage') {
      router.push('/mypage');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#FFF4BB] flex justify-center items-center relative overflow-hidden">
      {/* Background Stars */}
      <div className="absolute inset-0">
        <div className="absolute top-[5%] left-[10%] w-6 h-6 bg-white rounded-[5px] opacity-70"></div>
        <div className="absolute top-[15%] right-[15%] w-6 h-6 bg-white rounded-[5px] opacity-70"></div>
        <div className="absolute top-[25%] left-[20%] w-6 h-6 bg-white rounded-[5px] opacity-70"></div>
        <div className="absolute bottom-[35%] right-[25%] w-6 h-6 bg-white rounded-[5px] opacity-70"></div>
        <div className="absolute bottom-[25%] left-[15%] w-6 h-6 bg-white rounded-[5px] opacity-70"></div>
      </div>

      <div className="w-96 h-[900px] relative">
        {/* Header */}
        <div className="absolute left-1/2 top-[65px] -translate-x-1/2 text-center text-neutral-700 text-2xl font-normal font-['Do_Hyeon'] leading-[50px]">
          위치
        </div>
        <button 
          onClick={() => router.back()}
          className="absolute left-[24px] top-[63px] text-center text-neutral-700 text-2xl font-normal font-['Inter'] leading-[50px]"
        >
          &lt;
        </button>

        {/* Current Location Section */}
        <div className="w-[360px] mx-auto mt-[130px] p-4 bg-white rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zM12 11.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#000"/>
              </svg>
              <span className="text-sm font-['Do_Hyeon'] text-yellow-400">현재 설정 위치</span>
            </div>
            <span className="text-sm font-['Do_Hyeon']">수정</span>
          </div>
          <div className="mt-2 text-base font-['Do_Hyeon']">경기도 땡땡시 땡땡동</div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-2 gap-4 w-[360px] mx-auto mt-6">
          {[
            { icon: '🏥', title: '산부인과' },
            { icon: '🏪', title: '편의시설' },
            { icon: '🚎', title: '교통약자\n이동 지원 센터' },
            { icon: '📍', title: '지도' }
          ].map((item, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="text-3xl mb-2">{item.icon}</div>
              <div className="text-center font-['Do_Hyeon'] whitespace-pre-line">{item.title}</div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="w-full h-20 fixed bottom-0 left-0 flex justify-around items-center bg-white shadow-md rounded-t-lg px-4" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
          {['chat', 'calendar', 'location', 'mypage'].map((tab) => (
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
    </div>
  );
} 