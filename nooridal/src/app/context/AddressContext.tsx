"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface AddressContextType {
  address: string; // Profile address
  setAddress: (address: string) => void;
  searchAddress: string; // Address to be used for searching
  setSearchAddress: (address: string) => void;
  isLoaded: boolean;
}

const AddressContext = createContext<AddressContextType | undefined>(undefined);

export function AddressProvider({ children }: { children: ReactNode }) {
  const [address, setAddressState] = useState<string>(''); // Profile address
  const [searchAddress, setSearchAddressState] = useState<string>(''); // Active search address
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    const savedAddress = localStorage.getItem('userAddress');
    const savedSearchAddress = localStorage.getItem('searchAddress');

    let initialProfileAddress = '서울 강남구 논현동'; // Default profile address
    if (savedAddress) {
      initialProfileAddress = savedAddress;
    }
    setAddressState(initialProfileAddress);

    if (savedSearchAddress) {
      setSearchAddressState(savedSearchAddress);
    } else {
      setSearchAddressState(initialProfileAddress); // Default searchAddress to profile address
    }
    setIsLoaded(true);
  }, []);

  const setAddress = (newAddress: string) => {
    setAddressState(newAddress);
    localStorage.setItem('userAddress', newAddress);
    // If profile address changes, also update search address if it was same as old profile address
    // or if search address hasn't been set differently by GPS yet.
    // For simplicity now, let's consider if we should always update searchAddress here
    // or only if it hasn't been "detached" by a GPS set.
    // Current decision: when profile address changes, if searchAddress was reflecting the *old* profile address,
    // update it to the new one. Or, if this is the first load, align them.
    // Simplest: if user updates profile, the search address should probably realign too.
    setSearchAddressState(newAddress); // Update search address when profile address changes
    localStorage.setItem('searchAddress', newAddress);
  };

  const setSearchAddress = (newSearchAddress: string) => {
    setSearchAddressState(newSearchAddress);
    localStorage.setItem('searchAddress', newSearchAddress);
  };

  return (
    <AddressContext.Provider value={{ address, setAddress, searchAddress, setSearchAddress, isLoaded }}>
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