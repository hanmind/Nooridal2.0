"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAddress } from "@/app/context/AddressContext";

interface Center {
  id: string;
  province: string;
  city: string;
  name: string;
  phone: string;
  address: string;
}

interface CentersData {
  totalCount: number;
  centers: Center[];
  centersByProvince: {
    [province: string]: Center[];
  };
  meta: {
    description: string;
    source: string;
    lastUpdated: string;
  };
}

export default function CentersPage() {
  const router = useRouter();
  const { address } = useAddress();
  const [centersData, setCentersData] = useState<CentersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCenters, setFilteredCenters] = useState<Center[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string>("all");
  const [provinces, setProvinces] = useState<string[]>([]);
  const [showInfoPopup, setShowInfoPopup] = useState(false);

  // 페이지 로드 시 데이터 불러오기
  useEffect(() => {
    const fetchCentersData = async () => {
      try {
        const response = await fetch('/data/women_reemployment_centers.json');
        const data = await response.json();
        setCentersData(data);
        
        // 시도 목록 생성
        const provinceList = Object.keys(data.centersByProvince);
        setProvinces(provinceList);
        
        // 처음에는 모든 센터 표시
        setFilteredCenters(data.centers);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch centers data:', error);
        setLoading(false);
      }
    };

    fetchCentersData();
  }, []);

  // 검색어 또는 선택된 지역이 변경될 때 필터링
  useEffect(() => {
    if (!centersData) return;

    let filtered: Center[];
    
    // 지역으로 먼저 필터링
    if (selectedProvince === "all") {
      filtered = centersData.centers;
    } else {
      filtered = centersData.centersByProvince[selectedProvince] || [];
    }
    
    // 검색어로 추가 필터링
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(center => 
        center.name.toLowerCase().includes(term) || 
        center.address.toLowerCase().includes(term) ||
        center.city.toLowerCase().includes(term)
      );
    }
    
    setFilteredCenters(filtered);
  }, [searchTerm, selectedProvince, centersData]);

  return (
    <div className="min-h-screen w-full bg-[#FFF4BB] flex justify-center items-center">
      <div className="w-96 h-[900px] relative bg-[#FFF4BB] overflow-auto">
        {/* 헤더 */}
        <div className="sticky top-0 left-0 right-0 w-full h-[140px] flex items-center justify-center bg-white shadow-md rounded-b-3xl mt-[-10px] z-10">
          <button 
            onClick={() => router.back()}
            className="absolute left-[24px] top-[63px] text-center justify-start text-neutral-700 text-2xl font-normal font-['Inter'] leading-[50px]"
          >
            &lt;
          </button>
          <div className="relative w-full text-center">
            <span className="text-neutral-700 text-2xl font-normal font-['Do_Hyeon'] leading-[50px]">
              여성새로일하기센터
            </span>
            <button 
              onClick={() => setShowInfoPopup(true)}
              className="absolute right-[24px] top-[12px] w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 text-sm"
            >
              ?
            </button>
          </div>
        </div>

        {/* 검색 및 필터 영역 */}
        <div className="px-4 mt-6 mb-4">
          <div className="p-4 bg-white rounded-xl shadow-sm">
            <input
              type="text"
              placeholder="센터명 또는 주소 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 mb-2 rounded-lg border border-gray-300 font-['Do_Hyeon']"
            />
            
            <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
              <button
                onClick={() => setSelectedProvince("all")}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-['Do_Hyeon'] ${
                  selectedProvince === "all" 
                    ? "bg-yellow-400 text-white" 
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                전체
              </button>
              
              {provinces.map(province => (
                <button
                  key={province}
                  onClick={() => setSelectedProvince(province)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-['Do_Hyeon'] ${
                    selectedProvince === province 
                      ? "bg-yellow-400 text-white" 
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {province}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 센터 목록 */}
        <div className="px-4 pb-24">
          {loading ? (
            <div className="text-center mt-10 font-['Do_Hyeon']">
              로딩 중...
            </div>
          ) : filteredCenters.length === 0 ? (
            <div className="text-center mt-10 font-['Do_Hyeon']">
              검색 결과가 없습니다.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCenters.map(center => (
                <div key={center.id} className="bg-white p-4 rounded-2xl shadow-sm">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3 mt-1 bg-yellow-100 rounded-full p-2">
                      <span className="text-xl">🏢</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-['Do_Hyeon']">{center.name}</h3>
                      <p className="text-sm text-gray-600 mt-1 font-['Do_Hyeon']">
                        {center.province} {center.city}
                      </p>
                      <p className="text-sm text-gray-800 mt-2 font-['Do_Hyeon']">
                        {center.address}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <a
                          href={`tel:${center.phone}`}
                          className="flex items-center text-sm text-blue-600 font-['Do_Hyeon']"
                        >
                          <span className="mr-1">📞</span>
                          {center.phone}
                        </a>
                        <a
                          href={`https://map.kakao.com/link/search/${encodeURIComponent(center.address)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-sm text-green-600 bg-green-50 px-3 py-1 rounded-lg font-['Do_Hyeon']"
                        >
                          <span className="mr-1">🗺️</span>
                          지도보기
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* 센터 정보 팝업 */}
        {showInfoPopup && (
          <div className="fixed inset-0 flex items-center justify-center z-40">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowInfoPopup(false)} />
            <div className="relative bg-[#FFF4F4] rounded-3xl shadow-lg p-6 w-[370px] max-h-[80vh] overflow-y-auto border-4 border-yellow-200">
              <div className="flex flex-col items-center mb-2">
                <div className="text-xl font-['Do_Hyeon'] text-yellow-600 mb-2 flex items-center">
                  <span className="mr-2">🏢</span> 여성새로일하기센터란?
                </div>
              </div>
              <div className="text-left text-sm font-['Do_Hyeon'] text-gray-700 space-y-3">
                <div>
                  <span className="font-bold text-yellow-600">여성새로일하기센터</span><br/>
                  육아, 가사 등으로 경력이 단절된 여성의 취업지원을 위해 취업상담, 직업교육훈련, 인턴십, 취업 후 사후관리 등 종합적인 취업지원 서비스를 제공하는 기관입니다.
                </div>
                <div>
                  <span className="font-bold text-yellow-600">주요 서비스</span>
                  <ul className="list-disc ml-4 mt-1">
                    <li>취업상담 및 취업알선</li>
                    <li>직업교육훈련</li>
                    <li>새일여성인턴 연계</li>
                    <li>취업 후 사후관리 서비스</li>
                    <li>집단상담 프로그램</li>
                  </ul>
                </div>
                <div>
                  <span className="font-bold text-yellow-600">이용 방법</span><br/>
                  전국 새일센터에 직접 방문하거나 전화로 상담 예약<br/>
                  <span className="text-red-500">대표전화: ☎ 1544-1199</span>
                </div>
              </div>
              <button
                onClick={() => setShowInfoPopup(false)}
                className="absolute top-2 right-2 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center hover:bg-yellow-200 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 