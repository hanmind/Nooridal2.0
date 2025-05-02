"use client";

import { useRouter } from "next/navigation";
import { useAddress } from "@/app/context/AddressContext";
import { useState } from "react";

// 카카오맵 타입 정의
declare global {
  interface Window {
    kakao: any;
  }
}

export default function WelfarePage() {
  const router = useRouter();
  const { address, setAddress } = useAddress();
  const [selectedType, setSelectedType] = useState<string | null>(null);

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

  const welfareTypes = [
    {
      id: 'career',
      title: '여성 경력 단절 사업',
      icon: '💼',
      description: '경력 단절 여성 재취업 지원'
    },
    {
      id: 'parental',
      title: '육아 휴직 정보',
      icon: '👶',
      description: '육아 휴직 제도 및 지원 정보'
    }
  ];

  return (
    <div className="min-h-screen w-full bg-[#FFF4BB] flex justify-center items-center">
      <div className="w-96 h-[900px] relative bg-[#FFF4BB] overflow-hidden">
        {/* 헤더 */}
        <div className="left-[175px] top-[65px] absolute text-center justify-start text-neutral-700 text-2xl font-normal font-['Do_Hyeon'] leading-[50px]">
          복지
        </div>
        <button 
          onClick={() => router.back()}
          className="left-[24px] top-[63px] absolute text-center justify-start text-neutral-700 text-2xl font-normal font-['Inter'] leading-[50px]"
        >
          &lt;
        </button>

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

        {/* 복지 유형 선택 */}
        <div className="absolute left-[12px] top-[230px] w-[360px] space-y-4">
          {welfareTypes.map((type) => (
            <div key={type.id}>
              {type.id === 'career' && (
                <div className="border-t border-dashed border-gray-300 my-6" />
              )}
              <div
                className={`p-6 rounded-3xl shadow-sm cursor-pointer transition-all duration-300 ${
                  selectedType === type.id
                    ? 'bg-purple-100 border-2 border-purple-200'
                    : 'bg-white hover:bg-purple-50'
                }`}
                onClick={() => setSelectedType(type.id)}
              >
                <div className="flex items-center">
                  <div className="text-4xl mr-4">{type.icon}</div>
                  <div>
                    <div className="text-xl font-['Do_Hyeon']">{type.title}</div>
                    <div className="text-sm text-gray-500 mt-1 font-['Do_Hyeon']">{type.description}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 선택된 복지 유형에 따른 추가 정보 표시 */}
        {selectedType && (
          <>
            {/* 반투명 배경 */}
            <div 
              className="fixed inset-0 bg-black/50 z-10"
              onClick={() => setSelectedType(null)}
            />
            
            {/* 정보 상자 */}
            <div className="absolute left-[12px] top-[200px] w-[360px] p-8 bg-white rounded-3xl shadow-sm z-20">
              <div className="text-center font-['Do_Hyeon'] text-2xl mb-8">
                {welfareTypes.find(t => t.id === selectedType)?.title}
              </div>
              <div className="space-y-4">
                
                <div className="p-4 bg-purple-50 rounded-xl">
                  <div className="font-['Do_Hyeon']">🕹️ 정보 찾기</div>
                  <div className="text-sm text-gray-500 mt-1 font-['Do_Hyeon']">관련 정보를 찾아드려요</div>
                </div>
                <div className="p-4 bg-purple-50 rounded-xl">
                  <div className="font-['Do_Hyeon']">📱 신청하기</div>
                  <div className="text-sm text-gray-500 mt-1 font-['Do_Hyeon']">온라인으로 신청하세요</div>
                </div>
                <div className="p-4 bg-purple-50 rounded-xl">
                  <div className="font-['Do_Hyeon']">💬 상담하기</div>
                  <div className="text-sm text-gray-500 mt-1 font-['Do_Hyeon']">전문 상담원과 상담하세요</div>
                </div>
              </div>
              
              {/* 닫기 버튼 */}
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => setSelectedType(null)}
                  className="px-6 py-2 bg-purple-200 text-gray-900 rounded-full font-['Do_Hyeon'] hover:bg-purple-300 transition-colors"
                >
                  닫기
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 