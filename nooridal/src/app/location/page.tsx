// 위치 페이지
"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAddress } from "../context/AddressContext";
import TabBar from '../components/TabBar';

// 타입 정의 제거

export default function LocationPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('location');
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
          
          // 지번 주소가 없는 경우 도로명 주소를 사용합니다
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

  const handleCameraClick = () => {
    // Implementation of handleCameraClick function
  };

  return (
    <div className="min-h-screen w-full bg-[#FFF4BB] flex justify-center items-center">
      <div className="w-96 h-[900px] relative bg-[#FFF4BB] overflow-hidden">
        {/* 헤더 */}
        <div className="left-[175px] top-[65px] absolute text-center justify-start text-neutral-700 text-2xl font-normal font-['Do_Hyeon'] leading-[50px]">
          위치
        </div>
        

        {/* Current Location Section */}
        <div className="w-[360px] h-[100px] left-[12px] top-[130px] absolute bg-white rounded-3xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.30)] shadow-[0px_1px_3px_1px_rgba(0,0,0,0.15)]">
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
        <div className="grid grid-cols-2 gap-4 p-1 absolute left-[12px] top-[260px] w-[360px] ">
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