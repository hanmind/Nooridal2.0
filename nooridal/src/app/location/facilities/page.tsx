"use client";

import { useRouter } from "next/navigation";
import { useAddress } from "@/app/context/AddressContext";
import { useState, useEffect } from "react";

interface Locker {
  id: string;
  name: string;
  distance: string;
  address: string;
  available: number;
  total: number;
  type: '일반' | '냉장' | '대형';
  price: string;
}

const DUMMY_LOCKERS: Locker[] = [
  {
    id: '1',
    name: '해피 보관함',
    distance: '0.3km',
    address: '서울시 강남구 역삼동 123-45',
    available: 5,
    total: 10,
    type: '일반',
    price: '시간당 1,000원'
  },
  {
    id: '2',
    name: '맘스터치 보관함',
    distance: '0.5km',
    address: '서울시 강남구 역삼동 234-56',
    available: 2,
    total: 8,
    type: '냉장',
    price: '시간당 2,000원'
  },
  {
    id: '3',
    name: '24시 보관함',
    distance: '0.8km',
    address: '서울시 강남구 역삼동 345-67',
    available: 3,
    total: 12,
    type: '대형',
    price: '시간당 1,500원'
  }
];

export default function FacilitiesPage() {
  const router = useRouter();
  const { address } = useAddress();
  const [lockers, setLockers] = useState<Locker[]>(DUMMY_LOCKERS);
  const [selectedType, setSelectedType] = useState<'전체' | '일반' | '냉장' | '대형'>('전체');

  const handleFilter = (type: '전체' | '일반' | '냉장' | '대형') => {
    setSelectedType(type);
    if (type === '전체') {
      setLockers(DUMMY_LOCKERS);
    } else {
      const filtered = DUMMY_LOCKERS.filter(locker => locker.type === type);
      setLockers(filtered);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#FFF4BB] flex justify-center">
      <div className="w-96 relative">
        {/* Header */}
        <div className="absolute left-1/2 top-[65px] -translate-x-1/2 text-center text-neutral-700 text-2xl font-normal font-['Do_Hyeon'] leading-[50px]">
          물품 보관함
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
            <div className="flex items-start">
              <div className="mr-4">
                <svg className="w-14 h-14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zM12 11.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#000"/>
                </svg>
              </div>
              
              <div className="flex-1 flex flex-col items-center">
                <div className="text-center ml-[-60px] mb-2 -mt-2 ">
                  <span className="text-sm font-['Do_Hyeon'] text-yellow-400">현재 설정 위치</span>
                </div>
                
                <div className="flex ml-[-30px] items-center justify-between w-full">
                  <div className="text-base font-['Do_Hyeon'] text-center flex-1">{address || "주소를 설정해주세요"}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex space-x-2 mx-6 mb-4 overflow-x-auto pb-2">
            {(['전체', '일반', '냉장', '대형'] as const).map((type) => (
              <button
                key={type}
                onClick={() => handleFilter(type)}
                className={`px-4 py-2 rounded-full font-['Do_Hyeon'] text-sm whitespace-nowrap transition-all ${
                  selectedType === type 
                    ? 'bg-yellow-400 text-white' 
                    : 'bg-white text-gray-500'
                }`}
              >
                {type === '전체' && '🔍 '}
                {type === '일반' && '📦 '}
                {type === '냉장' && '❄️ '}
                {type === '대형' && '🗄️ '}
                {type}
              </button>
            ))}
          </div>

          {/* Lockers List */}
          <div className="space-y-4 mx-6">
            {lockers.map((locker) => (
              <div key={locker.id} className="bg-white p-4 rounded-xl shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-['Do_Hyeon']">{locker.name}</h3>
                    <p className="text-sm text-gray-500 font-['Do_Hyeon']">{locker.address}</p>
                  </div>
                  <span className="text-2xl">{
                    locker.type === '일반' ? '📦' :
                    locker.type === '냉장' ? '❄️' :
                    locker.type === '대형' ? '🗄️' : '📦'
                  }</span>
                </div>
                <div className="flex items-center space-x-4 text-sm font-['Do_Hyeon']">
                  <span className="text-green-500">
                    {locker.available} / {locker.total} 칸 이용 가능
                  </span>
                  <span className="text-gray-500">{locker.price}원/일</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 