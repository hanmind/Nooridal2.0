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

// Kakao maps type for MarkerClusterer
type KakaoMarker = any;
type KakaoMarkerClusterer = any;

interface TransportCenter {
  id: string;
  name: string;
  distance: string;
  address: string;
  phone: string;
  operatingHours: string;
  services: string[];
}

// 아웃팅 위치 인터페이스 추가
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

// 무장애 관광지 인터페이스 추가
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

// 더미 데이터
const DUMMY_CENTERS: TransportCenter[] = [
  {
    id: '1',
    name: '행복한 이동센터',
    distance: '0.5km',
    address: '서울시 강남구 역삼동 123-45',
    phone: '02-123-4567',
    operatingHours: '평일 09:00-18:00',
    services: ['휠체어 탑승', '산모 이동', '장애인 이동']
  },
  {
    id: '2',
    name: '맘스터치 이동센터',
    distance: '1.2km',
    address: '서울시 강남구 역삼동 234-56',
    phone: '02-234-5678',
    operatingHours: '평일 08:00-20:00, 주말 09:00-17:00',
    services: ['휠체어 탑승', '산모 이동', '장애인 이동', '노인 이동']
  },
  {
    id: '3',
    name: '24시 이동센터',
    distance: '2.0km',
    address: '서울시 강남구 역삼동 345-67',
    phone: '02-345-6789',
    operatingHours: '24시간',
    services: ['휠체어 탑승', '산모 이동', '장애인 이동', '응급 이동']
  }
];

