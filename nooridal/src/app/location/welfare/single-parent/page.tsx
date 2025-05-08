"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAddress } from "@/app/context/AddressContext";

interface Facility {
  id: string;
  type: string;
  province: string;
  name: string;
  capacity: string;
  unit: string;
  phone: string;
}

interface FacilitiesData {
  totalCount: number;
  facilities: Facility[];
  facilitiesByType: {
    [type: string]: Facility[];
  };
  facilitiesByProvince: {
    [province: string]: Facility[];
  };
  meta: {
    description: string;
    source: string;
    lastUpdated: string;
  };
}

export default function SingleParentFacilitiesPage() {
  const router = useRouter();
  const { address } = useAddress();
  const [facilitiesData, setFacilitiesData] = useState<FacilitiesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredFacilities, setFilteredFacilities] = useState<Facility[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [provinces, setProvinces] = useState<string[]>([]);
  const [facilityTypes, setFacilityTypes] = useState<string[]>([]);
  const [showInfoPopup, setShowInfoPopup] = useState(false);

  // 페이지 로드 시 데이터 불러오기
  useEffect(() => {
    const fetchFacilitiesData = async () => {
      try {
        const response = await fetch('/data/single_parent_family_welfare_facilities.json');
        const data = await response.json();
        setFacilitiesData(data);
        
        // 시도 목록 생성
        const provinceList = Object.keys(data.facilitiesByProvince);
        setProvinces(provinceList);
        
        // 시설 유형 목록 생성
        const typeList = Object.keys(data.facilitiesByType);
        setFacilityTypes(typeList);
        
        // 처음에는 모든 시설 표시
        setFilteredFacilities(data.facilities);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch facilities data:', error);
        setLoading(false);
      }
    };

    fetchFacilitiesData();
  }, []);

  // 검색어 또는 선택된 지역/유형이 변경될 때 필터링
  useEffect(() => {
    if (!facilitiesData) return;

    let filtered: Facility[];
    
    // 지역으로 먼저 필터링
    if (selectedProvince === "all") {
      filtered = facilitiesData.facilities;
    } else {
      filtered = facilitiesData.facilitiesByProvince[selectedProvince] || [];
    }
    
    // 시설 유형으로 추가 필터링
    if (selectedType !== "all") {
      filtered = filtered.filter(facility => facility.type === selectedType);
    }
    
    // 검색어로 추가 필터링
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(facility => 
        facility.name.toLowerCase().includes(term) || 
        facility.province.toLowerCase().includes(term)
      );
    }
    
    setFilteredFacilities(filtered);
  }, [searchTerm, selectedProvince, selectedType, facilitiesData]);

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
              한부모가족복지시설
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
              placeholder="시설명 또는 지역 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 mb-2 rounded-lg border border-gray-300 font-['Do_Hyeon']"
            />
            
            {/* 지역 필터 */}
            <div className="mb-2">
              <div className="text-sm font-['Do_Hyeon'] mb-1 text-gray-700">지역</div>
              <div className="flex gap-2 overflow-x-auto pb-2">
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
            
            {/* 시설 유형 필터 */}
            <div>
              <div className="text-sm font-['Do_Hyeon'] mb-1 text-gray-700">시설 유형</div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                <button
                  onClick={() => setSelectedType("all")}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-['Do_Hyeon'] ${
                    selectedType === "all" 
                      ? "bg-purple-400 text-white" 
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  전체
                </button>
                
                {facilityTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-['Do_Hyeon'] ${
                      selectedType === type 
                        ? "bg-purple-400 text-white" 
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 시설 목록 */}
        <div className="px-4 pb-24">
          {loading ? (
            <div className="text-center mt-10 font-['Do_Hyeon']">
              로딩 중...
            </div>
          ) : filteredFacilities.length === 0 ? (
            <div className="text-center mt-10 font-['Do_Hyeon']">
              검색 결과가 없습니다.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFacilities.map(facility => (
                <div key={facility.id} className="bg-white p-4 rounded-2xl shadow-sm">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3 mt-1 bg-purple-100 rounded-full p-2">
                      <span className="text-xl">
                        {facility.type === "출산지원시설" ? "👶" : 
                         facility.type === "양육지원시설" ? "👨‍👧" : 
                         facility.type === "생활지원시설" ? "🏠" : 
                         facility.type === "일시지원복지시설(비공개)" ? "🔒" : 
                         facility.type === "한부모가족복지상담소" ? "💬" : "🏢"}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-['Do_Hyeon']">{facility.name}</h3>
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full font-['Do_Hyeon']">
                          {facility.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 font-['Do_Hyeon']">
                        {facility.province}
                      </p>
                      <div className="mt-2 flex justify-between items-center">
                        <div className="text-sm text-gray-700 font-['Do_Hyeon']">
                          {facility.capacity && facility.unit ? 
                            `정원: ${facility.capacity} ${facility.unit}` : 
                            "정원: 정보 없음"}
                        </div>
                        {facility.phone && facility.phone !== '비공개' && (
                          <a
                            href={`tel:${facility.phone.replace(/─/g, '-')}`}
                            className="flex items-center text-sm text-blue-600 font-['Do_Hyeon']"
                          >
                            <span className="mr-1">📞</span>
                            {facility.phone.replace(/─/g, '-')}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* 시설 정보 팝업 */}
        {showInfoPopup && (
          <div className="fixed inset-0 flex items-center justify-center z-40">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowInfoPopup(false)} />
            <div className="relative bg-[#FFF4F4] rounded-3xl shadow-lg p-6 w-[370px] max-h-[80vh] overflow-y-auto border-4 border-purple-200">
              <div className="flex flex-col items-center mb-2">
                <div className="text-xl font-['Do_Hyeon'] text-purple-600 mb-2 flex items-center">
                  <span className="mr-2">👨‍👧</span> 한부모가족복지시설이란?
                </div>
              </div>
              <div className="text-left text-sm font-['Do_Hyeon'] text-gray-700 space-y-3">
                <div>
                  <span className="font-bold text-purple-600">한부모가족복지시설</span><br/>
                  한부모가족복지시설은 한부모가족이 건강하고 문화적인 생활을 영위할 수 있도록 제공하는 다양한 복지시설입니다. 
                </div>
                <div>
                  <span className="font-bold text-purple-600">시설 유형</span>
                  <ul className="list-disc ml-4 mt-1">
                    <li><b>출산지원시설</b>: 미혼모의 임신과 출산, 양육을 지원</li>
                    <li><b>양육지원시설</b>: 한부모가 유아·아동의 양육 어려움을 해소하고 자립 지원</li>
                    <li><b>생활지원시설</b>: 한부모와 그 자녀가 함께 일정 기간 생활하면서 자립 준비</li>
                    <li><b>일시지원복지시설</b>: 한부모가 일시적으로 보호와 숙식 제공이 필요한 경우 지원</li>
                    <li><b>한부모가족복지상담소</b>: 한부모가족에 대한 상담 및 정보 제공</li>
                  </ul>
                </div>
                <div>
                  <span className="font-bold text-purple-600">지원 내용</span><br/>
                  <ul className="list-disc ml-4 mt-1">
                    <li>주거 및 숙식 제공</li>
                    <li>아동의 양육 및 교육 지원</li>
                    <li>직업교육 및 자립 지원</li>
                    <li>심리적·정서적 지원 및 상담</li>
                    <li>의료 및 법률 지원</li>
                  </ul>
                </div>
                <div>
                  <span className="font-bold text-purple-600">이용 방법</span><br/>
                  가까운 시·군·구청 한부모가족 담당부서, 관할 읍·면·동 주민센터를 통해 신청하거나 해당 시설에 직접 문의
                </div>
              </div>
              <button
                onClick={() => setShowInfoPopup(false)}
                className="absolute top-2 right-2 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center hover:bg-purple-200 transition-colors"
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