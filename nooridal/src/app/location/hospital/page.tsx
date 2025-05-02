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

// 카카오맵 타입 정의
declare global {
  interface Window {
    kakao: any;
  }
}

export default function HospitalPage() {
  const router = useRouter();
  const { address, setAddress } = useAddress();
  const [clinics, setClinics] = useState<ObstetricsClinic[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('전체');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showMap, setShowMap] = useState(false);

  // 주소를 동까지만 표시하는 함수
  const getShortAddress = (fullAddress: string) => {
    if (!fullAddress) return '';
    
    // 주소에서 동/읍/면/리 부분을 찾습니다
    const match = fullAddress.match(/([가-힣]+(동|읍|면|리))/);
    if (match) {
      // 동/읍/면/리 부분을 포함한 주소를 반환합니다
      const index = fullAddress.indexOf(match[0]) + match[0].length;
      return fullAddress.substring(0, index);
    }
    
    // 매칭되는 부분이 없으면 원래 주소를 반환합니다
    return fullAddress;
  };

  // 주소 수정 함수
  const handleAddressEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.daum) {
      new window.daum.Postcode({
        oncomplete: function(data: any) {
          // 도로명 주소 대신 지번 주소를 사용합니다
          let fullAddress = data.jibunAddress;
          
          // 지번 주소가 없는 경우 도로명 주소를 사용합니다
          if (!fullAddress) {
            fullAddress = data.address;
          }
          
          let extraAddress = '';

          if (data.addressType === 'R') {
            if (data.bname !== '' && /[동|로|가]$/g.test(data.bname)) {
              extraAddress += data.bname;
            }
            if (data.buildingName !== '') {
              extraAddress += (extraAddress !== '' ? ', ' + data.buildingName : data.buildingName);
            }
            if (extraAddress !== '') {
              fullAddress += ` (${extraAddress})`;
            }
          }

          setAddress(fullAddress);
        }
      }).open();
    }
  };

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

  // 카카오맵 스크립트 로드
  useEffect(() => {
    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=YOUR_KAKAO_MAP_API_KEY&libraries=services`;
    script.async = true;
    script.onload = () => setMapLoaded(true);
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  // 카카오맵 초기화
  useEffect(() => {
    if (mapLoaded && window.kakao && window.kakao.maps && showMap) {
      const container = document.getElementById('map');
      const options = {
        center: new window.kakao.maps.LatLng(37.566826, 126.9786567),
        level: 3
      };
      const map = new window.kakao.maps.Map(container, options);

      // 주소로 좌표 검색
      const geocoder = new window.kakao.maps.services.Geocoder();
      geocoder.addressSearch(address, (result: any, status: any) => {
        if (status === window.kakao.maps.services.Status.OK) {
          const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);
          
          // 마커 생성
          const marker = new window.kakao.maps.Marker({
            map: map,
            position: coords
          });

          // 지도 중심 이동
          map.setCenter(coords);
        }
      });
    }
  }, [mapLoaded, address, showMap]);

  const hospitalTypes = [
    {
      id: 'obstetrics',
      title: '산부인과',
      icon: '🤰',
      description: '산전검사, 초음파, 분만 등'
    },
    {
      id: 'infertility',
      title: '난임시술',
      icon: '👶',
      description: '인공수정, 시험관아기 등'
    },
    {
      id: 'postpartum',
      title: '산후조리원',
      icon: '🍼',
      description: '산모와 신생아 케어'
    }
  ];

  return (
    <div className="min-h-screen w-full bg-[#FFF4BB] flex justify-center items-center">
      <div className="w-96 h-[900px] relative bg-[#FFF4BB] overflow-hidden">
        {/* 헤더 */}
        <div className="left-[175px] top-[65px] absolute text-center justify-start text-neutral-700 text-2xl font-normal font-['Do_Hyeon'] leading-[50px]">
          병원
        </div>
        <button 
          onClick={() => router.back()}
          className="left-[24px] top-[63px] absolute text-center justify-start text-neutral-700 text-2xl font-normal font-['Inter'] leading-[50px]"
        >
          &lt;
        </button>

        {/* Current Location Section */}
        <div className="w-[360px] h-[100px] left-[12px] top-[130px] absolute bg-white rounded-3xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.30)] shadow-[0px_1px_3px_1px_rgba(0,0,0,0.15)]">
          <div className="flex items-start p-6">
            <div className="mr-4">
              <svg className="w-14 h-14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zM12 11.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#000"/>
              </svg>
            </div>
            
            <div className="flex-1 flex flex-col items-center">
              <div className="text-center ml-[-60px] mb-2 -mt-2">
                <span className="text-sm font-['Do_Hyeon'] text-yellow-400">현재 설정 위치</span>
              </div>
              
              <div className="flex ml-[-30px] items-center justify-between w-full">
                <div className="text-xl font-['Do_Hyeon'] text-center flex-1">
                  {getShortAddress(address)}
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

        {/* 병원 유형 선택 */}
        <div className="absolute left-[12px] top-[230px] w-[360px] space-y-4">
          {hospitalTypes.map((type) => (
            <div key={type.id}>
              {type.id === 'obstetrics' && (
                <div className="border-t border-dashed border-gray-300 my-6" />
              )}
              <div
                className={`p-6 rounded-3xl shadow-sm cursor-pointer transition-all duration-300 ${
                  selectedType === type.id
                    ? 'bg-red-100 border-2 border-red-200'
                    : 'bg-white hover:bg-red-50'
                }`}
                onClick={() => setSelectedType(type.id)}
              >
                <div className="flex items-center">
                  <div className="text-4xl mr-4">{type.icon}</div>
                  <div>
                    <div className="text-xl font-['Do_Hyeon']">{type.title}</div>
                    <div className="text-sm text-gray-500 mt-1 font-['Do_Hyeon']">{type.description}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 선택된 병원 유형에 따른 추가 정보 표시 */}
        {selectedType && !showMap && (
          <>
            {/* 반투명 배경 */}
            <div 
              className="fixed inset-0 bg-black/50 z-10"
              onClick={() => setSelectedType(null)}
            />
            
            {/* 정보 상자 */}
            <div className="absolute left-[12px] top-[200px] w-[360px] p-8 bg-white rounded-3xl shadow-sm z-20">
              <div className="text-center font-['Do_Hyeon'] text-2xl mb-8">
                {hospitalTypes.find(t => t.id === selectedType)?.title} 정보
              </div>
              <div className="space-y-4">
                <div 
                  className="p-4 bg-red-50 rounded-xl cursor-pointer"
                  onClick={() => setShowMap(true)}
                >
                  <div className="font-['Do_Hyeon']">📍 주변 병원 찾기</div>
                  <div className="text-sm text-gray-500 mt-1 font-['Do_Hyeon']">가까운 병원을 찾아보세요</div>
                </div>
                <div className="p-4 bg-red-50 rounded-xl">
                  <div className="font-['Do_Hyeon']">📱 예약하기</div>
                  <div className="text-sm text-gray-500 mt-1 font-['Do_Hyeon']">온라인으로 예약하세요</div>
                </div>
                <div className="p-4 bg-red-50 rounded-xl">
                  <div className="font-['Do_Hyeon']">💬 상담하기</div>
                  <div className="text-sm text-gray-500 mt-1 font-['Do_Hyeon']">전문의와 상담하세요</div>
                </div>
              </div>
              
              {/* 닫기 버튼 */}
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => setSelectedType(null)}
                  className="px-6 py-2 bg-red-200 text-gray-900 rounded-full font-['Do_Hyeon'] hover:bg-red-300 transition-colors"
                >
                  닫기
                </button>
              </div>
            </div>
          </>
        )}

        {/* 카카오맵 표시 */}
        {showMap && (
          <>
            {/* 반투명 배경 */}
            <div 
              className="fixed inset-0 bg-black/50 z-10"
              onClick={() => setShowMap(false)}
            />
            
            {/* 지도 컨테이너 */}
            <div className="absolute left-[12px] top-[200px] w-[360px] h-[500px] bg-white rounded-3xl shadow-sm z-20 p-4">
              <div className="flex justify-between items-center mb-4">
                <div className="text-xl font-['Do_Hyeon']">
                  주변 병원 지도
                </div>
                <button
                  onClick={() => setShowMap(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div id="map" className="w-full h-[400px] rounded-xl overflow-hidden">
                {!mapLoaded && (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-400"></div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}