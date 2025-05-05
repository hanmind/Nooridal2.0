// 위치 페이지
"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAddress } from "../context/AddressContext";
import TabBar from '../components/TabBar';

// Define the Tab type
export type Tab = 'chat' | 'calendar' | 'location' | 'mypage';

export default function LocationPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('location');
  const [showBackground, setShowBackground] = useState(false);
  const { address, setAddress, isLoaded } = useAddress();

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
    setActiveTab(tab as Tab);
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

  // 현재 위치를 주소로 변환하는 함수 (수정 버튼 클릭시 동작)
  const handleAddressEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          // 카카오맵 좌표 -> 주소 변환 API 호출
          if (window.kakao && window.kakao.maps) {
            const geocoder = new window.kakao.maps.services.Geocoder();
            geocoder.coord2Address(lng, lat, function(result: any, status: string) {
              if (status === window.kakao.maps.services.Status.OK) {
                const addr = result[0].address.address_name;
                setAddress(addr);
              } else {
                alert('주소 변환에 실패했습니다.');
              }
            });
          } else {
            alert('카카오맵이 준비되지 않았습니다.');
          }
        },
        (error) => {
          alert('위치 정보를 가져올 수 없습니다.');
        }
      );
    } else {
      alert('이 브라우저에서는 위치 정보가 지원되지 않습니다.');
    }
  };

  const handleCameraClick = () => {
    // Implementation of handleCameraClick function
  };

  return (
    <div className="min-h-screen w-full bg-[#FFF4BB] flex justify-center items-center">
      <div className="w-108 h-[900px] relative bg-[#FFF4BB] overflow-hidden">
        {/* 헤더 */}
        <div className="w-full h-[140px] flex items-center justify-center bg-white shadow-md rounded-b-3xl relative mt-[-10px]">
          <div className="absolute inset-x-0 top-[75px] flex items-center">
            {/* Content inside the rectangular box */}
          </div>
        </div>

        {/* Location Header */}
        <div className="left-[175px] top-[65px] absolute text-center justify-start text-neutral-700 text-2xl font-normal font-['Do_Hyeon'] leading-[50px]">
          위치
        </div>
        

        {/* Current Location Section */}
        <div className="w-[360px] h-[100px] left-[20px] top-[190px] absolute bg-white rounded-3xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.30)] shadow-[0px_1px_3px_1px_rgba(0,0,0,0.15)]">
          <div className="flex items-start p-6">
            <div className="mr-4">
              <svg className="w-14 h-14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zM12 11.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#000"/>
              </svg>
            </div>
            
            <div className="flex-1 flex flex-col items-center">
              <div className="text-center ml-[-60px] mb-2 -mt-2">
                <span className="text-sm font-['Do_Hyeon'] text-yellow-400">현재 설정 위치</span>
              </div>
              
              <div className="flex ml-[-30px] items-center justify-between w-full">
                <div className="text-xl font-['Do_Hyeon'] text-center flex-1">
                  {getShortAddress(address)}
                </div>
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
        <div className="grid grid-cols-2 gap-4 p-1 absolute left-[20px] top-[340px] w-[360px] ">
          {[
            { icon: '🏥', title: '병원', link: '/location/hospital' },
            { icon: '🏪', title: '편의 시설', link: '/location/facilities' },
            { icon: '🚙', title: '이동 지원', link: '/location/transport' },
            { icon: '🎀', title: '복지', link: '/location/welfare' }
          ].map((item, index) => (
            <div key={index} className="bg-white p-6 rounded-[20px] shadow-sm flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors h-[140px]" onClick={() => router.push(item.link)}>
              <div className="text-3xl mb-2">{item.icon}</div>
              <div className="text-center font-['Do_Hyeon'] whitespace-pre-line">{item.title}</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* TabBar Component */}
      <div className="fixed bottom-0 left-0 right-0 bg-white">
        <TabBar activeTab={activeTab} tabs={['chat', 'calendar', 'location', 'mypage']} onTabClick={handleTabClick} />
      </div>
    </div>
  );
} 