"use client";

import { useRouter } from "next/navigation";
import { useAddress } from "@/app/context/AddressContext";
import { useState, useEffect } from "react";

interface ObstetricsClinic {
  id: string;
  name: string;
  distance: string;
  address: string;
  phone: string;
  operatingHours: string;
  specialties: string[];
  rating: number;
  reviewCount: number;
}

// 더미 데이터
const DUMMY_CLINICS: ObstetricsClinic[] = [
  {
    id: '1',
    name: '행복한 산부인과',
    distance: '0.3km',
    address: '서울시 강남구 역삼동 123-45',
    phone: '02-123-4567',
    operatingHours: '평일 09:00-18:00, 토요일 09:00-13:00',
    specialties: ['산전검사', '초음파', '산모교육', '분만'],
    rating: 4.8,
    reviewCount: 128
  },
  {
    id: '2',
    name: '맘스터치 산부인과',
    distance: '0.7km',
    address: '서울시 강남구 역삼동 234-56',
    phone: '02-234-5678',
    operatingHours: '평일 08:00-20:00, 토요일 09:00-17:00',
    specialties: ['산전검사', '초음파', '산모교육', '분만', '불임치료'],
    rating: 4.6,
    reviewCount: 95
  },
  {
    id: '3',
    name: '24시 응급 산부인과',
    distance: '1.2km',
    address: '서울시 강남구 역삼동 345-67',
    phone: '02-345-6789',
    operatingHours: '24시간',
    specialties: ['산전검사', '초음파', '응급분만', '산후관리'],
    rating: 4.5,
    reviewCount: 76
  },
  {
    id: '4',
    name: '미소 산부인과',
    distance: '1.5km',
    address: '서울시 강남구 역삼동 456-78',
    phone: '02-456-7890',
    operatingHours: '평일 09:00-18:00, 토요일 09:00-13:00',
    specialties: ['산전검사', '초음파', '산모교육', '분만', '산후관리', '여성건강검진'],
    rating: 4.9,
    reviewCount: 210
  }
];

export default function ObstetricsPage() {
  const router = useRouter();
  const { address } = useAddress();
  const [clinics, setClinics] = useState<ObstetricsClinic[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('전체');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 더미 데이터를 사용하는 함수
  const fetchObstetricsClinics = async () => {
    if (!address) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // API 호출 대신 더미 데이터 사용
      // 실제 API 연동 시 아래 주석을 해제하고 사용
      /*
      const apiKey = '3RMiKFjgxis3f86Xb5o3Ah30iv/dXmAni0V7kQUTbIke9XiTZXgyNGjcySlNyuMIRKtMSSgCH7IgbFWdqGEpQQ==';
      const response = await fetch(`https://apis.data.go.kr/B551982/obstetrics?serviceKey=${encodeURIComponent(apiKey)}&address=${encodeURIComponent(address)}&type=json`, {
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
      const formattedClinics: ObstetricsClinic[] = data.response.body.items.item.map((item: any) => ({
        id: item.id || String(Math.random()),
        name: item.name || '이름 없음',
        distance: item.distance ? `${item.distance}m` : '거리 정보 없음',
        address: item.address || '주소 정보 없음',
        phone: item.phone || '전화번호 정보 없음',
        operatingHours: item.operatingHours || '운영시간 정보 없음',
        specialties: item.specialties ? item.specialties.split(',') : [],
        rating: item.rating || 0,
        reviewCount: item.reviewCount || 0
      }));
      
      setClinics(formattedClinics);
      */
      
      // 더미 데이터 사용
      setTimeout(() => {
        setClinics(DUMMY_CLINICS);
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
      fetchObstetricsClinics();
    }
  }, [address]);

  const handleFilter = (specialty: string) => {
    setSelectedSpecialty(specialty);
    if (specialty === '전체') {
      setClinics(DUMMY_CLINICS);
    } else {
      const filtered = DUMMY_CLINICS.filter(clinic => 
        clinic.specialties.includes(specialty)
      );
      setClinics(filtered);
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
          산부인과
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

          {/* Specialty Filter Buttons */}
          <div className="flex space-x-2 mx-6 mb-4 overflow-x-auto pb-2">
            {(['전체', '산전검사', '초음파', '산모교육', '분만', '불임치료', '산후관리', '여성건강검진'] as const).map((specialty) => (
              <button
                key={specialty}
                onClick={() => handleFilter(specialty)}
                className={`px-3 py-1 rounded-full font-['Do_Hyeon'] text-xs whitespace-nowrap transition-all ${
                  selectedSpecialty === specialty 
                    ? 'bg-yellow-400 text-white' 
                    : 'bg-white text-gray-500'
                }`}
              >
                {specialty === '전체' && '🏥 '}
                {specialty === '산전검사' && '🔍 '}
                {specialty === '초음파' && '🔊 '}
                {specialty === '산모교육' && '📚 '}
                {specialty === '분만' && '👶 '}
                {specialty === '불임치료' && '💑 '}
                {specialty === '산후관리' && '👩 '}
                {specialty === '여성건강검진' && '💉 '}
                {specialty}
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
          {!isLoading && !error && clinics.length === 0 && (
            <div className="mx-6 p-4 bg-white rounded-xl text-center">
              <p className="text-gray-500 font-['Do_Hyeon']">주변에 산부인과가 없습니다.</p>
            </div>
          )}

          {/* Obstetrics Clinics List */}
          <div className="space-y-4 mx-6 pb-6">
            {clinics.map((clinic) => (
              <div 
                key={clinic.id}
                className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-['Do_Hyeon']">{clinic.name}</h3>
                  <span className="text-sm text-green-500 font-['Do_Hyeon']">
                    🚶‍♀️ {clinic.distance}
                  </span>
                </div>
                
                <div className="flex items-center mb-2">
                  <div className="flex items-center">
                    <span className="text-yellow-400 mr-1">⭐</span>
                    <span className="text-sm font-['Do_Hyeon']">{clinic.rating}</span>
                  </div>
                  <span className="text-xs text-gray-500 ml-1">({clinic.reviewCount} 리뷰)</span>
                </div>
                
                <p className="text-sm text-gray-600 font-['Do_Hyeon'] mb-1">{clinic.address}</p>
                <p className="text-sm text-gray-500 font-['Do_Hyeon'] mb-2">⏰ {clinic.operatingHours}</p>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {clinic.specialties.map((specialty, idx) => (
                    <span 
                      key={idx} 
                      className="px-2 py-0.5 bg-pink-100 text-pink-600 rounded-full text-xs font-['Do_Hyeon']"
                    >
                      {specialty === '산전검사' && '🔍'}
                      {specialty === '초음파' && '🔊'}
                      {specialty === '산모교육' && '📚'}
                      {specialty === '분만' && '👶'}
                      {specialty === '불임치료' && '💑'}
                      {specialty === '산후관리' && '👩'}
                      {specialty === '여성건강검진' && '💉'}
                      {' '}{specialty}
                    </span>
                  ))}
                </div>
                
                <div className="flex space-x-2">
                  <button 
                    className="px-3 py-1 bg-pink-100 text-pink-600 rounded-full text-sm font-['Do_Hyeon'] hover:bg-pink-200 transition-colors"
                    onClick={() => handleCall(clinic.phone)}
                  >
                    전화 📞
                  </button>
                  <button 
                    className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-['Do_Hyeon'] hover:bg-blue-200 transition-colors"
                    onClick={() => handleMap(clinic.address)}
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