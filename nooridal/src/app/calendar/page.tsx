"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import Calendar from './Calendar';
import TabBar from '../components/TabBar';

export default function CalendarPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('calendar');

  useEffect(() => {
    setActiveTab('calendar');
  }, []);

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'chat') {
      window.location.href = '/chat';
    } else if (tab === 'calendar') {
      window.location.href = '/calendar';
    } else if (tab === 'location') {
      window.location.href = '/location';
    } else if (tab === 'mypage') {
      window.location.href = '/mypage';
    }
  };

  return (
    <main className="min-h-screen w-full bg-[#FFF4BB] flex justify-center items-center">
      <Calendar />
      {/* TabBar Component */}
      <TabBar activeTab={activeTab} tabs={['chat', 'calendar', 'location', 'mypage']} onTabClick={handleTabClick} />
    </main>
  );
} 