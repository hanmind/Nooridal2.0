"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

// 기존 HospitalPage의 InfertilityClinic 인터페이스와 동일하게 정의
interface InfertilityClinic {
  id: string;
  name: string;
  type: string; // 병원 유형 (예: 의원, 병원, 종합병원)
  province: string; // 시도
  city: string; // 시군구
  address: string;
  phone: string;
  doctors: number;
  servicesArtificial: boolean;
  servicesInVitro: boolean;
  serviceTypesProvided: string;
}

interface InfertilityData {
  totalCount: number;
  facilities: InfertilityClinic[]; // 키 이름을 facilities로 사용 (JSON 파일 구조에 맞춤)
  facilitiesByProvince: { // 키 이름을 facilitiesByProvince로 사용
    [province: string]: InfertilityClinic[];
  };
  meta: {
    description: string;
    source: string;
    lastUpdated: string;
  };
}

export default function InfertilityClinicsPage() {
  const router = useRouter();
  const [clinicsData, setClinicsData] = useState<InfertilityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredClinics, setFilteredClinics] = useState<InfertilityClinic[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string>("all");
  const [selectedServiceType, setSelectedServiceType] = useState<string>("all"); // "all", "artificial", "inVitro"
  const [provinces, setProvinces] = useState<string[]>([]);
  const [showInfoPopup, setShowInfoPopup] = useState(false);

  const serviceTypeOptions = [
    { id: "all", name: "전체 시술" },
    { id: "artificial", name: "인공수정" },
    { id: "inVitro", name: "체외수정" },
  ];

  // 페이지 로드 시 데이터 불러오기
  useEffect(() => {
    const fetchClinicsData = async () => {
      try {
        const response = await fetch('/data/infertility_hospitals.json');
        const data: InfertilityData = await response.json();
        setClinicsData(data);
        
        const provinceList = Object.keys(data.facilitiesByProvince || {});
        setProvinces(provinceList);
        
        setFilteredClinics(data.facilities || []);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch infertility clinics data:', error);
        setLoading(false);
      }
    };

    fetchClinicsData();
  }, []);

  // 검색어 또는 선택된 필터가 변경될 때 필터링
  useEffect(() => {
    if (!clinicsData) return;

    let filtered = clinicsData.facilities || [];
    
    if (selectedProvince !== "all") {
      filtered = clinicsData.facilitiesByProvince?.[selectedProvince] || [];
    }
    
    if (selectedServiceType !== "all") {
      filtered = filtered.filter(clinic => {
        if (selectedServiceType === "artificial") return clinic.servicesArtificial;
        if (selectedServiceType === "inVitro") return clinic.servicesInVitro;
        return true;
      });
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(clinic => 
        clinic.name.toLowerCase().includes(term) || 
        clinic.address.toLowerCase().includes(term) ||
        (clinic.city && clinic.city.toLowerCase().includes(term))
      );
    }
    
    setFilteredClinics(filtered);
  }, [searchTerm, selectedProvince, selectedServiceType, clinicsData]);

  const handleCall = (phone: string) => {
    if (phone) window.location.href = `tel:${phone.replace(/─/g, '-')}`;
  };

  const handleMap = (address: string) => {
    if (address) window.open(`https://map.kakao.com/link/search/${encodeURIComponent(address)}`, '_blank');
  };

  return (
    <div className="min-h-screen w-full bg-[#FFF4BB] flex justify-center items-center">
      <div className="w-96 h-[900px] relative bg-[#FFF4BB] overflow-auto flex flex-col">
        {/* 헤더 */}
        <div className="sticky top-0 left-0 right-0 w-full h-[140px] flex items-center justify-center bg-white shadow-md rounded-b-3xl z-10 flex-shrink-0">
          <button 
            onClick={() => router.back()}
            className="absolute left-[24px] top-1/2 -translate-y-1/2 text-center justify-start text-neutral-700 text-2xl font-normal font-['Inter'] leading-[50px] z-20"
          >
            &lt;
          </button>
          <div className="relative w-full text-center">
            <span className="text-neutral-700 text-2xl font-normal font-['Do_Hyeon'] leading-[50px]">
              난임시술 병원
            </span>
            {/* 정보 버튼 필요시 추가 */}
            {/* <button 
              onClick={() => setShowInfoPopup(true)}
              className="absolute right-[24px] top-1/2 -translate-y-1/2 w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 text-sm"
            >
              ?
            </button> */}
          </div>
        </div>

        {/* 검색 및 필터 영역 */}
        <div className="px-4 mt-6 mb-4 flex-shrink-0">
          <div className="p-4 bg-white rounded-xl shadow-sm">
            <input
              type="text"
              placeholder="병원명, 주소 등 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 mb-3 rounded-lg border border-gray-300 font-['Do_Hyeon'] text-sm"
            />
            
            {/* 지역 필터 */}
            <div className="mb-3">
              <div className="text-sm font-['Do_Hyeon'] mb-1.5 text-gray-700">지역 선택</div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                <button
                  onClick={() => setSelectedProvince("all")}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-['Do_Hyeon'] transition-colors ${
                    selectedProvince === "all" 
                      ? "bg-blue-500 text-white shadow-md" 
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  전국
                </button>
                {provinces.map(province => (
                  <button
                    key={province}
                    onClick={() => setSelectedProvince(province)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-['Do_Hyeon'] transition-colors ${
                      selectedProvince === province 
                        ? "bg-blue-500 text-white shadow-md" 
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {province}
                  </button>
                ))}
              </div>
            </div>
            
            {/* 시술 유형 필터 */}
            <div>
              <div className="text-sm font-['Do_Hyeon'] mb-1.5 text-gray-700">시술 유형 선택</div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {serviceTypeOptions.map(type => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedServiceType(type.id)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-['Do_Hyeon'] transition-colors ${
                      selectedServiceType === type.id 
                        ? (type.id === "artificial" ? "bg-green-500 text-white shadow-md" : type.id === "inVitro" ? "bg-purple-500 text-white shadow-md" : "bg-gray-700 text-white shadow-md")
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {type.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 병원 목록 */}
        <div className="px-4 pb-6 flex-grow overflow-y-auto">
          {loading ? (
            <div className="text-center mt-10 font-['Do_Hyeon'] text-gray-600">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
              <div>정보를 불러오는 중입니다...</div>
            </div>
          ) : filteredClinics.length === 0 ? (
            <div className="text-center mt-10 font-['Do_Hyeon'] text-gray-500">
              조건에 맞는 병원 정보가 없습니다.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredClinics.map(clinic => (
                <div key={clinic.id} className="bg-white p-3.5 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3 mt-1 bg-blue-50 rounded-full p-2.5">
                      <span className="text-xl">🏥</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-md font-['Do_Hyeon'] text-blue-700 mb-0.5">{clinic.name}</h3>
                      <p className="text-xs text-gray-500 font-['Do_Hyeon']">{clinic.province} {clinic.city} / {clinic.type}</p>
                      <p className="text-xs text-gray-700 mt-1.5 font-['Do_Hyeon']">
                        {clinic.address}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {clinic.servicesArtificial && <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-['Do_Hyeon']">인공</span>}
                          {clinic.servicesInVitro && <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded-full text-[10px] font-['Do_Hyeon']">체외</span>}
                        </div>
                        <div className="flex items-center space-x-1.5">
                          {clinic.phone && clinic.phone !== '비공개' && (
                            <button
                              onClick={() => handleCall(clinic.phone)}
                              className="p-1.5 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors"
                              title="전화걸기"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.018-.991-.053-1.467l-.092-.81a2.25 2.25 0 00-2.348-2.118l-.998.166c-.263.043-.53.043-.792 0l-1.26-.21a2.25 2.25 0 00-2.43-1.558l-1.86.506A2.25 2.25 0 016.23 9.72l-.03-.09a2.25 2.25 0 00-2.348-2.118l-.998.166C.13 7.683 0 8.214 0 8.832v1.372c0 .516.018.991.053 1.467l.092.81a2.25 2.25 0 002.102 2.348h.001z" />
                              </svg>
                            </button>
                          )}
                          <button
                            onClick={() => handleMap(clinic.address)}
                            className="p-1.5 bg-yellow-100 text-yellow-700 rounded-full hover:bg-yellow-200 transition-colors"
                            title="지도보기"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503-6.938l-4.006-4.006a1.125 1.125 0 00-1.591 0L3.754 9.006a1.125 1.125 0 000 1.591l4.006 4.006a1.125 1.125 0 001.591 0l4.006-4.006a1.125 1.125 0 000-1.591z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* 정보 팝업 (필요시 centers/single-parent 페이지 참고하여 구현) */}
        {/* {showInfoPopup && ( ... )} */}
      </div>
    </div>
  );
} 