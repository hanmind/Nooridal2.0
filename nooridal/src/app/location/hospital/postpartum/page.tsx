"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAddress } from "@/app/context/AddressContext";
import MapHeaderBar from "@/app/components/MapHeaderBar";

// 카카오맵 타입 정의
declare global {
  interface Window {
    kakao: any;
  }
}

// Kakao maps type
type KakaoMap = any;
type KakaoMarker = any;
type KakaoLatLng = any;
type KakaoGeocoder = any;
type KakaoInfoWindow = any;

interface PostpartumCenter {
  id: string;
  name: string;
  address: string;
  phone: string;
  lat: number | null;
  lng: number | null;
  motherCapacity: number;
  infantCapacity: number;
  nurseCount: number | null;
  nurseAidCount: number | null;
  operating_hours?: string;
  services?: string[];
  rating?: number;
  reviews_count?: number;
  distance?: number;
}

interface PostpartumData {
  totalCount: number;
  centers: PostpartumCenter[];
  meta: {
    description: string;
    source: string;
    lastUpdated: string;
  };
}

// Haversine distance calculation
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

export default function PostpartumCenterPage() {
  const router = useRouter();
  const { searchAddress, isLoaded } = useAddress(); // Use searchAddress and isLoaded
  const [allCenters, setAllCenters] = useState<PostpartumCenter[]>([]);
  const [nearbyCenters, setNearbyCenters] = useState<PostpartumCenter[]>([]);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapInstance, setMapInstance] = useState<KakaoMap | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [activeInfoWindow, setActiveInfoWindow] = useState<KakaoInfoWindow | null>(null);

  // 1. Load Kakao Maps SDK
  useEffect(() => {
    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&libraries=services&autoload=false`;
    script.async = true;
    script.onload = () => {
      window.kakao.maps.load(() => {
        setMapLoaded(true);
      });
    };
    document.head.appendChild(script);
    return () => { if (document.head.contains(script)) document.head.removeChild(script); };
  }, []);

  // 2. Fetch center data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch("/data/postpartum_centers.json"); // Fetch from JSON file
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: PostpartumData = await response.json();
        setAllCenters(data.centers || []);
      } catch (err) {
        console.error("Failed to fetch postpartum center data:", err);
        setAllCenters([]);
      }
      // setLoading will be handled in the geocoding useEffect or if searchAddress is missing
    };
    fetchData();
  }, []);

  // 3. Geocode searchAddress and find nearby centers
  useEffect(() => {
    if (!isLoaded) return; // Wait for address context to be loaded

    if (mapLoaded && searchAddress && allCenters.length > 0) {
      setLoading(true);
      const geocoder = new window.kakao.maps.services.Geocoder();
      geocoder.addressSearch(searchAddress, (result: any, status: any) => {
        if (status === window.kakao.maps.services.Status.OK) {
          const lat = parseFloat(result[0].y);
          const lng = parseFloat(result[0].x);
          setUserCoords({ lat, lng });

          const radius = 10; // 10km radius
          const nearby = allCenters
            .filter(center => center.lat !== null && center.lng !== null)
            .map(center => ({
              ...center,
              distance: calculateDistance(lat, lng, center.lat!, center.lng!)
            }))
            .filter(center => center.distance != null && center.distance <= radius)
            .sort((a,b) => (a.distance || 0) - (b.distance || 0));
          setNearbyCenters(nearby);
        } else {
          console.error("Failed to geocode searchAddress for postpartum centers:", searchAddress);
          setNearbyCenters([]);
          alert("선택된 주소의 좌표를 찾을 수 없어 주변 산후조리원 정보를 가져올 수 없습니다.");
        }
        setLoading(false);
      });
    } else if (mapLoaded && !searchAddress && allCenters.length >= 0) {
      setUserCoords(null);
      setNearbyCenters([]);
      setLoading(false);
    } else if (mapLoaded && searchAddress && allCenters.length === 0 && !loading) {
        setLoading(false);
    }
  }, [mapLoaded, searchAddress, allCenters, isLoaded]);

  // 4. Initialize map (Only if not already initialized)
  useEffect(() => {
    if (mapLoaded && mapContainerRef.current && !mapInstance) {
      const options = {
        center: new window.kakao.maps.LatLng(37.566826, 126.9786567), // Default to Seoul
        level: 9, // Default zoom level
      };
      const map = new window.kakao.maps.Map(mapContainerRef.current, options);
      
      const zoomControl = new window.kakao.maps.ZoomControl();
      map.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT);

      setMapInstance(map);
    }
  }, [mapLoaded, mapInstance]);

  // 5. Update map markers and center when userCoords or nearbyCenters change
  useEffect(() => {
    if (mapInstance && userCoords && nearbyCenters.length > 0) {
      if (activeInfoWindow) {
        activeInfoWindow.close();
        setActiveInfoWindow(null);
      }

      const userMapPosition = new window.kakao.maps.LatLng(userCoords.lat, userCoords.lng);
      mapInstance.setCenter(userMapPosition);
      mapInstance.setLevel(7, { animate: true });

      new window.kakao.maps.Marker({
        map: mapInstance,
        position: userMapPosition,
        image: new window.kakao.maps.MarkerImage(
          "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png",
          new window.kakao.maps.Size(24, 35)
        )
      });

      nearbyCenters.forEach((center) => {
        if (center.lat && center.lng) {
          const markerPosition = new window.kakao.maps.LatLng(center.lat, center.lng);
          const marker = new window.kakao.maps.Marker({ map: mapInstance, position: markerPosition, title: center.name });
          
          const iwContent = `
            <div style="padding:10px; width: 280px; font-size: 12px; line-height: 1.5;">
              <div style="font-weight: bold; margin-bottom: 5px; font-size: 14px;">${center.name}</div>
              <div>${center.address}</div>
              ${center.phone ? `<div>연락처: ${center.phone}</div>` : ""}
              ${center.operating_hours ? `<div>운영시간: ${center.operating_hours}</div>` : ""}
              ${center.services && center.services.length > 0 ? `<div>주요서비스: ${center.services.join(", ")}</div>` : ""}
              ${center.rating ? `<div>평점: ${center.rating}/5.0 (${center.reviews_count || 0}개)</div>` : ""}
              ${center.distance ? `<div>거리: ${center.distance.toFixed(2)}km</div>` : ''}
            </div>
          `;
          const infowindow = new window.kakao.maps.InfoWindow({ content: iwContent, removable: true });
          window.kakao.maps.event.addListener(marker, 'click', () => {
            if (activeInfoWindow) activeInfoWindow.close();
            infowindow.open(mapInstance, marker);
            setActiveInfoWindow(infowindow);
          });
        }
      });
    } else if (mapInstance && userCoords && nearbyCenters.length === 0) {
        const userMapPosition = new window.kakao.maps.LatLng(userCoords.lat, userCoords.lng);
        mapInstance.setCenter(userMapPosition);
        mapInstance.setLevel(7, { animate: true });
        new window.kakao.maps.Marker({
            map: mapInstance,
            position: userMapPosition,
            image: new window.kakao.maps.MarkerImage(
            "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png",
            new window.kakao.maps.Size(24, 35)
            )
        });
    } else if (mapInstance && !userCoords) {
        mapInstance.setCenter(new window.kakao.maps.LatLng(37.566826, 126.9786567));
        mapInstance.setLevel(9);
    }
  }, [mapInstance, userCoords, nearbyCenters]); // Removed activeInfoWindow from deps

  if (!isLoaded && loading) {
    return (
      <div className="flex flex-col h-screen w-full max-w-md mx-auto bg-[#FFFAF0] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-700"></div>
        <p className="mt-4 text-gray-700 font-['Do_Hyeon']">정보를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full max-w-md mx-auto bg-[#FFFAF0]">
      <MapHeaderBar title="산후조리원 정보" backUrl="/location/hospital" />

      <div className="relative w-full z-0 bg-gray-100 h-[300px] min-h-[280px] md:h-[350px] flex-none">
        <div ref={mapContainerRef} className="w-full h-full" style={{ display: mapLoaded ? 'block' : 'none' }} />
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <p className="text-gray-500 font-['Do_Hyeon']">지도 로딩 중...</p>
          </div>
        )}
      </div>

      {searchAddress && (
        <div className="p-3 bg-yellow-50 text-center text-sm font-['Do_Hyeon'] text-yellow-700">
          검색 기준: {searchAddress} (주변 10km)
        </div>
      )}

      <div className="flex-grow overflow-y-auto p-3 space-y-3">
        {!loading && nearbyCenters.length === 0 && !userCoords && (
            <div className="text-center py-10">
                <p className="font-['Do_Hyeon'] text-gray-500">
                주소를 먼저 설정해주세요. (기본값: 서울 전체)
                </p>
            </div>
        )}
        {!loading && nearbyCenters.length === 0 && userCoords && (
          <div className="text-center py-10">
            <p className="font-['Do_Hyeon'] text-gray-500">
              주변 10km 이내에 산후조리원 정보가 없습니다.
            </p>
          </div>
        )}
        {!loading && nearbyCenters.length > 0 && (
          nearbyCenters.map((center) => (
            <div key={center.id} className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-lg font-semibold font-['Do_Hyeon'] text-pink-600">{center.name}</h3>
              <p className="text-xs text-gray-500 mt-0.5 mb-1.5">{center.address}</p>
              {center.phone && <p className="text-sm text-gray-700">연락처: {center.phone}</p>}
              {center.operating_hours && <p className="text-sm text-gray-700">운영시간: {center.operating_hours}</p>}
              {center.services && center.services.length > 0 && (
                <p className="text-sm text-gray-700">서비스: {center.services.join(", ")}</p>
              )}
              <div className="mt-2 flex justify-between items-center">
                  {center.rating && <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">평점: {center.rating} ({center.reviews_count || 0}개)</span>}
                  {center.distance !== undefined && <span className="text-xs font-semibold text-gray-600">{center.distance.toFixed(1)}km</span>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
