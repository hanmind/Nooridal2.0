// 위치 페이지
"use client";

import { useRouter } from "next/navigation";
import { useAddress } from "@/app/context/AddressContext";
import { useState, useEffect } from "react";
import TabBar from '../components/TabBar';

// Define the Tab type
export type Tab = 'chat' | 'calendar' | 'location' | 'mypage';

// 카카오맵 타입 정의
declare global {
  interface Window {
    kakao: any;
  }
}

export default function LocationPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('location');
  const [showBackground, setShowBackground] = useState(false);
  const { address, setAddress, isLoaded } = useAddress();
  const [mapLoaded, setMapLoaded] = useState(false);

  // 주소를 동까지만 표시하는 함수
  const getShortAddress = (fullAddress: string) => {
    if (!fullAddress) return '';
    
    const match = fullAddress.match(/([가-힣]+(동|읍|면|리))/);
    if (match) {
      const index = fullAddress.indexOf(match[0]) + match[0].length;
      return fullAddress.substring(0, index);
    }
    
    return fullAddress;
  };

  // 주소 수정 함수
  const handleAddressEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.daum) {
      new window.daum.Postcode({
        oncomplete: function(data: any) {
          let fullAddress = data.jibunAddress;
          if (!fullAddress) {
            fullAddress = data.address;
          }
          
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

  // 카카오맵 스크립트 로드
  useEffect(() => {
    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&libraries=services,clusterer&autoload=false&appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_REST_API_KEY}`;
    script.async = true;
    script.onload = () => {
      window.kakao.maps.load(() => {
        setMapLoaded(true);
      });
    };
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

  const handleCameraClick = () => {
    // Implementation of handleCameraClick function
  };

  return (
    <div className="min-h-screen w-full bg-[#FFF4BB] flex justify-center items-center">
      <div className="w-full max-w-[400px] h-[900px] bg-[#FFF4BB]">
        {/* 헤더 */}
        <div className="w-full h-[140px] flex items-center justify-center bg-white shadow-md rounded-b-3xl mt-[-10px]">
          <div className="flex items-center justify-center px-4 w-full">
            <div className="text-2xl text-neutral-700 font-['Do_Hyeon'] text-center w-full mt-15">
              위치
            </div>
          </div>
        </div>

        {/* 현재 위치 섹션 */}
        <div className="w-[360px] h-[100px] mx-auto mt-8 bg-white rounded-3xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.30)] shadow-[0px_1px_3px_1px_rgba(0,0,0,0.15)]">
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

        {/* 메뉴 그리드 */}
        <div className="grid grid-cols-2 gap-4 p-1 w-[360px] mx-auto mt-8">
          {[
            { icon: '🏥', title: '병원', link: '/location/hospital' },
            { icon: '🏪', title: '편의 시설', link: '/location/facilities' },
            { icon: '🚙', title: '이동 지원', link: '/location/transport' },
            { icon: '🎀', title: '복지', link: '/location/welfare' }
          ].map((item, index) => (
            <div 
              key={index} 
              className="bg-white p-6 rounded-[20px] shadow-sm flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors h-[140px]" 
              onClick={() => router.push(item.link)}
            >
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