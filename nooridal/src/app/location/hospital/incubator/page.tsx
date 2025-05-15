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
  const { address } = useAddress(); // Get address from context
  const [allClinics, setAllClinics] = useState<IncubatorClinic[]>([]);
  const [nearbyClinics, setNearbyClinics] = useState<IncubatorClinic[]>([]);
  const [userCoords, setUserCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapInstance, setMapInstance] = useState<KakaoMap | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [activeInfoWindow, setActiveInfoWindow] =
    useState<KakaoInfoWindow | null>(null);

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

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  // 2. Fetch clinic data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch("/data/incubator_hospitals.json");
        const data: IncubatorData = await response.json();
        setAllClinics(data.clinics || []);
      } catch (err) {
        console.error("Failed to fetch incubator data:", err);
      }
    };
    fetchData();
  }, []);

  // 3. Geocode address and find nearby clinics
  useEffect(() => {
    if (mapLoaded && address && allClinics.length > 0) {
      const geocoder: KakaoGeocoder = new window.kakao.maps.services.Geocoder();
      geocoder.addressSearch(address, (result: any, status: any) => {
        if (status === window.kakao.maps.services.Status.OK) {
          const lat = parseFloat(result[0].y);
          const lng = parseFloat(result[0].x);
          setUserCoords({ lat, lng });

          // Calculate distances and filter nearby clinics (e.g., within 10km)
          const radius = 50; // Increased radius to 50km
          const nearby = allClinics
            .map((clinic) => ({
              ...clinic,
              distance: calculateDistance(lat, lng, clinic.lat, clinic.lng),
            }))
            .filter((clinic) => clinic.distance <= radius)
            .sort((a, b) => a.distance - b.distance);

          setNearbyClinics(nearby);
        } else {
          console.error("Geocoding failed for address:", address);
          setNearbyClinics([]); // Reset if geocoding fails
        }
        setLoading(false); // Stop loading after geocoding and filtering
      });
    } else if (allClinics.length > 0) {
      // If map is not loaded yet, or no address, stop loading
      setLoading(false);
    }
  }, [mapLoaded, address, allClinics]);

  // 4. Initialize map
  useEffect(() => {
    if (mapLoaded && mapContainerRef.current && !mapInstance) {
      const options = {
        center: new window.kakao.maps.LatLng(37.566826, 126.9786567), // Default center (Seoul)
        level: 5,
      };
      const map = new window.kakao.maps.Map(mapContainerRef.current, options);
      setMapInstance(map);

      // Add zoom control
      const zoomControl = new window.kakao.maps.ZoomControl();
      map.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT);
    }
  }, [mapLoaded, mapInstance]);

  // 5. Update map markers and center when userCoords or nearbyClinics change
  useEffect(() => {
    if (mapInstance && userCoords) {
      // Clear previous info window if any
      if (activeInfoWindow) {
        activeInfoWindow.close();
        setActiveInfoWindow(null);
      }

      // Clear existing markers (simple approach, consider optimization for many markers)
      // This needs access to markers array, let's manage markers in state or ref if clearing is needed frequently.
      // For now, we will just add new markers. Consider using MarkerClusterer if performance degrades.

      const userPosition = new window.kakao.maps.LatLng(
        userCoords.lat,
        userCoords.lng
      );
      mapInstance.setCenter(userPosition);
      mapInstance.setLevel(5, { animate: true }); // Zoom level suitable for 10km radius

      // Add user marker
      new window.kakao.maps.Marker({
        map: mapInstance,
        position: userPosition,
        image: new window.kakao.maps.MarkerImage(
          "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png",
          new window.kakao.maps.Size(24, 35)
        ),
      });

      // Add markers for nearby clinics
      nearbyClinics.forEach((clinic) => {
        const markerPosition = new window.kakao.maps.LatLng(
          clinic.lat,
          clinic.lng
        );
        const marker = new window.kakao.maps.Marker({
          map: mapInstance,
          position: markerPosition,
          title: clinic.name,
        });

        // Info window content
        const content = `
          <div style="padding:10px; width: 250px; font-size: 12px; line-height: 1.4;">
            <div style="font-weight: bold; margin-bottom: 5px; font-size: 14px;">${
              clinic.name
            }</div>
            <div>${clinic.address}</div>
            ${clinic.phone ? `<div>연락처: ${clinic.phone}</div>` : ""}
            <div style="margin-top: 5px;">인큐베이터: <span style="font-weight: bold; color: #E53E3E;">${
              clinic.incubatorCount
            }</span>대</div>
            <div>거리: ${clinic.distance?.toFixed(2)}km</div>
          </div>
        `;

        const infowindow = new window.kakao.maps.InfoWindow({
          content: content,
          removable: true,
        });

        window.kakao.maps.event.addListener(marker, "click", () => {
          // Close currently active info window before opening a new one
          if (activeInfoWindow) {
            activeInfoWindow.close();
          }
          infowindow.open(mapInstance, marker);
          setActiveInfoWindow(infowindow); // Set the new info window as active
        });
      });
    }
  }, [mapInstance, userCoords, nearbyClinics, activeInfoWindow]); // Added activeInfoWindow dependency

  return (
    <div className="min-h-screen w-full bg-[#FFF4BB]">
      <div className="flex flex-col h-screen relative">
        {/* 헤더 */}
        <MapHeaderBar title="신생아 인큐베이터" backUrl="/location/hospital" />

        {/* 지도 컨테이너 */}
        <div ref={mapContainerRef} className="w-full h-80 z-0" />

        {/* Loading indicator */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 z-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-r-2 border-yellow-400"></div>
          </div>
        )}

        {/* 인큐베이터 병원 목록 */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 bg-[#FFF4BB] pt-4">
          {nearbyClinics.length === 0 ? (
            <div className="text-center pt-10 font-['Do_Hyeon'] text-gray-500">
              설정된 주소 50km 내에 인큐베이터 보유 병원 정보가 없습니다.
            </div>
          ) : (
            <>
              <div className="mb-2 text-sm font-['Do_Hyeon'] text-gray-600">
                현재 위치 기준 50km 내 {nearbyClinics.length}개 병원 검색 결과:
              </div>
              {nearbyClinics.map((clinic) => (
                <div
                  key={clinic.id}
                  className="bg-white p-3.5 rounded-xl shadow-sm border border-gray-200"
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3 mt-1 bg-red-100 rounded-full p-2.5">
                      <span className="text-xl">🏥</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-baseline">
                        <h3 className="text-md font-['Do_Hyeon'] text-red-700 mb-0.5">
                          {clinic.name}
                        </h3>
                        <span className="text-xs font-bold font-['Do_Hyeon'] text-gray-600">
                          {clinic.distance?.toFixed(1)}km
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 font-['Do_Hyeon']">
                        {clinic.type}
                      </p>
                      <p className="text-xs text-gray-700 mt-1.5 font-['Do_Hyeon']">
                        {clinic.address}
                      </p>
                      <p className="text-xs font-bold text-red-600 mt-1.5 font-['Do_Hyeon']">
                        인큐베이터: {clinic.incubatorCount}대
                      </p>
                      <div className="mt-3 flex items-center space-x-2">
                        {clinic.phone && (
                          <a
                            href={`tel:${clinic.phone}`}
                            className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-['Do_Hyeon'] hover:bg-blue-200 transition-colors"
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
                            {clinic.phone}
                          </a>
                        )}
                        <a
                          //   href={`https://map.kakao.com/link/search/${encodeURIComponent(clinic.name)}`}
                          href={`https://map.kakao.com/link/map/${encodeURIComponent(
                            clinic.name
                          )},${clinic.lat},${clinic.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-['Do_Hyeon'] hover:bg-yellow-200 transition-colors"
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
