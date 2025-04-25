"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface AddressContextType {
  address: string;
  setAddress: (address: string) => void;
}

const AddressContext = createContext<AddressContextType | undefined>(undefined);

export function AddressProvider({ children }: { children: ReactNode }) {
  const [address, setAddressState] = useState<string>('경기도 땡땡시 땡땡동');

  useEffect(() => {
    // 초기 로드 시 localStorage에서 저장된 주소를 가져옵니다
    const savedAddress = localStorage.getItem('userAddress');
    if (savedAddress) {
      setAddressState(savedAddress);
    }
  }, []);

  const setAddress = (newAddress: string) => {
    setAddressState(newAddress);
    // 주소가 변경될 때마다 localStorage에 저장합니다
    localStorage.setItem('userAddress', newAddress);
  };

  return (
    <AddressContext.Provider value={{ address, setAddress }}>
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