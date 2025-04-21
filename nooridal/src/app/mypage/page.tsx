"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useProfile } from "@/app/context/ProfileContext";
import { useState, useEffect } from "react";

export default function MyPage() {
  const router = useRouter();
  const { profileImage } = useProfile();
  const [showImageModal, setShowImageModal] = useState(false);
  const [hasPregnancyInfo, setHasPregnancyInfo] = useState(false);
  const [activeTab, setActiveTab] = useState('mypage');

  useEffect(() => {
    setActiveTab('mypage');
  }, []);

  const handleLogout = () => {
    // 로그아웃 처리 로직
    console.log("로그아웃 처리");
    router.push('/login');
  };

  const handleProfileManagement = () => {
    router.push('/mypage/profile');
  };

  const handlePregnancyInfoManagement = () => {
    router.push('/mypage/pregnancy-info');
  };

  const handleRegisterPregnancyInfo = () => {
    router.push('/register/pregnant/pregnancy-info');
  };

  const handleFAQ = () => {
    router.push('/mypage/faq');
  };

  const handleAppInfo = () => {
    router.push('/mypage/app-info');
  };

  const handleProfileImageClick = () => {
    if (profileImage) {
      setShowImageModal(true);
    }
  };

  const closeImageModal = () => {
    setShowImageModal(false);
  };

  const handleTabClick = (tabName: string) => {
    setActiveTab(tabName);
    if (tabName === 'chat') {
      router.push('/chat');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#FFF4BB] flex justify-center items-center">
      <div className="w-96 h-[900px] relative bg-[#FFF4BB] overflow-hidden">
        {/* 헤더 */}
        <div className="left-[155px] top-[65px] absolute text-center justify-start text-neutral-700 text-2xl font-normal font-['Do_Hyeon'] leading-[50px]">
          마이페이지
        </div>
        <button 
          onClick={() => router.back()}
          className="left-[24px] top-[63px] absolute text-center justify-start text-neutral-700 text-2xl font-normal font-['Inter'] leading-[50px]"
        >
          &lt;
        </button>

        {/* 프로필 카드 */}
        <div className="w-[360px] h-[280px] left-[10px] top-[130px] absolute bg-white rounded-3xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.30)] shadow-[0px_1px_3px_1px_rgba(0,0,0,0.15)]">
          {/* 프로필 이미지 */}
          <div 
            className={`w-14 h-14 left-[20px] top-[20px] absolute rounded-full overflow-hidden ${profileImage ? 'cursor-pointer' : ''}`}
            onClick={handleProfileImageClick}
          >
            {profileImage ? (
              <img 
                src={profileImage} 
                alt="프로필 이미지" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="#9CA3AF"/>
                </svg>
              </div>
            )}
          </div>
          
          {/* 사용자 이름 */}
          <div className="left-[100px] top-[20px] absolute text-neutral-700 text-lg font-normal font-['Do_Hyeon']">
            홍길동
          </div>
          
          {/* 사용자 ID */}
          <div className="left-[100px] top-[45px] absolute text-stone-500 text-sm font-normal font-['Do_Hyeon']">
            nooridal
          </div>
          
          {/* 고위험 임신 표시 */}
          <div className="flex items-center left-[100px] top-[70px] absolute">
            <svg className="w-3 h-3 text-red-600 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-red-600 text-[11px] font-normal font-['Do_Hyeon']">고위험 임신</span>
          </div>
          
          {/* 임신 정보 등록 버튼 */}
          <div className="w-[260px] h-[36px] left-[20px] top-[100px] absolute">
            <div className="w-full h-full bg-yellow-200 rounded-2xl flex items-center justify-center">
              <span className="text-black text-sm font-normal font-['Do_Hyeon']">
                ❤️ 사랑스러운 아기와 만나기까지 ❤️
              </span>
            </div>
          </div>
          
          {/* 임신 정보 */}
          {hasPregnancyInfo ? (
            <div className="w-full px-6 top-[160px] absolute">
              <div className="flex justify-between items-center mb-4">
                <span className="text-black text-base font-normal font-['Do_Hyeon']">출산 예정일</span>
                <span className="text-black text-base font-normal font-['Do_Hyeon']">202*-**-**</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-black text-base font-normal font-['Do_Hyeon']">현재 임신 주차</span>
                <span className="text-black text-base font-normal font-['Do_Hyeon']">**주차</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-black text-base font-normal font-['Do_Hyeon']">출산까지 남은 일수</span>
                <span className="text-black text-base font-normal font-['Do_Hyeon']">***일</span>
              </div>
            </div>
          ) : (
            <div className="w-full px-6 top-[160px] absolute flex flex-col items-center">
              <div className="text-gray-500 text-base font-normal font-['Do_Hyeon'] mb-4">
                임신 정보 등록 후 서비스를 이용해 주세요.
              </div>
              <button 
                onClick={handleRegisterPregnancyInfo}
                className="bg-[#FFD600] text-white py-2 px-6 rounded-full text-base font-normal font-['Do_Hyeon'] shadow-md hover:bg-[#E6C200] transition-colors"
              >
                임신 정보 등록하기
              </button>
            </div>
          )}
        </div>

        {/* 메뉴 카드 */}
        <div className="w-[360px] h-62 left-[10px] top-[430px] absolute bg-white rounded-3xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.30)] shadow-[0px_1px_3px_1px_rgba(0,0,0,0.15)]">
          {/* 내 정보 관리 */}
          <div 
            onClick={handleProfileManagement}
            className="w-full flex items-center justify-between px-4 py-3 border-b border-stone-300 cursor-pointer hover:bg-stone-50 transition-colors"
          >
            <div className="flex items-center">
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <div className="text-black text-base font-['Do_Hyeon'] leading-[35px]">
                내 정보 관리
              </div>
            </div>
            <div className="text-stone-300 text-xl font-['Inter'] leading-[35px]">
              &gt;
            </div>
          </div>
          
          {/* 임신 정보 관리 */}
          <div 
            onClick={handlePregnancyInfoManagement}
            className="w-full flex items-center justify-between px-4 py-3 border-b border-stone-300 cursor-pointer hover:bg-stone-50 transition-colors"
          >
            <div className="flex items-center">
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <div className="text-black text-base font-['Do_Hyeon'] leading-[35px]">
                임신 정보 관리
              </div>
            </div>
            <div className="text-stone-300 text-xl font-['Inter'] leading-[35px]">
              &gt;
            </div>
          </div>
          
          {/* 자주 찾는 질문 */}
          <div 
            onClick={handleFAQ}
            className="w-full flex items-center justify-between px-4 py-3 border-b border-stone-300 cursor-pointer hover:bg-stone-50 transition-colors"
          >
            <div className="flex items-center">
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-black text-base font-['Do_Hyeon'] leading-[35px]">
                자주 찾는 질문
              </div>
            </div>
            <div className="text-stone-300 text-xl font-['Inter'] leading-[35px]">
              &gt;
            </div>
          </div>
          
          {/* 앱 정보 */}
          <div 
            onClick={handleAppInfo}
            className="w-full flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-stone-50 transition-colors"
          >
            <div className="flex items-center">
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-black text-base font-['Do_Hyeon'] leading-[35px]">
                앱 정보
              </div>
            </div>
            <div className="text-stone-300 text-xl font-['Inter'] leading-[35px]">
              &gt;
            </div>
          </div>
        </div>

        {/* 로그아웃 버튼 */}
        <button 
          onClick={handleLogout}
          className="absolute left-1/2 transform -translate-x-1/2 top-[690px] text-center text-gray-500 text-base font-normal font-['Do_Hyeon'] leading-[50px]"
        >
          로그아웃
        </button>

        {/* Proportionally Fitting Footer for MyPage */}
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

        {/* 이미지 모달 */}
        {showImageModal && profileImage && (
          <div 
            className="fixed z-50"
            style={{ 
              top: '50%', 
              left: '50%', 
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div 
              className="relative bg-white rounded-lg p-4 shadow-xl max-w-[300px] max-h-[300px]"
            >
              <img 
                src={profileImage} 
                alt="프로필 이미지 전체보기" 
                className="w-full h-full object-contain rounded-lg"
              />
              <button 
                className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md"
                onClick={closeImageModal}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* 채팅 창 */}
        {activeTab === 'chat' && (
          <div className="w-96 h-[874px] relative bg-yellow-100 overflow-hidden">
            <div className="w-32 h-20 left-[-63px] top-[1px] absolute bg-white rounded-full blur-[2px]" />
            <div className="w-32 h-20 left-[-52px] top-[-10px] absolute bg-white rounded-full blur-[2px]" />
            <div className="w-28 h-16 left-[-120px] top-[24.58px] absolute bg-white rounded-full blur-[2px]" />
            <div className="w-28 h-14 left-[-96px] top-[54.05px] absolute bg-white rounded-full blur-[2px]" />
            <div className="w-24 h-14 left-[-10px] top-[46px] absolute bg-white rounded-full blur-[2px]" />
            <div className="w-28 h-16 left-0 top-[21px] absolute bg-white rounded-full blur-[2px]" />
            <div className="w-9 h-12 left-[183px] top-[63px] absolute text-center justify-start text-neutral-700 text-2xl font-normal font-['Do_Hyeon'] leading-[50px]">채팅</div>
            <div className="w-24 h-14 left-[260.61px] top-[229px] absolute rounded-full blur-[2px]" />
            <div className="w-24 h-14 left-[208px] top-[241.80px] absolute rounded-full blur-[2px]" />
            <div className="w-24 h-14 left-[267.63px] top-[255.94px] absolute rounded-full blur-[2px]" />
            <div className="w-24 h-14 left-[298.49px] top-[237.75px] absolute rounded-full blur-[2px]" />
            <div className="w-12 h-7 left-[333.57px] top-[274.12px] absolute rounded-full blur-[2px]" />
            <div className="w-12 h-7 left-[333.57px] top-[274.12px] absolute rounded-full blur-[2px]" />
            <div className="w-16 h-14 left-[235.36px] top-[252.57px] absolute rounded-full blur-[2px]" />
            <div className="w-16 h-14 left-[232.55px] top-[233.04px] absolute rounded-full blur-[2px]" />
            <div className="w-80 h-11 left-[17px] bottom-[20px] absolute bg-white rounded-[10px] border border-zinc-300" />
            <div className="w-64 h-6 left-[29px] bottom-[34px] absolute justify-start text-neutral-400 text-base font-normal font-['Do_Hyeon']">임신과 출산에 관한 질문을 입력하세요</div>
            <div className="w-11 h-11 left-[344px] bottom-[3px] absolute bg-yellow-400 rounded-full" />
            <div className="w-9 h-9 left-[352px] bottom-[1.5px] absolute justify-start text-white text-3xl font-medium font-['Inter']">➤</div>
            <div className="w-72 h-40 left-[30px] top-[161px] absolute bg-blue-100 rounded-3xl shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]" />
            <div className="w-64 h-14 left-[126px] top-[364px] absolute bg-white rounded-[20px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]" />
            <div className="w-64 h-7 left-[47px] top-[177px] absolute justify-start text-sky-950 text-base font-normal font-['Do_Hyeon'] leading-snug">안녕하세요. AI에이전트 플로렌스 입니다.   나이팅게일의 풀네임은 플로렌스 나이팅게일이라고 하네요. 그분의 정신을 닮아 성심성의껏 도움을 드리겠습니다.   아기는 현재 *주차이시군요 !   임신과 출산에 관한 궁금한 점을 물어보세요!</div>
            <div className="w-20 h-6 left-[306px] top-[283px] absolute text-center justify-start text-neutral-400 text-xs font-normal font-['Do_Hyeon'] leading-[50px]">10:00</div>
            <div className="w-20 h-6 left-[64px] top-[391px] absolute text-center justify-start text-neutral-400 text-xs font-normal font-['Do_Hyeon'] leading-[50px]">10:01</div>
            <div className="w-8 h-7 left-[33.56px] top-[44px] absolute bg-white rounded-full border-2 border-zinc-500" />
            <div className="w-2.5 h-1.5 left-[40.24px] top-[74.33px] absolute origin-top-left rotate-[-141.02deg] bg-white rounded-[0.50px] border-2 border-zinc-500" />
            <div className="w-1.5 h-1.5 left-[41.30px] top-[70.90px] absolute origin-top-left rotate-[-141.02deg] bg-white rounded-[0.50px]" />
            <div className="w-3 h-0.5 left-[43px] top-[53px] absolute bg-zinc-500" />
            <div className="w-3 h-0.5 left-[43px] top-[56px] absolute bg-zinc-500" />
            <div className="w-3 h-0.5 left-[43px] top-[59px] absolute bg-zinc-500" />
            <div className="left-[148px] top-[369px] absolute text-center justify-start text-black text-base font-normal font-['Do_Hyeon'] leading-[50px]">현재 우리 아기 크기가 얼마나 될까?</div>
          </div>
        )}
      </div>
    </div>
  );
} 