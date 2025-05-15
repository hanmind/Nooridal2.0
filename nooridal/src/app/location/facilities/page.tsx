"use client";

import { useRouter } from "next/navigation";
import { useAddress } from "@/app/context/AddressContext";
import { useState, useEffect } from "react";
import HeaderBar from "@/app/components/HeaderBar";

// 카카오맵 타입 정의
declare global {
  interface Window {
    kakao: any;
  }
}

// Kakao maps type for MarkerClusterer
type KakaoMarker = any;
type KakaoMarkerClusterer = any;

export default function FacilitiesPage() {
  const router = useRouter();
  const { address: profileAddress, searchAddress, setSearchAddress, isLoaded } = useAddress();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [localCurrentAddress, setLocalCurrentAddress] = useState<string>("");

  // 주소를 동까지만 표시하는 함수
  const getShortAddress = (fullAddress: string) => {
    if (!fullAddress) return "";
    const match = fullAddress.match(/([가-힣]+(동|읍|면|리))/);
    if (match) {
      const index = fullAddress.indexOf(match[0]) + match[0].length;
      return fullAddress.substring(0, index);
    }
    return fullAddress;
  };

  // GPS 기반 현재 위치 설정 함수
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

  // 프로필 주소 사용 함수
  const handleSetCurrentLocationByProfile = () => {
    setLocalCurrentAddress(profileAddress);
    setSearchAddress(profileAddress);
  };

  const facilityTypes = [
    {
      id: "locker",
      title: "물품 보관함",
      icon: "📦",
      description: "일반, 냉장, 대형 보관함",
    },
    {
      id: "discount",
      title: "할인업소",
      icon: "🏪",
      description: "임산부 할인 혜택 제공 업소",
    },
  ];

  // 카카오맵 스크립트 로드
  useEffect(() => {
    const script = document.createElement("script");
    // Ensure correct API key environment variable is used if it differs from NEXT_PUBLIC_KAKAO_MAP_API_KEY
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&libraries=services,clusterer&autoload=false`;
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

  // 카카오맵 초기화
  useEffect(() => {
    if (mapLoaded && window.kakao && window.kakao.maps && showMap) {
      const container = document.getElementById("map");
      if (!container) return;
      container.style.width = "100%";
      container.style.height = "400px";
      const geocoder = new window.kakao.maps.services.Geocoder();
      geocoder.addressSearch(searchAddress, (result: any, status: any) => { // Use searchAddress
        if (status === window.kakao.maps.services.Status.OK) {
          const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);
          const options = {
            center: coords,
            level: 3,
          };
          const map = new window.kakao.maps.Map(container, options);
          // ... (Map controls, clusterer, current location marker as in hospital/page.tsx)
           // 줌 컨트롤 추가
          const zoomControl = new window.kakao.maps.ZoomControl();
          map.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT);

          // 지도 타입 컨트롤 추가
          const mapTypeControl = new window.kakao.maps.MapTypeControl();
          map.addControl(mapTypeControl, window.kakao.maps.ControlPosition.TOPRIGHT);

          let clusterer: KakaoMarkerClusterer | undefined;
          if (window.kakao.maps.MarkerClusterer) {
            clusterer = new window.kakao.maps.MarkerClusterer({ map: map, averageCenter: true, minLevel: 10, gridSize: 60 });
          }

          const currentMarker = new window.kakao.maps.Marker({ map: map, position: coords, image: new window.kakao.maps.MarkerImage("https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png", new window.kakao.maps.Size(24, 35)) });
          const infoWindow = new window.kakao.maps.InfoWindow({ content: `<div style="padding:5px;">현재 위치</div>`, position: coords });
          infoWindow.open(map, currentMarker);

          // 주변 시설 검색 (Places API)
          const places = new window.kakao.maps.services.Places();
          // ... (rest of keyword search logic using selectedType and coords from searchAddress)
          let keyword = "";
          if (selectedType === "locker") keyword = "보관함";
          else if (selectedType === "discount") keyword = "할인점";

          if (keyword) {
            places.keywordSearch(keyword, (data: any, keywordSearchStatus: any) => {
              if (keywordSearchStatus === window.kakao.maps.services.Status.OK) {
                const markers = data.map((place: any) => {
                  const marker = new window.kakao.maps.Marker({ position: new window.kakao.maps.LatLng(place.y, place.x), map: map });
                  window.kakao.maps.event.addListener(marker, "click", () => {
                    const placeInfoWindow = new window.kakao.maps.InfoWindow({ content: `<div style="padding:5px;font-size:12px;">${place.place_name}<br>${place.road_address_name}</div>` });
                    placeInfoWindow.open(map, marker);
                  });
                  return marker;
                });
                if (clusterer) clusterer.addMarkers(markers);
              }
            }, { location: coords, radius: 1000, sort: window.kakao.maps.services.SortBy.DISTANCE });
          }
        } else {
          // Fallback for geocoding failure
          const options = { center: new window.kakao.maps.LatLng(37.566826, 126.9786567), level: 3 };
          new window.kakao.maps.Map(container, options);
          alert("선택된 주소의 좌표를 찾을 수 없어 기본 위치로 지도를 표시합니다.");
        }
      });
    }
  }, [mapLoaded, searchAddress, showMap, selectedType]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen w-full bg-[#FFF4BB] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-700"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#FFF4BB] pt-20">
      <div className="w-full h-[900px] relative bg-[#FFF4BB] overflow-hidden">
        {/* 헤더 */}
        <HeaderBar title="편의 시설" backUrl="/location" />

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

        {/* 편의 시설 유형 선택 */}
        <div className="mx-auto mt-2 w-[360px] space-y-4">
          {facilityTypes.map((type) => (
            <div key={type.id}>
              {type.id === "locker" && (
                <div className="border-t border-dashed border-gray-300 my-6" />
              )}
              <div
                className={`p-6 rounded-3xl shadow-sm cursor-pointer transition-all duration-300 ${
                  selectedType === type.id
                    ? "bg-yellow-100 border-2 border-yellow-200"
                    : "bg-white hover:bg-yellow-50"
                }`}
                onClick={() => {
                  if (type.id === "discount") {
                    router.push("/location/facilities/discount-shops");
                  } else {
                    setSelectedType(type.id);
                  }
                }}
              >
                <div className="flex items-center">
                  <div className="text-4xl mr-4">{type.icon}</div>
                  <div>
                    <div className="text-xl font-['Do_Hyeon']">
                      {type.title}
                    </div>
                    <div className="text-sm text-gray-500 mt-1 font-['Do_Hyeon']">
                      {type.description}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 선택된 편의 시설 유형에 따른 추가 정보 표시 */}
        {selectedType && !showMap && (
          <>
            {/* 반투명 배경 */}
            <div
              className="fixed inset-0 bg-black/50 z-10"
              onClick={() => setSelectedType(null)}
            />

            {/* 정보 상자 */}
            <div className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[360px] p-8 bg-white rounded-3xl shadow-sm z-20">
              <div className="text-center font-['Do_Hyeon'] text-2xl mb-8">
                {facilityTypes.find((t) => t.id === selectedType)?.title} 정보
              </div>
              <div className="space-y-4">
                <div
                  className="p-4 bg-yellow-100 rounded-xl cursor-pointer"
                  onClick={() => setShowMap(true)}
                >
                  <div className="font-['Do_Hyeon']">📍 주변 시설 찾기</div>
                  <div className="text-sm text-gray-500 mt-1 font-['Do_Hyeon']">
                    가까운 시설을 찾아보세요
                  </div>
                </div>
                <div className="p-4 bg-yellow-100 rounded-xl">
                  <div className="font-['Do_Hyeon']">💬 상담하기</div>
                  <div className="text-sm text-gray-500 mt-1 font-['Do_Hyeon']">
                    전문 상담원과 상담하세요
                  </div>
                </div>
              </div>

              {/* 닫기 버튼 */}
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => setSelectedType(null)}
                  className="px-6 py-2 bg-yellow-200 text-gray-900 rounded-full font-['Do_Hyeon'] hover:bg-lime-300 transition-colors"
                >
                  닫기
                </button>
              </div>
            </div>
          </>
        )}

        {/* 카카오맵 표시 */}
        {showMap && (
          <>
            {/* 반투명 배경 */}
            <div
              className="fixed inset-0 bg-black/50 z-10"
              onClick={() => setShowMap(false)}
            />

            {/* 지도 컨테이너 */}
            <div className="absolute left-[12px] top-[200px] w-[360px] h-[500px] bg-white rounded-3xl shadow-sm z-20 p-4">
              <div className="flex justify-between items-center mb-4">
                <div className="text-xl font-['Do_Hyeon']">주변 시설 지도</div>
                <button
                  onClick={() => setShowMap(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div
                id="map"
                className="w-full h-[400px] rounded-xl overflow-hidden"
              >
                {!mapLoaded && (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