export default function TransportPage() {
  const router = useRouter();
  const { address, setAddress } = useAddress();
  const [centers, setCenters] = useState<TransportCenter[]>([]);
  const [selectedService, setSelectedService] = useState<string>('전체');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showMap, setShowMap] = useState(false);
  // 아웃팅 위치 상태 추가
  const [outingLocations, setOutingLocations] = useState<OutingLocation[]>([]);
  const [nearbyLocations, setNearbyLocations] = useState<OutingLocation[]>([]);
  // 나들이 선택 시 지도 자동 표시
  const [mapVisible, setMapVisible] = useState(false);
  // 무장애 관광지 상태 추가
  const [barrierFreeLocations, setBarrierFreeLocations] = useState<BarrierFreeLocation[]>([]);
  const [nearbyBarrierFreeLocations, setNearbyBarrierFreeLocations] = useState<BarrierFreeLocation[]>([]);

  // 더미 데이터를 사용하는 함수
  const fetchTransportCenters = async () => {
    if (!address) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // API 호출 대신 더미 데이터 사용
      // 실제 API 연동 시 아래 주석을 해제하고 사용
      /*
      const apiKey = '3RMiKFjgxis3f86Xb5o3Ah30iv/dXmAni0V7kQUTbIke9XiTZXgyNGjcySlNyuMIRKtMSSgCH7IgbFWdqGEpQQ==';
      const response = await fetch(`https://apis.data.go.kr/B551982/tsdo?serviceKey=${encodeURIComponent(apiKey)}&address=${encodeURIComponent(address)}&type=json`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('데이터를 불러오는데 실패했습니다.');
      }
      
      const data = await response.json();
      
      // API 응답 데이터를 우리 인터페이스에 맞게 변환
      const formattedCenters: TransportCenter[] = data.response.body.items.item.map((item: any) => ({
        id: item.id || String(Math.random()),
        name: item.name || '이름 없음',
        distance: item.distance ? `${item.distance}m` : '거리 정보 없음',
        address: item.address || '주소 정보 없음',
        phone: item.phone || '전화번호 정보 없음',
        operatingHours: item.operatingHours || '운영시간 정보 없음',
        services: item.services ? item.services.split(',') : []
      }));
      
      setCenters(formattedCenters);
      */
      
      // 더미 데이터 사용
      setTimeout(() => {
        setCenters(DUMMY_CENTERS);
        setIsLoading(false);
      }, 1000);
    } catch (err) {
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
      console.error('API 호출 오류:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (address) {
      fetchTransportCenters();
    }
  }, [address]);

  const handleFilter = (service: string) => {
    setSelectedService(service);
    if (service === '전체') {
      setCenters(DUMMY_CENTERS);
    } else {
      const filtered = DUMMY_CENTERS.filter(center => 
        center.services.includes(service)
      );
      setCenters(filtered);
    }
  };

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleMap = (address: string) => {
    window.open(`https://map.kakao.com/link/search/${address}`, '_blank');
  };

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

  // 아웃팅 위치 로드 함수 추가
  const loadOutingLocations = async () => {
    try {
      const response = await fetch('/data/outing_locations.json');
      if (!response.ok) {
        throw new Error('나들이 데이터를 불러오는데 실패했습니다.');
      }
      const data: OutingLocation[] = await response.json();
      setOutingLocations(data);
      return data;
    } catch (err) {
      console.error('나들이 데이터 로드 오류:', err);
      return [];
    }
  };

  // 가까운 나들이 위치 찾기 함수
  const findNearbyOutingLocations = async (lat: number, lng: number, radius: number = 5) => {
    if (outingLocations.length === 0) {
      const locations = await loadOutingLocations();
      if (locations.length === 0) return;
    }
    
    // 거리 계산 함수 (Haversine 공식)
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371; // 지구 반경 (km)
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c; // 거리 (km)
    };
    
    // 주변 위치 찾기
    const nearby = outingLocations
      .map(location => {
        const distance = calculateDistance(lat, lng, location.latitude, location.longitude);
        return { ...location, distance };
      })
      .filter(location => location.distance <= radius)
      .sort((a, b) => (a.distance as number) - (b.distance as number))
      .slice(0, 10); // 가장 가까운 10개만 선택
      
    setNearbyLocations(nearby);
    return nearby;
  };

  // 무장애 관광지 로드 함수 추가
  const loadBarrierFreeLocations = async () => {
    try {
      const response = await fetch('/data/barrierfree_data.json');
      if (!response.ok) {
        throw new Error('무장애 관광지 데이터를 불러오는데 실패했습니다.');
      }
      const data: BarrierFreeLocation[] = await response.json();
      setBarrierFreeLocations(data);
      return data;
    } catch (err) {
      console.error('무장애 관광지 데이터 로드 오류:', err);
      return [];
    }
  };

  // 가까운 무장애 관광지 찾기 함수
  const findNearbyBarrierFreeLocations = async (lat: number, lng: number, radius: number = 50) => {
    if (barrierFreeLocations.length === 0) {
      const locations = await loadBarrierFreeLocations();
      if (locations.length === 0) return;
    }
    
    // 위치 데이터가 있는 장소만 필터링
    const locationsWithCoords = barrierFreeLocations.filter(location => {
      // 여기서는 좌표 정보가 없으므로 임의로 도시(CTPRVN_NM)를 기준으로 필터링
      return location.CTPRVN_NM && location.CTPRVN_NM.trim() !== '';
    });
    
    // 도시 이름 기준으로 정렬 (실제로는 거리 계산이 필요하지만 좌표 데이터가 없으므로 대체)
    const nearby = locationsWithCoords
      .sort((a, b) => a.CTPRVN_NM.localeCompare(b.CTPRVN_NM))
      .slice(0, 10); // 최대 10개만 표시
    
    setNearbyBarrierFreeLocations(nearby);
    return nearby;
  };

  // 컴포넌트 마운트 시 나들이 데이터 로드
  useEffect(() => {
    loadOutingLocations();
    loadBarrierFreeLocations();
  }, []);

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
    if (mapLoaded && window.kakao && window.kakao.maps && (showMap || mapVisible)) {
      const container = document.getElementById('map');
      if (!container) return;

      // 지도 컨테이너 크기 설정
      container.style.width = '100%';
      container.style.height = showMap ? '400px' : '240px';

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
      let clusterer: KakaoMarkerClusterer | undefined;
      if (window.kakao.maps.MarkerClusterer) {
        clusterer = new window.kakao.maps.MarkerClusterer({
          map: map,
          averageCenter: true,
          minLevel: 10,
          gridSize: 60
        });
      }

      // 주소로 좌표 검색
      const geocoder = new window.kakao.maps.services.Geocoder();
      geocoder.addressSearch(address, async (result: any, status: any) => {
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

          // 나들이 선택된 경우 근처 아웃팅 위치 검색
          if (selectedType === 'outing') {
            const nearby = await findNearbyOutingLocations(parseFloat(result[0].y), parseFloat(result[0].x), 5);
            
            if (nearby && nearby.length > 0) {
              const markers = nearby.map((location) => {
                const markerPosition = new window.kakao.maps.LatLng(location.latitude, location.longitude);
                const marker = new window.kakao.maps.Marker({
                  position: markerPosition,
                  map: map
                });

                // 마커 클릭 시 정보창 표시
                window.kakao.maps.event.addListener(marker, 'click', () => {
                  const distanceKm = (location.distance as number).toFixed(2);
                  const content = `<div style="padding:10px;width:200px;">
                    <div style="font-weight:bold;font-size:14px;margin-bottom:5px;">${location.name}</div>
                    <div style="font-size:12px;margin-bottom:5px;">거리: ${distanceKm}km</div>
                    <div style="font-size:12px;margin-bottom:5px;">${location.address}</div>
                    ${location.phone ? `<div style="font-size:12px;margin-bottom:5px;">연락처: ${location.phone}</div>` : ''}
                    ${location.additionalInfo ? `<div style="font-size:12px;margin-bottom:5px;">${location.additionalInfo}</div>` : ''}
                  </div>`;
                
                  const infowindow = new window.kakao.maps.InfoWindow({
                    content: content,
                    removable: true
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
                markers.forEach((marker: KakaoMarker) => bounds.extend(marker.getPosition()));
                map.setBounds(bounds);
              }
            } else {
              // 주변 위치 정보가 없는 경우 현재 위치만 표시
              map.setCenter(coords);
            }
          } else if (selectedType === 'support') {
            // 무장애 관광지 정보 표시
            const nearby = nearbyBarrierFreeLocations;
            
            if (nearby && nearby.length > 0) {
              const markers = nearby.map((location) => {
                // 좌표 정보가 없으므로 임의의 위치를 계산 (실제로는 정확한 좌표가 필요)
                // 예시로 현재 위치에서 약간씩 떨어진 위치로 설정
                const randomLat = parseFloat(result[0].y) + (Math.random() * 0.05 - 0.025);
                const randomLng = parseFloat(result[0].x) + (Math.random() * 0.05 - 0.025);
                const markerPosition = new window.kakao.maps.LatLng(randomLat, randomLng);
                
                const marker = new window.kakao.maps.Marker({
                  position: markerPosition,
                  map: map
                });

                // 마커 클릭 시 정보창 표시
                window.kakao.maps.event.addListener(marker, 'click', () => {
                  const address = location.FCLTY_ROAD_NM_ADDR || location.LNM_ADDR || '주소 정보 없음';
                  const content = `<div style="padding:10px;width:200px;">
                    <div style="font-weight:bold;font-size:14px;margin-bottom:5px;">${location.FCLTY_NM}</div>
                    <div style="font-size:12px;margin-bottom:5px;">${address}</div>
                    <div style="font-size:12px;margin-bottom:5px;">지역: ${location.CTPRVN_NM} ${location.SIGNGU_NM}</div>
                    ${location.TEL_NO ? `<div style="font-size:12px;margin-bottom:5px;">연락처: ${location.TEL_NO}</div>` : ''}
                    <div style="font-size:12px;margin-bottom:5px;">
                      ${location.FACILITIES.장애인화장실 ? '♿ 장애인화장실 ' : ''}
                      ${location.FACILITIES.휠체어대여 ? '🦽 휠체어대여 ' : ''}
                      ${location.FACILITIES.경사로 ? '📐 경사로 ' : ''}
                    </div>
                  </div>`;
                
                  const infowindow = new window.kakao.maps.InfoWindow({
                    content: content,
                    removable: true
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
                markers.forEach((marker: KakaoMarker) => bounds.extend(marker.getPosition()));
                map.setBounds(bounds);
              }
            } else {
              // 주변 위치 정보가 없는 경우 현재 위치만 표시
              map.setCenter(coords);
            }
          } else {
            // 주변 이동 지원 시설 검색 로직 유지
            const places = new window.kakao.maps.services.Places();
            const searchOptions = {
              location: coords,
              radius: 1000, // 1km 반경
              sort: window.kakao.maps.services.SortBy.DISTANCE
            };

            // 선택된 이동 지원 유형에 따라 검색 키워드 설정
            let keyword = '';
            if (selectedType === 'support') {
              keyword = '무장애 관광지';
            } else if (selectedType === 'outing') {
              keyword = '나들이 지원';
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
                if (clusterer) {
                  clusterer.addMarkers(markers);
                } else {
                  // 클러스터러가 없는 경우 일반 마커로 추가
                  markers.forEach((marker: KakaoMarker) => marker.setMap(map));
                }
              }
            }, searchOptions);

            // 지도 중심 이동
            map.setCenter(coords);
          }

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
  }, [mapLoaded, address, showMap, mapVisible, selectedType, outingLocations, nearbyBarrierFreeLocations]);

  // selectedType이 변경될 때 지도와 주변 위치 정보 처리
  useEffect(() => {
    if (selectedType === 'outing') {
      // 현재 좌표 구하기
      if (navigator.geolocation) {
        setIsLoading(true);
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            await findNearbyOutingLocations(lat, lng, 5);
            setIsLoading(false);
            setMapVisible(true);
          },
          (error) => {
            console.error('현재 위치를 가져올 수 없습니다:', error);
            setIsLoading(false);
            setMapVisible(true);
          }
        );
      } else {
        setMapVisible(true);
      }
    } else if (selectedType === 'support') {
      // 무장애 관광지 정보 로드
      if (navigator.geolocation) {
        setIsLoading(true);
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            await findNearbyBarrierFreeLocations(lat, lng, 50);
            setIsLoading(false);
            setMapVisible(true);
          },
          (error) => {
            console.error('현재 위치를 가져올 수 없습니다:', error);
            setIsLoading(false);
            setMapVisible(true);
          }
        );
      } else {
        setMapVisible(true);
      }
    } else {
      setMapVisible(false);
    }
  }, [selectedType]);

  const transportTypes = [
    {
      id: 'support',
      title: '무장애 관광지',
      icon: '♿',
      description: '장애인, 노약자, 임산부도 편하게 즐길 수 있는 무장애 관광지'
    },
    {
      id: 'outing',
      title: '나들이',
      icon: '🌳',
      description: '산책, 휴식, 여가 활동 지원'
    }
  ];

  // 나들이 상세 정보 컴포넌트
  const OutingLocationInfo = () => {
    if (nearbyLocations.length === 0) {
      return (
        <div className="p-4 bg-yellow-50 rounded-xl mb-4">
          <div className="font-['Do_Hyeon'] text-center">근처에 나들이 위치 정보가 없습니다.</div>
          <div className="text-sm text-gray-500 mt-1 font-['Do_Hyeon'] text-center">다른 위치를 선택해 보세요</div>
        </div>
      );
    }
    
    return (
      <div className="max-h-60 overflow-y-auto pr-2">
        {nearbyLocations.map((location) => (
          <div key={location.id} className="p-4 bg-yellow-50 rounded-xl mb-4">
            <div className="font-['Do_Hyeon'] font-bold text-lg">{location.name}</div>
            <div className="text-sm text-gray-700 mt-1 font-['Do_Hyeon']">거리: {(location.distance as number).toFixed(2)}km</div>
            <div className="text-sm text-gray-700 mt-1 font-['Do_Hyeon']">{location.address}</div>
            
            <div className="flex flex-wrap mt-2 gap-2">
              {location.phone && (
                <a 
                  href={`tel:${location.phone}`} 
                  className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-['Do_Hyeon']"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
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
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
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
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                길찾기
              </a>
            </div>
            
            {location.additionalInfo && (
              <div className="text-sm text-gray-700 mt-2 font-['Do_Hyeon']">{location.additionalInfo}</div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // 무장애 관광지 상세 정보 컴포넌트
  const BarrierFreeLocationInfo = () => {
    if (nearbyBarrierFreeLocations.length === 0) {
      return (
        <div className="p-4 bg-yellow-50 rounded-xl mb-4">
          <div className="font-['Do_Hyeon'] text-center">근처에 무장애 관광지 정보가 없습니다.</div>
          <div className="text-sm text-gray-500 mt-1 font-['Do_Hyeon'] text-center">다른 위치를 선택해 보세요</div>
        </div>
      );
    }
    
    return (
      <div className="max-h-60 overflow-y-auto pr-2">
        {nearbyBarrierFreeLocations.map((location) => (
          <div key={location.ESNTL_ID} className="p-4 bg-blue-50 rounded-xl mb-4">
            <div className="font-['Do_Hyeon'] font-bold text-lg">{location.FCLTY_NM}</div>
            <div className="text-sm text-gray-700 mt-1 font-['Do_Hyeon']">{location.CTPRVN_NM} {location.SIGNGU_NM}</div>
            <div className="text-sm text-gray-700 mt-1 font-['Do_Hyeon']">{location.FCLTY_ROAD_NM_ADDR || location.LNM_ADDR || '주소 정보 없음'}</div>
            
            <div className="flex flex-wrap mt-2 gap-2">
              {location.TEL_NO && (
                <a 
                  href={`tel:${location.TEL_NO}`} 
                  className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-['Do_Hyeon']"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
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
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                길찾기
              </a>
            </div>
            
            <div className="mt-3 flex flex-wrap gap-1">
              {location.FACILITIES.장애인화장실 && (
                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-md">♿ 장애인화장실</span>
              )}
              {(location.FACILITIES.장애인주차구역 || location.FACILITIES.장애인주차장) && (
                <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-md">🅿️ 장애인주차</span>
              )}
              {location.FACILITIES.엘리베이터 && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-md">🔼 엘리베이터</span>
              )}
              {location.FACILITIES.경사로 && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-md">📐 경사로</span>
              )}
              {location.FACILITIES.휠체어대여 && (
                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-md">🦽 휠체어대여</span>
              )}
              {location.FACILITIES.수유실 && (
                <span className="text-xs bg-pink-100 text-pink-800 px-2 py-1 rounded-md">👶 수유실</span>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full bg-[#FFF4BB] flex justify-center items-center">
      <div className="w-96 h-[900px] relative bg-[#FFF4BB] overflow-hidden">
        {/* 헤더 */}
        <div className="left-[155px] top-[65px] absolute text-center justify-start text-neutral-700 text-2xl font-normal font-['Do_Hyeon'] leading-[50px]">
          이동 지원
        </div>
        <button 
          onClick={() => router.back()}
          className="left-[24px] top-[63px] absolute text-center justify-start text-neutral-700 text-2xl font-normal font-['Inter'] leading-[50px]"
        >
          &lt;
        </button>

        {/* Current Location Section */}
        <div className="w-[360px] h-[100px] mx-auto mt-40.5 bg-white rounded-3xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.30)] shadow-[0px_1px_3px_1px_rgba(0,0,0,0.15)]">
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

        {/* 이동 지원 유형 선택 */}
        <div className="mx-auto mt-2 w-[360px] space-y-4">
          {transportTypes.map((type) => (
            <div key={type.id}>
              {type.id === 'support' && (
                <div className="border-t border-dashed border-gray-300 my-6" />
              )}
              <div
                className={`p-6 rounded-3xl shadow-sm cursor-pointer transition-all duration-300 ${
                  selectedType === type.id
                    ? 'bg-blue-100 border-2 border-blue-200'
                    : 'bg-white hover:bg-blue-50'
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

        {/* 선택된 이동 지원 유형에 따른 추가 정보 표시 */}
        {selectedType && !showMap && (
          <>
            {/* 반투명 배경 */}
            <div 
              className="fixed inset-0 bg-black/50 z-10"
              onClick={() => setSelectedType(null)}
            />
            
            {/* 정보 상자 */}
            <div className="absolute left-[12px] top-[200px] w-[360px] p-5 bg-white rounded-3xl shadow-sm z-20">
              <div className="text-center font-['Do_Hyeon'] text-2xl mb-4">
                {transportTypes.find(t => t.id === selectedType)?.title} 정보
              </div>
              
              {/* 로딩 표시 */}
              {isLoading && (
                <div className="flex justify-center items-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                </div>
              )}
              
              {/* 선택된 타입에 따라 지도 표시 */}
              {(selectedType === 'outing' || selectedType === 'support') && mapVisible && (
                <div className="mb-4">
                  <div className="w-full h-[240px] rounded-xl overflow-hidden" id="map">
                    {!mapLoaded && (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* 선택된 타입에 따라 정보 표시 */}
              {selectedType === 'outing' && !isLoading && (
                <div className="mb-4 mt-4">
                  <OutingLocationInfo />
                </div>
              )}
              
              {selectedType === 'support' && !isLoading && (
                <div className="mb-4 mt-4">
                  <BarrierFreeLocationInfo />
                </div>
              )}
              
              <div className="space-y-4">
                {/* 나들이나 무장애 관광지가 아닌 경우에만 주변 시설 찾기 버튼 표시 */}
                {selectedType !== 'outing' && selectedType !== 'support' && (
                  <div 
                    className="p-4 bg-blue-50 rounded-xl cursor-pointer"
                    onClick={() => setShowMap(true)}
                  >
                    <div className="font-['Do_Hyeon']">📍 주변 시설 찾기</div>
                    <div className="text-sm text-gray-500 mt-1 font-['Do_Hyeon']">가까운 시설을 찾아보세요</div>
                  </div>
                )}
                
                {/* 나들이와 무장애 관광지가 아닌 경우에만 상담하기 버튼 표시 */}
                {selectedType !== 'outing' && selectedType !== 'support' && (
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <div className="font-['Do_Hyeon']">💬 상담하기</div>
                    <div className="text-sm text-gray-500 mt-1 font-['Do_Hyeon']">전문 상담원과 상담하세요</div>
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