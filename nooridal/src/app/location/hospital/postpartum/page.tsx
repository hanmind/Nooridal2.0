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
  lat: number | null; // Coordinates might be null initially
  lng: number | null;
  motherCapacity: number;
  infantCapacity: number;
  nurseCount: number | null;
  nurseAidCount: number | null;
  distance?: number; // Distance from user's location in km
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
  const { address } = useAddress(); // Get address from context
  const [allCenters, setAllCenters] = useState<PostpartumCenter[]>([]);
  const [nearbyCenters, setNearbyCenters] = useState<PostpartumCenter[]>([]);
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
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&libraries=services&autoload=false`; // Removed clusterer
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

  // 2. Fetch center data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch("/data/postpartum_centers.json");
        const data: PostpartumData = await response.json();
        setAllCenters(data.centers || []);
      } catch (err) {
        console.error("Failed to fetch postpartum center data:", err);
      }
    };
    fetchData();
  }, []);

  // 3. Geocode address and find nearby centers
  useEffect(() => {
    if (mapLoaded && address && allCenters.length > 0) {
      const geocoder: KakaoGeocoder = new window.kakao.maps.services.Geocoder();
      geocoder.addressSearch(address, (result: any, status: any) => {
        if (status === window.kakao.maps.services.Status.OK) {
          const lat = parseFloat(result[0].y);
          const lng = parseFloat(result[0].x);
          setUserCoords({ lat, lng });

          // Calculate distances and filter nearby centers (only those with coords)
          const radius = 50; // Search radius 50km
          const nearby = allCenters
            .filter((center) => center.lat && center.lng) // Filter out centers without coordinates
            .map((center) => ({
              ...center,
              distance: calculateDistance(lat, lng, center.lat!, center.lng!),
            }))
            .filter((center) => center.distance <= radius)
            .sort((a, b) => a.distance - b.distance);

          setNearbyCenters(nearby);
        } else {
          console.error("Geocoding failed for address:", address);
          // If geocoding fails, still show all centers without distance?
          // For now, clear nearby list if user location unknown
          setNearbyCenters([]);
        }
        setLoading(false); // Stop loading after geocoding and filtering
      });
    } else if (allCenters.length > 0) {
      // If map not ready or no address, show all centers (no distance calculated)
      // This might be too many, consider adding pagination or region filter later
      // setNearbyCenters(allCenters);
      setLoading(false);
    }
  }, [mapLoaded, address, allCenters]);

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

  // 5. Update map markers and center
  useEffect(() => {
    if (mapInstance && userCoords) {
      if (activeInfoWindow) {
        activeInfoWindow.close();
        setActiveInfoWindow(null);
      }

      const userPosition = new window.kakao.maps.LatLng(
        userCoords.lat,
        userCoords.lng
      );
      mapInstance.setCenter(userPosition);
      mapInstance.setLevel(8, { animate: true }); // Wider zoom for 50km radius

      // Add user marker
      new window.kakao.maps.Marker({
        map: mapInstance,
        position: userPosition,
        image: new window.kakao.maps.MarkerImage(
          "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png",
          new window.kakao.maps.Size(24, 35)
        ),
      });

      // Add markers for nearby centers (that have coordinates)
      nearbyCenters.forEach((center) => {
        if (!center.lat || !center.lng) return; // Skip if no coords

        const markerPosition = new window.kakao.maps.LatLng(
          center.lat,
          center.lng
        );
        const marker = new window.kakao.maps.Marker({
          map: mapInstance,
          position: markerPosition,
          title: center.name,
        });

        // Info window content
        const content = `
          <div style="padding:10px; width: 250px; font-size: 12px; line-height: 1.4;">
            <div style="font-weight: bold; margin-bottom: 5px; font-size: 14px;">${
              center.name
            }</div>
            <div>${center.address}</div>
            ${center.phone ? `<div>연락처: ${center.phone}</div>` : ""}
            <div style="margin-top: 5px;">
              정원: 산모 ${center.motherCapacity} / 영유아 ${
          center.infantCapacity
        }
            </div>
             ${
               center.nurseCount !== null
                 ? `<div>간호사: ${center.nurseCount}명</div>`
                 : ""
             }
             ${
               center.nurseAidCount !== null
                 ? `<div>간호조무사: ${center.nurseAidCount}명</div>`
                 : ""
             }
             ${
               center.distance !== undefined
                 ? `<div>거리: ${center.distance.toFixed(2)}km</div>`
                 : ""
             }
          </div>
        `;

        const infowindow = new window.kakao.maps.InfoWindow({
          content: content,
          removable: true,
        });

        window.kakao.maps.event.addListener(marker, "click", () => {
          if (activeInfoWindow) {
            activeInfoWindow.close();
          }
          infowindow.open(mapInstance, marker);
          setActiveInfoWindow(infowindow);
        });
      });
    }
  }, [mapInstance, userCoords, nearbyCenters, activeInfoWindow]);

  // Determine displayed centers based on user location availability
  const displayCenters = userCoords
    ? nearbyCenters
    : allCenters.filter((c) => c.lat && c.lng); // Show nearby if location known, else all with coords
  const noResultsMessage = userCoords
    ? "설정된 주소 50km 내에 산후조리원 정보가 없습니다."
    : "위치 정보가 없거나 주변에 산후조리원 정보가 없습니다."; // Or maybe just show all without coords?
  const resultsMessage = userCoords
    ? `현재 위치 기준 50km 내 ${nearbyCenters.length}개 산후조리원 검색 결과:`
    : `전체 ${
        allCenters.filter((c) => c.lat && c.lng).length
      }개 산후조리원 검색 결과 (위치 기반 필터링 불가):`;

  return (
    <div className="flex flex-col h-screen w-full max-w-md mx-auto bg-[#FFFAF0]">
      {/* Header */}
      <MapHeaderBar title="산후조리원 정보" />

      {/* Map container */}
      <div className="relative w-full z-0 bg-gray-100 h-[400px] min-h-[320px] max-h-[500px] flex-none">
        <div ref={mapContainerRef} className="w-full h-full" />
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-500 mx-auto mb-2"></div>
              <p className="text-gray-700 font-['Do_Hyeon']">
                지도를 불러오는 중...
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Loading or Results Area */}
      {loading ? (
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
          <span className="ml-3 font-['Do_Hyeon'] text-gray-700">
            데이터 로딩 중...
          </span>
        </div>
      ) : (
        <div className="flex-grow overflow-y-auto p-4 space-y-3">
          {displayCenters.length === 0 ? (
            <div className="text-center pt-10 font-['Do_Hyeon'] text-gray-500">
              {noResultsMessage}
            </div>
          ) : (
            <>
              <div className="mb-2 text-sm font-['Do_Hyeon'] text-gray-600">
                {resultsMessage}
              </div>
              {displayCenters.map((center) => (
                <div
                  key={center.id}
                  className="bg-white p-3.5 rounded-xl shadow-sm border border-gray-200"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 pr-3">
                      <h3 className="text-md font-['Do_Hyeon'] text-pink-700 mb-0.5">
                        {center.name}
                      </h3>
                      <p className="text-xs text-gray-700 mt-1.5 font-['Do_Hyeon']">
                        {center.address}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 font-['Do_Hyeon']">
                        정원: 산모 {center.motherCapacity}명 / 영유아{" "}
                        {center.infantCapacity}명
                        {center.nurseCount !== null &&
                          ` | 간호사 ${center.nurseCount}명`}
                        {center.nurseAidCount !== null &&
                          ` | 조무사 ${center.nurseAidCount}명`}
                      </p>
                      {center.distance !== undefined && (
                        <p className="text-xs text-blue-600 font-bold font-['Do_Hyeon'] mt-1">
                          거리: {center.distance.toFixed(2)} km
                        </p>
                      )}
                    </div>
                    {/* Action buttons */}
                    <div className="flex flex-col space-y-1.5 flex-shrink-0">
                      {center.phone && (
                        <a
                          href={`tel:${center.phone}`}
                          className="inline-flex items-center justify-center px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-['Do_Hyeon'] hover:bg-blue-200 transition-colors whitespace-nowrap"
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
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.31l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.31-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                          </svg>
                          {center.phone}
                        </a>
                      )}
                      <a
                        href={`https://map.kakao.com/link/search/${encodeURIComponent(
                          center.address
                        )}`} // Search by address
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center px-2.5 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-['Do_Hyeon'] hover:bg-yellow-200 transition-colors whitespace-nowrap"
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
                            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 16.382V5.618a1 1 0 00-1.447-.894L15 7m0 10V7m0 10l-6 3"
                          />
                        </svg>
                        길찾기
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
