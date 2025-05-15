"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import HeaderBar from "@/app/components/HeaderBar";

// 병상수 인터페이스
interface BedCountClinic {
  id: string;
  name: string;
  type: string; // 병원 유형 (예: 의원, 병원, 종합병원)
  province: string; // 시도
  address: string;
  phone: string;
  bedCounts: {
    delivery: number; // 분만실병상수
    nicu: number; // 신생아중환자병상수
    premium: number; // 일반입원실상급병상수
    general: number; // 일반입원실일반병상수
    operation: number; // 수술실병상수
    emergency: number; // 응급실병상수
  };
}

interface BedCountData {
  totalCount: number;
  facilities: BedCountClinic[];
  facilitiesByProvince: {
    [province: string]: BedCountClinic[];
  };
  facilitiesByType: {
    [type: string]: BedCountClinic[];
  };
  meta: {
    description: string;
    source: string;
    lastUpdated: string;
  };
}

export default function BedCountClinicsPage() {
  const router = useRouter();
  const [clinicsData, setClinicsData] = useState<BedCountData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredClinics, setFilteredClinics] = useState<BedCountClinic[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string>("all");
  const [selectedBedType, setSelectedBedType] = useState<string>("all"); // "all", "delivery", "nicu", "premium", "general", "operation", "emergency"
  const [provinces, setProvinces] = useState<string[]>([]);
  const [showInfoPopup, setShowInfoPopup] = useState(false);

  const bedTypeOptions = [
    { id: "all", name: "전체 병상" },
    { id: "delivery", name: "분만실" },
    { id: "nicu", name: "신생아중환자" },
    { id: "premium", name: "상급병상" },
    { id: "general", name: "일반병상" },
    { id: "operation", name: "수술실" },
    { id: "emergency", name: "응급실" },
  ];

  // 페이지 로드 시 데이터 불러오기
  useEffect(() => {
    const fetchClinicsData = async () => {
      try {
        const response = await fetch("/data/detailed_bed_count.json");
        const data: BedCountData = await response.json();
        setClinicsData(data);

        const provinceList = Object.keys(data.facilitiesByProvince || {});
        setProvinces(provinceList);

        setFilteredClinics(data.facilities || []);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch bed count data:", error);
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

    if (selectedBedType !== "all") {
      filtered = filtered.filter((clinic) => {
        return (
          clinic.bedCounts[selectedBedType as keyof typeof clinic.bedCounts] > 0
        );
      });
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (clinic) =>
          clinic.name.toLowerCase().includes(term) ||
          clinic.address.toLowerCase().includes(term)
      );
    }

    setFilteredClinics(filtered);
  }, [searchTerm, selectedProvince, selectedBedType, clinicsData]);

  const handleCall = (phone: string) => {
    if (phone) window.location.href = `tel:${phone.replace(/─/g, "-")}`;
  };

  const handleMap = (address: string) => {
    if (address)
      window.open(
        `https://map.kakao.com/link/search/${encodeURIComponent(address)}`,
        "_blank"
      );
  };

  // 병상 수에 따라 색상 클래스 반환
  const getBedCountColorClass = (count: number) => {
    if (count === 0) return "bg-gray-100 text-gray-500";
    if (count < 3) return "bg-yellow-100 text-yellow-700";
    if (count < 6) return "bg-green-100 text-green-700";
    return "bg-blue-100 text-blue-700";
  };

  return (
    <div className="min-h-screen w-full bg-[#FFF4BB]">
      <div className="w-full h-[900px] relative bg-[#FFF4BB] overflow-auto flex flex-col">
        {/* 헤더 */}
        <HeaderBar title="병상수 정보" backUrl="/location/hospital" />

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
              <div className="text-sm font-['Do_Hyeon'] mb-1.5 text-gray-700">
                지역 선택
              </div>
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
                {provinces.map((province) => (
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

            {/* 병상 유형 필터 */}
            <div>
              <div className="text-sm font-['Do_Hyeon'] mb-1.5 text-gray-700">
                병상 유형 선택
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {bedTypeOptions.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedBedType(type.id)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-['Do_Hyeon'] transition-colors ${
                      selectedBedType === type.id
                        ? type.id === "delivery"
                          ? "bg-pink-500 text-white shadow-md"
                          : type.id === "nicu"
                          ? "bg-blue-500 text-white shadow-md"
                          : type.id === "premium"
                          ? "bg-purple-500 text-white shadow-md"
                          : type.id === "general"
                          ? "bg-green-500 text-white shadow-md"
                          : type.id === "operation"
                          ? "bg-yellow-500 text-white shadow-md"
                          : type.id === "emergency"
                          ? "bg-red-500 text-white shadow-md"
                          : "bg-gray-700 text-white shadow-md"
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
              {filteredClinics.map((clinic) => (
                <div
                  key={clinic.id}
                  className="bg-white p-3.5 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3 mt-1 bg-blue-50 rounded-full p-2.5">
                      <span className="text-xl">🏥</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-md font-['Do_Hyeon'] text-blue-700 mb-0.5">
                        {clinic.name}
                      </h3>
                      <p className="text-xs text-gray-700 mt-1.5 font-['Do_Hyeon']">
                        {clinic.address}
                      </p>

                      {/* 병상 정보 */}
                      <div className="mt-2 grid grid-cols-3 gap-1.5">
                        {clinic.bedCounts.delivery > 0 && (
                          <span
                            className={`px-1.5 py-0.5 ${getBedCountColorClass(
                              clinic.bedCounts.delivery
                            )} rounded-full text-[10px] font-['Do_Hyeon'] text-center`}
                          >
                            분만실: {clinic.bedCounts.delivery}
                          </span>
                        )}
                        {clinic.bedCounts.nicu > 0 && (
                          <span
                            className={`px-1.5 py-0.5 ${getBedCountColorClass(
                              clinic.bedCounts.nicu
                            )} rounded-full text-[10px] font-['Do_Hyeon'] text-center`}
                          >
                            신생아중환자: {clinic.bedCounts.nicu}
                          </span>
                        )}
                        {clinic.bedCounts.premium > 0 && (
                          <span
                            className={`px-1.5 py-0.5 ${getBedCountColorClass(
                              clinic.bedCounts.premium
                            )} rounded-full text-[10px] font-['Do_Hyeon'] text-center`}
                          >
                            상급병상: {clinic.bedCounts.premium}
                          </span>
                        )}
                        {clinic.bedCounts.general > 0 && (
                          <span
                            className={`px-1.5 py-0.5 ${getBedCountColorClass(
                              clinic.bedCounts.general
                            )} rounded-full text-[10px] font-['Do_Hyeon'] text-center`}
                          >
                            일반병상: {clinic.bedCounts.general}
                          </span>
                        )}
                        {clinic.bedCounts.operation > 0 && (
                          <span
                            className={`px-1.5 py-0.5 ${getBedCountColorClass(
                              clinic.bedCounts.operation
                            )} rounded-full text-[10px] font-['Do_Hyeon'] text-center`}
                          >
                            수술실: {clinic.bedCounts.operation}
                          </span>
                        )}
                        {clinic.bedCounts.emergency > 0 && (
                          <span
                            className={`px-1.5 py-0.5 ${getBedCountColorClass(
                              clinic.bedCounts.emergency
                            )} rounded-full text-[10px] font-['Do_Hyeon'] text-center`}
                          >
                            응급실: {clinic.bedCounts.emergency}
                          </span>
                        )}
                      </div>

                      <div className="mt-3 flex items-center justify-end space-x-1.5">
                        {clinic.phone && clinic.phone !== "비공개" && (
                          <a
                            href={`tel:${clinic.phone}`}
                            className="flex items-center text-sm text-blue-600 font-['Do_Hyeon']"
                            style={{ minWidth: "90px" }}
                          >
                            <span className="mr-1">📞</span>
                            {clinic.phone}
                          </a>
                        )}
                        <a
                          href={`https://map.kakao.com/link/search/${encodeURIComponent(
                            clinic.address
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-sm text-green-600 bg-green-50 px-3 py-1 rounded-lg font-['Do_Hyeon']"
                          style={{ minWidth: "90px" }}
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
      </div>
    </div>
  );
}
