'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface ProfileContextType {
  profileImage: string | null;
  setProfileImage: (image: string | null) => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    // 저장된 프로필 이미지 불러오기
    const savedProfileImage = localStorage.getItem('profileImage');
    if (savedProfileImage) {
      setProfileImage(savedProfileImage);
    }
  }, []);

  const handleSetProfileImage = (image: string | null) => {
    setProfileImage(image);
    if (image) {
      localStorage.setItem('profileImage', image);
    } else {
      localStorage.removeItem('profileImage');
    }
  };

  return (
    <ProfileContext.Provider value={{ profileImage, setProfileImage: handleSetProfileImage }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
} 