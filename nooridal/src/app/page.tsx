"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";

export default function Home() {
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const handleMapSquareClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error fetching location:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };

  return (
    <div className="min-h-screen w-full bg-white flex flex-col items-center justify-center">
      <main className="w-full max-w-md h-screen relative bg-white overflow-hidden mx-auto">
        {/* 배경 이미지 */}
        <div
          className="relative w-full h-full"
          onClick={handleMapSquareClick}
          style={{ cursor: "pointer" }}
        >
          <Image
            src="/images/logo/Group 226.png"
            alt="누리달 배경"
            fill
            priority
            className="object-cover"
          />
          {currentLocation ? (
            <div className="absolute inset-0 flex flex-col justify-center items-center"></div>
          ) : (
            <div className="absolute inset-0 flex flex-col justify-center items-center"></div>
          )}
        </div>

        {/* 시작하기 버튼 */}
        <Link
          href="/login"
          className="absolute left-1/2 transform -translate-x-1/2 top-[446px] w-20 h-20 bg-[#FFE999] rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
        >
          <span className="text-black text-sm font-['Do_Hyeon'] tracking-wide">
            시작하기
          </span>
        </Link>
      </main>
    </div>
  );
}
