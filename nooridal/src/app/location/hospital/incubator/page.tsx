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

interface IncubatorClinic {
  id: string;
  name: string;
  type: string;
  province: string;
  address: string;
  phone: string;
  lat: number;
  lng: number;
  incubatorCount: number;
  distance?: number; // Distance from user's location in km
}

// IncubatorData interface to match the JSON structure
interface IncubatorData {
  totalCount: number;
  clinics: IncubatorClinic[];
  clinicsByProvince: { [province: string]: IncubatorClinic[] };
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

export default function IncubatorPage() {
  const router = useRouter();
  const { searchAddress, isLoaded } = useAddress();
  const [allClinics, setAllClinics] = useState<IncubatorClinic[]>([]);
  const [nearbyClinics, setNearbyClinics] = useState<IncubatorClinic[]>([]);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapInstance, setMapInstance] = useState<KakaoMap | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [activeInfoWindow, setActiveInfoWindow] = useState<KakaoInfoWindow | null>(null);

  // 1. Load Kakao Maps SDK
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
    return () => { if (document.head.contains(script)) document.head.removeChild(script); };
  }, []);

  // 2. Fetch incubator data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch("/data/incubator_hospitals.json"); // Fetch from JSON file
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: IncubatorData = await response.json();
        setAllClinics(data.clinics || []); // Use data.clinics
      } catch (err) {
        console.error("Failed to fetch incubator data:", err);
        setAllClinics([]); // Set to empty array on error
      }
      // setLoading(false) will be handled in the geocoding useEffect or if searchAddress is missing
    };
    fetchData();
  }, []);

  // 3. Geocode searchAddress and find nearby clinics
  useEffect(() => {
    if (!isLoaded) return; // Wait for address context to be loaded

    if (mapLoaded && searchAddress && allClinics.length > 0) {
      setLoading(true);
      const geocoder = new window.kakao.maps.services.Geocoder();
      geocoder.addressSearch(searchAddress, (result: any, status: any) => {
        if (status === window.kakao.maps.services.Status.OK) {
          const lat = parseFloat(result[0].y);
          const lng = parseFloat(result[0].x);
          setUserCoords({ lat, lng });

          const nearby = allClinics
            .map(clinic => ({
              ...clinic,
              distance: calculateDistance(lat, lng, clinic.lat, clinic.lng)
            }))
            .sort((a, b) => (a.distance || 0) - (b.distance || 0))
            .slice(0, 20);
          setNearbyClinics(nearby);
        } else {
          console.error("Failed to geocode searchAddress:", searchAddress);
          setNearbyClinics([]);
          // Consider alerting the user or setting a specific error state
          alert("선택된 주소의 좌표를 찾을 수 없어 주변 정보를 가져올 수 없습니다.");
        }
        setLoading(false);
      });
    } else if (mapLoaded && !searchAddress && allClinics.length >= 0) {
      // If map is loaded, but there's no searchAddress (e.g. initial load, or user cleared it)
      // or if allClinics is empty (after fetch attempt)
      setUserCoords(null); // Clear userCoords
      setNearbyClinics([]); // Clear nearby clinics
      setLoading(false); // Stop loading
    } else if (mapLoaded && searchAddress && allClinics.length === 0 && !loading) {
      // If map is loaded, searchAddress exists, but allClinics is empty (and not currently loading from fetch)
      // This means fetch completed but found no clinics in the JSON or failed.
      setLoading(false);
    }
  }, [mapLoaded, searchAddress, allClinics, isLoaded]); // Added isLoaded

  // 4. Initialize map (Only if not already initialized)
  useEffect(() => {
    if (mapLoaded && mapContainerRef.current && !mapInstance) { // Check !mapInstance
      const options = {
        center: new window.kakao.maps.LatLng(37.566826, 126.9786567), // Default to Seoul
        level: 9, // Default zoom level
      };
      const map = new window.kakao.maps.Map(mapContainerRef.current, options);
      
      // Add zoom control
      const zoomControl = new window.kakao.maps.ZoomControl();
      map.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT);
      
      setMapInstance(map);
    }
  }, [mapLoaded, mapInstance]); // mapInstance dependency ensures this runs once

  // 5. Update map markers and center when userCoords or nearbyClinics change
  useEffect(() => {
    if (mapInstance && userCoords && nearbyClinics.length > 0) {
      // Clear previous info window if any
      if (activeInfoWindow) {
        activeInfoWindow.close();
        setActiveInfoWindow(null);
      }

      // Simple way to clear old markers: remove map container's children and re-init (not ideal for many markers)
      // A better approach would be to store markers in an array and call marker.setMap(null)
      // For now, the map is re-centered and markers are added. If duplicates appear, marker clearing logic is needed.

      const userMapPosition = new window.kakao.maps.LatLng(userCoords.lat, userCoords.lng);
      mapInstance.setCenter(userMapPosition);
      mapInstance.setLevel(7, { animate: true }); // Zoom level for nearby area

      // Add user marker
      new window.kakao.maps.Marker({
        map: mapInstance,
        position: userMapPosition,
        image: new window.kakao.maps.MarkerImage(
          "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png",
          new window.kakao.maps.Size(24, 35)
        )
      });

      // Add markers for nearby clinics
      nearbyClinics.forEach((clinic) => {
        if (clinic.lat && clinic.lng) { // Ensure lat/lng are present
          const markerPosition = new window.kakao.maps.LatLng(clinic.lat, clinic.lng);
          const marker = new window.kakao.maps.Marker({
            map: mapInstance,
            position: markerPosition,
            title: clinic.name,
          });

          const iwContent = `
            <div style="padding:10px; width: 250px; font-size: 12px; line-height: 1.4;">
              <div style="font-weight: bold; margin-bottom: 5px; font-size: 14px;">${clinic.name}</div>
              <div>${clinic.address}</div>
              ${clinic.phone ? `<div>연락처: ${clinic.phone}</div>` : ""}
              <div style="margin-top: 5px;">인큐베이터: <span style="font-weight: bold; color: #E53E3E;">${clinic.incubatorCount}대</span></div>
              ${clinic.distance ? `<div>거리: ${clinic.distance.toFixed(2)}km</div>` : ''}
            </div>
          `;
          const infowindow = new window.kakao.maps.InfoWindow({ content: iwContent, removable: true });

          window.kakao.maps.event.addListener(marker, 'click', () => {
            if (activeInfoWindow) {
              activeInfoWindow.close();
            }
            infowindow.open(mapInstance, marker);
            setActiveInfoWindow(infowindow);
          });
        }
      });
    } else if (mapInstance && userCoords && nearbyClinics.length === 0) {
        // If user location is known but no nearby clinics, center map on user
        const userMapPosition = new window.kakao.maps.LatLng(userCoords.lat, userCoords.lng);
        mapInstance.setCenter(userMapPosition);
        mapInstance.setLevel(7, { animate: true });
         new window.kakao.maps.Marker({ // Still show user marker
            map: mapInstance,
            position: userMapPosition,
            image: new window.kakao.maps.MarkerImage(
            "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png",
            new window.kakao.maps.Size(24, 35)
            )
        });
    } else if (mapInstance && !userCoords) {
        // If map is ready but no userCoords (e.g. address geocoding failed or no address)
        // Keep default map center (Seoul) or a pre-defined fallback
        mapInstance.setCenter(new window.kakao.maps.LatLng(37.566826, 126.9786567));
        mapInstance.setLevel(9);
    }
  }, [mapInstance, userCoords, nearbyClinics]); // Removed activeInfoWindow from deps

  if (!isLoaded && loading) { // Show loading if address context OR data is loading
    return (
      <div className="min-h-screen w-full bg-[#FFF4BB] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-700"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#FFF4BB]">
      <div className="flex flex-col h-screen relative">
        {/* 헤더 */}
        <MapHeaderBar title="신생아 인큐베이터" backUrl="/location/hospital" showBackButton={true} />

        {/* 지도 컨테이너 */}
        <div ref={mapContainerRef} className="w-full h-80 z-0" style={{ display: mapLoaded ? 'block' : 'none' }} />
        {!mapLoaded && ( // Show placeholder or specific loading for map area
          <div className="w-full h-80 bg-gray-200 flex items-center justify-center z-0">
            <p className="text-gray-500 font-['Do_Hyeon']">지도 로딩 중...</p>
          </div>
        )}

        {/* Loading indicator */}
        {loading && (
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-700"></div>
        )}

        <div className="flex-1 overflow-y-auto px-4 pb-4 bg-[#FFF4BB] pt-4">
          {!loading && nearbyClinics.length === 0 && !userCoords && (
            <div className="text-center pt-10 font-['Do_Hyeon'] text-gray-500">
              주소를 먼저 설정해주세요. (기본값: 서울 전체)
            </div>
          )}
          {!loading && nearbyClinics.length === 0 && userCoords && (
            <div className="text-center pt-10 font-['Do_Hyeon'] text-gray-500">
              설정된 주소 50km 내에 인큐베이터 보유 병원 정보가 없습니다.
            </div>
          )}
          {!loading && nearbyClinics.length > 0 && (
            <>
              <div className="mb-2 text-sm font-['Do_Hyeon'] text-gray-600">
                {searchAddress ? `${searchAddress} 기준` : "전체"} 가까운 병원 {nearbyClinics.length}개 검색 결과:
              </div>
              {nearbyClinics.map((clinic) => (
                <div
                  key={clinic.id}
                  className="bg-white p-3.5 rounded-xl shadow-sm border border-gray-200 mb-3" // Added mb-3 for spacing
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3 mt-1 bg-red-100 rounded-full p-2.5">
                      {/* Placeholder for clinic icon */}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-sky-700">{clinic.name}</h3>
                      <p className="text-gray-600 text-sm mt-1">{clinic.address}</p>
                      {clinic.phone && <p className="text-gray-600 text-sm">연락처: {clinic.phone}</p>}
                      <div className="mt-2">
                        <span className="font-semibold">인큐베이터: {clinic.incubatorCount}대</span>
                        {clinic.distance !== undefined && 
                          <span className="ml-2 text-sm text-gray-500">({clinic.distance.toFixed(1)}km)</span>
                        }
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
