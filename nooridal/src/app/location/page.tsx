// 위치 페이지
"use client";

import { useRouter } from "next/navigation";
import { useAddress } from "@/app/context/AddressContext";
import { useState, useEffect } from "react";
import TabBar from "../components/TabBar";
import HeaderBar from "../components/HeaderBar";

// Define the Tab type
export type Tab = "chat" | "calendar" | "location" | "mypage";

// 카카오맵 타입 정의
declare global {
  interface Window {
    kakao: any;
  }
}

export default function LocationPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("location");
  const { address, setAddress } = useAddress();
  const [currentAddress, setCurrentAddress] = useState<string>("");

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

  // 카카오맵 스크립트 로드
  useEffect(() => {
    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&libraries=services&autoload=false`;
    script.async = true;
    script.onload = () => {
      window.kakao.maps.load(() => {
        // 스크립트 로드 완료
      });
    };
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  // 주소 수정 함수
  const handleAddressEdit = async (e: React.MouseEvent) => {
    e.stopPropagation();
    // 현재 위치 가져오기
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          // 카카오맵 API로 주소 가져오기
          const geocoder = new window.kakao.maps.services.Geocoder();
          const coord = new window.kakao.maps.LatLng(latitude, longitude);

          geocoder.coord2Address(
            coord.getLng(),
            coord.getLat(),
            (result: any, status: any) => {
              if (status === window.kakao.maps.services.Status.OK) {
                const address = result[0].address.address_name;
                setCurrentAddress(address);
              } else {
                alert("주소를 가져올 수 없습니다.");
              }
            }
          );
        },
        (error) => {
          alert("현재 위치를 가져올 수 없습니다.");
        }
      );
    } else {
      alert("이 브라우저에서는 위치 정보가 지원되지 않습니다.");
    }
  };

  const handleTabClick = (tab: string) => {
    setActiveTab(tab as Tab);
    if (tab === "chat") {
      router.push("/agent");
    } else if (tab === "calendar") {
      router.push("/calendar");
    } else if (tab === "location") {
      router.push("/location");
    } else if (tab === "mypage") {
      router.push("/mypage");
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#FFF4BB]">
      <div className="w-screen h-[900px] bg-[#FFF4BB]">
        {/* 헤더 */}
        <HeaderBar title="위치" showBackButton={false} />

        {/* 현재 위치 섹션 */}
        <div className="w-full max-w-[360px] mx-auto mt-8 px-2 sm:px-0">
          <div className="bg-white rounded-3xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.30)] shadow-[0px_1px_3px_1px_rgba(0,0,0,0.15)]">
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
                    {currentAddress
                      ? getShortAddress(currentAddress)
                      : getShortAddress(address)}
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
        </div>

        {/* 메뉴 그리드 */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full max-w-[360px] mx-auto mt-8 px-2 sm:px-0">
          {[
            { icon: "🏥", title: "병원", link: "/location/hospital" },
            { icon: "🏪", title: "편의 시설", link: "/location/facilities" },
            { icon: "🚙", title: "이동 지원", link: "/location/transport" },
            { icon: "🎀", title: "복지", link: "/location/welfare" },
          ].map((item, index) => (
            <div
              key={index}
              className="bg-white w-full aspect-square min-h-[100px] min-w-[100px] sm:min-h-[140px] sm:min-w-[140px] p-3 sm:p-6 rounded-[20px] shadow-sm flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => router.push(item.link)}
            >
              <div className="text-3xl mb-2">{item.icon}</div>
              <div className="text-center font-['Do_Hyeon'] whitespace-pre-line">
                {item.title}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* TabBar Component */}
      <div className="fixed bottom-0 left-0 right-0 bg-white">
        <TabBar
          activeTab={activeTab}
          tabs={["chat", "calendar", "location", "mypage"]}
          onTabClick={handleTabClick}
        />
      </div>
    </div>
  );
}
