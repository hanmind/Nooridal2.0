"use client";

import { useRouter } from "next/navigation";
import { useAddress } from "@/app/context/AddressContext";
import { useEffect, useState } from "react";

// 카카오맵 타입 정의
declare global {
  interface Window {
    kakao: any;
  }
}

export default function MapPage() {
  const router = useRouter();
  const { address } = useAddress();
  const [mapLoaded, setMapLoaded] = useState(false);

  // 주소를 표시하는 함수
  const getShortAddress = (fullAddress: string) => {
    if (!fullAddress) return '위치를 설정해주세요';
    return fullAddress; // 전체 주소를 반환합니다
  };

  useEffect(() => {
    // 카카오맵 스크립트 로드
    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=YOUR_KAKAO_MAP_API_KEY&libraries=services`;
    script.async = true;
    script.onload = () => setMapLoaded(true);
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    if (mapLoaded && window.kakao && window.kakao.maps) {
      // 카카오맵 초기화
      const container = document.getElementById('map');
      const options = {
        center: new window.kakao.maps.LatLng(37.566826, 126.9786567), // 서울 시청 좌표
        level: 3
      };
      const map = new window.kakao.maps.Map(container, options);

      // 주소로 좌표 검색
      const geocoder = new window.kakao.maps.services.Geocoder();
      geocoder.addressSearch(address, (result: any, status: any) => {
        if (status === window.kakao.maps.services.Status.OK) {
          const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);
          
          // 마커 생성
          const marker = new window.kakao.maps.Marker({
            map: map,
            position: coords
          });

          // 지도 중심 이동
          map.setCenter(coords);
        }
      });
    }
  }, [mapLoaded, address]);

  return (
    <div className="min-h-screen w-full bg-[#FFF4BB] flex justify-center">
      <div className="w-96 relative">
        {/* Header */}
        <div className="absolute left-1/2 top-[65px] -translate-x-1/2 text-center text-neutral-700 text-2xl font-normal font-['Do_Hyeon'] leading-[50px]">
          지도
        </div>
        <button 
          onClick={() => router.back()}
          className="absolute left-[24px] top-[63px] text-center text-neutral-700 text-2xl font-normal font-['Inter'] leading-[50px]"
        >
          &lt;
        </button>

        <div className="mt-[130px]">
          {/* Current Location */}
          <div className="mx-6 mb-4 p-4 bg-white rounded-xl shadow-sm">
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
                  <div className="text-base font-['Do_Hyeon'] text-center flex-1">{getShortAddress(address)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* 귀여운 지도 컨테이너 */}
          <div className="mx-6 p-4 bg-white rounded-xl shadow-sm">
            <div className="flex items-center justify-center mb-2">
              <span className="text-lg">🗺️</span>
              <span className="text-sm font-['Do_Hyeon'] text-yellow-400 ml-2">주변 지도</span>
            </div>
            
            {/* 지도 컨테이너 */}
            <div id="map" className="w-full h-[400px] rounded-lg overflow-hidden border-2 border-yellow-200 shadow-inner">
              {/* 지도 로딩 중 표시 */}
              {!mapLoaded && (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
                </div>
              )}
            </div>
            
            {/* 지도 하단 정보 */}
            <div className="mt-3 flex justify-between items-center">
              <div className="text-xs font-['Do_Hyeon'] text-gray-500">
                현재 위치 기준으로 표시됩니다
              </div>
              <button 
                className="px-3 py-1 bg-yellow-400 text-white rounded-full text-xs font-['Do_Hyeon']"
                onClick={() => {
                  if (window.kakao && window.kakao.maps) {
                    const container = document.getElementById('map');
                    const options = {
                      center: new window.kakao.maps.LatLng(37.566826, 126.9786567),
                      level: 3
                    };
                    const map = new window.kakao.maps.Map(container, options);
                  }
                }}
              >
                새로고침
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 