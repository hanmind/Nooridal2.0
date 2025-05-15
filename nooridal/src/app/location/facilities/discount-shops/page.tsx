"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface DiscountShop {
  id: string;
  region: string;
  category: string;
  name: string;
  address: string;
  phone: string;
  discountInfo: string;
  discountType: string;
  lat: number | null;
  lng: number | null;
  updatedAt: string;
  sourceFile: string;
  dataType: string;
}

interface DiscountShopData {
  totalCount: number;
  shops: DiscountShop[];
  shopsByRegion: { [region: string]: DiscountShop[] };
  shopsByCategory: { [category: string]: DiscountShop[] };
  meta: {
    description: string;
    source: string;
    lastUpdated: string;
  };
}

export default function DiscountShopsPage() {
  const router = useRouter();
  const [shopData, setShopData] = useState<DiscountShopData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredShops, setFilteredShops] = useState<DiscountShop[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [regions, setRegions] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/data/discount_shops.json");
        const data: DiscountShopData = await response.json();
        setShopData(data);
        setRegions(Object.keys(data.shopsByRegion));
        setCategories(Object.keys(data.shopsByCategory));
        setFilteredShops(data.shops);
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!shopData) return;
    let filtered = shopData.shops;
    if (selectedRegion !== "all") {
      filtered = shopData.shopsByRegion[selectedRegion] || [];
    }
    if (selectedCategory !== "all") {
      filtered = filtered.filter((shop) => shop.category === selectedCategory);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (shop) =>
          shop.name.toLowerCase().includes(term) ||
          shop.address.toLowerCase().includes(term) ||
          shop.discountInfo.toLowerCase().includes(term)
      );
    }
    setFilteredShops(filtered);
  }, [searchTerm, selectedRegion, selectedCategory, shopData]);

  return (
    <div className="min-h-screen w-full bg-[#FFF4BB] flex justify-center items-center">
      <div className="w-96 h-[900px] relative bg-[#FFF4BB] overflow-auto flex flex-col">
        {/* 헤더 */}
        <div className="sticky top-0 left-0 right-0 w-full h-[100px] sm:h-[120px] flex items-center justify-center bg-white shadow-md rounded-b-3xl z-10 flex-shrink-0">
          <button
            onClick={() => router.back()}
            className="absolute left-[24px] top-1/2 -translate-y-1/2 flex items-center justify-center text-neutral-700 hover:text-yellow-600 transition-colors z-20"
            title="뒤로 가기"
            aria-label="뒤로 가기"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <div className="relative w-full text-center">
            <span className="text-neutral-700 text-2xl font-normal font-['Do_Hyeon'] leading-[50px]">
              임신부/가족 배려 할인업소
            </span>
          </div>
        </div>

        {/* 검색 및 필터 영역 */}
        <div className="px-4 mt-6 mb-4 flex-shrink-0">
          <div className="p-4 bg-white rounded-xl shadow-sm">
            <input
              type="text"
              placeholder="업소명, 주소, 할인정보 검색"
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
                  onClick={() => setSelectedRegion("all")}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-['Do_Hyeon'] transition-colors ${
                    selectedRegion === "all"
                      ? "bg-blue-500 text-white shadow-md"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  전체
                </button>
                {regions.map((region) => (
                  <button
                    key={region}
                    onClick={() => setSelectedRegion(region)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-['Do_Hyeon'] transition-colors ${
                      selectedRegion === region
                        ? "bg-blue-500 text-white shadow-md"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {region}
                  </button>
                ))}
              </div>
            </div>
            {/* 업종 필터 */}
            <div>
              <div className="text-sm font-['Do_Hyeon'] mb-1.5 text-gray-700">
                업종 선택
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-['Do_Hyeon'] transition-colors ${
                    selectedCategory === "all"
                      ? "bg-yellow-500 text-white shadow-md"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  전체
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-['Do_Hyeon'] transition-colors ${
                      selectedCategory === category
                        ? "bg-yellow-500 text-white shadow-md"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 업소 리스트 */}
        <div className="px-4 pb-6 flex-grow overflow-y-auto">
          {loading ? (
            <div className="text-center mt-10 font-['Do_Hyeon'] text-gray-600">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
              <div>정보를 불러오는 중입니다...</div>
            </div>
          ) : filteredShops.length === 0 ? (
            <div className="text-center mt-10 font-['Do_Hyeon'] text-gray-500">
              조건에 맞는 할인업소 정보가 없습니다.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredShops.map((shop) => (
                <div
                  key={shop.id}
                  className="bg-white p-3.5 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3 mt-1 bg-yellow-100 rounded-full p-2.5">
                      <span className="text-xl">🏪</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-md font-['Do_Hyeon'] text-yellow-700 mb-0.5">
                        {shop.name}
                      </h3>
                      <p className="text-xs text-gray-500 font-['Do_Hyeon']">
                        {shop.region} / {shop.category}
                      </p>
                      <p className="text-xs text-gray-700 mt-1.5 font-['Do_Hyeon']">
                        {shop.address}
                      </p>
                      {shop.discountInfo &&
                        (shop.discountInfo.endsWith(" 서비스") ||
                        shop.discountInfo.endsWith(" 혜택") ? (
                          <div className="mt-2 text-xs font-['Do_Hyeon'] text-gray-600">
                            <span className="font-bold text-yellow-600">
                              할인 제공
                            </span>{" "}
                            (가게 문의)
                          </div>
                        ) : (
                          <div className="mt-2 text-xs font-['Do_Hyeon'] text-gray-800">
                            {/* <span className="font-bold text-yellow-600">{shop.discountType}</span> - {shop.discountInfo} */}
                            <span className="font-bold text-yellow-600">
                              {shop.discountInfo}
                            </span>
                          </div>
                        ))}
                      <div className="mt-3 flex items-center space-x-2">
                        {shop.phone && (
                          <a
                            href={`tel:${shop.phone}`}
                            className="flex items-center text-sm text-blue-600 font-['Do_Hyeon']"
                            style={{ minWidth: "90px" }}
                          >
                            <span className="mr-1">📞</span>
                            {shop.phone}
                          </a>
                        )}
                        <a
                          href={`https://map.kakao.com/link/search/${encodeURIComponent(
                            shop.address
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
