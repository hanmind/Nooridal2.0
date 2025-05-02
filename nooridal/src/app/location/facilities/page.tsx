"use client";

import { useRouter } from "next/navigation";
import { useAddress } from "@/app/context/AddressContext";
import { useState, useEffect } from "react";

// 카카오맵 타입 정의
declare global {
  interface Window {
    kakao: any;
  }
}

export default function FacilitiesPage() {
  const router = useRouter();
  const { address, setAddress } = useAddress();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showMap, setShowMap] = useState(false);

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

  const facilityTypes = [
    {
      id: 'locker',
      title: '물품 보관함',
      icon: '📦',
      description: '일반, 냉장, 대형 보관함'
    },
    {
      id: 'discount',
      title: '할인업소',
      icon: '🏪',
      description: '임산부 할인 혜택 제공 업소'
    }
  ];

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

  // 카카오맵 초기화
  useEffect(() => {
    if (mapLoaded && window.kakao && window.kakao.maps && showMap) {
      const container = document.getElementById('map');
      if (!container) return;

      // 지도 컨테이너 크기 설정
      container.style.width = '100%';
      container.style.height = '400px';

      const options = {
        center: new window.kakao.maps.LatLng(37.566826, 126.9786567),
        level: 3
      };
      const map = new window.kakao.maps.Map(container, options);

      // 줌 컨트롤 추가
      const zoomControl = new window.kakao.maps.ZoomControl();
      map.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT);

      // 지도 타입 컨트롤 추가
      const mapTypeControl = new window.kakao.maps.MapTypeControl();
      map.addControl(mapTypeControl, window.kakao.maps.ControlPosition.TOPRIGHT);

      // 마커 클러스터러 생성
      const clusterer = new window.kakao.maps.MarkerClusterer({
        map: map,
        averageCenter: true,
        minLevel: 10,
        gridSize: 60
      });

      // 주소로 좌표 검색
      const geocoder = new window.kakao.maps.services.Geocoder();
      geocoder.addressSearch(address, (result: any, status: any) => {
        if (status === window.kakao.maps.services.Status.OK) {
          const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);
          
          // 현재 위치 마커 생성
          const currentMarker = new window.kakao.maps.Marker({
            map: map,
            position: coords,
            image: new window.kakao.maps.MarkerImage(
              'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png',
              new window.kakao.maps.Size(24, 35)
            )
          });

          // 주변 시설 검색
          const places = new window.kakao.maps.services.Places();
          const searchOptions = {
            location: coords,
            radius: 1000, // 1km 반경
            sort: window.kakao.maps.services.SortBy.DISTANCE
          };

          // 선택된 시설 유형에 따라 검색 키워드 설정
          let keyword = '';
          if (selectedType === 'locker') {
            keyword = '보관함';
          } else if (selectedType === 'discount') {
            keyword = '할인점';
          }

          places.keywordSearch(keyword, (data: any, status: any) => {
            if (status === window.kakao.maps.services.Status.OK) {
              const markers = data.map((place: any) => {
                const marker = new window.kakao.maps.Marker({
                  position: new window.kakao.maps.LatLng(place.y, place.x),
                  map: map
                });

                // 마커 클릭 시 정보창 표시
                window.kakao.maps.event.addListener(marker, 'click', () => {
                  const infowindow = new window.kakao.maps.InfoWindow({
                    content: `<div style="padding:5px;font-size:12px;">${place.place_name}<br>${place.road_address_name}</div>`
                  });
                  infowindow.open(map, marker);
                });

                return marker;
              });

              // 클러스터러에 마커 추가
              clusterer.addMarkers(markers);
            }
          }, searchOptions);

          // 지도 중심 이동
          map.setCenter(coords);

          // 현재 위치 정보 표시
          const infoWindow = new window.kakao.maps.InfoWindow({
            content: `<div style="padding:5px;">현재 위치</div>`,
            position: coords
          });
          infoWindow.open(map, currentMarker);
        }
      });

      // 현재 위치 표시 기능
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const locPosition = new window.kakao.maps.LatLng(lat, lng);
            
            // 현재 위치 마커 생성
            const currentLocationMarker = new window.kakao.maps.Marker({
              map: map,
              position: locPosition,
              image: new window.kakao.maps.MarkerImage(
                'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png',
                new window.kakao.maps.Size(24, 35)
              )
            });

            // 현재 위치 정보 표시
            const currentInfoWindow = new window.kakao.maps.InfoWindow({
              content: `<div style="padding:5px;">현재 위치</div>`,
              position: locPosition
            });
            currentInfoWindow.open(map, currentLocationMarker);
          },
          (error) => {
            console.error('현재 위치를 가져올 수 없습니다:', error);
          }
        );
      }
    }
  }, [mapLoaded, address, showMap, selectedType]);

  return (
    <div className="min-h-screen w-full bg-[#FFF4BB] flex justify-center items-center">
      <div className="w-96 h-[900px] relative bg-[#FFF4BB] overflow-hidden">
        {/* 헤더 */}
        <div className="left-[155px] top-[65px] absolute text-center justify-start text-neutral-700 text-2xl font-normal font-['Do_Hyeon'] leading-[50px]">
          편의 시설
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

        {/* 편의 시설 유형 선택 */}
        <div className="absolute left-[12px] top-[230px] w-[360px] space-y-4">
          {facilityTypes.map((type) => (
            <div key={type.id}>
              {type.id === 'locker' && (
                <div className="border-t border-dashed border-gray-300 my-6" />
              )}
              <div
                className={`p-6 rounded-3xl shadow-sm cursor-pointer transition-all duration-300 ${
                  selectedType === type.id
                    ? 'bg-yellow-100 border-2 border-yellow-200'
                    : 'bg-white hover:bg-yellow-50'
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

        {/* 선택된 편의 시설 유형에 따른 추가 정보 표시 */}
        {selectedType && !showMap && (
          <>
            {/* 반투명 배경 */}
            <div 
              className="fixed inset-0 bg-black/50 z-10"
              onClick={() => setSelectedType(null)}
            />
            
            {/* 정보 상자 */}
            <div className="absolute left-[12px] top-[200px] w-[360px] p-8 bg-white rounded-3xl shadow-sm z-20">
              <div className="text-center font-['Do_Hyeon'] text-2xl mb-8">
                {facilityTypes.find(t => t.id === selectedType)?.title} 정보
              </div>
              <div className="space-y-4">
                <div 
                  className="p-4 bg-yellow-100 rounded-xl cursor-pointer"
                  onClick={() => setShowMap(true)}
                >
                  <div className="font-['Do_Hyeon']">📍 주변 시설 찾기</div>
                  <div className="text-sm text-gray-500 mt-1 font-['Do_Hyeon']">가까운 시설을 찾아보세요</div>
                </div>
                <div className="p-4 bg-yellow-100 rounded-xl">
                  <div className="font-['Do_Hyeon']">📱 예약하기</div>
                  <div className="text-sm text-gray-500 mt-1 font-['Do_Hyeon']">온라인으로 예약하세요</div>
                </div>
                <div className="p-4 bg-yellow-100 rounded-xl">
                  <div className="font-['Do_Hyeon']">💬 상담하기</div>
                  <div className="text-sm text-gray-500 mt-1 font-['Do_Hyeon']">전문 상담원과 상담하세요</div>
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
                <div className="text-xl font-['Do_Hyeon']">
                  주변 시설 지도
                </div>
                <button
                  onClick={() => setShowMap(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div id="map" className="w-full h-[400px] rounded-xl overflow-hidden">
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