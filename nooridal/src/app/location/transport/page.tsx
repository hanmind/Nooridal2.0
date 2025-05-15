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

// OutingLocation 인터페이스는 유지 (나들이 기능에서 사용)
interface OutingLocation {
  id: string;
  name: string;
  category: string;
  mainCategory: string;
  province: string;
  district: string;
  dong: string;
  address: string;
  phone: string;
  website: string;
  latitude: number;
  longitude: number;
  additionalInfo: string;
  updatedAt: string;
  distance?: number; // 거리 정보 추가
}

// BarrierFreeLocation 인터페이스는 유지 (무장애 관광지 기능에서 사용)
interface BarrierFreeLocation {
  ESNTL_ID: string;
  LCLAS_NM: string;
  MLSFC_NM: string;
  FCLTY_NM: string;
  CTPRVN_NM: string;
  SIGNGU_NM: string;
  LNM_ADDR: string;
  FCLTY_ROAD_NM_ADDR: string;
  TEL_NO: string;
  FACILITIES: {
    장애인화장실?: boolean;
    엘리베이터?: boolean;
    장애인주차구역?: boolean;
    장애인주차장?: boolean;
    경사로?: boolean;
    휠체어대여?: boolean;
    수유실?: boolean;
  };
  ORIGIN_NM: string;
  ADIT_DC: string;
  distance?: number; // 거리 정보 추가
}

