"use client";

import { useRouter } from "next/navigation";
import { useAddress } from "@/app/context/AddressContext";
import { useState, useEffect } from "react";
import HeaderBar from "@/app/components/HeaderBar";

// 카카오맵 타입 정의 (geocoding을 위해 유지)
declare global {
  interface Window {
    kakao: any;
  }
}

export default function HospitalPage() {
  const router = useRouter();
  const { address: profileAddress, searchAddress, setSearchAddress, isLoaded } = useAddress();
  const [selectedType, setSelectedType] = useState<string | null>(null); // 유지 (UI 분기용)
  const [mapLoaded, setMapLoaded] = useState(false); // 유지 (GPS 좌표 변환용)
  const [localCurrentAddress, setLocalCurrentAddress] = useState<string>(""); // 유지

  // 주소를 동까지만 표시하는 함수 (유지)
  const getShortAddress = (fullAddress: string) => {
    if (!fullAddress) return "";
    const match = fullAddress.match(/([가-힣]+(동|읍|면|리))/);
    if (match) {
      const index = fullAddress.indexOf(match[0]) + match[0].length;
      return fullAddress.substring(0, index);
    }
    return fullAddress;
  };

  // GPS 기반 현재 위치 설정 함수 (유지)
  const handleSetCurrentLocationByGPS = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
            const geocoder = new window.kakao.maps.services.Geocoder();
            const coord = new window.kakao.maps.LatLng(latitude, longitude);
            geocoder.coord2Address(
              coord.getLng(),
              coord.getLat(),
              (result: any, status: any) => {
                if (status === window.kakao.maps.services.Status.OK) {
                  const newAddress = result[0].address.address_name;
                  setLocalCurrentAddress(newAddress);
                  setSearchAddress(newAddress);
                } else {
                  alert("주소를 가져올 수 없습니다.");
                }
              }
            );
          } else {
            alert("카카오맵 API 서비스가 준비되지 않았습니다.");
          }
        },
        (error) => {
          alert("현재 위치를 가져올 수 없습니다.");
        }
      );
    } else {
      alert("이 브라우저에서는 위치 정보가 지원되지 않습니다.");
    }
  };

  // 프로필 주소 사용 함수 (유지)
  const handleSetCurrentLocationByProfile = () => {
    setLocalCurrentAddress(profileAddress);
    setSearchAddress(profileAddress);
  };

  // 카카오맵 스크립트 로드 (유지 - GPS 좌표 변환용)
  useEffect(() => {
    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&libraries=services&autoload=false`; // services 라이브러리만 필요
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

  if (!isLoaded) {
    return (
      <div className="min-h-screen w-full bg-[#FFF4BB] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-700"></div>
      </div>
    );
  }

  const hospitalTypes = [
    {
      id: "obstetrics",
      title: "산부인과",
      icon: "🤰",
      description: "산전검사, 초음파, 분만 등",
    },
    {
      id: "postpartum",
      title: "산후조리원",
      icon: "🍼",
      description: "산모와 신생아 케어",
    },
  ];

  return (
    <div className="min-h-screen w-full bg-[#FFF4BB] pt-20">
      {/* HeaderBar */}
      <HeaderBar title="병원" backUrl="/location" />

      {/* Current Location Section */}
      <div className="w-[360px] mx-auto mt-8 bg-white rounded-3xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.30)] shadow-[0px_1px_3px_1px_rgba(0,0,0,0.15)]">
        <div className="flex items-start p-4 sm:p-6">
          <div className="mr-4">
            <svg
              className="w-14 h-14"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zM12 11.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                fill="#000"
              />
            </svg>
          </div>

          <div className="flex-1 flex flex-col items-center">
            <div className="text-center ml-[-60px] mb-2 -mt-2">
              <span className="text-sm font-['Do_Hyeon'] text-yellow-400">
                현재 설정 위치
              </span>
            </div>

            <div className="flex ml-[-30px] items-center justify-between w-full">
              <div className="text-xl font-['Do_Hyeon'] text-center flex-1">
                {getShortAddress(searchAddress)} 
              </div>
              <div className="flex flex-col space-y-1 sm:space-y-0 sm:flex-row sm:space-x-1 ml-2">
                <button
                  onClick={handleSetCurrentLocationByProfile}
                  className="text-xs font-['Do_Hyeon'] cursor-pointer hover:text-yellow-500 text-gray-700 px-2 py-1 border border-gray-300 rounded whitespace-nowrap bg-gray-50 hover:bg-gray-100 flex items-center space-x-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span>내 주소</span>
                </button>
                <button
                  onClick={handleSetCurrentLocationByGPS}
                  className="text-xs font-['Do_Hyeon'] cursor-pointer hover:text-yellow-500 text-gray-700 px-2 py-1 border border-gray-300 rounded whitespace-nowrap bg-gray-50 hover:bg-gray-100 flex items-center space-x-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12a3 3 0 116 0 3 3 0 01-6 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m0 14v1m-7-8h1m14 0h1" />
                  </svg>
                  <span>현재 위치</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 병원 유형 선택 */}
      <div className="mx-auto mt-2 w-[360px] space-y-4">
        {hospitalTypes.map((type) => (
          <div key={type.id}>
            {type.id === "obstetrics" && (
              <div className="border-t border-dashed border-gray-300 my-6" />
            )}
            <div
              className={`p-6 rounded-3xl shadow-sm cursor-pointer transition-all duration-300 ${
                selectedType === type.id
                  ? "bg-red-100 border-2 border-red-200"
                  : "bg-white hover:bg-red-50"
              }`}
              onClick={() => {
                if (type.id === "postpartum") {
                  router.push("/location/hospital/postpartum"); // Navigate to postpartum page
                } else {
                  setSelectedType(type.id);
                }
              }}
            >
              <div className="flex items-center">
                <div className="text-4xl mr-4">{type.icon}</div>
                <div>
                  <div className="text-xl font-['Do_Hyeon']">{type.title}</div>
                  <div className="text-sm text-gray-500 mt-1 font-['Do_Hyeon']">
                    {type.description}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 선택된 병원 유형에 따른 추가 정보 표시 */}
      {selectedType && /* !showMap && */ ( // showMap 조건 제거
        <>
          {/* 반투명 배경 */}
          <div
            className="fixed inset-0 bg-black/50 z-10"
            onClick={() => setSelectedType(null)}
          />

          {/* 정보 상자 */}
          <div className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[360px] p-8 bg-white rounded-3xl shadow-sm z-20">
            <div className="text-center font-['Do_Hyeon'] text-2xl mb-8">
              {hospitalTypes.find((t) => t.id === selectedType)?.title} 정보
            </div>
            <div className="space-y-4">
              {selectedType === "obstetrics" && (
                <>
                  <div
                    className="p-4 bg-blue-50 rounded-xl cursor-pointer hover:bg-blue-100"
                    onClick={() =>
                      router.push("/location/hospital/infertility")
                    }
                  >
                    <div className="font-['Do_Hyeon']">
                      난임시술 정보 알아보기
                    </div>
                    <div className="text-sm text-gray-500 mt-1 font-['Do_Hyeon']">
                      관련 정보를 확인하세요
                    </div>
                  </div>
                  <div
                    className="p-4 bg-green-50 rounded-xl cursor-pointer hover:bg-green-100"
                    onClick={() => router.push("/location/hospital/incubator")}
                  >
                    <div className="font-['Do_Hyeon']">
                      인큐베이터 현황 알아보기
                    </div>
                    <div className="text-sm text-gray-500 mt-1 font-['Do_Hyeon']">
                      실시간 현황을 확인하세요
                    </div>
                  </div>
                  <div
                    className="p-4 bg-yellow-50 rounded-xl cursor-pointer hover:bg-yellow-100"
                    onClick={() => router.push("/location/hospital/bed-count")}
                  >
                    <div className="font-['Do_Hyeon']">
                      병상수 정보 알아보기
                    </div>
                    <div className="text-sm text-gray-500 mt-1 font-['Do_Hyeon']">
                      입원 가능 병상 정보를 확인하세요
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* 닫기 버튼 */}
            <div className="flex justify-center mt-6">
              <button
                onClick={() => setSelectedType(null)}
                className="px-6 py-2 bg-red-200 text-gray-900 rounded-full font-['Do_Hyeon'] hover:bg-red-300 transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
