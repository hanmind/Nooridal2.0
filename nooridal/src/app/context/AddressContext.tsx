"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface AddressContextType {
  address: string;
  setAddress: (address: string) => void;
  isLoaded: boolean;
}

const AddressContext = createContext<AddressContextType | undefined>(undefined);

export function AddressProvider({ children }: { children: ReactNode }) {
  const [address, setAddressState] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    // 초기 로드 시 localStorage에서 저장된 주소를 가져옵니다
    const savedAddress = localStorage.getItem('userAddress');
    if (savedAddress) {
      setAddressState(savedAddress);
    } else {
      // 저장된 주소가 없는 경우 기본값 설정
      setAddressState('서울 강남구 논현동');
    }
    // 로딩 완료 표시
    setIsLoaded(true);
  }, []);

  const setAddress = (newAddress: string) => {
    setAddressState(newAddress);
    // 주소가 변경될 때마다 localStorage에 저장합니다
    localStorage.setItem('userAddress', newAddress);
  };

  return (
    <AddressContext.Provider value={{ address, setAddress, isLoaded }}>
      {children}
    </AddressContext.Provider>
  );
}

export function useAddress() {
  const context = useContext(AddressContext);
  if (context === undefined) {
    throw new Error('useAddress must be used within an AddressProvider');
  }
  return context;
} 