export default function TransportPage() {
  const router = useRouter();
  const { address: profileAddress, searchAddress, setSearchAddress, isLoaded } = useAddress();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [outingLocations, setOutingLocations] = useState<OutingLocation[]>([]);
  const [nearbyLocations, setNearbyLocations] = useState<OutingLocation[]>([]);
  const [mapVisible, setMapVisible] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [barrierFreeLocations, setBarrierFreeLocations] = useState<BarrierFreeLocation[]>([]);
  const [localCurrentAddress, setLocalCurrentAddress] = useState<string>("");

  // --- 무장애 관광지 지역 필터링 상태 ---
  const [provinces, setProvinces] = useState<string[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const [cities, setCities] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [filteredBarrierFreeLocations, setFilteredBarrierFreeLocations] = useState<BarrierFreeLocation[]>([]);
  // --- ---

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

  // 아웃팅 위치 로드 함수 추가
  const loadOutingLocations = async () => {
    try {
      const response = await fetch("/data/outing_locations.json");
      if (!response.ok) {
        throw new Error("나들이 데이터를 불러오는데 실패했습니다.");
      }
      const data: OutingLocation[] = await response.json();
      setOutingLocations(data);
      return data;
    } catch (err) {
      console.error("나들이 데이터 로드 오류:", err);
      return [];
    }
  };

  // 가까운 나들이 위치 찾기 함수
  const findNearbyOutingLocations = async (
    lat: number,
    lng: number,
    radius: number = 5
  ) => {
    if (outingLocations.length === 0) {
      const locations = await loadOutingLocations();
      if (locations.length === 0) return;
    }

    // 거리 계산 함수 (Haversine 공식)
    const calculateDistance = (
      lat1: number,
      lon1: number,
      lat2: number,
      lon2: number
    ) => {
      const R = 6371; // 지구 반경 (km)
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c; // 거리 (km)
    };

    // 주변 위치 찾기
    const nearby = outingLocations
      .map((location) => {
        const distance = calculateDistance(
          lat,
          lng,
          location.latitude,
          location.longitude
        );
        return { ...location, distance };
      })
      .filter((location) => location.distance <= radius)
      .sort((a, b) => (a.distance as number) - (b.distance as number))
      .slice(0, 10); // 가장 가까운 10개만 선택

    setNearbyLocations(nearby);
    return nearby;
  };

  // 무장애 관광지 로드 함수 추가
  const loadBarrierFreeLocations = async () => {
    try {
      const response = await fetch("/data/barrierfree_data.json");
      if (!response.ok) {
        throw new Error("무장애 관광지 데이터를 불러오는데 실패했습니다.");
      }
      const data: BarrierFreeLocation[] = await response.json();
      setBarrierFreeLocations(data);

      // 시/도 목록 추출
      const uniqueProvinces = Array.from(new Set(data.map(loc => loc.CTPRVN_NM).filter(Boolean))).sort();
      setProvinces(uniqueProvinces);
      
      setFilteredBarrierFreeLocations(data.slice(0,10)); // 초기에는 전체 중 일부만 보여주거나, 선택을 유도
      return data;
    } catch (err) {
      console.error("무장애 관광지 데이터 로드 오류:", err);
      return [];
    }
  };

  // 컴포넌트 마운트 시 나들이 및 무장애 데이터 로드
  useEffect(() => {
    loadOutingLocations();
    loadBarrierFreeLocations();
  }, []);

  // 카카오맵 스크립트 로드
  useEffect(() => {
    const script = document.createElement("script");
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
    if (
      mapLoaded &&
      window.kakao &&
      window.kakao.maps &&
      (showMap || (mapVisible && selectedType !== "support")) && // "support" 유형일 때는 지도 초기화 안 함
      searchAddress
    ) {
      const container = document.getElementById("map");
      if (!container) return;

      // 지도 컨테이너 크기 설정
      container.style.width = "100%";
      container.style.height = showMap ? "400px" : "240px";

      const options = {
        center: new window.kakao.maps.LatLng(37.566826, 126.9786567),
        level: 3,
      };
      const map = new window.kakao.maps.Map(container, options);

      // 줌 컨트롤 추가
      const zoomControl = new window.kakao.maps.ZoomControl();
      map.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT);

      // 지도 타입 컨트롤 추가
      const mapTypeControl = new window.kakao.maps.MapTypeControl();
      map.addControl(
        mapTypeControl,
        window.kakao.maps.ControlPosition.TOPRIGHT
      );

      // 마커 클러스터러 생성
      let clusterer: KakaoMarkerClusterer | undefined;
      if (window.kakao.maps.MarkerClusterer) {
        clusterer = new window.kakao.maps.MarkerClusterer({
          map: map,
          averageCenter: true,
          minLevel: 10,
          gridSize: 60,
        });
      }

      // 주소로 좌표 검색
      const geocoder = new window.kakao.maps.services.Geocoder();
      geocoder.addressSearch(searchAddress, async (result: any, status: any) => {
        if (status === window.kakao.maps.services.Status.OK) {
          const lat = parseFloat(result[0].y);
          const lng = parseFloat(result[0].x);
          const coords = new window.kakao.maps.LatLng(lat, lng);
          setUserCoords({ lat, lng }); // Store geocoded coordinates

          // 현재 위치 마커 생성
          const currentMarker = new window.kakao.maps.Marker({
            map: map,
            position: coords,
            image: new window.kakao.maps.MarkerImage(
              "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png",
              new window.kakao.maps.Size(24, 35)
            ),
          });

          // 나들이 선택된 경우 근처 아웃팅 위치 검색
          if (selectedType === "outing") {
            const nearby = await findNearbyOutingLocations(lat, lng, 5);

            if (nearby && nearby.length > 0) {
              const markers = nearby.map((location) => {
                const markerPosition = new window.kakao.maps.LatLng(
                  location.latitude,
                  location.longitude
                );
                const marker = new window.kakao.maps.Marker({
                  position: markerPosition,
                  map: map,
                });

                // 마커 클릭 시 정보창 표시
                window.kakao.maps.event.addListener(marker, "click", () => {
                  const distanceKm = (location.distance as number).toFixed(2);
                  const content = `<div style="padding:10px;width:200px;">
                    <div style="font-weight:bold;font-size:14px;margin-bottom:5px;">${
                      location.name
                    }</div>
                    <div style="font-size:12px;margin-bottom:5px;">거리: ${distanceKm}km</div>
                    <div style="font-size:12px;margin-bottom:5px;">${
                      location.address
                    }</div>
                    ${
                      location.phone
                        ? `<div style="font-size:12px;margin-bottom:5px;">연락처: ${location.phone}</div>`
                        : ""
                    }
                    ${
                      location.additionalInfo
                        ? `<div style="font-size:12px;margin-bottom:5px;">${location.additionalInfo}</div>`
                        : ""
                    }
                  </div>`;

                  const infowindow = new window.kakao.maps.InfoWindow({
                    content: content,
                    removable: true,
                  });
                  infowindow.open(map, marker);
                });

                return marker;
              });

              // 클러스터러에 마커 추가
              if (clusterer) {
                clusterer.addMarkers(markers);
              } else {
                // 클러스터러가 없는 경우 일반 마커로 추가
                markers.forEach((marker: KakaoMarker) => marker.setMap(map));
              }

              // 모든 마커를 포함하는 영역으로 지도 범위 설정
              if (markers.length > 0) {
                const bounds = new window.kakao.maps.LatLngBounds();
                bounds.extend(coords); // 현재 위치도 포함
                markers.forEach((marker: KakaoMarker) =>
                  bounds.extend(marker.getPosition())
                );
                map.setBounds(bounds);
              }
            } else {
              // 주변 위치 정보가 없는 경우 현재 위치만 표시
              map.setCenter(coords);
            }
          } else if (selectedType === "support") {
            // 무장애 관광지 정보 표시 - 이 부분은 지역 필터링 UI로 대체됨
            // 따라서, 지도에 마커를 표시하는 로직은 여기서는 필요 없음
            // 아래 nearbyBarrierFreeLocations 관련 코드는 제거하거나 주석처리
            // const nearby = nearbyBarrierFreeLocations; // filteredBarrierFreeLocations 사용
            
            // if (filteredBarrierFreeLocations && filteredBarrierFreeLocations.length > 0) {
            //   // ... 기존 마커 생성 로직 ... (좌표가 없으므로 실제로는 어려움)
            // } else {
            //   map.setCenter(coords); // 기본 위치로 설정
            // }
            map.setCenter(coords); // 사용자의 searchAddress 중심으로 지도를 보여줄 수는 있음 (선택 사항)
            
          } else {
            // 주변 이동 지원 시설 검색 로직 유지 (outing 등 다른 타입)
            const places = new window.kakao.maps.services.Places();
            const searchOptions = {
              location: coords,
              radius: 1000, // 1km 반경
              sort: window.kakao.maps.services.SortBy.DISTANCE,
            };

            // 선택된 이동 지원 유형에 따라 검색 키워드 설정
            let keyword = "";
            if (selectedType === "support") {
              keyword = "무장애 관광지";
            } else if (selectedType === "outing") {
              keyword = "나들이 지원";
            }

            places.keywordSearch(
              keyword,
              (data: any, status: any) => {
                if (status === window.kakao.maps.services.Status.OK) {
                  const markers = data.map((place: any) => {
                    const marker = new window.kakao.maps.Marker({
                      position: new window.kakao.maps.LatLng(place.y, place.x),
                      map: map,
                    });

                    // 마커 클릭 시 정보창 표시
                    window.kakao.maps.event.addListener(marker, "click", () => {
                      const infowindow = new window.kakao.maps.InfoWindow({
                        content: `<div style="padding:5px;font-size:12px;">${place.place_name}<br>${place.road_address_name}</div>`,
                      });
                      infowindow.open(map, marker);
                    });

                    return marker;
                  });

                  // 클러스터러에 마커 추가
                  if (clusterer) {
                    clusterer.addMarkers(markers);
                  } else {
                    // 클러스터러가 없는 경우 일반 마커로 추가
                    markers.forEach((marker: KakaoMarker) =>
                      marker.setMap(map)
                    );
                  }
                }
              },
              searchOptions
            );

            // 지도 중심 이동
            map.setCenter(coords);
          }

          // 현재 위치 정보 표시
          const infoWindow = new window.kakao.maps.InfoWindow({
            content: `<div style="padding:5px;">현재 위치</div>`,
            position: coords,
          });
          infoWindow.open(map, currentMarker);
        } else {
          // Fallback for geocoding failure
          const options = { center: new window.kakao.maps.LatLng(37.566826, 126.9786567), level: 3 };
          new window.kakao.maps.Map(container, options);
          alert("선택된 주소의 좌표를 찾을 수 없어 기본 위치로 지도를 표시합니다.");
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
                "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png",
                new window.kakao.maps.Size(24, 35)
              ),
            });

            // 현재 위치 정보 표시
            const currentInfoWindow = new window.kakao.maps.InfoWindow({
              content: `<div style="padding:5px;">현재 위치</div>`,
              position: locPosition,
            });
            currentInfoWindow.open(map, currentLocationMarker);
          },
          (error) => {
            console.error("현재 위치를 가져올 수 없습니다:", error);
          }
        );
      }
    }
  }, [
    mapLoaded,
    searchAddress,
    showMap,
    mapVisible,
    selectedType,
    outingLocations,
    filteredBarrierFreeLocations,
  ]);

  // selectedType이 변경될 때 지도와 주변 위치 정보 처리
  useEffect(() => {
    if (!isLoaded || !mapLoaded) return; // Exit if context or map not loaded

    if (selectedType === "outing") {
      setIsLoading(true);
      setMapVisible(true); // Show map section immediately
      if (searchAddress) {
        const geocoder = new window.kakao.maps.services.Geocoder();
        geocoder.addressSearch(searchAddress, async (result: any, status: any) => {
          if (status === window.kakao.maps.services.Status.OK) {
            const lat = parseFloat(result[0].y);
            const lng = parseFloat(result[0].x);
            setUserCoords({ lat, lng }); // Set userCoords for map useEffect
            await findNearbyOutingLocations(lat, lng, 5); // Search with geocoded address
          } else {
            console.error("나들이: 주소 지오코딩 실패", searchAddress);
            alert("선택된 주소의 좌표를 찾을 수 없어 나들이 정보를 가져올 수 없습니다.");
            setNearbyLocations([]); // Clear locations if geocoding fails
          }
          setIsLoading(false);
        });
      } else {
        // searchAddress가 없는 경우 (예: 초기 로드)
        alert("나들이 정보를 보려면 먼저 기준 주소를 설정해주세요.");
        setNearbyLocations([]);
        setIsLoading(false);
        // setMapVisible(false); // Optionally hide map if no address
      }
    } else if (selectedType === "support") {
      // 무장애 관광지 정보 로드 및 필터링 UI 준비
      setIsLoading(true);
      setMapVisible(false); // "support" 유형에서는 지도를 직접 표시하지 않음
      if (barrierFreeLocations.length === 0) {
        loadBarrierFreeLocations().then(locations => {
          // 초기 필터링 (예: 첫 번째 시/도 또는 전체)
          if (locations && locations.length > 0) {
             const uniqueProvincesList = Array.from(new Set(locations.map(loc => loc.CTPRVN_NM).filter(Boolean))).sort();
             setProvinces(uniqueProvincesList);
             if (uniqueProvincesList.length > 0) {
                // setSelectedProvince(uniqueProvincesList[0]); // Optionally select the first province
             }
             setFilteredBarrierFreeLocations(locations.slice(0, 10)); // Initially show some or all
          }
          setIsLoading(false);
        });
      } else {
         // 이미 데이터가 로드된 경우, 초기 필터링 상태를 유지하거나 업데이트
         const uniqueProvincesList = Array.from(new Set(barrierFreeLocations.map(loc => loc.CTPRVN_NM).filter(Boolean))).sort();
         setProvinces(uniqueProvincesList);
         // Filter based on current selectedProvince and selectedCity if they exist
         let filtered = barrierFreeLocations;
         if (selectedProvince) {
            filtered = filtered.filter(loc => loc.CTPRVN_NM === selectedProvince);
            if (selectedCity && selectedCity !== "전체") {
                 filtered = filtered.filter(loc => loc.SIGNGU_NM === selectedCity);
            }
         }
         setFilteredBarrierFreeLocations(filtered.slice(0,20)); // Show a limited number initially or based on selection
         setIsLoading(false);
      }
    } else {
      setMapVisible(false);
      // 다른 타입 선택 시 필터 상태 초기화
      setSelectedProvince("");
      setSelectedCity("");
      setCities([]);
      // setFilteredBarrierFreeLocations([]); // 필요에 따라 주석 해제
    }
  }, [selectedType, searchAddress, isLoaded, mapLoaded, barrierFreeLocations]); // searchAddress, barrierFreeLocations 추가

  // --- 지역 필터링 로직 ---
  useEffect(() => {
    if (selectedProvince && barrierFreeLocations.length > 0) {
      const uniqueCities = Array.from(
        new Set(
          barrierFreeLocations
            .filter(loc => loc.CTPRVN_NM === selectedProvince && loc.SIGNGU_NM)
            .map(loc => loc.SIGNGU_NM!)
        )
      ).sort();
      setCities(uniqueCities);
      setSelectedCity(""); // 시/도 변경 시 시/군/구 선택 초기화

      // 시/도만 선택된 경우 해당 시/도의 모든 관광지 필터링
      const filtered = barrierFreeLocations.filter(loc => loc.CTPRVN_NM === selectedProvince);
      setFilteredBarrierFreeLocations(filtered.slice(0,20)); // 최대 20개
    } else if (!selectedProvince) {
      setCities([]);
      setSelectedCity("");
      // 시/도 선택이 해제되면 전체 목록 (또는 초기 상태)
      setFilteredBarrierFreeLocations(barrierFreeLocations.slice(0,10));
    }
  }, [selectedProvince, barrierFreeLocations]);

  useEffect(() => {
    if (barrierFreeLocations.length === 0) return;

    let filtered = barrierFreeLocations;
    if (selectedProvince) {
      filtered = filtered.filter(loc => loc.CTPRVN_NM === selectedProvince);
      if (selectedCity && selectedCity !== "전체") { // "전체" 시/군/구 선택 처리
        filtered = filtered.filter(loc => loc.SIGNGU_NM === selectedCity);
      }
    }
    // 검색어나 다른 필터가 있다면 여기에 추가
    setFilteredBarrierFreeLocations(filtered.slice(0,20)); // 결과 개수 제한
  }, [selectedProvince, selectedCity, barrierFreeLocations]);
  // --- ---

  const transportTypes = [
    {
      id: "support",
      title: "무장애 관광지",
      icon: "♿",
      description: "장애인, 노약자, 임산부도 편하게 즐길 수 있는 무장애 관광지",
    },
    {
      id: "outing",
      title: "나들이",
      icon: "🌳",
      description: "산책, 휴식, 여가 활동 지원",
    },
  ];

  // 나들이 상세 정보 컴포넌트
  const OutingLocationInfo = () => {
    if (nearbyLocations.length === 0) {
      return (
        <div className="p-4 bg-yellow-50 rounded-xl mb-4">
          <div className="font-['Do_Hyeon'] text-center">
            근처에 나들이 위치 정보가 없습니다.
          </div>
          <div className="text-sm text-gray-500 mt-1 font-['Do_Hyeon'] text-center">
            다른 위치를 선택해 보세요
          </div>
        </div>
      );
    }

    return (
      <div className="max-h-60 overflow-y-auto pr-2">
        {nearbyLocations.map((location) => (
          <div key={location.id} className="p-4 bg-yellow-50 rounded-xl mb-4">
            <div className="font-['Do_Hyeon'] font-bold text-lg">
              {location.name}
            </div>
            <div className="text-sm text-gray-700 mt-1 font-['Do_Hyeon']">
              거리: {(location.distance as number).toFixed(2)}km
            </div>
            <div className="text-sm text-gray-700 mt-1 font-['Do_Hyeon']">
              {location.address}
            </div>

            <div className="flex flex-wrap mt-2 gap-2">
              {location.phone && (
                <a
                  href={`tel:${location.phone}`}
                  className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-['Do_Hyeon']"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  전화하기
                </a>
              )}
              {location.website && (
                <a
                  href={location.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-['Do_Hyeon']"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                    />
                  </svg>
                  웹사이트
                </a>
              )}
              <a
                href={`https://map.kakao.com/link/to/${location.name},${location.latitude},${location.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-['Do_Hyeon']"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  />
                </svg>
                길찾기
              </a>
            </div>

            {location.additionalInfo && (
              <div className="text-sm text-gray-700 mt-2 font-['Do_Hyeon']">
                {location.additionalInfo}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // 무장애 관광지 상세 정보 컴포넌트
  const BarrierFreeLocationInfo = () => {
    if (isLoading) {
       return (
        <div className="flex justify-center items-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
        </div>
       );
    }

    if (filteredBarrierFreeLocations.length === 0 && (selectedProvince || selectedCity)) {
      return (
        <div className="p-4 bg-yellow-50 rounded-xl mb-4">
          <div className="font-['Do_Hyeon'] text-center">
            선택하신 지역에 무장애 관광지 정보가 없습니다.
          </div>
          <div className="text-sm text-gray-500 mt-1 font-['Do_Hyeon'] text-center">
            다른 지역을 선택해 보세요.
          </div>
        </div>
      );
    }
     if (filteredBarrierFreeLocations.length === 0 && !selectedProvince && !selectedCity) {
      return (
        <div className="p-4 bg-yellow-50 rounded-xl mb-4">
          <div className="font-['Do_Hyeon'] text-center">
            지역을 선택하여 무장애 관광지를 검색해보세요.
          </div>
        </div>
      );
    }


    return (
      <div className="max-h-60 overflow-y-auto pr-2">
        {filteredBarrierFreeLocations.map((location) => (
          <div
            key={location.ESNTL_ID}
            className="p-4 bg-blue-50 rounded-xl mb-4"
          >
            <div className="font-['Do_Hyeon'] font-bold text-lg">
              {location.FCLTY_NM}
            </div>
            <div className="text-sm text-gray-700 mt-1 font-['Do_Hyeon']">
              {location.CTPRVN_NM} {location.SIGNGU_NM}
            </div>
            <div className="text-sm text-gray-700 mt-1 font-['Do_Hyeon']">
              {location.FCLTY_ROAD_NM_ADDR ||
                location.LNM_ADDR ||
                "주소 정보 없음"}
            </div>

            <div className="flex flex-wrap mt-2 gap-2">
              {location.TEL_NO && (
                <a
                  href={`tel:${location.TEL_NO}`}
                  className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-['Do_Hyeon']"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  전화하기
                </a>
              )}
              <a
                href={`https://map.kakao.com/link/search/${location.FCLTY_NM}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-['Do_Hyeon']"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  />
                </svg>
                길찾기
              </a>
            </div>

            <div className="mt-3 flex flex-wrap gap-1">
              {location.FACILITIES.장애인화장실 && (
                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-md">
                  ♿ 장애인화장실
                </span>
              )}
              {(location.FACILITIES.장애인주차구역 ||
                location.FACILITIES.장애인주차장) && (
                <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-md">
                  🅿️ 장애인주차
                </span>
              )}
              {location.FACILITIES.엘리베이터 && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-md">
                  🔼 엘리베이터
                </span>
              )}
              {location.FACILITIES.경사로 && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-md">
                  📐 경사로
                </span>
              )}
              {location.FACILITIES.휠체어대여 && (
                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-md">
                  🦽 휠체어대여
                </span>
              )}
              {location.FACILITIES.수유실 && (
                <span className="text-xs bg-pink-100 text-pink-800 px-2 py-1 rounded-md">
                  👶 수유실
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full bg-[#FFF4BB] pt-20">
      <div className="w-full h-[900px] relative bg-[#FFF4BB] overflow-hidden">
        {/* 헤더 */}
        <HeaderBar title="이동 지원" backUrl="/location" />

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

        {/* 이동 지원 유형 선택 */}
        <div className="mx-auto mt-2 w-[360px] space-y-4">
          {transportTypes.map((type) => (
            <div key={type.id}>
              {type.id === "support" && (
                <div className="border-t border-dashed border-gray-300 my-6" />
              )}
              <div
                className={`p-6 rounded-3xl shadow-sm cursor-pointer transition-all duration-300 ${
                  selectedType === type.id
                    ? "bg-blue-100 border-2 border-blue-200"
                    : "bg-white hover:bg-blue-50"
                }`}
                onClick={() => setSelectedType(type.id)}
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

        {/* 선택된 이동 지원 유형에 따른 추가 정보 표시 */}
        {selectedType && !showMap && (
          <>
            {/* 반투명 배경 */}
            <div
              className="fixed inset-0 bg-black/50 z-10"
              onClick={() => setSelectedType(null)}
            />

            {/* 정보 상자 */}
            <div className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[360px] p-5 bg-white rounded-3xl shadow-sm z-20">
              <div className="text-center font-['Do_Hyeon'] text-2xl mb-4">
                {transportTypes.find((t) => t.id === selectedType)?.title} 정보
              </div>

              {/* 로딩 표시 */}
              {isLoading && (
                <div className="flex justify-center items-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                </div>
              )}

              {/* 선택된 타입에 따라 지도 표시 */}
              {(selectedType === "outing" /*|| selectedType === "support"*/) && // support 타입에서 지도 제거
                mapVisible && (
                  <div className="mb-4">
                    <div
                      className="w-full h-[240px] rounded-xl overflow-hidden"
                      id="map"
                    >
                      {!mapLoaded && (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              {/* 선택된 타입에 따라 정보 표시 */}
              {selectedType === "outing" && !isLoading && (
                <div className="mb-4 mt-4">
                  <OutingLocationInfo />
                </div>
              )}

              {selectedType === "support" && !isLoading && (
                <div className="mb-4 mt-4">
                  {/* 지역 선택 UI */}
                  <div className="space-y-3 mb-4 p-3 bg-gray-50 rounded-lg">
                    <div>
                      <label htmlFor="province-select" className="block text-sm font-medium text-gray-700 font-['Do_Hyeon'] mb-1">시/도 선택:</label>
                      <select
                        id="province-select"
                        value={selectedProvince}
                        onChange={(e) => setSelectedProvince(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 font-['Do_Hyeon']"
                      >
                        <option value="">전체</option>
                        {provinces.map(province => (
                          <option key={province} value={province}>{province}</option>
                        ))}
                      </select>
                    </div>
                    {selectedProvince && cities.length > 0 && (
                      <div>
                        <label htmlFor="city-select" className="block text-sm font-medium text-gray-700 font-['Do_Hyeon'] mb-1">시/군/구 선택:</label>
                        <select
                          id="city-select"
                          value={selectedCity}
                          onChange={(e) => setSelectedCity(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 font-['Do_Hyeon']"
                        >
                          <option value="">전체</option>
                          {cities.map(city => (
                            <option key={city} value={city}>{city}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                  <BarrierFreeLocationInfo />
                </div>
              )}

              <div className="space-y-4">
                {/* 나들이나 무장애 관광지가 아닌 경우에만 주변 시설 찾기 버튼 표시 */}
                {selectedType !== "outing" && selectedType !== "support" && (
                  <div
                    className="p-4 bg-blue-50 rounded-xl cursor-pointer"
                    onClick={() => setShowMap(true)}
                  >
                    <div className="font-['Do_Hyeon']">📍 주변 시설 찾기</div>
                    <div className="text-sm text-gray-500 mt-1 font-['Do_Hyeon']">
                      가까운 시설을 찾아보세요
                    </div>
                  </div>
                )}

                {/* 나들이와 무장애 관광지가 아닌 경우에만 상담하기 버튼 표시 */}
                {selectedType !== "outing" && selectedType !== "support" && (
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <div className="font-['Do_Hyeon']">💬 상담하기</div>
                    <div className="text-sm text-gray-500 mt-1 font-['Do_Hyeon']">
                      전문 상담원과 상담하세요
                    </div>
                  </div>
                )}
              </div>

              {/* 닫기 버튼 */}
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => setSelectedType(null)}
                  className="px-6 py-2 bg-blue-200 text-gray-900 rounded-full font-['Do_Hyeon'] hover:bg-blue-300 transition-colors"
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
            <div className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[360px] h-[500px] bg-white rounded-3xl shadow-sm z-20 p-4">
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
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
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
