"use client";

import { useRouter } from "next/navigation";
import { useAddress } from "@/app/context/AddressContext";
import { useState, useEffect } from "react";

interface TransportCenter {
  id: string;
  name: string;
  distance: string;
  address: string;
  phone: string;
  operatingHours: string;
  services: string[];
}

// 더미 데이터
const DUMMY_CENTERS: TransportCenter[] = [
  {
    id: '1',
    name: '행복한 이동센터',
    distance: '0.5km',
    address: '서울시 강남구 역삼동 123-45',
    phone: '02-123-4567',
    operatingHours: '평일 09:00-18:00',
    services: ['휠체어 탑승', '산모 이동', '장애인 이동']
  },
  {
    id: '2',
    name: '맘스터치 이동센터',
    distance: '1.2km',
    address: '서울시 강남구 역삼동 234-56',
    phone: '02-234-5678',
    operatingHours: '평일 08:00-20:00, 주말 09:00-17:00',
    services: ['휠체어 탑승', '산모 이동', '장애인 이동', '노인 이동']
  },
  {
    id: '3',
    name: '24시 이동센터',
    distance: '2.0km',
    address: '서울시 강남구 역삼동 345-67',
    phone: '02-345-6789',
    operatingHours: '24시간',
    services: ['휠체어 탑승', '산모 이동', '장애인 이동', '응급 이동']
  }
];

