// 위치 페이지
"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAddress } from "../context/AddressContext";

// 타입 정의 제거

export default function LocationPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('location');
  const [showBackground, setShowBackground] = useState(false);
  const { address, setAddress } = useAddress();

  // 주소를 동까지만 표시하는 함수 추가
  const getShortAddress = (fullAddress: string) => {
    if (!fullAddress) return '';
    
    // 주소에서 동/읍/면/리 부분을 찾습니다
    const match = fullAddress.match(/([가-힣]+(동|읍|면|리))/);
    if (match) {
      // 동/읍/면/리 부분을 포함한 주소를 반환합니다
      const index = fullAddress.indexOf(match[0]) + match[0].length;
      return fullAddress.substring(0, index);
    }
    
    // 매칭되는 부분이 없으면 원래 주소를 반환합니다
    return fullAddress;
  };

  useEffect(() => {
    setActiveTab('location');
    // Daum 우편번호 서비스 스크립트 로드
    const script = document.createElement("script");
    script.src = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
    script.async = true;
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'chat') {
      router.push('/chat');
    } else if (tab === 'calendar') {
      router.push('/calendar');
    } else if (tab === 'location') {
      router.push('/location');
    } else if (tab === 'mypage') {
      router.push('/mypage');
    }
  };

  const handleAddressEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.daum) {
      new window.daum.Postcode({
        oncomplete: function(data: any) {
          // 도로명 주소 대신 지번 주소를 사용합니다
          let fullAddress = data.jibunAddress;
          let extraAddress = '';

          if (data.addressType === 'R') {
            if (data.bname !== '' && /[동|로|가]$/g.test(data.bname)) {
              extraAddress += data.bname;
            }
            if (data.buildingName !== '') {
              extraAddress += (extraAddress !== '' ? ', ' + data.buildingName : data.buildingName);
            }
            if (extraAddress !== '') {
              fullAddress += ` (${extraAddress})`;
            }
          }

          setAddress(fullAddress);
        }
      }).open();
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#FFF4BB] flex justify-center items-center relative overflow-hidden">
      {showBackground && (
        <div className="absolute inset-0">
          <div className="absolute top-[5%] left-[10%] w-6 h-6 bg-white rounded-[5px] opacity-70"></div>
          <div className="absolute top-[15%] right-[15%] w-6 h-6 bg-white rounded-[5px] opacity-70"></div>
          <div className="absolute top-[25%] left-[20%] w-6 h-6 bg-white rounded-[5px] opacity-70"></div>
          <div className="absolute bottom-[35%] right-[25%] w-6 h-6 bg-white rounded-[5px] opacity-70"></div>
          <div className="absolute bottom-[25%] left-[15%] w-6 h-6 bg-white rounded-[5px] opacity-70"></div>
        </div>
      )}

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
        <div className="mx-6 mt-[130px] p-4 bg-white rounded-xl shadow-sm">
          {/* 위치 아이콘은 왼쪽에 유지하고 텍스트는 가운데 정렬 */}
          <div className="flex items-start">
            {/* 위치 아이콘 */}
            <div className="mr-4">
              <svg className="w-14 h-14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zM12 11.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#000"/>
              </svg>
            </div>
            
            {/* 텍스트 영역 - 가운데 정렬 */}
            <div className="flex-1 flex flex-col items-center">
              {/* 현재 설정 위치 텍스트를 가운데에 배치 */}
              <div className="text-center ml-[-60px] mb-2 -mt-2 ">
                <span className="text-sm font-['Do_Hyeon'] text-yellow-400">현재 설정 위치</span>
              </div>
              
              {/* 주소를 가운데 정렬하고 수정 버튼을 오른쪽 끝에 배치 */}
              <div className="flex ml-[-30px] items-center justify-between w-full">
                <div className="text-xl font-['Do_Hyeon'] text-center flex-1">{getShortAddress(address)}</div>
                <button 
                  onClick={handleAddressEdit}
                  className="text-sm font-['Do_Hyeon'] cursor-pointer hover:text-yellow-400 ml-2"
                >
                  수정
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-2 gap-4 mx-6 mt-6">
          {[
            { icon: '🏥', title: '산부인과', link: '/location/obstetrics' },
            { icon: '🏪', title: '편의시설', link: '/location/facilities' },
            { icon: '🚙', title: '교통약자\n이동 지원 센터', link: '/location/transport' },
            { icon: '📍', title: '지도', link: '/location/map' }
          ].map((item, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => router.push(item.link)}>
              <div className="text-3xl mb-2">{item.icon}</div>
              <div className="text-center font-['Do_Hyeon'] whitespace-pre-line">{item.title}</div>
            </div>
          ))}
        </div>

        {/* Footer Navigation */}
        <div className="fixed bottom-0 left-0 w-full bg-white shadow-lg rounded-t-xl">
          <div className="flex justify-around items-center h-20 max-w-lg mx-auto px-4">
            {[
              { id: 'chat', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z', label: '채팅' },
              { id: 'calendar', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', label: '캘린더' },
              { id: 'location', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z', label: '위치' },
              { id: 'mypage', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', label: '마이페이지' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className="flex flex-col items-center"
              >
                <div className={`p-2 rounded-full ${activeTab === item.id ? 'bg-yellow-400' : ''}`}>
                  <svg
                    className={`w-6 h-6 ${activeTab === item.id ? 'stroke-white' : 'stroke-gray-400'}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                </div>
                <span className={`text-xs mt-1 font-['Do_Hyeon'] ${activeTab === item.id ? 'text-yellow-400' : 'text-gray-400'}`}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 