export default function TransportPage() {
  const router = useRouter();
  const { address } = useAddress();
  const [centers, setCenters] = useState<TransportCenter[]>([]);
  const [selectedService, setSelectedService] = useState<string>('전체');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 더미 데이터를 사용하는 함수
  const fetchTransportCenters = async () => {
    if (!address) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // API 호출 대신 더미 데이터 사용
      // 실제 API 연동 시 아래 주석을 해제하고 사용
      /*
      const apiKey = '3RMiKFjgxis3f86Xb5o3Ah30iv/dXmAni0V7kQUTbIke9XiTZXgyNGjcySlNyuMIRKtMSSgCH7IgbFWdqGEpQQ==';
      const response = await fetch(`https://apis.data.go.kr/B551982/tsdo?serviceKey=${encodeURIComponent(apiKey)}&address=${encodeURIComponent(address)}&type=json`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('데이터를 불러오는데 실패했습니다.');
      }
      
      const data = await response.json();
      
      // API 응답 데이터를 우리 인터페이스에 맞게 변환
      const formattedCenters: TransportCenter[] = data.response.body.items.item.map((item: any) => ({
        id: item.id || String(Math.random()),
        name: item.name || '이름 없음',
        distance: item.distance ? `${item.distance}m` : '거리 정보 없음',
        address: item.address || '주소 정보 없음',
        phone: item.phone || '전화번호 정보 없음',
        operatingHours: item.operatingHours || '운영시간 정보 없음',
        services: item.services ? item.services.split(',') : []
      }));
      
      setCenters(formattedCenters);
      */
      
      // 더미 데이터 사용
      setTimeout(() => {
        setCenters(DUMMY_CENTERS);
        setIsLoading(false);
      }, 1000);
    } catch (err) {
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
      console.error('API 호출 오류:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (address) {
      fetchTransportCenters();
    }
  }, [address]);

  const handleFilter = (service: string) => {
    setSelectedService(service);
    if (service === '전체') {
      setCenters(DUMMY_CENTERS);
    } else {
      const filtered = DUMMY_CENTERS.filter(center => 
        center.services.includes(service)
      );
      setCenters(filtered);
    }
  };

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleMap = (address: string) => {
    window.open(`https://map.kakao.com/link/search/${address}`, '_blank');
  };

  return (
    <div className="min-h-screen w-full bg-[#FFF4BB] flex justify-center">
      <div className="w-96 relative">
        {/* Header */}
        <div className="absolute left-1/2 top-[65px] -translate-x-1/2 text-center text-neutral-700 text-2xl font-normal font-['Do_Hyeon'] leading-[50px]">
          교통약자 이동 지원
        </div>
        <button 
          onClick={() => router.back()}
          className="absolute left-[24px] top-[63px] text-center text-neutral-700 text-2xl font-normal font-['Inter'] leading-[50px]"
        >
          &lt;
        </button>

        <div className="mt-[130px]">
          {/* Current Location */}
          <div className="mx-6 mb-4 p-4 bg-white rounded-xl shadow-sm">
            {/* 위치 아이콘은 왼쪽에 유지하고 텍스트는 가운데 정렬 */}
            <div className="flex items-start">
              {/* 위치 아이콘 */}
              <div className="mr-4">
                <svg className="w-14 h-14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zM12 11.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#000"/>
                </svg>
              </div>
              
              {/* 텍스트 영역 - 가운데 정렬 */}
              <div className="flex-1 flex flex-col items-center">
                {/* 현재 설정 위치 텍스트를 가운데에 배치 */}
                <div className="text-center ml-[-60px] mb-2 -mt-2 ">
                  <span className="text-sm font-['Do_Hyeon'] text-yellow-400">현재 설정 위치</span>
                </div>
                
                {/* 주소를 가운데 정렬하고 수정 버튼을 오른쪽 끝에 배치 */}
                <div className="flex ml-[-30px] items-center justify-between w-full">
                  <div className="text-base font-['Do_Hyeon'] text-center flex-1">{address || "주소를 설정해주세요"}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Service Filter Buttons */}
          <div className="flex space-x-2 mx-6 mb-4 overflow-x-auto pb-2">
            {(['전체', '휠체어 탑승', '산모 이동', '장애인 이동', '노인 이동', '응급 이동'] as const).map((service) => (
              <button
                key={service}
                onClick={() => handleFilter(service)}
                className={`px-3 py-1 rounded-full font-['Do_Hyeon'] text-xs whitespace-nowrap transition-all ${
                  selectedService === service 
                    ? 'bg-yellow-400 text-white' 
                    : 'bg-white text-gray-500'
                }`}
              >
                {service === '전체' && '🚗 '}
                {service === '휠체어 탑승' && '♿ '}
                {service === '산모 이동' && '🤰 '}
                {service === '장애인 이동' && '👨‍🦼 '}
                {service === '노인 이동' && '👴 '}
                {service === '응급 이동' && '🚑 '}
                {service}
              </button>
            ))}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="mx-6 p-4 bg-red-100 rounded-xl text-red-600 font-['Do_Hyeon'] text-center">
              {error}
            </div>
          )}

          {/* No Results */}
          {!isLoading && !error && centers.length === 0 && (
            <div className="mx-6 p-4 bg-white rounded-xl text-center">
              <p className="text-gray-500 font-['Do_Hyeon']">주변에 이동 지원 센터가 없습니다.</p>
            </div>
          )}

          {/* Transport Centers List */}
          <div className="space-y-4 mx-6 pb-6">
            {centers.map((center) => (
              <div 
                key={center.id}
                className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-['Do_Hyeon']">{center.name}</h3>
                  <span className="text-sm text-green-500 font-['Do_Hyeon']">
                    🚶‍♀️ {center.distance}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 font-['Do_Hyeon'] mb-1">{center.address}</p>
                <p className="text-sm text-gray-500 font-['Do_Hyeon'] mb-2">⏰ {center.operatingHours}</p>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {center.services.map((service, idx) => (
                    <span 
                      key={idx} 
                      className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full text-xs font-['Do_Hyeon']"
                    >
                      {service === '휠체어 탑승' && '♿'}
                      {service === '산모 이동' && '🤰'}
                      {service === '장애인 이동' && '👨‍🦼'}
                      {service === '노인 이동' && '👴'}
                      {service === '응급 이동' && '🚑'}
                      {' '}{service}
                    </span>
                  ))}
                </div>
                
                <div className="flex space-x-2">
                  <button 
                    className="px-3 py-1 bg-pink-100 text-pink-600 rounded-full text-sm font-['Do_Hyeon'] hover:bg-pink-200 transition-colors"
                    onClick={() => handleCall(center.phone)}
                  >
                    전화 📞
                  </button>
                  <button 
                    className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-['Do_Hyeon'] hover:bg-blue-200 transition-colors"
                    onClick={() => handleMap(center.address)}
                  >
                    길찾기 🗺️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 